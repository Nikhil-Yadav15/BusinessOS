import { NotificationRepository } from '../../../persistence/repositories/NotificationRepository.js';

export class NotificationConsumer {
  getSubscribedEvents() {
    return [
      'sales.invoice.created'
    ];
  }

  async handle(event, tx) {
    if (!event.businessId) return;

    if (event.eventType === 'sales.invoice.created') {
       await this.processInvoiceNotification(event, tx);
    }
  }

  async processInvoiceNotification(event, tx) {
    const { businessId, payload } = event;
    const { invoiceNumber, totalAmount } = payload;

    // In a full production setup, we would dynamically look up the Customer's UUID and phone #.
    // For V1, we log this as a SYSTEM-level event linked to the Business UUID natively.
    await NotificationRepository.create({
      businessId,
      recipientType: 'SYSTEM',
      recipientId: businessId, // Routing to the central system dashboard
      title: 'New Invoice Generated',
      message: `Invoice ${invoiceNumber} was successfully generated for a total of ₹${totalAmount}.`,
      status: 'PENDING'
    }, tx);
  }
}
