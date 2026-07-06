import { roles, permissions, rolePermissions, memberRoles } from '../../db/schema/security.js';
import { generateId } from '../../infrastructure/id/uuid.js';
import { BaseRepository } from './BaseRepository.js';

export class RoleRepository extends BaseRepository {
  
  static async getAllPermissions(tx) {
    const conn = this.getDB(tx);
    return await conn.select().from(permissions);
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
}