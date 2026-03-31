import { randomUUID } from 'crypto';
import { desc, eq } from 'drizzle-orm';
import { clarificationRequests } from '@/db/schema';
import { getDb } from '@/db/client';
import type { ClarificationQuestionSpec } from '@/lib/clarification/schemas';
import type { ClarificationAgentMetadata, ClarificationResolution } from '@/lib/clarification/schemas';
import { validateResolutionAgainstSpec } from '@/lib/clarification/resolve-validation';
import { notifyClarificationResolved } from '@/lib/clarification/webhook';

export type ClarificationStatus = 'pending' | 'answered' | 'superseded';

export type ClarificationRequestRow = {
  id: string;
  question_spec: ClarificationQuestionSpec;
  status: ClarificationStatus;
  resolution: ClarificationResolution | null;
  agent_metadata: ClarificationAgentMetadata;
  linked_node_id: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
};

function parseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function rowToDomain(row: typeof clarificationRequests.$inferSelect): ClarificationRequestRow {
  return {
    id: row.id,
    question_spec: parseJson(row.questionSpec, {} as ClarificationQuestionSpec),
    status: row.status as ClarificationStatus,
    resolution: row.resolution ? parseJson(row.resolution, null as ClarificationResolution | null) : null,
    agent_metadata: parseJson(row.agentMetadata, {} as ClarificationAgentMetadata),
    linked_node_id: row.linkedNodeId,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
    resolved_at: row.resolvedAt,
  };
}

export type ListClarificationOptions = {
  statusFilter: string | null;
  limit: number;
};

export function listClarificationRequests(options: ListClarificationOptions): {
  data: ClarificationRequestRow[] | null;
  error: { code: string; message: string } | null;
} {
  const db = getDb();
  try {
    const base = db.select().from(clarificationRequests);
    const filtered =
      options.statusFilter && ['pending', 'answered', 'superseded'].includes(options.statusFilter)
        ? base.where(eq(clarificationRequests.status, options.statusFilter as ClarificationStatus))
        : base;
    const rows = filtered
      .orderBy(desc(clarificationRequests.createdAt))
      .limit(options.limit)
      .all();
    return { data: rows.map(rowToDomain), error: null };
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    return { data: null, error: { code: 'SQLITE_ERROR', message: err.message } };
  }
}

export function getClarificationRequestById(id: string): {
  data: ClarificationRequestRow | null;
  error: { code: string; message: string } | null;
} {
  const db = getDb();
  try {
    const row = db.select().from(clarificationRequests).where(eq(clarificationRequests.id, id)).get();
    if (!row) {
      return { data: null, error: null };
    }
    return { data: rowToDomain(row), error: null };
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    return { data: null, error: { code: 'SQLITE_ERROR', message: err.message } };
  }
}

export function insertClarificationRequest(input: {
  question_spec: ClarificationQuestionSpec;
  agent_metadata: ClarificationAgentMetadata;
  linked_node_id: string | null;
}): { data: ClarificationRequestRow | null; error: { code: string; message: string } | null } {
  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();
  const metaJson = JSON.stringify(input.agent_metadata ?? {});

  try {
    db.insert(clarificationRequests)
      .values({
        id,
        questionSpec: JSON.stringify(input.question_spec),
        status: 'pending',
        resolution: null,
        agentMetadata: metaJson,
        linkedNodeId: input.linked_node_id,
        createdAt: now,
        updatedAt: now,
        resolvedAt: null,
      })
      .run();
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    return { data: null, error: { code: 'SQLITE_ERROR', message: err.message } };
  }

  const got = getClarificationRequestById(id);
  if (got.error) {
    return { data: null, error: got.error };
  }
  if (!got.data) {
    return {
      data: null,
      error: { code: 'INSERT_VERIFY', message: 'Failed to read inserted clarification request' },
    };
  }
  return { data: got.data, error: null };
}

export function resolveClarificationRequest(
  id: string,
  input: {
    resolution?: ClarificationResolution;
    status: 'answered' | 'superseded';
  }
): {
  data: ClarificationRequestRow | null;
  error: { code: string; message: string } | null;
  validationError?: string;
} {
  const existing = getClarificationRequestById(id);
  if (existing.error) {
    return { data: null, error: existing.error };
  }
  if (!existing.data) {
    return { data: null, error: { code: 'NOT_FOUND', message: 'Not found' } };
  }

  const row = existing.data;
  if (row.status !== 'pending') {
    return {
      data: null,
      error: { code: 'INVALID_STATE', message: 'Only pending items can be resolved.' },
    };
  }

  const resolutionPayload: ClarificationResolution = input.resolution ?? {};

  if (input.status === 'answered') {
    const msg = validateResolutionAgainstSpec(row.question_spec, resolutionPayload);
    if (msg) {
      return { data: null, error: null, validationError: msg };
    }
  }

  const db = getDb();
  const now = new Date().toISOString();
  const newStatus = input.status;

  try {
    db.update(clarificationRequests)
      .set({
        status: newStatus,
        resolution: JSON.stringify(resolutionPayload),
        updatedAt: now,
        resolvedAt: now,
      })
      .where(eq(clarificationRequests.id, id))
      .run();
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    return { data: null, error: { code: 'SQLITE_ERROR', message: err.message } };
  }

  const resolved = getClarificationRequestById(id);
  if (resolved.data) {
    notifyClarificationResolved(resolved.data);
  }
  return resolved;
}
