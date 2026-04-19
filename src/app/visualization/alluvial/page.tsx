import AlluvialDiagram from '@/components/DataVisualization/AlluvialDiagram';
import { VisualizationSurveyDataProvider } from '@/components/DataVisualization/shared/VisualizationSurveyDataContext';

export default function AlluvialPage() {
  return (
    <VisualizationSurveyDataProvider>
      <AlluvialDiagram />
    </VisualizationSurveyDataProvider>
  );
}
