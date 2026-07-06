import { GetPartyOperation } from '../../../../../application/operations/crm/GetPartyOperation.js';
import { UpdatePartyOperation } from '../../../../../application/operations/crm/UpdatePartyOperation.js';
import { DeletePartyOperation } from '../../../../../application/operations/crm/DeletePartyOperation.js';
import { withExecutionContext } from '../../../../../infrastructure/context/withExecutionContext.js';
import { withPermission } from '../../../../../infrastructure/context/withPermission.js';
import { withApiHandler } from '../../../../../infrastructure/context/withApiHandler.js';
import { StandardResponse } from '../../../../../application/common/StandardResponse.js';

export const GET = withExecutionContext(
  withPermission(
    'crm.party.read',
    withApiHandler(async (req, { executionContext, params }) => {
      const result = await new GetPartyOperation().execute(
        executionContext,
        { id: params.id }
      );
      return Response.json(StandardResponse.success(result));
    })
  )
);

export const PATCH = withExecutionContext(
  withPermission(
    'crm.party.write',
    withApiHandler(async (req, { executionContext, params }) => {
      const payload = await req.json();
      const result = await new UpdatePartyOperation().execute(
        executionContext,
        { id: params.id, data: payload }
      );
      return Response.json(StandardResponse.success(result));
    })
  )
);

export const DELETE = withExecutionContext(
  withPermission(
    'crm.party.delete',
    withApiHandler(async (req, { executionContext, params }) => {
      const result = await new DeletePartyOperation().execute(
        executionContext,
        { id: params.id }
      );
      return Response.json(StandardResponse.success(result));
    })
  )
);
