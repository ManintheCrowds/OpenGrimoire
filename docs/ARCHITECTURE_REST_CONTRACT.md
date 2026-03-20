# OpenAtlas — strict public REST contract and agent norms

**Purpose:** Normative rules for how **domain entities** are exposed over HTTP to operators and external agents. The [agent-native audit](./AGENT_NATIVE_AUDIT_OPENATLAS.md) is a **gap report** against this document, not a substitute for it.

**Related:** [OPENATLAS_SYSTEMS_INVENTORY.md](./OPENATLAS_SYSTEMS_INVENTORY.md), [agent/INTEGRATION_PATHS.md](./agent/INTEGRATION_PATHS.md), [agent/ALIGNMENT_CONTEXT_API.md](./agent/ALIGNMENT_CONTEXT_API.md).

---

## Governing rule: strict public REST for entities

**Rule:** Every **domain entity** that OpenAtlas exposes to operators or programmatic agents must have a **stable, documented public HTTP contract**: methods, paths, request/response shapes, and authentication/authorization behavior. UIs and scripts consume that contract. Ad hoc server actions or undocumented fetch paths are **not** the canonical integration surface for agents.

**What “strict public REST” does *not* require:** Full CRUD for every resource. It **does** require **honest labeling**: read-only, write-only, or full CRUD — with **no silent gaps** for capabilities we claim agents can use.

### What counts as an entity

An **entity** is a domain resource with a defined persistence or document shape, not every React page. Examples:

| Entity | Canonical integration |
|--------|------------------------|
| Alignment context rows | `GET`/`POST` `/api/alignment-context`, `PATCH`/`DELETE` `/api/alignment-context/:id` (+ admin BFF under `/api/admin/alignment-context`) |
| Survey submission (attendee + responses) | `POST` `/api/survey` (create only at this layer) |
| Brain-map graph document | `GET` `/api/brain-map/graph` (file-backed JSON) |
| Test dataset stub | `GET` `/api/test-data/:dataset` |

If a new entity gains an API, it must appear in the [entity × HTTP × auth matrix](#entity--http--auth-matrix) in the same change (see [CONTRIBUTING.md](../CONTRIBUTING.md)).

---

## Non-goals (explicit)

The following belong **outside** OpenAtlas unless the product direction changes:

- **In-app “agent context” or exported prompt bundles** for Cursor/LLM sessions. System prompts, rules, and harness session context live in **portfolio-harness**, **Cursor**, and **local-proto**. OpenAtlas exposes **data** (e.g. alignment context) that a harness **may** fetch and inject upstream.
- **Embedding SCP (secure-contain-protect) inside the app** as the only line of defense. Untrusted content pasted into alignment or other fields should be gated in the **agent harness** per [`local-proto` / TOOL_SAFEGUARDS.md](../../local-proto/docs/TOOL_SAFEGUARDS.md) (repo-relative from `OpenAtlas/docs/` when `local-proto` sits beside `OpenAtlas` under `portfolio-harness`) and the [secure-contain-protect skill](../../.cursor/skills/secure-contain-protect/SKILL.md). If you only have a standalone `local-proto` clone elsewhere, open `docs/TOOL_SAFEGUARDS.md` there—the document is the same source of truth.

---

## Entity × HTTP × auth matrix

Maintenance: update this table when adding or changing routes under `src/app/api/`. Same PR as the code change.

| Entity / surface | GET | POST | PATCH | DELETE | Auth mechanism | Notes |
|------------------|-----|------|-------|--------|----------------|-------|
| Alignment context (public API) | yes (`/api/alignment-context`) | yes | yes (`/api/alignment-context/:id`) | yes | Header `x-alignment-context-key` when `ALIGNMENT_CONTEXT_API_SECRET` is set | [ALIGNMENT_CONTEXT_API.md](./agent/ALIGNMENT_CONTEXT_API.md) |
| Alignment context (admin BFF) | yes | yes | yes | yes | Supabase session cookie; `user_metadata.role === 'admin'` | No shared-secret header |
| Brain-map graph | yes (`/api/brain-map/graph`) | — | — | — | Optional `BRAIN_MAP_SECRET`; client sends `x-brain-map-key` when configured | Serves `public/brain-map-graph.local.json` or `.json` |
| Survey submissions | — | yes (`/api/survey`) | — | — | Server uses Supabase service client; not the alignment shared-secret pattern | Creates `attendees` + `responses` |
| Test data (stub) | yes (`/api/test-data/:dataset`) | — | — | — | None in stub | Placeholder JSON for tests/dev |
| Capabilities manifest | yes (`/api/capabilities`) | — | — | — | None (public JSON index) | Hand-maintained; update with API PRs |

---

## UI integration: API mutations and UI freshness

**Problem:** A mutation via CLI or another client does not automatically refresh an already-open browser tab.

**Tiered approach (documented norm):**

1. **Minimum — same app session:** Prefer **client cache + invalidation** (e.g. React Query or SWR) on admin and any screen that reads alignment data, so mutations performed **through the same app** refetch or update cache immediately.
2. **Cross-client (CLI/agent changed data, browser already open):** Still requires **manual refresh**, **polling** (e.g. on window focus or interval; `GET /api/alignment-context` uses `Cache-Control: private, no-store`), or a future push channel.
3. **Heavy — multi-tab live ops:** **SSE** or **WebSocket** only if product requirements justify the complexity.

Until tier 2/3 are implemented, treat “live co-editing across CLI and browser” as **best-effort**, not guaranteed.

---

## Capability discovery (roadmap)

Today, discovery is primarily **documentation** (README, this file, alignment API). Stretch options (pick if investing in product surfacing):

- **Shipped machine-readable discovery:** e.g. `GET /api/capabilities` with `{ "routes": [...], "auth": [...] }` hand-maintained next to the matrix, or static `public/openapi.json` / `GET /api/openapi.json` (even partial).
- **In-UI:** Footer or `/about` link “API & agents” pointing here and [ALIGNMENT_CONTEXT_API.md](./agent/ALIGNMENT_CONTEXT_API.md).
- **Dev-only:** A small panel listing base URL and env **names** (not values) plus a link to the matrix.

---

## Prompt-native features (clarification)

- **Today:** Behavior is **code-first** (React, route handlers, validation). Alignment **body** fields may hold prompt-like text; the app does **not** interpret them as LLM orchestration.
- **Future (if desired):** “Prompt-native” could mean **config-driven** copy, labels, or feature flags — distinct from **orchestration**, which remains in the harness/Cursor layer unless OpenAtlas explicitly adds an LLM runtime.

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
| Alignment CLI | `node scripts/alignment-context-cli.mjs` — set `OPENATLAS_BASE_URL` (defaults match dev port in CLI) and `ALIGNMENT_CONTEXT_API_SECRET` when the server uses the secret |
| Integration paths | [agent/INTEGRATION_PATHS.md](./agent/INTEGRATION_PATHS.md) |

---

## Harness task IDs (institutional / agents)

Labeled follow-ups for this contract live under **PENDING_OPENATLAS_HARNESS** in [pending_tasks.md](../../.cursor/state/pending_tasks.md) (e.g. **OA-REST-***). Prefer that file for durable backlog; Cursor chat todos are session-only.

| ID | Intent |
|----|--------|
| OA-REST-1 | Portable TOOL_SAFEGUARDS / SCP cross-links in this doc (no machine-specific paths). |
| OA-REST-2 | When extending discovery beyond `GET /api/capabilities`, link ADR or commit here (e.g. OpenAPI). |
