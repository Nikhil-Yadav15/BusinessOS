import { ListPartiesOperation } from '../../../../application/operations/crm/ListPartiesOperation.js';
import { CreatePartyOperation } from '../../../../application/operations/crm/CreatePartyOperation.js';
import { withExecutionContext } from '../../../../infrastructure/context/withExecutionContext.js';
import { withPermission } from '../../../../infrastructure/context/withPermission.js';
import { withApiHandler } from '../../../../infrastructure/context/withApiHandler.js';
import { StandardResponse } from '../../../../application/common/StandardResponse.js';

export const GET = withExecutionContext(
  withPermission(
    'crm.party.read',
    withApiHandler(async (req, { executionContext }) => {
      const { searchParams } = new URL(req.url);
      
      const result = await new ListPartiesOperation().execute(
        executionContext,
        {
          page: searchParams.get('page'),
          limit: searchParams.get('limit'),
          sortBy: searchParams.get('sortBy'),
          sortOrder: searchParams.get('sortOrder'),
          filters: {
            partyType: searchParams.get('partyType'),
            status: searchParams.get('status')
          }
        }
      );

      return Response.json(StandardResponse.success(result));
    })
  )
);

export const POST = withExecutionContext(
  withPermission(
    'crm.party.write',
    withApiHandler(async (req, { executionContext }) => {
      const payload = await req.json();

      const result = await new CreatePartyOperation().execute(
        executionContext,
        payload
      );

      return Response.json(StandardResponse.success(result), { status: 201 });
    })
  )
);
