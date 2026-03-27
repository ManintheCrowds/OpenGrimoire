import type { VisualizationSurveyRow } from '@/lib/types/database';

export async function fetchVisualizationData(
  showTestData: boolean
): Promise<VisualizationSurveyRow[]> {
  const res = await fetch(
    `/api/survey/visualization?showTestData=${showTestData ? 'true' : 'false'}&all=0`,
    { credentials: 'include' }
  );
  if (!res.ok) {
    throw new Error('Failed to load visualization data');
  }
  const json = (await res.json()) as { data?: VisualizationSurveyRow[] };
  return json.data ?? [];
}
