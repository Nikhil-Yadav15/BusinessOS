// webapp/src/db/schema/index.js
import { relations } from 'drizzle-orm';

// 1. Import all module schemas explicitly
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

// ============================================================================
// 2. Define the Relations API (Comprehensive Relational Mapping)
// ============================================================================

// --- IDENTITY MODULE RELATIONS ---
export const usersRelations = relations(identity.users, ({ many }) => ({
  memberships: many(business.businessMembers),
  sessions: many(identity.sessions),
  devices: many(identity.devices),
  auditLogs: many(audit.auditLogs),
  securityEvents: many(audit.securityEvents),
}));

export const sessionsRelations = relations(identity.sessions, ({ one }) => ({
  user: one(identity.users, { fields: [identity.sessions.userId], references: [identity.users.id] }),
  device: one(identity.devices, { fields: [identity.sessions.deviceId], references: [identity.devices.id] }),
}));

export const devicesRelations = relations(identity.devices, ({ one }) => ({
  user: one(identity.users, { fields: [identity.devices.userId], references: [identity.users.id] }),
}));

// --- BUSINESS MODULE RELATIONS ---
export const businessesRelations = relations(business.businesses, ({ one, many }) => ({
  settings: one(business.businessSettings, {
    fields: [business.businesses.id],
    references: [business.businessSettings.businessId],
  }),
  members: many(business.businessMembers),
  products: many(catalog.products),
  parties: many(crm.parties),
  invoices: many(sales.invoices),
  purchases: many(purchasing.purchases),
  ledgerAccounts: many(ledger.ledgerAccounts),
  roles: many(security.roles),
  workflows: many(workflow.workflows),
  analyticsSnapshots: many(analytics.analyticsSnapshots),
}));

export const businessMembersRelations = relations(business.businessMembers, ({ one, many }) => ({
  business: one(business.businesses, { fields: [business.businessMembers.businessId], references: [business.businesses.id] }),
  user: one(identity.users, { fields: [business.businessMembers.userId], references: [identity.users.id] }),
  memberRoles: many(security.memberRoles),
}));

// --- CATALOG MODULE RELATIONS ---
export const productsRelations = relations(catalog.products, ({ one, many }) => ({
  business: one(business.businesses, { fields: [catalog.products.businessId], references: [business.businesses.id] }),
  category: one(catalog.categories, { fields: [catalog.products.categoryId], references: [catalog.categories.id] }),
  brand: one(catalog.brands, { fields: [catalog.products.brandId], references: [catalog.brands.id] }),
  unit: one(catalog.units, { fields: [catalog.products.unitId], references: [catalog.units.id] }),
  images: many(catalog.productImages),
  inventory: one(inventory.inventory, { fields: [catalog.products.id], references: [inventory.inventory.productId] }),
  stockMovements: many(inventory.stockMovements),
}));

export const categoriesRelations = relations(catalog.categories, ({ many }) => ({
  products: many(catalog.products),
}));

export const brandsRelations = relations(catalog.brands, ({ many }) => ({
  products: many(catalog.products),
}));

export const productImagesRelations = relations(catalog.productImages, ({ one }) => ({
  product: one(catalog.products, { fields: [catalog.productImages.productId], references: [catalog.products.id] }),
}));

// --- INVENTORY MODULE RELATIONS ---
export const inventoryRelations = relations(inventory.inventory, ({ one }) => ({
  product: one(catalog.products, { fields: [inventory.inventory.productId], references: [catalog.products.id] }),
}));

export const stockMovementsRelations = relations(inventory.stockMovements, ({ one }) => ({
  product: one(catalog.products, { fields: [inventory.stockMovements.productId], references: [catalog.products.id] }),
  user: one(identity.users, { fields: [inventory.stockMovements.createdBy], references: [identity.users.id] }),
}));

// --- CRM MODULE RELATIONS ---
export const partiesRelations = relations(crm.parties, ({ many }) => ({
  invoices: many(sales.invoices),
  purchases: many(purchasing.purchases),
}));

// --- SALES MODULE RELATIONS ---
export const invoicesRelations = relations(sales.invoices, ({ one, many }) => ({
  business: one(business.businesses, { fields: [sales.invoices.businessId], references: [business.businesses.id] }),
  customer: one(crm.parties, { fields: [sales.invoices.customerId], references: [crm.parties.id] }),
  items: many(sales.invoiceItems),
  payments: many(sales.payments),
  user: one(identity.users, { fields: [sales.invoices.createdBy], references: [identity.users.id] }),
}));

