/**
 * OGAN-15 — axe-playwright on `/visualization` and `/constellation`.
 *
 * `@react-three/fiber` renders a WebGL `<canvas>` that axe cannot treat like
 * structured HTML; we **exclude `canvas`** so CI asserts shell chrome (headings,
 * controls, regions) without false positives on the GL surface. Keyboard focus
 * inside the Three scene remains a **product / AT** follow-up — see
 * `docs/audit/gui-2026-04-16-opengrimoire-data-viz.md` §3.
 */
import { AxeBuilder } from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

function violationSummary(violations: { id: string; nodes: { html: string }[] }[]): string {
  return violations
    .map((v) => `${v.id}: ${v.nodes.map((n) => n.html).slice(0, 5).join(' | ')}`)
    .join('\n');
}

test.describe('Visualization + constellation axe (OGAN-15)', () => {
  test('/visualization passes axe with canvas excluded', async ({ page }) => {
    await page.goto('/visualization');
    await expect(page.getByTestId('alluvial-diagram').or(page.getByTestId('chord-diagram'))).toBeVisible({
      timeout: 20000,
    });

    const { violations } = await new AxeBuilder({ page }).exclude('canvas').analyze();
    expect(violations, violationSummary(violations)).toHaveLength(0);
  });

  test('/constellation passes axe with canvas excluded', async ({ page }) => {
    await page.goto('/constellation');
    await expect(page.getByText('Loading visualization...')).not.toBeVisible({ timeout: 30000 });
    await expect(page.getByRole('heading', { name: 'Constellation View' })).toBeVisible({
      timeout: 20000,
    });

    const { violations } = await new AxeBuilder({ page }).exclude('canvas').analyze();
    expect(violations, violationSummary(violations)).toHaveLength(0);
  });
});
