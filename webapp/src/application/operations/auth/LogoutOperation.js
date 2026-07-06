import { BaseOperation } from '../BaseOperation.js';
import { SessionRepository } from '../../../persistence/repositories/SessionRepository.js';
import { SecurityEventRepository } from '../../../persistence/repositories/SecurityEventRepository.js';
import { AuthenticationError } from '../../errors/index.js';

export class LogoutOperation extends BaseOperation {
  async validate(context) {
    if (!context.sessionId) throw new AuthenticationError('No active session context.');
  }

  async perform(context, input, tx) {
    const { sessionId, userId } = context;
    const { ipAddress } = context.metadata;

    const session = await SessionRepository.findById(sessionId, tx);

    // Idempotency: If already revoked or doesn't exist, just succeed quietly
    if (!session || session.revokedAt) {
      return { success: true }; 
    }

    await SessionRepository.revoke(sessionId, tx);

    await SecurityEventRepository.logEvent({
      userId,
      eventType: 'SESSION_REVOKED',
      severity: 'LOW',
      ipAddress,
      details: { sessionId, type: 'manual_logout' }
    }, tx);

    return { success: true };
  }

  createEvents() { return []; }
}