import type { NextRequest } from 'next/server';

/**
 * Whether forwarded client IP headers may be used for middleware rate limiting.
 * Trust when explicitly enabled for self-hosted reverse proxies, or on Vercel
 * (platform sets forwarding headers at the edge).
 */
export function shouldTrustForwardedIpForRateLimit(): boolean {
  const v = process.env.OPENGRIMOIRE_TRUST_FORWARDED_IP;
  if (v === '1' || v === 'true') return true;
  if (process.env.VERCEL === '1') return true;
  return false;
}

/**
 * Client identity for in-memory per-IP rate limiters in root middleware.
 * When {@link shouldTrustForwardedIpForRateLimit} is false, returns `unknown`
 * so client-supplied X-Forwarded-For cannot bypass limits.
 */
export function getRateLimitClientIp(req: NextRequest): string {
  if (!shouldTrustForwardedIpForRateLimit()) {
    return 'unknown';
  }
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

/** Same IP rules as {@link getRateLimitClientIp} for standard `Request` (e.g. route handlers). */
export function getClientIpFromRequest(request: Request): string {
  if (!shouldTrustForwardedIpForRateLimit()) {
    return 'unknown';
  }
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}
