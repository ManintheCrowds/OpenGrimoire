# Agent-native architecture audit: OpenGrimoire

**Normative rules:** Integration expectations and the **strict public REST contract** for entities are defined in [`ARCHITECTURE_REST_CONTRACT.md`](./ARCHITECTURE_REST_CONTRACT.md). This document is a **gap report** against those rules and the eight principles below.

Living gap report against eight agent-native principles. **Last refreshed:** 2026-03-31 (clarification queue REST + admin UI, `verify:route-index`, OpenAPI/capabilities E2E, survey bootstrap token). **Evidence:** Playwright E2E ([`e2e/`](../e2e/)), [`scripts/alignment-context-cli.mjs`](../scripts/alignment-context-cli.mjs), App Router + API routes ([`src/app/api/`](../src/app/api/)), Maestro smoke ([`e2e/maestro/`](../e2e/maestro/)).

## Overall score summary

| Principle | Score | Approx. % | Status |
|-----------|-------|-----------|--------|
| 1. Action parity | 6 / 12 | 50% | Partial |
| 2. Tools as primitives | 7 / 10 | 70% | Partial |
| 3. Context injection | 3 / 8 | 38% | Needs work |
| 4. Shared workspace | 8 / 10 | 80% | Excellent |
| 5. CRUD completeness | 7 / 8 | 88% | Partial |
| 6. UI integration | 5 / 10 | 50% | Partial |
| 7. Capability discovery | 5 / 7 | 71% | Partial |
| 8. Prompt-native features | 2 / 10 | 20% | Needs work |

**Weighted takeaway:** OpenGrimoire is a **Next.js + SQLite (local-first)** app with strong **HTTP API + CLI** affordances for alignment context, but it is **not** an embedded agent shell. **Effective** parity for external agents is **REST + optional browser automation** (Playwright/Maestro); a branded MCP server is optional backlog, not the default rubric for “can the agent do what the operator UI does” for API-backed entities.

Scoring legend: **Excellent** 80%+, **Partial** 50–79%, **Needs work** &lt;50% (mapped to status column).

---

## 1. Action parity

**Principle:** Whatever the user can do, the agent can do.

**Findings**

| User surface | Agent path | Parity |
|--------------|------------|--------|
| Navigate pages, use visualization, operator intake, admin | Playwright / Maestro / cursor-ide-browser | Yes (generic UI automation) |
| CRUD alignment context via UI | Same + manual; or **REST** | Partial |
| CRUD alignment context programmatically | [`alignment-context-cli.mjs`](../scripts/alignment-context-cli.mjs) (`list`, `create`, `patch`, `delete`) | Yes for API-shaped actions |
| Clarification queue (agent poll + create; operator/admin) | **`GET`/`POST` `/api/clarification-requests`**, **`GET`/`PATCH` `/api/clarification-requests/:id`** with shared-secret headers; admin BFF under `/api/admin/clarification-requests/*`; UI [`/admin/clarification-queue`](../src/app/admin/clarification-queue/page.tsx) | Yes for HTTP-shaped actions (see [`CLARIFICATION_QUEUE_API.md`](./agent/CLARIFICATION_QUEUE_API.md)) |
| Auth-gated flows | Depends on env (`ALIGNMENT_CONTEXT_API_SECRET`, admin session for UI) | Same gates for agent |

**Gaps:** No dedicated “OpenGrimoire MCP server” listing app-specific tools; agents rely on **generic** MCP (browser, fetch) + CLI. **Rubric note:** Low “named tool” counts do **not** mean HTTP parity is absent—alignment/clarification/survey surfaces are reachable via documented routes and secrets.

**Score:** **6 / 12** — six of **twelve** fixed parity slots (checklist below) are assessed as having **programmatic** parity (documented REST + headers, [`alignment-context-cli.mjs`](../scripts/alignment-context-cli.mjs), or contract-backed `fetch`) without relying solely on browser automation; the rest are **generic UI automation**, **operator-session-only** surfaces, or **no public agent mirror** per [`ARCHITECTURE_REST_CONTRACT.md`](./ARCHITECTURE_REST_CONTRACT.md). Clarification queue APIs and Playwright coverage ([`e2e/clarification-queue.spec.ts`](../e2e/clarification-queue.spec.ts)) improve parity vs browser-only.

