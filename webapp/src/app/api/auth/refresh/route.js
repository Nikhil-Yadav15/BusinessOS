import { cookies } from 'next/headers';
import { RefreshTokenOperation } from '../../../../application/operations/auth/RefreshTokenOperation.js';
import { buildAnonymousContext } from '../../../../infrastructure/context/buildContext.js';
import { withApiHandler } from '../../../../infrastructure/context/withApiHandler.js';

export const POST = withApiHandler(async (req) => {
  // 1. Read the HttpOnly cookie (Next.js 15 async API)
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('atlas_refresh_token')?.value;

  const anonymousContext = buildAnonymousContext(req);
  
  // 2. Execute operation
  const result = await new RefreshTokenOperation().execute(anonymousContext, { refreshToken });

  // 3. Set the newly rotated refresh token securely
  cookieStore.set('atlas_refresh_token', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth', // Restrict cookie to auth routes
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  // 4. Return ONLY the short-lived access token in the JSON body
  return Response.json({ accessToken: result.accessToken }, { status: 200 });
});