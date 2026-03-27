# OpenGrimoire — systems inventory (tools, APIs, workflows)

**Purpose:** Single place to list what OpenGrimoire touches and what agents use around it. **Workspace-wide MCP and browser tooling** stay canonical in [`.cursor/docs/MCP_CAPABILITY_MAP.md`](../../.cursor/docs/MCP_CAPABILITY_MAP.md) — do not duplicate that full matrix here; link it instead.

**Normative API/agent rules:** [ARCHITECTURE_REST_CONTRACT.md](./ARCHITECTURE_REST_CONTRACT.md) (strict public REST, entity × HTTP × auth matrix, UI freshness tiers, verification appendix). **Integration paths:** [agent/INTEGRATION_PATHS.md](./agent/INTEGRATION_PATHS.md).

**Last reviewed:** 2026-03-20

---

## Relationship to OpenHarness

| Piece | Role |
|-------|------|
| **OpenHarness** (`D:/openharness`) | Portable **template**: docs, `.cursor` rules/skills, `state/` schema, handoff patterns. No app server. |
| **OpenGrimoire** (this app; repo folder often `OpenAtlas` under `portfolio-harness/OpenAtlas`) | **Implementation**: Next.js UI + APIs + visualization. Consumes **brain-map JSON** produced by harness-adjacent scripts. |

**This app is not a submodule of OpenHarness.** Nesting this Next.js app inside the public harness repo would violate [OpenHarness `docs/DELINEATION.md`](../../../openharness/docs/DELINEATION.md) (domain-specific, heavy deps). The intended split: **harness = patterns + state**; **OpenGrimoire = optional viewer + portfolio-specific features**.

---

## Why OpenHarness files may not appear in the graph

The brain map is **not** a full-file scan of OpenHarness (or any repo). It is built by [`portfolio-harness/.cursor/scripts/build_brain_map.py`](../../.cursor/scripts/build_brain_map.py) from:

- `.cursor/state/daily/*.md`
- `.cursor/state/handoff_latest.md`
- `.cursor/state/handoff_archive/*.md`
- `.cursor/state/decision-log.md`

Only **`.md` paths mentioned in those files** become nodes; edges are **co-access in the same session**. Default `CURSOR_STATE_DIR` is **`portfolio-harness/.cursor/state`**, not `openharness/.cursor/state`.

**To merge portfolio-harness + OpenHarness (or any clones) in one graph:**

```powershell
# Windows-friendly (semicolon-separated)
$env:CURSOR_STATE_DIRS = "D:\portfolio-harness\.cursor\state;D:\openharness\.cursor\state"
# Optional explicit labels (same order):
$env:CURSOR_STATE_DIR_LABELS = "portfolio-harness;openharness"
python D:\portfolio-harness\.cursor\scripts\build_brain_map.py
```

Or CLI (overrides env):

`python .cursor/scripts/build_brain_map.py --state-dir D:\portfolio-harness\.cursor\state --state-dir D:\openharness\.cursor\state`

Single-root legacy: `CURSOR_STATE_DIR` or default `portfolio-harness/.cursor/state` only; session ids in JSON stay **unprefixed**.

Handoffs must still **cite paths** (wikilinks, bullets with `.md`) for nodes to appear; the builder does not crawl the whole repo.

**SCP:** If the `scp` package is installed, each state and vault markdown file is screened before link/path extraction (injection tier → file omitted). The builder prints **`Warning: skipped … (SCP injection tier)`** to stderr so an unexpectedly empty graph is easier to debug.

---

## OpenAtlas — application surfaces

| Kind | Name / path | Notes |
|------|-------------|--------|
| Route | `/`, `/visualization`, `/login`, `/admin/*` | Admin needs `OPENGRIMOIRE_SESSION_SECRET` + operator password (see `.env.example`) |
| Route | `/context-atlas`, `/brain-map` | Context graph UI (same app) |
| Route | `/operator-intake`, `/survey` | Legacy sample form |
| Static data | `public/brain-map-graph.json` | Served to viewer; regenerate via build script |
| API | `GET /api/brain-map/graph` | Serves graph JSON |
| API | Alignment context | See [`docs/agent/ALIGNMENT_CONTEXT_API.md`](./agent/ALIGNMENT_CONTEXT_API.md) (`GET`/`POST`/`PATCH` `/api/alignment-context`, secret header when configured). Data in **SQLite** (`OPENGRIMOIRE_DB_PATH`). Misconfiguration may yield **503**. |
| API | `GET /api/capabilities` | Hand-maintained JSON index of public API surface (agents); see [`ARCHITECTURE_REST_CONTRACT.md`](./ARCHITECTURE_REST_CONTRACT.md) |
| Auth (optional) | `BRAIN_MAP_SECRET` / `NEXT_PUBLIC_BRAIN_MAP_SECRET` | See [`docs/security/NEXT_PUBLIC_AND_SECRETS.md`](./security/NEXT_PUBLIC_AND_SECRETS.md) |
| Auth (admin) | `OPENGRIMOIRE_SESSION_SECRET`, `OPENGRIMOIRE_ADMIN_PASSWORD` or hash | [`docs/admin/OPENGRIMOIRE_ADMIN_ROLE.md`](./admin/OPENGRIMOIRE_ADMIN_ROLE.md) |

