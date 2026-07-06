import { ListPurchasesOperation } from '../../../../application/operations/purchasing/purchases/ListPurchasesOperation.js';
import { CreatePurchaseOperation } from '../../../../application/operations/purchasing/purchases/CreatePurchaseOperation.js';
import { withExecutionContext } from '../../../../infrastructure/context/withExecutionContext.js';
import { withPermission } from '../../../../infrastructure/context/withPermission.js';
import { withApiHandler } from '../../../../infrastructure/context/withApiHandler.js';
import { StandardResponse } from '../../../../application/common/StandardResponse.js';

export const GET = withExecutionContext(
  withPermission(
    'purchasing.purchase.read',
    withApiHandler(async (req, { executionContext }) => {
      const { searchParams } = new URL(req.url);
      
      const result = await new ListPurchasesOperation().execute(
        executionContext,
        {
          page: searchParams.get('page') || undefined,
          limit: searchParams.get('limit') || undefined,
          sortBy: searchParams.get('sortBy') || undefined,
          sortOrder: searchParams.get('sortOrder') || undefined,
          filters: {
            status: searchParams.get('status') || undefined,
            supplierId: searchParams.get('supplierId') || undefined
          }
        }
      );

      return Response.json(StandardResponse.success(result));
    })
  )
);

export const POST = withExecutionContext(
  withPermission(
    'purchasing.purchase.write',
    withApiHandler(async (req, { executionContext }) => {
      const payload = await req.json();
      const result = await new CreatePurchaseOperation().execute(
        executionContext,
        payload
      );
      return Response.json(StandardResponse.success(result), { status: 201 });
    })
  )
);
