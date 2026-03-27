# OpenGrimoire — Operator context graph and brain-map visualization

Next.js app for co-access across `.cursor/state` handoffs and daily notes; D3/Three.js; static JSON graph, no Supabase required. Part of portfolio-harness **Build** (see Guard–Guide–Build taxonomy).

**Product:** OpenGrimoire. **Package name:** `open-grimoire`. **Repo folder:** often still `OpenAtlas` on disk (legacy name; renamed from `Med-Vis`). If you still see a stale `Med-Vis` directory (e.g. locked `node_modules`), close IDEs/processes using it and delete that folder—use **`OpenAtlas`** as the canonical folder path until you rename the clone.

## Key Concepts

| Concept | Description |
|---------|-------------|
| **Context graph** | Co-access visualization across handoffs, daily notes, and decision-log derived paths |
| **Brain-map** | D3/Three.js visualization of operator context; nodes from `.cursor/state` markdown |
| **Handoff-derived nodes** | Graph nodes extracted from handoff files and daily notes via `build_brain_map.py` |
| **Static JSON contract** | Graph data as JSON file (`brain-map-graph.json`); no database required |

## Context graph (no Supabase required)

- **Viewer:** `/context-atlas` (alias of the same UI as `/brain-map`).
- **Data:** `GET /api/brain-map/graph` reads **`public/brain-map-graph.local.json` when that file exists** (personal / vault merges; gitignored), otherwise `public/brain-map-graph.json`.
- **Regenerate** (from portfolio-harness root):

  ```bash
  python .cursor/scripts/build_brain_map.py
  ```

  Optional env: `CURSOR_STATE_DIR` (one root), **`CURSOR_STATE_DIRS`** (merge several; use `;` on Windows or `,` between paths), **`CURSOR_STATE_DIR_LABELS`** (prefixes for `sessions` in JSON), **`BRAIN_MAP_VAULT_ROOTS`** / **`BRAIN_MAP_VAULT_LABELS`** (Obsidian/Foam vault roots; when vault roots are set and `BRAIN_MAP_OUTPUT` is unset, default output is `OpenAtlas/public/brain-map-graph.local.json`), `BRAIN_MAP_OUTPUT`. CLI: repeated `--state-dir` / `--label`, **`--vault-root`** / **`--vault-label`** (see script `--help`). Copy-paste paths for **openharness + software state + openharness/docs**: see [`../.cursor/brain-map.env.example`](../.cursor/brain-map.env.example) (set vars then run the same `python` command).

- **Optional auth:** set `BRAIN_MAP_SECRET` on the server. If the UI must send a header, `NEXT_PUBLIC_BRAIN_MAP_SECRET` is supported — **that value is embedded in the browser bundle** (obfuscation only, not a true secret). See [docs/security/NEXT_PUBLIC_AND_SECRETS.md](docs/security/NEXT_PUBLIC_AND_SECRETS.md).

Full JSON contract: [docs/BRAIN_MAP_SCHEMA.md](docs/BRAIN_MAP_SCHEMA.md). **Tools, APIs, and how this relates to OpenHarness:** [docs/OPENGRIMOIRE_SYSTEMS_INVENTORY.md](docs/OPENGRIMOIRE_SYSTEMS_INVENTORY.md).

### Local-first notes

