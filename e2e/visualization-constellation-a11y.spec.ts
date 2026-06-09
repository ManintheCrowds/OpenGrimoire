/**
 * OGAN-15 — axe-playwright on `/visualization` and `/constellation`.
 * Theme matrix matches OG-GUI-04 (see sync-session-admin-a11y.spec.ts).
 *
 * `@react-three/fiber` renders a WebGL `<canvas>` that axe cannot treat like
 * structured HTML; we **exclude `canvas`** so CI asserts shell chrome (headings,
 * controls, regions) without false positives on the GL surface. `/visualization`
 * runs axe on Alluvial (default) and Chord tab states. Keyboard focus inside
 * the Three scene remains a **product / AT** follow-up — see
 * `docs/audit/gui-2026-04-16-opengrimoire-data-viz.md` §3.
 */
import { AxeBuilder } from '@axe-core/playwright';
import { test, expect, type Page } from '@playwright/test';

import { APP_THEMES, setAppTheme } from './helpers/theme';

function violationSummary(violations: { id: string; nodes: { html: string }[] }[]): string {
  return violations
    .map((v) => `${v.id}: ${v.nodes.map((n) => n.html).slice(0, 5).join(' | ')}`)
    .join('\n');
}

function runVizAxe(page: Page) {
  return new AxeBuilder({ page }).exclude('canvas').analyze();
}

for (const theme of APP_THEMES) {
  test.describe(`Visualization + constellation axe (OGAN-15) — ${theme} theme`, () => {
    test.beforeEach(async ({ page }) => {
      await setAppTheme(page, theme);
    });

    test('/visualization passes axe with canvas excluded (Alluvial + Chord tabs)', async ({ page }) => {
      await page.goto('/visualization');
      await expect(page.locator('[data-region="opengrimoire-viz-header"]')).toBeVisible({ timeout: 20000 });
      await expect(page.locator('[data-region="opengrimoire-viz-controls"]')).toBeVisible({ timeout: 20000 });
      await expect(page.getByTestId('alluvial-diagram')).toBeVisible({ timeout: 20000 });

      let result = await runVizAxe(page);
      expect(result.violations, violationSummary(result.violations)).toHaveLength(0);

      await page.getByRole('tab', { name: 'Chord' }).click();
      await expect(page.getByTestId('chord-diagram')).toBeVisible({ timeout: 20000 });
      await expect(page.getByTestId('alluvial-diagram')).toHaveCount(0);

      result = await runVizAxe(page);
      expect(result.violations, violationSummary(result.violations)).toHaveLength(0);
    });

    test('/constellation passes axe with canvas excluded', async ({ page }) => {
      await page.goto('/constellation');
      await expect(page.getByTestId('opengrimoire-viz-constellation-route-loading')).not.toBeVisible({
        timeout: 30000,
      });
      await expect(page.getByRole('heading', { name: 'Constellation View' })).toBeVisible({
        timeout: 20000,
      });

      const { violations } = await runVizAxe(page);
      expect(violations, violationSummary(violations)).toHaveLength(0);
    });
  });
}
