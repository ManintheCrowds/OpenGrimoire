import { z } from 'zod';

/** Max length for operator moderation notes (PATCH body). */
export const MODERATION_NOTES_MAX_LENGTH = 4000;

export const moderationPatchBodySchema = z.object({
  status: z.enum(['approved', 'rejected', 'pending']),
  notes: z.string().max(MODERATION_NOTES_MAX_LENGTH).optional(),
});

export type ModerationPatchBody = z.infer<typeof moderationPatchBodySchema>;
