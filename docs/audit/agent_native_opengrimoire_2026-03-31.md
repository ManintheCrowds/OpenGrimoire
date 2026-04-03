# Agent-native audit — OpenGrimoire snapshot (2026-03-31)

**Revision:** 2026-03-31 — Refresh after clarification queue ship, `verify:route-index`, OpenAPI/capabilities E2E, survey bootstrap token. **Canonical gap report:** [`AGENT_NATIVE_AUDIT_OPENGRIMOIRE.md`](../AGENT_NATIVE_AUDIT_OPENGRIMOIRE.md) (full narrative + evidence).

**Normative:** [`ARCHITECTURE_REST_CONTRACT.md`](../ARCHITECTURE_REST_CONTRACT.md).

---

## Part A — OpenGrimoire (app)

### Summary table

| # | Principle | Score | Approx. % | Status |
|---|-----------|-------|-------------|--------|
| 1 | Action parity | 6 / 12 | 50% | Partial |
| 2 | Tools as primitives | 7 / 10 | 70% | Partial |
| 3 | Context injection | 3 / 8 | 38% | Needs work |
| 4 | Shared workspace | 8 / 10 | 80% | Excellent |
| 5 | CRUD completeness | 7 / 8 | 88% | Partial |
| 6 | UI integration | 5 / 10 | 50% | Partial |
| 7 | Capability discovery | 5 / 7 | 71% | Partial |
| 8 | Prompt-native features | 2 / 10 | 20% | Needs work |

**Process:** API or discovery changes → update [`src/app/api/capabilities/route.ts`](../../src/app/api/capabilities/route.ts) and contract per [CONTRIBUTING](../../CONTRIBUTING.md); run `npm run verify`.

**Verification:** `npm run verify` passed locally at OpenGrimoire repo root on **2026-03-31** during this audit refresh (lint, type-check, unit tests, `verify:capabilities`, `verify:openapi`, `verify:route-index`). Re-run before release if the branch drifted.

---

## Part B — OpenHarness (optional cross-repo alignment)

Not scored here. For harness scripts, skills, and handoff parity vs this audit’s dimensions, see sibling repo **OpenHarness:** [`HARNESS_AUDIT_ALIGNMENT.md`](../../../OpenHarness/docs/HARNESS_AUDIT_ALIGNMENT.md).
