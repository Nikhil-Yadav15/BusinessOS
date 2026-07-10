import { withApiHandler } from '../../../../../infrastructure/context/withApiHandler.js';
import { db } from '../../../../../db/index.js';
import { notifications, notificationDeliveries } from '../../../../../db/schema/notification.js';
import { eq, and } from 'drizzle-orm';
import { generateId } from '../../../../../infrastructure/id/uuid.js';
import { WhatsAppNotificationService } from '../../../../../infrastructure/notifications/WhatsAppNotificationService.js';
import { EmailNotificationService } from '../../../../../infrastructure/notifications/EmailNotificationService.js';
import { parties } from '../../../../../db/schema/crm.js';
import { users } from '../../../../../db/schema/identity.js';

export const POST = withApiHandler(async (req) => {
  // This is a background job route. In production, secure this with an internal cron secret or auth token.
  // For demo, we leave it open since it doesn't leak data, it just processes internal queues.

  // 1. Fetch pending notifications
  const pending = await db.select()
    .from(notifications)
    .where(eq(notifications.status, 'PENDING'))
    .limit(10); // Batch size

  if (pending.length === 0) {
    return Response.json({ success: true, processed: 0 });
  }

  let processedCount = 0;

  for (const n of pending) {
    // Determine contact info based on recipient type
    if (n.recipientType !== 'PARTY' && n.recipientType !== 'USER') {
      await db.update(notifications)
        .set({ status: 'FAILED' })
        .where(eq(notifications.id, n.id));
      continue;
    }

    let contactPhone = null;
    let contactEmail = null;

    if (n.recipientType === 'PARTY') {
      const partyRecord = await db.select().from(parties).where(eq(parties.id, n.recipientId)).limit(1);
      if (partyRecord.length > 0) {
        contactPhone = partyRecord[0].phone;
        contactEmail = partyRecord[0].email;
      }
    } else if (n.recipientType === 'USER') {
      const userRecord = await db.select().from(users).where(eq(users.id, n.recipientId)).limit(1);
      if (userRecord.length > 0) {
        contactPhone = userRecord[0].mobile;
        contactEmail = userRecord[0].email || userRecord[0].mobile; // mobile contains email during auth if hybrid
      }
    }

    if (!contactPhone && !contactEmail) {
       await db.update(notifications).set({ status: 'FAILED' }).where(eq(notifications.id, n.id));
       continue;
    }

    let deliveryResult = { success: false, error: 'Misconfigured channel' };

    if (n.channel === 'WHATSAPP') {
       if (!contactPhone) {
         deliveryResult = { success: false, error: 'Recipient has no phone number' };
       } else {
         deliveryResult = await WhatsAppNotificationService.send({ to: contactPhone, body: n.message });
       }
    } else if (n.channel === 'EMAIL') {
       if (!contactEmail) {
         deliveryResult = { success: false, error: 'Recipient has no email' };
       } else {
         deliveryResult = await EmailNotificationService.send({
           to: contactEmail,
           subject: n.title || 'Atlas BusinessOS Update',
           html: n.message
         });
       }
    }

    // 2. Mark notification status
    const finalStatus = deliveryResult.success ? 'SENT' : 'FAILED';
    await db.update(notifications)
      .set({ status: finalStatus })
      .where(eq(notifications.id, n.id));

    // 3. Insert Delivery Log (Audit Trail)
    await db.insert(notificationDeliveries).values({
      id: generateId(),
      notificationId: n.id,
      channel: n.channel,
      status: deliveryResult.success ? 'SUCCESS' : 'FAILED',
      errorMessage: deliveryResult.error ? JSON.stringify(deliveryResult.error) : null
    });

    processedCount++;
  }

  return Response.json({ success: true, processed: processedCount });
});