The graph path is **static JSON + optional secret**—you can run the viewer without configuring Supabase. For broader local-first patterns (sync, ownership, AI safety), see [Open Local First](https://openlocalfirst.org/) and optionally the sibling `local-first` workspace (`README.md`, `RESOURCES.md`, `AI_SECURITY.md`).

### Future ingest hooks

- **Watch:** debounced watcher on state markdown → rerun `build_brain_map.py`.
- **SQLite:** optional merge/index step that still writes the same JSON shape for the UI.

## Routes (App Router)

| Path | Purpose |
|------|---------|
| `/` | Home |
| `/context-atlas`, `/brain-map` | Context graph (same UI) |
| `/operator-intake`, `/survey` | Legacy intake form (same UI) |
| `/visualization` | D3 demos |
| `/login`, `/admin/*` | Operator password + session cookie (see `.env.example`: `OPENGRIMOIRE_SESSION_SECRET`, `OPENGRIMOIRE_ADMIN_PASSWORD` or hash) |

## Features (accurate)

- D3 / Three.js visualizations (Sankey, chord, constellation, etc.).
- Context graph from handoff/daily/decision-log derived paths.
- Multi-step form posting to `POST /api/survey` (SQLite on the server).
- Admin / theme controls after operator login.

### Agents and APIs

- **Start here:** [docs/AGENT_INTEGRATION.md](docs/AGENT_INTEGRATION.md) — **Quick reference** table at the top, then base URL, headers, survey read rules in production, CLI.
- **Normative HTTP contract:** [docs/ARCHITECTURE_REST_CONTRACT.md](docs/ARCHITECTURE_REST_CONTRACT.md) (strict public REST for domain entities; entity × HTTP × auth matrix).
- **How to integrate:** [docs/agent/INTEGRATION_PATHS.md](docs/agent/INTEGRATION_PATHS.md), [docs/agent/ALIGNMENT_CONTEXT_API.md](docs/agent/ALIGNMENT_CONTEXT_API.md).
- **Alignment CLI:** `node scripts/alignment-context-cli.mjs` — set `OPENGRIMOIRE_BASE_URL` (legacy alias `OPENATLAS_BASE_URL`; local dev: `http://localhost:3001`), `ALIGNMENT_CONTEXT_API_SECRET` when enforced, or `ALIGNMENT_CONTEXT_ALLOW_INSECURE_LOCAL=true` for trusted local dev without a secret.
- **Agent-native audit (gap report):** [docs/AGENT_NATIVE_AUDIT_OPENGRIMOIRE.md](docs/AGENT_NATIVE_AUDIT_OPENGRIMOIRE.md).
- **OpenGrimoire MVP (scope + audit + pack):** [docs/scope_opengrimoire_mvp_agent_native.md](docs/scope_opengrimoire_mvp_agent_native.md), [docs/audit/agent_native_opengrimoire_2026-03-24.md](docs/audit/agent_native_opengrimoire_2026-03-24.md), [docs/audit/OPENGRIMOIRE_MVP_EXECUTIVE_PACK_2026-03-24.md](docs/audit/OPENGRIMOIRE_MVP_EXECUTIVE_PACK_2026-03-24.md).
- **Operator GUI runbook:** [docs/OPERATOR_GUI_RUNBOOK.md](docs/OPERATOR_GUI_RUNBOOK.md) · **Monitoring split:** [docs/MONITORING_OPENGRIMOIRE.md](docs/MONITORING_OPENGRIMOIRE.md).
- **Contributing (API changes):** [CONTRIBUTING.md](CONTRIBUTING.md).

## Quick start

**Prerequisites:** Node 18+, npm.

```bash
cd OpenAtlas   # path under portfolio-harness
npm install
cp .env.example .env.local   # set OPENGRIMOIRE_SESSION_SECRET and OPENGRIMOIRE_ADMIN_PASSWORD (or hash) for `/login` and `/admin`. For alignment API without a shared secret in local dev, set ALIGNMENT_CONTEXT_ALLOW_INSECURE_LOCAL=true (see docs/AGENT_INTEGRATION.md).
npm run dev
```

**Windows (PowerShell):** Use `;` not `&&` to chain commands, e.g. `Set-Location OpenAtlas; npm run dev`.

Open [http://localhost:3001](http://localhost:3001). Visit `/context-atlas` after generating `public/brain-map-graph.json`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server (port 3001) |
| `npm run clean` | Remove `.next` and `node_modules/.cache` (fixes chunk errors) |
| `npm run dev:clean` | Clean then start dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run type-check` | `tsc --noEmit` |
| `npm run test` | Placeholder (exits 0 until unit tests exist) |
| `npm run verify` | **CI / agents:** `lint` + `type-check` + `test` (single pass/fail). |
| `npm run verify:e2e` | `verify` then Playwright (`test:e2e`; dev server started by Playwright config when needed) |
| `npm run test:e2e` | Playwright |

## License / attribution

Portfolio-derived sample; anonymized from earlier client work. Not a medical product.
