import { withApiHandler } from '../../../../infrastructure/context/withApiHandler.js';
import { db } from '../../../../db/index.js';
import { otps } from '../../../../db/schema/identity.js';
import { UserRepository } from '../../../../persistence/repositories/UserRepository.js';
import { eq, and, gt, isNull } from 'drizzle-orm';
import crypto from 'crypto';
import { hashPassword } from '../../../../infrastructure/auth/crypto.js';

function hashOtp(otp) {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

export const POST = withApiHandler(async (req) => {
  const { email, otp, newPassword } = await req.json();

  if (!email || !otp || !newPassword) {
    throw new Error('Email, OTP, and new password are required.');
  }

  if (newPassword.length < 8) {
    throw new Error('Password must be at least 8 characters long.');
  }

  // Verify the OTP
  const hashedOtp = hashOtp(otp);
  
  const [validOtp] = await db.select().from(otps)
    .where(and(
      eq(otps.mobile, email),
      eq(otps.purpose, 'PASSWORD_RESET'),
      eq(otps.otpHash, hashedOtp),
      gt(otps.expiresAt, new Date()),
      isNull(otps.verifiedAt)
    ))
    .limit(1);

  if (!validOtp) {
    throw new Error('Invalid or expired reset code.');
  }

  // Get user
  const user = await UserRepository.findByEmail(email);
  if (!user) {
     throw new Error('Invalid or expired reset code.'); // Using generic message
  }

  // Hash new password and update
  const newHash = await hashPassword(newPassword);
  
  // Make atomic
  await db.transaction(async (tx) => {
    // 1. Mark OTP as verified
    await tx.update(otps)
      .set({ verifiedAt: new Date() })
      .where(eq(otps.id, validOtp.id));
      
    // 2. Update user's password
    await UserRepository.updatePassword(user.id, newHash, tx);
  });

  return Response.json({ message: 'Password has been reset successfully.' });
});