---

## Scripts & CLI (repo-local)

| Command / script | Purpose |
|------------------|---------|
| `npm run dev` | Next dev server (default port **3001** in `package.json`) |
| `npm run build` / `start` | Production |
| `npm run lint` | ESLint |
| `npm run type-check` | `tsc --noEmit` |
| `npm run test` | Placeholder until unit tests land |
| `npm run verify` | **`lint` + `type-check` + `test`** — one command for agents / CI |
| `npm run verify:e2e` | `verify` then Playwright E2E (uses `playwright.config.ts` `webServer`) |
| `npm run test:e2e` | Playwright only |
| `python ../../.cursor/scripts/build_brain_map.py` | Regenerate `public/brain-map-graph.json` (run from portfolio-harness root; see OpenAtlas README) |
| `node scripts/alignment-context-cli.mjs` | Alignment API CLI (`OPENGRIMOIRE_BASE_URL`; legacy `OPENATLAS_BASE_URL`) |
| `docker-compose.yml` | Local stack (see `DEPLOYMENT.md`) |

Env overrides for brain map: `CURSOR_STATE_DIRS`, `CURSOR_STATE_DIR_LABELS`, `BRAIN_MAP_VAULT_ROOTS`, `BRAIN_MAP_OUTPUT`, etc. (see `build_brain_map.py` module docstring). **stderr** may list skipped files (SCP injection or read errors).

---

## Documentation map (OpenAtlas tree)

| Doc | Topic |
|-----|--------|
| `README.md` | Quick start, routes, brain map regen, agent entry |
| `CONTRIBUTING.md` | API changes; matrix maintenance |
| `docs/AGENT_INTEGRATION.md` | Single entry for agents: base URL, headers, CLI, alignment env |
| `docs/ARCHITECTURE_REST_CONTRACT.md` | Strict REST rule, entity matrix, non-goals, Cluster C norms |
| `docs/ARCHITECTURE.md` | App structure |
| `docs/BRAIN_MAP_SCHEMA.md` | Graph JSON contract |
| `docs/USAGE_GUIDE.md`, `docs/DEVELOPER_GUIDE.md` | Operator / dev |
| `docs/API_DOCUMENTATION.md` | APIs |
| `docs/agent/*` | Alignment operator + machine API, integration paths |
| `docs/security/*` | Public surface, secrets |
| `docs/AGENT_NATIVE_AUDIT_OPENGRIMOIRE.md` | Agent-native gap report vs contract |
| `docs/OPEN_GRIMOIRE_LOCAL_FIRST_INTEGRATION.md` | OpenGrimoire trust/context local-first integration blueprint |
| `DEPLOYMENT.md` | Deploy notes |

---

## Workspace tools that interact with OpenAtlas (agents)

Use **one** primary path per task ([`MCP_CAPABILITY_MAP.md`](../../.cursor/docs/MCP_CAPABILITY_MAP.md)):

| Need | Primary |
|------|---------|
| Manual UI review in Cursor | `cursor-ide-browser` + [`browser-review-protocol` skill](../../.cursor/skills/browser-review-protocol/SKILL.md) |
| CI / headless E2E | Playwright (`npm run test:e2e` in OpenAtlas) |
| Third-party docs | context7 |
| Repo symbols / search | jcodemunch, codebase_search |
| Daggr / campaign_kb / WatchTower | daggr MCP (workspace); not embedded in OpenAtlas |

---

## TODO / gaps (tracked in harness `pending_tasks`)

See **PENDING_OPENATLAS_HARNESS** in [`.cursor/state/pending_tasks.md`](../../.cursor/state/pending_tasks.md): keep this inventory accurate when routes/APIs change; **OA-4 `npm run verify`** is the unified lint/type-check/test entry (E2E optional via `verify:e2e`).

- **Future:** [async HITL intent survey](HITL_INTENT_SURVEY_BACKLOG.md) (AI-posted human questions; not the intake `POST /api/survey` flow).
