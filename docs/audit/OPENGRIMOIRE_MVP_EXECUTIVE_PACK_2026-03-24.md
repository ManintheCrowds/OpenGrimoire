# Executive pack — OpenGrimoire MVP (agent-native + scope)

**Date:** 2026-03-24  
**Sources:** [scope_opengrimoire_mvp_agent_native.md](../scope_opengrimoire_mvp_agent_native.md), [agent_native_opengrimoire_2026-03-24.md](./agent_native_opengrimoire_2026-03-24.md), [critic_report_agent_native_2026-03-24.json](./critic_report_agent_native_2026-03-24.json), [OPENGRIMOIRE_MVP_PLACEMENT.md](../architect/OPENGRIMOIRE_MVP_PLACEMENT.md).

---

## Executive summary (≤10 bullets)

1. **MVP sentence** (product): Operator loads **local-first brain map** in browser, uses **documented REST/CLI** for alignment when configured; persistence is **SQLite** (no hosted Postgres/Supabase).  
2. **Visualization gap (P0):** Table view does not show optional schema fields (`trust_score`, `grimoire_tags`, etc.) — see `BrainMapGraph.tsx` vs [BRAIN_MAP_SCHEMA.md](../BRAIN_MAP_SCHEMA.md); AC2 open.  
3. **OpenGrimoire** scores **partial–good** on API primitives, shared workspace, alignment CRUD, and **capabilities** discovery (`/api/capabilities` + page).  
4. **Context injection / prompt-native** are **low by design** per REST contract non-goals—not bugs.  
5. **UI integration:** Admin alignment refetches on focus/visibility; cross-client live sync not guaranteed (documented).  
6. **OpenHarness** is **docs/skills/state** — audit uses **honest N/A** for GUI; handoff flow is the primary “intent surface.”  
7. **Monitoring** split: [MONITORING_OPENGRIMOIRE.md](../MONITORING_OPENGRIMOIRE.md) (app) vs portfolio orchestrator (pointers only).  
8. **Runbooks:** [OPERATOR_GUI_RUNBOOK.md](../OPERATOR_GUI_RUNBOOK.md) added for GUI flows.  
9. **Tech-lead placement:** [architect/OPENGRIMOIRE_MVP_PLACEMENT.md](../architect/OPENGRIMOIRE_MVP_PLACEMENT.md).  
10. **Critic:** **PASS** (total 23 ≥ 18; safety/correctness 5).

---

## MVP gap list (P0 / P1)

| Priority | Step | Status |
|----------|------|--------|
| P0 | Decide AC2: add optional columns/detail **or** document deferral only | Open |
| P0 | Keep capabilities + contract matrix in sync on API changes | Ongoing |
| P1 | Playwright: `/capabilities` or alignment smoke with env | Open |
| P1 | A2UI pass on `/capabilities` slice | Open |
| P1 | Optional MCP over REST | Portfolio |

---

## Agent-native scores (rollup)

| Principle | OpenGrimoire (approx.) | OpenHarness |
|-----------|----------------------|-------------|
| Action parity | 50% | 50% |
| Tools as primitives | 80% | 80% |
| Context injection | 38% | 75% |
| Shared workspace | 80% | 70% |
| CRUD completeness | 88% (alignment) | N/A |
| UI integration | 60% | N/A |
| Capability discovery | 71% | 71% |
| Prompt-native | 20% | 70% |

*See full audit for methodology.*

---

## Top 10 recommendations (by impact)

From [agent_native_opengrimoire_2026-03-24.md](./agent_native_opengrimoire_2026-03-24.md), consolidated:

1. Close AC2 optional-field visibility or deferral.  
2. Single agent entry: AGENT_INTEGRATION + capabilities PR discipline.  
3. Playwright fixture with `trust_score` when UI ships.  
4. Document cross-client alignment limits (already in contract).  
5. No prompt-native claim without product change.  
6. OpenHarness: link handoff, not fake UI scores.  
7. Portfolio monitoring cross-links.  
8. SCP / alignment harness gating.  
9. MCP thin wrapper only if needed.  
10. Re-audit after P0 UI decision.

---

## Critic summary

| Field | Value |
|-------|--------|
| Pass | **true** |
| Total | 23 / 25 |
| Threshold | 18 |
| Artifact | [critic_report_agent_native_2026-03-24.json](./critic_report_agent_native_2026-03-24.json) |

---

## Open questions (≤5)

1. **AC2:** Add columns for all optional fields, or subset + “more” drawer?  
2. **OpenHarness:** Single combined operator doc vs per-repo runbooks?  
3. **E2E:** CI runs `verify` + Playwright on default branch (see `.github/workflows/ci.yml`).
