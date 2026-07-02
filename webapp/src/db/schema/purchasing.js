// purchase, purchase_item, supplier_payment
import { 
  pgTable, 
  uuid, 
  varchar, 
  text, 
  timestamp, 
  decimal, 
  pgEnum, 
  index, 
  unique 
} from 'drizzle-orm/pg-core';
import { businesses } from './business.js';
import { products } from './catalog.js';
import { users } from './identity.js';
import { parties } from './crm.js';
import { paymentMethodEnum } from './sales.js'; // Imported to ensure enum consistency

export const purchaseTypeEnum = pgEnum('purchase_type', ['PURCHASE', 'RETURN']);
export const purchaseStatusEnum = pgEnum('purchase_status', ['DRAFT', 'FINALIZED', 'PARTIALLY_PAID', 'PAID', 'CANCELLED']);

export const purchases = pgTable('purchase', {
  id: uuid('id').primaryKey(),
  businessId: uuid('business_id').notNull().references(() => businesses.id),
  supplierId: uuid('supplier_id').notNull().references(() => parties.id),
  purchaseNumber: varchar('purchase_number', { length: 50 }).notNull(),
  purchaseType: purchaseTypeEnum('purchase_type').notNull(),
  purchaseDate: timestamp('purchase_date', { withTimezone: true }).notNull(),
  supplierInvoiceNumber: varchar('supplier_invoice_number', { length: 100 }),
  subtotal: decimal('subtotal', { precision: 18, scale: 2 }).notNull(),
  discountAmount: decimal('discount_amount', { precision: 18, scale: 2 }).notNull().default('0'),
  taxAmount: decimal('tax_amount', { precision: 18, scale: 2 }).notNull(),
  totalAmount: decimal('total_amount', { precision: 18, scale: 2 }).notNull(),
  paidAmount: decimal('paid_amount', { precision: 18, scale: 2 }).notNull().default('0'),
  balanceAmount: decimal('balance_amount', { precision: 18, scale: 2 }).notNull(),
  notes: text('notes'),
  status: purchaseStatusEnum('status').notNull(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  // Blueprint: UNIQUE (business_id, purchase_number)
  businessNumUnique: unique('purchase_business_num_unique').on(table.businessId, table.purchaseNumber),
}));

export const purchaseItems = pgTable('purchase_item', {
  id: uuid('id').primaryKey(),
  purchaseId: uuid('purchase_id').notNull().references(() => purchases.id),
  productId: uuid('product_id').notNull().references(() => products.id),
  quantity: decimal('quantity', { precision: 18, scale: 3 }).notNull(),
  unitCost: decimal('unit_cost', { precision: 18, scale: 2 }).notNull(),
  discountAmount: decimal('discount_amount', { precision: 18, scale: 2 }).notNull().default('0'),
  taxAmount: decimal('tax_amount', { precision: 18, scale: 2 }).notNull(),
  lineTotal: decimal('line_total', { precision: 18, scale: 2 }).notNull(),
});

export const supplierPayments = pgTable('supplier_payment', {
  id: uuid('id').primaryKey(),
  businessId: uuid('business_id').notNull().references(() => businesses.id),
  purchaseId: uuid('purchase_id').notNull().references(() => purchases.id),
  paymentDate: timestamp('payment_date', { withTimezone: true }).notNull(),
  paymentMethod: paymentMethodEnum('payment_method').notNull(),
  amount: decimal('amount', { precision: 18, scale: 2 }).notNull(),
  referenceNumber: varchar('reference_number', { length: 100 }),
  remarks: text('remarks'),
  paidBy: uuid('paid_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});