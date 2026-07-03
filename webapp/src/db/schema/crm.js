import { sql } from 'drizzle-orm';
import { 
  pgTable, 
  varchar, 
  text, 
  decimal, 
  pgEnum, 
  uniqueIndex 
} from 'drizzle-orm/pg-core';
import { businesses } from './business.js';
import { generateId, foreignBusinessId, timestamps } from './helpers.js';

export const partyTypeEnum = pgEnum('party_type', ['CUSTOMER', 'SUPPLIER', 'BOTH']);
export const partyStatusEnum = pgEnum('party_status', ['ACTIVE', 'INACTIVE']);

export const parties = pgTable('party', {
  id: generateId(),
  businessId: foreignBusinessId(businesses),
  partyType: partyTypeEnum('party_type').notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  companyName: varchar('company_name', { length: 200 }),
  mobile: varchar('mobile', { length: 15 }),
  email: varchar('email', { length: 255 }),
  gstin: varchar('gstin', { length: 15 }),
  pan: varchar('pan', { length: 10 }),
  addressLine1: varchar('address_line1', { length: 255 }),
  addressLine2: varchar('address_line2', { length: 255 }),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 100 }),
  pincode: varchar('pincode', { length: 10 }),
  openingBalance: decimal('opening_balance', { precision: 18, scale: 2 }).notNull().default('0'),
  notes: text('notes'),
  status: partyStatusEnum('status').notNull().default('ACTIVE'),
  ...timestamps,
}, (table) => ({
  businessMobileUniqueIdx: uniqueIndex('party_business_mobile_unique_idx')
    .on(table.businessId, table.mobile)
    .where(sql`${table.mobile} IS NOT NULL`),
  businessGstinUniqueIdx: uniqueIndex('party_business_gstin_unique_idx')
    .on(table.businessId, table.gstin)
    .where(sql`${table.gstin} IS NOT NULL`),
}));
