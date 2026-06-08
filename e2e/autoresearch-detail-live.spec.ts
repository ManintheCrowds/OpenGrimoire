import fs from 'node:fs';

import { expect, test } from '@playwright/test';

import { loginAsAdmin } from './helpers/admin-login';

const EXPERIMENT_ID = '2026-06-07-frontend-a2ui-observe';
const EVENTS_LOG = process.env.OPENGRIMOIRE_AUTORESEARCH_EVENTS_LOG ?? '';

test.describe('autoresearch detail live (OG-OC-17, no API mock)', () => {
  test.beforeAll(() => {
    if (!EVENTS_LOG || !fs.existsSync(EVENTS_LOG)) {
      test.skip(
        true,
        `OPENGRIMOIRE_AUTORESEARCH_EVENTS_LOG missing or not found: ${EVENTS_LOG || '(unset)'}`,
      );
    }
  });

  test('loads real JSONL experiment detail with predicates, timeline, kill switch', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(`/admin/autoresearch/${EXPERIMENT_ID}`);

    await expect(page.getByTestId('admin-autoresearch-detail-page')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('admin-autoresearch-detail-heading')).toContainText(EXPERIMENT_ID);

    const predicates = page.getByTestId('admin-autoresearch-predicates');
    await expect(predicates).toBeVisible();
    await expect(predicates).toContainText('tier_b_pass');
    await expect(predicates).toContainText('critic_pass');
    await expect(predicates).toContainText('auto_merge_enabled');

    const timeline = page.getByTestId('admin-autoresearch-timeline');
    await expect(timeline).toBeVisible();
    await expect(timeline).toContainText('tier_b_complete');
    await expect(timeline).toContainText('critic_scored');
    await expect(timeline).toContainText('merge_blocked');

    await expect(page.getByTestId('admin-autoresearch-kill-switch-badge')).toBeVisible();
    await expect(page.getByTestId('admin-autoresearch-kill-switch-badge')).toContainText(
      'AUTORESEARCH_AUTO_MERGE=0',
    );

    const diffPanel = page.getByTestId('admin-autoresearch-diff-panel');
    await expect(diffPanel).toBeVisible();
    const diffText = await diffPanel.textContent();
    expect(diffText).toMatch(/SKILL\.md|lines|unavailable|Compare on GitHub/i);
  });
});
