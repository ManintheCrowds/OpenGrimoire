import { expect, test } from '@playwright/test';

import { loginAsAdmin } from './helpers/admin-login';

test.describe('autoresearch detail (OG-OC-17 Phase 2)', () => {
  test('shows policy predicate table on experiment detail', async ({ page }) => {
    await page.route('**/api/admin/cockpit/autoresearch/2026-06-06-foam-pkm', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          panel: 'autoresearch-experiments',
          mode: 'jsonl_adapter',
          panel_enabled: true,
          logPath: 'C:/data/autoresearch_events.jsonl',
          focusPath: 'C:/data/autoresearch_focus.json',
          summary: 'Experiment 2026-06-06-foam-pkm: merged, 3 events.',
          active_experiment_id: null,
          skippedMalformedLines: 0,
          experiment: {
            experiment_id: '2026-06-06-foam-pkm',
            asset: 'foam-pkm',
            branch: 'autoresearch/2026-06-06-foam-pkm',
            status: 'merged',
            iteration_count: 1,
            latest_metric: '5/5',
            latest_pass: true,
            started_at: '2026-06-06T12:30:00Z',
            updated_at: '2026-06-07T00:00:00Z',
          },
          events: [
            {
              event: 'experiment_started',
              ts: '2026-06-06T12:30:00Z',
              experiment_id: '2026-06-06-foam-pkm',
              asset: 'foam-pkm',
              branch: 'autoresearch/2026-06-06-foam-pkm',
              source: 'initialize',
            },
          ],
          policy_trace: null,
          policy_predicates: [
            { id: 'tier_b_pass', pass: true, detail: 'ok', source: 'jsonl' },
            { id: 'ci_green', pass: null, detail: 'Check GitHub PR checks', source: 'external' },
          ],
          all_predicates_pass: true,
          kill_switch_blocked: false,
          mutable_asset_diff: {
            path: '.cursor/skills/foam-pkm/SKILL.md',
            line_count: 10,
            max_lines: 150,
            bounded: true,
            available: true,
            detail: '10 diff lines (max 150)',
          },
          github_compare_url: 'https://github.com/example/compare',
          experiments: [],
        }),
      });
    });

    await loginAsAdmin(page);
    await page.goto('/admin/autoresearch/2026-06-06-foam-pkm');
    await expect(page.getByTestId('admin-autoresearch-detail-page')).toBeVisible();
    await expect(page.getByTestId('admin-autoresearch-predicates')).toContainText('tier_b_pass');
    await expect(page.getByTestId('admin-autoresearch-timeline')).toBeVisible();
    await expect(page.getByTestId('admin-autoresearch-diff-panel')).toContainText('10 / 150');
  });
});
