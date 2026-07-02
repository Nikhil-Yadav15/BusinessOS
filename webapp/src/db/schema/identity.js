// user, session, device, otp
// src/db/schema/identity.js
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

export const userStatusEnum = pgEnum('user_status', ['ACTIVE', 'INACTIVE', 'LOCKED']);
export const otpPurposeEnum = pgEnum('otp_purpose', ['LOGIN', 'PASSWORD_RESET', 'MOBILE_VERIFICATION']);

export const users = pgTable('user', {
  // The blueprint requires UUIDv7. Drizzle's defaultRandom() generates UUIDv4.
  // To strictly follow the blueprint, generate UUIDv7 in your application layer before insert.
  id: uuid('id').primaryKey(), 
  fullName: varchar('full_name', { length: 150 }).notNull(),
  mobile: varchar('mobile', { length: 15 }).notNull().unique(), // Blueprint: UNIQUE (mobile)
  email: varchar('email', { length: 255 }),
  passwordHash: text('password_hash'), 
  status: userStatusEnum('status').notNull().default('ACTIVE'),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  // Blueprint: UNIQUE (email) WHERE email IS NOT NULL
  emailUniqueIdx: uniqueIndex('user_email_unique_idx').on(table.email).where(table.email.isNotNull()),
}));

export const sessions = pgTable('session', {
  id: uuid('id').primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id),
  deviceId: uuid('device_id').references(() => devices.id), // Explicitly linking to devices
  refreshTokenHash: text('refresh_token_hash').notNull(),
  ipAddress: inet('ip_address'), // Fixed: Using strictly INET as requested
  userAgent: text('user_agent'),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  lastActivityAt: timestamp('last_activity_at', { withTimezone: true }).notNull(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  // Blueprint Indexes: (user_id), (expires_at), (revoked_at)
  userIdx: index('session_user_idx').on(table.userId),
  expiresAtIdx: index('session_expires_at_idx').on(table.expiresAt),
  revokedAtIdx: index('session_revoked_at_idx').on(table.revokedAt),
}));

export const devices = pgTable('device', {
  id: uuid('id').primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id),
  deviceName: varchar('device_name', { length: 100 }),
  platform: varchar('platform', { length: 30 }),
  appVersion: varchar('app_version', { length: 20 }),
  deviceIdentifier: text('device_identifier').notNull(),
  isTrusted: boolean('is_trusted').notNull().default(false),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  // Blueprint Indexes: (user_id), (device_identifier)
  userIdx: index('device_user_idx').on(table.userId),
  identifierIdx: index('device_identifier_idx').on(table.deviceIdentifier),
}));

export const otps = pgTable('otp', {
  id: uuid('id').primaryKey(),
  mobile: varchar('mobile', { length: 15 }).notNull(),
  purpose: otpPurposeEnum('purpose').notNull(),
  otpHash: text('otp_hash').notNull(),
  attempts: smallint('attempts').notNull().default(0),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  // Blueprint Indexes: (mobile), (expires_at)
  mobileIdx: index('otp_mobile_idx').on(table.mobile),
  expiresAtIdx: index('otp_expires_at_idx').on(table.expiresAt),
}));