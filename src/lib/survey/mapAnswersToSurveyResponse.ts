import { z } from 'zod';

import type { SurveyResponseRow } from '@/lib/types/database';

type LearningStyle = NonNullable<SurveyResponseRow['learning_style']>;
type ShapedBy = NonNullable<SurveyResponseRow['shaped_by']>;
type PeakPerformance = NonNullable<SurveyResponseRow['peak_performance']>;
type Motivation = NonNullable<SurveyResponseRow['motivation']>;

export const INTENT_CATEGORIES = [
  'questions',
  'concerns',
  'needs',
  'accomplishments',
  'stats',
  'constraints',
  'signals',
] as const;

export type IntentCategory = (typeof INTENT_CATEGORIES)[number];
export type SessionType = string;
export type QuestionnaireVersion = string;

const LEARNING_STYLE = z.enum(['visual', 'auditory', 'kinesthetic', 'reading_writing']);
const SHAPED_BY = z.enum(['mentor', 'challenge', 'failure', 'success', 'team', 'other']);
const PEAK_PERFORMANCE = z.enum([
  'Extrovert, Morning',
  'Extrovert, Evening',
  'Introvert, Morning',
  'Introvert, Night',
  'Ambivert, Morning',
  'Ambivert, Night',
]);
const MOTIVATION = z.enum(['impact', 'growth', 'recognition', 'autonomy', 'purpose']);

/** Payload for createSurveyResponse (excluding attendee_id). */
export type SurveyResponseFields = {
  session_type: SessionType;
  questionnaire_version: QuestionnaireVersion;
  tenure_years?: number;
  learning_style?: LearningStyle;
  shaped_by?: ShapedBy;
  peak_performance?: PeakPerformance;
  motivation?: Motivation;
  unique_quality?: string;
};

export type SurveyAnswerRow = {
  questionId: string;
  answer: string;
};

export type IntentCategoryPayload = {
  category: IntentCategory;
  content: string;
};

type QuestionnaireMapper = {
  knownQuestionIds: ReadonlySet<string>;
  map: (answersById: Map<string, string>) =>
    | { ok: true; data: Omit<SurveyResponseFields, 'session_type' | 'questionnaire_version'>; categories: IntentCategoryPayload[] }
    | { ok: false; error: MapAnswersError };
};

const profileV1QuestionIds = new Set([
  'tenure_years',
  'learning_style',
  'shaped_by',
  'peak_performance',
  'motivation',
  'unique_quality',
  ...INTENT_CATEGORIES,
]);

function mapProfileV1(answersById: Map<string, string>) {
  const out: Omit<SurveyResponseFields, 'session_type' | 'questionnaire_version'> = {};
  const categories: IntentCategoryPayload[] = [];

  for (const [questionId, raw] of Array.from(answersById.entries())) {
    if (!profileV1QuestionIds.has(questionId)) {
      return {
        ok: false as const,
        error: { message: `Unknown questionId: ${questionId}`, field: questionId },
      };
    }

    const trimmed = raw.trim();
    if (trimmed === '') {
      continue;
    }

    if ((INTENT_CATEGORIES as readonly string[]).includes(questionId)) {
      categories.push({ category: questionId as IntentCategory, content: trimmed });
      continue;
    }

    switch (questionId) {
      case 'tenure_years': {
        const n = Number(trimmed);
        if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0 || n > 80) {
          return {
            ok: false as const,
            error: {
              message: 'tenure_years must be an integer from 0 to 80',
              field: 'tenure_years',
            },
          };
        }
        out.tenure_years = n;
        break;
      }
      case 'learning_style': {
        const p = LEARNING_STYLE.safeParse(trimmed);
        if (!p.success) {
          return {
            ok: false as const,
            error: { message: 'Invalid learning_style value', field: 'learning_style' },
          };
        }
        out.learning_style = p.data;
        break;
      }
      case 'shaped_by': {
        const p = SHAPED_BY.safeParse(trimmed);
        if (!p.success) {
          return {
            ok: false as const,
            error: { message: 'Invalid shaped_by value', field: 'shaped_by' },
          };
        }
        out.shaped_by = p.data;
        break;
      }
      case 'peak_performance': {
        const p = PEAK_PERFORMANCE.safeParse(trimmed);
        if (!p.success) {
          return {
            ok: false as const,
            error: { message: 'Invalid peak_performance value', field: 'peak_performance' },
          };
        }
        out.peak_performance = p.data;
        break;
      }
      case 'motivation': {
        const p = MOTIVATION.safeParse(trimmed);
        if (!p.success) {
          return {
            ok: false as const,
            error: { message: 'Invalid motivation value', field: 'motivation' },
          };
        }
        out.motivation = p.data;
        break;
      }
      case 'unique_quality': {
        if (trimmed.length > 4000) {
          return {
            ok: false as const,
            error: { message: 'unique_quality exceeds max length', field: 'unique_quality' },
          };
        }
        out.unique_quality = trimmed;
        break;
      }
      default:
        break;
    }
  }

  return { ok: true as const, data: out, categories };
}

const QUESTIONNAIRE_MAPPERS: Record<string, Record<string, QuestionnaireMapper>> = {
  profile: {
    v1: {
      knownQuestionIds: profileV1QuestionIds,
      map: mapProfileV1,
    },
  },
};

export type MapAnswersError = {
  message: string;
  field?: string;
};

export type MapAnswersSuccess = {
  surveyResponse: SurveyResponseFields;
  categories: IntentCategoryPayload[];
};

export function hasQuestionnaireMapper(sessionType: string, questionnaireVersion: string): boolean {
  return Boolean(
    QUESTIONNAIRE_MAPPERS[sessionType as SessionType]?.[
      questionnaireVersion as QuestionnaireVersion
    ]
  );
}

/**
 * Maps validated POST body answers to survey_responses columns.
 * Duplicate questionId: last wins.
 */
export function mapAnswersToSurveyResponsePayload(args: {
  answers: SurveyAnswerRow[];
  sessionType?: SessionType;
  questionnaireVersion?: QuestionnaireVersion;
}): { ok: true; data: MapAnswersSuccess } | { ok: false; error: MapAnswersError } {
  const sessionType = args.sessionType ?? 'profile';
  const questionnaireVersion = args.questionnaireVersion ?? 'v1';
  const mapper = QUESTIONNAIRE_MAPPERS[sessionType]?.[questionnaireVersion];

  if (!mapper) {
    return {
      ok: false,
      error: {
        message: `Unsupported questionnaire mapper for session_type=${sessionType}, questionnaire_version=${questionnaireVersion}`,
      },
    };
  }

  const byId = new Map<string, string>();
  for (const row of args.answers) {
    byId.set(row.questionId, row.answer);
  }

  const mapped = mapper.map(byId);
  if (!mapped.ok) {
    return mapped;
  }

  return {
    ok: true,
    data: {
      surveyResponse: {
        session_type: sessionType,
        questionnaire_version: questionnaireVersion,
        ...mapped.data,
      },
      categories: mapped.categories,
    },
  };
}

export function getKnownQuestionIds(sessionType: string, questionnaireVersion: string) {
  return QUESTIONNAIRE_MAPPERS[sessionType]?.[questionnaireVersion]?.knownQuestionIds ?? new Set<string>();
}
