import type { VisualizationSurveyRow } from '@/lib/types/database';
import { fetchSurveyVisualizationRows } from '@/lib/visualization/surveyVisualizationFetch';

async function fetchViz(showTestData: boolean): Promise<VisualizationSurveyRow[]> {
  return fetchSurveyVisualizationRows({ mode: 'filtered', showTestData });
}

export async function exportSurveyData() {
  const responses = await fetchViz(true);
  if (responses.length === 0) {
    throw new Error('No data to export');
  }

  const exportData = responses.map((response) => ({
    'First Name': response.attendee.first_name,
    'Last Name': response.attendee.last_name ?? '',
    Email: '',
    'Tenure years': response.tenure_years ?? '',
    'Learning style': response.learning_style ?? '',
    'Shaped by': response.shaped_by ?? '',
    'Peak performance': response.peak_performance ?? '',
    Motivation: response.motivation ?? '',
    'Unique quality': response.unique_quality ?? '',
    'Created At': new Date(response.created_at).toLocaleString(),
  }));

  type ExportRow = (typeof exportData)[number];
  const headers = Object.keys(exportData[0]) as (keyof ExportRow)[];

  const csvContent = [
    headers.join(','),
    ...exportData.map((row) =>
      headers.map((header) => JSON.stringify(row[header] ?? '')).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `survey-data-${new Date().toISOString()}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function exportVisualizationData() {
  const responses = await fetchViz(false);
  return responses.map((response) => ({
    id: response.id,
    attendee: `${response.attendee.first_name} ${response.attendee.last_name ?? ''}`.trim(),
    unique_quality: response.unique_quality,
    status: response.moderation?.[0]?.status ?? 'pending',
    timestamp: new Date(response.created_at).getTime(),
  }));
}
