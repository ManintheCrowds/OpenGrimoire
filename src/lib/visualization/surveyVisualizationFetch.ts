import type { VisualizationSurveyRow } from '@/lib/types/database';

/**
 * Query modes for GET /api/survey/visualization — must match
 * `src/app/api/survey/visualization/route.ts` (`all=1` ignores `showTestData`).
 */
export type SurveyVisualizationFetchMode =
  | { mode: 'cohort' }
  | { mode: 'filtered'; showTestData: boolean };

/** Builds the query string only (no leading `?`). */
export function buildSurveyVisualizationSearch(params: SurveyVisualizationFetchMode): string {
  const sp = new URLSearchParams();
  if (params.mode === 'cohort') {
    sp.set('all', '1');
    return sp.toString();
  }
  sp.set('all', '0');
  sp.set('showTestData', params.showTestData ? 'true' : 'false');
  return sp.toString();
}

/**
 * Single client entry for survey visualization rows (PII). Same read gate as the UI;
 * always sends `credentials: 'include'` unless overridden in `init`.
 */
export async function fetchSurveyVisualizationRows(
  params: SurveyVisualizationFetchMode,
  init?: RequestInit
): Promise<VisualizationSurveyRow[]> {
  const search = buildSurveyVisualizationSearch(params);
  const res = await fetch(`/api/survey/visualization?${search}`, {
    credentials: 'include',
    ...init,
  });
  if (!res.ok) {
    throw new Error(`Failed to load visualization data (HTTP ${res.status})`);
  }
  const json = (await res.json()) as { data?: VisualizationSurveyRow[] };
  return json.data ?? [];
}
