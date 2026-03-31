# Discovery stability gate (Phase A)

**Purpose:** Define when the public HTTP discovery story is **stable** enough to treat downstream work (e.g. Mission Control mirror UX, client generators) as safe to build on.

**Normative sources:**

- [ARCHITECTURE_REST_CONTRACT.md](../ARCHITECTURE_REST_CONTRACT.md) — entity matrix and auth behavior.
- `GET /api/capabilities` — hand-maintained manifest ([src/app/api/capabilities/route.ts](../../src/app/api/capabilities/route.ts)).
- `GET /api/openapi` / `GET /api/openapi.json` — partial OpenAPI 3 ([src/lib/openapi/openapi-document.ts](../../src/lib/openapi/openapi-document.ts)).
- [docs/api/ROUTE_INDEX.json](../api/ROUTE_INDEX.json) — generated file index (`npm run generate:route-index`).

**CI checks (run via `npm run verify`):**

| Script | Ensures |
|--------|---------|
| `verify:capabilities` | Every `**/api/**/route.ts` path appears in `CAPABILITIES.routes` |
| `verify:openapi` | Every OpenAPI path exists in capabilities; required public/agent paths are listed in the partial spec |
| `verify:route-index` | Generated `ROUTE_INDEX.json` matches disk |

**Gate (stable when):**

1. `npm run verify` passes (including the three checks above).
2. `GET /api/capabilities` and `GET /api/openapi.json` return JSON consistent with the contract (no undocumented agent-facing routes claimed without a matching row in the entity matrix).

**Non-goals:** This gate does **not** assert full JSON Schema for bodies, admin BFF coverage in OpenAPI, or model “introspection” semantics. See portfolio research note on VGEL-style interpretability vs. product APIs (Arc_Forge `ObsidianVault/research/2026-03-31-introspection-rest-mission-control-sources.md`).
