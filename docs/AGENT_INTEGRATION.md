# OpenGrimoire — agent and automation integration (single entry)

**Normative HTTP rules:** [ARCHITECTURE_REST_CONTRACT.md](./ARCHITECTURE_REST_CONTRACT.md) (entity × HTTP × auth matrix).

**Prompt and operator copy:** Prefer **accurate** descriptions of which routes exist and how auth works. Vague or misleading instructions (wrong “where” the data lives, filler instead of real context) hurt reliability more than short prompts. This is a **process** discipline, not a claim that models can introspect on weights or activations. See [DISCOVERY_STABILITY_GATE.md](./engineering/DISCOVERY_STABILITY_GATE.md).

### Single source of truth (documentation order)

When anything conflicts, resolve in this order:

1. **[ARCHITECTURE_REST_CONTRACT.md](./ARCHITECTURE_REST_CONTRACT.md)** — entity × HTTP × auth matrix (normative for routes and gates).
2. **This file** — quick reference table, base URL, headers, operational notes for agents and scripts.
3. **Route-specific docs** — e.g. [CLARIFICATION_QUEUE_API.md](./agent/CLARIFICATION_QUEUE_API.md), [ALIGNMENT_CONTEXT_API.md](./agent/ALIGNMENT_CONTEXT_API.md).

**Same PR as API changes:** Update the matrix and this index when you add or change routes ([CONTRIBUTING.md](../CONTRIBUTING.md)).

**Harness integration paths (HTTP vs optional MCP):** [agent/INTEGRATION_PATHS.md](./agent/INTEGRATION_PATHS.md) — primary stack is **REST + thin CLI**. **Optional MCP is product-constrained:** any future or workspace-registered tools must be **thin wrappers** over existing HTTP routes or published CLIs only—**no** second domain layer, **no** alternate persistence, **no** business logic that bypasses the REST contract. Workspace **least-privilege** server set for OpenGrimoire work: [Arc_Forge `docs/MCP_PROFILE_OPENGRIMOIRE.md`](../../Arc_Forge/docs/MCP_PROFILE_OPENGRIMOIRE.md). Optional stub: [`scripts/mcp-opengrimoire/README.md`](../scripts/mcp-opengrimoire/README.md).

**Unified tool manifest (HTTP + workspace MCP):** [AGENT_TOOL_MANIFEST.md](./AGENT_TOOL_MANIFEST.md). **Trust tiers + curl examples:** [agent/HARNESS_ACTION_TIERS.md](./agent/HARNESS_ACTION_TIERS.md). **Retries:** [agent/ADR_IDEMPOTENCY_AND_RETRY.md](./agent/ADR_IDEMPOTENCY_AND_RETRY.md).

### Survey visualization UI coordination (non-normative)

The **`/visualization`** client refetches survey rows and approved quotes when the browser dispatches the **`opengrimoire-survey-data-changed`** `CustomEvent` (see [`src/lib/survey/survey-data-change-event.ts`](../src/lib/survey/survey-data-change-event.ts)). The app fires this after successful **Sync Session** `POST /api/survey`, after **admin moderation** `PATCH`, when the moderation queue refetches on **window focus**, and when the operator clicks **Refresh** on the moderation panel—so open visualization tabs pick up new or approved data without a full reload. Harnesses may dispatch the same event after external writes if they share the origin.

### Agent session boundary (in-app vs harness)

OpenGrimoire **in-app** persistence is **domain data and operator auth** only: survey responses, alignment context, clarification queue, study entities, optional **operator probe run** records (internal observability ingest), and signed operator session cookies—everything described in [ARCHITECTURE_REST_CONTRACT.md](./ARCHITECTURE_REST_CONTRACT.md). The app is **not** a full agent-engine or transcript store; it does **not** persist arbitrary agent run state, chat logs, or IDE session dumps. **Harness-side** resume and correlation (session IDs, last successful HTTP call to this app, plan pointers, Sync Session handoff IDs) live in **MiscRepos + OpenHarness** artifacts; use the canonical template at [MiscRepos `docs/agent/SESSION_SNAPSHOT_TEMPLATE.md`](../../MiscRepos/docs/agent/SESSION_SNAPSHOT_TEMPLATE.md) (sibling clone under your GitHub folder).

### Token budgets (caller / harness)

