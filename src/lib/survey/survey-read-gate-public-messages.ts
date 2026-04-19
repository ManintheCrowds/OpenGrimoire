/**
 * Single source for production survey read-gate user-facing copy:
 * JSON `detail` on 401 and matching `/api/capabilities` strings.
 * See `checkSurveyReadGate` and `docs/ARCHITECTURE_REST_CONTRACT.md` (pointers only).
 */

/** Body.detail when production survey read is denied (visualization + approved-qualities). */
export const SURVEY_READ_GATE_UNAUTHORIZED_JSON_DETAIL =
  'In production, survey read endpoints require an admin session cookie, ' +
  'x-survey-visualization-key (when SURVEY_VISUALIZATION_API_SECRET is set), ' +
  'or set SURVEY_VISUALIZATION_ALLOW_PUBLIC=true for demo-only deployments. ' +
  'Optional legacy: set ALIGNMENT_CONTEXT_KEY_ALLOWS_SURVEY_READ=true to also accept x-alignment-context-key. ' +
  'See docs/AGENT_INTEGRATION.md.';

/** `CAPABILITIES.auth_env_hints` entry for survey reads. */
export const SURVEY_READ_GATE_CAPABILITIES_AUTH_ENV_HINT =
  'Survey reads (production): SURVEY_VISUALIZATION_ALLOW_PUBLIC=true, or admin session, or SURVEY_VISUALIZATION_API_SECRET + x-survey-visualization-key; optional ALIGNMENT_CONTEXT_KEY_ALLOWS_SURVEY_READ=true for x-alignment-context-key';

/** `CAPABILITIES.routes` auth for GET /api/survey/visualization. */
export const SURVEY_READ_GATE_CAPABILITIES_ROUTE_AUTH =
  'Dev: open. Production: admin cookie, x-survey-visualization-key (when SURVEY_VISUALIZATION_API_SECRET set), optional x-alignment-context-key only if ALIGNMENT_CONTEXT_KEY_ALLOWS_SURVEY_READ=true, or SURVEY_VISUALIZATION_ALLOW_PUBLIC=true — see docs/AGENT_INTEGRATION.md';

/** `CAPABILITIES.routes` auth for GET /api/survey/approved-qualities. */
export const SURVEY_READ_GATE_CAPABILITIES_APPROVED_QUALITIES_AUTH =
  'Same as /api/survey/visualization (PII); production gate via checkSurveyReadGate';
