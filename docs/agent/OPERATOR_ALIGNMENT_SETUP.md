# Operator: alignment context (SQLite + secrets)

Steps before relying on `/api/alignment-context` in production.

## 1. Database

Alignment rows live in **local SQLite** (same DB as survey data). Ensure the app has run at least once so Drizzle has created tables, or run your usual deploy that starts `next start` / Docker.

Default path: `data/opengrimoire.sqlite` (override with `OPENGRIMOIRE_DB_PATH`).

## 2. Server environment

On the Next.js host (see [DEPLOYMENT.md](../../DEPLOYMENT.md) and [.env.example](../../.env.example)):

- **Production:** non-empty `ALIGNMENT_CONTEXT_API_SECRET`
- **`OPENGRIMOIRE_SESSION_SECRET`** + admin password for `/admin/alignment` UI (session cookie)

There are **no** Supabase or `NEXT_PUBLIC_SUPABASE_*` variables for alignment.

## 3. Caller header

When `ALIGNMENT_CONTEXT_API_SECRET` is set, every programmatic request must include:

```http
x-alignment-context-key: <same value as ALIGNMENT_CONTEXT_API_SECRET>
```

Optional dedicated secret for clarification only: `CLARIFICATION_QUEUE_API_SECRET` + `x-clarification-queue-key` — see [AGENT_INTEGRATION.md](../AGENT_INTEGRATION.md).

## 4. Smoke checks

Local dev default port is **3001** (`npm run dev`).

```bash
# Dev with ALIGNMENT_CONTEXT_ALLOW_INSECURE_LOCAL=true: list
curl -sS "http://localhost:3001/api/alignment-context?limit=5"

# With secret:
curl -sS -H "x-alignment-context-key: YOUR_SECRET" "http://localhost:3001/api/alignment-context"
```

Production without secret: expect **503** `Misconfigured`. Wrong key: **401**.

## 5. Admin UI (human operators)

Sign in at `/login` (operator session cookie), then open **`/admin/alignment`**. No shared secret in the browser for the UI path. See [ALIGNMENT_CONTEXT_API.md](./ALIGNMENT_CONTEXT_API.md).
