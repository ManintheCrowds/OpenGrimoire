import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createRateLimiter } from './src/lib/rate-limit-in-memory';

/**
 * Block direct static access to brain-map JSON under /public — use GET /api/brain-map/graph only
 * (optional BRAIN_MAP_SECRET + x-brain-map-key).
 */
const BRAIN_MAP_STATIC_PATHS = new Set([
  '/brain-map-graph.json',
  '/brain-map-graph.local.json',
]);

/** POST /api/survey — single Node instance; not for multi-replica. */
const rateLimitSurvey = createRateLimiter(60_000, 30);

/** POST /api/auth/login — stricter; brute-force protection (per-process only). */
const rateLimitLogin = createRateLimiter(60_000, 10);

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (BRAIN_MAP_STATIC_PATHS.has(pathname)) {
    return NextResponse.json(
      {
        error: 'Not found',
        detail:
          'Brain map JSON is served only via GET /api/brain-map/graph (see docs/AGENT_INTEGRATION.md).',
      },
      { status: 404 }
    );
  }

  if (pathname === '/api/survey' && request.method === 'POST') {
    const ip = getClientIp(request);
    if (!rateLimitSurvey(ip)) {
      return NextResponse.json(
        { error: 'Too many requests', detail: 'Survey rate limit exceeded. Try again later.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }
  }

  if (pathname === '/api/auth/login' && request.method === 'POST') {
    const ip = getClientIp(request);
    if (!rateLimitLogin(ip)) {
      return NextResponse.json(
        { error: 'Too many requests', detail: 'Login rate limit exceeded. Try again later.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/brain-map-graph.json', '/brain-map-graph.local.json', '/api/survey', '/api/auth/login'],
};
