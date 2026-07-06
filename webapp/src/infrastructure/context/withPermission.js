import { AuthorizationService } from '../../application/security/AuthorizationService.js';
import { AuthorizationError } from '../../application/errors/index.js';

/**
 * Higher-order Next.js route wrapper to enforce RBAC.
 * Must be composed INSIDE withExecutionContext.
 * 
 * Example: export const POST = withExecutionContext(withPermission('sales.create_invoice', handler));
 * 
 * @param {string} permissionCode - The required permission
 * @param {Function} handler - The Next.js route handler
 */
export function withPermission(permissionCode, handler) {
  return async (req, context) => {
    try {
      const { executionContext } = context;

      if (!executionContext) {
        throw new Error('Server Error: withPermission must be wrapped by withExecutionContext');
      }

      // Enforce authorization before allowing the route to proceed
      await AuthorizationService.require(permissionCode, executionContext);

      // Pass control to the actual route handler
      return await handler(req, context);
      
    } catch (error) {
      console.error(`[Permission Guard] Failed: ${error.message}`);
      
      const status = error instanceof AuthorizationError ? 403 : 500;
      return new Response(
        JSON.stringify({ error: error.message }), 
        { status, headers: { 'Content-Type': 'application/json' } }
      );
    }
  };
}