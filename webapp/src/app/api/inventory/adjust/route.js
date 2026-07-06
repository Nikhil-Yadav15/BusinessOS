import { AdjustStockOperation } from '../../../../application/operations/inventory/AdjustStockOperation.js';
import { withExecutionContext } from '../../../../infrastructure/context/withExecutionContext.js';
import { withPermission } from '../../../../infrastructure/context/withPermission.js';
import { withApiHandler } from '../../../../infrastructure/context/withApiHandler.js';
import { StandardResponse } from '../../../../application/common/StandardResponse.js';

// POST /api/inventory/adjust
export const POST = withExecutionContext(
  withPermission(
    'inventory.adjust',
    withApiHandler(async (req, { executionContext }) => {
      const payload = await req.json();

      const result = await new AdjustStockOperation().execute(
        executionContext,
        payload
      );

      return Response.json(StandardResponse.success(result), { status: 201 });
    })
  )
);
