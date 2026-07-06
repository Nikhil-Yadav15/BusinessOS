import { CreateBusinessOperation } from '../../../application/operations/business/CreateBusinessOperation.js';
import { ListUserBusinessesOperation } from '../../../application/operations/business/ListUserBusinessesOperation.js';
import { withExecutionContext } from '../../../infrastructure/context/withExecutionContext.js';
import { withApiHandler } from '../../../infrastructure/context/withApiHandler.js';

// CREATE A NEW BUSINESS
export const POST = withExecutionContext(
  withApiHandler(async (req, { executionContext }) => {
    const payload = await req.json();
    const result = await new CreateBusinessOperation().execute(executionContext, payload);
    return Response.json(result, { status: 201 });
  })
);

// LIST MY BUSINESSES
export const GET = withExecutionContext(
  withApiHandler(async (req, { executionContext }) => {
    // No payload needed, everything derives from the authenticated context
    const result = await new ListUserBusinessesOperation().execute(executionContext, {});
    return Response.json(result, { status: 200 });
  })
);