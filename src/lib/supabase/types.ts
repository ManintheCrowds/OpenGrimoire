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
export type AlignmentContextSource = 'ui' | 'import' | 'api';
export type AlignmentContextStatus = 'draft' | 'active' | 'archived';

export interface Database {
  public: {
    Tables: {
      attendees: {
        Row: {
          id: string;
          first_name: string;
          last_name: string | null;
          email: string | null;
          is_anonymous: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          first_name: string;
          last_name?: string | null;
          email?: string | null;
          is_anonymous?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string | null;
          email?: string | null;
          is_anonymous?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      survey_responses: {
        Row: {
          id: string;
          attendee_id: string;
          tenure_years: number | null;
          learning_style: LearningStyle | null;
          shaped_by: ShapedBy | null;
          peak_performance: PeakPerformanceType | null;
          motivation: MotivationType | null;
          unique_quality: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          attendee_id: string;
          tenure_years?: number | null;
          learning_style?: LearningStyle | null;
          shaped_by?: ShapedBy | null;
          peak_performance?: PeakPerformanceType | null;
          motivation?: MotivationType | null;
          unique_quality?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          attendee_id?: string;
          tenure_years?: number | null;
          learning_style?: LearningStyle | null;
          shaped_by?: ShapedBy | null;
          peak_performance?: PeakPerformanceType | null;
          motivation?: MotivationType | null;
          unique_quality?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      peak_performance_definitions: {
        Row: {
          id: string;
          type: PeakPerformanceType;
          title: string;
          description: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type: PeakPerformanceType;
          title: string;
          description: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          type?: PeakPerformanceType;
          title?: string;
          description?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      moderation: {
        Row: {
          id: string;
          response_id: string;
          field_name: 'unique_quality';
          status: ModerationStatus;
          moderator_id: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          response_id: string;
          field_name: 'unique_quality';
          status?: ModerationStatus;
          moderator_id: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          response_id?: string;
          field_name?: 'unique_quality';
          status?: ModerationStatus;
          moderator_id?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      alignment_context_items: {
        Row: {
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
        Insert: {
          id?: string;
          title: string;
          body?: string | null;
          tags?: string[];
          priority?: number | null;
          status?: AlignmentContextStatus;
          linked_node_id?: string | null;
          attendee_id?: string | null;
          source: AlignmentContextSource;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          body?: string | null;
          tags?: string[];
          priority?: number | null;
          status?: AlignmentContextStatus;
          linked_node_id?: string | null;
          attendee_id?: string | null;
          source?: AlignmentContextSource;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
} 