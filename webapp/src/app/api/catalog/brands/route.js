import { ListBrandsOperation } from '../../../../application/operations/catalog/brands/ListBrandsOperation.js';
import { CreateBrandOperation } from '../../../../application/operations/catalog/brands/CreateBrandOperation.js';
import { withExecutionContext } from '../../../../infrastructure/context/withExecutionContext.js';
import { withPermission } from '../../../../infrastructure/context/withPermission.js';
import { withApiHandler } from '../../../../infrastructure/context/withApiHandler.js';
import { StandardResponse } from '../../../../application/common/StandardResponse.js';

export const GET = withExecutionContext(
  withPermission(
    'catalog.brand.read',
    withApiHandler(async (req, { executionContext }) => {
      const { searchParams } = new URL(req.url);
      
      const result = await new ListBrandsOperation().execute(
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
    'catalog.brand.write',
    withApiHandler(async (req, { executionContext }) => {
      const payload = await req.json();

      const result = await new CreateBrandOperation().execute(
        executionContext,
        payload
      );

      return Response.json(StandardResponse.success(result), { status: 201 });
    })
  )
);
