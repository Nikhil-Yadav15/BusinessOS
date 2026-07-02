// event, event_outbox, background_job, system_setting, feature_flag
import { 
  pgTable, 
  uuid, 
  varchar, 
  text, 
  timestamp, 
  smallint, 
  integer,
  boolean,
  jsonb,
  pgEnum, 
  index 
} from 'drizzle-orm/pg-core';
import { businesses } from './business.js';
import { generateId, timestamps } from './helpers.js';

export const outboxStatusEnum = pgEnum('outbox_status', ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']);
export const jobStatusEnum = pgEnum('job_status', ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED']);

export const events = pgTable('event', {
  id: generateId(),
  businessId: uuid('business_id').references(() => businesses.id), // Nullable for system-wide events
  eventType: varchar('event_type', { length: 100 }).notNull(),
  eventVersion: smallint('event_version').notNull().default(1),
  sourceDomain: varchar('source_domain', { length: 50 }).notNull(),
  aggregateType: varchar('aggregate_type', { length: 50 }).notNull(),
  aggregateId: uuid('aggregate_id').notNull(),
  
  // Added strictly from Chapter 4 architecture:
  correlationId: uuid('correlation_id').notNull(),
  causationId: uuid('causation_id'),
  
  payload: jsonb('payload').notNull(),
  occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  typeIdx: index('event_type_idx').on(table.eventType),
  aggTypeIdx: index('event_aggregate_type_idx').on(table.aggregateType),
  aggIdIdx: index('event_aggregate_id_idx').on(table.aggregateId),
  correlationIdx: index('event_correlation_id_idx').on(table.correlationId),
  occurredIdx: index('event_occurred_at_idx').on(table.occurredAt),
}));

export const eventOutbox = pgTable('event_outbox', {
  id: generateId(),
  eventId: uuid('event_id').notNull().references(() => events.id),
  status: outboxStatusEnum('status').notNull().default('PENDING'),
  retryCount: integer('retry_count').notNull().default(0),
  lastAttemptAt: timestamp('last_attempt_at', { withTimezone: true }),
  processedAt: timestamp('processed_at', { withTimezone: true }),
  createdAt: timestamps.createdAt,
}, (table) => ({
  statusIdx: index('outbox_status_idx').on(table.status),
  createdIdx: index('outbox_created_at_idx').on(table.createdAt),
}));



export const backgroundJobs = pgTable('background_job', {
  id: generateId(),
  jobType: varchar('job_type', { length: 100 }).notNull(),
  payload: jsonb('payload').notNull(),
  status: jobStatusEnum('status').notNull().default('PENDING'),
  retryCount: integer('retry_count').notNull().default(0),
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
  scheduleExpression: varchar('schedule_expression', { length: 100 }),
  isRecurring: boolean('is_recurring').notNull().default(false),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamps.createdAt,
}, (table) => ({
  statusIdx: index('job_status_idx').on(table.status),
  typeIdx: index('job_type_idx').on(table.jobType),
  scheduledIdx: index('job_scheduled_at_idx').on(table.scheduledAt),
}));

export const systemSettings = pgTable('system_setting', {
  key: varchar('key', { length: 100 }).primaryKey(),
  value: text('value').notNull(),
  description: text('description'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const featureFlags = pgTable('feature_flag', {
  id: generateId(),
  featureName: varchar('feature_name', { length: 100 }).notNull().unique(),
  isEnabled: boolean('is_enabled').notNull().default(false),
  description: text('description'),
  ...timestamps,
}, (table) => ({
  enabledIdx: index('feature_enabled_idx').on(table.isEnabled),
}));