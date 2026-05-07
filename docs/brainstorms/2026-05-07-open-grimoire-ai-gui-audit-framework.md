# OpenGrimoire GUI Audit (Executed) + AI Workflow Framework (2026-05-07)

## Executive summary

This is an executed UX audit, not just a brainstorm. We reviewed the current GUI architecture and ran lint/type/test checks to find high-confidence improvement areas.

Top findings:
1. **Navigation and IA still cause cognitive load** in mixed operator vs support surfaces.
2. **Sync Session error handling is informative but not yet structured enough** for fast recovery.
3. **Context Atlas trust/freshness communication is improved but still vulnerable** to stale-data misread.
4. **Visualization components carry substantial React hook hygiene warnings**, which are a reliability and UX quality risk for interactive charts.
5. **Current automated tests are strong in unit coverage, but UX continuity and failure-recovery E2E coverage should be expanded.**

---

## Audit method and evidence

### Files reviewed (GUI surfaces)
- `src/app/page.tsx`
- `src/components/SharedNavBar.tsx`
- `src/components/SyncSessionForm/index.tsx`
- `src/components/BrainMap/BrainMapGraph.tsx`
- Existing audit/issue docs:
  - `docs/KNOWN_ISSUES.md`
  - `docs/audit/gui-2026-04-29-home-context-sync-review.md`

### Commands executed
- `npm run lint`
- `npm run type-check`
- `npm run test -- --run`

### Test/quality result snapshot
- Type-check: **pass**
- Unit/integration tests (Vitest): **75/75 pass**
- Lint: **passes with multiple non-blocking warnings**, mostly `react-hooks/exhaustive-deps`, plus one `next/no-img-element` warning.

---

## Findings and professional recommendations

## 1) Information architecture / navigation clarity

### Finding
The product direction is clearer than before (primary workflows and supporting surfaces), but the global nav still presents many destinations in a flat list.

### Why it matters
Operators need fast pathing under pressure. Flat nav with many similarly weighted links increases decision friction and backtracking.

### Improvement
- Add lightweight nav grouping labels (e.g., **Operate**, **Inspect**, **Configure**) in `SharedNavBar`.
- Keep `/admin` as the primary cockpit anchor; de-emphasize `/admin/controls` in top-level nav (move to cockpit sidebar or secondary menu).
- Add "recommended next action" chip on home cards (e.g., after Sync Session success, steer to Context Atlas or Cockpit).

## 2) Sync Session recovery UX

### Finding
`SyncSessionForm` already shows useful operator checks, but errors are rendered as broad text with a generic checklist.

### Why it matters
Fast incident response depends on precise failure class and direct action affordance.

### Improvement
- Introduce an error taxonomy object in the form state (`bootstrap_token`, `submission_5xx`, `rate_limit`, `db_unavailable`, `network`).
- Render **error-specific CTA buttons** (Retry submit, check auth session, open diagnostics panel/runbook).
- Add a compact diagnostics disclosure with request id/status code where available.

## 3) Context Atlas trust/freshness posture

### Finding
`BrainMapGraph` provides metadata and placeholder behavior, but user trust can still drift if generated graph freshness is not interpreted correctly.

### Why it matters
Misreading generated JSON as live truth creates incorrect operational decisions.

### Improvement
- Add explicit freshness badge states: **Fresh**, **Aging**, **Stale**, **Unknown** based on generated timestamp thresholds.
- Add "Last successful rebuild source roots" panel and a "how to rebuild" runbook link.
- Require strong visual distinction between placeholder/demo graph and real operator graph (banner + icon + color shift).

## 4) Visualization reliability risk (lint warning cluster)

### Finding
`npm run lint` reports a significant cluster of hook-dependency warnings in advanced visualization components, plus one `img` optimization warning.

### Why it matters
Hook dependency drift can cause stale renders, racey animation behavior, cleanup bugs, and user-visible inconsistency.

### Improvement
- Treat current visualization lint warnings as **P1 engineering quality debt**.
- Create a targeted remediation sprint:
  1. Resolve dependency arrays with `useMemo`/`useCallback` stabilization,
  2. Refactor animation effect cleanup to avoid stale refs,
  3. Add regression tests around mode switching, filtering, and animation lifecycle.
- Evaluate replacing plain `<img>` with `next/image` where appropriate for performance-sensitive headers.

## 5) Test strategy gaps for UX quality

### Finding
Unit tests are healthy, but there is limited explicit evidence in this pass for multi-route continuity, deterministic failure injection, and async a11y announcement checks.

### Why it matters
Many real UX bugs happen between routes or under failure states, not in isolated pure functions.

### Improvement
- Add E2E specs for:
  - Home → Sync Session fail/recover path,
  - Home → Context Atlas stale/fresh badge behavior,
  - Admin route continuity (`/admin` ↔ `/admin/observability/[id]`) with context persistence.
- Add explicit ARIA announcement assertions for submission/loading/error transitions.

---

## Prioritized action backlog

### P0 (next release cycle)
1. Implement Sync Session error taxonomy + per-error recovery CTAs.
2. Add Context Atlas freshness badge states and stronger placeholder labeling.
3. Add at least one failure-recovery E2E flow for Sync Session.

### P1
1. Reduce top-level nav cognitive load via grouped navigation and de-emphasis of low-frequency controls.
2. Burn down visualization hook-warning cluster (reliability debt).
3. Add admin continuity E2E tests for context persistence.

### P2
1. Add AI assistance explainability affordances ("why suggested", dismiss, undo) to first qualifying operator flow.
2. Add KPI instrumentation for time-to-first-success and recovery-after-error.

---

## AI workflow framework for OpenGrimoire GUI

## Intent → Plan → Execute → Verify (operator-in-control)

1. **Intent**: user provides desired outcome.
2. **Plan**: AI proposes bounded steps with rationale.
3. **Execute**: user confirms critical transitions.
4. **Verify**: system summarizes outcome + evidence, with rollback/follow-up options.

## Mandatory AI assist guardrails

Every AI-assisted action must include:
- **Why this suggestion appeared** (inputs/signals at human-readable level),
- **Dismiss/undo control** in the same interaction scope,
- **Manual fallback path** without dead-end dependence on AI response quality.

## Trust-boundary labeling model

Output surfaces should clearly label the source class:
- Generated static graph output,
- SQLite-backed operational records,
- AI inference/suggestion,
- Human operator decision.

---

## 30/60/90 plan

### 30 days
- Ship Sync Session error taxonomy and recovery CTAs.
- Add freshness states to Context Atlas.
- Add 1–2 failure-mode E2E tests.

### 60 days
- Deliver nav grouping improvements.
- Reduce at least 50% of current visualization hook warnings.
- Add admin continuity regression test coverage.

### 90 days
- Roll out first mixed-initiative operator flow with full explainability + undo telemetry.
- Publish dashboard for recovery success rate, AI-assist acceptance/edit/dismiss rates, and UX friction score trends.

---

## Working principle

OpenGrimoire should function as a high-trust operator cockpit: AI accelerates workflow execution, but authority, clarity, and accountability remain with the human at every critical boundary.
