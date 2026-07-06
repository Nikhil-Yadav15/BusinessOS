import { ExecutionContext } from './ExecutionContext.js';
import { verifyToken } from '../auth/jwt.js'; 
import { db } from '../../db/index.js';
import { businessMembers } from '../../db/schema/business.js'; 
import { and, eq } from 'drizzle-orm';
import { generateId } from '../id/uuid.js';

function buildRequestMetadata(req) {
  return {
    correlationId: req.headers.get('x-correlation-id') || generateId(),
    ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
    userAgent: req.headers.get('user-agent') || 'unknown',
  };
}

export function buildAnonymousContext(req) {
  return new ExecutionContext({
    userId: null,
    sessionId: null,
    businessId: null,
    memberId: null,
    metadata: buildRequestMetadata(req),
  });
}

/**
 * Parses the incoming HTTP request and securely constructs the Execution Context.
 * @param {Request} req - The Next.js standard Request object
 * @returns {Promise<ExecutionContext>}
 */
export async function buildContext(req) {
  // 1. Establish Request Metadata & Correlation ID (Cross-Cutting Concerns)
  // Accept from header if internal microservice, otherwise generate fresh
  const metadata = buildRequestMetadata(req);

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
    const memberRecord = await db.query.businessMembers.findFirst({
      where: and(
        eq(businessMembers.businessId, requestedBusinessId),
        eq(businessMembers.userId, decoded.userId),
        eq(businessMembers.status, 'ACTIVE')
      )
    });

    if (!memberRecord) {
      throw new Error('Forbidden: User is not an active member of this business');
    }

    // Backend assumes authority only after validation
    authoritativeBusinessId = memberRecord.businessId;
    authoritativeMemberId = memberRecord.id;
  }

  // 4. Return the Immutable Execution Context (GW-004)
  return new ExecutionContext({
    userId: decoded.userId,
    sessionId: decoded.sessionId,
    businessId: authoritativeBusinessId,
    memberId: authoritativeMemberId,
    metadata
  });
}
