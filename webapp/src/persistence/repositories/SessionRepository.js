import { eq, and, isNull } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { sessions } from '../../db/schema/identity.js';
import { BaseRepository } from './BaseRepository.js';
import { generateId } from '../../infrastructure/id/uuid.js';

export class SessionRepository extends BaseRepository {
  static async create(sessionData, tx) {
    const conn = this.getDB(tx);
    const [session] = await conn.insert(sessions).values({
      id: generateId(),
      ...sessionData,
      createdAt: new Date(),
    }).returning();
    return session;
  }

  // Finds ANY session by hash (even revoked ones) to enable Replay Detection
  static async findByTokenHash(hash, tx) {
    const conn = this.getDB(tx);
    const [session] = await conn.select().from(sessions)
      .where(eq(sessions.refreshTokenHash, hash))
      .limit(1);
    return session || null;
  }

  static async revoke(sessionId, tx) {
    const conn = this.getDB(tx);
    await conn.update(sessions)
      .set({ revokedAt: new Date() })
      .where(eq(sessions.id, sessionId));
  }

  static async revokeAllForUser(userId, tx) {
    const conn = this.getDB(tx);
    await conn.update(sessions)
      .set({ revokedAt: new Date() })
      .where(and(eq(sessions.userId, userId), isNull(sessions.revokedAt)));
  }

  static async touchActivity(sessionId, ipAddress, userAgent, tx) {
    const conn = this.getDB(tx);
    await conn.update(sessions)
      .set({ lastActivityAt: new Date(), ipAddress, userAgent })
      .where(eq(sessions.id, sessionId));
  }
  static async rotateRefreshToken(sessionId, newHash, ipAddress, userAgent, tx) {
    const conn = this.getDB(tx);
    await conn.update(sessions)
      .set({ 
        refreshTokenHash: newHash, 
        lastActivityAt: new Date(),
        ipAddress,
        userAgent 
      })
      .where(eq(sessions.id, sessionId));
  }
}