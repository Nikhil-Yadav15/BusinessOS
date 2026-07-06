import { businessSettings } from '../../db/schema/business.js';
import { BaseRepository } from './BaseRepository.js';

export class BusinessSettingsRepository extends BaseRepository {
  static async create(data, tx) {
    const conn = this.getDB(tx);
    const [settings] = await conn.insert(businessSettings).values({
      // businessId is the PK here, no generated ID needed
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    return settings;
  }
}