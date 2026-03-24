# CLAUDE.md

This file provides guidance for AI assistants working in this repository.

## Project overview

**OpenAtlas / Agent Context Atlas** (folder `OpenAtlas`): a Next.js app with a **local-first context graph** (brain map) plus **legacy** survey/visualization paths that can use Supabase when configured. Product copy targets OpenAtlas, not a specific client event. The Git remote may still use the `Med-Vis` slug until renamed.

**Canonical persistence story:** See [README.md](README.md). **Route × persistence × tools** inventory: [docs/OPENATLAS_SYSTEMS_INVENTORY.md](docs/OPENATLAS_SYSTEMS_INVENTORY.md).

## Local-first path (primary)

- **Routes:** `/context-atlas` and `/brain-map` (same UI).
- **Data:** Static JSON — `public/brain-map-graph.json`, or gitignored `public/brain-map-graph.local.json` when present.
- **API:** `GET /api/brain-map/graph` serves the graph. **No Supabase required** for this path.
- **Regeneration:** From portfolio-harness (or repo root with scripts), run `python .cursor/scripts/build_brain_map.py` with `CURSOR_STATE_DIR` / `CURSOR_STATE_DIRS` as documented in README.

## Optional legacy Supabase path

- **Routes:** `/operator-intake`, `/survey`, `/login`, `/admin/*`, and some visualization data loaders still use `src/lib/supabase/` when env vars are set.
- **When to configure:** Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` only if you need those features.
- **Schema / RLS:** Migrations under `supabase/migrations/` apply when using hosted Supabase.

## Development commands

- `npm run dev` — Dev server at **http://localhost:3001** (see `package.json` `next dev -p 3001`).
- `npm run build` / `npm run start` — Production build and server.
- `npm run lint` — ESLint.
- `npm run type-check` — `tsc --noEmit` (may fail until known issues in test pages and `dataAdapter` are cleared; see README `verify` note).
- `npm run test` — Vitest.
- `npm run verify` — `lint` + `type-check` + `test`.

## Architecture (tech stack)

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind, OpenAtlas theme tokens.
- **Visualization:** D3.js (2D), Three.js (3D constellation).
- **State:** React Context, Zustand.
- **Optional backend:** Supabase (PostgreSQL, Auth) for legacy survey/admin flows only.

## Environment setup (`.env.local`)

- **Brain-map only:** Optional `BRAIN_MAP_SECRET` / `NEXT_PUBLIC_BRAIN_MAP_SECRET` (see [docs/security/NEXT_PUBLIC_AND_SECRETS.md](docs/security/NEXT_PUBLIC_AND_SECRETS.md)).
- **Alignment API:** Optional `ALIGNMENT_CONTEXT_API_SECRET` when using `/api/alignment-context`.
- **App URL:** `NEXT_PUBLIC_APP_URL=http://localhost:3001` for local dev.
- **Supabase:** Only if using legacy routes — see `.env.example` for variable names.

## Important locations

- `src/app/` — App Router pages and API routes.
- `src/components/BrainMap/` — Context graph UI.
- `src/lib/supabase/` — Client, types, DB helpers (legacy / optional).
- `public/brain-map-graph.json` — Default graph data for the viewer.

## Constraints

- Three.js and heavy D3 views are client-side where applicable (`'use client'`).
- Custom fonts under `/public/branding/`.

## Testing / verification

- Sample/mock data: `src/data/`, `sample-survey-data.json`, etc.
- E2E: Playwright (`npm run test:e2e`); see `playwright.config.ts`.
