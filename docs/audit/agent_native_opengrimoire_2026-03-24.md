# Agent-native architecture audit — OpenGrimoire MVP (2026-03-24)

**Revision:** 2026-03-24 — Part A **work backlog** table added; `/capabilities` page cites INTEGRATION_PATHS + OPERATOR_GUI_RUNBOOK for discovery. **Post-P0 (same day):** Table view adds conditional columns for OpenGrimoire optional node fields when present in graph JSON; curl examples in AGENT_INTEGRATION; Playwright covers optional columns + `/api/capabilities` shape; MiscRepos troubleshooting index links MONITORING_OPENGRIMOIRE.md. **Follow-up (same doc):** Part A summary table re-scored after shipped work; **security-sentinel** read-only pass on API/auth (no high-severity findings; see § Security review). **Doc polish:** Executive snapshot, status bands, ~65% interpretation, §6/UI + cross-cutting AC2 alignment, Part A vs Part B framing, CONTRIBUTING/ACTION_PARITY links, parity-at-a-glance bullets.

**Normative:** [ARCHITECTURE_REST_CONTRACT.md](../ARCHITECTURE_REST_CONTRACT.md), [scope_opengrimoire_mvp_agent_native.md](../scope_opengrimoire_mvp_agent_native.md).
**Prior audit:** [AGENT_NATIVE_AUDIT_OPENGRIMOIRE.md](../AGENT_NATIVE_AUDIT_OPENGRIMOIRE.md) (historical baseline).  
**Scope:** OpenGrimoire app + OpenHarness bundle (docs/skills/state)—**not** MiscRepos orchestrator code.

**Surfaces:** **Part A** scores the **OpenGrimoire** Next.js app (REST API + operator GUI). **Part B** scores the **OpenHarness** bundle (files, skills, prompts—no product UI). Do not blend Part A percentages with Part B scores.

---

## Part A — OpenGrimoire

**Executive snapshot**

- **Strengths:** Thin REST surface and hand-maintained [`GET /api/capabilities`](../../src/app/api/capabilities/route.ts); discovery via [`/capabilities`](../../src/app/capabilities/page.tsx), nav/footer, and [AGENT_INTEGRATION.md](../AGENT_INTEGRATION.md); honest CRUD story (alignment full CRUD; brain-map read-only at API).
- **Bounded gaps:** Admin alignment uses **operator session cookie** after `/login` (agent parity via Playwright or human, vs shared-secret API + CLI); no SSE; optional follow-ups OA-OG-2 / OA-OG-5 remain deferred per harness backlog.
- **Security posture:** Static **security-sentinel** review in § **Part A — Security review** below—no high-severity findings; medium items (survey abuse surface, brain-map key + client bundle) documented there.

### Summary table

| # | Principle | Score | % | Status | P0 gap |
|---|-----------|-------|---|--------|--------|
| 1 | Action parity | 7 / 12 | 58% | Partial | No first-party OpenGrimoire MCP; admin session flows still browser/session; parity strengthened by curl + CLI for REST |
| 2 | Tools as primitives | 8 / 10 | 80% | Good | APIs resource-oriented; CLI thin |
| 3 | Context injection | 3 / 8 | 38% | Needs work | Contract / frozen — by design: prompts live in harness ([ARCHITECTURE_REST_CONTRACT.md](../ARCHITECTURE_REST_CONTRACT.md) non-goals) |
| 4 | Shared workspace | 8 / 10 | 80% | Partial | Same alignment store for UI + API; graph file-backed |
| 5 | CRUD completeness | 7 / 8 | 88% | Partial | Alignment: full CRUD API + admin UI PATCH status + DELETE; brain-map read-only |
| 6 | UI integration | 7 / 10 | 70% | Partial | Admin refetch on focus/visibility; Playwright asserts optional Table columns + [`e2e/capabilities.spec.ts`](../../e2e/capabilities.spec.ts); no SSE |
| 7 | Capability discovery | 6 / 7 | 86% | Partial | Manifest + [`/capabilities`](../../src/app/capabilities/page.tsx); [SharedNavBar](../../src/components/SharedNavBar.tsx) + [SiteFooter](../../src/components/SiteFooter.tsx) links; INTEGRATION_PATHS + runbook cited on page |
| 8 | Prompt-native | 2 / 10 | 20% | By design | Contract / frozen — code-first product; alignment body can hold text |

