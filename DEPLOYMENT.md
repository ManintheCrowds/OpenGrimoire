# OpenGrimoire — deployment guide

## Current stack (SQLite + Next.js)

Runtime uses **local SQLite** only (`OPENGRIMOIRE_DB_PATH`, default `data/opengrimoire.sqlite`) for Sync Session (survey), alignment, and related operator data. The schema is created and migrated by the app (**Drizzle** bootstrap on startup). There is **no Supabase** or hosted Postgres requirement.

**Production checklist:**

- **`OPENGRIMOIRE_SESSION_SECRET`** — signed cookie for `/login` and `/admin/*`.
- **`OPENGRIMOIRE_ADMIN_PASSWORD`** or **`OPENGRIMOIRE_ADMIN_PASSWORD_HASH`** — operator login.
- **`ALIGNMENT_CONTEXT_API_SECRET`** — required in production for `/api/alignment-context`; callers send **`x-alignment-context-key`**.
- **`CLARIFICATION_QUEUE_API_SECRET`** (recommended for harness-only access) — **`x-clarification-queue-key`** on clarification routes when set. See [docs/AGENT_INTEGRATION.md](docs/AGENT_INTEGRATION.md) and [.env.example](.env.example).
- **`OPENGRIMOIRE_TRUST_FORWARDED_IP=1`** — when the app is behind **your** reverse proxy (not Vercel), set this **after** configuring the proxy so `X-Forwarded-For` / `X-Real-IP` reflect the real client and are not attacker-controlled at the leftmost hop OpenGrimoire reads. If unset and **`VERCEL`** is not set, middleware rate limits use a single per-process bucket (`unknown`). See **Reverse proxy** below and [docs/engineering/OPERATIONAL_TRADEOFFS.md](docs/engineering/OPERATIONAL_TRADEOFFS.md).

- **Survey read gating (PII)** — Before enabling **`ALIGNMENT_CONTEXT_KEY_ALLOWS_SURVEY_READ`** or **`SURVEY_VISUALIZATION_ALLOW_PUBLIC`**, read [docs/admin/SURVEY_READ_GATING_RUNBOOK.md](docs/admin/SURVEY_READ_GATING_RUNBOOK.md) and prefer **`SURVEY_VISUALIZATION_API_SECRET`** + **`x-survey-visualization-key`** for machine access to visualization GETs.

- **`NODE_ENV=production`** on any host that holds **real survey PII** and must enforce the survey visualization read gate (`checkSurveyReadGate`). If `NODE_ENV` is **`development`**, **`test`**, or anything other than **`production`**, the app **does not** run that gate (routes behave like local dev — open). Staging stacks are not special-cased; use production semantics or accept open reads. Details: [docs/admin/SURVEY_READ_GATING_RUNBOOK.md](docs/admin/SURVEY_READ_GATING_RUNBOOK.md) § NODE_ENV and staging; [`src/lib/survey/survey-read-gate.ts`](src/lib/survey/survey-read-gate.ts).

- **Release secrets (not E2E defaults)** — Real deployments **must** set operator, session, and API secrets in the environment. **Never** rely on unset vars falling through to Playwright-only literals in [`e2e/helpers/e2e-secrets.ts`](e2e/helpers/e2e-secrets.ts) (`E2E_DEFAULT_WEB_ENV`); that module exists for **`npm run test:e2e`** / `webServer.env` only. Production checklist above + `.env.example` are the source of truth. See **Security** § E2E vs production below.

See [docs/admin/OPENGRIMOIRE_ADMIN_ROLE.md](docs/admin/OPENGRIMOIRE_ADMIN_ROLE.md) and [docs/security/PUBLIC_SURFACE_AUDIT.md](docs/security/PUBLIC_SURFACE_AUDIT.md).

## Quick Docker deployment

### Prerequisites

- Docker and Docker Compose
- Domain name (optional)

### Clone and env

```bash
git clone <your-repo-url>
cd OpenGrimoire
cp .env.example .env.local
# Edit .env.local — set secrets above; optional OPENGRIMOIRE_DB_PATH for a persistent volume path
```

