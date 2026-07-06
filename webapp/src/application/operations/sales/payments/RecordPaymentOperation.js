import { BaseOperation } from '../../BaseOperation.js';
import { PaymentRepository } from '../../../../persistence/repositories/PaymentRepository.js';
import { InvoiceRepository } from '../../../../persistence/repositories/InvoiceRepository.js';
import { DomainEvent } from '../../../../infrastructure/events/DomainEvent.js';
import { PaymentDto } from '../dto/PaymentDto.js';
import { validateDto } from '../../../common/ValidationUtils.js';

export class RecordPaymentOperation extends BaseOperation {
  async validate(context, input) {
    this.validatedData = validateDto(PaymentDto.create, input);
  }

  async perform(context, input, tx) {
    const { businessId, userId } = context;
    const { invoiceId, amount, paymentDate, paymentMethod, referenceNumber, remarks } = this.validatedData;

    // 1. Lock and Verify Invoice exists
    const invoice = await InvoiceRepository.findById(invoiceId, tx);
    if (!invoice || invoice.businessId !== businessId) {
       throw new Error('Invoice not found or access denied');
    }

    // Double precision floats string math
    const numPaid = parseFloat(invoice.paidAmount) + amount;
    const numBalance = parseFloat(invoice.totalAmount) - numPaid;
    
    if (numBalance < -0.01) {
       throw new Error(`Payment of ${amount} exceeds the remaining balance of ${invoice.balanceAmount}`);
    }

    // Determine status
    let status = invoice.status; // Probably DRAFT
    if (numBalance <= 0) {
      status = 'PAID';
    } else {
      status = 'PARTIALLY_PAID';
    }

    // 2. Register Payment
    const payment = await PaymentRepository.create({
      businessId,
      invoiceId,
      receivedBy: userId,
      paymentDate: new Date(paymentDate),
      paymentMethod,
      amount: String(amount),
      referenceNumber,
      remarks
    }, tx);

    // 3. Update Invoice Balances
    const updatedInvoice = await InvoiceRepository.update(invoiceId, {
      paidAmount: String(numPaid.toFixed(2)),
      balanceAmount: String(numBalance.toFixed(2)),
      status
    }, tx);

    return { payment, invoice: updatedInvoice };
  }

  createEvents(context, result) {
    return [
      DomainEvent.create('sales.payment.recorded', {
        businessId: context.businessId,
        aggregateId: result.payment.id,
        invoiceId: result.invoice.id,
        amount: result.payment.amount,
        newInvoiceStatus: result.invoice.status
      }, context)
    ];
  }
}
