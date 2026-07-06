import { eq, and, asc, desc } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { generateId } from '../../infrastructure/id/uuid.js';

export class BaseRepository {
  /**
   * Subclasses MUST override this to return their Drizzle schema table.
   * Example: static get table() { return users; }
   */
  static get table() {
    throw new Error('Repository must define static get table()');
  }

  /**
   * Helper to determine which database connection to use.
   */
  static getDB(tx) {
    return tx || db;
  }

  static async findById(id, tx) {
    const conn = this.getDB(tx);
    const [record] = await conn
      .select()
      .from(this.table)
      .where(eq(this.table.id, id))
      .limit(1);
    return record || null;
  }

  static async create(data, tx) {
    const conn = this.getDB(tx);
    const insertData = { ...data };
    if (!insertData.id && this.table.id) insertData.id = generateId();
    if (this.table.createdAt) insertData.createdAt = new Date();
    if (this.table.updatedAt) insertData.updatedAt = new Date();

    const [record] = await conn.insert(this.table).values(insertData).returning();
    return record;
  }

  static async update(id, data, tx) {
    const conn = this.getDB(tx);
    const updateData = { ...data };
    if (this.table.updatedAt) updateData.updatedAt = new Date();

    const [record] = await conn
      .update(this.table)
      .set(updateData)
      .where(eq(this.table.id, id))
      .returning();
    return record;
  }

  static async delete(id, tx) {
    const conn = this.getDB(tx);
    const [record] = await conn
      .delete(this.table)
      .where(eq(this.table.id, id))
      .returning();
    return record;
  }

  /**
   * Standard findList method (Pagination, Sorting, Filtering).
   */
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

    let query = conn.select().from(this.table).limit(parsedLimit).offset(offset);
    if (condition) query = query.where(condition);
    if (orderByCol) query = query.orderBy(orderByCol);

    return await query;
  }
}
