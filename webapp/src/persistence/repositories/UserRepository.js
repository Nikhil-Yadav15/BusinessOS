import { eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { users } from '../../db/schema/identity.js';

export class UserRepository {
  static async findByMobile(mobile, tx = db) {
    const [user] = await tx.select().from(users).where(eq(users.mobile, mobile)).limit(1);
    return user || null;
  }

  static async updateLastLogin(userId, tx = db) {
    await tx.update(users)
      .set({ lastLoginAt: new Date(), updatedAt: new Date() })
      .where(eq(users.id, userId));
  }
}