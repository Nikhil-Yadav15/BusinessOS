import { NextResponse } from 'next/server';

/**
 * Next.js Edge Middleware — Atlas Route Protection
 * 
 * This runs at the CDN/Edge level BEFORE any server component or API route.
 * It inspects the Authorization cookie for a valid token marker.
 * 
 * NOTE: In V1, we check for the existence of the atlas_refresh_token cookie
 * as a lightweight gate. Full JWT verification runs server-side per request
 * via withExecutionContext middleware.
 */

const PUBLIC_ROUTES = ['/login', '/register', '/api/auth/login', '/api/auth/register', '/api/auth/refresh'];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow all public routes
  const isPublic = PUBLIC_ROUTES.some(route => pathname.startsWith(route));
  if (isPublic) return NextResponse.next();

  // Allow all static assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Allow system/cron endpoints (secured by separate API key in production)
  if (pathname.startsWith('/api/system/cron')) {
    return NextResponse.next();
  }

  // For dashboard pages: check for the refresh token cookie as a session gate
  if (pathname.startsWith('/dashboard')) {
    const refreshToken = request.cookies.get('atlas_refresh_token');
    if (!refreshToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
