import type { VisualizationSurveyRow } from '@/lib/types/database';
import { fetchSurveyVisualizationRows } from '@/lib/visualization/surveyVisualizationFetch';

/** Thin wrapper: filtered rows (`all=0` + `showTestData`). SSOT: `surveyVisualizationFetch.ts`. */
export async function fetchVisualizationData(
  showTestData: boolean
): Promise<VisualizationSurveyRow[]> {
  return fetchSurveyVisualizationRows({ mode: 'filtered', showTestData });
}
