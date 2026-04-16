/** Domain types for SQLite-backed OpenGrimoire tables (formerly Supabase `Database`). */

export type LearningStyle = 'visual' | 'auditory' | 'kinesthetic' | 'reading_writing';
export type ShapedBy = 'mentor' | 'challenge' | 'failure' | 'success' | 'team' | 'other';
export type PeakPerformanceType =
  | 'Extrovert, Morning'
  | 'Extrovert, Evening'
  | 'Introvert, Morning'
  | 'Introvert, Night'
  | 'Ambivert, Morning'
  | 'Ambivert, Night';
export type MotivationType = 'impact' | 'growth' | 'recognition' | 'autonomy' | 'purpose';
export type ModerationStatus = 'pending' | 'approved' | 'rejected';
export type SurveySessionType = string;
export type QuestionnaireVersion = string;
export type IntentCategory =
  | 'questions'
  | 'concerns'
  | 'needs'
  | 'accomplishments'
  | 'stats'
  | 'constraints'
  | 'signals';
export type AlignmentContextSource = 'ui' | 'import' | 'api';
export type AlignmentContextStatus = 'draft' | 'active' | 'archived';

export type AttendeeRow = {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string | null;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
};

export type SurveyResponseRow = {
  id: string;
  attendee_id: string;
  session_type: SurveySessionType;
  questionnaire_version: QuestionnaireVersion;
  tenure_years: number | null;
  learning_style: LearningStyle | null;
  shaped_by: ShapedBy | null;
  peak_performance: PeakPerformanceType | null;
  motivation: MotivationType | null;
  unique_quality: string | null;
  harness_profile_id: string | null;
  status: ModerationStatus;
  moderated_at: string | null;
  test_data: boolean;
  created_at: string;
  updated_at: string;
};

export type HarnessProfileRow = {
  id: string;
  name: string;
  purpose: string;
  question_strategy: string;
  risk_posture: string;
  preferred_clarification_modes: string[];
  output_style: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

export type SurveyResponseIntentCategoryRow = {
  id: string;
  response_id: string;
  category: IntentCategory;
  content: string;
  created_at: string;
  updated_at: string;
};

export type PeakPerformanceDefinitionRow = {
  id: string;
  type: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
};

export type ModerationRow = {
  id: string;
  response_id: string;
  field_name: 'unique_quality';
  status: ModerationStatus;
  moderator_id: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type AlignmentContextItemRow = {
  id: string;
  title: string;
  body: string | null;
  tags: string[];
  priority: number | null;
  status: AlignmentContextStatus;
  linked_node_id: string | null;
  attendee_id: string | null;
  source: AlignmentContextSource;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

/** Survey row + joins for visualization (GET /api/survey/visualization). */
export type VisualizationSurveyRow = SurveyResponseRow & {
  attendee: {
    first_name: string;
    last_name: string | null;
    is_anonymous: boolean;
  };
  moderation: { status: ModerationStatus }[] | null;
};
