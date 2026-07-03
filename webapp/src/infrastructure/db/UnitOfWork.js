import { db } from '../../db/index.js';
import { sql } from 'drizzle-orm';

export class UnitOfWork {
  /**
   * Executes a business operation within a safe, isolated transaction.
   * @param {ExecutionContext} context 
   * @param {Function} work - The logic to execute
   */
  static async execute(context, work) {
    return await db.transaction(async (tx) => {
      
      // 1. Bind Execution Context to the PostgreSQL Session
      // This maps to the functions we created in Phase 2
      await tx.execute(sql`
        SELECT set_execution_context(
          ${context.userId || null},
          ${context.sessionId || null},
          ${context.businessId || null},
          ${context.memberId || null}
        )
      `);

      try {
        // 2. Execute the actual business operation
        const result = await work(tx);

        // 3. Return the result
        return result;
      } catch (error) {
        // Automatically roll back and bubble the error
        console.error('UnitOfWork Error:', error);
        throw error;
      }
    });
  }
}