/**
 * In-memory sliding-window rate limiter (single Node process; not for multi-replica).
 */

export function createRateLimiter(windowMs: number, max: number) {
  const hits = new Map<string, number[]>();

  return function allow(ip: string): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;
    let times = hits.get(ip)?.filter((t) => t > windowStart) ?? [];
    if (times.length >= max) {
      return false;
    }
    times.push(now);
    hits.set(ip, times);
    return true;
  };
}
