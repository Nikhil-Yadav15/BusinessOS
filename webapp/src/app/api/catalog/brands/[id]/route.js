import { GetBrandOperation } from '../../../../../application/operations/catalog/brands/GetBrandOperation.js';
import { UpdateBrandOperation } from '../../../../../application/operations/catalog/brands/UpdateBrandOperation.js';
import { DeleteBrandOperation } from '../../../../../application/operations/catalog/brands/DeleteBrandOperation.js';
import { withExecutionContext } from '../../../../../infrastructure/context/withExecutionContext.js';
import { withPermission } from '../../../../../infrastructure/context/withPermission.js';
import { withApiHandler } from '../../../../../infrastructure/context/withApiHandler.js';
import { StandardResponse } from '../../../../../application/common/StandardResponse.js';

export const GET = withExecutionContext(
  withPermission(
    'catalog.brand.read',
    withApiHandler(async (req, { executionContext, params }) => {
      const result = await new GetBrandOperation().execute(
        executionContext,
        { id: params.id }
      );
      return Response.json(StandardResponse.success(result));
    })
  )
);

export const PATCH = withExecutionContext(
  withPermission(
    'catalog.brand.write',
    withApiHandler(async (req, { executionContext, params }) => {
      const payload = await req.json();
      const result = await new UpdateBrandOperation().execute(
        executionContext,
        { id: params.id, data: payload }
      );
      return Response.json(StandardResponse.success(result));
    })
  )
);

export const DELETE = withExecutionContext(
  withPermission(
    'catalog.brand.delete',
    withApiHandler(async (req, { executionContext, params }) => {
      const result = await new DeleteBrandOperation().execute(
        executionContext,
        { id: params.id }
      );
      return Response.json(StandardResponse.success(result));
    })
  )
);