OpenGrimoire **does not** enforce **LLM token budgets**, provider spend caps, or model output limits on the server. Any model calls happen in the **harness, IDE, or external daemons**—not as a billed sub-step of this HTTP API. **Env vars, soft vs hard truncation, and defaults** for scripts that invoke models: [MiscRepos `docs/agent/CALLER_SIDE_LLM_BUDGETS.md`](../../MiscRepos/docs/agent/CALLER_SIDE_LLM_BUDGETS.md). Policy framing (local-default vs remote-escalate): [MiscRepos `local-proto/docs/LOCAL_AI_TOKEN_OFFLOAD_POLICY.md`](../../MiscRepos/local-proto/docs/LOCAL_AI_TOKEN_OFFLOAD_POLICY.md). Summary row: [engineering/OPERATIONAL_TRADEOFFS.md](./engineering/OPERATIONAL_TRADEOFFS.md).

### Agent transcripts (compaction)

The Next.js app **does not** compact, summarize, or prune **agent or IDE chat transcripts** (**non-goal**; **no** transcript-compaction API or background job in-repo). Operators and agents reduce context **outside** the app via harness handoff rules: [MiscRepos `docs/agent/HANDOFF_COMPACTION.md`](../../MiscRepos/docs/agent/HANDOFF_COMPACTION.md). Same boundary in [engineering/OPERATIONAL_TRADEOFFS.md](./engineering/OPERATIONAL_TRADEOFFS.md).

## Quick reference

| Item | Value |
|------|--------|
| Local dev URL | **`http://localhost:3001`** (`npm run dev` in this repo) |
| Base URL for scripts | **`OPENGRIMOIRE_BASE_URL`** — must match origin including port (in-repo CLIs read this name only; older docs duplicated the same identifier in `||` chains — fixed 2026-04) |
| Alignment CLI | **`node scripts/alignment-context-cli.mjs`** (`list`, `create`, `patch`, `delete`) |
| Study / SRS (flashcards) | **`GET`/`POST` `/api/study/decks`**, **`GET`/`POST` `/api/study/decks/:deckId/cards`**, **`POST` `/api/study/cards/:cardId/review`** — operator session cookie **or** **`x-alignment-context-key`** when alignment secret is set. CSV export: **`npm run study:export -- --output ./export.csv`**. See [docs/learning/README.md](./learning/README.md). |
| Clarification queue (async agent → human) | **`GET`/`POST` `/api/clarification-requests`**, **`GET`/`PATCH` `/api/clarification-requests/:id`** — **`x-alignment-context-key`** when using alignment secret, or **`x-clarification-queue-key`** when **`CLARIFICATION_QUEUE_API_SECRET`** is set (recommended for production harnesses that only poll clarification). Operator UI: **`/admin/clarification-queue`**. See [docs/agent/CLARIFICATION_QUEUE_API.md](./agent/CLARIFICATION_QUEUE_API.md). |
| Sync Session handoff (IDs after submit) | Successful **`POST /api/survey`** returns **`attendeeId`**, **`surveyResponseId`**, and **`harnessProfileId`** — semantics, ledger correlation, and response contract in [SYNC_SESSION_HANDOFF.md](./agent/SYNC_SESSION_HANDOFF.md) §6–§7. Profile vs alignment context: §6.3. |
| Machine-readable routes | **`GET /api/capabilities`** — human UI: **`/capabilities`** |
| Alignment secret | Set **`ALIGNMENT_CONTEXT_API_SECRET`**; send header **`x-alignment-context-key`** on each public alignment request when enforced |
| Clarification secret (optional) | Set **`CLARIFICATION_QUEUE_API_SECRET`**; send **`x-clarification-queue-key`** on `/api/clarification-requests` only. **When unset**, clarification uses the **same** secret and header as alignment (one key gates both surfaces). Split keys to limit blast radius if alignment automation and clarification automation are owned by different systems. |
| Survey read escape hatch | **`ALIGNMENT_CONTEXT_KEY_ALLOWS_SURVEY_READ=true`** lets **`x-alignment-context-key`** satisfy the production gate for **`GET /api/survey/visualization`** and **`GET /api/survey/approved-qualities`** (PII). **Default off.** Prefer **`SURVEY_VISUALIZATION_API_SECRET`** + **`x-survey-visualization-key`** for read-only survey data so a leaked alignment key does not automatically imply survey PII access. |
| Brain map | **`GET /api/brain-map/graph`** only (not bare `/brain-map-graph.json`); when **`BRAIN_MAP_SECRET`** is set: **`x-brain-map-key`** matching the secret **or** operator session cookie (same-origin UI sends **`credentials: 'include'`**) |
| Operator observability (probe runs) | **`POST /api/operator-probes/ingest`** — operator session **`credentials: 'include'`** **or** **`OPERATOR_PROBE_INGEST_SECRET`** + header **`x-operator-probe-ingest-key`**. **`GET`** list / **`GET`** detail / **`DELETE`** via **`/api/admin/operator-probes`** (session only). UI **`/admin/observability`**. `target_host` must be on the server allowlist (see contract). |
| Admin / operator | **`POST /api/auth/login`** with password; session cookie (**`OPENGRIMOIRE_SESSION_SECRET`**, **`OPENGRIMOIRE_ADMIN_PASSWORD`** or hash) — see [OPENGRIMOIRE_ADMIN_ROLE.md](./admin/OPENGRIMOIRE_ADMIN_ROLE.md) |
| Survey reads (PII) in production | **`GET /api/survey/visualization`**, **`GET /api/survey/approved-qualities`** require admin session, alignment header, **`SURVEY_VISUALIZATION_API_SECRET`** + **`x-survey-visualization-key`**, or **`SURVEY_VISUALIZATION_ALLOW_PUBLIC=true`**. Development is unrestricted. Details: [ARCHITECTURE_REST_CONTRACT.md](./ARCHITECTURE_REST_CONTRACT.md) § Survey read endpoints. **CI / local prod matrix:** `npm run verify:survey-read-prod` ([`scripts/survey-read-gate-prod-smoke.mjs`](../scripts/survey-read-gate-prod-smoke.mjs)); workflow [`.github/workflows/survey-visualization-prod-smoke.yml`](../.github/workflows/survey-visualization-prod-smoke.yml). |

