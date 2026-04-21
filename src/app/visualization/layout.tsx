import type { ReactNode } from 'react';

import { VisualizationNavDots } from '@/components/DataVisualization/shared/VisualizationNavDots';

export default function VisualizationLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <VisualizationNavDots />
    </>
  );
}
