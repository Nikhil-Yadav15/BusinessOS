import { withExecutionContext } from '../../../../infrastructure/context/withExecutionContext.js';
import { withApiHandler } from '../../../../infrastructure/context/withApiHandler.js';
import { StandardResponse } from '../../../../application/common/StandardResponse.js';
import { NotificationRepository } from '../../../../persistence/repositories/NotificationRepository.js';
import { db } from '../../../../db/index.js';
import { notifications } from '../../../../db/schema/notification.js';
import { eq, desc } from 'drizzle-orm';

export const GET = withExecutionContext(
  withApiHandler(async (req, { executionContext }) => {
    const { businessId } = executionContext;
    if (!businessId) {
      return Response.json(StandardResponse.success([]));
    }
    const results = await db
      .select()
      .from(notifications)
      .where(eq(notifications.businessId, businessId))
      .orderBy(desc(notifications.createdAt))
      .limit(10);

    return Response.json(StandardResponse.success(results));
  })
);
