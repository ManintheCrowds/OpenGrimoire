import { describe, expect, it } from 'vitest';
import { mapAnswersToSurveyResponsePayload } from './mapAnswersToSurveyResponse';
import { surveyPostBodySchema } from './schemas';

const validAnswers = [
  { questionId: 'tenure_years' as const, answer: '5' },
  { questionId: 'learning_style' as const, answer: 'visual' },
  { questionId: 'shaped_by' as const, answer: 'mentor' },
  { questionId: 'peak_performance' as const, answer: 'Introvert, Morning' },
  { questionId: 'motivation' as const, answer: 'growth' },
  { questionId: 'unique_quality' as const, answer: 'Curious collaborator' },
  { questionId: 'questions' as const, answer: 'How should I prioritize handoffs?' },
];

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
