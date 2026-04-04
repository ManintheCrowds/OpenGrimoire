# OpenGrimoire — deployment guide

## Current stack (SQLite + Next.js)

Runtime uses **local SQLite** only (`OPENGRIMOIRE_DB_PATH`, default `data/opengrimoire.sqlite`) for Sync Session (survey), alignment, and related operator data. The schema is created and migrated by the app (**Drizzle** bootstrap on startup). There is **no Supabase** or hosted Postgres requirement.

**Production checklist:**

- **`OPENGRIMOIRE_SESSION_SECRET`** — signed cookie for `/login` and `/admin/*`.
- **`OPENGRIMOIRE_ADMIN_PASSWORD`** or **`OPENGRIMOIRE_ADMIN_PASSWORD_HASH`** — operator login.
- **`ALIGNMENT_CONTEXT_API_SECRET`** — required in production for `/api/alignment-context`; callers send **`x-alignment-context-key`**.
- **`CLARIFICATION_QUEUE_API_SECRET`** (recommended for harness-only access) — **`x-clarification-queue-key`** on clarification routes when set. See [docs/AGENT_INTEGRATION.md](docs/AGENT_INTEGRATION.md) and [.env.example](.env.example).

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
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Security

1. Never commit `.env.local`.
2. Use opaque placeholders in docs and tickets — [docs/security/PUBLIC_SURFACE_AUDIT.md](docs/security/PUBLIC_SURFACE_AUDIT.md).
3. **`NEXT_PUBLIC_*`** values are visible in the browser bundle — see [docs/security/NEXT_PUBLIC_AND_SECRETS.md](docs/security/NEXT_PUBLIC_AND_SECRETS.md).
4. Enforce HTTPS in production.

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
