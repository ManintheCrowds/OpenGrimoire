import { z } from 'zod';

export const operatorProbeRunnerTypeSchema = z.enum(['laptop_script', 'ci', 'og_server']);

/** Network/path probe (v1). Target host is checked against the allowlist in the ingest route. */
export const cursorPathAnalysisIngestBodySchema = z.object({
  probe_type: z.literal('cursor_path_analysis'),
  target_host: z.string().min(1).max(253),
  runner_id: z.string().min(1).max(200),
  runner_type: operatorProbeRunnerTypeSchema,
  summary: z.record(z.string(), z.unknown()),
  raw_blob: z.string().max(512_000).optional(),
});

/**
 * Routine run records are not network probes: rows store this sentinel in `target_host`
 * (the column is NOT NULL) so the list/detail API shape stays unchanged.
 */
export const ROUTINE_RUN_TARGET_HOST = 'routine';

export const ROUTINE_RUN_OUTCOMES = ['done', 'nothing_to_do', 'failed'] as const;
export const ROUTINE_RUN_REASON_MAX = 500;

/** Stable identifiers (bots are keyed by agent id because display names change). */
const stableIdSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(/^[A-Za-z0-9][A-Za-z0-9._:-]*$/, 'must be a stable id ([A-Za-z0-9._:-], no spaces)');

/**
 * Scheduled bot routine outcome. Strict: unknown keys are rejected so free-form message
 * text, transcripts, or credentials cannot ride along in the stored summary.
 */
export const routineRunSummarySchema = z
  .object({
    agent_id: stableIdSchema,
    routine_id: stableIdSchema,
    routine_name: z.string().trim().min(1).max(200).optional(),
    fired_at: z.string().datetime({ offset: true }),
    finished_at: z.string().datetime({ offset: true }).optional(),
    outcome: z.enum(ROUTINE_RUN_OUTCOMES),
    reason: z.string().trim().min(1).max(ROUTINE_RUN_REASON_MAX).optional(),
  })
  .strict()
  .refine(
    (v) => v.finished_at === undefined || Date.parse(v.finished_at) >= Date.parse(v.fired_at),
    { message: 'finished_at must not be before fired_at', path: ['finished_at'] }
  );

export type RoutineRunSummary = z.infer<typeof routineRunSummarySchema>;

/** Routine run ingest body. Strict: no target_host, no raw_blob, no extra top-level keys. */
export const routineRunIngestBodySchema = z
  .object({
    probe_type: z.literal('routine_run'),
    runner_id: z.string().min(1).max(200),
    runner_type: operatorProbeRunnerTypeSchema,
    summary: routineRunSummarySchema,
  })
  .strict();

export const operatorProbeIngestBodySchema = z.discriminatedUnion('probe_type', [
  cursorPathAnalysisIngestBodySchema,
  routineRunIngestBodySchema,
]);

export type OperatorProbeIngestBody = z.infer<typeof operatorProbeIngestBodySchema>;
