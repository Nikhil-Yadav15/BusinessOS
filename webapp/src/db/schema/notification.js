// notification, notification_template, notification_delivery
import { 
  pgTable, 
  uuid, 
  varchar, 
  text, 
  timestamp, 
  pgEnum, 
  index 
} from 'drizzle-orm/pg-core';
import { businesses } from './business.js';

export const notificationStatusEnum = pgEnum('notification_status', ['PENDING', 'SENT', 'FAILED']);
export const deliveryStatusEnum = pgEnum('delivery_status', ['PENDING', 'SUCCESS', 'FAILED']);
export const channelEnum = pgEnum('notification_channel', ['WHATSAPP', 'SMS', 'EMAIL']);

export const notificationTemplates = pgTable('notification_template', {
  id: uuid('id').primaryKey(),
  businessId: uuid('business_id').notNull().references(() => businesses.id),
  name: varchar('name', { length: 150 }).notNull(),
  channel: channelEnum('channel').notNull(),
  subject: varchar('subject', { length: 200 }),
  body: text('body').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  businessIdx: index('nt_business_idx').on(table.businessId),
  channelIdx: index('nt_channel_idx').on(table.channel),
}));

export const notifications = pgTable('notification', {
  id: uuid('id').primaryKey(),
  businessId: uuid('business_id').references(() => businesses.id), // Nullable for system notifications
  recipientType: varchar('recipient_type', { length: 30 }).notNull(), // PARTY, USER, BUSINESS_MEMBER
  recipientId: uuid('recipient_id').notNull(),
  templateId: uuid('template_id').references(() => notificationTemplates.id),
  title: varchar('title', { length: 200 }),
  message: text('message').notNull(),
  status: notificationStatusEnum('status').notNull().default('PENDING'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  businessIdx: index('notification_business_idx').on(table.businessId),
  recipientTypeIdx: index('notification_recipient_type_idx').on(table.recipientType),
  recipientIdIdx: index('notification_recipient_id_idx').on(table.recipientId),
  statusIdx: index('notification_status_idx').on(table.status),
  createdIdx: index('notification_created_at_idx').on(table.createdAt),
}));

export const notificationDeliveries = pgTable('notification_delivery', {
  id: uuid('id').primaryKey(),
  notificationId: uuid('notification_id').notNull().references(() => notifications.id),
  channel: channelEnum('channel').notNull(),
  status: deliveryStatusEnum('status').notNull().default('PENDING'),
  providerReference: varchar('provider_reference', { length: 150 }),
  errorMessage: text('error_message'),
  attemptedAt: timestamp('attempted_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  notificationIdx: index('nd_notification_idx').on(table.notificationId),
  channelIdx: index('nd_channel_idx').on(table.channel),
  statusIdx: index('nd_status_idx').on(table.status),
  attemptedIdx: index('nd_attempted_at_idx').on(table.attemptedAt),
}));