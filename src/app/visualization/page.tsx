import { DataVisualization } from '@/components/DataVisualization';
import Layout from '@/components/Layout';

export default function VisualizationPage() {
  return (
    <Layout>
      <div className="relative z-0 h-[calc(100dvh-5rem)] min-h-[280px] w-full max-w-full overflow-hidden bg-gray-50 sm:min-h-[480px]">
        <DataVisualization />
      </div>
    </Layout>
  );
} 