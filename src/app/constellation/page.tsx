'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { VisualizationContainer } from '@/components/DataVisualization/shared/VisualizationContainer';
import { VisualizationNavDots } from '@/components/DataVisualization/shared/VisualizationNavDots';

// Lazy wrapper name avoids shadowing `ConstellationView` in visualization/ConstellationView.tsx (IDE search).
const ConstellationViewLazy = dynamic(
  () => import('@/components/visualization/ConstellationView').then((mod) => mod.ConstellationView),
  {
    ssr: false,
    loading: () => (
      <div
        data-testid="opengrimoire-viz-constellation-route-loading"
        data-region="opengrimoire-viz-constellation-route-loading"
      >
        Loading visualization...
      </div>
    ),
  }
);

export default function ConstellationPage() {
  return (
    <>
      <VisualizationContainer
        title="Constellation View"
        description="Explore the connections between attendees based on their responses to various questions."
      >
        <ConstellationViewLazy width={800} height={600} />
      </VisualizationContainer>
      <VisualizationNavDots />
    </>
  );
} 