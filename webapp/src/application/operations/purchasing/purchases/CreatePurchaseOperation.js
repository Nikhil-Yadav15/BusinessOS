import { BaseOperation } from '../../BaseOperation.js';
import { PurchaseRepository } from '../../../../persistence/repositories/PurchaseRepository.js';
import { PurchaseItemRepository } from '../../../../persistence/repositories/PurchaseItemRepository.js';
import { DomainEvent } from '../../../../infrastructure/events/DomainEvent.js';
import { PurchaseDto } from '../dto/PurchaseDto.js';
import { validateDto } from '../../../common/ValidationUtils.js';

export class CreatePurchaseOperation extends BaseOperation {
  async validate(context, input) {
    this.validatedData = validateDto(PurchaseDto.create, input);
  }

  async perform(context, input, tx) {
    const { businessId, userId } = context;
    if (!businessId || !userId) throw new Error('businessId and userId are required');

    const { items, ...purchaseHeader } = this.validatedData;
    
    // Auto-generate purchase number (Date math simple ID for V1)
    const purchaseNumber = `PO-${Date.now()}${Math.floor(Math.random() * 100)}`;

    // Stringify amounts for numeric Drizzle bounds
    const formattedHeader = {
      ...purchaseHeader,
      purchaseNumber,
      businessId,
      createdBy: userId,
      purchaseDate: new Date(purchaseHeader.purchaseDate),
      subtotal: String(purchaseHeader.subtotal),
      discountAmount: String(purchaseHeader.discountAmount),
      taxAmount: String(purchaseHeader.taxAmount),
      totalAmount: String(purchaseHeader.totalAmount),
      balanceAmount: String(purchaseHeader.totalAmount), // Full balance upfront
      paidAmount: '0.00'
    };

    // 1. Insert Purchase Header
    const purchase = await PurchaseRepository.create(formattedHeader, tx);

    // 2. Insert Purchase Items
    const createdItems = [];
    for (const item of items) {
      const formattedItem = {
        purchaseId: purchase.id,
        productId: item.productId,
        quantity: String(item.quantity),
        unitCost: String(item.unitCost), // unitCost matches the schema column name instead of unitPrice
        discountAmount: String(item.discountAmount),
        taxAmount: String(item.taxAmount),
        lineTotal: String(item.lineTotal)
      };
      const createdItem = await PurchaseItemRepository.create(formattedItem, tx);
      createdItems.push(createdItem);
    }

    return { purchase, items: createdItems };
  }

  createEvents(context, result) {
    return [
      DomainEvent.create('purchasing.purchase.created', {
        businessId: context.businessId,
        aggregateId: result.purchase.id,
        purchaseNumber: result.purchase.purchaseNumber,
        totalAmount: result.purchase.totalAmount
      }, context)
    ];
  }
}
