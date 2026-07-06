import { businessMembers } from '../../db/schema/business.js';
import { generateId } from '../../infrastructure/id/uuid.js';
import { BaseRepository } from './BaseRepository.js';
import { eq, and } from 'drizzle-orm';

export class BusinessMemberRepository extends BaseRepository {
  static async create(data, tx) {
    const conn = this.getDB(tx);
    const [member] = await conn.insert(businessMembers).values({
      id: generateId(),
      ...data,
      joinedAt: new Date(),
    }).returning();
    return member;
  }
  static async findByBusinessAndUser(businessId, userId, tx) {
    const conn = this.getDB(tx);
    const [member] = await conn.select()
      .from(businessMembers)
      .where(and(
        eq(businessMembers.businessId, businessId), 
        eq(businessMembers.userId, userId)
      ))
      .limit(1);
    return member || null;
  }
}