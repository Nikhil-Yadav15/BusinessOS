import { businessMembers } from '../../db/schema/business.js';
import { users } from '../../db/schema/identity.js';
import { generateId } from '../../infrastructure/id/uuid.js';
import { BaseRepository } from './BaseRepository.js';
import { eq, and, count } from 'drizzle-orm';

export class BusinessMemberRepository extends BaseRepository {

  static async create(data, tx) {
    const conn = this.getDB(tx);

    const [member] = await conn
      .insert(businessMembers)
      .values({
        id: generateId(),
        ...data,
        joinedAt: new Date(),
      })
      .returning();

    return member;
  }

  static async findByBusinessAndId(businessId, memberId, tx) {
  const conn = this.getDB(tx);

  const [member] = await conn
    .select({
      id: businessMembers.id,
      businessId: businessMembers.businessId,
      userId: businessMembers.userId,
      status: businessMembers.status,
      joinedAt: businessMembers.joinedAt,
      createdAt: businessMembers.createdAt,
      updatedAt: businessMembers.updatedAt,

      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      mobile: users.mobile,
    })
    .from(businessMembers)
    .innerJoin(
      users,
      eq(users.id, businessMembers.userId)
    )
    .where(
      and(
        eq(businessMembers.businessId, businessId),
        eq(businessMembers.id, memberId)
      )
    )
    .limit(1);

  return member || null;
}

  static async findByBusinessAndUser(businessId, userId, tx) {
    const conn = this.getDB(tx);

    const [member] = await conn
      .select()
      .from(businessMembers)
      .where(
        and(
          eq(businessMembers.businessId, businessId),
          eq(businessMembers.userId, userId)
        )
      )
      .limit(1);

    return member || null;
  }

  static async findByBusiness(businessId, tx) {
    const conn = this.getDB(tx);

    return await conn
      .select({
        id: businessMembers.id,
        businessId: businessMembers.businessId,
        userId: businessMembers.userId,
        status: businessMembers.status,
        joinedAt: businessMembers.joinedAt,
        createdAt: businessMembers.createdAt,
        updatedAt: businessMembers.updatedAt,

        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        mobile: users.mobile,
      })
      .from(businessMembers)
      .innerJoin(
        users,
        eq(users.id, businessMembers.userId)
      )
      .where(eq(businessMembers.businessId, businessId));
  }

  static async exists(businessId, userId, tx) {
    const member = await this.findByBusinessAndUser(
      businessId,
      userId,
      tx
    );

    return member !== null;
  }

  static async countByBusiness(businessId, tx) {
    const conn = this.getDB(tx);

    const [{ total }] = await conn
      .select({
        total: count(),
      })
      .from(businessMembers)
      .where(eq(businessMembers.businessId, businessId));

    return Number(total);
  }

  static async updateStatus(memberId, status, tx) {
  const conn = this.getDB(tx);

  const [member] = await conn
    .update(businessMembers)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(businessMembers.id, memberId))
    .returning();

  return member;
}
  static async countActiveByBusiness(businessId, tx) {
  const conn = this.getDB(tx);

  const [{ total }] = await conn
    .select({
      total: count(),
    })
    .from(businessMembers)
    .where(
      and(
        eq(businessMembers.businessId, businessId),
        eq(businessMembers.status, 'ACTIVE')
      )
    );

  return Number(total);
}

}