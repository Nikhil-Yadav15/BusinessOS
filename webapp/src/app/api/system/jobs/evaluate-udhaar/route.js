import { db } from '../../../../../db/index.js';
import { invoices } from '../../../../../db/schema/sales.js';
import { notifications } from '../../../../../db/schema/notification.js';
import { eq, or, and, sql } from 'drizzle-orm';
import { generateId } from '../../../../../infrastructure/id/uuid.js';

export async function GET(req) {
  try {
    // Basic Security Check against a pre-shared secret
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json({ success: false, message: 'Unauthorized cron request' }, { status: 401 });
    }

    // Evaluate Udhaar: final or partial invoices that are unpaid and older than 14 days
    // A more advanced version would use a dedicated dueDate column, but we fallback to 14 days post invoiceDate
    const overdueInvoices = await db.select()
      .from(invoices)
      .where(
        and(
          or(
            eq(invoices.status, 'FINALIZED'),
            eq(invoices.status, 'PARTIALLY_PAID')
          ),
          sql`${invoices.balanceAmount} > 0`,
          sql`${invoices.invoiceDate} < NOW() - INTERVAL '14 days'`
        )
      );

    let createdCount = 0;

    for (const inv of overdueInvoices) {
      if (!inv.customerId) continue;

      // Avoid spamming: Check if an active notification already exists for this invoice within the last 7 days
      const recent = await db.select()
        .from(notifications)
        .where(
          and(
            eq(notifications.businessId, inv.businessId),
            eq(notifications.recipientId, inv.customerId),
            sql`${notifications.message} LIKE '%' || ${inv.invoiceNumber} || '%'`,
            sql`${notifications.createdAt} > NOW() - INTERVAL '7 days'`
          )
        )
        .limit(1);

      if (recent.length > 0) continue;

      const notifyId = generateId();
      await db.insert(notifications).values({
        id: notifyId,
        businessId: inv.businessId,
        recipientType: 'PARTY',
        recipientId: inv.customerId,
        channel: 'WHATSAPP', // Or SMS
        title: 'Overdue Payment Reminder',
        message: `Friendly reminder: Your invoice #${inv.invoiceNumber} has a pending balance of ₹${Number(inv.balanceAmount).toFixed(2)}. Please arrange for payment at your earliest convenience.`,
        status: 'PENDING'
      });
      createdCount++;
    }

    return Response.json({ success: true, evaluated: overdueInvoices.length, alertsCreated: createdCount });
  } catch (err) {
    console.error('Evaluate Udhaar Cron Error:', err);
    return Response.json(
      { success: false, message: 'Internal Server Error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
