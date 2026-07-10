import { db } from '@/db/index.js';
import { roles } from '../../../../db/schema/security.js';
import { eq, or, isNull } from 'drizzle-orm';
import { withExecutionContext } from '../../../../infrastructure/context/withExecutionContext.js';
import { withPermission } from '../../../../infrastructure/context/withPermission.js';
import { withApiHandler } from '../../../../infrastructure/context/withApiHandler.js';

export const GET = withExecutionContext(
  withPermission(
    'team.read',
    withApiHandler(async (req, { executionContext }) => {
      const result = await db.select().from(roles)
        .where(
          or(
            eq(roles.businessId, executionContext.businessId),
            isNull(roles.businessId)
          )
        );

      return Response.json({ success: true, count: result.length, data: result });
    })
  )
);
