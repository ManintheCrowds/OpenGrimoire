# Agent-native architecture audit: OpenAtlas

**Normative rules:** Integration expectations and the **strict public REST contract** for entities are defined in [`ARCHITECTURE_REST_CONTRACT.md`](./ARCHITECTURE_REST_CONTRACT.md). This document is a **gap report** against those rules and the eight principles below.

One-time review against eight agent-native principles. **Evidence:** Playwright E2E ([`e2e/`](../e2e/)), [`scripts/alignment-context-cli.mjs`](../scripts/alignment-context-cli.mjs), App Router + API routes ([`src/app/api/`](../src/app/api/)), Maestro smoke ([`e2e/maestro/`](../e2e/maestro/)).

## Overall score summary

| Principle | Score | Approx. % | Status |
|-----------|-------|-----------|--------|
| 1. Action parity | 5 / 12 | 42% | Partial |
| 2. Tools as primitives | 7 / 10 | 70% | Partial |
| 3. Context injection | 3 / 8 | 38% | Needs work |
| 4. Shared workspace | 7 / 10 | 70% | Partial |
| 5. CRUD completeness | 6 / 8 | 75% | Partial |
| 6. UI integration | 4 / 10 | 40% | Needs work |
| 7. Capability discovery | 2 / 7 | 29% | Needs work |
| 8. Prompt-native features | 2 / 10 | 20% | Needs work |

**Weighted takeaway:** OpenAtlas is a **Next.js + Supabase** product with strong **HTTP API + CLI** affordances for alignment context, but it is **not** an embedded agent shell. Parity for external agents depends on **browser automation** and **CLI/HTTP**, not first-class OpenAtlas MCP tools.

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
| Auth-gated flows | Depends on env (`ALIGNMENT_CONTEXT_API_SECRET`, Supabase) | Same gates for agent |

**Gaps:** No dedicated “OpenAtlas MCP server” listing app-specific tools; agents rely on **generic** MCP (browser, fetch) + CLI.

**Score:** 5 / 12 representative actions mapped to a first-class agent tool **with OpenAtlas in the name** — many flows are reachable only via browser automation.

**Evidence:** [`e2e/smoke.spec.ts`](../e2e/smoke.spec.ts) (nav + visibility); [`alignment-context-cli.mjs`](../scripts/alignment-context-cli.mjs).

---

## 2. Tools as primitives

**Principle:** Tools expose capability, not opaque business workflows.

**Findings:** REST routes under [`src/app/api/`](../src/app/api/) are **resource-oriented** (alignment-context, survey, brain-map graph, test-data). The CLI is a **thin** wrapper over HTTP. Admin routes separate from public patterns.

**Gaps:** Some visualization logic is inherently UI-heavy; no decomposition into micro-primitives beyond API boundaries.

**Score:** 7 / 10 — APIs skew primitive; CLI is appropriately thin.

---

## 3. Context injection

**Principle:** Dynamic context (workspace state, capabilities) feeds the agent system prompt.

**Findings:** OpenAtlas **does not** implement Cursor/agent system prompts. Alignment **content** is data in Supabase and can be fetched via API for *external* agents if the harness loads it.

**Gaps:** No in-app “agent context panel” or exported prompt bundle for sessions.

**Non-goal (by design):** In-app agent context / prompt bundles are **out of scope** for OpenAtlas; see [`ARCHITECTURE_REST_CONTRACT.md`](./ARCHITECTURE_REST_CONTRACT.md) § Non-goals.

**Score:** 3 / 8 — relevant to harness wiring outside this repo.

---

## 4. Shared workspace

**Principle:** Agent and user read/write the same stores.

**Findings:** Same Supabase tables and API for users (via app) and agents (via CLI/fetch with same secrets). No separate “agent-only” database for alignment context.

**Gaps:** Survey/brain-map flows may be more UI-centric; verify per feature.

**Score:** 7 / 10.

---

## 5. CRUD completeness

**Principle:** Each entity supports create, read, update, delete via agent-observable paths.

**Findings:** **Alignment context** exposes list/create/patch/delete via API + CLI ([`alignment-context-cli.mjs`](../scripts/alignment-context-cli.mjs)). Other entities (survey submissions, brain-map graph) depend on route surface — audit each before claiming full CRUD.

**Score:** 6 / 8 entities — alignment context is the documented agent parity target; others need explicit mapping.

**Evidence:** [`src/app/api/alignment-context/route.ts`](../src/app/api/alignment-context/route.ts), [`src/app/api/alignment-context/[id]/route.ts`](../src/app/api/alignment-context/[id]/route.ts).

---

## 6. UI integration

**Principle:** Agent-driven changes reflect immediately in UI.

**Findings:** Standard React/Next.js client state; no app-wide WebSocket for “agent did X”. User refreshes or client refetch after API mutations.

**Gaps:** External agent mutating via API may not update an open browser tab without polling or navigation.

**Resolution (documented):** Tiered expectations for UI freshness — cache invalidation in-app, cross-client limits, optional polling/SSE — see [`ARCHITECTURE_REST_CONTRACT.md`](./ARCHITECTURE_REST_CONTRACT.md) § UI integration.

**Score:** 4 / 10 — standard web app; not optimized for live agent co-editing.

**Evidence:** Playwright tests assert DOM after navigation ([`e2e/smoke.spec.ts`](../e2e/smoke.spec.ts)).

---

## 7. Capability discovery

**Principle:** Users discover what the agent can do (onboarding, `/help`, suggested prompts, etc.).

**Findings:** [`README.md`](../README.md) and docs; CLI `--help` via script usage comment.

**Gaps:** No in-product “agent capabilities” page; harness docs live in portfolio-harness.

**Improvement:** `GET /api/capabilities` (hand-maintained manifest). Stretch: OpenAPI, in-UI links — [`ARCHITECTURE_REST_CONTRACT.md`](./ARCHITECTURE_REST_CONTRACT.md) § Capability discovery.

**Score:** 2 / 7 discovery mechanisms.

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

1. **Agent entry + contract:** README and [`ARCHITECTURE_REST_CONTRACT.md`](./ARCHITECTURE_REST_CONTRACT.md) — base URL, env vars, entity × HTTP × auth matrix (`OPENATLAS_BASE_URL` should match dev port **3001**; CLI default aligns with README).
2. **Optional:** Thin MCP over REST only — see [`agent/INTEGRATION_PATHS.md`](./agent/INTEGRATION_PATHS.md) (no duplicate business layer).
3. **CRUD matrix:** Maintained in [`ARCHITECTURE_REST_CONTRACT.md`](./ARCHITECTURE_REST_CONTRACT.md); update in same PR as API changes ([`CONTRIBUTING.md`](../CONTRIBUTING.md)).
4. **SCP:** Content pasted into alignment fields from untrusted sources should be gated upstream in the **agent harness** ([TOOL_SAFEGUARDS.md](../../local-proto/docs/TOOL_SAFEGUARDS.md); use your `local-proto` clone if not nested under `portfolio-harness`), not inside OpenAtlas alone — see [`ARCHITECTURE_REST_CONTRACT.md`](./ARCHITECTURE_REST_CONTRACT.md) § Non-goals.

---

## References

- [Agent-Native Testing](../../docs/Agent-Native-Testing.md) (portfolio-harness)
- [Maestro](https://github.com/mobile-dev-inc/Maestro) · [Web browsers](https://docs.maestro.dev/get-started/supported-platform/web-browser)
