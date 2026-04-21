# Deploy path vs local verify

**Purpose:** P12.2 — make explicit what **`npm run verify`** guarantees on the **OpenGrimoire repo** versus what runs in **production**, including the **Docker** path tracked in this repository.

## Local / CI expectation (this repo)

From the repository root, **`npm run verify`** runs:

`lint` → `type-check` → `test` → `verify:capabilities` → `verify:openapi` → `verify:route-index` → `verify:moderation-auth` → `verify:operator-probes-auth` → `verify:admin-panel-a2ui`

This is the **merge-quality** bar for application and API contract changes ([CONTRIBUTING.md](../../CONTRIBUTING.md)). Contributors should run it before merging when touching routes, capabilities, or OpenAPI.

**Local dev server** uses port **3001** (`npm run dev` in `package.json`). **Docker / production image** uses port **3000** by default (`Dockerfile` `EXPOSE 3000`, `ENV PORT 3000`). Set `PORT` / publish flags consistently when testing.

## Docker (defined in-repo)

This repository includes:

- **[Dockerfile](../../Dockerfile)** — multi-stage build, `next build`, **`output: 'standalone'`** (`next.config.js`), production image runs `node server.js` as user `nextjs`, listens on **3000**.
- **[docker-compose.yml](../../docker-compose.yml)** — builds the image, maps **`3000:3000`**, sets `NODE_ENV=production`, passes SQLite + operator + alignment secrets (see compose file). Service name **`opengrimoire`**; network **`opengrimoire-network`**. **This is the only first-party container definition in-repo**; treat it as the reference for “we use Docker” for self-hosted runs.

**Certainty statement:** There is **no** `vercel.json` in this repo; **Vercel or other PaaS** are not defined here. If you deploy elsewhere, document the host’s build command (typically `npm run build` or `next build`) in your ops runbook.

**CI:** `.github/workflows/ci.yml` runs **`npm run verify`** and **`npm run test:e2e`** on push/PR to the default branch. Docker image build on every PR remains optional.

## Hosted deploy (general)

Production builds typically run **`npm run build`** (and may run a subset of tests). **There is no guarantee** in this repository that every external pipeline runs the full **`verify`** script on every deploy.

- If your pipeline runs only **`build`**, document in the PR or ops runbook that **contract drift** is still gated by **`verify:capabilities`** and **`verify:openapi`** in CI or in pre-merge review.
- Avoid **false green:** if deploy only runs `build`, state that explicitly next to release notes when shipping API changes.

## CI workflow

[`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) runs **`npm run verify`** and **`npm run test:e2e`** on push and pull request to the default branch. Add separate **post-deploy** smokes only if you need live-URL checks; they are not a substitute for `npm run verify`.

**Playwright:** Running `npx playwright test` **without** the dev server yields `ERR_CONNECTION_REFUSED` on `localhost:3001`. Use **`npm run test:e2e`** or **`npm run verify:e2e`** so `playwright.config.ts` **`webServer`** starts `npm run dev` (or set `PLAYWRIGHT_BASE_URL` to an already-running instance). For a **targeted a11y-only** pass (Sync Session + admin surfaces and visualization/constellation shells, canvas excluded in the viz spec), use **`npm run test:e2e:a11y`**.

## Related

- [DISCOVERY_STABILITY_GATE.md](./DISCOVERY_STABILITY_GATE.md) — partial OpenAPI + capabilities alignment.
- [CHANGELOG.md](../../CHANGELOG.md) — user-facing release notes.
- [OPENGRIMOIRE_NAMING_AND_URLS.md](./OPENGRIMOIRE_NAMING_AND_URLS.md) — repo URL policy.
