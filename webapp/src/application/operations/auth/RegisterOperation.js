import { BaseOperation } from '../BaseOperation.js';
import { UserRepository } from '../../../persistence/repositories/UserRepository.js';
import { SecurityEventRepository } from '../../../persistence/repositories/SecurityEventRepository.js';
import { hashPassword } from '../../../infrastructure/auth/crypto.js';
import { ValidationError, ConflictError } from '../../errors/index.js';
import { db } from '../../../db/index.js';
import { otps } from '../../../db/schema/identity.js';
import { eq, and, isNotNull, desc } from 'drizzle-orm';

export class RegisterOperation extends BaseOperation {
  
  async validate(context, input) {
    if (!input.fullName || !input.mobile || !input.password || !input.email) {
      throw new ValidationError('Full name, mobile, email, and password are required.');
    }
    if (input.password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long.');
    }

    // Hard Security Invariant: Block any remote POST request that hasn't successfully passed our OTP gateway!
    const verified = await db.select().from(otps)
      .where(and(
        eq(otps.mobile, input.email),
        isNotNull(otps.verifiedAt)
      ))
      .orderBy(desc(otps.verifiedAt))
      .limit(1);

    if (verified.length === 0) {
      throw new ValidationError('Access Denied: Unverified emails cannot bypass frontend registration checks.');
    }
  }

  async perform(context, input, tx) {
    const { fullName, mobile, email, password } = input;
    const { ipAddress } = context.metadata; 

    // 1. Check for existing user (Domain Invariant)
    const existingUser = await UserRepository.findByMobile(mobile, tx);
    if (existingUser) {
      throw new ConflictError('An account with this mobile number already exists.');
    }

    // 2. Hash Password
    const passwordHash = await hashPassword(password);

    // 3. Create User
    // Extracted status to variable for future onboarding policy injection
    const initialStatus = 'ACTIVE'; 

    const newUser = await UserRepository.create({
      fullName,
      mobile,
      email: email || null,
      passwordHash,
      status: initialStatus,
      lastLoginAt: null 
    }, tx);

    // 4. Audit Log (Success tied to the transaction)
    await SecurityEventRepository.logEvent({
      userId: newUser.id,
      eventType: 'USER_REGISTERED',
      severity: 'LOW',
      ipAddress,
      details: { method: 'standard' }
    }, tx);

    return {
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
      }
    };
  }

  createEvents() {
    return [];
  }
}