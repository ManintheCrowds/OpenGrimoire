import { z } from 'zod';

const harnessProfileBaseSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(200),
  purpose: z.string().trim().min(1).max(5000),
  question_strategy: z.string().trim().min(1).max(5000),
  risk_posture: z.string().trim().min(1).max(2000),
  preferred_clarification_modes: z.array(z.string().trim().min(1).max(200)).max(20).default([]),
  output_style: z.string().trim().min(1).max(5000),
  is_default: z.boolean().optional().default(false),
});

export const harnessProfileCreateBodySchema = harnessProfileBaseSchema.strict();

export const harnessProfilePatchBodySchema = harnessProfileBaseSchema
  .omit({ id: true })
  .partial()
  .strict();

export const harnessProfileSelectionSchema = z
  .object({
    harness_profile_id: z.string().uuid(),
  })
  .strict();

export const harnessProfileImportBodySchema = z
  .object({
    file: z.string().trim().min(1).optional(),
  })
  .strict();

export type HarnessProfileCreateBody = z.infer<typeof harnessProfileCreateBodySchema>;
export type HarnessProfilePatchBody = z.infer<typeof harnessProfilePatchBodySchema>;
