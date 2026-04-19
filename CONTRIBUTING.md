# Contributing to OpenGrimoire

## Pre-push / local verification

Before opening or updating a PR that touches **`src/`**, **`package.json`**, **API routes**, **capabilities**, **OpenAPI**, or **agent-facing docs** under `docs/`:

1. From this repository root, run **`npm run verify`** (lint → type-check → unit tests → `verify:capabilities` → `verify:openapi` → `verify:route-index` → `verify:moderation-auth` → `verify:operator-probes-auth` → **`verify:admin-panel-a2ui`**). Same composition as [docs/engineering/DEPLOY_AND_VERIFY.md](docs/engineering/DEPLOY_AND_VERIFY.md).

### AdminPanel and A2UI naming (OG-GUI-A2)

PRs that touch **`src/components/AdminPanel/`** must not introduce **decorative-only** React component names (e.g. `Wrapper`, `Container` as the exported or file-level component identifier). CI enforces a conservative denylist via **`npm run verify`** → `scripts/verify-admin-panel-a2ui-monitor.mjs`. Prefer domain-oriented names (`ModerationQueueRow`, `AdminToolbar`, …).

When product scope adds **agent-rendered or declarative admin** (A2UI), extend that surface with catalog semantics and align with **OA-OG-5** (deferred: A2UI on `/capabilities` in harness `pending_tasks`). Cross-repo design notes: MiscRepos **`.cursor/docs/A2UI_FRONTEND_DESIGN_GUIDANCE.md`** (sibling clone).
2. When the same change set touches **MiscRepos** (or workspace) **rules, skills, or `.cursor` policy files** in a sibling clone, run harness checksum from **MiscRepos** root:  
   `python .cursor/scripts/checksum_integrity.py --verify --strict`  
   See [MiscRepos `.cursor/docs/COMMANDS_README.md`](../../MiscRepos/.cursor/docs/COMMANDS_README.md) (checksum section). Paths assume `Documents/GitHub/OpenGrimoire` and `Documents/GitHub/MiscRepos` as siblings.

E2E: use `npm run verify:e2e` or `npm run test:e2e` when flows need browser coverage (see **Tests** below).

## API and agent contract changes

OpenGrimoire follows a **strict public REST contract** for domain entities. Before merging changes that add or modify routes under `src/app/api/`:

