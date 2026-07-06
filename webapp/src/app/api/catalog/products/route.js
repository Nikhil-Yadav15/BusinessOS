import { ListProductsOperation } from '../../../../application/operations/catalog/products/ListProductsOperation.js';
import { CreateProductOperation } from '../../../../application/operations/catalog/products/CreateProductOperation.js';
import { withExecutionContext } from '../../../../infrastructure/context/withExecutionContext.js';
import { withPermission } from '../../../../infrastructure/context/withPermission.js';
import { withApiHandler } from '../../../../infrastructure/context/withApiHandler.js';
import { StandardResponse } from '../../../../application/common/StandardResponse.js';

export const GET = withExecutionContext(
  withPermission(
    'catalog.product.read',
    withApiHandler(async (req, { executionContext }) => {
      const { searchParams } = new URL(req.url);
      
      const result = await new ListProductsOperation().execute(
        executionContext,
        {
          page: searchParams.get('page') || undefined,
          limit: searchParams.get('limit') || undefined,
          sortBy: searchParams.get('sortBy') || undefined,
          sortOrder: searchParams.get('sortOrder') || undefined,
          filters: {
            categoryId: searchParams.get('categoryId') || undefined,
            brandId: searchParams.get('brandId') || undefined,
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
    'catalog.product.write',
    withApiHandler(async (req, { executionContext }) => {
      const payload = await req.json();

      const result = await new CreateProductOperation().execute(
        executionContext,
        payload
      );

      return Response.json(StandardResponse.success(result), { status: 201 });
    })
  )
);
