import type { ShapedBy } from '@/lib/types/database';
import type { WorkingStyle } from '@/lib/survey/sync-session-v2-questions';

export type SyncSessionFormData = {
  first_name: string;
  last_name?: string;
  email?: string;
  is_anonymous: boolean;
  session_intent?: string;
  session_context?: string;
  shaped_by?: ShapedBy;
  working_style?: WorkingStyle;
  constraints?: string;
  unique_quality?: string;
  harness_profile_id?: string;
};