Example production variables (placeholders only — never commit real secrets):

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
OPENGRIMOIRE_SESSION_SECRET=<long-random-secret>
OPENGRIMOIRE_ADMIN_PASSWORD_HASH=<bcrypt-hash>
OPENGRIMOIRE_DB_PATH=/data/opengrimoire.sqlite
ALIGNMENT_CONTEXT_API_SECRET=<long-random-secret>
# After nginx (or similar) overwrites X-Forwarded-For per Reverse proxy section:
OPENGRIMOIRE_TRUST_FORWARDED_IP=1
```

### Database

No manual SQL: start the app once so SQLite is created under `OPENGRIMOIRE_DB_PATH` (or default `data/opengrimoire.sqlite`). Back up that file for disaster recovery.

### Run

```bash
docker compose up -d
docker compose logs -f opengrimoire
```

Default container listens on **3000** (see [docker-compose.yml](docker-compose.yml)). Local `npm run dev` uses **3001** per [package.json](package.json).

### Operator admin

1. Open `https://your-domain.com/login`.
2. Sign in with the password matching `OPENGRIMOIRE_ADMIN_PASSWORD` (or hash).
3. Use `/admin/*` for moderation and alignment UI.

## Access points

- **Sync Session:** `/operator-intake` or `/survey`
- **Admin:** `/admin`, `/login`
- **Context graph:** `/context-atlas` (static JSON + optional `GET /api/brain-map/graph`)

## Reverse proxy (Nginx)

OpenGrimoire middleware rate limits key clients by IP using [`getRateLimitClientIp`](src/lib/rate-limit/get-client-ip.ts). With **`OPENGRIMOIRE_TRUST_FORWARDED_IP=1`**, it uses the **leftmost** `X-Forwarded-For` value or `X-Real-IP`. A client can prepend a fake address unless the proxy **overwrites** or normalizes the chain. For a **single hop** between nginx and Node, prefer setting the forwarded chain from the peer address only (below). For multi-hop chains (CDN → nginx → app), document which hop is authoritative or terminate TLS at a provider that sets trusted forwards (e.g. Vercel sets `VERCEL=1` and platform headers).

```nginx
server {
    listen 80;
    listen 443 ssl;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        # Single upstream hop: overwrite so the leftmost hop is the client nginx saw (not client-supplied junk).
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Set **`OPENGRIMOIRE_TRUST_FORWARDED_IP=1`** in `.env` when using this pattern so limits are per real client. If you need to **append** to an existing chain from an outer CDN instead, ensure the value OpenGrimoire reads is still trustworthy for your topology (this app does not parse “rightmost trusted hop” automatically).

## Security

1. Never commit `.env.local`.
2. Use opaque placeholders in docs and tickets — [docs/security/PUBLIC_SURFACE_AUDIT.md](docs/security/PUBLIC_SURFACE_AUDIT.md).
3. **`NEXT_PUBLIC_*`** values are visible in the browser bundle — see [docs/security/NEXT_PUBLIC_AND_SECRETS.md](docs/security/NEXT_PUBLIC_AND_SECRETS.md).
4. Enforce HTTPS in production.

### E2E defaults vs production

[`e2e/helpers/e2e-secrets.ts`](e2e/helpers/e2e-secrets.ts) defines **`E2E_DEFAULT_WEB_ENV`** (predictable strings) so Playwright can start the app without a hand-crafted `.env` for CI. **`buildPlaywrightWebServerEnv()`** merges those defaults into the test `webServer` env when real values are unset.

**Release checklist:** Confirm **production** and **staging-with-PII** hosts **do not** depend on that file at runtime. Set at minimum the secrets in the **Production checklist** (session, operator password or hash, `ALIGNMENT_CONTEXT_API_SECRET`, and any optional surfaces you enable). If any of those are missing in a real deployment, behavior is undefined or insecure — not “same as E2E.”

## Monitoring and backup

- Health: `curl -f http://localhost:3000/`
- Logs: `docker compose logs --tail=100`
- Backup: copy the SQLite file (`OPENGRIMOIRE_DB_PATH`) on a schedule.

## Troubleshooting

1. **503 on alignment API in production** — set non-empty `ALIGNMENT_CONTEXT_API_SECRET`.
2. **Cannot log in** — verify `OPENGRIMOIRE_SESSION_SECRET` and password env vars.
3. **Docker build** — ensure `better-sqlite3` native build succeeds in the image (see [Dockerfile](Dockerfile)).

## Historical note

Older docs referred to Postgres migrations under `supabase/migrations/` as a reference snapshot. **Runtime is SQLite only**; ignore Supabase CLI and JWT admin flows. See [CLAUDE.md](CLAUDE.md).
