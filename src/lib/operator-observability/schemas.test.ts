import { describe, expect, it } from 'vitest';

import { operatorProbeIngestBodySchema, ROUTINE_RUN_REASON_MAX } from './schemas';

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

describe('operatorProbeIngestBodySchema — routine_run', () => {
  const validRoutineRun = () => ({
    probe_type: 'routine_run' as const,
    runner_id: 'box-routine-collector',
    runner_type: 'og_server' as const,
    summary: {
      agent_id: 'a40a9b69-b1d1-4603-9bc6-14825fa9a9ac',
      routine_id: 'friday-raise',
      routine_name: 'Friday raise',
      fired_at: '2026-11-14T15:00:00Z',
      finished_at: '2026-11-14T15:04:30Z',
      outcome: 'done',
      reason: 'Opened draft PR; CI green.',
    },
  });

  it('parses a valid routine run record', () => {
    const r = operatorProbeIngestBodySchema.safeParse(validRoutineRun());
    expect(r.success).toBe(true);
  });

  it('parses minimal routine run (optional fields omitted)', () => {
    const r = operatorProbeIngestBodySchema.safeParse({
      probe_type: 'routine_run',
      runner_id: 'x',
      runner_type: 'ci',
      summary: {
        agent_id: 'bot-1',
        routine_id: 'nightly',
        fired_at: '2026-11-14T09:00:00-06:00',
        outcome: 'nothing_to_do',
      },
    });
    expect(r.success).toBe(true);
  });

  it('rejects an unknown outcome', () => {
    const body = validRoutineRun();
    const r = operatorProbeIngestBodySchema.safeParse({
      ...body,
      summary: { ...body.summary, outcome: 'partial' },
    });
    expect(r.success).toBe(false);
  });

  it('rejects an overlong reason', () => {
    const body = validRoutineRun();
    const r = operatorProbeIngestBodySchema.safeParse({
      ...body,
      summary: { ...body.summary, reason: 'r'.repeat(ROUTINE_RUN_REASON_MAX + 1) },
    });
    expect(r.success).toBe(false);
  });

  it('accepts reason at the length cap', () => {
    const body = validRoutineRun();
    const r = operatorProbeIngestBodySchema.safeParse({
      ...body,
      summary: { ...body.summary, reason: 'r'.repeat(ROUTINE_RUN_REASON_MAX) },
    });
    expect(r.success).toBe(true);
  });

  it('rejects unknown/extra fields in summary (e.g. free-form message text)', () => {
    const body = validRoutineRun();
    const r = operatorProbeIngestBodySchema.safeParse({
      ...body,
      summary: { ...body.summary, message: 'full chat transcript here' },
    });
    expect(r.success).toBe(false);
  });

  it('rejects extra top-level fields (target_host, raw_blob)', () => {
    expect(
      operatorProbeIngestBodySchema.safeParse({ ...validRoutineRun(), target_host: 'api.cursor.com' }).success
    ).toBe(false);
    expect(operatorProbeIngestBodySchema.safeParse({ ...validRoutineRun(), raw_blob: 'x' }).success).toBe(false);
  });

  it('rejects missing agent_id', () => {
    const body = validRoutineRun();
    const { agent_id: _omit, ...summary } = body.summary;
    void _omit;
    const r = operatorProbeIngestBodySchema.safeParse({ ...body, summary });
    expect(r.success).toBe(false);
  });

  it('rejects agent_id with whitespace (display names are not ids)', () => {
    const body = validRoutineRun();
    const r = operatorProbeIngestBodySchema.safeParse({
      ...body,
      summary: { ...body.summary, agent_id: 'Grok Bot' },
    });
    expect(r.success).toBe(false);
  });

  it('rejects non-ISO fired_at and finished_at before fired_at', () => {
    const body = validRoutineRun();
    expect(
      operatorProbeIngestBodySchema.safeParse({ ...body, summary: { ...body.summary, fired_at: 'yesterday' } })
        .success
    ).toBe(false);
    expect(
      operatorProbeIngestBodySchema.safeParse({
        ...body,
        summary: { ...body.summary, finished_at: '2026-11-14T14:00:00Z' },
      }).success
    ).toBe(false);
  });

  it('rejects unknown probe_type', () => {
    const r = operatorProbeIngestBodySchema.safeParse({ ...validRoutineRun(), probe_type: 'chat_log' });
    expect(r.success).toBe(false);
  });
});
