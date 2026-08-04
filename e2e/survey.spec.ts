import { test, expect } from '@playwright/test';

test.describe('Sync Session flow (v2)', () => {
  test('multi-step Sync Session v2: reach SuccessStep via submit', async ({ page }) => {
    const bootstrapOk = page.waitForResponse(
      (res) =>
        res.url().includes('/api/survey/bootstrap-token') &&
        res.request().method() === 'GET' &&
        res.ok(),
      { timeout: 15000 }
    );
    await page.goto('/operator-intake');
    await bootstrapOk;

    const surveyPost = page.waitForResponse(
      (res) => res.url().includes('/api/survey') && res.request().method() === 'POST'
    );

    await expect(page.getByTestId('sync-session-form-container')).toBeVisible({ timeout: 15000 });
    await page.getByTestId('name-input').fill('Test');
    await page.getByTestId('email-input').fill('test@example.com');
    await page.getByTestId('next-button').click();

    await page.getByTestId('session-intent-input').fill('Align agent memory for this sprint');
    await page.getByTestId('next-button').click();

    await page.getByTestId('session-context-input').fill('Working locally on OpenGrimoire operator flows');
    await page.getByTestId('next-button').click();

    await page.getByText('Mentorship').first().click();
    await page.getByTestId('next-button').click();

    await page.getByTestId('working-style-collaborative').click();
    await page.getByTestId('next-button').click();

    await page.getByTestId('constraints-input').fill('No production deploy this week');
    await page.getByTestId('next-button').click();

    await page.getByTestId('unique-quality-input').fill('I bring creativity and collaboration.');
    await page.getByTestId('submit-button').click();

    const postRes = await surveyPost;
    expect(postRes.status(), 'POST /api/survey status').toBe(200);
    const body = (await postRes.json()) as {
      success?: boolean;
      attendeeId?: string;
      surveyResponseId?: string;
      harnessProfileId?: string | null;
    };
    expect(body.success).toBe(true);
    expect(body.attendeeId).toMatch(/^[0-9a-f-]{36}$/i);
    expect(body.surveyResponseId).toMatch(/^[0-9a-f-]{36}$/i);

    await expect(page.getByTestId('success-step')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('success-handoff-ids')).toBeVisible();
    await expect(page.getByTestId('success-attendee-id')).toHaveText(body.attendeeId as string);
    await expect(page.getByTestId('success-survey-response-id')).toHaveText(
      body.surveyResponseId as string
    );
    if (body.harnessProfileId) {
      await expect(page.getByTestId('success-harness-profile-id')).toHaveText(body.harnessProfileId);
    } else {
      await expect(page.getByTestId('success-harness-profile-id')).toHaveCount(0);
    }
  });

  test('/survey redirects to /operator-intake (canonical Sync Session URL)', async ({ page }) => {
    await page.goto('/survey');
    await expect(page).toHaveURL(/\/operator-intake/, { timeout: 15000 });
  });

  test('Sync Session shows bootstrap-token CTA when token bootstrap fails', async ({ page }) => {
    await page.route('**/api/survey/bootstrap-token', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token: null, required: true }),
      });
    });

    await page.goto('/operator-intake');
    await expect(page.getByTestId('sync-session-bootstrap-banner')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('sync-session-bootstrap-banner')).toContainText('bootstrap_token');

    await page.getByTestId('name-input').fill('Bootstrap');
    await page.getByTestId('email-input').fill('bootstrap@example.com');
    await page.getByTestId('next-button').click();
    await page.getByTestId('session-intent-input').fill('intent');
    await page.getByTestId('next-button').click();
    await page.getByTestId('session-context-input').fill('context');
    await page.getByTestId('next-button').click();
    await page.getByText('Mentorship').first().click();
    await page.getByTestId('next-button').click();
    await page.getByTestId('working-style-independent').click();
    await page.getByTestId('next-button').click();
    await page.getByTestId('next-button').click();
    await page.getByTestId('unique-quality-input').fill('bootstrap token failure');
    await page.getByTestId('submit-button').click();

    await expect(page.getByTestId('sync-session-error-kind')).toContainText('bootstrap_token');
  });
});

/** When `SURVEY_POST_REQUIRE_TOKEN=true` is passed through to the Playwright webServer (e.g. CI matrix), these run; otherwise skipped. */
test.describe('Survey POST bootstrap token (SURVEY_POST_REQUIRE_TOKEN)', () => {
  const tokenGateOn =
    process.env.SURVEY_POST_REQUIRE_TOKEN === 'true' || process.env.SURVEY_POST_REQUIRE_TOKEN === '1';

  test('POST /api/survey without x-survey-post-token returns 401', async ({ request }) => {
    test.skip(!tokenGateOn, 'Set SURVEY_POST_REQUIRE_TOKEN=true on the Playwright webServer to enable');
    const res = await request.post('/api/survey', {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({
        firstName: 'Tok',
        lastName: 'Gate',
        isAnonymous: true,
        sessionType: 'profile',
        questionnaireVersion: 'v2',
        answers: [{ questionId: 'session_intent', answer: 'test' }],
      }),
    });
    expect(res.status()).toBe(401);
  });

  test('POST /api/survey with bootstrap token returns 200', async ({ request }) => {
    test.skip(!tokenGateOn, 'Set SURVEY_POST_REQUIRE_TOKEN=true on the Playwright webServer to enable');
    const tokRes = await request.get('/api/survey/bootstrap-token');
    expect(tokRes.ok()).toBeTruthy();
    const { token } = (await tokRes.json()) as { token: string | null };
    expect(token && token.length > 10).toBeTruthy();
    const res = await request.post('/api/survey', {
      headers: {
        'Content-Type': 'application/json',
        'x-survey-post-token': token as string,
      },
      data: JSON.stringify({
        firstName: 'Tok',
        lastName: 'Ok',
        isAnonymous: true,
        sessionType: 'profile',
        questionnaireVersion: 'v2',
        answers: [
          { questionId: 'session_intent', answer: 'token-gate e2e' },
          { questionId: 'unique_quality', answer: 'token-gate e2e' },
        ],
      }),
    });
    expect(res.ok(), await res.text()).toBeTruthy();
  });
});
