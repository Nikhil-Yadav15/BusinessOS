import { ListInventoryOperation } from '../../../application/operations/inventory/ListInventoryOperation.js';
import { withExecutionContext } from '../../../infrastructure/context/withExecutionContext.js';
import { withPermission } from '../../../infrastructure/context/withPermission.js';
import { withApiHandler } from '../../../infrastructure/context/withApiHandler.js';
import { StandardResponse } from '../../../application/common/StandardResponse.js';

// GET /api/inventory
export const GET = withExecutionContext(
  withPermission(
    'inventory.read',
    withApiHandler(async (req, { executionContext }) => {
      const { searchParams } = new URL(req.url);
      
      const result = await new ListInventoryOperation().execute(
        executionContext,
        {
          page: searchParams.get('page') || undefined,
          limit: searchParams.get('limit') || undefined,
          sortBy: searchParams.get('sortBy') || undefined,
          sortOrder: searchParams.get('sortOrder') || undefined,
          filters: {
            productId: searchParams.get('productId') || undefined
          }
        }
      );

      return Response.json(StandardResponse.success(result));
    })
  )
);
