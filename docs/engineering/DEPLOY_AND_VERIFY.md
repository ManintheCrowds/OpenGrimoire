# Deploy path vs local verify

**Purpose:** P12.2 — make explicit what **`npm run verify`** guarantees on the **OpenGrimoire repo** versus what runs in **production**, including the **Docker** path tracked in this repository.

## Local / CI expectation (this repo)

From the repository root, **`npm run verify`** runs:

`lint` → `type-check` → `test` → `verify:capabilities` → `verify:openapi` → `verify:route-index`

This is the **merge-quality** bar for application and API contract changes ([CONTRIBUTING.md](../../CONTRIBUTING.md)). Contributors should run it before merging when touching routes, capabilities, or OpenAPI.

**Local dev server** uses port **3001** (`npm run dev` in `package.json`). **Docker / production image** uses port **3000** by default (`Dockerfile` `EXPOSE 3000`, `ENV PORT 3000`). Set `PORT` / publish flags consistently when testing.

## Docker (defined in-repo)

This repository includes:

- **[Dockerfile](../../Dockerfile)** — multi-stage build, `next build`, **`output: 'standalone'`** (`next.config.js`), production image runs `node server.js` as user `nextjs`, listens on **3000**.
- **[docker-compose.yml](../../docker-compose.yml)** — builds the image, maps **`3000:3000`**, sets `NODE_ENV=production`, passes optional Supabase-related env. Service name **`opengrimoire`**; network **`opengrimoire-network`**. **This is the only first-party container definition in-repo**; treat it as the reference for “we use Docker” for self-hosted runs.

**Certainty statement:** There is **no** `vercel.json` in this repo; **Vercel or other PaaS** are not defined here. If you deploy elsewhere, document the host’s build command (typically `npm run build` or `next build`) in your ops runbook.

**Gap:** `docker-compose.yml` is **not** wired to run `npm run verify` automatically. CI does not currently build the Docker image on every PR (verify manually or add a workflow when ready).

## Hosted deploy (general)

Production builds typically run **`npm run build`** (and may run a subset of tests). **There is no guarantee** in this repository that every external pipeline runs the full **`verify`** script on every deploy.

- If your pipeline runs only **`build`**, document in the PR or ops runbook that **contract drift** is still gated by **`verify:capabilities`** and **`verify:openapi`** in CI or in pre-merge review.
- Avoid **false green:** if deploy only runs `build`, state that explicitly next to release notes when shipping API changes.

## Optional smoke

[`.github/workflows/survey-visualization-prod-smoke.yml`](../../.github/workflows/survey-visualization-prod-smoke.yml) is an example of **post-deploy** smoke; it is **not** a substitute for `npm run verify`.

## Related

- [DISCOVERY_STABILITY_GATE.md](./DISCOVERY_STABILITY_GATE.md) — partial OpenAPI + capabilities alignment.
- [CHANGELOG.md](../../CHANGELOG.md) — user-facing release notes.
- [OPENGRIMOIRE_NAMING_AND_URLS.md](./OPENGRIMOIRE_NAMING_AND_URLS.md) — repo URL policy.
