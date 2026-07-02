// src/db/schema/index.js
import { relations } from 'drizzle-orm';

// 1. Import all module schemas
import * as identity from './identity.js';
import * as business from './business.js';
import * as catalog from './catalog.js';
import * as inventory from './inventory.js';
import * as sales from './sales.js';
import * as purchasing from './purchasing.js';
import * as crm from './crm.js';
import * as ledger from './ledger.js';
import * as security from './security.js';
import * as system from './system.js';
import * as audit from './audit.js';
import * as workflow from './workflow.js';
import * as notification from './notification.js';
import * as analytics from './analytics.js';
import * as ai from './ai.js';

// 2. Define the Relations API (Critical Aggregates)

// --- Identity & Business Relations ---
export const usersRelations = relations(identity.users, ({ many }) => ({
  memberships: many(business.businessMembers),
  sessions: many(identity.sessions),
}));

export const businessesRelations = relations(business.businesses, ({ one, many }) => ({
  settings: one(business.businessSettings, {
    fields: [business.businesses.id],
    references: [business.businessSettings.businessId],
  }),
  members: many(business.businessMembers),
  invoices: many(sales.invoices),
  products: many(catalog.products),
}));

export const businessMembersRelations = relations(business.businessMembers, ({ one, many }) => ({
  business: one(business.businesses, {
    fields: [business.businessMembers.businessId],
    references: [business.businesses.id],
  }),
  user: one(identity.users, {
    fields: [business.businessMembers.userId],
    references: [identity.users.id],
  }),
  roles: many(security.memberRoles),
}));

// --- Sales Relations ---
export const invoicesRelations = relations(sales.invoices, ({ one, many }) => ({
  business: one(business.businesses, {
    fields: [sales.invoices.businessId],
    references: [business.businesses.id],
  }),
  customer: one(crm.parties, {
    fields: [sales.invoices.customerId],
    references: [crm.parties.id],
  }),
  items: many(sales.invoiceItems),
  payments: many(sales.payments),
}));

export const invoiceItemsRelations = relations(sales.invoiceItems, ({ one }) => ({
  invoice: one(sales.invoices, {
    fields: [sales.invoiceItems.invoiceId],
    references: [sales.invoices.id],
  }),
  product: one(catalog.products, {
    fields: [sales.invoiceItems.productId],
    references: [catalog.products.id],
  }),
}));

// --- Catalog Relations ---
export const productsRelations = relations(catalog.products, ({ one, many }) => ({
  category: one(catalog.categories, {
    fields: [catalog.products.categoryId],
    references: [catalog.categories.id],
  }),
  brand: one(catalog.brands, {
    fields: [catalog.products.brandId],
    references: [catalog.brands.id],
  }),
  images: many(catalog.productImages),
  inventory: one(inventory.inventory, {
    fields: [catalog.products.id],
    references: [inventory.inventory.productId],
  }),
}));

// 3. Export everything to be consumed by db/index.js
export default {
  ...identity,
  ...business,
  ...catalog,
  ...inventory,
  ...sales,
  ...purchasing,
  ...crm,
  ...ledger,
  ...security,
  ...system,
  ...audit,
  ...workflow,
  ...notification,
  ...analytics,
  ...ai,
  // Export relations
  usersRelations,
  businessesRelations,
  businessMembersRelations,
  invoicesRelations,
  invoiceItemsRelations,
  productsRelations,
};