# OpenGrimoire — strict public REST contract and agent norms

**Purpose:** Normative rules for how **domain entities** are exposed over HTTP to operators and external agents. The [agent-native audit](./AGENT_NATIVE_AUDIT_OPENGRIMOIRE.md) is a **gap report** against this document, not a substitute for it.

**Related:** [OPENGRIMOIRE_SYSTEMS_INVENTORY.md](./OPENGRIMOIRE_SYSTEMS_INVENTORY.md), [agent/INTEGRATION_PATHS.md](./agent/INTEGRATION_PATHS.md), [agent/ALIGNMENT_CONTEXT_API.md](./agent/ALIGNMENT_CONTEXT_API.md), [engineering/DISCOVERY_STABILITY_GATE.md](./engineering/DISCOVERY_STABILITY_GATE.md) (CI gate for capabilities + partial OpenAPI parity).

---

## Governing rule: strict public REST for entities

**Rule:** Every **domain entity** that OpenGrimoire exposes to operators or programmatic agents must have a **stable, documented public HTTP contract**: methods, paths, request/response shapes, and authentication/authorization behavior. UIs and scripts consume that contract. Ad hoc server actions or undocumented fetch paths are **not** the canonical integration surface for agents.

**What “strict public REST” does *not* require:** Full CRUD for every resource. It **does** require **honest labeling**: read-only, write-only, or full CRUD — with **no silent gaps** for capabilities we claim agents can use.

### What counts as an entity

An **entity** is a domain resource with a defined persistence or document shape, not every React page. Examples:

| Entity | Canonical integration |
|--------|------------------------|
| Alignment context rows | `GET`/`POST` `/api/alignment-context`, `PATCH`/`DELETE` `/api/alignment-context/:id` (+ admin BFF under `/api/admin/alignment-context`) |
| Clarification queue (async agent questions) | `GET`/`POST` `/api/clarification-requests`, `GET`/`PATCH` `/api/clarification-requests/:id` (+ admin BFF under `/api/admin/clarification-requests`). See [CLARIFICATION_QUEUE_API.md](./agent/CLARIFICATION_QUEUE_API.md). |
| Survey submission (attendee + responses) | `POST` `/api/survey` (create only at this layer) |
| Brain-map graph document | `GET` `/api/brain-map/graph` (file-backed JSON) |
| Operator probe runs (internal observability) | `POST` `/api/operator-probes/ingest`; `GET`/`DELETE` `/api/admin/operator-probes/:id`; `GET` `/api/admin/operator-probes` (operator session) |
| Test dataset stub | `GET` `/api/test-data/:dataset` |

