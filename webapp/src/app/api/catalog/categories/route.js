import { ListCategoriesOperation } from '../../../../application/operations/catalog/categories/ListCategoriesOperation.js';
import { CreateCategoryOperation } from '../../../../application/operations/catalog/categories/CreateCategoryOperation.js';
import { withExecutionContext } from '../../../../infrastructure/context/withExecutionContext.js';
import { withPermission } from '../../../../infrastructure/context/withPermission.js';
import { withApiHandler } from '../../../../infrastructure/context/withApiHandler.js';
import { StandardResponse } from '../../../../application/common/StandardResponse.js';

// Note: Catalog permissions need to be inserted in Seed script (e.g., catalog.category.read)
// We assume they will be added, using standard format here.
export const GET = withExecutionContext(
  withPermission(
    'catalog.category.read',
    withApiHandler(async (req, { executionContext }) => {
      const { searchParams } = new URL(req.url);
      
      const result = await new ListCategoriesOperation().execute(
        executionContext,
        {
          page: searchParams.get('page') || undefined,
          limit: searchParams.get('limit') || undefined,
          sortBy: searchParams.get('sortBy') || undefined,
          sortOrder: searchParams.get('sortOrder') || undefined,
          filters: {
            status: searchParams.get('status') || undefined
          }
        }
      );

      return Response.json(StandardResponse.success(result));
    })
  )
);

export const POST = withExecutionContext(
  withPermission(
    'catalog.category.write',
    withApiHandler(async (req, { executionContext }) => {
      const payload = await req.json();

      const result = await new CreateCategoryOperation().execute(
        executionContext,
        payload
      );

      return Response.json(StandardResponse.success(result), { status: 201 });
    })
  )
);
