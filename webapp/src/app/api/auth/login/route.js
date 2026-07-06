import { cookies } from 'next/headers';
import { LoginOperation } from '../../../../application/operations/auth/LoginOperation.js';
import { buildAnonymousContext } from '../../../../infrastructure/context/buildContext.js';
import { withApiHandler } from '../../../../infrastructure/context/withApiHandler.js';

export const POST = withApiHandler(async (req) => {
  const payload = await req.json();
  const anonymousContext = buildAnonymousContext(req);
  
  // 1. Execute the operation
  const { accessToken, refreshToken, user } = await new LoginOperation().execute(anonymousContext, payload);

  // 2. Set the HttpOnly cookie for the refresh token (Next.js 15 async API)
  const cookieStore = await cookies();
  cookieStore.set('atlas_refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth', // Restrict cookie to auth routes
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  // 3. Return ONLY the access token and user profile in the JSON body
  return Response.json({ accessToken, user }, { status: 200 });
});