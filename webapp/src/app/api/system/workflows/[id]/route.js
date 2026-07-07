import { withExecutionContext } from '../../../../../infrastructure/context/withExecutionContext.js';
import { withApiHandler } from '../../../../../infrastructure/context/withApiHandler.js';
import { StandardResponse } from '../../../../../application/common/StandardResponse.js';
import { db } from '../../../../../db/index.js';
import { workflows } from '../../../../../db/schema/workflow.js';
import { eq, and } from 'drizzle-orm';

export const PATCH = withExecutionContext(
  withApiHandler(async (req, { params, executionContext }) => {
    // Await params per Next.js 16 dynamic routing patterns
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const body = await req.json();

    if (typeof body.isEnabled !== 'boolean') {
      throw new Error("Invalid payload. Expected { isEnabled: boolean }.");
    }

    await db.update(workflows)
      .set({ isEnabled: body.isEnabled, updatedAt: new Date() })
      .where(and(eq(workflows.id, id), eq(workflows.businessId, executionContext.businessId)));
      
    const updated = await db.select().from(workflows).where(eq(workflows.id, id));
    
    return Response.json(StandardResponse.success(updated[0]));
  })
);
