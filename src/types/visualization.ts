import type { Vector3 } from 'three';
import type { SurveyResponseRow } from '@/lib/types/database';

export type VisualizationMode = 'learning_style' | 'shaped_by' | 'peak_performance' | 'motivation';

export type YearsCategory = '0-5' | '6-10' | '11-15' | '16-20' | '20+';

export interface NodeData {
  id: string;
  position: Vector3;
  attendee: {
    first_name: string;
    last_name: string | null;
    is_anonymous: boolean;
  };
  tenure_years: number;
  yearsCategory: YearsCategory;
  learning_style: SurveyResponseRow['learning_style'];
  shaped_by: SurveyResponseRow['shaped_by'];
  peak_performance: SurveyResponseRow['peak_performance'];
  motivation: SurveyResponseRow['motivation'];
  unique_quality: string | null;
  connections: string[];
  opacity: number;
  scale: number;
}

export interface EdgeData {
  id: string;
  source: string;
  target: string;
  strength: number;
  opacity: number;
}

export interface VisualizationState {
  mode: VisualizationMode;
  nodes: NodeData[];
  edges: EdgeData[];
  selectedNode: string | null;
  hoveredNode: string | null;
  cameraPosition: Vector3;
  isLoading: boolean;
  error: string | null;
  filters: {
    yearsCategory: YearsCategory | null;
    learningStyle: SurveyResponseRow['learning_style'] | null;
    shapedBy: SurveyResponseRow['shaped_by'] | null;
    peakPerformance: SurveyResponseRow['peak_performance'] | null;
    motivation: SurveyResponseRow['motivation'] | null;
  };
  sortBy: 'years' | 'connections' | null;
  sortDirection: 'asc' | 'desc';

  setMode: (mode: VisualizationMode) => void;
  setSelectedNode: (nodeId: string | null) => void;
  setHoveredNode: (nodeId: string | null) => void;
  setCameraPosition: (position: Vector3) => void;
  setFilter: (key: keyof VisualizationState['filters'], value: any) => void;
  setSort: (sortBy: 'years' | 'connections' | null, direction: 'asc' | 'desc') => void;
  updateVisualization: () => Promise<void>;
  resetFilters: () => void;
}

export interface VisualizationProps {
  width: number;
  height: number;
  onNodeClick?: (nodeId: string) => void;
  onNodeHover?: (nodeId: string | null) => void;
  initialMode?: VisualizationMode;
  isExportMode?: boolean;
}
