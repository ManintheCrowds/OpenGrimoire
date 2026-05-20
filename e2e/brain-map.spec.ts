import { test, expect } from '@playwright/test';

test.describe('Brain map route (/brain-map)', () => {
  test('canonical /brain-map loads graph shell', async ({ page }) => {
    await page.goto('/brain-map');
    await expect(page).toHaveURL(/\/brain-map(?:\/)?$/);
    await expect(page.getByRole('heading', { name: /Brain Map/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('brain-map-graph')).toBeVisible({ timeout: 15000 });
  });

  test('/context-atlas redirects to /brain-map', async ({ page }) => {
    await page.goto('/context-atlas');
    await expect(page).toHaveURL(/\/brain-map(?:\/)?$/);
  });
});
