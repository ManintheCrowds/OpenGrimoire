import { randomUUID } from 'crypto';
import { and, desc, eq } from 'drizzle-orm';
import { alignmentContextItems } from '@/db/schema';
import { getDb } from '@/db/client';
import type { AlignmentContextItemRow, AlignmentContextSource, AlignmentContextStatus } from '@/lib/types/database';

function parseTags(raw: string): string[] {
  try {
    const v = JSON.parse(raw) as unknown;
    return Array.isArray(v) ? (v as string[]) : [];
  } catch {
    return [];
  }
}

function rowToItem(row: typeof alignmentContextItems.$inferSelect): AlignmentContextItemRow {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    tags: parseTags(row.tags),
    priority: row.priority,
    status: row.status as AlignmentContextStatus,
    linked_node_id: row.linkedNodeId,
    attendee_id: row.attendeeId,
    source: row.source as AlignmentContextSource,
    created_by: row.createdBy,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}

export type ListAlignmentOptions = {
  statusFilter: string | null;
  limit: number;
};

export type ListAlignmentResult =
  | { data: AlignmentContextItemRow[]; error: null }
  | { data: null; error: { code: string; message: string } };

export function listAlignmentContextItems(options: ListAlignmentOptions): ListAlignmentResult {
  const db = getDb();
  try {
    const conditions = [];
    if (
      options.statusFilter &&
      ['draft', 'active', 'archived'].includes(options.statusFilter)
    ) {
      conditions.push(eq(alignmentContextItems.status, options.statusFilter as 'draft' | 'active' | 'archived'));
    }
    const base = db.select().from(alignmentContextItems);
    const rows = (
      conditions.length ? base.where(and(...conditions)) : base
    )
      .orderBy(desc(alignmentContextItems.createdAt))
      .limit(options.limit)
      .all();
    return { data: rows.map(rowToItem), error: null };
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    return { data: null, error: { code: 'SQLITE_ERROR', message: err.message } };
  }
}

export function insertAlignmentContextItem(input: {
  title: string;
  body: string | null;
  tags: string[];
  priority: number | null;
  status: AlignmentContextStatus;
  linked_node_id: string | null;
  attendee_id: string | null;
  source: AlignmentContextSource;
  created_by: string | null;
}): { data: AlignmentContextItemRow | null; error: { code: string; message: string } | null } {
  const db = getDb();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const tagsJson = JSON.stringify(input.tags ?? []);
  try {
    db.insert(alignmentContextItems)
      .values({
        id,
        title: input.title,
        body: input.body,
        tags: tagsJson,
        priority: input.priority,
        status: input.status,
        linkedNodeId: input.linked_node_id,
        attendeeId: input.attendee_id,
        source: input.source,
        createdBy: input.created_by,
        createdAt: now,
        updatedAt: now,
      })
      .run();
    const row = db
      .select()
      .from(alignmentContextItems)
      .where(eq(alignmentContextItems.id, id))
      .get();
    if (!row) {
      return { data: null, error: { code: 'NOT_FOUND', message: 'Insert did not return row' } };
    }
    return { data: rowToItem(row), error: null };
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    return { data: null, error: { code: 'SQLITE_ERROR', message: err.message } };
  }
}

export function updateAlignmentContextItem(
  id: string,
  patch: Partial<{
    title: string;
    body: string | null;
    tags: string[];
    priority: number | null;
    status: AlignmentContextStatus;
    linked_node_id: string | null;
    attendee_id: string | null;
    source: AlignmentContextSource;
  }>
): { data: AlignmentContextItemRow | null; error: { code: string; message: string } | null } {
  const db = getDb();
  const now = new Date().toISOString();
  const set: Record<string, unknown> = { updatedAt: now };
  if (patch.title !== undefined) set.title = patch.title;
  if (patch.body !== undefined) set.body = patch.body;
  if (patch.tags !== undefined) set.tags = JSON.stringify(patch.tags);
  if (patch.priority !== undefined) set.priority = patch.priority;
  if (patch.status !== undefined) set.status = patch.status;
  if (patch.linked_node_id !== undefined) set.linkedNodeId = patch.linked_node_id;
  if (patch.attendee_id !== undefined) set.attendeeId = patch.attendee_id;
  if (patch.source !== undefined) set.source = patch.source;
  try {
    const r = db
      .update(alignmentContextItems)
      .set(set as Record<string, never>)
      .where(eq(alignmentContextItems.id, id))
      .run();
    if (r.changes === 0) {
      return { data: null, error: null };
    }
    const row = db
      .select()
      .from(alignmentContextItems)
      .where(eq(alignmentContextItems.id, id))
      .get();
    return row ? { data: rowToItem(row), error: null } : { data: null, error: null };
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    return { data: null, error: { code: 'SQLITE_ERROR', message: err.message } };
  }
}

export function deleteAlignmentContextItem(
  id: string
): { deleted: boolean; error: { code: string; message: string } | null } {
  const db = getDb();
  try {
    const r = db.delete(alignmentContextItems).where(eq(alignmentContextItems.id, id)).run();
    return { deleted: r.changes > 0, error: null };
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    return { deleted: false, error: { code: 'SQLITE_ERROR', message: err.message } };
  }
}
