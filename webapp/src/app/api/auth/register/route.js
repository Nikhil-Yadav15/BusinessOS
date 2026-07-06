import { RegisterOperation } from '../../../../application/operations/auth/RegisterOperation.js';
import { buildAnonymousContext } from '../../../../infrastructure/context/buildContext.js';
import { withApiHandler } from '../../../../infrastructure/context/withApiHandler.js';

export const POST = withApiHandler(async (req) => {
  const payload = await req.json();
  const anonymousContext = buildAnonymousContext(req);
  
  const result = await new RegisterOperation().execute(anonymousContext, payload);

  return Response.json(result, { status: 201 });
});