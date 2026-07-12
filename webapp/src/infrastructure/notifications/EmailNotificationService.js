import nodemailer from 'nodemailer';

/**
 * EmailNotificationService
 * 
 * Sends transactional emails via Gmail SMTP or the Resend API.
 * Requires: SMTP_USER / SMTP_PASS or RESEND_API_KEY in .env.local
 * 
 * Gracefully skips sending if no credentials are configured (logs to terminal instead).
 */
export class EmailNotificationService {
  static async send({ to, subject, html }) {
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '465', 10),
          secure: process.env.SMTP_PORT === '465',
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        await transporter.sendMail({
          from: process.env.SMTP_FROM_EMAIL || `"Atlas OS" <${smtpUser}>`,
          to,
          subject,
          html,
        });
        console.log(`📧 Transactional email sent via SMTP to: ${to} | Subject: ${subject}`);
        return { success: true };
      } catch (smtpError) {
        console.error('[EmailNotificationService] SMTP sending error:', smtpError);
        // Fallback to Resend if available
        const apiKey = process.env.RESEND_API_KEY;
        if (apiKey) {
          return this.sendViaResend({ to, subject, html, apiKey });
        }
      }
    } else {
      const apiKey = process.env.RESEND_API_KEY;
      if (apiKey) {
        return this.sendViaResend({ to, subject, html, apiKey });
      }
    }

    // DEV MODE: fallback to terminal logs
    console.log(`\n📧 [DEV - Email Not Sent] To: ${to} | Subject: ${subject}\n`);
    return { skipped: true, reason: 'No email credentials configured' };
  }

  static async sendViaResend({ to, subject, html, apiKey }) {
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Atlas OS <noreply@atlasops.cloud>';
    try {
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
        console.error(`[EmailNotificationService] Resend API error:`, body);
        return { success: false, error: body };
      }

      console.log(`📧 Transactional email sent via Resend to: ${to} | Subject: ${subject}`);
      return { success: true };
    } catch (err) {
      console.error('[EmailNotificationService] Resend network error:', err);
      return { success: false, error: err };
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
