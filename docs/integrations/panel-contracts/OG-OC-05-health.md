# OG-OC-05 Panel Contract — Health

## Contract metadata

- **Panel ID:** `OG-OC-05`
- **Panel name:** `Capabilities and Read-Gate Health`
- **Owner role:** `OpenGrimoire admin operator`
- **Feature flag:** `OG_OPERATOR_HEALTH_PANEL`
- **Rollback:** Disable `OG_OPERATOR_HEALTH_PANEL`; keep health indicators in existing locations only.

## Surface and route contract

| Field | Value |
|-------|-------|
| UI route(s) | `/admin` (health tab) |
| API route(s) | `/api/capabilities` (+ optional admin health aggregate endpoint) |
| HTTP methods | `GET` |
| Read vs write | `Read` |
| Auth role / policy | Preserve existing capability/read-gate auth policy; admin shell remains session-gated |

## Data and security contract

| Field | Value |
|-------|-------|
| PII class (`none`/`internal`/`sensitive`) | `none` |
| Data sources | Capabilities API + smoke/verification metadata |
| Retention/logging notes | Read-only status data; no new retention |
| Least-privilege guardrails | Health data excludes user-level content |
| HITL/SCP impact | None for baseline read-only health |

## Verification contract

| Check | Status / Evidence |
|-------|-------------------|
| Contract test updated | Tabbed-right-column contract now validated in `e2e/admin-moderation.spec.ts` |
| E2E path (`data-testid` + flow) | Right-column tab container asserted (`admin-right-tabs`) while health content remains deferred |
| Attestation checklist A-E | Unchanged for health payload (no new health endpoint/write path in this slice) |
| KPI instrumentation updated | Not changed |

## Notes

- Related docs:
  - `docs/integrations/operator-cockpit-panels.md`
  - `docs/integrations/mission-control-alignment.md`
  - `docs/integrations/operator-cockpit-panel-contract-template.md`
  - `docs/integrations/panel-contracts/OG-OC-04-operator-activity.md` (implemented placeholder panel in this pass)
