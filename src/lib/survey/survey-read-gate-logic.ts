import { timingSafeEqualString } from '@/lib/crypto/timing-safe-compare';

export type SurveyReadDecision =
  | { allow: true; reason: 'development' | 'public_demo' | 'admin_session' | 'alignment_key' | 'visualization_key' }
  | { allow: false; reason: 'session_required' };

export type SurveyReadGateInput = {
  nodeEnv: string;
  /** Raw env value for `SURVEY_VISUALIZATION_ALLOW_PUBLIC` */
  surveyVisualizationAllowPublic?: string;
  hasAdminSession: boolean;
  /** Raw env value for `ALIGNMENT_CONTEXT_KEY_ALLOWS_SURVEY_READ` */
  alignmentContextKeyAllowsSurveyRead?: string;
  alignmentApiSecret: string;
  alignmentContextKeyHeader: string;
  surveyVizSecret: string;
  surveyVizKeyHeader: string;
};

/**
 * Pure production read-gate decision (no cookies(), no Request/Response).
 * Mirrors `checkSurveyReadGate` ordering and semantics.
 */
export function decideSurveyReadAccess(input: SurveyReadGateInput): SurveyReadDecision {
  const isProd = input.nodeEnv === 'production';
  if (!isProd) {
    return { allow: true, reason: 'development' };
  }

  if ((input.surveyVisualizationAllowPublic ?? '').trim().toLowerCase() === 'true') {
    return { allow: true, reason: 'public_demo' };
  }

  if (input.hasAdminSession) {
    return { allow: true, reason: 'admin_session' };
  }

  const alignmentAllowsSurvey =
    (input.alignmentContextKeyAllowsSurveyRead ?? '').trim().toLowerCase() === 'true';
  const alignmentSecret = input.alignmentApiSecret.trim();
  if (alignmentAllowsSurvey && alignmentSecret) {
    const key = input.alignmentContextKeyHeader;
    if (timingSafeEqualString(key, alignmentSecret)) {
      return { allow: true, reason: 'alignment_key' };
    }
  }

  const vizSecret = input.surveyVizSecret.trim();
  if (vizSecret) {
    const key = input.surveyVizKeyHeader;
    if (timingSafeEqualString(key, vizSecret)) {
      return { allow: true, reason: 'visualization_key' };
    }
  }

  return { allow: false, reason: 'session_required' };
}
