import { db } from '../../db/index.js';
export class BaseRepository {
  /**
   * Helper to determine which database connection to use.
   * If tx is provided, use it (transactional), otherwise use global db.
   */
  static getDB(tx) {
    return tx || db;
  }
}