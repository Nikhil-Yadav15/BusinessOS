import { eq } from 'drizzle-orm';
import { users } from '../../db/schema/identity.js';
import { generateId } from '../../infrastructure/id/uuid.js';
import { BaseRepository } from './BaseRepository.js';

export class UserRepository extends BaseRepository {
  static async findByMobile(mobile, tx) {
    const conn = this.getDB(tx);
    const [user] = await conn.select().from(users).where(eq(users.mobile, mobile)).limit(1);
    return user || null;
  }

  static async updateLastLogin(userId, tx) {
    const conn = this.getDB(tx);
    await conn.update(users)
      .set({ lastLoginAt: new Date(), updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  static async create(userData, tx) {
    const conn = this.getDB(tx);
    const [user] = await conn.insert(users).values({
      id: generateId(),
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    
    return user;
  }
  static async findById(id, tx) {
    const conn = this.getDB(tx);
    const [user] = await conn.select().from(users).where(eq(users.id, id)).limit(1);
    return user || null;
  }
  static async findByEmail(email, tx) {
    const conn = this.getDB(tx);
    const [user] = await conn.select().from(users).where(eq(users.email, email)).limit(1);
    return user || null;
  }
}
