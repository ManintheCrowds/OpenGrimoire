# OG-OC-15 Panel Contract — Workflow Recipes

## Contract metadata

- **Panel ID:** `OG-OC-15`
- **Panel name:** `Workflow Recipes`
- **Owner role:** `Solo Windows developer / OpenGrimoire admin operator`
- **Feature flag:** `OG_LOCAL_AI_COCKPIT`
- **Rollback:** Hide the Recipes tab and stop calling `/api/admin/cockpit/workflow-recipes`.

## Surface and route contract

| Field | Value |
|-------|-------|
| UI route(s) | `/admin` (`Recipes` tab) |
| API route(s) | `/api/admin/cockpit/workflow-recipes` |
| HTTP methods | `GET` |
| Read vs write | `Read` |
| Auth role / policy | `requireOpenGrimoireAdminRoute` |

## Data and security contract

| Field | Value |
|-------|-------|
| PII class (`none`/`internal`/`sensitive`) | `none` |
| Data sources | Static curated recipe metadata in `src/lib/local-ai/workflow-recipes.ts` |
| Retention/logging notes | No run history or artifacts persisted by this route |
| Least-privilege guardrails | Recipe metadata only; no browser-triggered local command execution |
| HITL/SCP impact | Future execution buttons require agent parity, bounded verification, and human gate for risky operations |

## Verification contract

| Check | Status / Evidence |
|-------|-------------------|
| Contract test updated | `src/lib/local-ai/cockpit.test.ts` validates first local agent recipe metadata |
| E2E path (`data-testid` + flow) | `admin-right-tab-recipes` -> `admin-right-tabpanel-recipes` -> `admin-recipe-first-local-agent` |
| Attestation checklist A-E | Auth preserved; no write action; no raw prompt/vault editing panel |
| KPI instrumentation updated | Deferred until recipe execution events are implemented |

## Notes

- Related docs:
  - `docs/plans/2026-04-29-solo-windows-local-ai-setup.md`
  - `docs/integrations/operator-cockpit-panels.md`
  - `docs/integrations/mission-control-alignment.md`
  - `docs/integrations/operator-cockpit-panel-contract-template.md`
