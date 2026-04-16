import { getSqlite } from '@/db/client';
import { listAlignmentContextItems } from '@/lib/storage/repositories/alignment';
import { listClarificationRequests, type ClarificationRequestRow } from '@/lib/storage/repositories/clarification';
import type { IntentEvent, IntentEventStatus, IntentLedgerRecord } from '@/lib/intent-ledger/types';

type AttendeeBase = IntentLedgerRecord['attendee'];

type SyncSessionRow = IntentLedgerRecord['sync_sessions'][number];

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi;

function normalizeStatus(status: string): IntentEventStatus {
  if (status === 'pending') return 'pending';
  if (status === 'answered') return 'resolved';
  if (status === 'active') return 'active';
  if (status === 'archived' || status === 'superseded') return 'archived';
  return 'info';
}

function maybeString(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v : null;
}

function extractRefsFromMetadata(meta: Record<string, unknown>): { attendeeId?: string; sessionId?: string } {
  const attendeeId = maybeString(meta.attendeeId) ?? maybeString(meta.attendee_id) ?? undefined;
  const sessionId =
    maybeString(meta.surveyResponseId) ??
    maybeString(meta.survey_response_id) ??
    maybeString(meta.syncSessionId) ??
    maybeString(meta.session_id) ??
    undefined;

  if (attendeeId || sessionId) return { attendeeId, sessionId };

  const rawRef =
    maybeString(meta.opengrimoireRef) ??
    maybeString(meta.reference) ??
    maybeString(meta.contextRef) ??
    '';
  if (!rawRef) return {};

  const matches = rawRef.match(UUID_RE) ?? [];
  if (matches.length === 0) return {};
  return {
    attendeeId: matches[0],
    sessionId: matches[1],
  };
}

