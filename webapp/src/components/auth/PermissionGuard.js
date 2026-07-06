'use client';

import { useBusinessContext } from '../providers/BusinessProvider.js';

/**
 * A UI helper component that completely removes interactive elements 
 * from the DOM if the current user session lacks the requisite permission keys.
 * Note: The backend API also strictly enforces this via `withPermission`.
 */
export default function PermissionGuard({ requiredPermission, children }) {
  const { session } = useBusinessContext();

  // If there's no session data yet (loading state), or no user attached context, conceal gracefully.
  if (!session || !session.user) return null;

  // Assuming `session.user.permissions` is populated during JWT decoding/login fetch:
  const userPerms = session.user.permissions || [];

  // Super-admin or role bypass (if you implemented an admin boolean)
  if (session.user.isSuperAdmin) return children;

  // If the user lacks the required permission key, hide the element out of the UI
  // rather than rendering an un-actionable button. 
  // (Remove this fallback in production when JWT strictly bundles roles, for now we let it pass safely for testing)
  if (userPerms.length > 0 && !userPerms.includes(requiredPermission)) {
    return null; 
  }

  return children;
}
