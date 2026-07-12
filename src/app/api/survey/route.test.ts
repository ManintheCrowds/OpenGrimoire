import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createAttendee: vi.fn(),
  createSurveyResponse: vi.fn(),
  getHarnessProfileById: vi.fn(),
  isSurveyPostCaptchaRequired: vi.fn(),
  isSurveyPostTokenRequired: vi.fn(),
  verifySurveyPostBootstrapToken: vi.fn(),
  verifyTurnstileToken: vi.fn(),
}));

vi.mock('@/lib/storage/repositories/survey', () => ({
  createAttendee: mocks.createAttendee,
  createSurveyResponse: mocks.createSurveyResponse,
}));

vi.mock('@/lib/storage/repositories/harness-profiles', () => ({
  getHarnessProfileById: mocks.getHarnessProfileById,
}));

vi.mock('@/lib/survey/survey-post-captcha', () => ({
  isSurveyPostCaptchaRequired: mocks.isSurveyPostCaptchaRequired,
  verifyTurnstileToken: mocks.verifyTurnstileToken,
}));

vi.mock('@/lib/survey/survey-post-bootstrap', () => ({
  isSurveyPostTokenRequired: mocks.isSurveyPostTokenRequired,
  verifySurveyPostBootstrapToken: mocks.verifySurveyPostBootstrapToken,
}));

import { POST } from './route';

const harnessProfileId = '123e4567-e89b-12d3-a456-426614174000';
const attendeeId = '123e4567-e89b-12d3-a456-426614174001';
const surveyResponseId = '123e4567-e89b-12d3-a456-426614174002';

describe('POST /api/survey', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isSurveyPostTokenRequired.mockReturnValue(false);
    mocks.isSurveyPostCaptchaRequired.mockReturnValue(false);
    mocks.getHarnessProfileById.mockReturnValue({ id: harnessProfileId, name: 'Focused profile' });
    mocks.createAttendee.mockReturnValue({
      id: attendeeId,
      first_name: 'Ada',
      last_name: 'Lovelace',
      email: 'ada@example.com',
      is_anonymous: false,
      created_at: '2026-07-12T00:00:00.000Z',
      updated_at: '2026-07-12T00:00:00.000Z',
    });
    mocks.createSurveyResponse.mockImplementation((data: {
      attendee_id: string;
      session_type?: string;
      questionnaire_version?: string;
      harness_profile_id?: string | null;
      learning_style?: string | null;
      shaped_by?: string | null;
      unique_quality?: string | null;
    }) => ({
      id: surveyResponseId,
      attendee_id: data.attendee_id,
      session_type: data.session_type,
      questionnaire_version: data.questionnaire_version,
      harness_profile_id: data.harness_profile_id,
      tenure_years: null,
      learning_style: data.learning_style ?? null,
      shaped_by: data.shaped_by ?? null,
      peak_performance: null,
      motivation: null,
      unique_quality: data.unique_quality ?? null,
      status: 'pending',
      moderated_at: null,
      test_data: false,
      created_at: '2026-07-12T00:00:00.000Z',
      updated_at: '2026-07-12T00:00:00.000Z',
    }));
  });

  it('persists the validated harness profile id with the survey response', async () => {
    const request = new Request('http://localhost/api/survey', {
      method: 'POST',
      body: JSON.stringify({
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        isAnonymous: false,
        sessionType: 'profile',
        questionnaireVersion: 'v2',
        harnessProfileId,
        answers: [
          { questionId: 'session_intent', answer: 'Tune the OpenHarness handoff' },
          { questionId: 'session_context', answer: 'Operator is preparing a local run' },
          { questionId: 'shaped_by', answer: 'mentor' },
          { questionId: 'working_style', answer: 'structured' },
          { questionId: 'constraints', answer: 'No production secrets' },
          { questionId: 'unique_quality', answer: 'Systems thinking' },
        ],
      }),
    });

    const response = await POST(request);
    const payload = await response.json() as Record<string, unknown>;

    expect(response.status).toBe(200);
    expect(mocks.getHarnessProfileById).toHaveBeenCalledWith(harnessProfileId);
    expect(mocks.createSurveyResponse).toHaveBeenCalledWith(
      expect.objectContaining({
        attendee_id: attendeeId,
        harness_profile_id: harnessProfileId,
      })
    );
    expect(payload).toMatchObject({
      success: true,
      surveyResponseId,
      harnessProfileId,
    });
  });
});
