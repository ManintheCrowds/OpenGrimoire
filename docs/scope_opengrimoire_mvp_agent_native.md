# Product scope: OpenGrimoire MVP (agent-native readiness)

**Date:** 2026-03-24  
**Product:** OpenGrimoire (narrative); repository **OpenAtlas** (package `open-atlas`).  
**Related:** [ARCHITECTURE_REST_CONTRACT.md](./ARCHITECTURE_REST_CONTRACT.md), [BRAIN_MAP_SCHEMA.md](./BRAIN_MAP_SCHEMA.md), [AGENT_INTEGRATION.md](./AGENT_INTEGRATION.md).

---

## MVP in one sentence

**MVP:** An operator can open the app, load the **local-first brain map** in the browser (`/context-atlas` or `/brain-map`), read **alignment context** when Supabase + admin or the **public alignment API** is configured, and agents/operators can follow **documented REST + CLI** paths—**without requiring Supabase** for the context-graph viewer path.

---

## Requirements

1. **R1 — Context graph visualization** — The UI must consume `GET /api/brain-map/graph` and render nodes/edges per [BRAIN_MAP_SCHEMA.md](./BRAIN_MAP_SCHEMA.md) for **core** fields (`id`, `group`, `accessCount`, `path`, `layer`, `provenance` where present).
2. **R2 — OpenGrimoire optional fields** — Schema documents optional `trust_score`, `compass_axis`, `grimoire_tags`, `insight_level` (and edge-level mirrors). Product must either **surface** them in Table/detail **or** document them as **intentionally not shown** in UI with rationale.
3. **R3 — Alignment CRUD** — Operators with credentials can create/read/update/delete alignment items via **public API** (`x-alignment-context-key`) or **admin UI** (`/admin/alignment`) per contract; behavior matches [ALIGNMENT_CONTEXT_API.md](./agent/ALIGNMENT_CONTEXT_API.md).
4. **R4 — Capability discovery** — `GET /api/capabilities` and human page `/capabilities` stay in sync with routes (hand-maintained); [AGENT_INTEGRATION.md](./AGENT_INTEGRATION.md) remains the single integration entry.
5. **R5 — Monitoring (split)**  
   - **OpenAtlas app:** Observable dev/prod health (process up, HTTP errors on API routes used by operators).  
   - **Portfolio automation:** Orchestrator scripts, MCP usage, `build_brain_map.py` runs—**documented separately** (MiscRepos / local-proto); not conflated with Next.js-only metrics.
6. **R6 — Runbooks** — Operator-facing docs for primary GUI flows (open viewer, refresh graph, alignment admin, secrets/env names only).
7. **R7 — Verification** — Playwright smoke for `/context-atlas` and critical routes; contract tests or manual matrix against [ARCHITECTURE_REST_CONTRACT.md](./ARCHITECTURE_REST_CONTRACT.md). A2UI/design: **one vertical slice** (e.g. `/capabilities` + alignment path) per portfolio A2UI guidance—not full-app visual audit in MVP.

---

## Acceptance criteria

| ID | Criterion |
|----|-----------|
| AC1 | **Given** `public/brain-map-graph.json` (or `.local.json`) exists, **When** user visits `/context-atlas`, **Then** graph or documented empty state appears within timeout (see `e2e/context-atlas.spec.ts`). |
| AC2 | **Given** graph JSON includes optional `trust_score` or `grimoire_tags`, **When** user opens **Table** tab, **Then** matching **columns appear** for any optional field present on at least one visible node (Trust score, Compass axis, Grimoire tags, Insight level), with **—** where a node omits the field. |
| AC3 | **Given** `ALIGNMENT_CONTEXT_API_SECRET` set, **When** client sends wrong key to `GET /api/alignment-context`, **Then** **401** (per contract). |
| AC4 | **Given** admin user, **When** `/admin/alignment` loads, **Then** list refetches on window focus/visibility (per [ARCHITECTURE_REST_CONTRACT.md](./ARCHITECTURE_REST_CONTRACT.md) § UI integration). |
| AC5 | **Given** `GET /api/capabilities`, **When** compared to `src/app/api/**/route.ts` inventory, **Then** no silent missing **public** entity routes claimed in README. |
| AC6 | Monitoring playbook exists split: OpenAtlas vs portfolio (see [MONITORING_OPENATLAS.md](./MONITORING_OPENATLAS.md) when created). |
| AC7 | Operator runbook exists with primary flows and env **names** (no secret values). |

---

## Baseline evidence (visualization)

The Table view in [`src/components/BrainMap/BrainMapGraph.tsx`](../src/components/BrainMap/BrainMapGraph.tsx) always shows **Path, Group, Access count, Layer, Provenance**. It **adds columns** for OpenGrimoire optional node fields (`trust_score`, `compass_axis`, `grimoire_tags`, `insight_level`) when at least one **visible** node in the current layer filter includes that field in the graph JSON (see [BRAIN_MAP_SCHEMA.md](./BRAIN_MAP_SCHEMA.md)). Other optional schema fields (`constraint`, `risk_tier`, `review_status`) appear in the **graph** node tooltip only, not the table—extend the table in a future slice if product requires.

---

## Non-goals (this MVP scope document)

- Renaming `app: 'open-atlas'` in [`src/app/api/capabilities/route.ts`](../src/app/api/capabilities/route.ts) or package rename in this pass.
- Full Langfuse/tracing **inside** OpenAtlas unless separately scoped.
- Embedded Cursor system prompts or in-app “agent shell” ([ARCHITECTURE_REST_CONTRACT.md](./ARCHITECTURE_REST_CONTRACT.md) non-goals).
- React **E2E for OpenHarness** (no App Router product UI there).

---

## Monitoring split

| Layer | Owns | Examples |
|-------|------|----------|
| **OpenAtlas** | HTTP API health, Next.js logs, `middleware` behavior, rate limits | 401/503 on misconfig; 429 on survey limit |
| **Portfolio / MiscRepos** | Orchestrator, scheduled scripts, MCP process logs, brain-map build CI | `orchestrator_config.json`, `run_*` scripts |
| **OpenHarness** | Handoff integrity, local scripts | `validate_handoff_scp.py`, copy prompts |

Cross-link automation metrics from [MONITORING_OPENATLAS.md](./MONITORING_OPENATLAS.md) (OpenAtlas app vs portfolio orchestration).

---

## OpenHarness expectations (multi-repo)

OpenHarness is an **agent bundle / docs** repo, not a Next.js operator app.

- **Intent / context surfaces:** [OpenHarness docs/HANDOFF_FLOW.md](../../OpenHarness/docs/HANDOFF_FLOW.md), `.cursor/state/handoff_latest.md`, [MiscRepos HANDOFF_FLOW.md](../../MiscRepos/.cursor/HANDOFF_FLOW.md) for full procedure.
- **Skills:** `.cursor/skills/` (e.g. `agent-native-architecture`, `brain-map-visualization`) provide **discovery** and procedures.
- **Agent-native audit** for OpenHarness: **documentation + script parity**, not GUI E2E.
- **Part B alignment:** [OpenHarness `docs/HARNESS_AUDIT_ALIGNMENT.md`](../../OpenHarness/docs/HARNESS_AUDIT_ALIGNMENT.md) maps audit dimensions to harness paths; [OpenHarness `capabilities.harness.yaml`](../../OpenHarness/capabilities.harness.yaml) holds structured inventory when paths evolve.

---

## Revision history

| Date | Change |
|------|--------|
| 2026-03-24 | Initial scope for MVP + agent-native plan |
