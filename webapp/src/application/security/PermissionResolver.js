import { AuthorizationRepository } from '../../persistence/repositories/AuthorizationRepository.js';

export class PermissionResolver {
  /**
   * Resolves the permission set for a given member. 
   * Represents the future caching boundary.
   * @param {string} memberId 
   * @returns {Promise<Set<string>>}
   */
  static async resolve(memberId) {
    if (!memberId) {
      return new Set();
    }

    const permissionCodes = await AuthorizationRepository.getPermissionsForMember(memberId);
    
    // Returning a Set makes lookups O(1) in the AuthorizationService
    return new Set(permissionCodes);
  }
}