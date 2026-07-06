import { BaseRepository } from './BaseRepository.js';
import { products } from '../../db/schema/catalog.js';
import { eq } from 'drizzle-orm';

export class ProductRepository extends BaseRepository {
  static get table() {
    return products;
  }

  // Example of overriding or adding product-specific queries later
  // such as findBySku, fetching with deep relations (brand, category, etc.)
  static async findBySku(businessId, sku, tx) {
    const conn = this.getDB(tx);
    const [record] = await conn
      .select()
      .from(this.table)
      .where(
        eq(this.table.businessId, businessId) && 
        eq(this.table.sku, sku)
      )
      .limit(1);
    return record || null;
  }
}
