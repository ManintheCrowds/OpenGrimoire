# OG-OC-03 Panel Contract — Selected Item Detail

## Contract metadata

- **Panel ID:** `OG-OC-03`
- **Panel name:** `Selected Moderation Item Detail`
- **Owner role:** `OpenGrimoire admin operator`
- **Feature flag:** `OG_OPERATOR_COCKPIT_P0`
- **Rollback:** Disable `OG_OPERATOR_COCKPIT_P0` to remove detail pane and keep existing moderation flow.

## Surface and route contract

| Field | Value |
|-------|-------|
| UI route(s) | `/admin` |
| API route(s) | `/api/admin/moderation-queue`, `/api/admin/moderation/{responseId}` |
| HTTP methods | `GET`, `PATCH` |
| Read vs write | `Read + Write` |
| Auth role / policy | `requireOpenGrimoireAdminRoute` session gate |

## Data and security contract

| Field | Value |
|-------|-------|
| PII class (`none`/`internal`/`sensitive`) | `internal` |
| Data sources | Selected queue item fields + moderation mutation endpoint |
| Retention/logging notes | Uses existing moderation persistence and audit trail behavior |
| Least-privilege guardrails | No new bypass route; same admin-only write path as current UI |
| HITL/SCP impact | HITL unchanged; SCP unchanged (no new LLM sink) |

## Verification contract

| Check | Status / Evidence |
|-------|-------------------|
| Contract test updated | `e2e/admin-moderation.spec.ts` updated for two-column selection/detail assertions |
| E2E path (`data-testid` + flow) | `admin-moderation-shell` -> queue row select -> `moderation-detail-pane` + `moderation-detail-selected-id` + approve/reject controls |
| Attestation checklist A-E | No new auth surface; existing admin session gate preserved |
| KPI instrumentation updated | Not changed in this slice |

## Notes

- Related docs:
  - `docs/integrations/operator-cockpit-panels.md`
  - `docs/integrations/mission-control-alignment.md`
  - `docs/integrations/operator-cockpit-panel-contract-template.md`
