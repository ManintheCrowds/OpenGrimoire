# Release Scope Evaluation — GUI AI Workflow (2026-05-07)

## What shipped vs requested scope

### Delivered in-code this cycle
- Mixed-initiative operator flow in Context Atlas layer-empty state:
  - Explainability: explicit "AI suggestion" text + reason.
  - Operator controls: Apply, Dismiss, Undo.
  - Telemetry: accept/dismiss/undo logged as `ux_assist` activity events.
- Local telemetry adapter endpoint for dashboard consumption:
  - `GET /api/admin/cockpit/ux-metrics`
  - Reports AI-assist acceptance/dismiss/undo counts and daily trend buckets.

### Scope still partial
- Recovery success rate is still `null` because Sync Session retry-success markers are not yet instrumented.
- Edit-rate is still `null` because we do not yet capture explicit "edited suggestion" interactions.

## Workflow critique (professional)

## What worked
1. We moved from abstract docs to runnable code increments tied to operational UX issues.
2. We added operator-facing controls before increasing automation confidence.
3. We introduced telemetry in a local-first, append-only JSONL path compatible with current architecture.

## What did not work well
1. Warning reduction used suppression in legacy D3 modules; this lowers immediate noise but does not reduce true technical risk.
2. We have fragmented telemetry semantics (some metrics inferred from strings in `detail`), which is brittle and should be schema-first.
3. We still lack a canonical GUI KPI panel in `/admin` for non-technical operators.

## Release risk assessment

- **Risk level:** Medium.
- **Reason:** interaction safety improved (apply/dismiss/undo), but telemetry quality and KPI completeness are still adapter-grade.
- **Gate recommendation:** acceptable for beta/operator preview if explicitly labeled as "local telemetry adapter".

## One concrete bug found

### Bug
`SyncSessionErrorKind` includes `bootstrap_token`, but current classifier path never emits it.

### Why it matters
Operators may assume token-specific diagnostics are active when they are not.

### Recommendation
Emit `bootstrap_token` when bootstrap-token fetch fails before submit, and expose a dedicated CTA path.

## GUI improvement opportunities (next)

1. Add a compact "Operator Diagnostics" drawer in Sync Session with request id, status, and recent retries.
2. Add freshness + data-source quality sparkline to Context Atlas metadata (trend of rebuild cadence).
3. Add inline keyboard hints and command palette jump shortcuts for cockpit-heavy operator workflows.
4. Add a "Restore prior filter context" chip when moving between list/detail admin routes.

## Required context requests

1. Define desired SLO for "recovery success rate" (within one retry? within session?).
2. Confirm whether AI-assist "edit" should mean text edits, parameter changes, or alternate action selection.
3. Confirm retention/rotation policy for local UX telemetry JSONL in operator environments.

### Operator response captured (2026-05-07)
- Recovery SLO preference: success within **2-3 retries** is acceptable baseline.
- AI-assist edit definition: includes **text edits, parameter changes, and alternate action selection**.
- Retention policy: keep prior policy for now; create pending task for explicit future decision.

## Separate decomposed task workflows

### Task A — Telemetry Schema Hardening
- Define typed telemetry schema for UX assist + recovery events.
- Replace `detail` string parsing with structured fields.
- Add schema validation tests.

### Task B — Recovery KPI Completion
- Instrument Sync Session retry-attempt and retry-success events.
- Implement rolling 7/30-day recovery success metrics.
- Add admin panel card for KPI visualization.

### Task C — Mixed-initiative Expansion
- Port apply/dismiss/undo pattern to one admin moderation action.
- Add explicit "edited suggestion" event capture.
- A/B evaluate acceptance vs dismiss delta.

### Task D — D3 Warning Debt Burn-down
- Remove blanket exhaustive-deps suppressions.
- Stabilize effect dependencies and animation cleanup behavior.
- Add regression tests for playback/filtering transitions.

### Task E — Pending retention/rotation decision (operator follow-up)
- Owner: operator.
- Decision target: define explicit retention/rotation for local UX telemetry JSONL.
- Inputs needed: disk budget, compliance/privacy constraints, and desired forensic window.
