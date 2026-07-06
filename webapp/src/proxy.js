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

// Free-tier Vercel memory rate limiting (Isolate Local)
const ipHits = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const windowTime = 10 * 1000; // 10 seconds rolling window
  const limit = 100; // Genereous 100 requests per 10s

  let hits = ipHits.get(ip) || [];
  hits = hits.filter(time => now - time < windowTime);
  
  if (hits.length >= limit) return false;

  hits.push(now);
  ipHits.set(ip, hits);
  
  // Extremely basic memory leak prevention for Edge isolates
  if (ipHits.size > 5000) ipHits.clear(); 
  
  return true;
}

export function proxy(request) {
  const { pathname } = request.nextUrl;

  // Allow all static assets explicitly first to avoid hitting Maps
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Edge-Local API Rate Limiting protection
  if (pathname.startsWith('/api') || pathname.startsWith('/login')) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(ip)) {
      return new NextResponse(JSON.stringify({ 
         error: 'Rate limit exceeded. Please slow down.' 
      }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // Allow all public routes
  const isPublic = PUBLIC_ROUTES.some(route => pathname.startsWith(route));
  if (isPublic) return NextResponse.next();

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