**Note:** Principles **3** and **8** are **contract / product stance**, not ranked backlog on par with parity gaps unless product scope changes.

**Status bands (percentage column):** **80%+** — strong; **50–79%** — partial; **below 50%** — needs work, except where Status is “By design” or the row is contract-limited (see footnote).

**OpenGrimoire approximate agent-native score:** ~**65%** — **simple average** of the eight Part A percentages (**equal weight** per principle; no product weighting yet). Principles **3** and **8** are contract-limited, so they lower the average **without** implying “fix these before parity” unless scope changes. Slightly up vs pre-ship table.

**Ongoing process:** New or changed API routes: update [`capabilities/route.ts`](../../src/app/api/capabilities/route.ts) per [CONTRIBUTING.md](../../CONTRIBUTING.md) (steps 4–5); run `npm run verify:capabilities`. Cross-stack checklist index: [ACTION_PARITY_FILE_INDEX.md](../ACTION_PARITY_FILE_INDEX.md).

### Part A — Work backlog (by principle)

Use this table to drive follow-on work without re-scoring until changes ship. **Effort:** S = small, M = medium, L = large.

| # | Principle | Next action | Effort | Notes |
|---|-----------|-------------|--------|--------|
| 1 | Action parity | Keep **HTTP + CLI** as canonical (**curl** shipped in [AGENT_INTEGRATION.md](../AGENT_INTEGRATION.md)); optional **thin MCP** only per [INTEGRATION_PATHS.md](../agent/INTEGRATION_PATHS.md) (no duplicate business layer) | M | Raises score when MCP tools wrap existing routes only |
| 2 | Tools as primitives | On each new API route: keep handler thin; update [capabilities/route.ts](../../src/app/api/capabilities/route.ts) in same PR | S | Maintain 8/10+ |
| 3 | Context injection | **No in-app prompt injection** per contract; ensure harness docs link [ARCHITECTURE_REST_CONTRACT.md](../ARCHITECTURE_REST_CONTRACT.md) non-goals | S | 3/8 is acceptable |
| 4 | Shared workspace | When graph merge changes, document refresh path in [OPERATOR_GUI_RUNBOOK.md](../OPERATOR_GUI_RUNBOOK.md) | S | |
| 5 | CRUD completeness | Brain-map remains read-only; **if** POST ever scoped, add matrix row + AC in scope doc first | L | |
| 6 | UI integration | Optional: React Query/SWR on `/admin/alignment` for in-tab mutation cache; SSE only if product requires | M | |
| 7 | Capability discovery | Keep manifest in sync per PR; optional: onboarding tour, suggested prompts — nav/footer + page copy **done** | S | 6/7; remaining gap is product onboarding depth |
| 8 | Prompt-native | Treat alignment **body** as operator-authored text; feature flags stay in docs until product scope changes | S | 2/10 by design |

**Cross-cutting (closed):** AC2 optional graph fields in the Table — see § **OpenGrimoire — visualization / schema (AC2)** below.

### 1. Action parity

**Evidence:** Admin alignment CRUD via fetch ([`src/app/admin/alignment/page.tsx`](../../src/app/admin/alignment/page.tsx) L89–147); public API [`alignment-context/route.ts`](../../src/app/api/alignment-context/route.ts); CLI [`scripts/alignment-context-cli.mjs`](../../scripts/alignment-context-cli.mjs); **curl** for capabilities, brain-map, alignment in [AGENT_INTEGRATION.md](../AGENT_INTEGRATION.md).  
**Gap:** No dedicated MCP server in-repo; admin UI paths need **operator browser session** (Playwright or human).  
**Score:** 7/12 — +1 vs prior pass for documented HTTP parity on core routes.  
**P1:** Thin MCP wrapper documented in [INTEGRATION_PATHS.md](../agent/INTEGRATION_PATHS.md) if desired.

