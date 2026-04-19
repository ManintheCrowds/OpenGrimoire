/**
 * OA-FR-1 — moderation queue API: seed survey, operator session, PATCH, negative auth.
 */
import { test, expect } from '@playwright/test';

import { loginAsAdmin } from './helpers/admin-login';
import { E2E_ALIGNMENT_CONTEXT_API_SECRET } from './helpers/e2e-secrets';

function minimalSurveyBody() {
  return {
    firstName: 'Mod',
    lastName: 'E2E',
    isAnonymous: true,
    sessionType: 'profile',
    questionnaireVersion: 'v1',
    answers: [
      { questionId: 'tenure_years', answer: '2' },
      { questionId: 'learning_style', answer: 'visual' },
      { questionId: 'unique_quality', answer: 'E2E moderation queue seed text.' },
    ],
  };
}

test.describe('Admin moderation API', () => {
  test('seed → queue contains row → PATCH approved → 401 without session → 401 alignment key only', async ({
    page,
    request,
  }) => {
    const seed = await request.post('/api/survey', {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify(minimalSurveyBody()),
    });
    expect(seed.ok(), await seed.text()).toBeTruthy();
    const created = (await seed.json()) as { surveyResponseId?: string };
    const surveyResponseId = created.surveyResponseId;
    expect(surveyResponseId && /^[0-9a-f-]{36}$/i.test(surveyResponseId)).toBeTruthy();

    await loginAsAdmin(page);

    const queueRes = await page.request.get('/api/admin/moderation-queue');
    expect(queueRes.ok(), await queueRes.text()).toBeTruthy();
    const queueJson = (await queueRes.json()) as { items: { id: string }[] };
    const ids = queueJson.items.map((i) => i.id);
    expect(ids).toContain(surveyResponseId);

    const patchAuthed = await page.request.patch(`/api/admin/moderation/${surveyResponseId}`, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ status: 'approved', notes: 'e2e' }),
    });
    expect(patchAuthed.ok(), await patchAuthed.text()).toBeTruthy();
    const patchBody = (await patchAuthed.json()) as { moderation?: { status?: string } };
    expect(patchBody.moderation?.status).toBe('approved');

    const patchNoCookie = await request.patch(`/api/admin/moderation/${surveyResponseId}`, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ status: 'pending', notes: 'e2e-unauth' }),
    });
    expect(patchNoCookie.status()).toBe(401);

    const patchAlignmentOnly = await request.patch(`/api/admin/moderation/${surveyResponseId}`, {
      headers: {
        'Content-Type': 'application/json',
        'x-alignment-context-key': E2E_ALIGNMENT_CONTEXT_API_SECRET,
      },
      data: JSON.stringify({ status: 'pending', notes: 'e2e-alignment-only' }),
    });
    expect(patchAlignmentOnly.status()).toBe(401);
  });

  test('seed → loginAsAdmin → /admin shows moderation row for seeded response (UI)', async ({
    page,
    request,
  }) => {
    const seed = await request.post('/api/survey', {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify(minimalSurveyBody()),
    });
    expect(seed.ok(), await seed.text()).toBeTruthy();
    const created = (await seed.json()) as { surveyResponseId?: string };
    const surveyResponseId = created.surveyResponseId;
    expect(surveyResponseId && /^[0-9a-f-]{36}$/i.test(surveyResponseId)).toBeTruthy();

    const queueWait = page.waitForResponse(
      (res) =>
        res.url().includes('/api/admin/moderation-queue') &&
        res.request().method() === 'GET' &&
        res.ok()
    );

    await loginAsAdmin(page);

    const queueRes = await queueWait;
    expect(queueRes.status()).toBe(200);

    const row = page.getByTestId(`moderation-queue-item-${surveyResponseId}`);
    await expect(row).toBeVisible({ timeout: 20000 });
    await expect(row).toContainText('E2E moderation queue seed text.');
  });
});
