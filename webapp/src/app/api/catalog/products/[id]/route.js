import { GetProductOperation } from '../../../../../application/operations/catalog/products/GetProductOperation.js';
import { UpdateProductOperation } from '../../../../../application/operations/catalog/products/UpdateProductOperation.js';
import { DeleteProductOperation } from '../../../../../application/operations/catalog/products/DeleteProductOperation.js';
import { withExecutionContext } from '../../../../../infrastructure/context/withExecutionContext.js';
import { withPermission } from '../../../../../infrastructure/context/withPermission.js';
import { withApiHandler } from '../../../../../infrastructure/context/withApiHandler.js';
import { StandardResponse } from '../../../../../application/common/StandardResponse.js';

export const GET = withExecutionContext(
  withPermission(
    'catalog.product.read',
    withApiHandler(async (req, { executionContext, params }) => {
      const result = await new GetProductOperation().execute(
        executionContext,
        { id: params.id }
      );
      return Response.json(StandardResponse.success(result));
    })
  )
);

export const PATCH = withExecutionContext(
  withPermission(
    'catalog.product.write',
    withApiHandler(async (req, { executionContext, params }) => {
      const payload = await req.json();
      const result = await new UpdateProductOperation().execute(
        executionContext,
        { id: params.id, data: payload }
      );
      return Response.json(StandardResponse.success(result));
    })
  )
);

export const DELETE = withExecutionContext(
  withPermission(
    'catalog.product.delete',
    withApiHandler(async (req, { executionContext, params }) => {
      const result = await new DeleteProductOperation().execute(
        executionContext,
        { id: params.id }
      );
      return Response.json(StandardResponse.success(result));
    })
  )
);
