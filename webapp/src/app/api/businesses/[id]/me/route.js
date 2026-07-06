import { GetTenantContextOperation } from '../../../../../application/operations/business/GetTenantContextOperation.js';
import { withExecutionContext } from '../../../../../infrastructure/context/withExecutionContext.js';
import { withApiHandler } from '../../../../../infrastructure/context/withApiHandler.js';

export const GET = withExecutionContext(
  withApiHandler(async (req, { executionContext, params }) => {
    
    // params.id comes from the folder name [id] in Next.js App Router
    const { id } = await params;

    const result = await new GetTenantContextOperation().execute(executionContext, { 
      businessId: id 
    });

    return Response.json(result, { status: 200 });
  })
);