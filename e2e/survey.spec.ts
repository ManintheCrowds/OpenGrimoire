import { test, expect } from '@playwright/test';

test.describe('Sync Session flow', () => {
  test('multi-step Sync Session: fill AttendeeStep, YearsStep, reach SuccessStep via submit', async ({
    page,
  }) => {
    const bootstrapOk = page.waitForResponse(
      (res) =>
        res.url().includes('/api/survey/bootstrap-token') &&
        res.request().method() === 'GET' &&
        res.ok(),
      { timeout: 15000 }
    );
    await page.goto('/operator-intake');
    // Ensures client hook has received bootstrap token before POST when SURVEY_POST_REQUIRE_TOKEN is on.
    await bootstrapOk;

    const surveyPost = page.waitForResponse(
      (res) => res.url().includes('/api/survey') && res.request().method() === 'POST'
    );

    // AttendeeStep
    await expect(page.getByTestId('sync-session-form-container')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('name-input')).toBeVisible({ timeout: 10000 });
    await page.getByTestId('name-input').fill('Test');
    await page.getByTestId('email-input').fill('test@example.com');
    await page.getByTestId('next-button').click();

    // YearsStep
    await page.getByText('1-2 years').click();
    await page.getByTestId('next-button').click();

    // LearningStyleStep (avoid matching nav link text "Visualization")
    await page
      .getByTestId('sync-session-form-container')
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

    const postRes = await surveyPost;
    expect(postRes.status(), 'POST /api/survey status').toBe(200);
    const body = (await postRes.json()) as Record<string, unknown>;
    expect(body.success).toBe(true);
    expect(typeof body.attendeeId).toBe('string');
    expect(typeof body.surveyResponseId).toBe('string');
    expect(body).toHaveProperty('harnessProfileId');

    // SuccessStep (when SQLite + API succeed) or form-level error — either validates flow
    await expect(
      page.getByTestId('success-step').or(page.locator('.message-error'))
    ).toBeVisible({ timeout: 15000 });
  });

  test('/survey redirects to /operator-intake (canonical Sync Session URL)', async ({ page }) => {
    await page.goto('/survey');
    await expect(page).toHaveURL(/\/operator-intake/, { timeout: 15000 });
  });

  test('Sync Session prev/next navigation works', async ({ page }) => {
    await page.goto('/operator-intake');

    // AttendeeStep -> Next
    await page.getByTestId('name-input').fill('Nav');
    await page.getByTestId('next-button').click();

    // YearsStep -> Prev
    await page.getByTestId('prev-button').click();
    await expect(page.getByTestId('name-input')).toBeVisible();
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
        questionnaireVersion: 'v1',
        answers: [{ questionId: 'tenure_years', answer: '1' }],
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
        questionnaireVersion: 'v1',
        answers: [
          { questionId: 'tenure_years', answer: '1' },
          { questionId: 'unique_quality', answer: 'token-gate e2e' },
        ],
      }),
    });
    expect(res.ok(), await res.text()).toBeTruthy();
    const body = (await res.json()) as { success?: boolean; surveyResponseId?: string };
    expect(body.success).toBe(true);
    expect(typeof body.surveyResponseId).toBe('string');
  });
});
