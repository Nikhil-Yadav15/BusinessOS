import { GetCategoryOperation } from '../../../../../application/operations/catalog/categories/GetCategoryOperation.js';
import { UpdateCategoryOperation } from '../../../../../application/operations/catalog/categories/UpdateCategoryOperation.js';
import { DeleteCategoryOperation } from '../../../../../application/operations/catalog/categories/DeleteCategoryOperation.js';
import { withExecutionContext } from '../../../../../infrastructure/context/withExecutionContext.js';
import { withPermission } from '../../../../../infrastructure/context/withPermission.js';
import { withApiHandler } from '../../../../../infrastructure/context/withApiHandler.js';
import { StandardResponse } from '../../../../../application/common/StandardResponse.js';

export const GET = withExecutionContext(
  withPermission(
    'catalog.category.read',
    withApiHandler(async (req, { executionContext, params }) => {
      const result = await new GetCategoryOperation().execute(
        executionContext,
        { id: params.id }
      );
      return Response.json(StandardResponse.success(result));
    })
  )
);

export const PATCH = withExecutionContext(
  withPermission(
    'catalog.category.write',
    withApiHandler(async (req, { executionContext, params }) => {
      const payload = await req.json();
      const result = await new UpdateCategoryOperation().execute(
        executionContext,
        { id: params.id, data: payload }
      );
      return Response.json(StandardResponse.success(result));
    })
  )
);

export const DELETE = withExecutionContext(
  withPermission(
    'catalog.category.delete',
    withApiHandler(async (req, { executionContext, params }) => {
      const result = await new DeleteCategoryOperation().execute(
        executionContext,
        { id: params.id }
      );
      return Response.json(StandardResponse.success(result));
    })
  )
);
