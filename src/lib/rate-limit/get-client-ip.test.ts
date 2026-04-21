import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getRateLimitClientIp, shouldTrustForwardedIpForRateLimit } from './get-client-ip';

describe('shouldTrustForwardedIpForRateLimit', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('is true when OPENGRIMOIRE_TRUST_FORWARDED_IP=1', () => {
    vi.stubEnv('OPENGRIMOIRE_TRUST_FORWARDED_IP', '1');
    vi.stubEnv('VERCEL', undefined);
    expect(shouldTrustForwardedIpForRateLimit()).toBe(true);
  });

  it('is true when OPENGRIMOIRE_TRUST_FORWARDED_IP=true', () => {
    vi.stubEnv('OPENGRIMOIRE_TRUST_FORWARDED_IP', 'true');
    vi.stubEnv('VERCEL', undefined);
    expect(shouldTrustForwardedIpForRateLimit()).toBe(true);
  });

  it('is true when VERCEL=1', () => {
    vi.stubEnv('OPENGRIMOIRE_TRUST_FORWARDED_IP', undefined);
    vi.stubEnv('VERCEL', '1');
    expect(shouldTrustForwardedIpForRateLimit()).toBe(true);
  });

  it('is false when neither trust flag is set', () => {
    vi.stubEnv('OPENGRIMOIRE_TRUST_FORWARDED_IP', undefined);
    vi.stubEnv('VERCEL', undefined);
    expect(shouldTrustForwardedIpForRateLimit()).toBe(false);
  });
});

describe('getRateLimitClientIp', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns unknown when not trusted even if X-Forwarded-For is set', () => {
    vi.stubEnv('OPENGRIMOIRE_TRUST_FORWARDED_IP', undefined);
    vi.stubEnv('VERCEL', undefined);
    const req = new NextRequest('http://localhost/api/survey', {
      headers: { 'x-forwarded-for': '203.0.113.7' },
    });
    expect(getRateLimitClientIp(req)).toBe('unknown');
  });

  it('uses leftmost X-Forwarded-For when trusted', () => {
    vi.stubEnv('OPENGRIMOIRE_TRUST_FORWARDED_IP', '1');
    const req = new NextRequest('http://localhost/api/survey', {
      headers: { 'x-forwarded-for': ' 203.0.113.7 , 10.0.0.1' },
    });
    expect(getRateLimitClientIp(req)).toBe('203.0.113.7');
  });

  it('uses X-Real-IP when trusted and X-Forwarded-For absent', () => {
    vi.stubEnv('OPENGRIMOIRE_TRUST_FORWARDED_IP', 'true');
    const req = new NextRequest('http://localhost/api/survey', {
      headers: { 'x-real-ip': '198.51.100.2' },
    });
    expect(getRateLimitClientIp(req)).toBe('198.51.100.2');
  });

  it('uses X-Forwarded-For when VERCEL=1', () => {
    vi.stubEnv('OPENGRIMOIRE_TRUST_FORWARDED_IP', undefined);
    vi.stubEnv('VERCEL', '1');
    const req = new NextRequest('http://localhost/api/survey', {
      headers: { 'x-forwarded-for': '192.0.2.1' },
    });
    expect(getRateLimitClientIp(req)).toBe('192.0.2.1');
  });

  it('returns unknown when trusted but no IP headers', () => {
    vi.stubEnv('OPENGRIMOIRE_TRUST_FORWARDED_IP', '1');
    const req = new NextRequest('http://localhost/api/survey');
    expect(getRateLimitClientIp(req)).toBe('unknown');
  });
});
