import { eq } from 'drizzle-orm';
import { users } from '../../db/schema/identity.js';
import { BaseRepository } from './BaseRepository.js';

export class UserRepository extends BaseRepository {
  static get table() {
    return users;
  }

  static async findByMobile(mobile, tx) {
    const conn = this.getDB(tx);
    const [user] = await conn.select().from(this.table).where(eq(this.table.mobile, mobile)).limit(1);
    return user || null;
  }

  static async updateLastLogin(userId, tx) {
    const conn = this.getDB(tx);
    await conn.update(this.table)
      .set({ lastLoginAt: new Date(), updatedAt: new Date() })
      .where(eq(this.table.id, userId));
  }

  static async findByEmail(email, tx) {
    const conn = this.getDB(tx);
    const [user] = await conn.select().from(this.table).where(eq(this.table.email, email)).limit(1);
    return user || null;
  }

  static async updatePassword(userId, passwordHash, tx) {
    const conn = this.getDB(tx);
    await conn.update(this.table)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(this.table.id, userId));
  }
}
