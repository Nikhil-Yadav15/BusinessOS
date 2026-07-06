import { CreateWorkflowOperation } from '../../../../application/operations/workflows/CreateWorkflowOperation.js';
import { withExecutionContext } from '../../../../infrastructure/context/withExecutionContext.js';
import { withPermission } from '../../../../infrastructure/context/withPermission.js';
import { withApiHandler } from '../../../../infrastructure/context/withApiHandler.js';
import { StandardResponse } from '../../../../application/common/StandardResponse.js';

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
