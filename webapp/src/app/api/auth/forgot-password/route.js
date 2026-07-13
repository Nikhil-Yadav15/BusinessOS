import { withApiHandler } from '../../../../infrastructure/context/withApiHandler.js';
import { db } from '../../../../db/index.js';
import { otps } from '../../../../db/schema/identity.js';
import { UserRepository } from '../../../../persistence/repositories/UserRepository.js';
import { eq, and, gt, isNull } from 'drizzle-orm';
import { generateId } from '../../../../infrastructure/id/uuid.js';
import crypto from 'crypto';
import { EmailNotificationService } from '../../../../infrastructure/notifications/EmailNotificationService.js';

function generateOtp() {
  return crypto.randomInt(100000, 999999).toString();
}

function hashOtp(otp) {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

export const POST = withApiHandler(async (req) => {
  const { email } = await req.json();

  if (!email || !email.includes('@')) {
    throw new Error('A valid email address is required.');
  }

  // Ensure user exists
  const user = await UserRepository.findByEmail(email);
  if (!user) {
    // For security, don't confirm if the user exists or not but we show success. 
    // However, for user-friendliness, it's typically fine to throw an error, 
    // depending on security context. Returning success indiscriminately prevents enumeration.
    return Response.json({ message: 'If an account with that email exists, a reset code has been sent.' });
  }

  // Rate-limit: Allow max 3 active OTPs per email in 10 minutes
  const recent = await db.select().from(otps).where(and(
    eq(otps.mobile, email), // 'mobile' field is overloaded to mean contact medium
    eq(otps.purpose, 'PASSWORD_RESET'),
    gt(otps.expiresAt, new Date()),
    isNull(otps.verifiedAt)
  ));

  if (recent.length >= 3) {
    throw new Error('Too many requests. Please wait a few minutes.');
  }

  // Generate & hash the OTP
  const plainOtp = generateOtp();
  const hashed = hashOtp(plainOtp);

  await db.insert(otps).values({
    id: generateId(),
    mobile: email, // Reusing mobile field for email per auth spec
    purpose: 'PASSWORD_RESET',
    otpHash: hashed,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
  });

  // Send OTP
  await EmailNotificationService.send({
    to: email,
    subject: `Password Reset Request - Atlas BusinessOS`,
    html: `
      <div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:32px;">
        <h2 style="color:#d97706;margin-bottom:8px;">⚠️ Password Reset Code</h2>
        <p style="color:#475569;font-size:14px;">We received a request to reset the password associated with this email address.</p>
        <p style="color:#475569;font-size:14px;">Your verification code is:</p>
        <div style="background:#fef3c7;border-radius:12px;padding:20px;text-align:center;margin:16px 0;">
          <span style="font-size:32px;font-weight:800;letter-spacing:8px;color:#92400e;">${plainOtp}</span>
        </div>
        <p style="color:#94a3b8;font-size:12px;">This code expires in 10 minutes. If you did not request this change, please ignore this email.</p>
      </div>
    `
  });

  return Response.json({ message: 'If an account with that email exists, a reset code has been sent.' });
});
