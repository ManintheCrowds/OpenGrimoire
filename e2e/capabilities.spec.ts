import { test, expect } from '@playwright/test';

test.describe('API capabilities manifest', () => {
  test('GET /api/capabilities returns open-grimoire app and routes array', async ({ request }) => {
    const res = await request.get('/api/capabilities');
    expect(res.ok()).toBeTruthy();
    const body = (await res.json()) as { app: string; routes: unknown[] };
    expect(body.app).toBe('open-grimoire');
    expect(Array.isArray(body.routes)).toBe(true);
    expect(body.routes.length).toBeGreaterThan(0);
    const paths = (body.routes as { path: string }[]).map((r) => r.path);
    expect(paths).toContain('/api/brain-map/graph');
    expect(paths).toContain('/api/capabilities');
    const moderationRoutes = (body.routes as { path: string; auth?: string }[]).filter((r) =>
      ['/api/admin/moderation-queue', '/api/admin/moderation/:responseId'].includes(r.path)
    );
    expect(moderationRoutes).toHaveLength(2);
    for (const r of moderationRoutes) {
      expect(r.auth ?? '').toContain('operator_session_only_no_alignment_key');
    }
  });
});
