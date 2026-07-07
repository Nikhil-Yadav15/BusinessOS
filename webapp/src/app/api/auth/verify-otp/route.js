import { withApiHandler } from '../../../../infrastructure/context/withApiHandler.js';
import { db } from '../../../../db/index.js';
import { otps } from '../../../../db/schema/identity.js';
import { eq, and, gt, isNull } from 'drizzle-orm';
import crypto from 'crypto';

function hashOtp(otp) {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

export const POST = withApiHandler(async (req) => {
  const { email, otp } = await req.json();

  if (!email || !otp) {
    throw new Error('Email and OTP code are required.');
  }

  // Find the most recent unexpired, unverified OTP for this email
  const records = await db.select().from(otps).where(and(
    eq(otps.mobile, email),
    gt(otps.expiresAt, new Date()),
    isNull(otps.verifiedAt)
  ));

  if (records.length === 0) {
    throw new Error('No active verification code found. Please request a new one.');
  }

  // Check against all active OTPs (latest first)
  const hashedInput = hashOtp(otp);
  const matched = records.find(r => r.otpHash === hashedInput);

  if (!matched) {
    // Increment attempts on the most recent OTP
    const latest = records[records.length - 1];
    const newAttempts = (latest.attempts || 0) + 1;
    
    await db.update(otps)
      .set({ attempts: newAttempts })
      .where(eq(otps.id, latest.id));

    if (newAttempts >= 5) {
      throw new Error('Too many incorrect attempts. Please request a new code.');
    }

    throw new Error('Invalid verification code. Please try again.');
  }

  // Mark as verified
  await db.update(otps)
    .set({ verifiedAt: new Date() })
    .where(eq(otps.id, matched.id));

  return Response.json({ verified: true, message: 'Email verified successfully.' });
});
