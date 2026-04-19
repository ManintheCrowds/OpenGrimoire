/**
 * OGAN-16 — Smoke that browser fetches use distinct `GET /api/survey/visualization`
 * query shapes: cohort (`all=1`) on `/visualization` vs filtered (`all=0` +
 * `showTestData`) on `/constellation` (drift guard).
 */
import { test, expect, type Page } from '@playwright/test';

function collectVisualizationUrls(page: Page): string[] {
  const urls: string[] = [];
  page.on('request', (req) => {
    const u = req.url();
    if (req.method() === 'GET' && u.includes('/api/survey/visualization')) {
      urls.push(u);
    }
  });
  return urls;
}

test.describe('Visualization vs constellation API query shape (OGAN-16)', () => {
  test('/visualization requests cohort rows (all=1)', async ({ page }) => {
    const urls = collectVisualizationUrls(page);
    await page.goto('/visualization');
    await expect(page.getByTestId('alluvial-diagram').or(page.getByTestId('chord-diagram'))).toBeVisible({
      timeout: 20000,
    });

    expect(urls.length, `expected ≥1 visualization GET, got: ${urls.join('\n')}`).toBeGreaterThan(0);
    for (const raw of urls) {
      const u = new URL(raw);
      expect(u.searchParams.get('all'), raw).toBe('1');
      expect(u.searchParams.has('showTestData'), `showTestData must be absent for all=1: ${raw}`).toBe(
        false
      );
    }
  });

  test('/constellation requests filtered rows (all=0 + showTestData param)', async ({ page }) => {
    const urls = collectVisualizationUrls(page);
    await page.goto('/constellation');
    await expect(page.getByText('Loading visualization...')).not.toBeVisible({ timeout: 30000 });
    await expect(page.getByRole('heading', { name: 'Constellation View' })).toBeVisible({
      timeout: 20000,
    });

    expect(urls.length, `expected ≥1 visualization GET, got: ${urls.join('\n')}`).toBeGreaterThan(0);
    for (const raw of urls) {
      const u = new URL(raw);
      expect(u.searchParams.get('all'), raw).toBe('0');
      const st = u.searchParams.get('showTestData');
      expect(st === 'true' || st === 'false', `showTestData must be present and boolean-like: ${raw}`).toBe(
        true
      );
    }
  });
});