export function listIntentLedger(): { data: IntentLedgerRecord[] | null; error: { code: string; message: string } | null } {
  const sqlite = getSqlite();
  try {
    const attendees = sqlite
      .prepare(
        `SELECT id, first_name, last_name, is_anonymous, created_at
         FROM attendees
         ORDER BY created_at DESC`
      )
      .all() as Array<Record<string, unknown>>;

    const sessions = sqlite
      .prepare(
        `SELECT id, attendee_id, created_at, status, learning_style, motivation, peak_performance, unique_quality
         FROM survey_responses
         ORDER BY created_at DESC`
      )
      .all() as Array<Record<string, unknown>>;

    const base = new Map<string, IntentLedgerRecord>();
    const sessionToAttendee = new Map<string, string>();

    for (const row of attendees) {
      const attendee: AttendeeBase = {
        id: String(row.id),
        first_name: String(row.first_name),
        last_name: row.last_name == null ? null : String(row.last_name),
        is_anonymous: Boolean(row.is_anonymous),
        created_at: String(row.created_at),
      };
      base.set(attendee.id, {
        attendee,
        sync_sessions: [],
        alignment_items: [],
        clarification_requests: [],
        intent_events: [],
        intent_gaps: { unresolved: 0, resolved: 0, escalation_prompts: [] },
      });
    }

    for (const row of sessions) {
      const attendeeId = String(row.attendee_id);
      sessionToAttendee.set(String(row.id), attendeeId);
      const record = base.get(attendeeId);
      if (!record) continue;

      const session: SyncSessionRow = {
        survey_response_id: String(row.id),
        created_at: String(row.created_at),
        status: String(row.status),
        learning_style: row.learning_style == null ? null : String(row.learning_style),
        motivation: row.motivation == null ? null : String(row.motivation),
        peak_performance: row.peak_performance == null ? null : String(row.peak_performance),
        unique_quality: row.unique_quality == null ? null : String(row.unique_quality),
      };
      record.sync_sessions.push(session);
      record.intent_events.push({
        id: `event-session-${session.survey_response_id}`,
        attendee_id: attendeeId,
        session_id: session.survey_response_id,
        type: 'sync_session_profile',
        category: 'profile',
        status: normalizeStatus(session.status),
        source: 'sync_session',
        confidence: 1,
        timestamp: session.created_at,
        title: 'Sync Session profile submitted',
        detail: session.unique_quality,
        reference_id: session.survey_response_id,
      });
    }

    const alignment = listAlignmentContextItems({ statusFilter: null, limit: 500 }).data ?? [];
    const clarification = listClarificationRequests({ statusFilter: null, limit: 500 }).data ?? [];

    const linkedNodeToAttendee = new Map<string, string>();
    for (const row of alignment) {
      if (!row.attendee_id) continue;
      const record = base.get(row.attendee_id);
      if (!record) continue;
      record.alignment_items.push({
        id: row.id,
        title: row.title,
        status: row.status,
        linked_node_id: row.linked_node_id,
        updated_at: row.updated_at,
      });
      if (row.linked_node_id) linkedNodeToAttendee.set(row.linked_node_id, row.attendee_id);
      record.intent_events.push({
        id: `event-alignment-${row.id}`,
        attendee_id: row.attendee_id,
        session_id: null,
        type: 'alignment_context',
        category: 'alignment_context',
        status: normalizeStatus(row.status),
        source: 'alignment_context',
        confidence: 0.95,
        timestamp: row.updated_at,
        title: row.title,
        detail: row.body,
        reference_id: row.id,
      });
    }

    for (const row of clarification) {
      const inferred = inferAttendeeForClarification(row, sessionToAttendee, linkedNodeToAttendee);
      if (!inferred.attendeeId) continue;
      const record = base.get(inferred.attendeeId);
      if (!record) continue;

      record.clarification_requests.push({
        id: row.id,
        status: row.status,
        prompt: row.question_spec.prompt,
        linked_node_id: row.linked_node_id,
        created_at: row.created_at,
        resolved_at: row.resolved_at,
      });

      record.intent_events.push({
        id: `event-clarification-${row.id}`,
        attendee_id: inferred.attendeeId,
        session_id: inferred.sessionId,
        type: row.status === 'pending' ? 'clarification_request' : 'clarification_resolution',
        category: row.status === 'pending' ? 'intent_gap' : 'intent_resolution',
        status: normalizeStatus(row.status),
        source: 'clarification_queue',
        confidence: row.status === 'pending' ? 0.8 : 0.95,
        timestamp: row.resolved_at ?? row.created_at,
        title: row.question_spec.prompt,
        detail: row.agent_metadata.reason ?? null,
        reference_id: row.id,
      });
    }

    const records = Array.from(base.values());
    for (const record of records) {
      record.intent_events.sort((a: IntentEvent, b: IntentEvent) => b.timestamp.localeCompare(a.timestamp));
      const unresolved = record.intent_events.filter(
        (e: IntentEvent) => e.category === 'intent_gap' && e.status === 'pending'
      ).length;
      const resolved = record.intent_events.filter(
        (e: IntentEvent) => e.category === 'intent_resolution' || e.status === 'resolved'
      ).length;
      const prompts: string[] = [];
      if (unresolved > 0) {
        prompts.push(`Resolve ${unresolved} pending clarification request(s) for this attendee.`);
      }
      const hasActiveAlignment = record.alignment_items.some((i) => i.status === 'active');
      if (!hasActiveAlignment && unresolved > 0) {
        prompts.push('No active alignment context item linked yet; escalate to operator handoff.');
      }
      record.intent_gaps = { unresolved, resolved, escalation_prompts: prompts };
    }

    return { data: records, error: null };
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    return { data: null, error: { code: 'SQLITE_ERROR', message: err.message } };
  }
}

export function getIntentLedgerByAttendee(attendeeId: string): {
  data: IntentLedgerRecord | null;
  error: { code: string; message: string } | null;
} {
  const listed = listIntentLedger();
  if (listed.error) return { data: null, error: listed.error };
  const found = (listed.data ?? []).find((r) => r.attendee.id === attendeeId) ?? null;
  return { data: found, error: null };
}

function inferAttendeeForClarification(
  row: ClarificationRequestRow,
  sessionToAttendee: Map<string, string>,
  linkedNodeToAttendee: Map<string, string>
): { attendeeId: string | null; sessionId: string | null } {
  const refs = extractRefsFromMetadata(row.agent_metadata as Record<string, unknown>);
  const sessionId = refs.sessionId ?? null;
  if (refs.attendeeId) {
    return { attendeeId: refs.attendeeId, sessionId };
  }

  if (sessionId && sessionToAttendee.has(sessionId)) {
    return { attendeeId: sessionToAttendee.get(sessionId) ?? null, sessionId };
  }

  if (row.linked_node_id && linkedNodeToAttendee.has(row.linked_node_id)) {
    return { attendeeId: linkedNodeToAttendee.get(row.linked_node_id) ?? null, sessionId };
  }

  return { attendeeId: null, sessionId };
}
