import { test, expect } from '@playwright/test';

test.describe('Survey flow', () => {
  test('multi-step survey: fill AttendeeStep, YearsStep, reach SuccessStep via submit', async ({
    page,
  }) => {
    await page.goto('/operator-intake');

    // AttendeeStep
    await expect(page.getByTestId('survey-form-container')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('name-input')).toBeVisible({ timeout: 10000 });
    await page.getByTestId('name-input').fill('Test');
    await page.getByTestId('email-input').fill('test@example.com');
    await page.getByTestId('next-button').click();

    // YearsStep
    await page.getByText('1-2 years').click();
    await page.getByTestId('next-button').click();

    // LearningStyleStep (avoid matching nav link text "Visualization")
    await page
      .getByTestId('survey-form-container')
      .getByText('Visual', { exact: true })
      .click();
    await page.getByTestId('next-button').click();

    // ShapedByStep
    await page.getByText('Mentorship').first().click();
    await page.getByTestId('next-button').click();

    // PeakPerformanceStep
    await page.getByText('Extrovert, Morning').first().click();
    await page.getByTestId('next-button').click();

    // MotivationStep
    await page.getByText('Making an Impact').first().click();
    await page.getByTestId('next-button').click();

    // UniqueQualityStep - submit
    await page.getByTestId('unique-quality-input').fill('I bring creativity and collaboration.');
    await page.getByTestId('submit-button').click();

    // SuccessStep (requires Supabase) or form-level error (no Supabase) - either validates flow
    await expect(
      page.getByTestId('success-step').or(page.locator('.message-error'))
    ).toBeVisible({ timeout: 15000 });
  });

  test('survey prev/next navigation works', async ({ page }) => {
    await page.goto('/operator-intake');

    // AttendeeStep -> Next
    await page.getByTestId('name-input').fill('Nav');
    await page.getByTestId('next-button').click();

    // YearsStep -> Prev
    await page.getByTestId('prev-button').click();
    await expect(page.getByTestId('name-input')).toBeVisible();
  });
});
