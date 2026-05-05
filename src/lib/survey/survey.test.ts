import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { mapAnswersToSurveyResponsePayload } from './mapAnswersToSurveyResponse';
import { surveyPostBodySchema } from './schemas';
import { resetDbForTests } from '@/db/client';
import { createHarnessProfile, updateHarnessProfile } from '@/lib/storage/repositories/harness-profiles';
import { POST as postSurvey } from '@/app/api/survey/route';

const validAnswers = [
  { questionId: 'tenure_years' as const, answer: '5' },
  { questionId: 'learning_style' as const, answer: 'visual' },
  { questionId: 'shaped_by' as const, answer: 'mentor' },
  { questionId: 'peak_performance' as const, answer: 'Introvert, Morning' },
  { questionId: 'motivation' as const, answer: 'growth' },
  { questionId: 'unique_quality' as const, answer: 'Curious collaborator' },
  { questionId: 'questions' as const, answer: 'How should I prioritize handoffs?' },
];

afterEach(() => {
  resetDbForTests();
  delete process.env.OPENGRIMOIRE_DB_PATH;
  delete process.env.SURVEY_POST_REQUIRE_TOKEN;
  delete process.env.SURVEY_POST_CAPTCHA_REQUIRED;
  delete process.env.TURNSTILE_SECRET_KEY;
});

describe('surveyPostBodySchema', () => {
  it('accepts a valid body (happy path)', () => {
    const body = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      isAnonymous: false,
      answers: validAnswers,
    };
    const parsed = surveyPostBodySchema.safeParse(body);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.firstName).toBe('Jane');
      expect(parsed.data.sessionType).toBe('profile');
      expect(parsed.data.questionnaireVersion).toBe('v1');
    }
  });

  it('rejects unknown keys on outer object (.strict)', () => {
    const parsed = surveyPostBodySchema.safeParse({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      answers: [{ questionId: 'tenure_years', answer: '1' }],
      extraField: true,
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const parsed = surveyPostBodySchema.safeParse({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'not-an-email',
      answers: [{ questionId: 'tenure_years', answer: '1' }],
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects empty answers array', () => {
    const parsed = surveyPostBodySchema.safeParse({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      answers: [],
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects answers array longer than 64 rows', () => {
    const answers = Array.from({ length: 65 }, (_, i) => ({
      questionId: `q_${i}`,
      answer: 'x',
    }));
    const parsed = surveyPostBodySchema.safeParse({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      answers,
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const tooMany = parsed.error.issues.some(
        (issue) => issue.path.join('.') === 'answers' && issue.code === 'too_big'
      );
      expect(tooMany).toBe(true);
    }
  });

  it('requires email when not anonymous', () => {
    const parsed = surveyPostBodySchema.safeParse({
      firstName: 'Jane',
      lastName: 'Doe',
      isAnonymous: false,
      answers: [{ questionId: 'tenure_years', answer: '1' }],
    });
    expect(parsed.success).toBe(false);
  });

  it('accepts optional turnstileToken', () => {
    const body = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      isAnonymous: false,
      answers: validAnswers,
      turnstileToken: 'turnstile-response-token',
    };
    const parsed = surveyPostBodySchema.safeParse(body);
    expect(parsed.success).toBe(true);
  });

  it('rejects unsupported sessionType/questionnaireVersion pair', () => {
    const parsed = surveyPostBodySchema.safeParse({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      sessionType: 'profile',
      questionnaireVersion: 'v999',
      answers: validAnswers,
    });
    expect(parsed.success).toBe(false);
  });
});

describe('mapAnswersToSurveyResponsePayload', () => {
  it('maps answers to survey_responses fields (happy path)', () => {
    const mapped = mapAnswersToSurveyResponsePayload({ answers: validAnswers });
    expect(mapped.ok).toBe(true);
    if (mapped.ok) {
      expect(mapped.data.surveyResponse).toEqual({
        session_type: 'profile',
        questionnaire_version: 'v1',
        tenure_years: 5,
        learning_style: 'visual',
        shaped_by: 'mentor',
        peak_performance: 'Introvert, Morning',
        motivation: 'growth',
        unique_quality: 'Curious collaborator',
      });
      expect(mapped.data.categories).toEqual([
        {
          category: 'questions',
          content: 'How should I prioritize handoffs?',
        },
      ]);
    }
  });

  it('returns error for unknown questionId', () => {
    const mapped = mapAnswersToSurveyResponsePayload({
      answers: [
        { questionId: 'tenure_years', answer: '1' },
        { questionId: 'not_a_column', answer: 'x' },
      ],
    });
    expect(mapped.ok).toBe(false);
    if (!mapped.ok) {
      expect(mapped.error.message).toContain('Unknown questionId');
    }
  });

  it('last duplicate questionId wins', () => {
    const mapped = mapAnswersToSurveyResponsePayload({
      answers: [
        { questionId: 'tenure_years', answer: '1' },
        { questionId: 'tenure_years', answer: '7' },
      ],
    });
    expect(mapped.ok).toBe(true);
    if (mapped.ok) {
      expect(mapped.data.surveyResponse.tenure_years).toBe(7);
    }
  });
});

describe('survey persistence', () => {
  it('persists a selected harness profile submitted to the survey route', async () => {
    process.env.OPENGRIMOIRE_DB_PATH = ':memory:';

    const profile = createHarnessProfile({
      name: 'Focused verifier',
      purpose: 'Preserve the submitted profile association.',
      question_strategy: 'Ask focused follow-ups.',
      risk_posture: 'Low risk tolerance.',
      preferred_clarification_modes: ['checklist'],
      output_style: 'Structured bullets.',
      is_default: true,
    });

    const response = await postSurvey(
      new Request('http://localhost/api/survey', {
        method: 'POST',
        body: JSON.stringify({
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane-persistence@example.com',
          isAnonymous: false,
          answers: validAnswers,
          harnessProfileId: profile.id,
        }),
      })
    );
    const body = (await response.json()) as { harnessProfileId?: string };

    expect(response.status).toBe(200);
    expect(body.harnessProfileId).toBe(profile.id);
  });
});

describe('harness profile persistence', () => {
  it('does not clear the current default when a default update targets a missing profile', () => {
    process.env.OPENGRIMOIRE_DB_PATH = ':memory:';

    const profile = createHarnessProfile({
      name: 'Current default',
      purpose: 'Stay default if the target profile does not exist.',
      question_strategy: 'Ask broad questions.',
      risk_posture: 'Moderate risk acceptance.',
      preferred_clarification_modes: ['short_free_text'],
      output_style: 'Structured bullets.',
      is_default: true,
    });

    const updated = updateHarnessProfile('00000000-0000-4000-8000-000000000000', {
      is_default: true,
    });

    expect(updated).toBeNull();
    expect(updateHarnessProfile(profile.id, { name: 'Still default' })?.is_default).toBe(true);
  });
});