**Parity at a glance**

- **Alignment (public API + CLI):** `x-alignment-context-key` when `ALIGNMENT_CONTEXT_API_SECRET` is set; full CRUD via [`alignment-context-cli.mjs`](../../scripts/alignment-context-cli.mjs) and curl in [AGENT_INTEGRATION.md](../AGENT_INTEGRATION.md).
- **Alignment (admin UI):** Operator session cookie after `/login`—agent parity via **browser automation** (e.g. Playwright) or human, not the shared-secret API.
- **Brain map:** `GET /api/brain-map/graph` only; no POST without scope + AC per [INTEGRATION_PATHS.md](../agent/INTEGRATION_PATHS.md).

### 2. Tools as primitives

**Evidence:** REST handlers under `src/app/api/`; capabilities manifest is data, not orchestration ([`capabilities/route.ts`](../../src/app/api/capabilities/route.ts) L7–77).  
**Score:** 8/10.

### 3. Context injection

**Evidence:** App does not inject Cursor system prompts. Alignment data fetchable for external harness.  
**Score:** 3/8 — intentional boundary per contract.

### 4. Shared workspace

**Evidence:** Alignment rows shared; graph JSON same for UI and `GET /api/brain-map/graph`.  
**Score:** 8/10.

### 5. CRUD completeness

**Evidence:** Public + admin alignment routes; CLI `list|create|patch|delete`. Brain-map **read-only** at API — honest.  
**Score:** 7/8.

### 6. UI integration

**Evidence:** Focus/visibility refetch ([`admin/alignment/page.tsx`](../../src/app/admin/alignment/page.tsx) L75–86); contract § UI integration; Playwright [`e2e/context-atlas.spec.ts`](../../e2e/context-atlas.spec.ts) (optional Table columns, mocked graph); [`e2e/capabilities.spec.ts`](../../e2e/capabilities.spec.ts) (`GET /api/capabilities` shape).  
**Gap:** No SSE.  
**Score:** 7/10.

### 7. Capability discovery

**Evidence:** Capabilities JSON + page; README routes; [AGENT_INTEGRATION.md](../AGENT_INTEGRATION.md); `/capabilities` points to [INTEGRATION_PATHS.md](../agent/INTEGRATION_PATHS.md) and [OPERATOR_GUI_RUNBOOK.md](../OPERATOR_GUI_RUNBOOK.md) ([`capabilities/page.tsx`](../../src/app/capabilities/page.tsx)); [SharedNavBar](../../src/components/SharedNavBar.tsx) + [SiteFooter](../../src/components/SiteFooter.tsx) link `/capabilities` and raw JSON.  
**Score:** 6/7 — remaining gap: dedicated onboarding flow and rich suggested-prompt UX (optional product scope).

### 8. Prompt-native

**Evidence:** Product is React/API-first.  
**Score:** 2/10 — documented as design stance.

### OpenGrimoire — visualization / schema (AC2)

| Item | Evidence |
|------|----------|
| Optional OpenGrimoire fields in Table (when present on nodes) | [`BrainMapGraph.tsx`](../../src/components/BrainMap/BrainMapGraph.tsx) — conditional columns Trust score, Compass axis, Grimoire tags, Insight level; core columns unchanged |
| Schema documents | [BRAIN_MAP_SCHEMA.md](../BRAIN_MAP_SCHEMA.md) — `trust_score`, `grimoire_tags`, `compass_axis`, `insight_level` |

