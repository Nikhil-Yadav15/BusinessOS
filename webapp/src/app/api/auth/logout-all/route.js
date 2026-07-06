import { cookies } from 'next/headers';
import { LogoutAllOperation } from '../../../../application/operations/auth/LogoutAllOperation.js';
import { withExecutionContext } from '../../../../infrastructure/context/withExecutionContext.js';
import { withApiHandler } from '../../../../infrastructure/context/withApiHandler.js';

export const POST = withExecutionContext(
  withApiHandler(async (req, { executionContext }) => {
    
    await new LogoutAllOperation().execute(executionContext, {});

    const cookieStore = await cookies();
    cookieStore.delete('atlas_refresh_token');

    return Response.json({ success: true }, { status: 200 });
  })
);