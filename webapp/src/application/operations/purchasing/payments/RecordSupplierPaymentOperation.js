import { BaseOperation } from '../../BaseOperation.js';
import { SupplierPaymentRepository } from '../../../../persistence/repositories/SupplierPaymentRepository.js';
import { PurchaseRepository } from '../../../../persistence/repositories/PurchaseRepository.js';
import { DomainEvent } from '../../../../infrastructure/events/DomainEvent.js';
import { SupplierPaymentDto } from '../dto/SupplierPaymentDto.js';
import { validateDto } from '../../../common/ValidationUtils.js';

export class RecordSupplierPaymentOperation extends BaseOperation {
  async validate(context, input) {
    this.validatedData = validateDto(SupplierPaymentDto.create, input);
  }

  async perform(context, input, tx) {
    const { businessId, userId } = context;
    const { purchaseId, amount, paymentDate, paymentMethod, referenceNumber, remarks } = this.validatedData;

    // 1. Lock and Verify Purchase exists
    const purchase = await PurchaseRepository.findById(purchaseId, tx);
    if (!purchase || purchase.businessId !== businessId) {
       throw new Error('Purchase not found or access denied');
    }

    // Double precision floats string math
    const numPaid = parseFloat(purchase.paidAmount) + amount;
    const numBalance = parseFloat(purchase.totalAmount) - numPaid;
    
    if (numBalance < -0.01) {
       throw new Error(`Payment of ${amount} exceeds the remaining balance of ${purchase.balanceAmount}`);
    }

    // Determine status
    let status = purchase.status;
    if (numBalance <= 0) {
      status = 'PAID';
    } else {
      status = 'PARTIALLY_PAID';
    }

    // 2. Register Payment
    const payment = await SupplierPaymentRepository.create({
      businessId,
      purchaseId,
      paidBy: userId,
      paymentDate: new Date(paymentDate),
      paymentMethod,
      amount: String(amount),
      referenceNumber,
      remarks
    }, tx);

    // 3. Update Purchase Balances
    const updatedPurchase = await PurchaseRepository.update(purchaseId, {
      paidAmount: String(numPaid.toFixed(2)),
      balanceAmount: String(numBalance.toFixed(2)),
      status
    }, tx);

    return { payment, purchase: updatedPurchase };
  }

  createEvents(context, result) {
    return [
      DomainEvent.create('purchasing.payment.recorded', {
        businessId: context.businessId,
        aggregateId: result.payment.id,
        purchaseId: result.purchase.id,
        amount: result.payment.amount,
        newPurchaseStatus: result.purchase.status
      }, context)
    ];
  }
}
