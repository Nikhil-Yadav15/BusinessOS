import { uuid, timestamp, varchar } from 'drizzle-orm/pg-core';
import { uuidv7 } from 'uuidv7';

// 1. Centralized UUIDv7 Generator for Primary Keys
export const generateId = () => uuid('id').primaryKey().$defaultFn(() => uuidv7());

// 2. Common Foreign Keys
// Note: We pass the reference table dynamically to avoid circular dependencies
export const foreignBusinessId = (businessesTable) => 
  uuid('business_id').notNull().references(() => businessesTable.id);

export const foreignUserId = (usersTable, columnName = 'user_id') => 
  uuid(columnName).notNull().references(() => usersTable.id);

// 3. Shared Timestamps
export const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
};

// 4. Shared Audit Columns (for transaction boundaries)
export const auditColumns = (usersTable) => ({
  createdBy: uuid('created_by').notNull().references(() => usersTable.id),
});