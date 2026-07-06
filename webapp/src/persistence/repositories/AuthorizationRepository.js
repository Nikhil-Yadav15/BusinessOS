import { eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { member_role, roles, permissions, role_permission } from '../../db/schema/security.js';
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
    .from(member_role)
    .innerJoin(roles, eq(member_role.role_id, roles.id))
    .innerJoin(role_permission, eq(roles.id, role_permission.role_id))
    .innerJoin(permissions, eq(role_permission.permission_id, permissions.id))
    .where(eq(member_role.business_member_id, memberId));

    // Map to a distinct array of string codes
    return [...new Set(result.map(row => row.permissionCode))];
  }
}