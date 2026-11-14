/** Display helpers for `probe_type: routine_run` rows on `/admin/observability` (read-only, defensive). */

export type RoutineRunListDisplay = {
  agentId: string;
  routineLabel: string;
  outcome: string;
  firedAt: string;
  reason: string | null;
};

const OUTCOME_CHIP_CLASS: Record<string, string> = {
  done: 'bg-emerald-100 text-emerald-900',
  nothing_to_do: 'bg-gray-100 text-gray-800',
  failed: 'bg-red-100 text-red-900',
};

const CHIP_BASE = 'inline-block w-fit rounded text-xs font-semibold px-2 py-0.5';

export function routineRunOutcomeChipClass(outcome: string): string {
  return `${CHIP_BASE} ${OUTCOME_CHIP_CLASS[outcome] ?? 'bg-amber-100 text-amber-900'}`;
}

function str(v: unknown): string | null {
  return typeof v === 'string' && v.length > 0 ? v : null;
}

/** Returns null when the row is not a routine run or the stored summary is malformed. */
export function routineRunListDisplay(probeType: string, summary: unknown): RoutineRunListDisplay | null {
  if (probeType !== 'routine_run' || !summary || typeof summary !== 'object') return null;
  const s = summary as Record<string, unknown>;
  const agentId = str(s.agent_id);
  const routineId = str(s.routine_id);
  const outcome = str(s.outcome);
  const firedAt = str(s.fired_at);
  if (!agentId || !routineId || !outcome || !firedAt) return null;
  const routineName = str(s.routine_name);
  return {
    agentId,
    routineLabel: routineName ? `${routineName} (${routineId})` : routineId,
    outcome,
    firedAt,
    reason: str(s.reason),
  };
}
