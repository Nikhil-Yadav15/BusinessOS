// audit_log, security_event
import { 
  pgTable, 
  uuid, 
  varchar, 
  text, 
  timestamp, 
  jsonb,
  pgEnum, 
  inet,
  index 
} from 'drizzle-orm/pg-core';
import { businesses } from './business.js';
import { users } from './identity.js';
import { generateId, foreignBusinessId, timestamps } from './helpers.js';

export const auditActionEnum = pgEnum('audit_action', ['CREATE', 'UPDATE', 'DELETE']);
export const securitySeverityEnum = pgEnum('security_severity', ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

export const auditLogs = pgTable('audit_log', {
  id: generateId(),
  businessId: uuid('business_id').references(() => businesses.id), // Nullable for system operations
  userId: uuid('user_id').references(() => users.id), // Nullable for automated jobs
  entityType: varchar('entity_type', { length: 50 }).notNull(),
  entityId: uuid('entity_id').notNull(),
  action: auditActionEnum('action').notNull(),
  beforeData: jsonb('before_data'),
  afterData: jsonb('after_data'),
  ipAddress: inet('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamps.createdAt,
}, (table) => ({
  businessIdx: index('audit_business_idx').on(table.businessId),
  userIdx: index('audit_user_idx').on(table.userId),
  entityTypeIdx: index('audit_entity_type_idx').on(table.entityType),
  entityIdIdx: index('audit_entity_id_idx').on(table.entityId),
  createdIdx: index('audit_created_at_idx').on(table.createdAt),
}));

export const securityEvents = pgTable('security_event', {
  id: generateId(),
  userId: uuid('user_id').references(() => users.id), // Nullable if user is unknown
  businessId: uuid('business_id').references(() => businesses.id),
  eventType: varchar('event_type', { length: 100 }).notNull(),
  severity: securitySeverityEnum('severity').notNull(),
  ipAddress: inet('ip_address'),
  details: jsonb('details'),
  createdAt: timestamps.createdAt,
}, (table) => ({
  userIdx: index('sec_user_idx').on(table.userId),
  eventTypeIdx: index('sec_event_type_idx').on(table.eventType),
  severityIdx: index('sec_severity_idx').on(table.severity),
  createdIdx: index('sec_created_at_idx').on(table.createdAt),
}));