**Evidence:** [`e2e/smoke.spec.ts`](../e2e/smoke.spec.ts) (nav + visibility); [`alignment-context-cli.mjs`](../scripts/alignment-context-cli.mjs); [`e2e/clarification-queue.spec.ts`](../e2e/clarification-queue.spec.ts).

**Re-audit denominator**

Normative integration surfaces: [`ARCHITECTURE_REST_CONTRACT.md`](./ARCHITECTURE_REST_CONTRACT.md) — **What counts as an entity** and **Entity × HTTP × auth matrix**. Use this **twelve-slot** checklist to rescore principle 1 consistently (each row: **Y** = programmatic agent path documented, **P** = browser/session automation only, **N** = out of scope for public agents):

| # | Parity slot | Pointer |
|---|-------------|---------|
| 1 | Browse major UI (visualization, intake, admin shells) | E2E / Maestro |
| 2 | Alignment context — list | `GET /api/alignment-context` |
| 3 | Alignment context — create | `POST /api/alignment-context` |
| 4 | Alignment context — patch | `PATCH /api/alignment-context/:id` |
| 5 | Alignment context — delete | `DELETE /api/alignment-context/:id` |
| 6 | Clarification — list + create | `GET`/`POST /api/clarification-requests` |
| 7 | Clarification — get + patch by id | `GET`/`PATCH /api/clarification-requests/:id` |
| 8 | Sync Session submit | `POST /api/survey` |
| 9 | Brain-map graph read | `GET /api/brain-map/graph` |
| 10 | Discovery manifest | `GET /api/capabilities` (+ optional OpenAPI) |
| 11 | Operator auth | `POST /api/auth/login` (session cookie — agent parity via documented harness or browser) |
| 12 | Admin-only (e.g. moderation, survey visualization PII) | Contract: **Agent vs operator** — no public agent mirror for some rows |

---

## 2. Tools as primitives

**Principle:** Tools expose capability, not opaque business workflows.

**Findings:** REST routes under [`src/app/api/`](../src/app/api/) are **resource-oriented** (alignment-context, clarification-requests, survey, brain-map graph, openapi, test-data). The CLI is a **thin** wrapper over HTTP. Admin routes separate from public patterns.

**Gaps:** Some visualization logic is inherently UI-heavy; no decomposition into micro-primitives beyond API boundaries.

**Score:** 7 / 10 — APIs skew primitive; CLI is appropriately thin.

---

## 3. Context injection

**Principle:** Dynamic context (workspace state, capabilities) feeds the agent system prompt.

**Findings:** OpenGrimoire **does not** implement Cursor/agent system prompts. Alignment **content** is data in SQLite and can be fetched via API for *external* agents if the harness loads it.

**Gaps:** No in-app “agent context panel” or exported prompt bundle for sessions.

**Non-goal (by design):** In-app agent context / prompt bundles are **out of scope** for OpenGrimoire; see [`ARCHITECTURE_REST_CONTRACT.md`](./ARCHITECTURE_REST_CONTRACT.md) § Non-goals.

**Score:** 3 / 8 — relevant to harness wiring outside this repo.

---

## 4. Shared workspace

**Principle:** Agent and user read/write the same stores.

**Findings:** Same SQLite store and API for users (via app) and agents (via CLI/fetch with same secrets). No separate “agent-only” database for alignment context. **Clarification requests** live in the same store with public and admin routes ([`src/lib/storage/repositories/clarification.ts`](../src/lib/storage/repositories/clarification.ts)).

**Gaps:** Survey/brain-map flows may be more UI-centric; verify per feature.

**Score:** 8 / 10 — clarification entity shares the same persistence story as alignment.

---

## 5. CRUD completeness

**Principle:** Each entity supports create, read, update, delete via agent-observable paths.