export const invoiceItemsRelations = relations(sales.invoiceItems, ({ one }) => ({
  invoice: one(sales.invoices, { fields: [sales.invoiceItems.invoiceId], references: [sales.invoices.id] }),
  product: one(catalog.products, { fields: [sales.invoiceItems.productId], references: [catalog.products.id] }),
}));

export const paymentsRelations = relations(sales.payments, ({ one }) => ({
  invoice: one(sales.invoices, { fields: [sales.payments.invoiceId], references: [sales.invoices.id] }),
  user: one(identity.users, { fields: [sales.payments.receivedBy], references: [identity.users.id] }),
}));

// --- PURCHASING MODULE RELATIONS ---
export const purchasesRelations = relations(purchasing.purchases, ({ one, many }) => ({
  business: one(business.businesses, { fields: [purchasing.purchases.businessId], references: [business.businesses.id] }),
  supplier: one(crm.parties, { fields: [purchasing.purchases.supplierId], references: [crm.parties.id] }),
  items: many(purchasing.purchaseItems),
  supplierPayments: many(purchasing.supplierPayments),
  user: one(identity.users, { fields: [purchasing.purchases.createdBy], references: [identity.users.id] }),
}));

export const purchaseItemsRelations = relations(purchasing.purchaseItems, ({ one }) => ({
  purchase: one(purchasing.purchases, { fields: [purchasing.purchaseItems.purchaseId], references: [purchasing.purchases.id] }),
  product: one(catalog.products, { fields: [purchasing.purchaseItems.productId], references: [catalog.products.id] }),
}));

export const supplierPaymentsRelations = relations(purchasing.supplierPayments, ({ one }) => ({
  purchase: one(purchasing.purchases, { fields: [purchasing.supplierPayments.purchaseId], references: [purchasing.purchases.id] }),
  user: one(identity.users, { fields: [purchasing.supplierPayments.paidBy], references: [identity.users.id] }),
}));

// --- LEDGER MODULE RELATIONS ---
export const ledgerAccountsRelations = relations(ledger.ledgerAccounts, ({ one, many }) => ({
  parentAccount: one(ledger.ledgerAccounts, {
    fields: [ledger.ledgerAccounts.parentAccountId],
    references: [ledger.ledgerAccounts.id],
    relationName: 'accountHierarchy',
  }),
  childAccounts: many(ledger.ledgerAccounts, { relationName: 'accountHierarchy' }),
  journalLines: many(ledger.journalLines),
  expenses: many(ledger.expenses),
}));

export const journalEntriesRelations = relations(ledger.journalEntries, ({ one, many }) => ({
  lines: many(ledger.journalLines),
  user: one(identity.users, { fields: [ledger.journalEntries.createdBy], references: [identity.users.id] }),
}));

export const journalLinesRelations = relations(ledger.journalLines, ({ one }) => ({
  journalEntry: one(ledger.journalEntries, { fields: [ledger.journalLines.journalEntryId], references: [ledger.journalEntries.id] }),
  account: one(ledger.ledgerAccounts, { fields: [ledger.journalLines.ledgerAccountId], references: [ledger.ledgerAccounts.id] }),
}));

export const expensesRelations = relations(ledger.expenses, ({ one }) => ({
  account: one(ledger.ledgerAccounts, { fields: [ledger.expenses.ledgerAccountId], references: [ledger.ledgerAccounts.id] }),
  user: one(identity.users, { fields: [ledger.expenses.createdBy], references: [identity.users.id] }),
}));

// --- SECURITY MODULE RELATIONS ---
export const rolesRelations = relations(security.roles, ({ many }) => ({
  rolePermissions: many(security.rolePermissions),
  memberRoles: many(security.memberRoles),
}));

export const rolePermissionsRelations = relations(security.rolePermissions, ({ one }) => ({
  role: one(security.roles, { fields: [security.rolePermissions.roleId], references: [security.roles.id] }),
  permission: one(security.permissions, { fields: [security.rolePermissions.permissionId], references: [security.permissions.id] }),
}));

export const memberRolesRelations = relations(security.memberRoles, ({ one }) => ({
  member: one(business.businessMembers, { fields: [security.memberRoles.businessMemberId], references: [business.businessMembers.id] }),
  role: one(security.roles, { fields: [security.memberRoles.roleId], references: [security.roles.id] }),
}));

