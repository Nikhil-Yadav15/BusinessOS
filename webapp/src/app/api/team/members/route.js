import { InviteMemberOperation } from '../../../../application/operations/team/InviteMemberOperation.js';
import { withExecutionContext } from '../../../../infrastructure/context/withExecutionContext.js';
import { withPermission } from '../../../../infrastructure/context/withPermission.js';
import { withApiHandler } from '../../../../infrastructure/context/withApiHandler.js';

export const POST = withExecutionContext(
  // The route is protected by the RBAC engine. The OWNER and ADMIN roles
  // (which we mapped in the TenantBootstrapService) will have this permission.
  withPermission('team.invite', 
    withApiHandler(async (req, { executionContext }) => {
      
      const payload = await req.json();
      const result = await new InviteMemberOperation().execute(executionContext, payload);

      return Response.json(result, { status: 201 });
    })
  )
);