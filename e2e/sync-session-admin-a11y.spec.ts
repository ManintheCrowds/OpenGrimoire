/**
 * OG-GUI-04 — axe on Sync Session (/operator-intake) and admin moderation (/admin).
 */
import { AxeBuilder } from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

import { loginAsAdmin } from './helpers/admin-login';
import { E2E_OPERATOR_PROBE_INGEST_SECRET } from './helpers/e2e-secrets';

function violationSummary(violations: { id: string; nodes: { html: string }[] }[]): string {
  return violations
    .map((v) => `${v.id}: ${v.nodes.map((n) => n.html).slice(0, 5).join(' | ')}`)
    .join('\n');
}

test.describe('Sync Session + admin axe (OG-GUI-04)', () => {
  test('operator-intake has no axe violations', async ({ page }) => {
    const bootstrapOk = page.waitForResponse(
      (res) =>
        res.url().includes('/api/survey/bootstrap-token') &&
        res.request().method() === 'GET' &&
        res.ok(),
      { timeout: 15000 }
    );
    await page.goto('/operator-intake');
    await bootstrapOk;
    await expect(page.getByTestId('sync-session-form-container')).toBeVisible({ timeout: 15000 });

    const { violations } = await new AxeBuilder({ page }).analyze();
    expect(violations, violationSummary(violations)).toHaveLength(0);
  });

  test('/admin has no axe violations after login', async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.getByRole('heading', { name: /Response Moderation Queue/i })).toBeVisible({
      timeout: 20000,
    });

    const { violations } = await new AxeBuilder({ page }).analyze();
    expect(violations, violationSummary(violations)).toHaveLength(0);
  });

  test('/admin/observability has no axe violations after login', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/observability');
    await expect(page.getByTestId('operator-observability-heading')).toBeVisible({ timeout: 20000 });

    const { violations } = await new AxeBuilder({ page }).analyze();
    expect(violations, violationSummary(violations)).toHaveLength(0);
  });

  test('/admin/observability/[id] has no axe violations when a run exists', async ({ page, request }) => {
    const runnerId = `e2e-a11y-probe-${Date.now()}`;
    const ingest = await request.post('/api/operator-probes/ingest', {
      headers: {
        'Content-Type': 'application/json',
        'x-operator-probe-ingest-key': E2E_OPERATOR_PROBE_INGEST_SECRET,
      },
      data: {
        probe_type: 'cursor_path_analysis',
        target_host: 'api.cursor.com',
        runner_id: runnerId,
        runner_type: 'ci',
        summary: { axe: true },
      },
    });
    expect(ingest.status()).toBe(201);
    const { id } = (await ingest.json()) as { id: string };

    await loginAsAdmin(page);
    await page.goto(`/admin/observability/${encodeURIComponent(id)}`);
    await expect(page.getByTestId('operator-probe-detail-heading')).toBeVisible({ timeout: 20000 });

    const { violations } = await new AxeBuilder({ page }).analyze();
    expect(violations, violationSummary(violations)).toHaveLength(0);
  });
});
