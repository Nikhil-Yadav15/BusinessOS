import { GetMemberOperation } from '../../../../../application/operations/team/GetMemberOperation.js';
import { UpdateMemberRoleOperation } from '../../../../../application/operations/team/UpdateMemberRoleOperation.js';

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

export const PATCH = withExecutionContext(
  withPermission(
    'team.manage_roles',
    withApiHandler(async (req, { executionContext, params }) => {

      const payload = await req.json();

      const result = await new UpdateMemberRoleOperation().execute(
        executionContext,
        {
          memberId: params.id,
          roleId: payload.roleId
        }
      );

      return Response.json(result);

    })
  )
);