// --- WORKFLOW MODULE RELATIONS ---
export const workflowsRelations = relations(workflow.workflows, ({ many, one }) => ({
  actions: many(workflow.workflowActions),
  executions: many(workflow.workflowExecutions),
  user: one(identity.users, { fields: [workflow.workflows.createdBy], references: [identity.users.id] }),
}));

export const workflowActionsRelations = relations(workflow.workflowActions, ({ one }) => ({
  workflow: one(workflow.workflows, { fields: [workflow.workflowActions.workflowId], references: [workflow.workflows.id] }),
}));

export const workflowExecutionsRelations = relations(workflow.workflowExecutions, ({ one }) => ({
  workflow: one(workflow.workflows, { fields: [workflow.workflowExecutions.workflowId], references: [workflow.workflows.id] }),
  event: one(system.events, { fields: [workflow.workflowExecutions.eventId], references: [system.events.id] }),
}));

// --- NOTIFICATION MODULE RELATIONS ---
export const notificationsRelations = relations(notification.notifications, ({ one, many }) => ({
  template: one(notification.notificationTemplates, { fields: [notification.notifications.templateId], references: [notification.notificationTemplates.id] }),
  deliveries: many(notification.notificationDeliveries),
}));

export const notificationTemplatesRelations = relations(notification.notificationTemplates, ({ many }) => ({
  notifications: many(notification.notifications),
}));

export const notificationDeliveriesRelations = relations(notification.notificationDeliveries, ({ one }) => ({
  notification: one(notification.notifications, { fields: [notification.notificationDeliveries.notificationId], references: [notification.notifications.id] }),
}));

// --- SYSTEM & OUTBOX MODULE RELATIONS ---
export const eventsRelations = relations(system.events, ({ one }) => ({
  outboxItem: one(system.eventOutbox, { fields: [system.events.id], references: [system.eventOutbox.eventId] }),
}));

export const eventOutboxRelations = relations(system.eventOutbox, ({ one }) => ({
  event: one(system.events, { fields: [system.eventOutbox.eventId], references: [system.events.id] }),
}));

// --- ANALYTICS MODULE RELATIONS ---
export const analyticsSnapshotsRelations = relations(analytics.analyticsSnapshots, ({ one }) => ({
  type: one(analytics.analyticsSnapshotTypes, { fields: [analytics.analyticsSnapshots.snapshotTypeId], references: [analytics.analyticsSnapshotTypes.id] }),
}));

export const analyticsHistoryRelations = relations(analytics.analyticsHistory, ({ one }) => ({
  type: one(analytics.analyticsSnapshotTypes, { fields: [analytics.analyticsHistory.snapshotTypeId], references: [analytics.analyticsSnapshotTypes.id] }),
}));

// --- AI MODULE RELATIONS ---
export const conversationsRelations = relations(ai.conversations, ({ many, one }) => ({
  messages: many(ai.messages),
  memories: many(ai.aiMemories),
  user: one(identity.users, { fields: [ai.conversations.userId], references: [identity.users.id] }),
}));

export const messagesRelations = relations(ai.messages, ({ one }) => ({
  conversation: one(ai.conversations, { fields: [ai.messages.conversationId], references: [ai.conversations.id] }),
}));

export const aiMemoriesRelations = relations(ai.aiMemories, ({ one }) => ({
  conversation: one(ai.conversations, { fields: [ai.aiMemories.conversationId], references: [ai.conversations.id] }),
}));

// 3. Export everything unified to be consumed by db/index.js
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
  // Relational mappings
  usersRelations,
  sessionsRelations,
  devicesRelations,
  businessesRelations,
  businessMembersRelations,
  productsRelations,
  categoriesRelations,
  brandsRelations,
  productImagesRelations,
  inventoryRelations,
  stockMovementsRelations,
  partiesRelations,
  invoicesRelations,
  invoiceItemsRelations,
  paymentsRelations,
  purchasesRelations,
  purchaseItemsRelations,
  supplierPaymentsRelations,
  ledgerAccountsRelations,
  journalEntriesRelations,
  journalLinesRelations,
  expensesRelations,
  rolesRelations,
  rolePermissionsRelations,
  memberRolesRelations,
  workflowsRelations,
  workflowActionsRelations,
  workflowExecutionsRelations,
  notificationsRelations,
  notificationTemplatesRelations,
  notificationDeliveriesRelations,
  eventsRelations,
  eventOutboxRelations,
  analyticsSnapshotsRelations,
  analyticsHistoryRelations,
  conversationsRelations,
  messagesRelations,
  aiMemoriesRelations,
};