1. Read [docs/ARCHITECTURE_REST_CONTRACT.md](docs/ARCHITECTURE_REST_CONTRACT.md).
2. Update the **entity × HTTP × auth matrix** in that document (same PR as the code).
3. If the change affects alignment context, update [docs/agent/ALIGNMENT_CONTEXT_API.md](docs/agent/ALIGNMENT_CONTEXT_API.md) and any CLI usage in [scripts/alignment-context-cli.mjs](scripts/alignment-context-cli.mjs) if applicable.
4. Update [src/app/api/capabilities/route.ts](src/app/api/capabilities/route.ts) when adding or changing API routes (keep in sync with the matrix in [docs/ARCHITECTURE_REST_CONTRACT.md](docs/ARCHITECTURE_REST_CONTRACT.md)).
5. Run `npm run verify:capabilities` to confirm the capabilities manifest matches every `route.ts` under `src/app/api/`.
6. Run `node scripts/generate-route-index.mjs` and commit [docs/api/ROUTE_INDEX.json](docs/api/ROUTE_INDEX.json) when routes change; `npm run verify:route-index` must pass.
7. Update [src/lib/openapi/openapi-document.ts](src/lib/openapi/openapi-document.ts) when adding public API paths (partial OpenAPI).
8. Run `npm run verify:openapi` so partial OpenAPI paths stay aligned with `CAPABILITIES.routes` (see [docs/engineering/DISCOVERY_STABILITY_GATE.md](docs/engineering/DISCOVERY_STABILITY_GATE.md)).
9. Consider updating [docs/OPENGRIMOIRE_SYSTEMS_INVENTORY.md](docs/OPENGRIMOIRE_SYSTEMS_INVENTORY.md) if application surfaces or scripts change.
10. Update [docs/AGENT_TOOL_MANIFEST.md](docs/AGENT_TOOL_MANIFEST.md) when adding an agent-visible HTTP route or changing how MCP/harness tools map to this repo.
11. Add a **changelog** entry under **[Unreleased]** in [CHANGELOG.md](CHANGELOG.md) when the change is user- or integrator-visible (especially **REST contract matrix** or **`/api/capabilities`** changes). For tagged releases, mirror the relevant bullets into **GitHub Releases** for [`ManintheCrowds/OpenGrimoire`](https://github.com/ManintheCrowds/OpenGrimoire/releases). The PR description **Summary** may duplicate the changelog line for reviewers. Policy: [docs/engineering/OPENGRIMOIRE_NAMING_AND_URLS.md](docs/engineering/OPENGRIMOIRE_NAMING_AND_URLS.md).

**Grep-driven action-parity inventory (ripgrep recipes and harness MCP doc pointers):** [docs/ACTION_PARITY_FILE_INDEX.md](docs/ACTION_PARITY_FILE_INDEX.md).

## Code review — agent harness (meta-principles)

For PRs that add **MCP tools**, **new API routes**, **agent-facing docs**, or **multi-step workflows**, reviewers should align with the **Phase 1** guardrails in [docs/research/AGENT_HARNESS_IMPROVEMENT_PROGRAM_2026-04-03.md](docs/research/AGENT_HARNESS_IMPROVEMENT_PROGRAM_2026-04-03.md) (section **Meta-principles & process hooks**):

- **Registry / scope:** No new externally visible tool or route without updating [docs/AGENT_TOOL_MANIFEST.md](docs/AGENT_TOOL_MANIFEST.md) and the `src/app/api/capabilities` story (steps above). Issue stubs: [docs/research/AGENT_HARNESS_PHASE1_ISSUES.md](docs/research/AGENT_HARNESS_PHASE1_ISSUES.md).
- **Velocity vs drift:** Contract and capabilities changes stay in the same PR as the matrix and `route.ts` updates (steps 1–11, including manifest and changelog when applicable); add the **changelog / release-note line** required in step 11 when the contract or capabilities manifest changes.
- **Intent vs premature complexity:** Prefer single-agent flows and idempotent docs before expanding orchestration; see **Risks** in the improvement program for P11 vs P4 ordering.

Sibling harness repos (MiscRepos / OpenHarness) may use **critic loop**, **intent-alignment gate**, and **checksum** scripts as their own hooks; this section is OpenGrimoire-repo review.

## Tests

- **Playwright** is the primary E2E gate (`npm run verify:e2e` or `npm run test:e2e`). Prefer extending `e2e/` for new user-visible flows.
- **Maestro** under `e2e/maestro/` is optional smoke; see [e2e/maestro/README.md](e2e/maestro/README.md).

## Tooling

- **Browserslist / `caniuse-lite`:** Occasionally run `npx update-browserslist-db@latest` so build tooling stays current; commit `package-lock.json` if it changes.

## Semantic smoke (agent NL parity)

After API or admin UI changes to alignment, run **one natural-language check** (human or agent) so mechanical tests are not the only proof:

1. Start `npm run dev` with `.env.local` per [.env.example](.env.example) (operator password + `OPENGRIMOIRE_SESSION_SECRET`; for local API without a secret, `ALIGNMENT_CONTEXT_ALLOW_INSECURE_LOCAL=true`).
2. **Prompt (example):** “Create a new alignment context item via `POST /api/alignment-context` with a unique title, then open `/login`, sign in, go to `/admin/alignment`, and confirm that item appears in the list.”
3. **Expected:** HTTP **201** from POST; item visible in admin list after login (or documented failure with exact status/body if misconfigured).

This complements Playwright and `npm run verify`; it does not replace them. See also [docs/OPERATOR_GUI_RUNBOOK.md](docs/OPERATOR_GUI_RUNBOOK.md).
