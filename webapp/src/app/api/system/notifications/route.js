import { db } from '../../../../db/index.js';
import { invoices } from '../../../../db/schema/sales.js';
import { purchases } from '../../../../db/schema/purchasing.js';
import { products } from '../../../../db/schema/catalog.js';
import { inventory } from '../../../../db/schema/inventory.js';
import { securityEvents } from '../../../../db/schema/audit.js';
import { notifications as outboundAlerts } from '../../../../db/schema/notification.js';
import { eq, and, sql, desc } from 'drizzle-orm';
import { withExecutionContext } from '../../../../infrastructure/context/withExecutionContext.js';
import { withApiHandler } from '../../../../infrastructure/context/withApiHandler.js';

function timeAgo(setDate) { // Native JS replacement for date-fns
  const date = new Date(setDate);
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval >= 1) return Math.floor(interval) + " minutes ago";
  return "Just now";
}

export const GET = withExecutionContext(
  // No strict permission here other than being logged in (since dashboard notifications overlap all modules)
  withApiHandler(async (req, { executionContext }) => {
    
    const notifications = [];

    // 1. Low Stock Alerts
    const lowStock = await db.select({
        id: products.id,
        name: products.name,
        quantity: inventory.quantity,
    })
    .from(inventory)
    .innerJoin(products, eq(inventory.productId, products.id))
    .where(
       and(
         eq(inventory.businessId, executionContext.businessId),
         sql`${inventory.quantity} <= ${products.minimumStock}`,
         sql`${products.minimumStock} > 0` // Only alert if they actually configured a minimum
       )
    )
    .limit(3);

    for (const item of lowStock) {
      notifications.push({
        id: `stock-${item.id}`,
        type: 'ALERT',
        title: 'Low Stock Detected',
        desc: `${item.name} is down to ${Number(item.quantity)} units.`,
        time: 'Just now', 
        read: false
      });
    }

    // 2. Unpaid Udhaar (Invoices with Balance)
    const unpaid = await db.select({
       id: invoices.id,
       num: invoices.invoiceNumber,
       balance: invoices.balanceAmount,
       date: invoices.createdAt
    })
    .from(invoices)
    .where(
       and(
         eq(invoices.businessId, executionContext.businessId),
         sql`${invoices.balanceAmount} > 0`
       )
    )
    .limit(3);

    for (const item of unpaid) {
      notifications.push({
        id: `udhaar-${item.id}`,
        type: 'FINANCE',
        title: 'Pending Udhaar',
        desc: `Invoice #${item.num} has a pending balance of ₹${Number(item.balance)}.`,
        time: timeAgo(item.date),
        read: false
      });
    }

    // 3. Upcoming Bills / Payables (Purchasing)
    const unpaidBills = await db.select({
       id: purchases.id,
       num: purchases.purchaseNumber,
       balance: purchases.balanceAmount,
       date: purchases.purchaseDate
    })
    .from(purchases)
    .where(
       and(
         eq(purchases.businessId, executionContext.businessId),
         sql`${purchases.balanceAmount} > 0`
       )
    )
    .limit(2);

    for (const item of unpaidBills) {
      notifications.push({
        id: `bill-${item.id}`,
        type: 'FINANCE',
        title: 'Supplier Bill Due',
        desc: `Purchase #${item.num} has a pending payable of ₹${Number(item.balance)}.`,
        time: timeAgo(item.date),
        read: false
      });
    }

    // 4. High-Value Client Transactions
    const highValueSales = await db.select({
       id: invoices.id,
       num: invoices.invoiceNumber,
       total: invoices.totalAmount,
       date: invoices.invoiceDate
    })
    .from(invoices)
    .where(
       and(
         eq(invoices.businessId, executionContext.businessId),
         sql`${invoices.totalAmount} >= 50000`
       )
    )
    .orderBy(desc(invoices.invoiceDate))
    .limit(2);

    for (const item of highValueSales) {
      notifications.push({
        id: `high-val-${item.id}`,
        type: 'SYSTEM', // SYSTEM color (indigo) stands out well for this
        title: 'High-Value Sale',
        desc: `Awesome! Invoice #${item.num} generated for ₹${Number(item.total)}.`,
        time: timeAgo(item.date),
        read: false
      });
    }

    // 5. System Events (Audit Log)
    // 4. Failed CRM Outbound Messages (WhatsApp / Email failures)
    const failedMessages = await db.select({
       id: outboundAlerts.id,
       title: outboundAlerts.title,
       date: outboundAlerts.createdAt
    })
    .from(outboundAlerts)
    .where(
       and(
         eq(outboundAlerts.businessId, executionContext.businessId),
         eq(outboundAlerts.status, 'FAILED')
       )
    )
    .orderBy(desc(outboundAlerts.createdAt))
    .limit(2);

    for (const item of failedMessages) {
      notifications.push({
        id: `fail-${item.id}`,
        type: 'ALERT', // Reusing ALERT type so it shows orange warning
        title: 'Message Delivery Failed',
        desc: `Failed to deliver: "${item.title || 'Untitled Notification'}"`,
        time: timeAgo(item.date),
        read: false
      });
    }

    // Sort all combined notifications by newest first
    notifications.sort((a, b) => {
       if (a.time === 'Just now') return -1;
       if (b.time === 'Just now') return 1;
       return 0; // Simple sort since they rely on string distances right now
    });
    
    return Response.json({ success: true, count: notifications.length, data: notifications });
  })
);
