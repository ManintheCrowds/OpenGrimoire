import { expect, test } from '@playwright/test';

/**
 * Live check for CVE-2025-29927. On Next.js 14.0.4, these header values skip
 * `src/middleware.ts` and `GET /brain-map-graph.json` returns the public file
 * (body contains "nodes"). Patched Next plus the instrumentation strip must
 * keep the middleware 404.
 */
const FORGED_HEADER_VALUES = [
  'src/middleware',
  'middleware',
  'src/middleware:src/middleware:src/middleware:src/middleware:src/middleware',
] as const;

test.describe('forged x-middleware-subrequest', () => {
  for (const value of FORGED_HEADER_VALUES) {
    test(`does not bypass the brain-map static gate for ${value}`, async ({ request }) => {
      const response = await request.get('/brain-map-graph.json', {
        headers: { 'x-middleware-subrequest': value },
      });
      expect(response.status()).toBe(404);
      const body = (await response.json()) as { detail?: string };
      expect(body.detail).toContain('GET /api/brain-map/graph');
      expect(JSON.stringify(body)).not.toContain('"nodes"');
    });
  }

  test('still 404s the static graph without the forged header', async ({ request }) => {
    const response = await request.get('/brain-map-graph.json');
    expect(response.status()).toBe(404);
    const body = (await response.json()) as { detail?: string };
    expect(body.detail).toContain('GET /api/brain-map/graph');
  });
});
