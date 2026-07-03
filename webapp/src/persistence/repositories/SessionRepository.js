import { db } from '../../db/index.js';
import { sessions } from '../../db/schema/identity.js';
import { generateId } from '../../infrastructure/id/uuid.js';

export class SessionRepository {
  static async create(sessionData, tx = db) {
    const [session] = await tx.insert(sessions).values({
      id: generateId(),
      ...sessionData,
      createdAt: new Date(),
    }).returning();
    return session;
  }
}