import { randomUUID } from 'crypto';
import { and, desc, eq, gte, lt } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { operatorProbeRuns } from '@/db/schema';

function nowIso() {
  return new Date().toISOString();
}

function defaultRetentionDays(): number {
  const raw = process.env.OPERATOR_PROBE_RETENTION_DAYS;
  const n = raw ? parseInt(raw, 10) : 30;
  if (!Number.isFinite(n) || n < 1) return 30;
  return Math.min(n, 3650);
}

function expiresAtFromNow(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + defaultRetentionDays());
  return d.toISOString();
}

/** Deletes rows past `expires_at`. Call after successful ingest to reclaim disk; not on admin GET paths (reads stay side-effect free). */
export function purgeExpiredOperatorProbeRuns(): number {
  const now = nowIso();
  const result = getDb().delete(operatorProbeRuns).where(lt(operatorProbeRuns.expiresAt, now)).run();
  return result.changes ?? 0;
}

export type OperatorProbeRunRow = {
  id: string;
  created_at: string;
  probe_type: string;
  target_host: string;
  runner_id: string;
  runner_type: string;
  summary_json: string;
  raw_blob: string | null;
  ingest_via: string;
  expires_at: string;
};

function rowToApi(row: typeof operatorProbeRuns.$inferSelect): OperatorProbeRunRow {
  return {
    id: row.id,
    created_at: row.createdAt,
    probe_type: row.probeType,
    target_host: row.targetHost,
    runner_id: row.runnerId,
    runner_type: row.runnerType,
    summary_json: row.summaryJson,
    raw_blob: row.rawBlob ?? null,
    ingest_via: row.ingestVia,
    expires_at: row.expiresAt,
  };
}

export function listOperatorProbeRuns(limit = 100): OperatorProbeRunRow[] {
  purgeExpiredOperatorProbeRuns();
  const now = nowIso();
  const rows = getDb()
    .select()
    .from(operatorProbeRuns)
    .where(gte(operatorProbeRuns.expiresAt, now))
    .orderBy(desc(operatorProbeRuns.createdAt))
    .limit(limit)
    .all();
  return rows.map(rowToApi);
}

export function getOperatorProbeRunById(id: string): OperatorProbeRunRow | null {
  const now = nowIso();
  const row = getDb()
    .select()
    .from(operatorProbeRuns)
    .where(and(eq(operatorProbeRuns.id, id), gte(operatorProbeRuns.expiresAt, now)))
    .get();
  if (!row) return null;
  return rowToApi(row);
}

export function insertOperatorProbeRun(params: {
  probeType: string;
  targetHost: string;
  runnerId: string;
  runnerType: 'laptop_script' | 'ci' | 'og_server';
  summaryJson: string;
  rawBlob: string | null;
  ingestVia: 'session' | 'ingest_secret';
}): OperatorProbeRunRow {
  const id = randomUUID();
  const createdAt = nowIso();
  const expiresAt = expiresAtFromNow();
  getDb()
    .insert(operatorProbeRuns)
    .values({
      id,
      createdAt,
      probeType: params.probeType,
      targetHost: params.targetHost,
      runnerId: params.runnerId,
      runnerType: params.runnerType,
      summaryJson: params.summaryJson,
      rawBlob: params.rawBlob ?? null,
      ingestVia: params.ingestVia,
      expiresAt,
    })
    .run();
  const row = getDb().select().from(operatorProbeRuns).where(eq(operatorProbeRuns.id, id)).get();
  if (!row) throw new Error('insertOperatorProbeRun: row missing after insert');
  purgeExpiredOperatorProbeRuns();
  return rowToApi(row);
}

export function deleteOperatorProbeRunById(id: string): boolean {
  const result = getDb().delete(operatorProbeRuns).where(eq(operatorProbeRuns.id, id)).run();
  return (result.changes ?? 0) > 0;
}