**Findings:** **Alignment context** exposes list/create/patch/delete via API + CLI ([`alignment-context-cli.mjs`](../scripts/alignment-context-cli.mjs)). **Clarification queue** exposes list/create/read/patch via public and admin APIs (no delete in contract) — see entity matrix in [`ARCHITECTURE_REST_CONTRACT.md`](./ARCHITECTURE_REST_CONTRACT.md) and [`CLARIFICATION_QUEUE_API.md`](./agent/CLARIFICATION_QUEUE_API.md). Other entities (survey submissions, brain-map graph) depend on route surface — audit each before claiming full CRUD.

**Score:** 7 / 8 entities — alignment + clarification are documented; **Sync Session** POST and survey bootstrap ([`src/app/api/survey/bootstrap-token/route.ts`](../src/app/api/survey/bootstrap-token/route.ts)) remain product-specific flows.

**Evidence:** [`src/app/api/alignment-context/route.ts`](../src/app/api/alignment-context/route.ts), [`src/app/api/alignment-context/[id]/route.ts`](../src/app/api/alignment-context/[id]/route.ts), [`src/app/api/clarification-requests/route.ts`](../src/app/api/clarification-requests/route.ts), [`src/app/api/clarification-requests/[id]/route.ts`](../src/app/api/clarification-requests/[id]/route.ts).

---

## 6. UI integration

**Principle:** Agent-driven changes reflect immediately in UI.

**Findings:** Standard React/Next.js client state; no app-wide WebSocket for “agent did X”. User refreshes or client refetch after API mutations.

**Gaps:** External agent mutating via API may not update an open browser tab without polling or navigation.

**Resolution (documented):** Tiered expectations for UI freshness — cache invalidation in-app, cross-client limits, optional polling/SSE — see [`ARCHITECTURE_REST_CONTRACT.md`](./ARCHITECTURE_REST_CONTRACT.md) § UI integration.

**Score:** 5 / 10 — standard web app; admin clarification queue and capabilities/OpenAPI pages have E2E coverage; still no app-wide live co-editing.

**Evidence:** Playwright tests assert DOM after navigation ([`e2e/smoke.spec.ts`](../e2e/smoke.spec.ts)); [`e2e/clarification-queue.spec.ts`](../e2e/clarification-queue.spec.ts); [`e2e/capabilities.spec.ts`](../e2e/capabilities.spec.ts); [`e2e/openapi.spec.ts`](../e2e/openapi.spec.ts).

---

## 7. Capability discovery

**Principle:** Users discover what the agent can do (onboarding, `/help`, suggested prompts, etc.).

**Findings (March 2026 refresh):** In-app **[`/capabilities`](../src/app/capabilities/page.tsx)** lists the API surface; **[`SiteFooter`](../src/components/SiteFooter.tsx)** links to `/capabilities` and **`GET /api/capabilities`** (JSON); **[`SharedNavBar`](../src/components/SharedNavBar.tsx)** includes a Capabilities nav item. Machine-readable index: **[`GET /api/capabilities`](../src/app/api/capabilities/route.ts)** (hand-maintained manifest, same PR as route changes per [CONTRIBUTING](../CONTRIBUTING.md)). **Partial OpenAPI 3:** [`GET /api/openapi`](../src/app/api/openapi/route.ts) / **`GET /api/openapi.json`** (rewrite) from [`openapi-document.ts`](../src/lib/openapi/openapi-document.ts); CI enforces parity via **`npm run verify:openapi`** ([`verify-openapi-coverage.mjs`](../scripts/verify-openapi-coverage.mjs)). **Route index:** [`docs/api/ROUTE_INDEX.json`](./api/ROUTE_INDEX.json) (`npm run generate:route-index`); **`npm run verify:route-index`** ([`verify-route-index.mjs`](../scripts/verify-route-index.mjs)). **Gate doc:** [`engineering/DISCOVERY_STABILITY_GATE.md`](./engineering/DISCOVERY_STABILITY_GATE.md). **Operator mirror (scoped):** [`ApiDiscoveryMirror`](../src/components/ApiDiscoveryMirror.tsx) on **`/admin`** fetches the same public capabilities JSON and links to OpenAPI + brain map. [`README.md`](../README.md) and [`AGENT_INTEGRATION.md`](./AGENT_INTEGRATION.md) point agents at headers, CLI, and contract. **E2E:** [`e2e/openapi.spec.ts`](../e2e/openapi.spec.ts) exercises OpenAPI JSON shape; [`e2e/capabilities.spec.ts`](../e2e/capabilities.spec.ts) covers `/capabilities` + JSON.

