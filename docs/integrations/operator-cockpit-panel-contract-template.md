# OpenGrimoire Operator Cockpit Panel Contract Template

Use this template before implementing or promoting any `OG-OC-*` panel task.

## Contract metadata

- **Panel ID:** `OG-OC-XX`
- **Panel name:** `<name>`
- **Owner role:** `<role>`
- **Feature flag:** `<flag name>`
- **Rollback:** `<how to disable safely>`

## Surface and route contract

| Field | Value |
|-------|-------|
| UI route(s) | |
| API route(s) | |
| HTTP methods | |
| Read vs write | |
| Auth role / policy | |

## Data and security contract

| Field | Value |
|-------|-------|
| PII class (`none`/`internal`/`sensitive`) | |
| Data sources | |
| Retention/logging notes | |
| Least-privilege guardrails | |
| HITL/SCP impact | |

## Verification contract

| Check | Status / Evidence |
|-------|-------------------|
| Contract test updated | |
| E2E path (`data-testid` + flow) | |
| Attestation checklist A-E | |
| KPI instrumentation updated | |

## Notes

- Related docs:
  - `docs/integrations/operator-cockpit-panels.md`
  - `docs/integrations/mission-control-alignment.md`
  - `local-proto/docs/integrations/mission-control/SECURITY_DECISION_LOG.md`
