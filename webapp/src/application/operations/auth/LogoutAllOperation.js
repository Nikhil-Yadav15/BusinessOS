import { BaseOperation } from '../BaseOperation.js';
import { SessionRepository } from '../../../persistence/repositories/SessionRepository.js';
import { SecurityEventRepository } from '../../../persistence/repositories/SecurityEventRepository.js';
import { AuthenticationError } from '../../errors/index.js';

export class LogoutAllOperation extends BaseOperation {
  async validate(context) {
    if (!context.userId) throw new AuthenticationError('Unauthenticated.');
  }

  async perform(context, input, tx) {
    const { userId } = context;
    const { ipAddress } = context.metadata;

    await SessionRepository.revokeAllForUser(userId, tx);

    await SecurityEventRepository.logEvent({
      userId,
      eventType: 'ALL_SESSIONS_REVOKED',
      severity: 'MEDIUM',
      ipAddress,
      details: { initiatedBySessionId: context.sessionId }
    }, tx);

    return { success: true };
  }

  createEvents() { return []; }
}