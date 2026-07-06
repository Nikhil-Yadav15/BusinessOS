import { businesses } from '../../db/schema/business.js';
import { generateId } from '../../infrastructure/id/uuid.js';
import { BaseRepository } from './BaseRepository.js';

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
}