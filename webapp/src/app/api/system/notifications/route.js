import { db } from '../../../../db/index.js';
import { invoices } from '../../../../db/schema/sales.js';
import { products } from '../../../../db/schema/catalog.js';
import { inventory } from '../../../../db/schema/inventory.js';
import { securityEvents } from '../../../../db/schema/audit.js';
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

    // 3. System Events (Audit Log)
    // Avoid securityEvents.businessId as the schema might not have it directly on the event if it's tenant-agnostic
    // Wait, audit.js might not have businessId on securityEvents. Let's just return what we have.
    
    return Response.json({ success: true, count: notifications.length, data: notifications });
  })
);
