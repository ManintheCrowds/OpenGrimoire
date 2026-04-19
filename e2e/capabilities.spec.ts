import { test, expect } from '@playwright/test';

test.describe('API capabilities manifest', () => {
  test('GET /api/capabilities returns open-grimoire app and routes array', async ({ request }) => {
    const res = await request.get('/api/capabilities');
    expect(res.ok()).toBeTruthy();
    const body = (await res.json()) as {
      app: string;
      routes: unknown[];
      ui_surfaces?: { id: string; paths: string[]; fetch_pattern: string }[];
      documentation?: { non_contractual_ui?: string };
    };
    expect(body.app).toBe('open-grimoire');
    expect(typeof body.documentation?.non_contractual_ui).toBe('string');
    expect(body.documentation?.non_contractual_ui).toContain('/test');
    expect(Array.isArray(body.routes)).toBe(true);
    expect(Array.isArray(body.ui_surfaces)).toBe(true);
    expect((body.ui_surfaces ?? []).length).toBeGreaterThan(0);
    const cohort = body.ui_surfaces?.find((s) => s.id === 'survey_cohort_charts');
    const constellation = body.ui_surfaces?.find((s) => s.id === 'survey_network_constellation');
    expect(cohort?.paths).toContain('/visualization');
    expect(cohort?.fetch_pattern).toContain('all=1');
    expect(constellation?.paths).toContain('/constellation');
    expect(constellation?.fetch_pattern).toContain('all=0');
    expect(constellation?.fetch_pattern).toContain('showTestData=false');
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
