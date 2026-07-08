import { NotificationRepository } from '../../../persistence/repositories/NotificationRepository.js';
import { EmailNotificationService } from '../../../infrastructure/notifications/EmailNotificationService.js';
import { WhatsAppNotificationService } from '../../../infrastructure/notifications/WhatsAppNotificationService.js';
import { BusinessMemberRepository } from '../../../persistence/repositories/BusinessMemberRepository.js';

export class NotificationConsumer {
  getSubscribedEvents() {
    return [
      'sales.invoice.created',
      'inventory.low_stock'
    ];
  }

  async handle(event, tx) {
    if (!event.businessId) return;

    if (event.eventType === 'sales.invoice.created') {
       await this.processInvoiceNotification(event, tx);
    } else if (event.eventType === 'inventory.low_stock') {
       await this.processLowStockNotification(event, tx);
    }
  }

  /**
   * Fetch all OWNER-role members for a business so we can notify them.
   * Returns array of { email, mobile } objects.
   */
  async getOwnerContacts(businessId, tx) {
    try {
      // findByBusiness already JOINs user email + mobile — no secondary lookup needed
      const members = await BusinessMemberRepository.findByBusiness(businessId, tx);
      return members.map(m => ({ email: m.email, mobile: m.mobile })).filter(c => c.email || c.mobile);
    } catch {
      return [];
    }
  }

  async processInvoiceNotification(event, tx) {
    const { businessId, payload } = event;
    const { invoiceNumber, totalAmount } = payload;

    // 1. Persist in-app notification row
    await NotificationRepository.create({
      businessId,
      recipientType: 'SYSTEM',
      recipientId: businessId,
      title: 'New Invoice Generated',
      message: `Invoice ${invoiceNumber} was successfully generated for a total of ₹${totalAmount}.`,
      status: 'PENDING'
    }, tx);

    // 2. Email the business owner(s)
    const contacts = await this.getOwnerContacts(businessId, tx);
    for (const contact of contacts) {
      if (contact.email) {
        await EmailNotificationService.send({
          to: contact.email,
          subject: `New Invoice ${invoiceNumber} — Atlas BusinessOS`,
          html: EmailNotificationService.invoiceCreatedHtml({ invoiceNumber, totalAmount })
        });
      }
    }
    // WhatsApp for invoices is optional — skip for now, can be enabled below
    // for (const contact of contacts) {
    //   if (contact.mobile) {
    //     await WhatsAppNotificationService.send({
    //       to: contact.mobile,
    //       body: WhatsAppNotificationService.invoiceCreatedMessage({ invoiceNumber, totalAmount })
    //     });
    //   }
    // }
  }

  async processLowStockNotification(event, tx) {
    const { businessId, payload } = event;
    const { productId, currentQuantity, threshold } = payload;

    // 1. Persist in-app notification row
    await NotificationRepository.create({
      businessId,
      recipientType: 'SYSTEM',
      recipientId: businessId,
      title: '⚠️ Low Stock Alert',
      message: `Warning: A product's stock has dropped to ${currentQuantity} units (Threshold: ${threshold}). Please restock inventory immediately.`,
      status: 'PENDING'
    }, tx);

    // 2. Email + WhatsApp the business owner(s)
    const contacts = await this.getOwnerContacts(businessId, tx);
    for (const contact of contacts) {
      // Email
      if (contact.email) {
        await EmailNotificationService.send({
          to: contact.email,
          subject: `⚠️ Low Stock Alert — Atlas BusinessOS`,
          html: EmailNotificationService.lowStockHtml({ productId, currentQuantity, threshold })
        });
      }

      // WhatsApp (fires when Twilio credentials are configured, silently skips otherwise)
      if (contact.mobile) {
        await WhatsAppNotificationService.send({
          to: contact.mobile,
          body: WhatsAppNotificationService.lowStockMessage({ productId, currentQuantity, threshold })
        });
      }
    }
  }
}
