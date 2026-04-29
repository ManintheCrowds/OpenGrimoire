# OG-OC-09 Panel Contract — Recurring Ops / Runbook Table

## Contract metadata

- **Panel ID:** `OG-OC-09`
- **Panel name:** `Recurring Operations`
- **Owner role:** `OpenGrimoire admin operator`
- **Feature flag:** `OG_OPERATOR_OPS_PANEL`
- **Rollback:** Hide `Ops` tab and remove `/api/admin/cockpit/ops` panel payload usage.

## Surface and route contract

| Field | Value |
|-------|-------|
| UI route(s) | `/admin` (`Ops` tab) |
| API route(s) | `/api/admin/cockpit/ops` |
| HTTP methods | `GET` |
| Read vs write | `Read` |
| Auth role / policy | Admin session gate |

## Data and security contract

| Field | Value |
|-------|-------|
| PII class (`none`/`internal`/`sensitive`) | `none` |
| Data sources | Static recurring operations metadata and runbook link |
| Retention/logging notes | No new persistence |
| Least-privilege guardrails | Table shows workflow metadata only (workflow/schedule/owner/evidence path) |
| HITL/SCP impact | None |

## Verification contract

| Check | Status / Evidence |
|-------|-------------------|
| Contract test updated | `e2e/admin-moderation.spec.ts` includes ops-tab assertions |
| E2E path (`data-testid` + flow) | `admin-right-tab-ops` -> `admin-ops-panel` -> `admin-ops-row-survey-read-gate-prod-smoke` + `admin-ops-runbook-link` |
| Attestation checklist A-E | No new write surface |
| KPI instrumentation updated | Not applicable |

## Notes

- Runbook target path:
  - `docs/runbooks/recurring-operations.md`
- Related docs:
  - `docs/integrations/mission-control-alignment.md` (OG-MC-02 linkages)
