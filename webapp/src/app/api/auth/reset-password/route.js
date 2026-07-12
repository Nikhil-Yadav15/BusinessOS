import { withApiHandler } from '../../../../infrastructure/context/withApiHandler.js';
import { db } from '../../../../db/index.js';
import { otps, users } from '../../../../db/schema/identity.js';
import { eq, and, isNotNull, desc } from 'drizzle-orm';
import { hashPassword } from '../../../../infrastructure/auth/crypto.js';
import { SecurityEventRepository } from '../../../../persistence/repositories/SecurityEventRepository.js';

export const POST = withApiHandler(async (req) => {
  const { email, password } = await req.json();

  if (!email || !password) {
    throw new Error('Email and new password are required.');
  }
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long.');
  }

  // Verify that an OTP check succeeded for this email
  const verified = await db.select().from(otps)
    .where(and(
      eq(otps.mobile, email),
      isNotNull(otps.verifiedAt)
    ))
    .orderBy(desc(otps.verifiedAt))
    .limit(1);

  if (verified.length === 0) {
    throw new Error('Access Denied: Unverified email address.');
  }

  // Find the target user
  const matchedUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (matchedUsers.length === 0) {
    throw new Error('No user account found with this email address.');
  }

  const targetUser = matchedUsers[0];

  // Hash new password
  const passwordHash = await hashPassword(password);

  // Update password in db
  await db.update(users)
    .set({ passwordHash })
    .where(eq(users.id, targetUser.id));

  // Log password change event
  await SecurityEventRepository.logEvent({
    userId: targetUser.id,
    eventType: 'PASSWORD_RESET',
    severity: 'MEDIUM',
    ipAddress: req.headers.get('x-forwarded-for') || null,
    details: { method: 'otp' }
  });

  console.log(`🔐 Successfully reset password for user email: ${email}`);

  return Response.json({ success: true, message: 'Password has been updated successfully.' });
});
