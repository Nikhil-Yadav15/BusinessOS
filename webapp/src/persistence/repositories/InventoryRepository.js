import { BaseRepository } from './BaseRepository.js';
import { inventory } from '../../db/schema/inventory.js';
import { eq, and } from 'drizzle-orm';

export class InventoryRepository extends BaseRepository {
  static get table() {
    return inventory;
  }

  static async findByProduct(businessId, productId, tx) {
    const conn = this.getDB(tx);
    const [record] = await conn
      .select()
      .from(this.table)
      .where(
        and(
          eq(this.table.businessId, businessId),
          eq(this.table.productId, productId)
        )
      )
      .limit(1);
    return record || null;
  }
}
