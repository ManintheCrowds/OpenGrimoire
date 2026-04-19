import { z } from 'zod';

export const operatorProbeRunnerTypeSchema = z.enum(['laptop_script', 'ci', 'og_server']);

export const operatorProbeIngestBodySchema = z.object({
  probe_type: z.enum(['cursor_path_analysis']),
  target_host: z.string().min(1).max(253),
  runner_id: z.string().min(1).max(200),
  runner_type: operatorProbeRunnerTypeSchema,
  summary: z.record(z.string(), z.unknown()),
  raw_blob: z.string().max(512_000).optional(),
});

export type OperatorProbeIngestBody = z.infer<typeof operatorProbeIngestBodySchema>;
