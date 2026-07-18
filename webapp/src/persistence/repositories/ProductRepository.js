import { BaseRepository } from './BaseRepository.js';
import { products } from '../../db/schema/catalog.js';
import { inventory } from '../../db/schema/inventory.js';
import { eq, and, asc, desc } from 'drizzle-orm';

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

  static async findList({ filters = {}, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' }, tx) {
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

    // Determine query condition
    const condition = filterConditions.length > 0 ? and(...filterConditions) : undefined;
    
    // Determine sorting
    let orderByCol = this.table.createdAt ? desc(this.table.createdAt) : undefined;
    if (this.table[sortBy]) {
      orderByCol = sortOrder.toLowerCase() === 'asc' ? asc(this.table[sortBy]) : desc(this.table[sortBy]);
    }

    let query = conn
      .select({
        id: products.id,
        businessId: products.businessId,
        categoryId: products.categoryId,
        brandId: products.brandId,
        unitId: products.unitId,
        sku: products.sku,
        barcode: products.barcode,
        name: products.name,
        description: products.description,
        purchasePrice: products.purchasePrice,
        sellingPrice: products.sellingPrice,
        mrp: products.mrp,
        gstRate: products.gstRate,
        minimumStock: products.minimumStock,
        hsnCode: products.hsnCode,
        status: products.status,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        stock: inventory.quantity,
      })
      .from(this.table)
      .leftJoin(
        inventory,
        and(
          eq(products.id, inventory.productId),
          eq(products.businessId, inventory.businessId)
        )
      )
      .limit(parsedLimit)
      .offset(offset);

    if (condition) {
      query = query.where(condition);
    }
    if (orderByCol) {
      query = query.orderBy(orderByCol);
    }

    const records = await query;
    return records.map(r => ({
      ...r,
      stock: r.stock ? parseFloat(r.stock) : 0
    }));
  }
}
