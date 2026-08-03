import { test, expect } from '@playwright/test';

import { loginAsAdmin } from './helpers/admin-login';

async function fillSyncSessionThroughSubmit(page: import('@playwright/test').Page) {
  await expect(page.getByTestId('sync-session-form-container')).toBeVisible({ timeout: 15000 });
  await page.getByTestId('name-input').fill('Park');
  await page.getByTestId('email-input').fill('park@example.com');
  await page.getByTestId('next-button').click();
  await page.getByTestId('session-intent-input').fill('Parking lot e2e');
  await page.getByTestId('next-button').click();
  await page.getByTestId('session-context-input').fill('Success deferred questions');
  await page.getByTestId('next-button').click();
  await page.getByText('Mentorship').first().click();
  await page.getByTestId('next-button').click();
  await page.getByTestId('working-style-collaborative').click();
  await page.getByTestId('next-button').click();
  await page.getByTestId('constraints-input').fill('none');
  await page.getByTestId('next-button').click();
  await page.getByTestId('unique-quality-input').fill('parking lot unique');
  await page.getByTestId('submit-button').click();
}

test.describe('Sync Session Success parking lot', () => {
  test('anonymous success shows login CTA for deferred questions', async ({ page }) => {
    const bootstrapOk = page.waitForResponse(
      (res) =>
        res.url().includes('/api/survey/bootstrap-token') &&
        res.request().method() === 'GET' &&
        res.ok(),
      { timeout: 15000 }
    );
    await page.goto('/operator-intake');
    await bootstrapOk;
    await fillSyncSessionThroughSubmit(page);
    await expect(page.getByTestId('success-step')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('success-parking-lot')).toBeVisible();
    await expect(page.getByTestId('success-parking-login-cta')).toBeVisible();
  });

  test('operator can inline-resolve a parked clarification on Success', async ({ page }) => {
    await loginAsAdmin(page);

    const create = await page.request.post('/api/admin/clarification-requests', {
      data: {
        question_spec: {
          kind: 'text',
          prompt: 'E2E parked: confirm Next focus after Sync?',
          multiline: true,
        },
        agent_metadata: {
          blocking: false,
          project: 'MiscRepos',
          reason: 'parking-lot e2e',
        },
      },
    });
    expect(create.ok(), await create.text()).toBeTruthy();
    const created = (await create.json()) as { item?: { id: string } };
    const id = created.item?.id;
    expect(id).toBeTruthy();

    const bootstrapOk = page.waitForResponse(
      (res) =>
        res.url().includes('/api/survey/bootstrap-token') &&
        res.request().method() === 'GET' &&
        res.ok(),
      { timeout: 15000 }
    );
    await page.goto('/operator-intake');
    await bootstrapOk;
    await fillSyncSessionThroughSubmit(page);

    await expect(page.getByTestId('success-step')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('success-parking-lot')).toBeVisible();
    const item = page.getByTestId(`success-parking-item-${id}`);
    await expect(item).toBeVisible({ timeout: 15000 });
    await expect(item).toContainText('E2E parked');
    await expect(page.getByText('MiscRepos', { exact: true }).first()).toBeVisible();

    await page.getByTestId(`success-parking-toggle-${id}`).click();
    await expect(page.getByTestId('dynamic-question-panel')).toBeVisible();
    await page.getByTestId('clarification-text-answer').fill('Yes — keep OR-VERIFY-1');
    await page.getByTestId(`success-parking-answer-${id}`).click();
    await expect(page.getByTestId(`success-parking-item-${id}`)).toHaveCount(0, { timeout: 15000 });
  });
});
