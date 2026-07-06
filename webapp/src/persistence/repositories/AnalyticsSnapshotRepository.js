import { BaseRepository } from './BaseRepository.js';
import { analyticsSnapshots, analyticsSnapshotTypes } from '../../db/schema/analytics.js';
import { eq, and } from 'drizzle-orm';

export class AnalyticsSnapshotRepository extends BaseRepository {
  static get table() {
    return analyticsSnapshots;
  }

  // Helper mapping string Codes to UUID
  static async getTypeIdByCode(code, tx) {
    const conn = this.getDB(tx);
    const [record] = await conn
      .select({ id: analyticsSnapshotTypes.id })
      .from(analyticsSnapshotTypes)
      .where(eq(analyticsSnapshotTypes.code, code))
      .limit(1);
    
    return record?.id || null;
  }

  static async findLatestSnapshot(businessId, snapshotTypeId, tx) {
    const conn = this.getDB(tx);
    const [record] = await conn
      .select()
      .from(this.table)
      .where(
        and(
          eq(this.table.businessId, businessId),
          eq(this.table.snapshotTypeId, snapshotTypeId)
        )
      )
      .limit(1);
    
    return record || null;
  }
}
