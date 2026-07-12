import { buildAnonymousContext } from '../../../../infrastructure/context/buildContext.js';
import { withApiHandler } from '../../../../infrastructure/context/withApiHandler.js';
import { db } from '../../../../db/index.js';
import { otps } from '../../../../db/schema/identity.js';
import { eq, and, gt, isNull } from 'drizzle-orm';
import { generateId } from '../../../../infrastructure/id/uuid.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

function generateOtp() {
  return crypto.randomInt(100000, 999999).toString();
}

function hashOtp(otp) {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

async function sendViaResend(email, plainOtp, apiKey) {
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Atlas OS <noreply@atlasops.cloud>';
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: fromEmail,
      to: [email],
      subject: `${plainOtp} is your Atlas verification code`,
      html: `
        <div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:32px;">
          <h2 style="color:#2563eb;margin-bottom:8px;">Atlas BusinessOS</h2>
          <p style="color:#475569;font-size:14px;">Your verification code is:</p>
          <div style="background:#f1f5f9;border-radius:12px;padding:20px;text-align:center;margin:16px 0;">
            <span style="font-size:32px;font-weight:800;letter-spacing:8px;color:#1e293b;">${plainOtp}</span>
          </div>
          <p style="color:#94a3b8;font-size:12px;">This code expires in 10 minutes. Do not share it with anyone.</p>
        </div>
      `
    })
  });
  if (!res.ok) {
    throw new Error(`Resend API error status ${res.status}`);
  }
}

export const POST = withApiHandler(async (req) => {
  const { email } = await req.json();

  if (!email || !email.includes('@')) {
    throw new Error('A valid email address is required.');
  }

  // Rate-limit: Allow max 3 active OTPs per email in 10 minutes
  const recent = await db.select().from(otps).where(and(
    eq(otps.mobile, email), // We reuse the 'mobile' column for email since schema supports varchar(15)
    gt(otps.expiresAt, new Date()),
    isNull(otps.verifiedAt)
  ));

  if (recent.length >= 3) {
    throw new Error('Too many OTP requests. Please wait a few minutes.');
  }

  // Generate & hash the OTP
  const plainOtp = generateOtp();
  const hashed = hashOtp(plainOtp);

  await db.insert(otps).values({
    id: generateId(),
    mobile: email,
    purpose: 'MOBILE_VERIFICATION',
    otpHash: hashed,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
  });

  // Try SMTP first, then Resend, then Console
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
        to: email,
        subject: `${plainOtp} is your Atlas verification code`,
        html: `
          <div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:32px;">
            <h2 style="color:#2563eb;margin-bottom:8px;">Atlas BusinessOS</h2>
            <p style="color:#475569;font-size:14px;">Your verification code is:</p>
            <div style="background:#f1f5f9;border-radius:12px;padding:20px;text-align:center;margin:16px 0;">
              <span style="font-size:32px;font-weight:800;letter-spacing:8px;color:#1e293b;">${plainOtp}</span>
            </div>
            <p style="color:#94a3b8;font-size:12px;">This code expires in 10 minutes. Do not share it with anyone.</p>
          </div>
        `
      });
      console.log(`📧 Sent OTP email via SMTP to: ${email}`);
    } catch (smtpError) {
      console.error('SMTP sending error:', smtpError);
      const resendKey = process.env.RESEND_API_KEY;
      if (resendKey) {
        try {
          await sendViaResend(email, plainOtp, resendKey);
          console.log(`📧 Sent OTP email via Resend fallback to: ${email}`);
        } catch (resendError) {
          console.error('Resend fallback error:', resendError);
          console.log(`\n🔑 [DEV - SMTP & Resend Failed] Email OTP for ${email}: ${plainOtp}\n`);
        }
      } else {
        console.log(`\n🔑 [DEV - SMTP Failed] Email OTP for ${email}: ${plainOtp}\n`);
      }
    }
  } else {
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        await sendViaResend(email, plainOtp, resendKey);
        console.log(`📧 Sent OTP email via Resend to: ${email}`);
      } catch (resendError) {
        console.error('Resend error:', resendError);
        console.log(`\n🔑 [DEV - Resend Failed] Email OTP for ${email}: ${plainOtp}\n`);
      }
    } else {
      console.log(`\n🔑 [DEV] Email OTP for ${email}: ${plainOtp}\n`);
    }
  }

  return Response.json({ message: 'Verification code sent to your email.' });
});
