import { InviteMemberOperation } from '../../../../application/operations/team/InviteMemberOperation.js';
import { ListMembersOperation } from '../../../../application/operations/team/ListMembersOperation.js';

import { withExecutionContext } from '../../../../infrastructure/context/withExecutionContext.js';
import { withPermission } from '../../../../infrastructure/context/withPermission.js';
import { withApiHandler } from '../../../../infrastructure/context/withApiHandler.js';

export const POST = withExecutionContext(
  withPermission(
    'team.invite',
    withApiHandler(async (req, { executionContext }) => {

      const payload = await req.json();

      const result = await new InviteMemberOperation().execute(
        executionContext,
        payload
      );

      // Async trigger for outbound email (Fire and forget)
      const host = req.headers.get('host');
      const protocol = host.includes('localhost') ? 'http' : 'https';
      fetch(`${protocol}://${host}/api/system/jobs/deliver-notifications`, { method: 'POST' }).catch(() => {});

      return Response.json(result, {
        status: 201
      });

    })
  )
);

export const GET = withExecutionContext(
  withPermission(
    'team.read',
    withApiHandler(async (req, { executionContext }) => {

      const result = await new ListMembersOperation().execute(
        executionContext,
        {}
      );

      return Response.json(result);

    })
  )
);