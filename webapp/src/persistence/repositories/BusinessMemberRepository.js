import { businessMembers } from '../../db/schema/business.js';
import { generateId } from '../../infrastructure/id/uuid.js';
import { BaseRepository } from './BaseRepository.js';

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
}