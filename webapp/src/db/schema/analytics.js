// analytics_snapshot_type, analytics_snapshot, analytics_history
import { 
  pgTable, 
  uuid, 
  varchar, 
  text, 
  timestamp, 
  date,
  boolean,
  smallint,
  jsonb,
  pgEnum, 
  unique,
  uniqueIndex,
  index 
} from 'drizzle-orm/pg-core';
import { businesses } from './business.js';

export const refreshStrategyEnum = pgEnum('refresh_strategy', ['EVENT', 'SCHEDULE']);
export const periodTypeEnum = pgEnum('period_type', ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']);

export const analyticsSnapshotTypes = pgTable('analytics_snapshot_type', {
  id: uuid('id').primaryKey(),
  code: varchar('code', { length: 100 }).notNull().unique(), // e.g., 'BUSINESS_SUMMARY'
  name: varchar('name', { length: 150 }).notNull(),
  description: text('description'),
  refreshStrategy: refreshStrategyEnum('refresh_strategy').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  activeIdx: index('ast_active_idx').on(table.isActive),
}));

export const analyticsSnapshots = pgTable('analytics_snapshot', {
  id: uuid('id').primaryKey(),
  businessId: uuid('business_id').notNull().references(() => businesses.id),
  snapshotTypeId: uuid('snapshot_type_id').notNull().references(() => analyticsSnapshotTypes.id),
  version: smallint('version').notNull(),
  data: jsonb('data').notNull(),
  checksum: varchar('checksum', { length: 64 }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  // Blueprint: UNIQUE(business_id, snapshot_type_id)
  businessTypeUnique: unique('as_business_type_unique').on(table.businessId, table.snapshotTypeId),
  // Blueprint: GIN(data)
  dataGinIdx: index('as_data_gin_idx').using('gin', table.data),
  updatedIdx: index('as_updated_at_idx').on(table.updatedAt),
}));

export const analyticsHistory = pgTable('analytics_history', {
  id: uuid('id').primaryKey(),
  businessId: uuid('business_id').notNull().references(() => businesses.id),
  snapshotTypeId: uuid('snapshot_type_id').notNull().references(() => analyticsSnapshotTypes.id),
  periodType: periodTypeEnum('period_type').notNull(),
  periodStart: date('period_start').notNull(),
  periodEnd: date('period_end').notNull(),
  version: smallint('version').notNull(),
  data: jsonb('data').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  // Blueprint: UNIQUE(business_id, snapshot_type_id, period_type, period_start)
  historyUnique: unique('ah_history_unique').on(
    table.businessId, 
    table.snapshotTypeId, 
    table.periodType, 
    table.periodStart
  ),
  typeIdx: index('ah_type_idx').on(table.snapshotTypeId),
  periodTypeIdx: index('ah_period_type_idx').on(table.periodType),
  periodStartIdx: index('ah_period_start_idx').on(table.periodStart),
  dataGinIdx: index('ah_data_gin_idx').using('gin', table.data),
}));