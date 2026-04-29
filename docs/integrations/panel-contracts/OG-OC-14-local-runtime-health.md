# OG-OC-14 Panel Contract — Local Runtime Health

## Contract metadata

- **Panel ID:** `OG-OC-14`
- **Panel name:** `Local Runtime Health`
- **Owner role:** `Solo Windows developer / OpenGrimoire admin operator`
- **Feature flag:** `OG_LOCAL_AI_COCKPIT`
- **Rollback:** Hide the Local AI tab and remove calls to `/api/admin/cockpit/local-ai/health`; no existing moderation behavior changes.

## Surface and route contract

| Field | Value |
|-------|-------|
| UI route(s) | `/admin` (`Local AI` tab) |
| API route(s) | `/api/admin/cockpit/local-ai/health` |
| HTTP methods | `GET` |
| Read vs write | `Read` |
| Auth role / policy | `requireOpenGrimoireAdminRoute` |

## Data and security contract

| Field | Value |
|-------|-------|
| PII class (`none`/`internal`/`sensitive`) | `internal` |
| Data sources | Process env, local DB path, data directory filesystem status, Ollama `/api/tags` metadata |
| Retention/logging notes | No event retention added by this route; it returns a point-in-time local health snapshot |
| Least-privilege guardrails | Read-only checks only; no shell execution, Docker control, model pulls, or workflow execution |
| HITL/SCP impact | None for read-only status; future write actions require CLI/MCP parity and human gate |

## Verification contract

| Check | Status / Evidence |
|-------|-------------------|
| Contract test updated | `src/lib/local-ai/cockpit.test.ts` covers SQLite/Ollama soft-fail behavior |
| E2E path (`data-testid` + flow) | `admin-right-tab-local-ai` -> `admin-right-tabpanel-local-ai` -> `admin-local-ai-panel` |
| Attestation checklist A-E | Auth preserved; no PII expansion beyond local path/status metadata; read-only route |
| KPI instrumentation updated | Deferred until canonical local AI activity events exist |

## Notes

- Related docs:
  - `docs/plans/2026-04-29-solo-windows-local-ai-setup.md`
  - `docs/integrations/operator-cockpit-panels.md`
  - `docs/integrations/mission-control-alignment.md`
  - `docs/integrations/operator-cockpit-panel-contract-template.md`
