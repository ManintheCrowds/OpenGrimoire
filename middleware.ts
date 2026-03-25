import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Block direct static access to brain-map JSON under /public — use GET /api/brain-map/graph only
 * (optional BRAIN_MAP_SECRET + x-brain-map-key).
 */
const BRAIN_MAP_STATIC_PATHS = new Set([
  '/brain-map-graph.json',
  '/brain-map-graph.local.json',
]);

/** Simple in-memory rate limit for POST /api/survey (single Node instance; not for multi-replica). */
const SURVEY_WINDOW_MS = 60_000;
const SURVEY_MAX = 30;
const surveyHits = new Map<string, number[]>();

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

function rateLimitSurvey(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - SURVEY_WINDOW_MS;
  let times = surveyHits.get(ip)?.filter((t) => t > windowStart) ?? [];
  if (times.length >= SURVEY_MAX) {
    return false;
  }
  times.push(now);
  surveyHits.set(ip, times);
  return true;
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

  return NextResponse.next();
}

export const config = {
  matcher: ['/brain-map-graph.json', '/brain-map-graph.local.json', '/api/survey'],
};
