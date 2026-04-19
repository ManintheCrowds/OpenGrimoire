'use client';

import { useVisualizationSurveyData } from './VisualizationSurveyDataContext';

/**
 * Shown when the visualization API returned no usable rows or failed after retries,
 * and the diagrams are using in-hook mock data (OGAN-04).
 */
export function MockSurveyDataBanner() {
  const { isMockData, error } = useVisualizationSurveyData();

  if (!isMockData) return null;

  const message = error
    ? 'Could not load live survey data — showing sample data for layout preview.'
    : 'No survey rows match the current filters — showing sample data.';

  return (
    <div
      role="status"
      data-testid="opengrimoire-viz-mock-data-banner"
      data-region="opengrimoire-viz-mock-data-banner"
      className="shrink-0 border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-950"
    >
      {message}
    </div>
  );
}