## Canonical naming (UX vs system)

- **Sync Session (UX):** User-facing workflow label for the structured alignment one-on-one.
- **Alignment Context (system):** Persisted alignment items and `/api/alignment-context` (and alignment CLI)—separate from the survey submit path.
- **Sync Session Record (entity language):** A completed Sync Session today **persists as a survey response** (`POST /api/survey`, survey tables). It is **not** automatically an alignment-context entity; create those via `/api/alignment-context` or the CLI when you need alignment-context records.

## Base URL and port

| Environment | Origin |
|-------------|--------|
| Local `npm run dev` | **`http://localhost:3001`** (see `package.json`) |
| Production | Your deployed origin |

Set **`OPENGRIMOIRE_BASE_URL`** in scripts and CLIs to match (including port).

When multiple local services run from the same workspace, prefer resolving OpenGrimoire’s origin from **MiscRepos** `.cursor/state/ports.json` (`services.opengrimoire.baseUrl`) per [.cursor/docs/PORT_REGISTRY.md](../../MiscRepos/.cursor/docs/PORT_REGISTRY.md); fall back to `defaults.opengrimoire` in `ports.json.template` or **3001** above.

## Headers

| Header | When |
|--------|------|
| `x-alignment-context-key` | Must match `ALIGNMENT_CONTEXT_API_SECRET` when that env var is set (public alignment API and, unless `CLARIFICATION_QUEUE_API_SECRET` is set, clarification queue API). |
| `x-clarification-queue-key` | When `CLARIFICATION_QUEUE_API_SECRET` is set: must match for `/api/clarification-requests` and `/api/clarification-requests/:id` (public routes only). |
| `x-brain-map-key` | When `BRAIN_MAP_SECRET` is set: must match for programmatic access, unless the request uses a valid operator session cookie instead (`GET /api/brain-map/graph`). |
| `x-operator-probe-ingest-key` | When `OPERATOR_PROBE_INGEST_SECRET` is set: must match for **`POST /api/operator-probes/ingest`** without operator session cookie (CI/runner ingest). **Do not** reuse `ALIGNMENT_CONTEXT_API_SECRET` for this surface. |

**Brain map JSON:** Do not fetch `/brain-map-graph.json` or `/brain-map-graph.local.json` from the site root — those paths return **404**. Use **`GET /api/brain-map/graph`** only.

