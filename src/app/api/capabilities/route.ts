import { NextResponse } from 'next/server';

import {
  SURVEY_READ_GATE_CAPABILITIES_APPROVED_QUALITIES_AUTH,
  SURVEY_READ_GATE_CAPABILITIES_AUTH_ENV_HINT,
  SURVEY_READ_GATE_CAPABILITIES_ROUTE_AUTH,
} from '@/lib/survey/survey-read-gate-public-messages';

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
    non_contractual_ui:
      '/test, /test-chord, /test-context, /test-sqlite and other /test* app routes are dev/mock surfaces — not listed in routes[]; production 404 unless OPENGRIMOIRE_ALLOW_TEST_ROUTES; see docs/AGENT_INTEGRATION.md § Dev / mock UI routes',
    opencompass_brain_map_interop:
      'Portfolio: MiscRepos/trustgraph-local-repo/interop/OPENCOMPASS_OPENGRIMOIRE_INTEROP.md',
  },
  workflows: [
    {
      id: 'opencompass_brain_map',
      summary:
        'OpenGrimoire offline pipeline: ingest OpenCompass summary_*.csv and merge into public/brain-map-graph.local.json via trustgraph-local-repo scripts; no POST API on OpenGrimoire for this.',
      ui_path: '/context-atlas',
      api: 'GET /api/brain-map/graph',
      data_source: 'public/brain-map-graph.local.json',
      refresh: 'manual_after_merge',
      reference_note:
        'See documentation.opencompass_brain_map_interop; refresh browser after file merge (no live SSE). Legacy path /brain-map redirects to /context-atlas.',
    },
    {
      id: 'llm_wiki_mirror_read',
      summary:
        'Read-only Karpathy-style LLM Wiki mirror under public/wiki (vault LLM-Wiki/ remains SSOT). No write API; render is escaped plaintext in /wiki.',
      ui_path: '/wiki',
      api: '(none — files on disk only)',
      data_source: 'public/wiki/**/*.md (robocopy from vault via MiscRepos script)',
      refresh: 'manual_after_robocopy',
      reference_note: 'See docs/WIKI_MIRROR.md; Phase B minimal slice (no search, no edit, no wikilink routing).',
    },
    {
      id: 'cohort_survey_visualization',
      summary:
        'Alluvial/Chord cohort views over SQLite survey rows; header shows approved unique_quality quotes.',
      ui_path: '/visualization',
      api:
        'Cohort charts: GET /api/survey/visualization?all=1; network/constellation clients: GET /api/survey/visualization?all=0&showTestData=true|false (when all=1, showTestData is ignored per route handler); GET /api/survey/approved-qualities (same read gate)',
      data_source: 'Local SQLite via getVisualizationData / getApprovedUniqueQualities',
      refresh:
        'Remount; window CustomEvent opengrimoire-survey-data-changed after moderation or POST /api/survey (see AGENT_INTEGRATION.md); admin focus also dispatches from /admin',
      reference_note:
        'UI routes and query semantics: see ui_surfaces ids survey_cohort_charts and survey_network_constellation in this manifest.',
    },
    {
      id: 'operator_observability_probes',
      summary:
        'Internal operator surface: ingest path/connectivity probe summaries (e.g. traceroute-to-Cursor) from trusted runners; list and delete under /admin/observability. target_host allowlist in code.',
      ui_path: '/admin/observability',
      api: 'POST /api/operator-probes/ingest; GET /api/admin/operator-probes; GET|DELETE /api/admin/operator-probes/:id',
      data_source: 'SQLite table operator_probe_runs (TTL via OPERATOR_PROBE_RETENTION_DAYS)',
      refresh: 'After POST ingest or delete; runner measures its own environment — not end-user browsers unless runner runs there',
      reference_note: 'See ARCHITECTURE_REST_CONTRACT.md matrix row; AGENT_INTEGRATION.md headers. Ingest: operator session cookie or OPERATOR_PROBE_INGEST_SECRET + x-operator-probe-ingest-key.',
    },
  ],
  ui_surfaces: [
    {
      id: 'survey_cohort_charts',
      paths: ['/visualization', '/visualization/dark', '/visualization/alluvial'],
      fetch_pattern:
        'GET /api/survey/visualization?all=1 — use credentials: include when using operator session cookie',
      approved_quotes_api: 'GET /api/survey/approved-qualities (same survey read gate)',
      client_module:
        'src/lib/visualization/surveyVisualizationFetch.ts (cohort mode); src/components/DataVisualization/shared/useVisualizationData.ts',
      survey_read_gate_hint: SURVEY_READ_GATE_CAPABILITIES_AUTH_ENV_HINT,
      agent_note:
        'Precomputed graph nodes/edges are not returned by HTTP; see docs/AGENT_INTEGRATION.md § Survey graph JSON (agent parity).',
    },
    {
      id: 'survey_network_constellation',
      paths: ['/constellation'],
      fetch_pattern:
        'GET /api/survey/visualization?all=0&showTestData=false (constellation); /visualization network mode uses the same path with showTestData toggled in src/store/visualizationStore.ts (default true)',
      client_modules:
        'src/lib/visualization/surveyVisualizationFetch.ts (filtered mode); src/lib/visualization/fetchVisualizationData.ts; src/store/constellationStore.ts; src/store/visualizationStore.ts; src/lib/utils/export.ts; src/lib/visualization/processData.ts',
      survey_read_gate_hint: SURVEY_READ_GATE_CAPABILITIES_AUTH_ENV_HINT,
      agent_note:
        'No HTTP endpoint returns { nodes, edges }; see docs/AGENT_INTEGRATION.md § Survey graph JSON (agent parity).',
    },
  ],
  auth_env_hints: [
    'ALIGNMENT_CONTEXT_API_SECRET + header x-alignment-context-key',
    'BRAIN_MAP_SECRET: x-brain-map-key or operator session cookie (same origin, credentials: include)',
    'Operator session: POST /api/auth/login sets HTTP-only cookie (OPENGRIMOIRE_ADMIN_PASSWORD or OPENGRIMOIRE_ADMIN_PASSWORD_HASH + OPENGRIMOIRE_SESSION_SECRET)',
    SURVEY_READ_GATE_CAPABILITIES_AUTH_ENV_HINT,
    'Harness profiles: operator session cookie or x-alignment-context-key for catalog/CRUD/OpenHarness bundle; /api/harness-profiles/select is public for Sync Session startup',
    'POST /api/auth/login: rate limited 10 requests per 60s per IP (middleware; single process)',
    'OPERATOR_PROBE_INGEST_SECRET + header x-operator-probe-ingest-key for POST /api/operator-probes/ingest when runners have no operator cookie; optional OPERATOR_PROBE_RETENTION_DAYS (default 30)',
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
      auth:
        'OpenGrimoire operator session cookie; operator_session_only_no_alignment_key (moderation never uses x-alignment-context-key)',
    },
    {
      path: '/api/admin/moderation/:responseId',
      methods: ['PATCH'],
      auth:
        'OpenGrimoire operator session cookie; operator_session_only_no_alignment_key (moderation never uses x-alignment-context-key)',
    },
    {
      path: '/api/admin/debug-survey',
      methods: ['GET'],
      auth: 'OpenGrimoire operator session cookie',
    },
    {
      path: '/api/admin/operator-probes',
      methods: ['GET'],
      auth: 'OpenGrimoire operator session cookie',
    },
    {
      path: '/api/admin/operator-probes/:id',
      methods: ['GET', 'DELETE'],
      auth: 'OpenGrimoire operator session cookie',
    },
    {
      path: '/api/operator-probes/ingest',
      methods: ['POST'],
      auth:
        'OpenGrimoire operator session cookie OR OPERATOR_PROBE_INGEST_SECRET + x-operator-probe-ingest-key (503 if neither session nor secret configured for non-session callers)',
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
      auth: SURVEY_READ_GATE_CAPABILITIES_ROUTE_AUTH,
    },
    {
      path: '/api/survey/approved-qualities',
      methods: ['GET'],
      auth: SURVEY_READ_GATE_CAPABILITIES_APPROVED_QUALITIES_AUTH,
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
