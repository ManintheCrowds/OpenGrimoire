import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * CVE-2025-29927 (GHSA-f82v-jwr5-mffw): Next.js < 14.2.25 skips middleware when the
 * client sends `x-middleware-subrequest: src/middleware`, which on OpenGrimoire
 * exposed `public/brain-map-graph.json` and disabled login/survey rate limits.
 * Pin must stay at or above the patched 14.2.25 line.
 */
describe('Next.js middleware bypass pin (CVE-2025-29927)', () => {
  it('pins next to a release that includes the middleware subrequest fix', () => {
    const pkg = JSON.parse(readFileSync(path.join(process.cwd(), 'package.json'), 'utf8')) as {
      dependencies: { next: string };
    };
    const version = pkg.dependencies.next.replace(/^[^0-9]*/, '');
    const [major, minor, patch] = version.split('.').map((p) => Number.parseInt(p, 10));
    expect(major).toBe(14);
    expect(minor).toBeGreaterThanOrEqual(2);
    if (minor === 2) {
      expect(patch).toBeGreaterThanOrEqual(25);
    }
  });
});
