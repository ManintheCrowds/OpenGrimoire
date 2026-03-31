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

/**
 * Dev/demo App Router pages only (OA-4). Blocked in production unless explicitly allowed
 * (e.g. staging). See .env.example OPENGRIMOIRE_ALLOW_TEST_ROUTES.
 *
 * Maintainer: keep in sync with `export const config.matcher` at the bottom of this file —
 * every prefix here must have matching matcher entries (Next.js path patterns). `isTestDevRoute`
 * treats `pathname === prefix` or `pathname.startsWith(prefix + '/')`. When adding a prefix,
 * update matcher + `e2e/test-routes.spec.ts` smoke for that route.
 */
const TEST_ROUTE_PREFIXES = ['/test', '/test-chord', '/test-context', '/test-supabase'] as const;

function isTestDevRoute(pathname: string): boolean {
  return TEST_ROUTE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function testRoutesAllowedInThisDeployment(): boolean {
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }
  const v = process.env.OPENGRIMOIRE_ALLOW_TEST_ROUTES;
  return v === '1' || v === 'true';
}

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isTestDevRoute(pathname) && !testRoutesAllowedInThisDeployment()) {
    return new NextResponse(
      `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><title>Not found</title></head><body><h1>Not found</h1><p>Dev-only routes are disabled in this deployment. To allow (staging only), set <code>OPENGRIMOIRE_ALLOW_TEST_ROUTES=1</code>. See <code>.env.example</code>.</p></body></html>`,
      { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

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

/** Must cover every `TEST_ROUTE_PREFIXES` entry (OA-4). Drift = middleware never runs for a dev route. */
export const config = {
  matcher: [
    '/brain-map-graph.json',
    '/brain-map-graph.local.json',
    '/api/survey',
    '/api/auth/login',
    '/test',
    '/test/:path*',
    '/test-chord',
    '/test-chord/:path*',
    '/test-context',
    '/test-context/:path*',
    '/test-supabase',
    '/test-supabase/:path*',
  ],
};
