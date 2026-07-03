import { db } from '../../db/index.js';
import { securityEvents } from '../../db/schema/audit.js';
import { generateId } from '../../infrastructure/id/uuid.js';

export class SecurityEventRepository {
  static async logEvent({ userId, eventType, severity, ipAddress, details }, tx = db) {
    await tx.insert(securityEvents).values({
      id: generateId(),
      userId: userId || null,
      eventType,
      severity,
      ipAddress,
      details,
      createdAt: new Date(),
    });
  }
}