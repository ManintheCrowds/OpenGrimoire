# Changelog

All notable changes to OpenGrimoire are documented in this file. **Release cadence:** meaningful PRs add entries under **Unreleased**; maintainers copy relevant bullets to [GitHub Releases](https://github.com/ManintheCrowds/OpenGrimoire/releases) when tagging. See [CONTRIBUTING.md](CONTRIBUTING.md) and [docs/engineering/OPENGRIMOIRE_NAMING_AND_URLS.md](docs/engineering/OPENGRIMOIRE_NAMING_AND_URLS.md).

## [Unreleased]

### Added

- GitHub Actions workflow **`.github/workflows/ci.yml`** — runs `npm run verify` and `npm run test:e2e` on push/PR to `main` and `master`.
- Playwright **`e2e/responsive-oa7.spec.ts`** — narrow-viewport regression for `/context-atlas` and `/visualization` (OA-7).

### Changed

- **OA-7:** Responsive layout for context graph (`SharedNavBar`, `BrainMapGraph` toolbar, `context-atlas` shell), bounded-height `/visualization` container, root layout `min-h-dvh` + `main` flex `min-h-0`.
- Dev route **`/test-sqlite`** replaces **`/test-supabase`** (legacy URL redirects via `next.config.js`).
- **`docker-compose.yml`:** SQLite volume (`opengrimoire-data` → `/data`), operator + alignment secrets — removed unused Supabase env placeholders.
- **Documentation:** SQLite-only deployment and operator guides; removed Supabase-as-primary narratives from `DEPLOYMENT.md`, `USAGE_GUIDE.md`, `DEVELOPER_GUIDE.md`, `ARCHITECTURE.md`, `API_DOCUMENTATION.md`, audits, and related plan banners. See `docs/audit/gui-2026-03-26.md` §8 **OA-7** and MiscRepos **`gui_wave_rollout_opengrimoire.yaml`** **oatlas-wave-6**.

### Documentation

- Canonical GitHub naming **`ManintheCrowds/OpenGrimoire`** across docs and harness scripts; policy in `docs/engineering/OPENGRIMOIRE_NAMING_AND_URLS.md`.
- Introduced this changelog and clarified deploy vs `npm run verify` in `docs/engineering/DEPLOY_AND_VERIFY.md`.
