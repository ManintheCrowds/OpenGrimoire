import { z } from 'zod';

const statusSchema = z.enum(['draft', 'active', 'archived']);
const sourceSchema = z.enum(['ui', 'import', 'api']);

/** Public POST — source is set server-side to `api`. */
export const alignmentContextCreateBodySchema = z
  .object({
    title: z.string().min(1).max(2000),
    body: z.string().max(100_000).nullable().optional(),
    tags: z.array(z.string().max(200)).max(100).optional().default([]),
    priority: z.number().int().min(-2147483648).max(2147483647).nullable().optional(),
    status: statusSchema.optional().default('draft'),
    linked_node_id: z.string().max(500).nullable().optional(),
    attendee_id: z.string().uuid().nullable().optional(),
  })
  .strict();

/** PATCH — all fields optional; at least one should be present (enforced in handler). */
export const alignmentContextPatchBodySchema = z
  .object({
    title: z.string().min(1).max(2000).optional(),
    body: z.string().max(100_000).nullable().optional(),
    tags: z.array(z.string().max(200)).max(100).optional(),
    priority: z.number().int().min(-2147483648).max(2147483647).nullable().optional(),
    status: statusSchema.optional(),
    linked_node_id: z.string().max(500).nullable().optional(),
    attendee_id: z.string().uuid().nullable().optional(),
    source: sourceSchema.optional(),
  })
  .strict();

/** Public API PATCH — `source` is server/admin-only (provenance); not overwritable via shared API key. */
export const alignmentContextPublicPatchBodySchema = alignmentContextPatchBodySchema.omit({ source: true });

export type AlignmentContextCreateBody = z.infer<typeof alignmentContextCreateBodySchema>;
export type AlignmentContextPatchBody = z.infer<typeof alignmentContextPatchBodySchema>;
export type AlignmentContextPublicPatchBody = z.infer<typeof alignmentContextPublicPatchBodySchema>;
