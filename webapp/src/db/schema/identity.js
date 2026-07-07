// user, session, device, otp
// webapp/src/db/schema/identity.js
import { sql } from 'drizzle-orm';
import { 
  pgTable, 
  uuid, 
  varchar, 
  text, 
  timestamp, 
  boolean, 
  smallint, 
  pgEnum, 
  inet,
  uniqueIndex,
  index 
} from 'drizzle-orm/pg-core';
import { generateId, timestamps } from './helpers.js';

export const userStatusEnum = pgEnum('user_status', ['ACTIVE', 'INACTIVE', 'LOCKED']);
export const otpPurposeEnum = pgEnum('otp_purpose', ['LOGIN', 'PASSWORD_RESET', 'MOBILE_VERIFICATION']);

export const users = pgTable('user', {
  id: generateId(), 
  fullName: varchar('full_name', { length: 150 }).notNull(),
  mobile: varchar('mobile', { length: 15 }).notNull().unique(),
  email: varchar('email', { length: 255 }),
  passwordHash: text('password_hash'), 
  status: userStatusEnum('status').notNull().default('ACTIVE'),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  ...timestamps,
}, (table) => ({
  emailUniqueIdx: uniqueIndex('user_email_unique_idx')
    .on(table.email)
    .where(sql`${table.email} IS NOT NULL`),
}));

export const sessions = pgTable('session', {
  id: generateId(),
  userId: uuid('user_id').notNull().references(() => users.id),
  deviceId: uuid('device_id').references(() => devices.id),
  refreshTokenHash: text('refresh_token_hash').notNull(),
  ipAddress: inet('ip_address'), 
  userAgent: text('user_agent'),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  lastActivityAt: timestamp('last_activity_at', { withTimezone: true }).notNull(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  createdAt: timestamps.createdAt,
}, (table) => ({
  userIdx: index('session_user_idx').on(table.userId),
  expiresAtIdx: index('session_expires_at_idx').on(table.expiresAt),
  revokedAtIdx: index('session_revoked_at_idx').on(table.revokedAt),
}));

export const devices = pgTable('device', {
  id: generateId(),
  userId: uuid('user_id').notNull().references(() => users.id),
  deviceName: varchar('device_name', { length: 100 }),
  platform: varchar('platform', { length: 30 }),
  appVersion: varchar('app_version', { length: 20 }),
  deviceIdentifier: text('device_identifier').notNull(),
  isTrusted: boolean('is_trusted').notNull().default(false),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }),
  createdAt: timestamps.createdAt,
}, (table) => ({
  userIdx: index('device_user_idx').on(table.userId),
  identifierIdx: index('device_identifier_idx').on(table.deviceIdentifier),
}));

export const otps = pgTable('otp', {
  id: generateId(),
  mobile: varchar('mobile', { length: 255 }).notNull(), // Also used for email in hybrid OTP flow
  purpose: otpPurposeEnum('purpose').notNull(),
  otpHash: text('otp_hash').notNull(),
  attempts: smallint('attempts').notNull().default(0),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  createdAt: timestamps.createdAt,
}, (table) => ({
  mobileIdx: index('otp_mobile_idx').on(table.mobile),
  expiresAtIdx: index('otp_expires_at_idx').on(table.expiresAt),
}));