If a new entity gains an API, it must appear in the [entity × HTTP × auth matrix](#entity--http--auth-matrix) in the same change (see [CONTRIBUTING.md](../CONTRIBUTING.md)).

---

## Non-goals (explicit)

The following belong **outside** OpenGrimoire unless the product direction changes:

- **In-app “agent context” or exported prompt bundles** for Cursor/LLM sessions. System prompts, rules, and harness session context live in **MiscRepos / OpenHarness-style harnesses**, **Cursor**, and **local-proto**. OpenGrimoire exposes **data** (e.g. alignment context) that a harness **may** fetch and inject upstream.
- **Embedding SCP (secure-contain-protect) inside the app** as the only line of defense. Untrusted content pasted into alignment or other fields should be gated in the **agent harness** per **`MiscRepos/local-proto/docs/TOOL_SAFEGUARDS.md`** (sibling **MiscRepos** clone next to **OpenGrimoire**; no stable relative link from this repo) and the **secure-contain-protect** skill at **`MiscRepos/.cursor/skills/secure-contain-protect/SKILL.md`**. If you only have a standalone `local-proto` clone elsewhere, open `docs/TOOL_SAFEGUARDS.md` there—the document is the same source of truth.

---

## Entity × HTTP × auth matrix

Maintenance: update this table when adding or changing routes under `src/app/api/`. Same PR as the code change.

| Entity / surface | GET | POST | PATCH | DELETE | Auth mechanism | Notes |
|------------------|-----|------|-------|--------|----------------|-------|
| Alignment context (public API) | yes (`/api/alignment-context`) | yes | yes (`/api/alignment-context/:id`) | yes | Header `x-alignment-context-key` when `ALIGNMENT_CONTEXT_API_SECRET` is set | [ALIGNMENT_CONTEXT_API.md](./agent/ALIGNMENT_CONTEXT_API.md); public **PATCH** does not accept `source` (admin only) |
| Alignment context (admin BFF) | yes | yes | yes | yes | Signed HTTP-only session cookie (`opengrimoire_session`) after `POST /api/auth/login` | No shared-secret header on admin routes |
| Clarification queue (public API) | yes (`/api/clarification-requests`) | yes | yes (`/api/clarification-requests/:id`) | — | **`ALIGNMENT_CONTEXT_API_SECRET`** + **`x-alignment-context-key`**, or **`CLARIFICATION_QUEUE_API_SECRET`** + **`x-clarification-queue-key`** when that env is set (recommended in production for blast-radius separation) | [CLARIFICATION_QUEUE_API.md](./agent/CLARIFICATION_QUEUE_API.md); distinct from Sync Session / survey POST |
| Clarification queue (admin BFF) | yes | yes | yes (`/api/admin/clarification-requests/:id`) | — | Operator session cookie | UI: `/admin/clarification-queue` |
| Brain-map graph | yes (`/api/brain-map/graph`) | — | — | — | When `BRAIN_MAP_SECRET` is set: `x-brain-map-key` matching secret **or** operator session cookie (`credentials: 'include'` from same origin) | Serves `public/brain-map-graph.local.json` or `.json` |
| Survey submissions | — | yes (`/api/survey`) | — | — | Public POST; server writes SQLite (`data/opengrimoire.sqlite` by default); not the alignment shared-secret pattern | Creates `attendees` + `responses`; **200** body and error semantics — [SYNC_SESSION_HANDOFF.md §7](./agent/SYNC_SESSION_HANDOFF.md). **429** if rate-limited — see [Survey POST rate limiting](#survey-post-rate-limiting) |
| Survey visualization data | yes (`/api/survey/visualization`) | — | — | — | **Production vs dev:** same rules as [Survey read endpoints](#survey-read-endpoints-visualization--approved-qualities). Canonical **401 `detail`** and `/api/capabilities` copy: [`src/lib/survey/survey-read-gate-public-messages.ts`](../src/lib/survey/survey-read-gate-public-messages.ts). | May include PII; same gate as approved-qualities |
| Survey approved quotes | yes (`/api/survey/approved-qualities`) | — | — | — | Same gate as visualization (see SSOT module above). | Name + quote text |
| Operator login | — | yes (`/api/auth/login`) | — | — | Body `{ password }`; **429** if rate-limited — see [Login POST rate limiting](#login-post-rate-limiting) | Sets HTTP-only session cookie |
| Test data (stub) | yes (`/api/test-data/:dataset`) | — | — | — | None in stub | Placeholder JSON for tests/dev |
| Capabilities manifest | yes (`/api/capabilities`) | — | — | — | None (public JSON index) | Hand-maintained; update with API PRs. May include `workflows[]`, **`ui_surfaces[]`** (maps app routes such as `/visualization` and `/constellation` to survey visualization query patterns and production read-gate hints), and extra `documentation.*` keys for operator pipelines (e.g. OpenGrimoire pipeline: OpenCompass `summary_*.csv` → brain-map JSON). **429** if discovery GET rate limit exceeded — see [Discovery GET rate limiting](#discovery-get-rate-limiting). |
| Operator probe runs (ingest) | — | yes (`/api/operator-probes/ingest`) | — | — | Operator session cookie **or** `OPERATOR_PROBE_INGEST_SECRET` + header `x-operator-probe-ingest-key` | `target_host` allowlisted in code (e.g. `api.cursor.com`). **429** if ingest rate limit exceeded — see [Operator probe ingest rate limiting](#operator-probe-ingest-rate-limiting). |
| Operator probe runs (admin) | yes (`/api/admin/operator-probes`, `/api/admin/operator-probes/:id`) | — | — | yes (`/api/admin/operator-probes/:id`) | Operator session cookie only | UI: `/admin/observability`. TTL: `OPERATOR_PROBE_RETENTION_DAYS` (default 30). **Storage:** admin **GET** list/detail are read-only; expired rows are physically removed after successful **`POST /api/operator-probes/ingest`** (TTL reclaim). Until the next ingest, expired rows may remain in SQLite but are omitted from list/detail responses. |

### Agent vs operator: who can call what

**Purpose:** Clarify **action parity** between browser operators and external agents (curl, harness, CLI). Operators authenticate with **`opengrimoire_session`** after [`POST /api/auth/login`](../src/app/api/auth/login/route.ts). Agents use **header secrets** on documented public routes — not the operator cookie.

| Surface | Anonymous / public | Agent (API key headers) | Operator (session cookie) |
|---------|-------------------|-------------------------|---------------------------|
| `POST /api/survey` (Sync Session) | Yes | Same (no key) | Same (optional; usually public intake) |
| `GET /api/survey/visualization`, `GET /api/survey/approved-qualities` | Dev: open | **Production:** headers / env per [Survey read endpoints](#survey-read-endpoints-visualization--approved-qualities); strings SSOT in [`survey-read-gate-public-messages.ts`](../src/lib/survey/survey-read-gate-public-messages.ts) | Yes (PII) |
| `/api/alignment-context`, `/api/clarification-requests` | No | `x-alignment-context-key` (and optional dedicated clarification key — see [AGENT_INTEGRATION.md](./AGENT_INTEGRATION.md)) | Admin BFF under `/api/admin/*` without shared-secret header |
| **`POST /api/operator-probes/ingest`** | No | **`x-operator-probe-ingest-key`** when `OPERATOR_PROBE_INGEST_SECRET` is set (same value as env; timing-safe compare) | Yes (same-origin session POST) |
| **`GET`/`DELETE` `/api/admin/operator-probes`…** | No | **No** — list/detail/delete are operator-session only | Yes |
| **Moderation** [`GET /api/admin/moderation-queue`](../src/app/api/admin/moderation-queue/route.ts), [`PATCH /api/admin/moderation/:responseId`](../src/app/api/admin/moderation) | No | **No** public agent mirror — use operator session or extend contract with a separate ADR | Yes |

**Moderation** (approve/reject survey fields) is **operator-session only** in the shipped API. External agents cannot substitute `x-alignment-context-key` for moderation routes. If automation is required, prefer **harness scripts** that authenticate as operator (with explicit human approval of stored credentials) or add a **narrow, audited** machine endpoint in a future ADR — not an undocumented shortcut.

### Survey POST rate limiting

`POST /api/survey` is limited in **root `middleware.ts`**: in-memory counter per client IP, **30 requests per 60s** sliding window, response **429** with `Retry-After`. This applies **per Node process** only (not shared across serverless replicas or multiple instances); for production scale-out, replace with a shared store (e.g. Redis / edge KV) and keep this contract’s **429** semantics.

### Survey read endpoints (visualization + approved qualities)

`GET /api/survey/visualization` and `GET /api/survey/approved-qualities` may return attendee-linked data. **`NODE_ENV=production`:** deny unless one of admin session cookie, `x-survey-visualization-key` (when `SURVEY_VISUALIZATION_API_SECRET` is set), `SURVEY_VISUALIZATION_ALLOW_PUBLIC=true`, or optional `x-alignment-context-key` when `ALIGNMENT_CONTEXT_KEY_ALLOWS_SURVEY_READ=true` — see [`AGENT_INTEGRATION.md`](./AGENT_INTEGRATION.md). **Non-production:** gate open for local dev. **`credentials: 'include'`** on `fetch` so cookies apply.

**Do not duplicate prose:** the exact **401 JSON `detail`**, `GET /api/capabilities` `auth_env_hints` line, and per-route `auth` strings are defined in [`src/lib/survey/survey-read-gate-public-messages.ts`](../src/lib/survey/survey-read-gate-public-messages.ts) (`SURVEY_READ_GATE_UNAUTHORIZED_JSON_DETAIL`, `SURVEY_READ_GATE_CAPABILITIES_AUTH_ENV_HINT`, `SURVEY_READ_GATE_CAPABILITIES_ROUTE_AUTH`, `SURVEY_READ_GATE_CAPABILITIES_APPROVED_QUALITIES_AUTH`).

### Login POST rate limiting

`POST /api/auth/login` is limited in **middleware** to **10 requests per 60s** per client IP (same per-process caveat as survey). Response **429** with `Retry-After`.

### Operator probe ingest rate limiting

`POST /api/operator-probes/ingest` is limited in **middleware** to **30 requests per 60s** per client IP (per-process). Response **429** with `Retry-After`. Same scale-out caveat as other in-memory limiters.

### Discovery GET rate limiting

`GET /api/capabilities`, `GET /api/openapi`, and `GET /api/openapi.json` (rewrite to `/api/openapi`) are limited in **middleware** to **200 requests per 60s** per client IP (generous for agents; reduces scraping noise). Response **429** with `Retry-After`. Same per-process caveat as other in-memory limiters; production scale-out: edge/WAF or shared store — see [OPERATIONAL_TRADEOFFS.md](./engineering/OPERATIONAL_TRADEOFFS.md).

---

## UI integration: API mutations and UI freshness

**Problem:** A mutation via CLI or another client does not automatically refresh an already-open browser tab.

**Tiered approach (documented norm):**

1. **Minimum — same app session:** Prefer **client cache + invalidation** (e.g. React Query or SWR) on admin and any screen that reads alignment data, so mutations performed **through the same app** refetch or update cache immediately.
2. **Cross-client (CLI/agent changed data, browser already open):** Still requires **manual refresh**, **polling** (e.g. on window focus or interval; `GET /api/alignment-context` uses `Cache-Control: private, no-store`), or a future push channel. The **`/admin/alignment`**, **`/admin/clarification-queue`**, and **admin home moderation queue** (`AdminPanel`) refetch when the window regains focus or visibility so external API/CLI changes show after tabbing back.
3. **Heavy — multi-tab live ops:** **SSE** or **WebSocket** only if product requirements justify the complexity. **Future:** if live CLI-to-browser sync becomes a requirement, add SSE or WebSocket rather than polling-only; not implemented today.

Until tier 2/3 are implemented, treat “live co-editing across CLI and browser” as **best-effort**, not guaranteed.

---

## Capability discovery (roadmap)

**Shipped today:** `GET /api/capabilities` (hand-maintained manifest; same PR as API changes), in-app **[`/capabilities`](../src/app/capabilities/page.tsx)**, footer + nav links in [`SiteFooter`](../src/components/SiteFooter.tsx) / [`SharedNavBar`](../src/components/SharedNavBar.tsx). README and [AGENT_INTEGRATION.md](./AGENT_INTEGRATION.md) index operators and agents.

**Stretch options** (pick if investing further):

- **OpenAPI** — **Shipped (partial):** `GET /api/openapi` and `GET /api/openapi.json` (rewrite) — see [`src/lib/openapi/openapi-document.ts`](../src/lib/openapi/openapi-document.ts). Full request/response schemas remain in route-level Zod validators until a codegen pipeline is adopted.
- **About page** — link “API & agents” pointing here and [ALIGNMENT_CONTEXT_API.md](./agent/ALIGNMENT_CONTEXT_API.md).
- **Dev-only:** A small panel listing base URL and env **names** (not values) plus a link to the matrix.

**Operational tradeoffs** (rate limits, survey reads, operator model, discovery vs OpenAPI): [engineering/OPERATIONAL_TRADEOFFS.md](./engineering/OPERATIONAL_TRADEOFFS.md).

---

## Prompt-native features (clarification)

- **Today:** Behavior is **code-first** (React, route handlers, validation). Alignment **body** fields may hold prompt-like text; the app does **not** interpret them as LLM orchestration.
- **Future (if desired):** “Prompt-native” could mean **config-driven** copy, labels, or feature flags — distinct from **orchestration**, which remains in the harness/Cursor layer unless OpenGrimoire explicitly adds an LLM runtime.

---

## Verification: Playwright vs Maestro

| Layer | Role |
|-------|------|
| **Playwright** | **CI source of truth** — `npm run verify:e2e` / `npm run test:e2e`; specs under [`e2e/`](../e2e/). |
| **Maestro** | **Optional** cross-tool YAML smoke — [`e2e/maestro/README.md`](../e2e/maestro/README.md). Not a substitute for Playwright in CI unless the project explicitly adopts it as a gate. |

---

## Agent entry (quick)

| Item | Value |
|------|--------|
| Local dev URL | `http://localhost:3001` (see `package.json` / `npm run dev`) |
| Alignment CLI | `node scripts/alignment-context-cli.mjs` — set `OPENGRIMOIRE_BASE_URL` (defaults match dev port in CLI) and `ALIGNMENT_CONTEXT_API_SECRET` when the server uses the secret |
| Integration paths | [agent/INTEGRATION_PATHS.md](./agent/INTEGRATION_PATHS.md) |

---

## Harness task IDs (institutional / agents)

Labeled follow-ups for this contract live under **PENDING_OPENGRIMOIRE_HARNESS** in [pending_tasks.md](../../.cursor/state/pending_tasks.md) (e.g. **OA-REST-***). Prefer that file for durable backlog; Cursor chat todos are session-only.

| ID | Intent |
|----|--------|
| OA-REST-1 | Portable TOOL_SAFEGUARDS / SCP cross-links in this doc (no machine-specific paths). |
| OA-REST-2 | When extending discovery beyond `GET /api/capabilities`, link ADR or commit here (e.g. OpenAPI). |
