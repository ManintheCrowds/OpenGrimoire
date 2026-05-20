import type { ShapedBy } from '@/lib/types/database';

export const SYNC_SESSION_QUESTIONNAIRE_VERSION = 'v2' as const;

export const WORKING_STYLE_OPTIONS = [
  {
    value: 'independent',
    label: 'Independent focus',
    description: 'You do your best work with uninterrupted deep focus',
  },
  {
    value: 'collaborative',
    label: 'Collaborative',
    description: 'You think best in dialogue and paired problem-solving',
  },
  {
    value: 'structured',
    label: 'Structured',
    description: 'You prefer clear steps, checklists, and explicit handoffs',
  },
  {
    value: 'exploratory',
    label: 'Exploratory',
    description: 'You iterate quickly and refine as you learn',
  },
] as const;

export type WorkingStyle = (typeof WORKING_STYLE_OPTIONS)[number]['value'];

export const SHAPED_BY_OPTIONS: {
  value: ShapedBy;
  label: string;
  description: string;
}[] = [
  { value: 'mentor', label: 'Mentorship', description: 'A mentor or role model who guided and inspired you' },
  { value: 'challenge', label: 'Challenge', description: 'A significant challenge or obstacle you overcame' },
  { value: 'failure', label: 'Failure', description: 'A failure that taught you valuable lessons' },
  { value: 'success', label: 'Success', description: 'A significant achievement that motivated you' },
  { value: 'team', label: 'Team', description: 'Collaboration and support from your team members' },
  { value: 'other', label: 'Other', description: 'Another significant influence not listed above' },
];

/** Human labels for admin moderation and diagnostics */
export const SYNC_SESSION_V2_QUESTION_LABELS: Record<string, string> = {
  session_intent: 'Session intent',
  session_context: 'Context for the agent',
  shaped_by: 'What shaped your career',
  working_style: 'Working style',
  constraints: 'Constraints and blockers',
  unique_quality: 'Unique quality or perspective',
};
