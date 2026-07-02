// inventory, stock_movement
import { pgTable, uuid, decimal, timestamp, text, pgEnum, index, unique } from 'drizzle-orm/pg-core';
import { businesses } from './business.js';
import { products } from './catalog.js';
import { users } from './identity.js';

export const movementTypeEnum = pgEnum('movement_type', [
  'OPENING_STOCK', 'PURCHASE', 'SALE', 'SALE_RETURN', 'PURCHASE_RETURN', 'ADJUSTMENT'
]);

export const inventory = pgTable('inventory', {
  id: uuid('id').primaryKey(),
  businessId: uuid('business_id').notNull().references(() => businesses.id),
  productId: uuid('product_id').notNull().references(() => products.id),
  quantity: decimal('quantity', { precision: 18, scale: 3 }).notNull(),
  reservedQuantity: decimal('reserved_quantity', { precision: 18, scale: 3 }).notNull().default('0'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  businessProductUnique: unique('inventory_business_product_unique').on(table.businessId, table.productId),
  businessIdx: index('inventory_business_idx').on(table.businessId),
  productIdx: index('inventory_product_idx').on(table.productId),
}));

export const stockMovements = pgTable('stock_movement', {
  id: uuid('id').primaryKey(),
  businessId: uuid('business_id').notNull().references(() => businesses.id),
  productId: uuid('product_id').notNull().references(() => products.id),
  movementType: movementTypeEnum('movement_type').notNull(),
  quantity: decimal('quantity', { precision: 18, scale: 3 }).notNull(),
  referenceType: varchar('reference_type', { length: 30 }),
  referenceId: uuid('reference_id'),
  reason: text('reason'), // Required if ADJUSTMENT per blueprint
  createdBy: uuid('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  businessIdx: index('sm_business_idx').on(table.businessId),
  productIdx: index('sm_product_idx').on(table.productId),
  typeIdx: index('sm_type_idx').on(table.movementType),
  createdIdx: index('sm_created_at_idx').on(table.createdAt),
}));