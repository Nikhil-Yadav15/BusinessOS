import { GetPurchaseOperation } from '../../../../../application/operations/purchasing/purchases/GetPurchaseOperation.js';
import { withExecutionContext } from '../../../../../infrastructure/context/withExecutionContext.js';
import { withPermission } from '../../../../../infrastructure/context/withPermission.js';
import { withApiHandler } from '../../../../../infrastructure/context/withApiHandler.js';
import { StandardResponse } from '../../../../../application/common/StandardResponse.js';

export const GET = withExecutionContext(
  withPermission(
    'purchasing.purchase.read',
    withApiHandler(async (req, { executionContext, params }) => {
      const result = await new GetPurchaseOperation().execute(
        executionContext,
        { id: params.id }
      );
      return Response.json(StandardResponse.success(result));
    })
  )
);
