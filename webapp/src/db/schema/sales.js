// invoice, invoice_item, payment
// webapp/src/db/schema/sales.js
import { pgTable, uuid, varchar, text, timestamp, decimal, pgEnum, index, unique } from 'drizzle-orm/pg-core';
import { businesses } from './business.js';
import { products } from './catalog.js';
import { users } from './identity.js';
import { parties } from './crm.js';
import { generateId, foreignBusinessId, timestamps } from './helpers.js';

export const invoiceTypeEnum = pgEnum('invoice_type', ['SALE', 'RETURN']);
export const invoiceStatusEnum = pgEnum('invoice_status', ['DRAFT', 'FINALIZED', 'PARTIALLY_PAID', 'PAID', 'CANCELLED']);
export const paymentMethodEnum = pgEnum('payment_method', ['CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'CHEQUE']);

export const invoices = pgTable('invoice', {
  id: generateId(),
  businessId: foreignBusinessId(businesses),
  customerId: uuid('customer_id').references(() => parties.id),
  invoiceNumber: varchar('invoice_number', { length: 50 }).notNull(),
  invoiceType: invoiceTypeEnum('invoice_type').notNull(),
  invoiceDate: timestamp('invoice_date', { withTimezone: true }).notNull(),
  subtotal: decimal('subtotal', { precision: 18, scale: 2 }).notNull(),
  discountAmount: decimal('discount_amount', { precision: 18, scale: 2 }).notNull().default('0'),
  taxAmount: decimal('tax_amount', { precision: 18, scale: 2 }).notNull(),
  totalAmount: decimal('total_amount', { precision: 18, scale: 2 }).notNull(),
  paidAmount: decimal('paid_amount', { precision: 18, scale: 2 }).notNull().default('0'),
  balanceAmount: decimal('balance_amount', { precision: 18, scale: 2 }).notNull(),
  notes: text('notes'),
  status: invoiceStatusEnum('status').notNull(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  ...timestamps,
}, (table) => ({
  businessNumUnique: unique('invoice_business_num_unique').on(table.businessId, table.invoiceNumber),
  businessIdx: index('invoice_business_idx').on(table.businessId),
  customerIdx: index('invoice_customer_idx').on(table.customerId),
  dateIdx: index('invoice_date_idx').on(table.invoiceDate),
  statusIdx: index('invoice_status_idx').on(table.status),
}));

export const invoiceItems = pgTable('invoice_item', {
  id: generateId(),
  invoiceId: uuid('invoice_id').notNull().references(() => invoices.id),
  productId: uuid('product_id').notNull().references(() => products.id),
  quantity: decimal('quantity', { precision: 18, scale: 3 }).notNull(),
  unitPrice: decimal('unit_price', { precision: 18, scale: 2 }).notNull(),
  discountAmount: decimal('discount_amount', { precision: 18, scale: 2 }).notNull(),
  taxAmount: decimal('tax_amount', { precision: 18, scale: 2 }).notNull(),
  lineTotal: decimal('line_total', { precision: 18, scale: 2 }).notNull(),
}, (table) => ({
  invoiceIdx: index('ii_invoice_idx').on(table.invoiceId),
  productIdx: index('ii_product_idx').on(table.productId),
}));

export const payments = pgTable('payment', {
  id: generateId(),
  businessId: foreignBusinessId(businesses),
  invoiceId: uuid('invoice_id').notNull().references(() => invoices.id),
  paymentDate: timestamp('payment_date', { withTimezone: true }).notNull(),
  paymentMethod: paymentMethodEnum('payment_method').notNull(),
  amount: decimal('amount', { precision: 18, scale: 2 }).notNull(),
  referenceNumber: varchar('reference_number', { length: 100 }),
  remarks: text('remarks'),
  receivedBy: uuid('received_by').notNull().references(() => users.id),
  createdAt: timestamps.createdAt,
}, (table) => ({
  invoiceIdx: index('payment_invoice_idx').on(table.invoiceId),
  dateIdx: index('payment_date_idx').on(table.paymentDate),
}));