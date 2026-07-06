import { SelectBusinessOperation } from '../../../../application/operations/auth/SelectBusinessOperation.js';
import { withExecutionContext } from '../../../../infrastructure/context/withExecutionContext.js';
import { withApiHandler } from '../../../../infrastructure/context/withApiHandler.js';

export const POST = withExecutionContext(
  withApiHandler(async (req, { executionContext }) => {
    
    // No payload required for business selection resolution
    const result = await new SelectBusinessOperation().execute(executionContext, {});

    return Response.json(result, { status: 200 });
  })
);