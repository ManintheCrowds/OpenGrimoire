# OG-OC-04 Panel Contract — Operator Activity

## Contract metadata

- **Panel ID:** `OG-OC-04`
- **Panel name:** `Operator Activity Stream`
- **Owner role:** `OpenGrimoire admin operator`
- **Feature flag:** `OG_OPERATOR_ACTIVITY_PANEL`
- **Rollback:** Remove activity tab from right-column tabset and revert `/api/admin/activity` usage.

## Surface and route contract

| Field | Value |
|-------|-------|
| UI route(s) | `/admin` (`Activity` tab in right-column tabset) |
| API route(s) | `/api/admin/activity` |
| HTTP methods | `GET` |
| Read vs write | `Read` |
| Auth role / policy | `requireOpenGrimoireAdminRoute` via admin activity route |

## Data and security contract

| Field | Value |
|-------|-------|
| PII class (`none`/`internal`/`sensitive`) | `none` |
| Data sources | Thin activity adapter payload (`mode`, `status`, `summary`, `runbookPath`) |
| Retention/logging notes | No event persistence added; adapter is read-only and non-canonical |
| Least-privilege guardrails | Admin-auth required; no raw moderation/user payload exposed |
| HITL/SCP impact | None in current adapter mode |

## Verification contract

| Check | Status / Evidence |
|-------|-------------------|
| Contract test updated | `e2e/admin-moderation.spec.ts` updated for tab-switch + activity panel assertions |
| E2E path (`data-testid` + flow) | `admin-right-tab-activity` -> `admin-right-tabpanel-activity` -> `admin-activity-placeholder` + `admin-activity-runbook-link` |
| Attestation checklist A-E | No auth/PII posture change |
| KPI instrumentation updated | Not applicable for placeholder |

## Notes

- Related docs:
  - `docs/integrations/operator-cockpit-panels.md`
  - `docs/integrations/mission-control-alignment.md`
  - `docs/integrations/operator-cockpit-panel-contract-template.md`
