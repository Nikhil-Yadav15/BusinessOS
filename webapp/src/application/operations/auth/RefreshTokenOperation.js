import crypto from 'crypto';
import { BaseOperation } from '../BaseOperation.js';
import { SessionRepository } from '../../../persistence/repositories/SessionRepository.js';
import { UserRepository } from '../../../persistence/repositories/UserRepository.js';
import { SecurityEventRepository } from '../../../persistence/repositories/SecurityEventRepository.js';
import { signAccessToken } from '../../../infrastructure/auth/jwt.js';
import { AuthenticationError, AuthorizationError } from '../../errors/index.js';

export class RefreshTokenOperation extends BaseOperation {
  
  async validate(context, input) {
    if (!input.refreshToken) throw new AuthenticationError('Refresh token is required.');
  }

  async perform(context, input, tx) {
    const { refreshToken } = input;
    const { ipAddress, userAgent } = context.metadata;

    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    // 1. Find the active session by current hash
    const session = await SessionRepository.findByTokenHash(refreshTokenHash, tx);
    
    // 2. Token Not Found
    if (!session) {
      await this.safeLogSecurityEvent(null, ipAddress, 'REFRESH_FAILED', 'MEDIUM', { reason: 'Token not found' });
      throw new AuthenticationError('Invalid refresh token.');
    }

    // 3. REPLAY DETECTION: Token exists but session is revoked
    if (session.revokedAt) {
      await SessionRepository.revokeAllForUser(session.userId, tx);
      await this.safeLogSecurityEvent(session.userId, ipAddress, 'ACCOUNT_COMPROMISED', 'CRITICAL', { 
        reason: 'Reused revoked refresh token. Potential replay attack. All sessions revoked.',
        compromisedSessionId: session.id
      });
      throw new AuthenticationError('Security violation detected. Please log in again.');
    }

    // 4. Expiration Check
    if (new Date() > new Date(session.expiresAt)) {
      await SessionRepository.revoke(session.id, tx); 
      await this.safeLogSecurityEvent(session.userId, ipAddress, 'REFRESH_FAILED', 'LOW', { reason: 'Token expired' });
      throw new AuthenticationError('Session expired. Please log in again.');
    }

    // 5. Verify User
    const user = await UserRepository.findById(session.userId, tx);
    if (!user) throw new AuthenticationError('User no longer exists.');
    
    if (user.status === 'LOCKED' || user.status === 'INACTIVE') {
      await this.safeLogSecurityEvent(user.id, ipAddress, 'REFRESH_FAILED', 'MEDIUM', { reason: `Account ${user.status}` });
      throw new AuthorizationError(`Account is ${user.status.toLowerCase()}.`);
    }

    // 6. Token Rotation (Update session in place using the explicit method)
    const newRawRefreshToken = crypto.randomBytes(40).toString('hex');
    const newRefreshTokenHash = crypto.createHash('sha256').update(newRawRefreshToken).digest('hex');

    await SessionRepository.rotateRefreshToken(
      session.id, 
      newRefreshTokenHash, 
      ipAddress, 
      userAgent, 
      tx
    );

    await this.safeLogSecurityEvent(user.id, ipAddress, 'TOKEN_REFRESHED', 'LOW', { sessionId: session.id }, tx);

    // 7. Generate new JWT
    const accessToken = await signAccessToken({
      userId: user.id,
      sessionId: session.id,
    }, '24h');

    return {
      accessToken,
      refreshToken: newRawRefreshToken
    };
  }

  async safeLogSecurityEvent(userId, ipAddress, eventType, severity, details, tx = null) {
    try {
      await SecurityEventRepository.logEvent({ userId, eventType, severity, ipAddress, details }, tx);
    } catch (error) {
      console.error('[Audit Logging Failed]', error.message);
    }
  }

  createEvents() { return []; }
}