### Operator probe ingest (curl)

```bash
curl -sS -X POST "$BASE/api/operator-probes/ingest" \
  -H "Content-Type: application/json" \
  -H "x-operator-probe-ingest-key: $OPERATOR_PROBE_INGEST_SECRET" \
  -d '{"probe_type":"cursor_path_analysis","target_host":"api.cursor.com","runner_id":"my-laptop","runner_type":"laptop_script","summary":{"ok":true,"hops":5}}'
```

## Local development: alignment API

Without `ALIGNMENT_CONTEXT_API_SECRET`, the server returns **503** unless you set:

`ALIGNMENT_CONTEXT_ALLOW_INSECURE_LOCAL=true` (development only; never on public hosts).

Alternatively, set a real `ALIGNMENT_CONTEXT_API_SECRET` and send it on each request.

## Machine-readable surface

- **`GET /api/capabilities`** — routes, auth hints, workflow notes (hand-maintained; same PR as API changes when possible).
- Human-friendly view: **`/capabilities`** in the app.

**Observability:** There is **no** typed agent event or progress stream from this app. **Operator probe runs** are an optional, **internal** SQLite-backed surface: **`POST /api/operator-probes/ingest`** (session or ingest secret) stores allowlisted connectivity/path summaries for review under **`/admin/observability`** — see the quick reference table above and [ARCHITECTURE_REST_CONTRACT.md](./ARCHITECTURE_REST_CONTRACT.md). Server-side audit for auth failures remains **structured JSON lines** (`event: access_denied`); see [engineering/OPERATOR_LOG_FIELDS.md](./engineering/OPERATOR_LOG_FIELDS.md). **Transcript compaction** is **out of scope** for the server (see § Agent transcripts above).

## CLI (alignment context)

```bash
node scripts/alignment-context-cli.mjs list
node scripts/alignment-context-cli.mjs create --title "Example" --body "Optional"
```

Env: `OPENGRIMOIRE_BASE_URL`, `ALIGNMENT_CONTEXT_API_SECRET` (when the server enforces the secret).

## HTTP examples (curl)

Replace `BASE` with your origin (e.g. `http://localhost:3001`). When a secret env is set on the server, include the matching header.

**Capabilities manifest (public):**

```bash
curl -sS "$BASE/api/capabilities"
```

**Brain map graph** (when `BRAIN_MAP_SECRET` is set — header **or** session cookie):

```bash
curl -sS -H "x-brain-map-key: $BRAIN_MAP_SECRET" "$BASE/api/brain-map/graph"
# Logged-in browser: same-origin fetch with credentials: include (no header required).
```

**List alignment context** (add header when `ALIGNMENT_CONTEXT_API_SECRET` is set; on local dev without a secret you may need `ALIGNMENT_CONTEXT_ALLOW_INSECURE_LOCAL=true` per section above):

```bash
curl -sS -H "x-alignment-context-key: $ALIGNMENT_CONTEXT_API_SECRET" \
  "$BASE/api/alignment-context?limit=50"
```

**Create alignment item (POST):**

```bash
curl -sS -X POST -H "Content-Type: application/json" \
  -H "x-alignment-context-key: $ALIGNMENT_CONTEXT_API_SECRET" \
  -d '{"title":"From curl","body":"Optional body","status":"draft"}' \
  "$BASE/api/alignment-context"
```

See [agent/ALIGNMENT_CONTEXT_API.md](./agent/ALIGNMENT_CONTEXT_API.md) for `PATCH` / `DELETE` by id.

## Admin UI vs API

- **Admin** (`/admin`, `/admin/alignment`): Browser session via signed cookie after **`POST /api/auth/login`** (operator password from env). See [OPENGRIMOIRE_ADMIN_ROLE.md](./admin/OPENGRIMOIRE_ADMIN_ROLE.md).
- **Public alignment API:** shared-secret header (not the browser session).
- **`linked_node_id` (optional):** Alignment items may reference a brain-map node **`id`** (same string as in `GET /api/brain-map/graph` → `nodes[].id`). Set via API, CLI, or admin. The **`/context-atlas`** viewer does **not** list alignment rows or deep-link into admin from a node — blueprint: [OPEN_GRIMOIRE_LOCAL_FIRST_INTEGRATION.md](./OPEN_GRIMOIRE_LOCAL_FIRST_INTEGRATION.md) (Phase 3).

