import { businesses } from '../../db/schema/business.js';
import { generateId } from '../../infrastructure/id/uuid.js';
import { BaseRepository } from './BaseRepository.js';
import { eq, and } from 'drizzle-orm';
import { businesses, businessMembers } from '../../db/schema/business.js';


export class BusinessRepository extends BaseRepository {
  static async create(data, tx) {
    const conn = this.getDB(tx);
    const [business] = await conn.insert(businesses).values({
      id: generateId(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    return business;
  }
  static async getBusinessesForUser(userId, tx) {
    const conn = this.getDB(tx);
    
    return await conn.select({
      id: businesses.id,
      name: businesses.name,
      businessType: businesses.businessType,
      logoUrl: businesses.logoUrl,
      memberStatus: businessMembers.status,
      joinedAt: businessMembers.joinedAt,
    })
    .from(businessMembers)
    .innerJoin(businesses, eq(businessMembers.businessId, businesses.id))
    .where(
      and(
        eq(businessMembers.userId, userId),
        eq(businesses.status, 'ACTIVE'),
        eq(businessMembers.status, 'ACTIVE') // <-- NEW: Only active memberships
      )
    );
  }
}