import { ExecutionContext } from './ExecutionContext.js';
import { verifyToken } from '../auth/jwt.js'; 
import { db } from '../../db/index.js';
import { business_member } from '../../db/schema/business.js'; 
import { and, eq } from 'drizzle-orm';
import { generateId } from '../id/uuid.js';

/**
 * Parses the incoming HTTP request and securely constructs the Execution Context.
 * @param {Request} req - The Next.js standard Request object
 * @returns {Promise<ExecutionContext>}
 */
export async function buildContext(req) {
  // 1. Establish Request Metadata & Correlation ID (Cross-Cutting Concerns)
  // Accept from header if internal microservice, otherwise generate fresh
  const correlationId = req.headers.get('x-correlation-id') || generateId();
  const ipAddress = req.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';

  // 2. Establish Identity (GW-002)
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized: Missing or invalid token');
  }

  const token = authHeader.split(' ')[1];
  const decoded = await verifyToken(token); 

  // 3. Resolve Business Tenant (MT-005)
  // The client provides a hint; the backend enforces authority.
  const requestedBusinessId = req.headers.get('x-business-id') || null;
  let authoritativeBusinessId = null;
  let authoritativeMemberId = null;

  if (requestedBusinessId) {
    // Validate Business Membership (MT-004)
    const memberRecord = await db.query.business_member.findFirst({
      where: and(
        eq(business_member.business_id, requestedBusinessId),
        eq(business_member.user_id, decoded.userId),
        eq(business_member.status, 'ACTIVE')
      )
    });

    if (!memberRecord) {
      throw new Error('Forbidden: User is not an active member of this business');
    }

    // Backend assumes authority only after validation
    authoritativeBusinessId = memberRecord.business_id;
    authoritativeMemberId = memberRecord.id;
  }

  // 4. Return the Immutable Execution Context (GW-004)
  return new ExecutionContext({
    userId: decoded.userId,
    sessionId: decoded.sessionId,
    businessId: authoritativeBusinessId,
    memberId: authoritativeMemberId,
    metadata: {
      correlationId,
      ipAddress,
      userAgent
    }
  });
}