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

  static async findList({ filters = {}, page = 1, limit = 10, sortBy = 'updatedAt', sortOrder = 'desc' }, tx) {
    const conn = this.getDB(tx);
    
    // Pagination parameters
    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const parsedLimit = Math.max(parseInt(limit, 10) || 10, 1);
    const offset = (parsedPage - 1) * parsedLimit;

    // Filters formulation
    const filterConditions = [];
    for (const [key, value] of Object.entries(filters)) {
      if (this.table[key] !== undefined && value !== undefined && value !== null) {
        filterConditions.push(eq(this.table[key], value));
      }
    }
    const condition = filterConditions.length > 0 ? and(...filterConditions) : undefined;

    // Relational query fetch
    const records = await conn.query.inventory.findMany({
      where: condition,
      limit: parsedLimit,
      offset: offset,
      orderBy: (inventory, { asc, desc }) => {
        if (sortBy === 'quantity') {
          return sortOrder.toLowerCase() === 'asc' ? asc(inventory.quantity) : desc(inventory.quantity);
        }
        return sortOrder.toLowerCase() === 'asc' ? asc(inventory.updatedAt) : desc(inventory.updatedAt);
      },
      with: {
        product: true
      }
    });

    return records;
  }
}
