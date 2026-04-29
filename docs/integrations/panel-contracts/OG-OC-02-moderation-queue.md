# OG-OC-02 Panel Contract — Moderation Queue

## Contract metadata

- **Panel ID:** `OG-OC-02`
- **Panel name:** `Moderation Queue`
- **Owner role:** `OpenGrimoire admin operator`
- **Feature flag:** `OG_OPERATOR_COCKPIT_P0`
- **Rollback:** Disable `OG_OPERATOR_COCKPIT_P0` to return `/admin` to pre-cockpit list-only rendering.

## Surface and route contract

| Field | Value |
|-------|-------|
| UI route(s) | `/admin` |
| API route(s) | `/api/admin/moderation-queue` |
| HTTP methods | `GET` |
| Read vs write | `Read` |
| Auth role / policy | `requireOpenGrimoireAdminRoute` session gate |

## Data and security contract

| Field | Value |
|-------|-------|
| PII class (`none`/`internal`/`sensitive`) | `internal` |
| Data sources | Survey moderation queue repository |
| Retention/logging notes | No new persistence; existing admin/API logs only |
| Least-privilege guardrails | Queue data remains admin-scoped; no privilege broadening |
| HITL/SCP impact | HITL unchanged; no new LLM ingestion in this panel |

## Verification contract

| Check | Status / Evidence |
|-------|-------------------|
| Contract test updated | Pending |
| E2E path (`data-testid` + flow) | `admin-moderation-shell` + `moderation-queue-item-{id}` selection |
| Attestation checklist A-E | Pending |
| KPI instrumentation updated | Pending |

## Notes

- Related docs:
  - `docs/integrations/operator-cockpit-panels.md`
  - `docs/integrations/mission-control-alignment.md`
  - `docs/integrations/operator-cockpit-panel-contract-template.md`
