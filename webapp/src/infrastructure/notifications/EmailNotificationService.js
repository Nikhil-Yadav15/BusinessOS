/**
 * EmailNotificationService
 * 
 * Sends transactional emails via the Resend API.
 * Requires: RESEND_API_KEY and RESEND_FROM_EMAIL in .env.local
 * 
 * Gracefully skips sending if the API key is missing (dev mode — logs to terminal instead).
 */
export class EmailNotificationService {
  static async send({ to, subject, html }) {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Atlas OS <noreply@atlasops.cloud>';

    if (!apiKey) {
      // DEV MODE: when no Resend key is set, log to terminal so dev can see what would be sent
      console.log(`\n📧 [DEV - Email Not Sent] To: ${to} | Subject: ${subject}\n`);
      return { skipped: true, reason: 'RESEND_API_KEY not configured' };
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: fromEmail, to: [to], subject, html }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      // Log but do NOT throw — a failed email should never crash a business transaction
      console.error(`[EmailNotificationService] Resend API error:`, body);
      return { success: false, error: body };
    }

    return { success: true };
  }

  // Pre-built templates
  static lowStockHtml({ productId, currentQuantity, threshold }) {
    return `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;">
        <h2 style="color:#d97706;margin-bottom:8px;">⚠️ Low Stock Alert</h2>
        <p style="color:#475569;font-size:14px;">One of your products has dropped below the minimum stock threshold.</p>
        <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:12px;padding:20px;margin:16px 0;">
          <p style="margin:0;font-size:13px;color:#92400e;"><strong>Product ID:</strong> ${productId}</p>
          <p style="margin:8px 0 0;font-size:13px;color:#92400e;"><strong>Current Stock:</strong> ${currentQuantity} units</p>
          <p style="margin:8px 0 0;font-size:13px;color:#92400e;"><strong>Threshold:</strong> ${threshold} units</p>
        </div>
        <p style="color:#94a3b8;font-size:12px;margin-top:24px;">Please restock immediately to avoid disruptions. Log in to Atlas BusinessOS to manage your inventory.</p>
      </div>
    `;
  }

  static invoiceCreatedHtml({ invoiceNumber, totalAmount }) {
    return `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;">
        <h2 style="color:#4338ca;margin-bottom:8px;">🧾 New Invoice Generated</h2>
        <p style="color:#475569;font-size:14px;">A new sales invoice has been created in your Atlas BusinessOS account.</p>
        <div style="background:#f1f5f9;border-radius:12px;padding:20px;margin:16px 0;">
          <p style="margin:0;font-size:13px;color:#1e293b;"><strong>Invoice #:</strong> ${invoiceNumber}</p>
          <p style="margin:8px 0 0;font-size:13px;color:#1e293b;"><strong>Total Amount:</strong> ₹${parseFloat(totalAmount).toLocaleString('en-IN')}</p>
        </div>
        <p style="color:#94a3b8;font-size:12px;margin-top:24px;">Log in to Atlas BusinessOS to view and manage this invoice.</p>
      </div>
    `;
  }
}
