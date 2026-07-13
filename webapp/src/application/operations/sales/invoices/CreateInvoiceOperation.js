import { BaseOperation } from '../../BaseOperation.js';
import { InvoiceRepository } from '../../../../persistence/repositories/InvoiceRepository.js';
import { InvoiceItemRepository } from '../../../../persistence/repositories/InvoiceItemRepository.js';
import { DomainEvent } from '../../../../infrastructure/events/DomainEvent.js';
import { notifications } from '../../../../db/schema/notification.js';
import { generateId } from '../../../../infrastructure/id/uuid.js';
import { InvoiceDto } from '../dto/InvoiceDto.js';
import { validateDto } from '../../../common/ValidationUtils.js';

export class CreateInvoiceOperation extends BaseOperation {
  async validate(context, input) {
    this.validatedData = validateDto(InvoiceDto.create, input);
  }

  async perform(context, input, tx) {
    const { businessId, userId } = context;
    if (!businessId || !userId) throw new Error('businessId and userId are required');

    const { items, ...invoiceHeader } = this.validatedData;
    
    // Auto-generate invoice number (Date math simple ID for V1)
    const invoiceNumber = `INV-${Date.now()}${Math.floor(Math.random() * 100)}`;

    // Stringify amounts for numeric Drizzle bounds
    const formattedHeader = {
      ...invoiceHeader,
      invoiceNumber,
      businessId,
      createdBy: userId,
      invoiceDate: new Date(invoiceHeader.invoiceDate),
      subtotal: String(invoiceHeader.subtotal),
      discountAmount: String(invoiceHeader.discountAmount),
      taxAmount: String(invoiceHeader.taxAmount),
      totalAmount: String(invoiceHeader.totalAmount),
      balanceAmount: String(invoiceHeader.totalAmount), // Full balance upfront
      paidAmount: '0.00'
    };

    // 1. Insert Invoice Header
    const invoice = await InvoiceRepository.create(formattedHeader, tx);

    // 2. Insert Invoice Items
    const createdItems = [];
    for (const item of items) {
      const formattedItem = {
        invoiceId: invoice.id,
        productId: item.productId,
        quantity: String(item.quantity),
        unitPrice: String(item.unitPrice),
        discountAmount: String(item.discountAmount),
        taxAmount: String(item.taxAmount),
        lineTotal: String(item.lineTotal)
      };
      const createdItem = await InvoiceItemRepository.create(formattedItem, tx);
      createdItems.push(createdItem);
    }

    // 3. Queue WhatsApp Notification for the Customer
    if (invoice.customerId) {
      await tx.insert(notifications).values({
        id: generateId(),
        businessId,
        recipientType: 'PARTY',
        recipientId: invoice.customerId,
        channel: 'WHATSAPP',
        title: `Invoice ${invoiceNumber}`,
        message: `🧾 *Atlas BusinessOS - New Invoice*\n\nInvoice #${invoiceNumber} has been generated for ₹${parseFloat(formattedHeader.totalAmount).toLocaleString('en-IN')}.\nLog in to view and manage this invoice.`,
        status: 'PENDING'
      });
    }

    return { invoice, items: createdItems };
  }

  createEvents(context, result) {
    return [
      DomainEvent.create('sales.invoice.created', {
        businessId: context.businessId,
        aggregateId: result.invoice.id,
        invoiceNumber: result.invoice.invoiceNumber,
        totalAmount: result.invoice.totalAmount
      }, context)
    ];
  }
}
