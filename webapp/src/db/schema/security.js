// role, permission, role_permission, member_role
import { 
  pgTable, 
  uuid, 
  varchar, 
  text, 
  timestamp, 
  boolean,
  pgEnum,
  unique,
  index
} from 'drizzle-orm/pg-core';
import { businesses, businessMembers } from './business.js';
import { users } from './identity.js';
import { generateId, foreignBusinessId, timestamps } from './helpers.js';

export const roleStatusEnum = pgEnum('role_status', ['ACTIVE', 'INACTIVE']);

export const roles = pgTable('role', {
  id: generateId(),
  businessId: uuid('business_id').references(() => businesses.id), // Nullable for global system roles
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  isSystem: boolean('is_system').notNull().default(false), // System roles cannot be modified
  status: roleStatusEnum('status').notNull().default('ACTIVE'),
  ...timestamps,
}, (table) => ({
  // Blueprint: UNIQUE (business_id, name)
  businessNameUnique: unique('role_business_name_unique').on(table.businessId, table.name),
  businessIdx: index('role_business_idx').on(table.businessId),
  statusIdx: index('role_status_idx').on(table.status),
}));

export const permissions = pgTable('permission', {
  id: generateId(),
  code: varchar('code', { length: 100 }).notNull().unique(), // e.g., 'sales.create_invoice'
  name: varchar('name', { length: 150 }).notNull(),
  description: text('description'),
  createdAt: timestamps.createdAt,
});

export const rolePermissions = pgTable('role_permission', {
  id: generateId(),
  roleId: uuid('role_id').notNull().references(() => roles.id),
  permissionId: uuid('permission_id').notNull().references(() => permissions.id),
  createdAt: timestamps.createdAt,
}, (table) => ({
  // Blueprint: UNIQUE (role_id, permission_id)
  rolePermissionUnique: unique('rp_role_permission_unique').on(table.roleId, table.permissionId),
  roleIdx: index('rp_role_idx').on(table.roleId),
  permissionIdx: index('rp_permission_idx').on(table.permissionId),
}));

export const memberRoles = pgTable('member_role', {
  id: generateId(),
  businessMemberId: uuid('business_member_id').notNull().references(() => businessMembers.id),
  roleId: uuid('role_id').notNull().references(() => roles.id),
  assignedBy: uuid('assigned_by').references(() => users.id), // Nullable per blueprint
  assignedAt: timestamp('assigned_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  // Blueprint: UNIQUE (business_member_id, role_id)
  memberRoleUnique: unique('mr_member_role_unique').on(table.businessMemberId, table.roleId),
  memberIdx: index('mr_member_idx').on(table.businessMemberId),
  roleIdx: index('mr_role_idx').on(table.roleId),
}));