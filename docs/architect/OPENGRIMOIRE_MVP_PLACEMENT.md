# Tech-lead placement: OpenGrimoire MVP artifacts (dry-run)

**Date:** 2026-03-24  
**Contract:** Design-only paths; implementation optional in follow-on PRs.  
**Scope doc:** [scope_opengrimoire_mvp_agent_native.md](../scope_opengrimoire_mvp_agent_native.md).

---

## Placement table

| Topic | Path | Rationale |
|-------|------|-----------|
| Product scope / AC | [docs/scope_opengrimoire_mvp_agent_native.md](../scope_opengrimoire_mvp_agent_native.md) | Single source for MVP + AC; lives next to REST contract. |
| Operator GUI runbook | [docs/OPERATOR_GUI_RUNBOOK.md](../OPERATOR_GUI_RUNBOOK.md) | Human-first name; link from README + AGENT_INTEGRATION. |
| Monitoring (OpenAtlas) | [docs/MONITORING_OPENATLAS.md](../MONITORING_OPENATLAS.md) | App/API/process signals; not orchestrator internals. |
| Agent-native audit (this engagement) | [docs/audit/agent_native_opengrimoire_2026-03-24.md](../audit/agent_native_opengrimoire_2026-03-24.md) | Dated audit; prior [AGENT_NATIVE_AUDIT_OPENATLAS.md](../AGENT_NATIVE_AUDIT_OPENATLAS.md) remains historical reference. |
| Executive pack | [docs/audit/OPENGRIMOIRE_MVP_EXECUTIVE_PACK_2026-03-24.md](../audit/OPENGRIMOIRE_MVP_EXECUTIVE_PACK_2026-03-24.md) | One-page rollup for operators. |
| Critic artifact | [docs/audit/critic_report_agent_native_2026-03-24.json](../audit/critic_report_agent_native_2026-03-24.json) | Machine-readable pass/fail. |
| OpenHarness operator flow | Repo sibling: `OpenHarness/docs/HANDOFF_FLOW.md` | Canonical handoff narrative; cross-link MiscRepos `HANDOFF_FLOW` for full procedure. |
| Portfolio automation / MCP | MiscRepos `local-proto/docs/`, `.cursor/scripts/` | Out of OpenAtlas tree; pointer only in monitoring doc. |

---

## E2E / verification map

| Artifact | Role |
|----------|------|
| [playwright.config.ts](../../playwright.config.ts) | Base URL 3001, webServer `npm run dev`, alignment insecure local flag for E2E. |
| [e2e/context-atlas.spec.ts](../../e2e/context-atlas.spec.ts) | Context-atlas load, table tab, mocked API. |
| [e2e/smoke.spec.ts](../../e2e/smoke.spec.ts) | Broad smoke. |
| [e2e/survey.spec.ts](../../e2e/survey.spec.ts) | Survey route. |
| [ARCHITECTURE_REST_CONTRACT.md](../ARCHITECTURE_REST_CONTRACT.md) | Normative matrix for REST vs UI. |

**MVP stretch:** Add spec for `/capabilities` JSON snapshot or `/admin/alignment` happy path **only if** Supabase placeholders remain acceptable in CI (see playwright env).

---

## A2UI / frontend-design vertical slice

**Slice:** `/capabilities` (reads `GET /api/capabilities`) + alignment operator path documentation—not a redesign of `BrainMapGraph` D3 in MVP.

- **Guidance:** MiscRepos [A2UI_FRONTEND_DESIGN_GUIDANCE.md](../../../MiscRepos/.cursor/docs/A2UI_FRONTEND_DESIGN_GUIDANCE.md) (portfolio canonical).
- **Components:** [src/app/capabilities/page.tsx](../../src/app/capabilities/page.tsx) — ensure tokens/semantic headings if touched; full A2UI compliance is **P1** unless scope expands.

---

## Guardrail

Do **not** change public API shapes in response to audit alone until [scope_opengrimoire_mvp_agent_native.md](../scope_opengrimoire_mvp_agent_native.md) AC explicitly requires new agent write surfaces.
