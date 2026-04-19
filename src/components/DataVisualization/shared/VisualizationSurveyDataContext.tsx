'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useVisualizationData } from './useVisualizationData';

type VisualizationSurveyData = ReturnType<typeof useVisualizationData>;

const VisualizationSurveyDataContext = createContext<VisualizationSurveyData | null>(null);

export function VisualizationSurveyDataProvider({ children }: { children: ReactNode }) {
  const value = useVisualizationData();
  return (
    <VisualizationSurveyDataContext.Provider value={value}>
      {children}
    </VisualizationSurveyDataContext.Provider>
  );
}

export function useVisualizationSurveyData(): VisualizationSurveyData {
  const ctx = useContext(VisualizationSurveyDataContext);
  if (!ctx) {
    throw new Error(
      'useVisualizationSurveyData must be used within VisualizationSurveyDataProvider',
    );
  }
  return ctx;
}
