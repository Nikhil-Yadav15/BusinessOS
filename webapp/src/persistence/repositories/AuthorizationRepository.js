import { eq } from 'drizzle-orm';
import { memberRoles, roles, permissions, rolePermissions } from '../../db/schema/security.js';
import { BaseRepository } from './BaseRepository.js';

export class AuthorizationRepository extends BaseRepository {
  /**
   * Retrieves all unique permission codes for a specific business member.
   * @param {string} memberId 
   * @param {Object} [tx] 
   * @returns {Promise<string[]>}
   */
  static async getPermissionsForMember(memberId, tx) {
    const conn = this.getDB(tx);

    const result = await conn.select({
      permissionCode: permissions.code
    })
    .from(memberRoles)
    .innerJoin(roles, eq(memberRoles.roleId, roles.id))
    .innerJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(memberRoles.businessMemberId, memberId));

    // Map to a distinct array of string codes
    return [...new Set(result.map(row => row.permissionCode))];
  }
}
