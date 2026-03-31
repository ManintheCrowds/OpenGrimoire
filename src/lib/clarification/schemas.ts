import { z } from 'zod';

export const clarificationOptionSchema = z.object({
  id: z.string().min(1).max(256),
  label: z.string().min(1).max(2000),
});

export const clarificationAgentMetadataSchema = z
  .object({
    blocking: z.boolean().optional(),
    reason: z.string().max(4000).optional(),
    harnessRunId: z.string().max(512).optional(),
    toolCallId: z.string().max(512).optional(),
    opengrimoireRef: z.string().max(512).optional(),
  })
  .passthrough();

export const clarificationQuestionSpecSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('single_choice'),
    prompt: z.string().min(1).max(8000),
    options: z.array(clarificationOptionSchema).min(1).max(50),
    allowFreeText: z.boolean().optional(),
  }),
  z.object({
    kind: z.literal('multi_choice'),
    prompt: z.string().min(1).max(8000),
    options: z.array(clarificationOptionSchema).min(1).max(50),
  }),
  z.object({
    kind: z.literal('text'),
    prompt: z.string().min(1).max(8000),
    multiline: z.boolean().optional(),
  }),
  z.object({
    kind: z.literal('likert'),
    prompt: z.string().min(1).max(8000),
    min: z.number().int().min(0).max(10).default(1),
    max: z.number().int().min(1).max(11).default(5),
    minLabel: z.string().max(500).optional(),
    maxLabel: z.string().max(500).optional(),
  }),
]);

export const clarificationResolutionSchema = z.object({
  selectedOptionIds: z.array(z.string()).optional(),
  freeText: z.string().max(16000).optional(),
  likertValue: z.number().optional(),
});

export const clarificationCreateBodySchema = z.object({
  question_spec: clarificationQuestionSpecSchema,
  agent_metadata: clarificationAgentMetadataSchema.optional(),
  linked_node_id: z.string().min(1).max(256).nullable().optional(),
});

export const clarificationResolveBodySchema = z
  .object({
    resolution: clarificationResolutionSchema.optional(),
    status: z.enum(['answered', 'superseded']).optional(),
  })
  .refine(
    (d) => (d.status ?? 'answered') !== 'answered' || d.resolution !== undefined,
    { message: 'resolution is required when status is answered (or omit status)' }
  );

export type ClarificationQuestionSpec = z.infer<typeof clarificationQuestionSpecSchema>;
export type ClarificationResolution = z.infer<typeof clarificationResolutionSchema>;
export type ClarificationAgentMetadata = z.infer<typeof clarificationAgentMetadataSchema>;
