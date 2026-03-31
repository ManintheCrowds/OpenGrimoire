import type {
  LearningStyle,
  MotivationType,
  PeakPerformanceType,
  ShapedBy,
} from '@/lib/types/database';

export type SyncSessionFormData = {
  first_name: string;
  last_name?: string;
  email?: string;
  is_anonymous: boolean;
  tenure_years?: number;
  learning_style?: LearningStyle;
  shaped_by?: ShapedBy;
  peak_performance?: PeakPerformanceType;
  motivation?: MotivationType;
  unique_quality?: string;
};
