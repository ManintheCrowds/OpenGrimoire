import AlluvialDiagram from '@/components/DataVisualization/AlluvialDiagram';
import { MockSurveyDataBanner } from '@/components/DataVisualization/shared/MockSurveyDataBanner';
import { VisualizationSurveyDataProvider } from '@/components/DataVisualization/shared/VisualizationSurveyDataContext';

export default function AlluvialPage() {
  return (
    <VisualizationSurveyDataProvider>
      <MockSurveyDataBanner />
      <AlluvialDiagram />
    </VisualizationSurveyDataProvider>
  );
}
