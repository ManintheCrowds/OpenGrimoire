# OpenGrimoire — full product-scope review (charter)

**Status:** Complete (2026-04-16). Human sign-off optional: if stakeholders disagree with MVP/deferred, update this file and the harness row.

**Normative product spec:** [OPENGRIMOIRE_BASE_FEATURES.md](../OPENGRIMOIRE_BASE_FEATURES.md)  
**Execution companion (CI waves):** [OPENGRIMOIRE_BASE_FEATURES_ENGINEERING_PLAN.md](./OPENGRIMOIRE_BASE_FEATURES_ENGINEERING_PLAN.md)  
**Harness tasks:** [MiscRepos `pending_tasks.md` — OPENGRIMOIRE_FULL_REVIEW](../../../MiscRepos/.cursor/state/pending_tasks.md#opengrimoire_full_review-product-scope)

---

## Stakeholders (roles)

| Role | Needs from “fully functioning” |
|------|--------------------------------|
| **Operator** | Can deploy or run locally from documented paths; can run vault → mirror sync and confirm SSOT vs OG UI; has runbooks for alignment secrets and ports. |
| **Maintainer** | CI and tests reflect critical paths; changes to public API or MCP stay in sync with docs and capability maps. |
| **Security reviewer** | No undisclosed P0 issues vs [PUBLIC_SURFACE_AUDIT.md](../security/PUBLIC_SURFACE_AUDIT.md); auth and headers for alignment/admin are explicit. |
| **Agent / harness consumer** | REST or MCP (or documented CLI) parity for operator workflows surfaced in UI; no orphan UI-only paths without a documented agent alternative. |

---

## Definition of “fully functioning”

The product is **fully functioning** for the purposes of this review when **all** of the following are true:

1. **Deploy / runbook** — [DEPLOYMENT.md](../../DEPLOYMENT.md), Docker, and [`.env.example`](../../.env.example) describe a reproducible path an independent operator can follow without private tribal knowledge.
2. **Four systems reviewed** — Each of the systems in the table below has written **requirements**, **acceptance criteria**, **gaps** (vs code + audit + critic), and **verification** steps, either in `OpenGrimoire/docs/plans/` or linked artifacts, per harness tasks **OA-FR-1** through **OA-FR-4**, or an **explicit waiver** recorded in the harness table with owner and date.
3. **Security bar** — No silent P0 gaps: findings are reconciled with [PUBLIC_SURFACE_AUDIT.md](../security/PUBLIC_SURFACE_AUDIT.md) or explicitly accepted with rationale.
4. **Agent-native posture** — Parity expectations are documented (e.g. [MiscRepos MCP_CAPABILITY_MAP § OpenGrimoire](../../../MiscRepos/.cursor/docs/MCP_CAPABILITY_MAP.md)); exceptions are listed, not implied.
5. **Spec alignment** — [OPENGRIMOIRE_BASE_FEATURES.md](../OPENGRIMOIRE_BASE_FEATURES.md) REQ audit and shipped behavior do not contradict each other without an ADR or charter update.

**Observer vs CI-mechanical:** Many acceptance criteria are **observer-verifiable** (checklist, curl, browser). Where the [engineering plan](./OPENGRIMOIRE_BASE_FEATURES_ENGINEERING_PLAN.md) adds **CI-mechanical** proof (tests, fixtures, golden parity), “fully functioning” for that slice means those hooks exist or are explicitly waived in the ADR log with a target wave.

---

## MVP vs deferred

### MVP (minimum to close the full review for go-live)

| Item | Meaning |
|------|--------|
| Charter (this doc) | Stakeholders, definition of done, MVP/deferred, review order — **OA-FR-SCOPE** |
| Engineering roadmap | Waves and per-REQ verification hooks accepted or in progress — **OA-FR-BASE** |
| Per-system matrices | OA-FR-1 … OA-FR-4 each produce REQ/AC/gaps/verification as in **Product-scope outputs** below |
| Cross-cutting checklist | **OA-FR-X**: Docker/env parity, `.env.example`, CI gaps documented, parity table or equivalent |

### Deferred (explicit; revisit on trigger)

Aligned with [engineering plan — Out of scope](./OPENGRIMOIRE_BASE_FEATURES_ENGINEERING_PLAN.md#out-of-scope-explicit-deferrals):

| Topic | Trigger / REQ tie-in |
|-------|----------------------|
| Hosted multi-tenant wiki sync | REQ-1 stable + security review |
| Obsidian-in-browser editing from OG | Product decision; breaks read-only invariant |
| Full-text search across mirror from OG | REQ-2.1 wikilinks + perf budget |
| Automatic menagerie ↔ brain-map graph fusion | REQ-6 links + REQ-7 events stable |
| Replacing vault SSOT with OG-native wiki | Non-goal per hybrid model in base-features spec |

---

## Review order (harness IDs)

1. **OA-FR-SCOPE** — This charter (first gate).
2. **OA-FR-BASE** — Base-features engineering plan: CI waves, ADR-lite, per-REQ WBS.
3. **OA-FR-1** — Survey & moderation.
4. **OA-FR-2** — Data visualization.
5. **OA-FR-3** — Brain map / context atlas.
6. **OA-FR-4** — Alignment & operator APIs.
7. **OA-FR-X** — Cross-cutting go-live checklist (last).

**Critic / review timing:** Default **after each system** (OA-FR-1 … OA-FR-4) so gaps do not compound; **integration critic once** before OA-FR-X is acceptable if documented in the system write-ups.

---

## Harness tracking

Single source for open/closed rows: [MiscRepos `.cursor/state/pending_tasks.md`](../../../MiscRepos/.cursor/state/pending_tasks.md) section **OPENGRIMOIRE_FULL_REVIEW (product-scope)**. Update that table when this charter or OA-FR-* tasks move state.

---

## Four systems (review units)

| # | System | Primary surfaces | Notes |
|---|--------|------------------|-------|
| 1 | **Survey & moderation** | `/survey`, `/admin`, `/login`, `POST /api/survey` | SQLite + route-handler auth (no Postgres RLS) |
| 2 | **Data visualization** | `/visualization`, `/visualization/*`, constellation/test pages | Alluvial/Chord, hooks, quotes, debug flags |
| 3 | **Brain map / context atlas** | `build_brain_map.py` → JSON → `GET /api/brain-map/graph` → `/context-atlas` | Ports, `BRAIN_MAP_*`, EMPTY_GRAPH |
| 4 | **Alignment & operator APIs** | `/api/alignment-context`, `/admin/alignment`, `docs/agent/*`, CLI | Migration, prod secret, agent parity |

## Product-scope outputs (per system)

For each system, capture:

1. **Requirements** — numbered, who it’s for, dependencies on other systems.  
2. **Acceptance criteria** — Given/When/Then or checklist an independent reviewer can run.  
3. **Gaps** — vs code, vs [PUBLIC_SURFACE_AUDIT.md](../security/PUBLIC_SURFACE_AUDIT.md), vs critic notes.  
4. **Verification** — commands, URLs, operator order.

## Cross-cutting

- Deployment: [DEPLOYMENT.md](../../DEPLOYMENT.md), Docker, env matrix ([`.env.example`](../../.env.example)).  
- Systems inventory: [OPENGRIMOIRE_SYSTEMS_INVENTORY.md](../OPENGRIMOIRE_SYSTEMS_INVENTORY.md).  
- Agent-native parity: [MCP_CAPABILITY_MAP](../../../MiscRepos/.cursor/docs/MCP_CAPABILITY_MAP.md) § OpenGrimoire.  
- **Goal–constraint conflicts:** escalate; do not silently narrow scope.
