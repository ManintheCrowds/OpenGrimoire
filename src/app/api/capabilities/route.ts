import { NextResponse } from 'next/server';

/**
 * Hand-maintained machine-readable API surface for agents (OA-REST-2).
 * Update in the same PR as changes under src/app/api/ (see CONTRIBUTING.md, ARCHITECTURE_REST_CONTRACT.md).
 */
const CAPABILITIES = {
  app: 'open-grimoire',
  maintainer_note:
    'Mirror of docs entity matrix; not generated. Extend when adding routes.',
  documentation: {
    contract: '/docs/ARCHITECTURE_REST_CONTRACT.md (repo)',
    alignment_api: '/docs/agent/ALIGNMENT_CONTEXT_API.md (repo)',
    openapi_partial: 'GET /api/openapi or GET /api/openapi.json (partial OpenAPI 3; see src/lib/openapi/openapi-document.ts)',
    discovery_stability_gate: '/docs/engineering/DISCOVERY_STABILITY_GATE.md (repo; Phase A gate)',
    route_index: '/docs/api/ROUTE_INDEX.json (generated; scripts/generate-route-index.mjs)',
    opencompass_brain_map_interop:
      'Portfolio: MiscRepos/trustgraph-local-repo/interop/OPENCOMPASS_OPENGRIMOIRE_INTEROP.md',
  },
  workflows: [
    {
      id: 'opencompass_brain_map',
      summary:
        'OpenGrimoire offline pipeline: ingest OpenCompass summary_*.csv and merge into public/brain-map-graph.local.json via trustgraph-local-repo scripts; no POST API on OpenGrimoire for this.',
      ui_path: '/brain-map',
      api: 'GET /api/brain-map/graph',
      data_source: 'public/brain-map-graph.local.json',
      refresh: 'manual_after_merge',
      reference_note:
        'See documentation.opencompass_brain_map_interop; refresh browser after file merge (no live SSE).',
    },
  ],
  auth_env_hints: [
    'ALIGNMENT_CONTEXT_API_SECRET + header x-alignment-context-key',
    'BRAIN_MAP_SECRET: x-brain-map-key or operator session cookie (same origin, credentials: include)',
    'Operator session: POST /api/auth/login sets HTTP-only cookie (OPENGRIMOIRE_ADMIN_PASSWORD or OPENGRIMOIRE_ADMIN_PASSWORD_HASH + OPENGRIMOIRE_SESSION_SECRET)',
    'Survey reads (production): SURVEY_VISUALIZATION_ALLOW_PUBLIC=true, or admin session, or SURVEY_VISUALIZATION_API_SECRET + x-survey-visualization-key; optional ALIGNMENT_CONTEXT_KEY_ALLOWS_SURVEY_READ=true for x-alignment-context-key',
    'Harness profiles: operator session cookie or x-alignment-context-key for catalog/CRUD/OpenHarness bundle; /api/harness-profiles/select is public for Sync Session startup',
    'POST /api/auth/login: rate limited 10 requests per 60s per IP (middleware; single process)',
  ],
  routes: [
    {
      path: '/api/alignment-context',
      methods: ['GET', 'POST'],
      auth: 'x-alignment-context-key when ALIGNMENT_CONTEXT_API_SECRET set',
    },
    {
      path: '/api/alignment-context/:id',
      methods: ['PATCH', 'DELETE'],
      auth: 'x-alignment-context-key when ALIGNMENT_CONTEXT_API_SECRET set',
    },
    {
      path: '/api/admin/alignment-context',
      methods: ['GET', 'POST'],
      auth: 'OpenGrimoire operator session cookie',
    },
    {
      path: '/api/admin/alignment-context/:id',
      methods: ['PATCH', 'DELETE'],
      auth: 'OpenGrimoire operator session cookie',
    },
    {
      path: '/api/clarification-requests',
      methods: ['GET', 'POST'],
      auth: 'x-clarification-queue-key when CLARIFICATION_QUEUE_API_SECRET set; else x-alignment-context-key (alignment secret)',
    },
    {
      path: '/api/clarification-requests/:id',
      methods: ['GET', 'PATCH'],
      auth: 'x-clarification-queue-key when CLARIFICATION_QUEUE_API_SECRET set; else x-alignment-context-key (alignment secret)',
    },
    {
      path: '/api/admin/clarification-requests',
      methods: ['GET', 'POST'],
      auth: 'OpenGrimoire operator session cookie',
    },
    {
      path: '/api/admin/clarification-requests/:id',
      methods: ['GET', 'PATCH'],
      auth: 'OpenGrimoire operator session cookie',
    },
    {
      path: '/api/intent-ledger',
      methods: ['GET'],
      auth: 'OpenGrimoire operator session cookie or x-alignment-context-key (same gate as alignment API)',
    },
    {
      path: '/api/intent-ledger/:attendeeId',
      methods: ['GET'],
      auth: 'OpenGrimoire operator session cookie or x-alignment-context-key (same gate as alignment API)',
    },
    {
      path: '/api/admin/moderation-queue',
      methods: ['GET'],
      auth: 'OpenGrimoire operator session cookie',
    },
    {
      path: '/api/admin/moderation/:responseId',
      methods: ['PATCH'],
      auth: 'OpenGrimoire operator session cookie',
    },
    {
      path: '/api/admin/debug-survey',
      methods: ['GET'],
      auth: 'OpenGrimoire operator session cookie',
    },
    {
      path: '/api/auth/login',
      methods: ['POST'],
      auth: 'Body { password }; sets session cookie',
    },
    {
      path: '/api/auth/logout',
      methods: ['POST'],
      auth: 'Clears session cookie',
    },
    {
      path: '/api/auth/session',
      methods: ['GET'],
      auth: 'Session cookie; returns 401 if not logged in',
    },
    {
      path: '/api/study/decks',
      methods: ['GET', 'POST'],
      auth: 'OpenGrimoire operator session cookie or x-alignment-context-key (same gate as alignment API)',
    },
    {
      path: '/api/study/decks/:deckId/cards',
      methods: ['GET', 'POST'],
      auth: 'OpenGrimoire operator session cookie or x-alignment-context-key',
    },
    {
      path: '/api/study/cards/:cardId/review',
      methods: ['POST'],
      auth: 'OpenGrimoire operator session cookie or x-alignment-context-key',
    },
    {
      path: '/api/brain-map/graph',
      methods: ['GET'],
      auth:
        'When BRAIN_MAP_SECRET set: x-brain-map-key matching secret or OpenGrimoire operator session cookie',
    },
    {
      path: '/api/survey',
      methods: ['POST'],
      auth:
        'Public; persists to local SQLite. Optional: x-survey-post-token (SURVEY_POST_REQUIRE_TOKEN), turnstileToken body field (Turnstile when enforced). 200 returns attendeeId + surveyResponseId — docs/agent/SYNC_SESSION_HANDOFF.md',
    },
    {
      path: '/api/survey/bootstrap-token',
      methods: ['GET'],
      auth: 'Public; short-lived JWT for POST when SURVEY_POST_REQUIRE_TOKEN is set — see docs/engineering/OPERATIONAL_TRADEOFFS.md',
    },
    {
      path: '/api/harness-profiles',
      methods: ['GET', 'POST', 'PUT'],
      auth: 'OpenGrimoire operator session cookie or x-alignment-context-key',
    },
    {
      path: '/api/harness-profiles/:id',
      methods: ['GET', 'PATCH', 'DELETE'],
      auth: 'OpenGrimoire operator session cookie or x-alignment-context-key',
    },
    {
      path: '/api/harness-profiles/openharness',
      methods: ['GET'],
      auth: 'OpenGrimoire operator session cookie or x-alignment-context-key',
    },
    {
      path: '/api/harness-profiles/select',
      methods: ['GET', 'POST'],
      auth: 'Public profile selection helper for Sync Session start',
    },
    {
      path: '/api/survey/visualization',
      methods: ['GET'],
      auth:
        'Dev: open. Production: admin cookie, x-survey-visualization-key (when SURVEY_VISUALIZATION_API_SECRET set), optional x-alignment-context-key only if ALIGNMENT_CONTEXT_KEY_ALLOWS_SURVEY_READ=true, or SURVEY_VISUALIZATION_ALLOW_PUBLIC=true — see docs/AGENT_INTEGRATION.md',
    },
    {
      path: '/api/survey/approved-qualities',
      methods: ['GET'],
      auth:
        'Same as /api/survey/visualization (PII); production gate via checkSurveyReadGate',
    },
    {
      path: '/api/test-data/:dataset',
      methods: ['GET'],
      auth: 'None (stub)',
    },
    {
      path: '/api/capabilities',
      methods: ['GET'],
      auth: 'None (public manifest)',
    },
    {
      path: '/api/openapi',
      methods: ['GET'],
      auth: 'None (public partial OpenAPI document); /api/openapi.json rewrites here (next.config.js)',
    },
  ],
} as const;

export async function GET() {
  return NextResponse.json(CAPABILITIES, {
    headers: { 'Cache-Control': 'public, max-age=300' },
  });
}
