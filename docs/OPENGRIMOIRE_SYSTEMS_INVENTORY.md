# OpenGrimoire — systems inventory (tools, APIs, workflows)

**Purpose:** Single place to list what OpenGrimoire touches and what agents use around it. **Workspace-wide MCP and browser tooling** stay canonical in `[MiscRepos/.cursor/docs/MCP_CAPABILITY_MAP.md](../../MiscRepos/.cursor/docs/MCP_CAPABILITY_MAP.md)` (sibling repo layout under `GitHub/`) — do not duplicate that full matrix here; link it instead.

**Base product (operator-facing) spec:** [OPENGRIMOIRE_BASE_FEATURES.md](./OPENGRIMOIRE_BASE_FEATURES.md) — SSOT vs wiki mirror, brain map, alignment parity, menagerie v0, audit, onboarding acceptance criteria.

**Roadmap / verification (execution companion):** [docs/plans/OPENGRIMOIRE_BASE_FEATURES_ENGINEERING_PLAN.md](./plans/OPENGRIMOIRE_BASE_FEATURES_ENGINEERING_PLAN.md) — waves, per-REQ CI hooks, ADR log, agent-native guardrails.

**Normative API/agent rules:** [ARCHITECTURE_REST_CONTRACT.md](./ARCHITECTURE_REST_CONTRACT.md) (strict public REST, entity × HTTP × auth matrix, UI freshness tiers, verification appendix). **Integration paths:** [agent/INTEGRATION_PATHS.md](./agent/INTEGRATION_PATHS.md).

**Last reviewed:** 2026-04-17

**Persistence:** Survey, alignment, clarification, study, and moderation data use **local SQLite** only (`OPENGRIMOIRE_DB_PATH`, default `data/opengrimoire.sqlite`). There is **no** Supabase or hosted Postgres in the supported runtime path.

**GUI product wave (MiscRepos ritual):** `**oatlas-wave-7`** — first-run + `**/capabilities**` depth (**OA-8**), default slice after responsive OA-7. Audit: `[docs/audit/gui-2026-03-26.md](./audit/gui-2026-03-26.md)` §8–§9; YAML: `[MiscRepos/docs/audit/gui_wave_rollout_opengrimoire.yaml](../../MiscRepos/docs/audit/gui_wave_rollout_opengrimoire.yaml)`.

---

## Workspace paths (flat `GitHub` folder)

