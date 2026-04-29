# OG-OC-08 Panel Contract — Jobs and Automation

## Contract metadata

- **Panel ID:** `OG-OC-08`
- **Panel name:** `Jobs and Automation`
- **Owner role:** `OpenGrimoire admin operator`
- **Feature flag:** `OG_OPERATOR_JOBS_PANEL`
- **Rollback:** Hide `Jobs` tab and remove `/api/admin/cockpit/jobs` calls from admin cockpit.

## Surface and route contract

| Field | Value |
|-------|-------|
| UI route(s) | `/admin` (`Jobs` tab) |
| API route(s) | `/api/admin/cockpit/jobs` |
| HTTP methods | `GET` |
| Read vs write | `Read` |
| Auth role / policy | Admin session gate for link aggregation payload |

## Data and security contract

| Field | Value |
|-------|-------|
| PII class (`none`/`internal`/`sensitive`) | `none` |
| Data sources | GitHub Actions and workflow links only (no synthetic status rows) |
| Retention/logging notes | Link-only data, no new storage |
| Least-privilege guardrails | No secrets, no workflow input payloads, no mutable controls |
| HITL/SCP impact | None |

## Verification contract

| Check | Status / Evidence |
|-------|-------------------|
| Contract test updated | `e2e/admin-moderation.spec.ts` includes jobs-tab assertions |
| E2E path (`data-testid` + flow) | `admin-right-tab-jobs` -> `admin-jobs-panel` -> `admin-jobs-link-e2e` + `admin-jobs-link-prod-smoke` + `admin-jobs-link-gha` |
| Attestation checklist A-E | No new write surface |
| KPI instrumentation updated | Not applicable |

## Notes

- Related docs:
  - `docs/integrations/operator-cockpit-panels.md`
  - `.github/workflows/survey-visualization-prod-smoke.yml`
