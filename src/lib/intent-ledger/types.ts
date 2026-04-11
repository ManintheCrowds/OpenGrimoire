export type IntentEventType =
  | 'sync_session_profile'
  | 'clarification_request'
  | 'clarification_resolution'
  | 'alignment_context';

export type IntentEventCategory =
  | 'profile'
  | 'intent_gap'
  | 'intent_resolution'
  | 'alignment_context';

export type IntentEventStatus = 'pending' | 'resolved' | 'active' | 'archived' | 'info';

export type IntentEventSource = 'sync_session' | 'clarification_queue' | 'alignment_context';

export type IntentEvent = {
  id: string;
  attendee_id: string | null;
  session_id: string | null;
  type: IntentEventType;
  category: IntentEventCategory;
  status: IntentEventStatus;
  source: IntentEventSource;
  confidence: number;
  timestamp: string;
  title: string;
  detail: string | null;
  reference_id: string;
};

export type IntentGapSummary = {
  unresolved: number;
  resolved: number;
  escalation_prompts: string[];
};

export type IntentLedgerRecord = {
  attendee: {
    id: string;
    first_name: string;
    last_name: string | null;
    is_anonymous: boolean;
    created_at: string;
  };
  sync_sessions: Array<{
    survey_response_id: string;
    created_at: string;
    status: string;
    learning_style: string | null;
    motivation: string | null;
    peak_performance: string | null;
    unique_quality: string | null;
  }>;
  alignment_items: Array<{
    id: string;
    title: string;
    status: string;
    linked_node_id: string | null;
    updated_at: string;
  }>;
  clarification_requests: Array<{
    id: string;
    status: string;
    prompt: string;
    linked_node_id: string | null;
    created_at: string;
    resolved_at: string | null;
  }>;
  intent_events: IntentEvent[];
  intent_gaps: IntentGapSummary;
};
