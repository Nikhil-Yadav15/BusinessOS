import { cookies } from 'next/headers';
import { LogoutOperation } from '../../../../application/operations/auth/LogoutOperation.js';
import { withExecutionContext } from '../../../../infrastructure/context/withExecutionContext.js';
import { withApiHandler } from '../../../../infrastructure/context/withApiHandler.js';

export const POST = withExecutionContext(
  withApiHandler(async (req, { executionContext }) => {
    
    await new LogoutOperation().execute(executionContext, {});

    const cookieStore = await cookies();
    cookieStore.delete('atlas_refresh_token');

    return Response.json({ success: true }, { status: 200 });
  })
);