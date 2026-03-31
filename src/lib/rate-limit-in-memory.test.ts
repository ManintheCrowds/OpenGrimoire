import { describe, expect, it } from 'vitest';
import { createRateLimiter } from './rate-limit-in-memory';

describe('createRateLimiter', () => {
  it('allows up to max hits in the window', () => {
    const allow = createRateLimiter(60_000, 5);
    expect(allow('a')).toBe(true);
    expect(allow('a')).toBe(true);
    expect(allow('a')).toBe(true);
    expect(allow('a')).toBe(true);
    expect(allow('a')).toBe(true);
    expect(allow('a')).toBe(false);
  });

  it('tracks IPs independently', () => {
    const allow = createRateLimiter(60_000, 2);
    expect(allow('x')).toBe(true);
    expect(allow('x')).toBe(true);
    expect(allow('x')).toBe(false);
    expect(allow('y')).toBe(true);
    expect(allow('y')).toBe(true);
    expect(allow('y')).toBe(false);
  });
});
