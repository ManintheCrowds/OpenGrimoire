# OpenGrimoire — operator cockpit (multi-panel GUI)

**Purpose:** Identify which Mission Control-style "multi-panel operator" ideas belong **inside** OpenGrimoire's existing GUI (admin, survey, sync session, A2UI), with a **data contract** per panel (which API, which role, read-only vs action). This is product design intent for engineering; it does not duplicate portfolio comparative scoring.

**Bridge:** [mission-control-alignment.md](mission-control-alignment.md) (MC -> OG tickets). **Security:** portfolio security decisions are tracked in `local-proto/docs/integrations/mission-control/SECURITY_DECISION_LOG.md` (SDL-04, SDL-07, SDL-08).

**Harness backlog:** decomposed tasks `OG-OC-00` ... `OG-OC-13` live in the MiscRepos clone at `.cursor/state/pending_tasks.md`, section `PENDING_OPENGRIMOIRE_OPERATOR_COCKPIT`.

---

## What already exists (GUI anchors)

From portfolio release work and paths cited in harness docs, OpenGrimoire already includes:

| Surface | Role |
|---------|------|
| **`/admin`** | Authenticated admin shell; entry for operator workflows. |
| **Moderation queue** | `GET /api/admin/moderation-queue`; rows with `data-testid=moderation-queue-item-{id}`; quality/alignment text. |
| **Survey** | System 1 survey flows, `survey-read-gate` / capabilities, visualization paths. |
| **Sync session** | User message submit, error handling, a11y-tested admin paths (`sync-session-admin-*` E2E). |
| **AdminPanel (A2UI)** | A2UI monitor/verify; future catalog (OA-OG-5) noted in audit. |
| **Admin API** | `src/app/api/admin/**` (moderation and related `route.ts`). |

A **multi-panel** layout should **compose** these concerns in one place (grid or tabs), not add a second unrelated app shell.

---

## Panel map: Mission Control theme -> OpenGrimoire panel

| MC / operator theme | Suggested panel (in-app) | Data contract (first pass) | Risk | Phase |
|--------------------|--------------------------|----------------------------|------|--------|
| **Tasks / work queue** | **Moderation queue** (primary) | Existing moderation API + row model; sort/filter by status, age, quality. | Low if read matches today's auth | P0 |
| **Tasks (secondary)** | **Survey / review backlog** | Items needing operator attention (e.g. pending reads, flags) *if* API supports listing; else link-out to existing survey admin routes. | Medium - scope to what API already exposes | P1 |
| **Activity / feed** | **Operator activity stream** | Append-only list: moderation decisions, admin config changes (if auditable), sync-session milestones - **no** raw user PII beyond what admin already sees. | Medium - needs event source or narrow log tail | P1-P2 |
| **Security / trust** | **Alignment & policy status** | Surfaces already guarded by `x-alignment-context-key` / moderation auth purity; show **status** and **last action**, not a full SIEM. | Medium | P1 |
| **Security (supporting)** | **Capabilities / read-gate health** | Short panel: `survey-read-gate` / capabilities vs prod smoke expectations (echo verify scripts). | Low if read-only | P2 |
| **"Agents"** | **Jobs & automation (CI / scheduled)** | **Not** arbitrary agents - link or embed **status** of known jobs: last E2E, last prod smoke, workflow badges (or deep link to GitHub). Keeps "activity" honest without fake agent rows. | Low | P1 |
| **Local AI setup** | **Local runtime health** | Read-only Windows-first checks for SQLite path, data dir writability, Ollama reachability/models, Docker note, and next action. | Low if no browser-triggered shell | P1 |
| **Local AI workflows** | **Workflow recipes** | Curated local-only recipe metadata; execution deferred until CLI/MCP parity exists. | Low if read-only | P1 |
| **Local AI activity** | **Local AI activity log** | JSONL-backed local event adapter with bootstrap fallback; no write path in first slice. | Low-Medium depending on future event contents | P1 |
| **Costs** | **Defer or omit** | OpenGrimoire may not have first-class cost telemetry; do not block cockpit on this. Optional later: API usage if product adds it. | N/A | P3+ |
| **Recurring ops** | **Runbook / schedule summary** | Human-readable table: workflow name, schedule, owner (see **OG-MC-02**); can be a **static** panel fed from config or doc link until API exists. | Low | P1 |

---

## Recommended first layout (P0 / P1)

1. **Column A - Queue:** Moderation queue (dominant width); same actions as today (no new bypass).
2. **Column B - Context:** Selected item detail (quality text, history); ensure one-screen operator flow.
3. **Row or tab - Activity:** Condensed "last N events" (moderation + critical admin) once event source exists; otherwise placeholder with link to runbooks.
4. **Tab - Health:** Capabilities / read-gate / last smoke (read-only).
5. **Tab - Jobs:** CI / scheduled job status (links or minimal API).

**A2UI:** If AdminPanel is the extensibility point, treat each logical block above as a widget with the same auth as `/admin` and explicit `data-testid` for E2E.

---

## Panel contracts (required)

Use the template in [operator-cockpit-panel-contract-template.md](operator-cockpit-panel-contract-template.md), then fill one contract per panel under `docs/integrations/panel-contracts/`:

- [OG-OC-02 moderation queue panel](panel-contracts/OG-OC-02-moderation-queue.md)
- [OG-OC-03 selected item detail panel](panel-contracts/OG-OC-03-selected-item-detail.md)
- [OG-OC-04 operator activity panel](panel-contracts/OG-OC-04-operator-activity.md)
- [OG-OC-05 health panel](panel-contracts/OG-OC-05-health.md)
- [OG-OC-06 jobs panel](panel-contracts/OG-OC-06-jobs.md)
- [OG-OC-07 capabilities / read-gate health panel](panel-contracts/OG-OC-07-capabilities-read-gate-health.md)
- [OG-OC-08 jobs and automation panel](panel-contracts/OG-OC-08-jobs-automation.md)
- [OG-OC-09 recurring ops runbook panel](panel-contracts/OG-OC-09-recurring-ops-runbook.md)
- [OG-OC-14 local runtime health panel](panel-contracts/OG-OC-14-local-runtime-health.md)
- [OG-OC-15 workflow recipes panel](panel-contracts/OG-OC-15-workflow-recipes.md)
- [OG-OC-16 local AI activity log panel](panel-contracts/OG-OC-16-local-ai-activity-log.md)

---

## Out of scope (stay outside the web GUI)

- Full MCP / skills registry (portfolio harness) - link only.
- Raw vault or LLM prompt editing as a panel - keep in Obsidian / harness; use SCP via `docs/agent/SCP_LLM_INGESTION_CHECKLIST.md`.
- Multi-tenant admin until MC-07 is explicitly approved.

---

## Implementation notes

- **Data contract first:** each panel must document route(s), role, PII class, read vs write, feature flag, and rollback before implementation.
- **Read-only first** for new aggregation panels; apply SDL-04 least-privilege review for any trust/telemetry centralization.
- **E2E:** extend `e2e/admin-*.spec.ts` patterns; one panel = one critical path where possible.

## Changelog

| Date | Change |
|------|--------|
| 2026-04-29 | Added standalone-repo operator cockpit panel map and required contract links |
