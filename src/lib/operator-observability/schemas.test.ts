import { describe, expect, it } from 'vitest';

import { operatorProbeIngestBodySchema } from './schemas';

describe('operatorProbeIngestBodySchema', () => {
  it('parses minimal valid body', () => {
    const r = operatorProbeIngestBodySchema.safeParse({
      probe_type: 'cursor_path_analysis',
      target_host: 'api.cursor.com',
      runner_id: 'ci-1',
      runner_type: 'ci',
      summary: { ok: true },
    });
    expect(r.success).toBe(true);
  });

  it('rejects oversized raw_blob', () => {
    const r = operatorProbeIngestBodySchema.safeParse({
      probe_type: 'cursor_path_analysis',
      target_host: 'api.cursor.com',
      runner_id: 'x',
      runner_type: 'laptop_script',
      summary: {},
      raw_blob: 'a'.repeat(512_001),
    });
    expect(r.success).toBe(false);
  });

  it('rejects invalid runner_type', () => {
    const r = operatorProbeIngestBodySchema.safeParse({
      probe_type: 'cursor_path_analysis',
      target_host: 'api.cursor.com',
      runner_id: 'x',
      runner_type: 'datacenter',
      summary: {},
    });
    expect(r.success).toBe(false);
  });
});
