import { PermissionResolver } from './PermissionResolver.js';
import { AuthorizationError } from '../errors/index.js';

export class AuthorizationService {
  /**
   * Evaluates if the current execution context has the required permission.
   * @param {string} permissionCode 
   * @param {ExecutionContext} context 
   * @returns {Promise<boolean>}
   */
  static async has(permissionCode, context) {
    if (!context || !context.memberId) return false;

    const userPermissions = await PermissionResolver.resolve(context.memberId);
    return userPermissions.has(permissionCode);
  }

  /**
   * Strictly requires a permission, throwing an error if missing.
   * @param {string} permissionCode 
   * @param {ExecutionContext} context 
   */
  static async require(permissionCode, context) {
    if (!context || !context.memberId) {
      throw new AuthorizationError('Access Denied: Missing business context. Send x-business-id for tenant-scoped permissions.');
    }

    const isAuthorized = await this.has(permissionCode, context);
    if (!isAuthorized) {
      throw new AuthorizationError(`Access Denied: Missing required permission [${permissionCode}]`);
    }
  }

  /**
   * Requires at least one of the provided permissions.
   * @param {string[]} permissionCodes 
   * @param {ExecutionContext} context 
   */
  static async requireAny(permissionCodes, context) {
    if (!context || !context.memberId) {
      throw new AuthorizationError('Access Denied: Unauthenticated or missing business context.');
    }

    const userPermissions = await PermissionResolver.resolve(context.memberId);
    const hasAny = permissionCodes.some(code => userPermissions.has(code));

    if (!hasAny) {
      throw new AuthorizationError(`Access Denied: Requires one of [${permissionCodes.join(', ')}]`);
    }
  }

  /**
   * Requires all of the provided permissions.
   * @param {string[]} permissionCodes 
   * @param {ExecutionContext} context 
   */
  static async requireAll(permissionCodes, context) {
    if (!context || !context.memberId) {
      throw new AuthorizationError('Access Denied: Unauthenticated or missing business context.');
    }

    const userPermissions = await PermissionResolver.resolve(context.memberId);
    const hasAll = permissionCodes.every(code => userPermissions.has(code));

    if (!hasAll) {
      throw new AuthorizationError(`Access Denied: Requires all of [${permissionCodes.join(', ')}]`);
    }
  }
  static resolveEffectivePermissions(rawPermissionCodes) {
  return [...new Set(rawPermissionCodes)];
}
}
