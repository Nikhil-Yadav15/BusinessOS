import { roles, permissions, rolePermissions, memberRoles } from '../../db/schema/security.js';
import { generateId } from '../../infrastructure/id/uuid.js';
import { BaseRepository } from './BaseRepository.js';
import { eq, and,inArray } from 'drizzle-orm';
export class RoleRepository extends BaseRepository {
  
  static async getAllPermissions(tx) {
    const conn = this.getDB(tx);
    return await conn.select().from(permissions);
  }

  static async getMemberRoles(businessMemberId, tx) {
    const conn = this.getDB(tx);

    return await conn
      .select({
        id: roles.id,
        name: roles.name,
        isSystem: roles.isSystem,
        status: roles.status,
      })
      .from(memberRoles)
      .innerJoin(
        roles,
        eq(memberRoles.roleId, roles.id)
      )
      .where(
        eq(memberRoles.businessMemberId, businessMemberId)
      );
  }

  static async createRoles(rolesData, tx) {
    const conn = this.getDB(tx);
    const rolesToInsert = rolesData.map(role => ({
      id: generateId(),
      ...role,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    
    return await conn.insert(roles).values(rolesToInsert).returning();
  }

  static async createRolePermissions(mappings, tx) {
    if (!mappings || mappings.length === 0) return [];
    
    const conn = this.getDB(tx);
    const mappingsToInsert = mappings.map(mapping => ({
      id: generateId(),
      ...mapping,
      createdAt: new Date(),
    }));
    
    return await conn.insert(rolePermissions).values(mappingsToInsert).returning();
  }

  static async assignMemberRole(data, tx) {
    const conn = this.getDB(tx);
    const [memberRole] = await conn.insert(memberRoles).values({
      id: generateId(),
      ...data,
      assignedAt: new Date(),
    }).returning();
    return memberRole;
  }
  static async findByNameAndBusiness(roleName, businessId, tx) {
    const conn = this.getDB(tx);
    const [role] = await conn.select()
      .from(roles)
      .where(and(
        eq(roles.name, roleName), 
        eq(roles.businessId, businessId)
      ))
      .limit(1);
    return role || null;
  }
  static async getMemberRolesAndPermissions(businessMemberId, tx) {
    const conn = this.getDB(tx);

    // 1. Fetch assigned roles
    const assignedRoles = await conn.select({
      id: roles.id,
      name: roles.name,
      isSystem: roles.isSystem
    })
    .from(memberRoles)
    .innerJoin(roles, eq(memberRoles.roleId, roles.id))
    .where(eq(memberRoles.businessMemberId, businessMemberId));

    if (assignedRoles.length === 0) {
      return { roles: [], permissions: [] };
    }

    const roleIds = assignedRoles.map(r => r.id);

    // 2. Fetch all unique permissions for those roles
    const resolvedPermissions = await conn.select({
      code: permissions.code
    })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(inArray(rolePermissions.roleId, roleIds));

    // Extract just the string codes and deduplicate (in case multiple roles grant the same permission)
    const uniquePermissionCodes = [...new Set(resolvedPermissions.map(p => p.code))];

    return {
      roles: assignedRoles,
      permissions: uniquePermissionCodes
    };
  }
  // Fetch raw roles and their linked permission codes for a member
  static async getRawMemberData(businessMemberId, tx) {
    const conn = this.getDB(tx);
    
    // Fetch roles
    const rolesData = await conn.select({
      id: roles.id,
      name: roles.name
    })
    .from(memberRoles)
    .innerJoin(roles, eq(memberRoles.roleId, roles.id))
    .where(eq(memberRoles.businessMemberId, businessMemberId));

    // Fetch raw permission codes linked to those roles
    const roleIds = rolesData.map(r => r.id);
    const permsData = await conn.select({
      permissionCode: permissions.code
    })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(inArray(rolePermissions.roleId, roleIds));

    return { roles: rolesData, permissions: permsData.map(p => p.permissionCode) };
  }
  static async removeMemberRoles(businessMemberId, tx) {
    const conn = this.getDB(tx);

    await conn
      .delete(memberRoles)
      .where(eq(memberRoles.businessMemberId, businessMemberId));
  }
  static async findByIdAndBusiness(roleId, businessId, tx) {
    const conn = this.getDB(tx);

    const [role] = await conn
      .select()
      .from(roles)
      .where(
        and(
          eq(roles.id, roleId),
          eq(roles.businessId, businessId)
        )
      )
      .limit(1);

    return role || null;
  }
  static async memberHasSystemRole(businessMemberId, tx) {
    const roles = await this.getMemberRoles(businessMemberId, tx);
    return roles.some(role => role.isSystem);
  }
  /**
 * Replaces all existing roles for a member with a single new role.
 * Entire operation runs inside the caller's transaction.
 */
static async replaceMemberRole(
  {
    businessMemberId,
    roleId,
    assignedBy
  },
  tx
) {
  const conn = this.getDB(tx);

  // Remove previous assignments
  await conn
    .delete(memberRoles)
    .where(
      eq(
        memberRoles.businessMemberId,
        businessMemberId
      )
    );

  // Assign the new role
  const [mapping] = await conn
    .insert(memberRoles)
    .values({
      id: generateId(),
      businessMemberId,
      roleId,
      assignedBy,
      assignedAt: new Date()
    })
    .returning();

  return mapping;
}

}
