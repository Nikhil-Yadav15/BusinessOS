// workflow, workflow_action, workflow_execution
import { 
  pgTable, 
  uuid, 
  varchar, 
  text, 
  timestamp, 
  boolean,
  jsonb,
  smallint,
  pgEnum, 
  index 
} from 'drizzle-orm/pg-core';
import { businesses } from './business.js';
import { users } from './identity.js';
import { events } from './system.js';
import { generateId, foreignBusinessId, timestamps } from './helpers.js';

export const workflowStatusEnum = pgEnum('workflow_status', ['RUNNING', 'COMPLETED', 'FAILED']);

export const workflows = pgTable('workflow', {
  id: generateId(),
  businessId: foreignBusinessId(businesses),
  name: varchar('name', { length: 150 }).notNull(),
  description: text('description'),
  triggerEvent: varchar('trigger_event', { length: 100 }).notNull(),
  condition: jsonb('condition'),
  isEnabled: boolean('is_enabled').notNull().default(true),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  ...timestamps,
}, (table) => ({
  businessIdx: index('workflow_business_idx').on(table.businessId),
  triggerIdx: index('workflow_trigger_event_idx').on(table.triggerEvent),
  enabledIdx: index('workflow_enabled_idx').on(table.isEnabled),
}));

export const workflowActions = pgTable('workflow_action', {
  id: generateId(),
  workflowId: uuid('workflow_id').notNull().references(() => workflows.id),
  actionOrder: smallint('action_order').notNull(),
  actionType: varchar('action_type', { length: 100 }).notNull(),
  configuration: jsonb('configuration'),
  createdAt: timestamps.createdAt,
}, (table) => ({
  workflowIdx: index('wa_workflow_idx').on(table.workflowId),
  orderIdx: index('wa_action_order_idx').on(table.actionOrder),
}));

export const workflowExecutions = pgTable('workflow_execution', {
  id: generateId(),
  workflowId: uuid('workflow_id').notNull().references(() => workflows.id),
  eventId: uuid('event_id').notNull().references(() => events.id),
  status: workflowStatusEnum('status').notNull(),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  errorMessage: text('error_message'),
}, (table) => ({
  workflowIdx: index('we_workflow_idx').on(table.workflowId),
  eventIdx: index('we_event_idx').on(table.eventId),
  statusIdx: index('we_status_idx').on(table.status),
  startedIdx: index('we_started_at_idx').on(table.startedAt),
}));