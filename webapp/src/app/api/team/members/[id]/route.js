import { GetMemberOperation } from '../../../../../application/operations/team/GetMemberOperation.js';

import { withExecutionContext } from '../../../../../infrastructure/context/withExecutionContext.js';
import { withPermission } from '../../../../../infrastructure/context/withPermission.js';
import { withApiHandler } from '../../../../../infrastructure/context/withApiHandler.js';

export const GET = withExecutionContext(
  withPermission(
    'team.read',
    withApiHandler(async (req, { executionContext, params }) => {

      const result = await new GetMemberOperation().execute(
        executionContext,
        {
          memberId: params.id
        }
      );

      return Response.json(result);

    })
  )
);