# OG-OC-16 Panel Contract — Local AI Activity Log

## Contract metadata

- **Panel ID:** `OG-OC-16`
- **Panel name:** `Local AI Activity Log`
- **Owner role:** `Solo Windows developer / OpenGrimoire admin operator`
- **Feature flag:** `OG_LOCAL_AI_COCKPIT`
- **Rollback:** Hide the Activity Log tab and stop calling `/api/admin/cockpit/local-ai/activity`.

## Surface and route contract

| Field | Value |
|-------|-------|
| UI route(s) | `/admin` (`Activity Log` tab) |
| API route(s) | `/api/admin/cockpit/local-ai/activity` |
| HTTP methods | `GET` |
| Read vs write | `Read` |
| Auth role / policy | `requireOpenGrimoireAdminRoute` |

## Data and security contract

| Field | Value |
|-------|-------|
| PII class (`none`/`internal`/`sensitive`) | `internal` |
| Data sources | Local JSONL activity adapter, default `data/local-ai-activity.jsonl` |
| Retention/logging notes | Reads local append-only events when present; this route does not append events |
| Least-privilege guardrails | Skips malformed lines, returns summary metadata, and avoids raw command execution |
| HITL/SCP impact | Future ingestion of external model output should pass SCP before persistence |

## Verification contract

| Check | Status / Evidence |
|-------|-------------------|
| Contract test updated | `src/lib/local-ai/cockpit.test.ts` covers missing log fallback and malformed JSONL handling |
| E2E path (`data-testid` + flow) | `admin-right-tab-local-activity` -> `admin-right-tabpanel-local-activity` -> `admin-local-activity-panel` |
| Attestation checklist A-E | Auth preserved; read-only adapter; no user content exposure beyond local operator log |
| KPI instrumentation updated | Deferred until workflow execution writes canonical local AI events |

## Notes

- Related docs:
  - `docs/plans/2026-04-29-solo-windows-local-ai-setup.md`
  - `docs/integrations/operator-cockpit-panels.md`
  - `docs/integrations/mission-control-alignment.md`
  - `docs/integrations/operator-cockpit-panel-contract-template.md`
