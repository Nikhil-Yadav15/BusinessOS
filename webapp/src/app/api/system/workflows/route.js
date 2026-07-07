import { CreateWorkflowOperation } from '../../../../application/operations/workflows/CreateWorkflowOperation.js';
import { withExecutionContext } from '../../../../infrastructure/context/withExecutionContext.js';
import { withPermission } from '../../../../infrastructure/context/withPermission.js';
import { withApiHandler } from '../../../../infrastructure/context/withApiHandler.js';
import { StandardResponse } from '../../../../application/common/StandardResponse.js';
import { db } from '../../../../db/index.js';
import { workflows } from '../../../../db/schema/workflow.js';
import { eq, desc } from 'drizzle-orm';

export const POST = withExecutionContext(
  // Restriction: Only users with system-level configuration rights can alter IFTTT background engines!
  withPermission(
    'system.workflows.write',
    withApiHandler(async (req, { executionContext }) => {
      const input = await req.json();
      const result = await new CreateWorkflowOperation().execute(executionContext, input);
      return Response.json(StandardResponse.success(result), { status: 201 });
    })
  )
);

export const GET = withExecutionContext(
  withApiHandler(async (req, { executionContext }) => {
    const rules = await db.select().from(workflows)
      .where(eq(workflows.businessId, executionContext.businessId))
      .orderBy(desc(workflows.createdAt));
      
    return Response.json(StandardResponse.success(rules));
  })
);
