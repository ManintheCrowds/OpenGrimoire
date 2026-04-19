/**
 * OG-GUI-06 — Percy visual baselines for Sync Session + admin moderation queue.
 * Run via `npm run test:e2e:visual` (wraps Playwright with `percy exec`).
 */
import percySnapshot from '@percy/playwright';
import { test, expect } from '@playwright/test';

import { loginAsAdmin } from './helpers/admin-login';

function minimalSurveyBody() {
  return {
    firstName: 'Percy',
    lastName: 'Visual',
    isAnonymous: true,
    sessionType: 'profile',
    questionnaireVersion: 'v1',
    answers: [
      { questionId: 'tenure_years', answer: '2' },
      { questionId: 'learning_style', answer: 'visual' },
      { questionId: 'unique_quality', answer: 'OG-GUI-06 Percy baseline seed.' },
    ],
  };
}

test.describe.configure({ mode: 'serial' });

test.describe('OG-GUI-06 Percy visual baselines', () => {
  test('operator-intake attendee step', async ({ page }) => {
    const bootstrapOk = page.waitForResponse(
      (res) =>
        res.url().includes('/api/survey/bootstrap-token') &&
        res.request().method() === 'GET' &&
        res.ok(),
      { timeout: 15000 }
    );
    await page.goto('/operator-intake');
    await bootstrapOk;
    await expect(page.getByTestId('sync-session-form-container')).toBeVisible({ timeout: 15000 });

    await percySnapshot(page, 'og-gui-06-operator-intake-attendee-step');
  });

  test('admin moderation queue with seeded row', async ({ page }) => {
    const seed = await page.request.post('/api/survey', {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify(minimalSurveyBody()),
    });
    expect(seed.ok(), await seed.text()).toBeTruthy();
    const created = (await seed.json()) as { surveyResponseId?: string };
    const surveyResponseId = created.surveyResponseId;
    expect(surveyResponseId && /^[0-9a-f-]{36}$/i.test(surveyResponseId)).toBeTruthy();

    await loginAsAdmin(page);
    await expect(page.getByRole('heading', { name: /Response Moderation Queue/i })).toBeVisible({
      timeout: 20000,
    });
    await expect(page.getByTestId(`moderation-queue-item-${surveyResponseId}`)).toBeVisible({
      timeout: 15000,
    });

    await percySnapshot(page, 'og-gui-06-admin-moderation-queue');
  });
});
