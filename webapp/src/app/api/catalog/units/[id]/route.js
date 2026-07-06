import { GetUnitOperation } from '../../../../../application/operations/catalog/units/GetUnitOperation.js';
import { UpdateUnitOperation } from '../../../../../application/operations/catalog/units/UpdateUnitOperation.js';
import { DeleteUnitOperation } from '../../../../../application/operations/catalog/units/DeleteUnitOperation.js';
import { withExecutionContext } from '../../../../../infrastructure/context/withExecutionContext.js';
import { withPermission } from '../../../../../infrastructure/context/withPermission.js';
import { withApiHandler } from '../../../../../infrastructure/context/withApiHandler.js';
import { StandardResponse } from '../../../../../application/common/StandardResponse.js';

export const GET = withExecutionContext(
  withPermission(
    'catalog.unit.read',
    withApiHandler(async (req, { executionContext, params }) => {
      const result = await new GetUnitOperation().execute(
        executionContext,
        { id: params.id }
      );
      return Response.json(StandardResponse.success(result));
    })
  )
);

export const PATCH = withExecutionContext(
  withPermission(
    'catalog.unit.write',
    withApiHandler(async (req, { executionContext, params }) => {
      const payload = await req.json();
      const result = await new UpdateUnitOperation().execute(
        executionContext,
        { id: params.id, data: payload }
      );
      return Response.json(StandardResponse.success(result));
    })
  )
);

export const DELETE = withExecutionContext(
  withPermission(
    'catalog.unit.delete',
    withApiHandler(async (req, { executionContext, params }) => {
      const result = await new DeleteUnitOperation().execute(
        executionContext,
        { id: params.id }
      );
      return Response.json(StandardResponse.success(result));
    })
  )
);
