import crypto from 'crypto';
import { UserRepository } from '../../../persistence/repositories/UserRepository.js';
import { SessionRepository } from '../../../persistence/repositories/SessionRepository.js';
import { SecurityEventRepository } from '../../../persistence/repositories/SecurityEventRepository.js';
import { verifyPassword } from '../../../infrastructure/auth/crypto.js';
import { signAccessToken } from '../../../infrastructure/auth/jwt.js';
import { UnitOfWork } from '../../../infrastructure/db/UnitOfWork.js';
import { ExecutionContext } from '../../../infrastructure/context/ExecutionContext.js';

export class LoginOperation {
  static async execute({ mobile, password, ipAddress, userAgent, deviceIdentifier }) {
    // 1. Fetch user (Outside transaction to fail fast if user doesn't exist)
    const user = await UserRepository.findByMobile(mobile);
    
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // 2. Evaluate Domain Rules (Status Check)
    if (user.status === 'LOCKED') {
      throw new Error('Account is locked. Please contact support.');
    }
    if (user.status === 'INACTIVE') {
      throw new Error('Account is inactive.');
    }

    // 3. Verify Password
    const isValid = await verifyPassword(password, user.passwordHash);
    
    if (!isValid) {
      // Flaw 6 Fixed: Log the security event on failure
      await SecurityEventRepository.logEvent({
        userId: user.id,
        eventType: 'LOGIN_FAILED',
        severity: 'MEDIUM',
        ipAddress,
        details: { reason: 'Invalid password' }
      });
      throw new Error('Invalid credentials');
    }

    // 4. Create Refresh Token Hash (Flaw 8 validated)
    const rawRefreshToken = crypto.randomBytes(40).toString('hex');
    const refreshTokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');

    const context = new ExecutionContext({
      userId: user.id,
      sessionId: null,
      businessId: null,
      memberId: null,
    });

    // 5. Flaw 4 Fixed: Execute inside a single Transaction (Unit of Work)
    const session = await UnitOfWork.execute(context, async (tx) => {
      // Update last login
      await UserRepository.updateLastLogin(user.id, tx);
      
      // Create session
      const newSession = await SessionRepository.create({
        userId: user.id,
        refreshTokenHash,
        ipAddress,
        userAgent,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        lastActivityAt: new Date(),
        // Note: Flaw 7 (Device Management) would link the deviceId here 
        // after resolving it via a DeviceRepository.upsert() call.
      }, tx);

      // Log successful login
      await SecurityEventRepository.logEvent({
        userId: user.id,
        eventType: 'LOGIN_SUCCESS',
        severity: 'LOW',
        ipAddress,
        details: { sessionId: newSession.id }
      }, tx);

      return newSession;
    });

    // 6. Generate Immutable JWT (Tenant-agnostic)
    const accessToken = await signAccessToken({
      user_id: user.id,
      session_id: session.id,
    }, '24h');

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      user: {
        id: user.id,
        fullName: user.fullName,
      }
    };
  }
}
