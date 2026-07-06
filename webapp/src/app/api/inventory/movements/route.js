import { ListStockMovementsOperation } from '../../../application/operations/inventory/ListStockMovementsOperation.js';
import { withExecutionContext } from '../../../infrastructure/context/withExecutionContext.js';
import { withPermission } from '../../../infrastructure/context/withPermission.js';
import { withApiHandler } from '../../../infrastructure/context/withApiHandler.js';
import { StandardResponse } from '../../../application/common/StandardResponse.js';

export const GET = withExecutionContext(
  withPermission(
    'inventory.read',
    withApiHandler(async (req, { executionContext }) => {
      const { searchParams } = new URL(req.url);
      const result = await new ListStockMovementsOperation().execute(
        executionContext,
        {
          page: searchParams.get('page') || 1,
          limit: searchParams.get('limit') || 50,
        }
      );
      return Response.json(StandardResponse.success(result));
    })
  )
);
