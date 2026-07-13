import nodemailer from 'nodemailer';

/**
 * EmailNotificationService
 * 
 * Sends transactional emails via Nodemailer.
 * Requires: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM_EMAIL in .env.local
 * 
 * Gracefully skips sending if SMTP credentials are missing (dev mode — logs to terminal instead).
 */
export class EmailNotificationService {
  static getTransporter() {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
      return null;
    }
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  static async send({ to, subject, html }) {
    const transporter = this.getTransporter();
    const fromEmail = process.env.SMTP_FROM_EMAIL || 'Atlas OS <noreply@atlasops.cloud>';

    if (!transporter) {
      // DEV MODE: when no SMTP is configured, log to terminal so dev can see what would be sent
      console.log(`\n📧 [DEV - Email Not Sent (No SMTP)] To: ${to} | Subject: ${subject}\n`);
      return { skipped: true, reason: 'SMTP not configured' };
    }

    try {
      await transporter.sendMail({
        from: fromEmail,
        to,
        subject,
        html,
      });
      return { success: true };
    } catch (err) {
      // Log but do NOT throw — a failed email should never crash a business transaction
      console.error(`[EmailNotificationService] Nodemailer error:`, err);
      return { success: false, error: err.message };
    }
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
