# OG-OC-06 Panel Contract — Jobs

## Contract metadata

- **Panel ID:** `OG-OC-06`
- **Panel name:** `Jobs and Automation Status`
- **Owner role:** `OpenGrimoire admin operator`
- **Feature flag:** `OG_OPERATOR_JOBS_PANEL`
- **Rollback:** Disable `OG_OPERATOR_JOBS_PANEL`; revert to runbook/GitHub links.

## Surface and route contract

| Field | Value |
|-------|-------|
| UI route(s) | `/admin` (jobs tab) |
| API route(s) | Link-only v1; optional future `/api/admin/jobs/status` |
| HTTP methods | `GET` |
| Read vs write | `Read` |
| Auth role / policy | Admin shell policy for embedded status; external links use GitHub auth |

## Data and security contract

| Field | Value |
|-------|-------|
| PII class (`none`/`internal`/`sensitive`) | `none` |
| Data sources | GitHub workflow status + documented recurring operations metadata |
| Retention/logging notes | No new PII or event retention in v1 |
| Least-privilege guardrails | Show status summaries only; no secrets or workflow inputs |
| HITL/SCP impact | None for link-only/read-only status |

## Verification contract

| Check | Status / Evidence |
|-------|-------------------|
| Contract test updated | Pending |
| E2E path (`data-testid` + flow) | `admin-jobs-panel` shows last run status or fallback links |
| Attestation checklist A-E | Pending |
| KPI instrumentation updated | Pending |

## Notes

- Related docs:
  - `docs/integrations/operator-cockpit-panels.md`
  - `docs/integrations/mission-control-alignment.md`
  - `docs/integrations/operator-cockpit-panel-contract-template.md`