## Clarification queue (async HITL)

**Shipped:** SQLite **`clarification_requests`** + HTTP API + operator inbox **`/admin/clarification-queue`**. Distinct from Sync Session (`POST /api/survey`). See [HITL_INTENT_SURVEY_BACKLOG.md](./HITL_INTENT_SURVEY_BACKLOG.md) (design history) and [agent/CLARIFICATION_QUEUE_API.md](./agent/CLARIFICATION_QUEUE_API.md).

## Optional: thin MCP over REST (backlog)

No first-party OpenGrimoire MCP server ships in-repo. A **future** MCP could expose only thin wrappers (`alignment_context_list`, `alignment_context_create`, `brain_map_graph_get`) around existing HTTP routes — **no** second domain layer, **no** shadow database, **no** transcript store. **Reference pattern:** [scripts/mcp-opengrimoire/README.md](../scripts/mcp-opengrimoire/README.md). If you register tools in Cursor, add them to your workspace MCP capability map ([MiscRepos MCP_CAPABILITY_MAP.md](../../MiscRepos/.cursor/docs/MCP_CAPABILITY_MAP.md)) and keep the enabled set minimal ([Arc_Forge `docs/MCP_PROFILE_OPENGRIMOIRE.md`](../../Arc_Forge/docs/MCP_PROFILE_OPENGRIMOIRE.md)). See [agent/INTEGRATION_PATHS.md](./agent/INTEGRATION_PATHS.md).

## Untrusted content (LLM safety)

Alignment `body` / `title` may originate from external agents or pasted text; treat them as **untrusted** if a harness feeds them into an LLM or downstream tools. **OpenGrimoire does not replace harness-side screening:** apply **secure-contain-protect** and [TOOL_SAFEGUARDS.md](../../local-proto/docs/TOOL_SAFEGUARDS.md) (use your `local-proto` clone path; often a sibling of `OpenGrimoire` under `GitHub/`). See also [ARCHITECTURE_REST_CONTRACT.md](./ARCHITECTURE_REST_CONTRACT.md) § Non-goals.

## Related docs

- [research/AGENT_HARNESS_PRIMITIVES_2026-04-03.md](./research/AGENT_HARNESS_PRIMITIVES_2026-04-03.md) — Agent harness primitives checklist (secondary-source synthesis; gap matrix and P1–P12 backlog seeds).
- [research/AGENT_HARNESS_IMPROVEMENT_PROMPT.md](./research/AGENT_HARNESS_IMPROVEMENT_PROMPT.md) — Reusable prompt to turn this checklist into a phased improvement program; paired [filled snapshot](./research/AGENT_HARNESS_IMPROVEMENT_PROGRAM_2026-04-03.md).
- [research/AGENT_HARNESS_PHASE1_ISSUES.md](./research/AGENT_HARNESS_PHASE1_ISSUES.md) — Phase 1 (P1/P2/P4/P12) GitHub issue bodies and dependency order; run [scripts/README_GH_PHASE1.md](../scripts/README_GH_PHASE1.md) to create labels and issues via `gh`.
- [research/AGENT_HARNESS_REGENERATION_CHECKLIST.md](./research/AGENT_HARNESS_REGENERATION_CHECKLIST.md) — bump improvement program when the gap matrix changes.
- [OPEN_GRIMOIRE_LOCAL_FIRST_INTEGRATION.md](./OPEN_GRIMOIRE_LOCAL_FIRST_INTEGRATION.md) — OpenGrimoire optional graph metadata + Phase 3 alignment linkage (what the graph UI does and does not show).
- [agent/ALIGNMENT_CONTEXT_API.md](./agent/ALIGNMENT_CONTEXT_API.md)
- [agent/CLARIFICATION_QUEUE_API.md](./agent/CLARIFICATION_QUEUE_API.md)
- [agent/INTEGRATION_PATHS.md](./agent/INTEGRATION_PATHS.md)
- [BRAIN_MAP_SCHEMA.md](./BRAIN_MAP_SCHEMA.md)
- [security/NEXT_PUBLIC_AND_SECRETS.md](./security/NEXT_PUBLIC_AND_SECRETS.md)
