# Changelog

All notable changes to OpenGrimoire are documented in this file. **Release cadence:** meaningful PRs add entries under **Unreleased**; maintainers copy relevant bullets to [GitHub Releases](https://github.com/ManintheCrowds/OpenGrimoire/releases) when tagging. See [CONTRIBUTING.md](CONTRIBUTING.md) and [docs/engineering/OPENGRIMOIRE_NAMING_AND_URLS.md](docs/engineering/OPENGRIMOIRE_NAMING_AND_URLS.md).

## [Unreleased]

### Added

- **Operator observability:** SQLite-backed probe runs (`operator_probe_runs`), `POST /api/operator-probes/ingest` (operator session or `OPERATOR_PROBE_INGEST_SECRET` + `x-operator-probe-ingest-key`), `GET`/`DELETE` `/api/admin/operator-probes/:id`, operator UI **`/admin/observability`**, TTL via **`OPERATOR_PROBE_RETENTION_DAYS`** (default 30). Allowlisted `target_host` (e.g. `api.cursor.com`).
- GitHub Actions workflow **`.github/workflows/ci.yml`** — runs `npm run verify` and `npm run test:e2e` on push/PR to `main` and `master`.
- Playwright **`e2e/responsive-oa7.spec.ts`** — narrow-viewport regression for `/context-atlas` and `/visualization` (OA-7).
- Playwright **`e2e/visualization-mock-banner.spec.ts`** — `/visualization/alluvial` shows mock-data banner when survey visualization returns empty data (OGAN-04).

### Changed

- **OGAN-06 / OGAN-07:** Single HTTP client for survey visualization rows ([`src/lib/visualization/surveyVisualizationFetch.ts`](src/lib/visualization/surveyVisualizationFetch.ts)); legacy root **Master System Prompt** archived to [`docs/archive/master-system-prompt-dataviz-legacy.md`](docs/archive/master-system-prompt-dataviz-legacy.md).
- **OA-7:** Responsive layout for context graph (`SharedNavBar`, `BrainMapGraph` toolbar, `context-atlas` shell), bounded-height `/visualization` container, root layout `min-h-dvh` + `main` flex `min-h-0`.
- Dev route **`/test-sqlite`** replaces **`/test-supabase`** (legacy URL redirects via `next.config.js`).
- **`docker-compose.yml`:** SQLite volume (`opengrimoire-data` → `/data`), operator + alignment secrets — removed unused Supabase env placeholders.
- **Documentation:** SQLite-only deployment and operator guides; removed Supabase-as-primary narratives from `DEPLOYMENT.md`, `USAGE_GUIDE.md`, `DEVELOPER_GUIDE.md`, `ARCHITECTURE.md`, `API_DOCUMENTATION.md`, audits, and related plan banners. See `docs/audit/gui-2026-03-26.md` §8 **OA-7** and MiscRepos **`gui_wave_rollout_opengrimoire.yaml`** **oatlas-wave-6**.
- **Partial OpenAPI (`src/lib/openapi/openapi-document.ts`):** `components.schemas` and **`200`** JSON schemas for **`GET /api/survey/visualization`** and **`GET /api/survey/approved-qualities`** (OGAN-05).
- **Standalone alluvial:** **`/visualization/alluvial`** shows **`MockSurveyDataBanner`** when the hook falls back to sample cohort data (OGAN-04).
- **OGAN-12 / OGAN-13 / OGAN-14:** Removed hot-path **`console.log`** from [`ConstellationView.tsx`](src/components/visualization/ConstellationView.tsx), [`visualizationStore.ts`](src/store/visualizationStore.ts), and [`DataVisualization/index.tsx`](src/components/DataVisualization/index.tsx); [`NavigationDots.tsx`](src/components/DataVisualization/shared/NavigationDots.tsx) now only **`/visualization`** and **`/constellation`**; removed unused duplicate constellation view under **`src/components/DataVisualization/Constellation/`** (App Router uses **`components/visualization/ConstellationView`**).
- **OGAN-15 / OGAN-16 / OGAN-17:** Playwright **`e2e/visualization-constellation-a11y.spec.ts`** (axe, `canvas` excluded), **`e2e/visualization-constellation-network-shape.spec.ts`** ( **`all=1`** on **`/visualization`** vs **`all=0`** + **`showTestData`** on **`/constellation`** ); harness doc [`docs/agent/PLAYWRIGHT_VIZ_HARNESS_SELECTORS.md`](docs/agent/PLAYWRIGHT_VIZ_HARNESS_SELECTORS.md); `npm run test:e2e:viz-a11y` script. Small **a11y** fixes so axe passes on viz chrome: **`/visualization`** sr-only **`<h1>`** , Alluvial + Chord **`<select aria-label>`** , quote loading contrast, **`AGENT_INTEGRATION`** constellation query copy aligned with **`visualizationStore`**.

### Documentation

- **OGAN-11:** Clarified **no in-tree `mcp-server/`** in [`AGENT_TOOL_MANIFEST.md`](docs/AGENT_TOOL_MANIFEST.md); corrected sibling links in [`docs/agent/INTEGRATION_PATHS.md`](docs/agent/INTEGRATION_PATHS.md), [`docs/agent/ALIGNMENT_CONTEXT_API.md`](docs/agent/ALIGNMENT_CONTEXT_API.md), and [`docs/plans/2026-03-19-opengrimoire-alignment-implementation.md`](docs/plans/2026-03-19-opengrimoire-alignment-implementation.md). [`OA_FR_2_SYSTEM2_DATA_VISUALIZATION.md`](docs/plans/OA_FR_2_SYSTEM2_DATA_VISUALIZATION.md) updated for **OGAN-12–14** (logging partial, NavigationDots, removed duplicate Constellation tree).
- **OGAN-08:** **`/test*`** and **`/test-chord`** (and related dev routes) documented as **non-contractual** in [`AGENT_INTEGRATION.md`](docs/AGENT_INTEGRATION.md); `GET /api/capabilities` includes `documentation.non_contractual_ui`.
- **`GET /api/capabilities`:** `ui_surfaces[]` for `/visualization` vs `/constellation`, survey visualization `all=1` vs `all=0` + `showTestData`, and agent parity for graph JSON ([`AGENT_INTEGRATION.md`](docs/AGENT_INTEGRATION.md) § Survey graph JSON).
- Canonical GitHub naming **`ManintheCrowds/OpenGrimoire`** across docs and harness scripts; policy in `docs/engineering/OPENGRIMOIRE_NAMING_AND_URLS.md`.
- Introduced this changelog and clarified deploy vs `npm run verify` in `docs/engineering/DEPLOY_AND_VERIFY.md`.
