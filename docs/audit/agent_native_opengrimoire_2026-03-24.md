# Agent-native architecture audit — OpenGrimoire MVP (2026-03-24)

**Revision:** 2026-03-24 — Part A **work backlog** table added; `/capabilities` page cites INTEGRATION_PATHS + OPERATOR_GUI_RUNBOOK for discovery. **Post-P0 (same day):** Table view adds conditional columns for OpenGrimoire optional node fields when present in graph JSON; curl examples in AGENT_INTEGRATION; Playwright covers optional columns + `/api/capabilities` shape; MiscRepos troubleshooting index links MONITORING_OPENATLAS.

**Normative:** [ARCHITECTURE_REST_CONTRACT.md](../ARCHITECTURE_REST_CONTRACT.md), [scope_opengrimoire_mvp_agent_native.md](../scope_opengrimoire_mvp_agent_native.md).
**Prior audit:** [AGENT_NATIVE_AUDIT_OPENATLAS.md](../AGENT_NATIVE_AUDIT_OPENATLAS.md) (historical baseline).  
**Scope:** OpenAtlas app + OpenHarness bundle (docs/skills/state)—**not** MiscRepos orchestrator code.

---

## Part A — OpenAtlas (OpenGrimoire product)

### Summary table

| # | Principle | Score | % | Status | P0 gap |
|---|-----------|-------|---|--------|--------|
| 1 | Action parity | 6 / 12 | 50% | Partial | No first-party OpenAtlas MCP; parity via HTTP/CLI/browser automation |
| 2 | Tools as primitives | 8 / 10 | 80% | Good | APIs resource-oriented; CLI thin |
| 3 | Context injection | 3 / 8 | 38% | Needs work | By design: prompts live in harness ([ARCHITECTURE_REST_CONTRACT.md](../ARCHITECTURE_REST_CONTRACT.md) non-goals) |
| 4 | Shared workspace | 8 / 10 | 80% | Partial | Same alignment store for UI + API; graph file-backed |
| 5 | CRUD completeness | 7 / 8 | 88% | Partial | Alignment: full CRUD API + admin UI PATCH status + DELETE; brain-map read-only |
| 6 | UI integration | 6 / 10 | 60% | Partial | Admin refetch on focus/visibility ([admin/alignment/page.tsx](../../src/app/admin/alignment/page.tsx) L75–86); cross-client best-effort per contract |
| 7 | Capability discovery | 5 / 7 | 71% | Partial | `GET /api/capabilities` + `/capabilities` page ([capabilities/route.ts](../../src/app/api/capabilities/route.ts), [capabilities/page.tsx](../../src/app/capabilities/page.tsx)) |
| 8 | Prompt-native | 2 / 10 | 20% | By design | Code-first product; alignment body can hold text |

**OpenAtlas approximate weighted status:** Partial to good on API/discovery; visualization and optional graph fields gap below.

### Part A — Work backlog (by principle)

Use this table to drive follow-on work without re-scoring until changes ship. **Effort:** S = small, M = medium, L = large.

| # | Principle | Next action | Effort | Notes |
|---|-----------|-------------|--------|--------|
| 1 | Action parity | Keep **HTTP + CLI** as canonical; add curl examples to [AGENT_INTEGRATION.md](../AGENT_INTEGRATION.md) if gaps; optional **thin MCP** only per [INTEGRATION_PATHS.md](../agent/INTEGRATION_PATHS.md) (no duplicate business layer) | M | Raises score when MCP tools wrap existing routes only |
| 2 | Tools as primitives | On each new API route: keep handler thin; update [capabilities/route.ts](../../src/app/api/capabilities/route.ts) in same PR | S | Maintain 8/10+ |
| 3 | Context injection | **No in-app prompt injection** per contract; ensure harness docs link [ARCHITECTURE_REST_CONTRACT.md](../ARCHITECTURE_REST_CONTRACT.md) non-goals | S | 3/8 is acceptable |
| 4 | Shared workspace | When graph merge changes, document refresh path in [OPERATOR_GUI_RUNBOOK.md](../OPERATOR_GUI_RUNBOOK.md) | S | |
| 5 | CRUD completeness | Brain-map remains read-only; **if** POST ever scoped, add matrix row + AC in scope doc first | L | |
| 6 | UI integration | Optional: React Query/SWR on `/admin/alignment` for in-tab mutation cache; SSE only if product requires | M | |
| 7 | Capability discovery | Surface **INTEGRATION_PATHS** + runbook from `/capabilities` (in-app copy); footer link to `/capabilities` on key pages (optional) | S | |
| 8 | Prompt-native | Treat alignment **body** as operator-authored text; feature flags stay in docs until product scope changes | S | 2/10 by design |

**Cross-cutting P0:** Optional graph fields ([BRAIN_MAP_SCHEMA.md](../BRAIN_MAP_SCHEMA.md)) vs Table view — see § OpenAtlas visualization below.

### 1. Action parity

