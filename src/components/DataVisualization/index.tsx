'use client';
import React, { useState, useEffect } from 'react';
import AlluvialDiagram from './AlluvialDiagram';
import ChordDiagram from './ChordDiagram';
import { EnhancedVisualizationHeader } from './shared/EnhancedVisualizationHeader';
import {
  OPENGRIMOIRE_VIZ_MAIN_PANEL_ID,
  OPENGRIMOIRE_VIZ_TAB_ALLUVIAL_ID,
  OPENGRIMOIRE_VIZ_TAB_CHORD_ID,
} from './shared/vizLayoutIds';
import { useAppContext } from '@/lib/context/AppContext';
import { VisualizationSurveyDataProvider } from './shared/VisualizationSurveyDataContext';
import { MockSurveyDataBanner } from './shared/MockSurveyDataBanner';

type VisualizationType = 'alluvial' | 'chord';

export function DataVisualization() {
  const { settings, toggleAutoPlay } = useAppContext();
  const [visualizationType, setVisualizationType] = useState<VisualizationType>('alluvial');
  const [containerSize, setContainerSize] = useState({ width: 1920, height: 1080 });

  // Calculate container size based on viewport
  useEffect(() => {
    const updateSize = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Calculate 16:9 aspect ratio
      const aspectRatio = 16 / 9;
      
      let width, height;
      
      if (viewportWidth / viewportHeight > aspectRatio) {
        // Viewport is wider than 16:9, fit to height
        height = viewportHeight;
        width = height * aspectRatio;
      } else {
        // Viewport is taller than 16:9, fit to width
        width = viewportWidth;
        height = width / aspectRatio;
      }
      
      setContainerSize({ width, height });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Calculate visualization size (subtract header height and add bottom padding)
  const headerHeight = 80; // further reduced header height
  const bottomPadding = 24; // reduced bottom padding
  const visualizationHeight = (containerSize.height - headerHeight - bottomPadding) * 0.8; // Scale down to 80%
  const visualizationWidth = containerSize.width * 0.9; // Scale down to 90%

  return (
    <div 
      className="absolute top-0 left-0 w-screen h-screen flex flex-col bg-white overflow-hidden"
      style={{
        aspectRatio: '16/9',
        background: settings.isDarkMode ? '#0A0A0F' : 'white',
      }}
    >
      <VisualizationSurveyDataProvider>
        {/* Enhanced Header - Full Width at Top */}
        <EnhancedVisualizationHeader
          visualizationType={visualizationType}
          onVisualizationTypeChange={setVisualizationType}
          isAutoPlay={settings.isAutoPlayEnabled}
          onAutoPlayToggle={toggleAutoPlay}
          usageHint="Choose Alluvial or Chord layout; Play/Pause controls timed demo. Center shows approved participant quotes when available."
        />

        <MockSurveyDataBanner />

        {/* Visualization Content - Scales to fill remaining space */}
        <div className="flex h-full w-full min-h-0 flex-1 flex-col pb-4">
        <div
          id={OPENGRIMOIRE_VIZ_MAIN_PANEL_ID}
          role="tabpanel"
          aria-labelledby={
            visualizationType === 'alluvial'
              ? OPENGRIMOIRE_VIZ_TAB_ALLUVIAL_ID
              : OPENGRIMOIRE_VIZ_TAB_CHORD_ID
          }
          className="min-h-0 flex-1"
          data-region="opengrimoire-viz-canvas"
        >
          {visualizationType === 'alluvial' ? (
            <div data-testid="alluvial-diagram">
              <AlluvialDiagram
                width={visualizationWidth}
                height={visualizationHeight}
                autoPlay={settings.isAutoPlayEnabled}
              />
            </div>
          ) : (
            <div data-testid="chord-diagram">
              <ChordDiagram
                width={visualizationWidth}
                height={visualizationHeight}
                autoPlay={settings.isAutoPlayEnabled}
                enableRotation={true}
              />
            </div>
          )}
        </div>

        {/* Debug info - Disabled for production */}
        {false && (
          <div className="absolute top-20 left-4 bg-black/80 text-white p-2 rounded text-xs z-50">
            <div>AutoPlay: {settings.isAutoPlayEnabled ? 'ON' : 'OFF'}</div>
            <div>Speed: {settings.autoPlaySpeed}ms</div>
            <div>Type: {visualizationType}</div>
            <div>Size: {Math.round(visualizationWidth)}x{Math.round(visualizationHeight)}</div>
          </div>
        )}
        </div>
      </VisualizationSurveyDataProvider>
    </div>
  );
} 