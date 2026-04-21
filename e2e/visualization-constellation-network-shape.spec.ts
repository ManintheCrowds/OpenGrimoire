/**
 * OGAN-16 — Smoke that browser fetches use distinct `GET /api/survey/visualization`
 * query shapes: cohort (`all=1`) on `/visualization` vs filtered (`all=0` +
 * `showTestData`) on `/constellation` (drift guard).
 */
import { test, expect } from '@playwright/test';

test.describe('Visualization vs constellation API query shape (OGAN-16)', () => {
  /** Avoid two heavy viz pages competing for the same dev server during local/CI runs. */
  test.describe.configure({ mode: 'serial' });

  test('/visualization requests cohort rows (all=1)', async ({ page }) => {
    const cohortResponse = page.waitForResponse(
      (res) =>
        res.request().method() === 'GET' &&
        res.url().includes('/api/survey/visualization') &&
        new URL(res.url()).searchParams.get('all') === '1',
      { timeout: 20000 }
    );
    await page.goto('/visualization');
    const res = await cohortResponse;
    const u = new URL(res.url());
    expect(u.searchParams.get('all')).toBe('1');
    expect(u.searchParams.has('showTestData'), `showTestData must be absent for all=1: ${u}`).toBe(false);

    await expect(page.getByTestId('alluvial-diagram').or(page.getByTestId('chord-diagram'))).toBeVisible({
      timeout: 20000,
    });
  });

  test('/constellation requests filtered rows (all=0 + showTestData param)', async ({ page }) => {
    const filteredResponse = page.waitForResponse(
      (res) =>
        res.request().method() === 'GET' &&
        res.url().includes('/api/survey/visualization') &&
        new URL(res.url()).searchParams.get('all') === '0',
      { timeout: 30000 }
    );
    await page.goto('/constellation');
    const res = await filteredResponse;
    const u = new URL(res.url());
    expect(u.searchParams.get('all')).toBe('0');
    const st = u.searchParams.get('showTestData');
    expect(st === 'true' || st === 'false', `showTestData must be present and boolean-like: ${u}`).toBe(true);

    await expect(page.getByText('Loading visualization...')).not.toBeVisible({ timeout: 30000 });
    await expect(page.getByRole('heading', { name: 'Constellation View' })).toBeVisible({
      timeout: 20000,
    });
  });
});
