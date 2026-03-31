# CLAUDE.md

This file provides guidance for AI assistants working in this repository.

## Project overview

**OpenGrimoire** (Agent Context Atlas; repo folder often `OpenAtlas`): a Next.js app with a **local-first context graph** (brain map) plus survey, alignment, and admin flows backed by a **gitignored SQLite** file (`data/opengrimoire.sqlite` by default). Product copy targets **OpenGrimoire**, not a specific client event. The Git remote may still use the `Med-Vis` slug until renamed.

**Canonical persistence story:** See [README.md](README.md). **Route × persistence × tools** inventory: [docs/OPENGRIMOIRE_SYSTEMS_INVENTORY.md](docs/OPENGRIMOIRE_SYSTEMS_INVENTORY.md).

## Local-first path (primary)

- **Routes:** `/context-atlas` and `/brain-map` (same UI).
- **Data:** Static JSON — `public/brain-map-graph.json`, or gitignored `public/brain-map-graph.local.json` when present.
- **API:** `GET /api/brain-map/graph` serves the graph (do not use bare `/brain-map-graph.json` URLs — blocked). **No database file required** for this path beyond static JSON.
- **Agents:** [docs/AGENT_INTEGRATION.md](docs/AGENT_INTEGRATION.md).
- **Regeneration:** `cd` into sibling **MiscRepos** (see [README.md](README.md)), then run `python .cursor/scripts/build_brain_map.py` with `CURSOR_STATE_DIR` / `CURSOR_STATE_DIRS` as documented in README.

## SQLite + operator session (alignment, survey, admin)

**Dual label:** **Sync Session** is the UX name for the survey flows at `/operator-intake` and `/survey` (submissions → `POST /api/survey`). **Alignment Context** is the alignment-item API and persistence (`/api/alignment-context`, alignment CLI)—a separate path from the survey form submit.

- **Routes:** `/operator-intake`, `/survey`, `/login`, `/admin/*`, visualization data — persistence in **`OPENGRIMOIRE_DB_PATH`** (default `data/opengrimoire.sqlite`; directory gitignored).
- **Admin auth:** `POST /api/auth/login` sets an HTTP-only signed cookie (`opengrimoire_session`). Configure **`OPENGRIMOIRE_ADMIN_PASSWORD`** or **`OPENGRIMOIRE_ADMIN_PASSWORD_HASH`** and **`OPENGRIMOIRE_SESSION_SECRET`** (see `.env.example`).
- **Historical schema:** Postgres migrations under `supabase/migrations/` are reference only; runtime schema is created by the app (Drizzle + bootstrap).

## Development commands

- `npm run dev` — Dev server at **http://localhost:3001** (see `package.json` `next dev -p 3001`).
- `npm run build` / `npm run start` — Production build and server.
- `npm run lint` — ESLint.
- `npm run type-check` — `tsc --noEmit`.
- `npm run test` — Vitest.
- `npm run verify` — `lint` + `type-check` + `test`.

## Architecture (tech stack)

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind, OpenGrimoire theme tokens.
- **Visualization:** D3.js (2D), Three.js (3D constellation).
- **State:** React Context, Zustand.
- **Backend:** SQLite via `better-sqlite3` (server-only); repositories under `src/lib/storage/repositories/`.

## Environment setup (`.env.local`)

- **Brain-map only:** Optional `BRAIN_MAP_SECRET` / `NEXT_PUBLIC_BRAIN_MAP_SECRET` (see [docs/security/NEXT_PUBLIC_AND_SECRETS.md](docs/security/NEXT_PUBLIC_AND_SECRETS.md)).
- **Alignment API:** Optional `ALIGNMENT_CONTEXT_API_SECRET` when using `/api/alignment-context`.
- **App URL:** `NEXT_PUBLIC_APP_URL=http://localhost:3001` for local dev.
- **SQLite + admin:** `OPENGRIMOIRE_DB_PATH`, `OPENGRIMOIRE_SESSION_SECRET`, `OPENGRIMOIRE_ADMIN_PASSWORD` or `OPENGRIMOIRE_ADMIN_PASSWORD_HASH` — see `.env.example`.

## Important locations

- `src/app/` — App Router pages and API routes.
- `src/components/BrainMap/` — Context graph UI.
- `src/db/` — Drizzle schema and SQLite client/bootstrap.
- `src/lib/storage/repositories/` — Alignment and survey data access.
- `public/brain-map-graph.json` — Default graph data for the viewer.

## Constraints

- Three.js and heavy D3 views are client-side where applicable (`'use client'`).
- Custom fonts under `/public/branding/`.

## Testing / verification

- Sample/mock data: `src/data/`, `sample-survey-data.json`, etc.
- E2E: Playwright (`npm run test:e2e`); see `playwright.config.ts`.
- Tagged releases: [RELEASING.md](RELEASING.md) — optional `npm run test:maestro` when Maestro is installed.