**P0 (closed):** AC2 met via conditional Table columns for `trust_score`, `compass_axis`, `grimoire_tags`, `insight_level` when any visible node carries the field ([BrainMapGraph.tsx](../../src/components/BrainMap/BrainMapGraph.tsx) Table + [scope](../scope_opengrimoire_mvp_agent_native.md) AC2).

### Part A — Security review (security-sentinel, read-only)

Static review of `src/app/api/**` and auth helpers; **no high-severity** issues assuming production sets `ALIGNMENT_CONTEXT_API_SECRET` and `NODE_ENV=production` as documented.

| Severity | Topic | Notes |
|----------|--------|--------|
| — | Alignment + admin gates | `checkAlignmentContextApiGate` (shared secret); `requireOpenGrimoireAdminRoute` (operator session cookie). |
| Medium | Survey `POST /api/survey` | Unauthenticated by design; spam/abuse possible without edge rate limits or CAPTCHA (product decision). |
| Medium | Brain-map key + public client | If `NEXT_PUBLIC_*` mirrors server secret, header is replayable from bundle—treat as casual gating or keep graph non-sensitive (see [NEXT_PUBLIC_AND_SECRETS.md](../security/NEXT_PUBLIC_AND_SECRETS.md)). |
| Low | `GET /api/capabilities` | Public route list + auth hints—accepted for OA-REST-2 agent discovery; light reconnaissance surface. |
| Low | `GET /api/test-data/:dataset` | Stub; guard before any file/proxy expansion. |

**Accepted:** Public manifest; alignment body untrusted for LLM consumers per [AGENT_INTEGRATION.md](../AGENT_INTEGRATION.md) (harness SCP); survey anonymous participation.

**Part B reminder:** Scores in the next section are for the **OpenHarness** bundle only, not the OpenGrimoire app; they do not change the ~**65%** Part A headline above.

---

## Part B — OpenHarness (bundle; no Next.js app)

**Surface type:** Markdown workflows, `.cursor/state`, skills—not a React operator GUI.

**Maintained mapping (bundle backlog):** [OpenHarness `docs/HARNESS_AUDIT_ALIGNMENT.md`](../../../OpenHarness/docs/HARNESS_AUDIT_ALIGNMENT.md) — one row per Part B dimension → what to improve here → path. [OpenHarness `capabilities.harness.yaml`](../../../OpenHarness/capabilities.harness.yaml) lists structured script inventory and checklist anchors.

| # | Principle | Score | Notes / evidence | Evidence (OpenHarness paths) |
|---|-----------|-------|------------------|------------------------------|
| 1 | Action parity | 5/10 | Humans run scripts; agents can run same if allowed—no unified “OpenHarness API” | `scripts/copy_continue_prompt.*`, `scripts/validate_handoff_scp.py`, `scripts/build_brain_map.py`, `scripts/sanitize_input.py`; `README.md` |
| 2 | Tools as primitives | 8/10 | Skills in `.cursor/skills/` (e.g. `agent-native-architecture/SKILL.md`) | `.cursor/skills/agent-native-architecture/SKILL.md`; `README.md` (Contents) |
| 3 | Context injection | 6/10 | Handoff templates, `state/handoff_latest.md` | `docs/HANDOFF_FLOW.md`; `.cursor/state/handoff_latest.md` (see `state/README.md` for portable layout) |
| 4 | Shared workspace | 7/10 | Same files on disk for human + agent | Repo root; `docs/PUBLIC_AND_PRIVATE_HARNESS.md` |
| 5 | CRUD completeness | N/A | No entity API—**honest N/A**; state files are CRUD via editor | — |
| 6 | UI integration | N/A | No product UI | — |
| 7 | Capability discovery | 7/10 | Skill list + README patterns | `README.md`; `.cursor/skills/*/SKILL.md`; OpenHarness `docs/AGENT_NATIVE_CHECKLIST.md` (canonical SSOT); MiscRepos `.cursor/docs/AGENT_NATIVE_CHECKLIST.md` (portfolio **stub**) + `AGENT_NATIVE_CHECKLIST_MISCOPS.md` |
| 8 | Prompt-native | 7/10 | Handoff/continue prompts are prompt-forward | `docs/HANDOFF_FLOW.md`; `state/continue_prompt.txt`; `scripts/copy_continue_prompt.*` |

