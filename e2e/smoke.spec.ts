import { test, expect } from '@playwright/test';

/**
 * Minimal local-dev smoke: `/` plus one product-critical route (`/context-atlas`).
 * Broader nav and admin flows live in dedicated specs (see package.json `test:e2e:*`).
 */
test.describe('Local dev smoke', () => {
  test('home loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'OpenGrimoire' })).toBeVisible();
  });

  test('brain map loads', async ({ page }) => {
    await page.goto('/brain-map');
    await expect(
      page.getByText(/Loading brain map|Loading context graph|Co-access|No nodes|nodes/)
    ).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('brain-map-graph')).toBeVisible({ timeout: 15000 });
  });
});
