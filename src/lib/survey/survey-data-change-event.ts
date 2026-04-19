/**
 * Browser-only signal so `/visualization` hooks refetch after survey writes or moderation,
 * without lifting React Query to the full app. Documented in AGENT_INTEGRATION.md.
 */
export const OPENGRIMOIRE_SURVEY_DATA_CHANGED = 'opengrimoire-survey-data-changed';

export type SurveyDataChangedDetail = { reason?: string };

export function dispatchSurveyDataChanged(reason?: string): void {
  if (typeof window === 'undefined') return;
  const detail: SurveyDataChangedDetail = reason ? { reason } : {};
  window.dispatchEvent(new CustomEvent(OPENGRIMOIRE_SURVEY_DATA_CHANGED, { detail }));
}