**Gaps:** No onboarding wizard or slash-command help; harness-side copy still lives outside this repo; OpenAPI is **partial** (not full Zod schemas or admin BFF paths). Full-schema OpenAPI and optional thin MCP remain backlog — [`ARCHITECTURE_REST_CONTRACT.md`](./ARCHITECTURE_REST_CONTRACT.md) § Capability discovery.

**Score:** 5 / 7 discovery mechanisms — route-index + verify:route-index + OpenAPI E2E strengthen the **machine-checkable** story; onboarding and suggested-prompt flows still weak.

**Future (distinct from intake survey):** Async **HITL intent** form for AI-posted human questions — see [`HITL_INTENT_SURVEY_BACKLOG.md`](./HITL_INTENT_SURVEY_BACKLOG.md).

---

## 8. Prompt-native features

**Principle:** Outcomes defined in prompts/config vs hardcoded app logic.

**Findings:** Product behavior is **code-first** (React, API handlers, Zod schemas). Alignment **body** fields can store prompt-like text, but features are not prompt-defined.

**Clarification:** See [`ARCHITECTURE_REST_CONTRACT.md`](./ARCHITECTURE_REST_CONTRACT.md) § Prompt-native features (code-first today; future config-driven copy vs orchestration in harness).

**Score:** 2 / 10 — by design for a web app; prompt-native layer would be a separate product choice.

---

## Maestro and Playwright as verification hooks

Normative summary: [`ARCHITECTURE_REST_CONTRACT.md`](./ARCHITECTURE_REST_CONTRACT.md) § Verification.

| Artifact | Role |
|----------|------|
| [`e2e/*.spec.ts`](../e2e/) | **CI source of truth** — primary automated proof that user-visible flows render (Chromium, `baseURL` localhost:3001). |
| [`e2e/maestro/smoke_web.yaml`](../e2e/maestro/smoke_web.yaml) | **Optional** YAML smoke; cross-tool story ([Maestro web](https://docs.maestro.dev/get-started/supported-platform/web-browser)). |

Use Playwright for CI truth; Maestro for cross-tool YAML experiments or future mobile surfaces — not a substitute for Playwright unless explicitly adopted as a gate.

---

## Top recommendations (by impact)

1. **Agent entry + contract:** [`AGENT_INTEGRATION.md`](./AGENT_INTEGRATION.md) (single index), README, and [`ARCHITECTURE_REST_CONTRACT.md`](./ARCHITECTURE_REST_CONTRACT.md) — base URL, env vars, entity × HTTP × auth matrix (`OPENGRIMOIRE_BASE_URL` or legacy `OPENATLAS_BASE_URL` should match dev port **3001**; CLI default aligns with README).
2. **Optional:** Thin MCP over REST only — see [`agent/INTEGRATION_PATHS.md`](./agent/INTEGRATION_PATHS.md) (no duplicate business layer).
3. **CRUD matrix:** Maintained in [`ARCHITECTURE_REST_CONTRACT.md`](./ARCHITECTURE_REST_CONTRACT.md); update in same PR as API changes ([`CONTRIBUTING.md`](../CONTRIBUTING.md)).
4. **SCP:** Content pasted into alignment fields from untrusted sources should be gated upstream in the **agent harness** (see **`MiscRepos/local-proto/docs/TOOL_SAFEGUARDS.md`** in a sibling **MiscRepos** clone next to **OpenGrimoire**, e.g. `GitHub/MiscRepos` beside `GitHub/OpenGrimoire` — no stable relative link from this repo), not inside OpenGrimoire alone — see [`ARCHITECTURE_REST_CONTRACT.md`](./ARCHITECTURE_REST_CONTRACT.md) § Non-goals.

---

## References

- [Agent-Native Testing](../../docs/Agent-Native-Testing.md) (MiscRepos / sibling harness docs when present)
- [Maestro](https://github.com/mobile-dev-inc/Maestro) · [Web browsers](https://docs.maestro.dev/get-started/supported-platform/web-browser)
