import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Next.js with `src/app` only compiles `src/middleware.ts`.
 * A root-level `middleware.ts` is silently ignored (empty middleware manifest),
 * which disables brain-map static blocking, rate limits, and prod test-route gates.
 */
describe('middleware location', () => {
  it('keeps middleware under src/ and does not leave a dead root middleware.ts', () => {
    const root = process.cwd();
    expect(fs.existsSync(path.join(root, 'src/middleware.ts'))).toBe(true);
    expect(fs.existsSync(path.join(root, 'middleware.ts'))).toBe(false);
  });
});
