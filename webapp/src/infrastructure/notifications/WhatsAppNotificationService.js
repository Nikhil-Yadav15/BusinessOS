/**
 * WhatsAppNotificationService
 * 
 * Sends WhatsApp messages via the Twilio API (WhatsApp Business channel).
 * Requires in .env.local:
 *   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxx
 *   TWILIO_AUTH_TOKEN=your_auth_token
 *   TWILIO_FROM_NUMBER=+14155238886   (Twilio WhatsApp sandbox or approved number)
 * 
 * WhatsApp messages must be sent as:
 *   from: "whatsapp:+14155238886"
 *   to:   "whatsapp:+919876543210"
 * 
 * Gracefully skips if credentials are missing (dev mode — logs to terminal).
 */
export class WhatsAppNotificationService {
  static async send({ to, body }) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_FROM_NUMBER;

    // Check for placeholder values as well as missing ones
    const isConfigured = accountSid && 
      authToken && 
      fromNumber &&
      !accountSid.startsWith('AC...') &&
      authToken !== 'YOUR_AUTH_TOKEN' &&
      fromNumber !== '+1234567890';

    if (!isConfigured) {
      console.log(`\n📱 [DEV - WhatsApp Not Sent] To: ${to}\nBody: ${body}\n`);
      return { skipped: true, reason: 'Twilio credentials not configured' };
    }

    // Format numbers for WhatsApp channel
    const whatsappFrom = `whatsapp:${fromNumber}`;
    const whatsappTo = `whatsapp:${to}`;

    // Twilio Messages API uses Basic Auth + form-encoded body
    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    const formData = new URLSearchParams({
      From: whatsappFrom,
      To: whatsappTo,
      Body: body,
    });

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      // Log but do NOT throw — a failed WhatsApp message must not crash a business transaction
      console.error(`[WhatsAppNotificationService] Twilio error:`, errorBody);
      return { success: false, error: errorBody };
    }

    return { success: true };
  }

  // Pre-built message templates (WhatsApp plain text — no HTML)
  static lowStockMessage({ productId, currentQuantity, threshold }) {
    return `⚠️ *Atlas BusinessOS - Low Stock Alert*\n\nA product's stock has dropped below your threshold.\n\n*Product ID:* ${productId}\n*Current Stock:* ${currentQuantity} units\n*Threshold:* ${threshold} units\n\nPlease restock immediately to avoid disruptions.`;
  }

  static invoiceCreatedMessage({ invoiceNumber, totalAmount }) {
    return `🧾 *Atlas BusinessOS - New Invoice*\n\nA new invoice has been generated.\n\n*Invoice #:* ${invoiceNumber}\n*Amount:* ₹${parseFloat(totalAmount).toLocaleString('en-IN')}\n\nLog in to view and manage this invoice.`;
  }
}
