import { test, expect } from '@playwright/test';

/**
 * OA-3: /brain-map is an alias route (redirect → /context-atlas).
 * Parity = same user-visible shell after navigation as direct /context-atlas.
 */
test.describe('Brain map route (/brain-map)', () => {
  test('redirects to /context-atlas', async ({ page }) => {
    await page.goto('/brain-map');
    await expect(page).toHaveURL(/\/context-atlas(?:\/)?$/);
  });

  test('after redirect, graph shell matches context-atlas smoke expectations', async ({ page }) => {
    await page.goto('/brain-map');
    await expect(page).toHaveURL(/\/context-atlas/);
    await expect(
      page.getByText(/Loading brain map|Loading context graph|Co-access|No nodes|nodes/)
    ).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('brain-map-graph')).toBeVisible({ timeout: 15000 });
  });

  test('heading parity with context-atlas', async ({ page }) => {
    await page.goto('/brain-map');
    await expect(page).toHaveURL(/\/context-atlas/);
    await expect(page.getByRole('heading', { name: /context graph/ })).toBeVisible({ timeout: 10000 });
  });
});
