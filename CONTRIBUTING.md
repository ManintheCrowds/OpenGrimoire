# Contributing to OpenGrimoire

## API and agent contract changes

OpenGrimoire follows a **strict public REST contract** for domain entities. Before merging changes that add or modify routes under `src/app/api/`:

1. Read [docs/ARCHITECTURE_REST_CONTRACT.md](docs/ARCHITECTURE_REST_CONTRACT.md).
2. Update the **entity × HTTP × auth matrix** in that document (same PR as the code).
3. If the change affects alignment context, update [docs/agent/ALIGNMENT_CONTEXT_API.md](docs/agent/ALIGNMENT_CONTEXT_API.md) and any CLI usage in [scripts/alignment-context-cli.mjs](scripts/alignment-context-cli.mjs) if applicable.
4. Update [src/app/api/capabilities/route.ts](src/app/api/capabilities/route.ts) when adding or changing API routes (keep in sync with the matrix in [docs/ARCHITECTURE_REST_CONTRACT.md](docs/ARCHITECTURE_REST_CONTRACT.md)).
5. Run `npm run verify:capabilities` to confirm the capabilities manifest matches every `route.ts` under `src/app/api/`.
6. Consider updating [docs/OPENGRIMOIRE_SYSTEMS_INVENTORY.md](docs/OPENGRIMOIRE_SYSTEMS_INVENTORY.md) if application surfaces or scripts change.

**Grep-driven action-parity inventory (ripgrep recipes and harness MCP doc pointers):** [docs/ACTION_PARITY_FILE_INDEX.md](docs/ACTION_PARITY_FILE_INDEX.md).

## Tests

- **Playwright** is the primary E2E gate (`npm run verify:e2e` or `npm run test:e2e`). Prefer extending `e2e/` for new user-visible flows.
- **Maestro** under `e2e/maestro/` is optional smoke; see [e2e/maestro/README.md](e2e/maestro/README.md).

## Tooling

- **Browserslist / `caniuse-lite`:** Occasionally run `npx update-browserslist-db@latest` so build tooling stays current; commit `package-lock.json` if it changes.
