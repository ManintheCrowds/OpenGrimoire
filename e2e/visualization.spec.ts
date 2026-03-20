import { test, expect } from '@playwright/test';

test.describe('Visualization', () => {
  test('/visualization loads with Alluvial or Chord diagram', async ({ page }) => {
    await page.goto('/visualization');

    // Either alluvial or chord container should be present (default is alluvial)
    const alluvial = page.getByTestId('alluvial-diagram');
    const chord = page.getByTestId('chord-diagram');

    await expect(alluvial.or(chord)).toBeVisible({ timeout: 10000 });
  });

  test('SVG or canvas present for visualization', async ({ page }) => {
    await page.goto('/visualization');

    // Alluvial uses SVG; Chord may use SVG or canvas
    await page.waitForSelector('svg, canvas', { timeout: 10000 });
    const svg = await page.locator('svg').first();
    const canvas = await page.locator('canvas').first();

    await expect(svg.or(canvas)).toBeVisible();
  });
});
