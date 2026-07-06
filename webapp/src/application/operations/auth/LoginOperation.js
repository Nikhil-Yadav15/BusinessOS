import crypto from 'crypto';
import { BaseOperation } from '../BaseOperation.js';
import { UserRepository } from '../../../persistence/repositories/UserRepository.js';
import { SessionRepository } from '../../../persistence/repositories/SessionRepository.js';
import { SecurityEventRepository } from '../../../persistence/repositories/SecurityEventRepository.js';
import { verifyPassword } from '../../../infrastructure/auth/crypto.js';
import { signAccessToken } from '../../../infrastructure/auth/jwt.js';
import { ValidationError, AuthenticationError, AuthorizationError } from '../../errors/index.js';

export class LoginOperation extends BaseOperation {
  
  async validate(context, input) {
    if (!input.mobile || !input.password) {
      throw new ValidationError('Mobile and password are required.');
    }
  }

  async perform(context, input, tx) {
    const { mobile, password } = input;
    const { ipAddress, userAgent } = context.metadata;

    // Fetch user using the transaction
    const user = await UserRepository.findByMobile(mobile, tx);
    
    if (!user) {
      await this.logFailedAttempt(null, ipAddress, 'User not found');
      throw new AuthenticationError('Invalid credentials');
    }

    // Evaluate Domain Rules (Status Check)
    if (user.status === 'LOCKED') {
      await this.logFailedAttempt(user.id, ipAddress, 'Account is locked');
      throw new AuthorizationError('Account is locked. Please contact support.');
    }
    if (user.status === 'INACTIVE') {
      await this.logFailedAttempt(user.id, ipAddress, 'Account is inactive');
      throw new AuthorizationError('Account is inactive.');
    }

    // Verify Password
    const isValid = await verifyPassword(password, user.passwordHash);
    
    if (!isValid) {
      await this.logFailedAttempt(user.id, ipAddress, 'Invalid password');
      throw new AuthenticationError('Invalid credentials');
    }

    // Create Refresh Token Hash
    const rawRefreshToken = crypto.randomBytes(40).toString('hex');
    const refreshTokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');

    // Update last login timestamp
    await UserRepository.updateLastLogin(user.id, tx);
      
    // Create the session
    const session = await SessionRepository.create({
      userId: user.id,
      refreshTokenHash,
      ipAddress,
      userAgent,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    }, tx);

    // Log successful login inside the transaction
    await SecurityEventRepository.logEvent({
      userId: user.id,
      eventType: 'LOGIN_SUCCESS',
      severity: 'LOW',
      ipAddress,
      details: { sessionId: session.id }
    }, tx);

    // Generate Immutable JWT
    const accessToken = await signAccessToken({
      userId: user.id,
      sessionId: session.id,
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

  /**
   * Logs failures outside the main transaction boundary using the global db connection.
   */
  async logFailedAttempt(userId, ipAddress, reason) {
    await SecurityEventRepository.logEvent({
      userId: userId,
      eventType: 'LOGIN_FAILED',
      severity: 'MEDIUM',
      ipAddress,
      details: { reason }
    }); 
  }

  createEvents() {
    return []; 
  }
}