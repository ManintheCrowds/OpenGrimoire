import { test, expect } from '@playwright/test';

/**
 * OGAN-04 — standalone /visualization/alluvial must not show mock cohort without a banner.
 */
test.describe('Visualization mock-data banner', () => {
  test('/visualization/alluvial shows banner when survey visualization API returns empty data', async ({
    page,
  }) => {
    await page.route(/\/api\/survey\/visualization\?.*all=1/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      });
    });

    await page.goto('/visualization/alluvial');
    await expect(page.getByTestId('opengrimoire-viz-mock-data-banner')).toBeVisible({ timeout: 30000 });
  });
});
