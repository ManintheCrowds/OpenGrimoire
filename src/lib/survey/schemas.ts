import { z } from 'zod';

/** One answer row; questionId uses DB column names (see mapAnswersToSurveyResponse). */
const surveyAnswerRowSchema = z.object({
  questionId: z.string().min(1).max(64),
  answer: z.string().max(8000),
});

/**
 * POST /api/survey body. Wire format uses camelCase; maps to attendees + survey_responses.
 * Duplicate questionId in answers: last occurrence wins (see mapper).
 */
export const surveyPostBodySchema = z
  .object({
    firstName: z.string().trim().min(1, 'First name is required').max(200),
    lastName: z.string().trim().min(1, 'Last name is required').max(200),
    email: z.union([z.string().email().max(320), z.literal('')]).optional(),
    isAnonymous: z.boolean().optional().default(false),
    answers: z.array(surveyAnswerRowSchema).min(1, 'At least one answer is required'),
  })
  .strict()
  .superRefine((data, ctx) => {
    const empty = data.email === undefined || data.email === '';
    if (!data.isAnonymous && empty) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Email is required unless submitting anonymously',
        path: ['email'],
      });
    }
  });

export type SurveyPostBody = z.infer<typeof surveyPostBodySchema>;