Older docs sometimes say `**portfolio-harness**` or show `**D:\portfolio-harness\OpenGrimoire**`. In this workspace, use **sibling repos** under one parent (e.g. `C:\Users\YOU\Documents\GitHub\`) with the same relative layout—see [GitHub `README-WORKSPACE.md](../../README-WORKSPACE.md)` and [WORKSPACE_REPO_LAYOUT.md](./WORKSPACE_REPO_LAYOUT.md). `**MiscRepos/.cursor/scripts/build_brain_map.py`** is the canonical brain-map builder (not a generic `portfolio-harness/.cursor/...` path).

---

## Relationship to OpenHarness


| Piece                                                                                                     | Role                                                                                                                                                                    |
| --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **OpenHarness** (e.g. `C:\Users\YOU\Documents\GitHub\OpenHarness`; legacy examples used `D:/openharness`) | Portable **template**: docs, `.cursor` rules/skills, `state/` schema, handoff patterns. No app server.                                                                  |
| **OpenGrimoire** (this app; clone folder should be `OpenGrimoire`; legacy `OpenGrimoire` possible)        | **Implementation**: Next.js UI + APIs + visualization. Consumes **brain-map JSON** produced by harness-adjacent scripts (typically from a sibling **MiscRepos** clone). |


**Operator-facing brain map GUI:** [GUI_ACTION_MAP_BRAIN_MAP.md](GUI_ACTION_MAP_BRAIN_MAP.md) — `/context-atlas` / `/brain-map` as canonical surface; **OpenHarness** `scripts/brain_map_viewer.html` is a secondary static viewer; **OpenHarness state** enters the graph via `CURSOR_STATE_DIRS` / `build_brain_map.py` (see § below).

**This app is not a submodule of OpenHarness.** Nesting this Next.js app inside the public harness repo would violate [OpenHarness `docs/DELINEATION.md](../../OpenHarness/docs/DELINEATION.md)` (domain-specific, heavy deps). The intended split: **harness = patterns + state**; **OpenGrimoire = optional viewer + portfolio-specific features**.

---

## Which `build_brain_map.py` (two copies)


| Location                                                                                             | Use when                                                                                                                                                       |
| ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `[MiscRepos/.cursor/scripts/build_brain_map.py](../../MiscRepos/.cursor/scripts/build_brain_map.py)` | **Default for OpenGrimoire:** multi-root state, optional Obsidian vault roots, SCP gating, default output to `OpenGrimoire/public/brain-map-graph.local.json`. |
| `[OpenHarness/scripts/build_brain_map.py](../../OpenHarness/scripts/build_brain_map.py)`             | **Harness-only** checkout: minimal portable builder; no vault multi-root features.                                                                             |


Paths assume **sibling repos** under the same parent folder (e.g. `Documents/GitHub/{OpenGrimoire,MiscRepos,OpenHarness}`).

---

## Why OpenHarness files may not appear in the graph

The brain map is **not** a full-file scan of OpenHarness (or any repo). It is built by `[MiscRepos/.cursor/scripts/build_brain_map.py](../../MiscRepos/.cursor/scripts/build_brain_map.py)` from:

- `.cursor/state/daily/*.md`
- `.cursor/state/handoff_latest.md`
- `.cursor/state/handoff_archive/*.md`
- `.cursor/state/decision-log.md`

Only `**.md` paths mentioned in those files** become nodes; edges are **co-access in the same session**. With no env set, the script defaults to a single state root — typically `**MiscRepos/.cursor/state`** when you run from a **MiscRepos** clone (see script `--help`).

**To merge MiscRepos + OpenHarness (or any clones) in one graph:**

```powershell
# Windows-friendly (semicolon-separated)
$env:CURSOR_STATE_DIRS = "C:\Users\YOU\Documents\GitHub\MiscRepos\.cursor\state;C:\Users\YOU\Documents\GitHub\OpenHarness\state"
# Optional explicit labels (same order):
$env:CURSOR_STATE_DIR_LABELS = "MiscRepos;OpenHarness"
cd C:\Users\YOU\Documents\GitHub\MiscRepos
python .cursor\scripts\build_brain_map.py
```

Or CLI (overrides env):

`python ../MiscRepos/.cursor/scripts/build_brain_map.py --state-dir ../MiscRepos/.cursor/state --state-dir ../OpenHarness/state`

(Adjust paths to your machine; use `OpenHarness/state` if the harness uses `state/` at repo root.)

Single-root legacy: `CURSOR_STATE_DIR` or one default state dir only; session ids in JSON stay **unprefixed** when a single root is used.

Handoffs must still **cite paths** (wikilinks, bullets with `.md`) for nodes to appear; the builder does not crawl the whole repo.

**SCP:** If the `scp` package is installed, each state and vault markdown file is screened before link/path extraction (injection tier → file omitted). The builder prints `**Warning: skipped … (SCP injection tier)`** to stderr so an unexpectedly empty graph is easier to debug.

---

## LLM Wiki vs OpenGrimoire (local-first)

The **Karpathy-style LLM Wiki** is **not** implemented inside this Next.js repo. Canonical **single source of truth** for the compounding wiki is the Obsidian vault tree `**LLM-Wiki/`** (e.g. under `[Arc_Forge/ObsidianVault](../../Arc_Forge/ObsidianVault)`) plus operator docs in **MiscRepos** `[local-proto/docs/LLM_WIKI_VAULT.md](../../MiscRepos/local-proto/docs/LLM_WIKI_VAULT.md)`. That keeps the wiki **private, markdown-native, and git-friendly** without duplicating content in SQLite.

**Adopted scope (alignment decision)**


| Phase       | What it is                                                                                                                                                                                                                                    | Status                                                                                                                                                                                                                                                                        |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Phase A** | OpenGrimoire consumes **brain-map JSON** from `build_brain_map.py`; optional `BRAIN_MAP_VAULT_ROOTS` so handoffs that cite vault paths surface `LLM-Wiki` in `/context-atlas` / `/brain-map`. Vault remains the write surface for wiki pages. | **Current** — use env from [README.md](../README.md) / script `--help`.                                                                                                                                                                                                       |
| **Phase B** | Optional **read-only mirror** of `LLM-Wiki/`** into `public/wiki` with in-app browsing at **`/wiki`** (escaped plaintext; no write API)—**no** second SSOT; sync is one-way from vault.                                                                                   | **Minimal shipped** — populate with `[MiscRepos/local-proto/docs/LLM_WIKI_SCHEDULED_PIPELINE.md](../../MiscRepos/local-proto/docs/LLM_WIKI_SCHEDULED_PIPELINE.md)` / `Run-LlmWikiScheduledPipeline.ps1 -SyncOpenGrimoireWiki`; operator doc [WIKI_MIRROR.md](./WIKI_MIRROR.md). Markdown rendering, search, and edit remain future work. |


**Questionnaires / wizards** that ask for “GitHub Wiki”, “Notion”, etc.: answer **Other** — internal markdown vault wiki; see MiscRepos [LLM_WIKI_VAULT.md — External setup wizards](../../MiscRepos/local-proto/docs/LLM_WIKI_VAULT.md#external-setup-wizards-questionnaires).

---

## OpenGrimoire — application surfaces


| Kind            | Name / path                                                          | Notes                                                                                                                                                                                                                                          |
| --------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Route           | `/`, `/visualization`, `/login`, `/admin/*`                          | Admin needs `OPENGRIMOIRE_SESSION_SECRET` + operator password (see `.env.example`)                                                                                                                                                             |
| Route           | `/context-atlas`, `/brain-map`                                       | Context graph UI (same app); **GUI action map:** [GUI_ACTION_MAP_BRAIN_MAP.md](GUI_ACTION_MAP_BRAIN_MAP.md)                                                                                                                                    |
| Route           | `/operator-intake`, `/survey`                                        | Sync Session form → `POST /api/survey` (SQLite)                                                                                                                                                                                                |
| Route           | `/test-sqlite`                                                       | Dev-only SQLite API smoke page (`/test-supabase` redirects here); gated in prod like other `/test*` routes                                                                                                                                     |
| Route           | `/admin/clarification-queue`                                         | Operator inbox for async **clarification queue** (agent questions); distinct from Sync Session                                                                                                                                                 |
| Static data     | `public/brain-map-graph.json`                                        | Served to viewer; regenerate via build script                                                                                                                                                                                                  |
| API             | `GET /api/brain-map/graph`                                           | Serves graph JSON                                                                                                                                                                                                                              |
| API             | Alignment context                                                    | See `[docs/agent/ALIGNMENT_CONTEXT_API.md](./agent/ALIGNMENT_CONTEXT_API.md)` (`GET`/`POST`/`PATCH` `/api/alignment-context`, secret header when configured). Data in **SQLite** (`OPENGRIMOIRE_DB_PATH`). Misconfiguration may yield **503**. |
| API             | Clarification queue                                                  | `[docs/agent/CLARIFICATION_QUEUE_API.md](./agent/CLARIFICATION_QUEUE_API.md)` — `clarification_requests` table; same shared-secret gate as alignment for public routes.                                                                        |
| API             | Study decks / SRS (optional)                                         | `GET`/`POST` `/api/study/*` — spaced-repetition cards and reviews in SQLite; operator session or alignment header. See `[docs/learning/README.md](./learning/README.md)`. Export: `npm run study:export`.                                      |
| API             | `GET /api/capabilities`                                              | Hand-maintained JSON index of public API surface (agents); see `[ARCHITECTURE_REST_CONTRACT.md](./ARCHITECTURE_REST_CONTRACT.md)`                                                                                                              |
| Auth (optional) | `BRAIN_MAP_SECRET` / `NEXT_PUBLIC_BRAIN_MAP_SECRET`                  | See `[docs/security/NEXT_PUBLIC_AND_SECRETS.md](./security/NEXT_PUBLIC_AND_SECRETS.md)`                                                                                                                                                        |
| Auth (admin)    | `OPENGRIMOIRE_SESSION_SECRET`, `OPENGRIMOIRE_ADMIN_PASSWORD` or hash | `[docs/admin/OPENGRIMOIRE_ADMIN_ROLE.md](./admin/OPENGRIMOIRE_ADMIN_ROLE.md)`                                                                                                                                                                  |


---

## Scripts & CLI (repo-local)


| Command / script                                         | Purpose                                                                                                                                                                                                                                                      |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm run dev`                                            | Next dev server (default port **3001** in `package.json`)                                                                                                                                                                                                    |
| `npm run build` / `start`                                | Production                                                                                                                                                                                                                                                   |
| `npm run lint`                                           | ESLint                                                                                                                                                                                                                                                       |
| `npm run type-check`                                     | `tsc --noEmit`                                                                                                                                                                                                                                               |
| `npm run test`                                           | Placeholder until unit tests land                                                                                                                                                                                                                            |
| `npm run verify`                                         | `lint` + `type-check` + `test` + `verify:capabilities` + `verify:openapi` + `verify:route-index`                                                                                                                                                             |
| GitHub Actions                                           | `[.github/workflows/ci.yml](../.github/workflows/ci.yml)` — `verify` + `test:e2e` on `main`/`master`                                                                                                                                                         |
| `npm run verify:e2e`                                     | `verify` then Playwright E2E (uses `playwright.config.ts` `webServer`)                                                                                                                                                                                       |
| `npm run test:e2e`                                       | Playwright only                                                                                                                                                                                                                                              |
| `python ../MiscRepos/.cursor/scripts/build_brain_map.py` | Regenerate `public/brain-map-graph.json` (run from **OpenGrimoire** repo root with sibling **MiscRepos**; see OpenGrimoire README). Set `BRAIN_MAP_VAULT_ROOTS` to include the Arc_Forge `ObsidianVault` path for **Phase A** LLM-Wiki linkage in the graph. |
| `node scripts/alignment-context-cli.mjs`                 | Alignment API CLI (`OPENGRIMOIRE_BASE_URL`)                                                                                                                                                                                                                  |
| `npm run study:export -- --output ./export.csv`          | Export `study_cards` to CSV for Anki (`OPENGRIMOIRE_DB_PATH`) — see [docs/learning/README.md](./learning/README.md)                                                                                                                                          |
| `docker-compose.yml`                                     | Local stack (see `DEPLOYMENT.md`)                                                                                                                                                                                                                            |


Env overrides for brain map: `CURSOR_STATE_DIRS`, `CURSOR_STATE_DIR_LABELS`, `BRAIN_MAP_VAULT_ROOTS`, `BRAIN_MAP_OUTPUT`, etc. (see `build_brain_map.py` module docstring). **stderr** may list skipped files (SCP injection or read errors).

---

## Spaced repetition (canonical references + CSV pipeline)

**Canonical pointers** (SuperMemo twenty rules, Anki import expectations, `validate_flashcards.py`) live in the sibling **MiscRepos** clone: `[portable-skills/docs/SPACED_REPETITION_REFERENCES.md](../../MiscRepos/portable-skills/docs/SPACED_REPETITION_REFERENCES.md)`. OpenGrimoire does not duplicate that prose; use it when generating repo-grounded flashcards in agents or harnesses.

**This repo:** `[docs/learning/README.md](./learning/README.md)` — study API summary and CSV export for Anki.

---

## Documentation map (OpenGrimoire tree)


| Doc                                                                 | Topic                                                                                  |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `README.md`                                                         | Quick start, routes, brain map regen, agent entry                                      |
| `CONTRIBUTING.md`                                                   | API changes; matrix maintenance                                                        |
| `docs/AGENT_INTEGRATION.md`                                         | Single entry for agents: base URL, headers, CLI, alignment env                         |
| `docs/ARCHITECTURE_REST_CONTRACT.md`                                | Strict REST rule, entity matrix, non-goals, Cluster C norms                            |
| `docs/ARCHITECTURE.md`                                              | App structure                                                                          |
| `docs/BRAIN_MAP_SCHEMA.md`                                          | Graph JSON contract                                                                    |
| `docs/USAGE_GUIDE.md`, `docs/DEVELOPER_GUIDE.md`                    | Operator / dev                                                                         |
| `docs/API_DOCUMENTATION.md`                                         | APIs                                                                                   |
| `docs/agent/*`                                                      | Alignment operator + machine API, integration paths                                    |
| `docs/security/*`                                                   | Public surface, secrets                                                                |
| `docs/AGENT_NATIVE_AUDIT_OPENGRIMOIRE.md`                           | Agent-native gap report vs contract                                                    |
| `docs/OPEN_GRIMOIRE_LOCAL_FIRST_INTEGRATION.md`                     | OpenGrimoire trust/context local-first integration blueprint                           |
| `docs/OPENGRIMOIRE_SYSTEMS_INVENTORY.md` (LLM Wiki vs OpenGrimoire) | Phase A brain map vs Phase B static wiki mirror; vault is SSOT                         |
| `docs/learning/README.md`                                           | Study / SRS API + CSV export for Anki; links to MiscRepos spaced-repetition references |
| `DEPLOYMENT.md`                                                     | Deploy notes                                                                           |


---

## Workspace tools that interact with OpenGrimoire (agents)

Use **one** primary path per task (`[MCP_CAPABILITY_MAP.md](../../MiscRepos/.cursor/docs/MCP_CAPABILITY_MAP.md)`):


| Need                             | Primary                                                                                                                   |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Manual UI review in Cursor       | `cursor-ide-browser` + `[browser-review-protocol` skill](../../MiscRepos/.cursor/skills/browser-review-protocol/SKILL.md) |
| CI / headless E2E                | Playwright (`npm run test:e2e` in OpenGrimoire)                                                                           |
| Third-party docs                 | context7                                                                                                                  |
| Repo symbols / search            | jcodemunch, codebase_search                                                                                               |
| Daggr / campaign_kb / WatchTower | daggr MCP (workspace); not embedded in OpenGrimoire                                                                       |


---

## TODO / gaps (tracked in harness `pending_tasks`)

See **PENDING_OPENGRIMOIRE_HARNESS** in `[MiscRepos/.cursor/state/pending_tasks.md](../../MiscRepos/.cursor/state/pending_tasks.md)`: keep this inventory accurate when routes/APIs change; **OA-4 `npm run verify`** is the unified lint/type-check/test entry (E2E optional via `verify:e2e`).

- **Clarification queue:** [HITL_INTENT_SURVEY_BACKLOG.md](HITL_INTENT_SURVEY_BACKLOG.md) / [CLARIFICATION_QUEUE_API.md](./agent/CLARIFICATION_QUEUE_API.md) (AI-posted human questions; not the intake `POST /api/survey` flow).

