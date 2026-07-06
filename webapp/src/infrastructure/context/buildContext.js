import { ExecutionContext } from './ExecutionContext.js';
import { verifyToken } from '../auth/jwt.js'; // Your JWT verification utility
import { db } from '../../db/index.js';
import { business_member } from '../../db/schema/business.js'; // Adjust based on exact Drizzle export
import { and, eq } from 'drizzle-orm';

/**
 * Parses the incoming HTTP request and securely constructs the Execution Context.
 * @param {Request} req - The Next.js standard Request object
 * @returns {Promise<ExecutionContext>}
 */
export async function buildContext(req) {
  // 1. Establish Identity (GW-002)
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized: Missing or invalid token');
  }

  const token = authHeader.split(' ')[1];
  const decoded = await verifyToken(token); // Expected to return { userId, sessionId }

  // 2. Resolve Business Tenant (GW-003)
  // The client passes the active business ID via a custom header
  const businessId = req.headers.get('x-business-id') || null;
  let memberId = null;

  // 3. Validate Business Membership (MT-004)
  if (businessId) {
    const memberRecord = await db.query.business_member.findFirst({
      where: and(
        eq(business_member.business_id, businessId),
        eq(business_member.user_id, decoded.userId),
        eq(business_member.status, 'ACTIVE')
      )
    });

    if (!memberRecord) {
      throw new Error('Forbidden: User is not an active member of this business');
    }

    memberId = memberRecord.id;
  }

  // 4. Return the Immutable Execution Context (GW-004)
  return new ExecutionContext({
    userId: decoded.userId,
    sessionId: decoded.sessionId,
    businessId: businessId,
    memberId: memberId
  });
}