**Evidence:** Admin alignment CRUD via fetch ([`src/app/admin/alignment/page.tsx`](../../src/app/admin/alignment/page.tsx) L89–147); public API [`alignment-context/route.ts`](../../src/app/api/alignment-context/route.ts); CLI [`scripts/alignment-context-cli.mjs`](../../scripts/alignment-context-cli.mjs).  
**Gap:** No dedicated MCP server in-repo; agents use generic fetch + CLI.  
**P1:** Thin MCP wrapper documented in [INTEGRATION_PATHS.md](../agent/INTEGRATION_PATHS.md) if desired.

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

**Evidence:** Focus/visibility refetch ([`admin/alignment/page.tsx`](../../src/app/admin/alignment/page.tsx) L75–86); contract § UI integration.  
**Gap:** No SSE.  
**Score:** 6/10.

### 7. Capability discovery

**Evidence:** Capabilities JSON + page; README routes; [AGENT_INTEGRATION.md](../AGENT_INTEGRATION.md); `/capabilities` also points to [INTEGRATION_PATHS.md](../agent/INTEGRATION_PATHS.md) and [OPERATOR_GUI_RUNBOOK.md](../OPERATOR_GUI_RUNBOOK.md) (see [`capabilities/page.tsx`](../../src/app/capabilities/page.tsx)).  
**Score:** 5/7 — improved vs older audit due to `/capabilities` shipping; backlog row tracks further discovery work.

### 8. Prompt-native

**Evidence:** Product is React/API-first.  
**Score:** 2/10 — documented as design stance.

### OpenAtlas — visualization / schema gap (P0 for MVP scope)

| Item | Evidence |
|------|----------|
| Optional OpenGrimoire fields not in Table | [`BrainMapGraph.tsx`](../../src/components/BrainMap/BrainMapGraph.tsx) L436–476 — columns Path, Group, Access count, Layer, Provenance only |
| Schema documents | [BRAIN_MAP_SCHEMA.md](../BRAIN_MAP_SCHEMA.md) — `trust_score`, `grimoire_tags`, `compass_axis`, `insight_level` |

**P0 (closed):** AC2 met via conditional Table columns for `trust_score`, `compass_axis`, `grimoire_tags`, `insight_level` when any visible node carries the field ([BrainMapGraph.tsx](../../src/components/BrainMap/BrainMapGraph.tsx) Table + [scope](../scope_opengrimoire_mvp_agent_native.md) AC2).

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
| 7 | Capability discovery | 7/10 | Skill list + README patterns | `README.md`; `.cursor/skills/*/SKILL.md`; `docs/AGENT_NATIVE_CHECKLIST.md` |
| 8 | Prompt-native | 7/10 | Handoff/continue prompts are prompt-forward | `docs/HANDOFF_FLOW.md`; `state/continue_prompt.txt`; `scripts/copy_continue_prompt.*` |

**P0 (OpenHarness):** Keep [HANDOFF_FLOW.md](../../../OpenHarness/docs/HANDOFF_FLOW.md) linked from OpenAtlas runbook; optional cross-link [brain-map-visualization skill](../../../OpenHarness/.cursor/skills/brain-map-visualization/SKILL.md). **Done:** [OPERATOR_GUI_RUNBOOK.md](../OPERATOR_GUI_RUNBOOK.md) (OpenHarness section), [MONITORING_OPENATLAS.md](../MONITORING_OPENATLAS.md).

---

## Consolidated P0 / P1

| Priority | Item | Owner |
|----------|------|-------|
| P0 | Surface or formally defer optional graph metadata (AC2) | OpenAtlas |
| P0 | Runbook + monitoring split docs shipped | OpenAtlas ([OPERATOR_GUI_RUNBOOK.md](../OPERATOR_GUI_RUNBOOK.md), [MONITORING_OPENATLAS.md](../MONITORING_OPENATLAS.md)) |
| P1 | E2E for `/capabilities` response shape or admin path (needs env) | OpenAtlas |
| P1 | A2UI token pass on `capabilities` page | OpenAtlas |
| P1 | Thin MCP over REST | Portfolio / optional |

---

## Top 10 recommendations (impact)

1. Close AC2 (optional graph fields or written deferral) — unblocks MVP honesty.  
2. Keep **single** agent entry: [AGENT_INTEGRATION.md](../AGENT_INTEGRATION.md) + capabilities route updated with each API PR.  
3. Extend Playwright to assert **optional** field column when fixture includes `trust_score` (test-driven UI).  
4. Admin alignment: already refetches on focus — document in runbook (done).  
5. Do not claim prompt-native product without scope change.  
6. OpenHarness: treat as **docs parity**; no fake GUI scores.  
7. Portfolio monitoring: link [MONITORING_OPENATLAS.md](../MONITORING_OPENATLAS.md) from MiscRepos runbooks.  
8. SCP: alignment content still harness-gated per contract.  
9. Optional MCP: avoid duplicating business logic ([INTEGRATION_PATHS.md](../agent/INTEGRATION_PATHS.md)).  
10. Re-audit after P0 UI/schema decision.

---

## References (file:line or route)

- Table columns: `BrainMapGraph.tsx` ~436–476  
- Admin refetch: `admin/alignment/page.tsx` ~56–86  
- Capabilities: `src/app/api/capabilities/route.ts` L7–77; `/capabilities`  
- REST contract: `docs/ARCHITECTURE_REST_CONTRACT.md` L58–68  
- Scope AC: `docs/scope_opengrimoire_mvp_agent_native.md`
