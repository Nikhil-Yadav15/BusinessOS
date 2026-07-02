// conversation, message, ai_memory
import { 
  pgTable, 
  uuid, 
  varchar, 
  text, 
  timestamp, 
  smallint,
  jsonb,
  pgEnum, 
  uniqueIndex,
  index 
} from 'drizzle-orm/pg-core';
import { businesses } from './business.js';
import { users } from './identity.js';
import { generateId, foreignBusinessId, timestamps } from './helpers.js';

export const conversationStatusEnum = pgEnum('conversation_status', ['ACTIVE', 'ARCHIVED']);
export const messageRoleEnum = pgEnum('message_role', ['USER', 'ASSISTANT', 'SYSTEM']);
export const memoryScopeEnum = pgEnum('memory_scope', ['BUSINESS', 'USER', 'CONVERSATION']);

export const conversations = pgTable('conversation', {
  id: generateId(),
  businessId: foreignBusinessId(businesses),
  userId: uuid('user_id').notNull().references(() => users.id),
  title: varchar('title', { length: 200 }),
  status: conversationStatusEnum('status').notNull().default('ACTIVE'),
  ...timestamps,
}, (table) => ({
  businessIdx: index('conv_business_idx').on(table.businessId),
  userIdx: index('conv_user_idx').on(table.userId),
  updatedIdx: index('conv_updated_at_idx').on(table.updatedAt),
}));

export const messages = pgTable('message', {
  id: generateId(),
  conversationId: uuid('conversation_id').notNull().references(() => conversations.id),
  role: messageRoleEnum('role').notNull(),
  content: text('content').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamps.createdAt,
}, (table) => ({
  conversationIdx: index('msg_conversation_idx').on(table.conversationId),
  createdIdx: index('msg_created_at_idx').on(table.createdAt),
  metadataGinIdx: index('msg_metadata_gin_idx').using('gin', table.metadata),
}));

export const aiMemories = pgTable('ai_memory', {
  id: generateId(),
  businessId: foreignBusinessId(businesses),
  userId: uuid('user_id').references(() => users.id), // Nullable
  conversationId: uuid('conversation_id').references(() => conversations.id), // Nullable
  namespace: varchar('namespace', { length: 100 }).notNull(),
  memoryKey: varchar('memory_key', { length: 100 }).notNull(),
  scope: memoryScopeEnum('scope').notNull(),
  data: jsonb('data').notNull(),
  importance: smallint('importance').notNull(), // 1-10
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  lastAccessedAt: timestamp('last_accessed_at', { withTimezone: true }),
  ...timestamps,
}, (table) => ({
  // Blueprint: Business-wide memory unique constraint
  businessMemoryUnique: uniqueIndex('aim_business_memory_unique')
    .on(table.businessId, table.namespace, table.memoryKey)
    .where(table.userId.isNull().and(table.conversationId.isNull())),
    
  // Blueprint: User-specific memory unique constraint
  userMemoryUnique: uniqueIndex('aim_user_memory_unique')
    .on(table.businessId, table.userId, table.namespace, table.memoryKey)
    .where(table.userId.isNotNull()),

  // Blueprint: Conversation memory unique constraint
  conversationMemoryUnique: uniqueIndex('aim_conversation_memory_unique')
    .on(table.conversationId, table.namespace, table.memoryKey)
    .where(table.conversationId.isNotNull()),

  // Additional Indexes
  businessIdx: index('aim_business_idx').on(table.businessId),
  userIdx: index('aim_user_idx').on(table.userId),
  conversationIdx: index('aim_conversation_idx').on(table.conversationId),
  namespaceIdx: index('aim_namespace_idx').on(table.namespace),
  scopeIdx: index('aim_scope_idx').on(table.scope),
  expiresIdx: index('aim_expires_at_idx').on(table.expiresAt),
  dataGinIdx: index('aim_data_gin_idx').using('gin', table.data),
}));