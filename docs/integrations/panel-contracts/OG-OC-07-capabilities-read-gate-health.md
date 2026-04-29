# OG-OC-07 Panel Contract — Capabilities / Read-Gate Health

## Contract metadata

- **Panel ID:** `OG-OC-07`
- **Panel name:** `Capabilities and Read-Gate Health`
- **Owner role:** `OpenGrimoire admin operator`
- **Feature flag:** `OG_OPERATOR_HEALTH_PANEL`
- **Rollback:** Hide `Health` tab and remove `/api/admin/cockpit/health` calls from admin cockpit.

## Surface and route contract

| Field | Value |
|-------|-------|
| UI route(s) | `/admin` (`Health` tab) |
| API route(s) | `/api/admin/cockpit/health`, `/api/capabilities` |
| HTTP methods | `GET` |
| Read vs write | `Read` |
| Auth role / policy | Admin session gate for panel aggregate endpoint; capabilities manifest remains public read |

## Data and security contract

| Field | Value |
|-------|-------|
| PII class (`none`/`internal`/`sensitive`) | `none` |
| Data sources | Static read-gate expectation metadata + capabilities manifest link |
| Retention/logging notes | Read-only metadata; no persistence added |
| Least-privilege guardrails | No user-level survey payload in panel output |
| HITL/SCP impact | None |

## Verification contract

| Check | Status / Evidence |
|-------|-------------------|
| Contract test updated | `e2e/admin-moderation.spec.ts` includes health-tab assertions |
| E2E path (`data-testid` + flow) | `admin-right-tab-health` -> `admin-health-panel` -> `admin-health-capabilities-link` + `admin-health-read-gate-command` |
| Attestation checklist A-E | No new write surface |
| KPI instrumentation updated | Not applicable |

## Notes

- Related docs:
  - `docs/integrations/operator-cockpit-panels.md`
  - `docs/admin/SURVEY_READ_GATING_RUNBOOK.md`
  - `scripts/survey-read-gate-prod-smoke.mjs`
