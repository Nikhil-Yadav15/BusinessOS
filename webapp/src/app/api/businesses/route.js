import { CreateBusinessOperation } from '../../../application/operations/business/CreateBusinessOperation.js';
import { withExecutionContext } from '../../../infrastructure/context/withExecutionContext.js';
import { withApiHandler } from '../../../infrastructure/context/withApiHandler.js';

export const POST = withExecutionContext(
  withApiHandler(async (req, { executionContext }) => {
    
    const payload = await req.json();

    const result = await new CreateBusinessOperation().execute(executionContext, payload);

    return Response.json(result, { status: 201 });
  })
);