// business, business_member, business_settings
// webapp/src/db/schema/business.js
import { 
  pgTable, 
  uuid, 
  varchar, 
  text, 
  timestamp, 
  date,
  integer,
  pgEnum, 
  uniqueIndex,
  index,
  unique
} from 'drizzle-orm/pg-core';
import { users } from './identity.js';
import { generateId, timestamps, foreignBusinessId } from './helpers.js';

export const businessTypeEnum = pgEnum('business_type', ['RETAIL', 'WHOLESALE', 'DISTRIBUTOR', 'MANUFACTURER', 'SERVICE']);
export const businessStatusEnum = pgEnum('business_status', ['ACTIVE', 'INACTIVE']);
export const memberStatusEnum = pgEnum('member_status', ['ACTIVE', 'INVITED', 'REMOVED']);

export const businesses = pgTable('business', {
  id: generateId(),
  name: varchar('name', { length: 150 }).notNull(),
  legalName: varchar('legal_name', { length: 200 }),
  businessType: businessTypeEnum('business_type').notNull(),
  gstin: varchar('gstin', { length: 15 }),
  pan: varchar('pan', { length: 10 }),
  phone: varchar('phone', { length: 15 }).notNull(),
  email: varchar('email', { length: 255 }),
  addressLine1: varchar('address_line1', { length: 255 }),
  addressLine2: varchar('address_line2', { length: 255 }),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 100 }),
  pincode: varchar('pincode', { length: 10 }),
  logoUrl: text('logo_url'),
  status: businessStatusEnum('status').notNull().default('ACTIVE'),
  ...timestamps,
}, (table) => ({
  gstinUniqueIdx: uniqueIndex('business_gstin_unique_idx').on(table.gstin).where(table.gstin.isNotNull()),
  nameIdx: index('business_name_idx').on(table.name),
  phoneIdx: index('business_phone_idx').on(table.phone),
}));

export const businessMembers = pgTable('business_member', {
  id: generateId(),
  businessId: foreignBusinessId(businesses),
  userId: uuid('user_id').notNull().references(() => users.id),
  joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
  status: memberStatusEnum('status').notNull().default('ACTIVE'),
}, (table) => ({
  businessUserUnique: unique('business_member_unique').on(table.businessId, table.userId),
}));

export const businessSettings = pgTable('business_settings', {
  businessId: uuid('business_id').primaryKey().references(() => businesses.id),
  invoicePrefix: varchar('invoice_prefix', { length: 20 }).notNull().default('INV'),
  financialYearStart: date('financial_year_start').notNull(),
  lowStockThreshold: integer('low_stock_threshold').notNull().default(10),
  ...timestamps,
});