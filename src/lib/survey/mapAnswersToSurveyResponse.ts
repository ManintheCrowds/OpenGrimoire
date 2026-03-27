import { z } from 'zod';

import type { SurveyResponseRow } from '@/lib/types/database';
import type { SurveyPostBody } from './schemas';

type LearningStyle = NonNullable<SurveyResponseRow['learning_style']>;
type ShapedBy = NonNullable<SurveyResponseRow['shaped_by']>;
type PeakPerformance = NonNullable<SurveyResponseRow['peak_performance']>;
type Motivation = NonNullable<SurveyResponseRow['motivation']>;

/** Payload for createSurveyResponse (excluding attendee_id). */
export type SurveyResponseFields = {
  tenure_years?: number;
  learning_style?: LearningStyle;
  shaped_by?: ShapedBy;
  peak_performance?: PeakPerformance;
  motivation?: Motivation;
  unique_quality?: string;
};

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

const KNOWN_QUESTION_IDS = new Set([
  'tenure_years',
  'learning_style',
  'shaped_by',
  'peak_performance',
  'motivation',
  'unique_quality',
]);

export type MapAnswersError = {
  message: string;
  field?: string;
};

/**
 * Maps validated POST body answers to survey_responses columns.
 * Duplicate questionId: last wins.
 */
export function mapAnswersToSurveyResponsePayload(
  answers: SurveyPostBody['answers']
): { ok: true; data: SurveyResponseFields } | { ok: false; error: MapAnswersError } {
  const byId = new Map<string, string>();
  for (const row of answers) {
    byId.set(row.questionId, row.answer);
  }

  const out: SurveyResponseFields = {};

  for (const [questionId, raw] of Array.from(byId.entries())) {
    if (!KNOWN_QUESTION_IDS.has(questionId)) {
      return {
        ok: false,
        error: { message: `Unknown questionId: ${questionId}`, field: questionId },
      };
    }

    const trimmed = raw.trim();
    if (trimmed === '') {
      continue;
    }

    switch (questionId) {
      case 'tenure_years': {
        const n = Number(trimmed);
        if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0 || n > 80) {
          return {
            ok: false,
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
            ok: false,
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
            ok: false,
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
            ok: false,
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
            ok: false,
            error: { message: 'Invalid motivation value', field: 'motivation' },
          };
        }
        out.motivation = p.data;
        break;
      }
      case 'unique_quality': {
        if (trimmed.length > 4000) {
          return {
            ok: false,
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

  return { ok: true, data: out };
}