**P0 (OpenHarness):** Keep [HANDOFF_FLOW.md](../../../OpenHarness/docs/HANDOFF_FLOW.md) linked from OpenGrimoire runbook; optional cross-link [brain-map-visualization skill](../../../OpenHarness/.cursor/skills/brain-map-visualization/SKILL.md). **Done:** [OPERATOR_GUI_RUNBOOK.md](../OPERATOR_GUI_RUNBOOK.md) (OpenHarness section), [MONITORING_OPENGRIMOIRE.md](../MONITORING_OPENGRIMOIRE.md).

---

## Consolidated P0 / P1

| Priority | Item | Owner |
|----------|------|-------|
| Done | AC2 optional graph metadata in Table + schema docs | OpenGrimoire |
| Done | Runbook + monitoring split docs | OpenGrimoire ([OPERATOR_GUI_RUNBOOK.md](../OPERATOR_GUI_RUNBOOK.md), [MONITORING_OPENGRIMOIRE.md](../MONITORING_OPENGRIMOIRE.md)) |
| Done | E2E: [`e2e/capabilities.spec.ts`](../../e2e/capabilities.spec.ts), optional columns in [`e2e/context-atlas.spec.ts`](../../e2e/context-atlas.spec.ts) | OpenGrimoire |
| Deferred | OA-OG-2: React Query/SWR / SSE on admin alignment | OpenGrimoire |
| P1 | A2UI token pass on `capabilities` page (scope only) | OpenGrimoire |
| P1 | Thin MCP over REST | Portfolio / optional |
| P1 | Edge rate limits / abuse controls for survey POST (if public deploy) | OpenGrimoire / infra |

---

## Top 10 recommendations (impact)

1. Keep **single** agent entry: [AGENT_INTEGRATION.md](../AGENT_INTEGRATION.md) + [capabilities/route.ts](../../src/app/api/capabilities/route.ts) updated with each API PR.  
2. Optional: **thin MCP** over REST only—no duplicate domain layer ([INTEGRATION_PATHS.md](../agent/INTEGRATION_PATHS.md)).  
3. Deferred **OA-OG-2:** React Query/SWR on `/admin/alignment` if in-tab staleness matters; SSE only if product requires.  
4. Deferred **OA-OG-5:** A2UI on `/capabilities` only when scoped.  
5. Do not claim **prompt-native** product without scope change (2/10 by design).  
6. OpenHarness: treat as **docs parity**; no fake GUI scores (see Part B below).  
7. Portfolio monitoring: link [MONITORING_OPENGRIMOIRE.md](../MONITORING_OPENGRIMOIRE.md) from MiscRepos runbooks.  
8. SCP: alignment content still harness-gated per [AGENT_INTEGRATION.md](../AGENT_INTEGRATION.md) untrusted-content note.  
9. **Security:** Survey rate limits / abuse monitoring on public deploy; avoid `NEXT_PUBLIC_*` brain-map key as real secret.  
10. Re-score Part A after the next material API or discovery UX change (optional product sign-off).

---

## References (file:line or route)

- Table columns: `BrainMapGraph.tsx` ~436–476  
- Admin refetch: `admin/alignment/page.tsx` ~56–86  
- Capabilities: `src/app/api/capabilities/route.ts` L7–77; `/capabilities`  
- E2E: `e2e/capabilities.spec.ts`; `e2e/context-atlas.spec.ts`; fixture `e2e/fixtures/brain-map-state-only.json`  
- REST contract: `docs/ARCHITECTURE_REST_CONTRACT.md` L58–68  
- Scope AC: `docs/scope_opengrimoire_mvp_agent_native.md`
