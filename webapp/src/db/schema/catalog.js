// category, brand, unit, product, product_image
import { 
  pgTable, 
  uuid, 
  varchar, 
  text, 
  timestamp, 
  decimal,
  smallint,
  pgEnum, 
  uniqueIndex,
  index,
  unique
} from 'drizzle-orm/pg-core';
import { businesses } from './business.js';

// Shared enum for Catalog entities
export const catalogStatusEnum = pgEnum('catalog_status', ['ACTIVE', 'INACTIVE']);

export const categories = pgTable('category', {
  id: uuid('id').primaryKey(),
  businessId: uuid('business_id').notNull().references(() => businesses.id),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  status: catalogStatusEnum('status').notNull().default('ACTIVE'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  // Blueprint: UNIQUE (business_id, name)
  businessNameUnique: unique('category_business_name_unique').on(table.businessId, table.name),
  // Blueprint: Indexes
  businessIdx: index('category_business_idx').on(table.businessId),
  nameIdx: index('category_name_idx').on(table.name),
}));

export const brands = pgTable('brand', {
  id: uuid('id').primaryKey(),
  businessId: uuid('business_id').notNull().references(() => businesses.id),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  status: catalogStatusEnum('status').notNull().default('ACTIVE'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  // Blueprint: UNIQUE (business_id, name)
  businessNameUnique: unique('brand_business_name_unique').on(table.businessId, table.name),
}));

export const units = pgTable('unit', {
  id: uuid('id').primaryKey(),
  businessId: uuid('business_id').notNull().references(() => businesses.id),
  name: varchar('name', { length: 50 }).notNull(),
  shortName: varchar('short_name', { length: 20 }).notNull(),
  status: catalogStatusEnum('status').notNull().default('ACTIVE'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const products = pgTable('product', {
  id: uuid('id').primaryKey(),
  businessId: uuid('business_id').notNull().references(() => businesses.id),
  categoryId: uuid('category_id').references(() => categories.id),
  brandId: uuid('brand_id').references(() => brands.id),
  unitId: uuid('unit_id').notNull().references(() => units.id),
  sku: varchar('sku', { length: 100 }).notNull(),
  barcode: varchar('barcode', { length: 100 }),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  purchasePrice: decimal('purchase_price', { precision: 18, scale: 2 }).notNull(),
  sellingPrice: decimal('selling_price', { precision: 18, scale: 2 }).notNull(),
  mrp: decimal('mrp', { precision: 18, scale: 2 }),
  gstRate: decimal('gst_rate', { precision: 5, scale: 2 }).notNull(),
  minimumStock: decimal('minimum_stock', { precision: 18, scale: 3 }).notNull().default('0'),
  hsnCode: varchar('hsn_code', { length: 20 }),
  status: catalogStatusEnum('status').notNull().default('ACTIVE'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  // Blueprint: UNIQUE (business_id, sku)
  businessSkuUnique: unique('product_business_sku_unique').on(table.businessId, table.sku),
  // Blueprint: UNIQUE (business_id, barcode) WHERE barcode IS NOT NULL
  businessBarcodeUniqueIdx: uniqueIndex('product_business_barcode_unique_idx')
    .on(table.businessId, table.barcode)
    .where(table.barcode.isNotNull()),
  // Blueprint: Indexes
  businessIdx: index('product_business_idx').on(table.businessId),
  categoryIdx: index('product_category_idx').on(table.categoryId),
  brandIdx: index('product_brand_idx').on(table.brandId),
  skuIdx: index('product_sku_idx').on(table.sku),
  barcodeIdx: index('product_barcode_idx').on(table.barcode),
  nameIdx: index('product_name_idx').on(table.name),
}));

export const productImages = pgTable('product_image', {
  id: uuid('id').primaryKey(),
  productId: uuid('product_id').notNull().references(() => products.id),
  imageUrl: text('image_url').notNull(),
  displayOrder: smallint('display_order').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});