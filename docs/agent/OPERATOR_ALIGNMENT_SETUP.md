# Operator: alignment context (Supabase + secrets)

Steps for **Track 0** before relying on `/api/alignment-context` in production.

## 1. Verify or apply migration

In Supabase **SQL Editor**, check the table exists:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'alignment_context_items';
```

If empty, run the full file:

- [`supabase/migrations/20260319140000_alignment_context_items.sql`](../../supabase/migrations/20260319140000_alignment_context_items.sql)

## 2. Server environment

Required on the Next.js host (see [DEPLOYMENT.md](../../DEPLOYMENT.md)):

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- **Production:** non-empty `ALIGNMENT_CONTEXT_API_SECRET`

## 3. Caller header

When `ALIGNMENT_CONTEXT_API_SECRET` is set (including production), every request must include:

```http
x-alignment-context-key: <same value as ALIGNMENT_CONTEXT_API_SECRET>
```

## 4. Smoke checks

```bash
# Dev (no secret): list
curl -sS "http://localhost:3000/api/alignment-context?limit=5"

# With secret:
curl -sS -H "x-alignment-context-key: YOUR_SECRET" "http://localhost:3000/api/alignment-context"
```

Production without secret: expect **503** `Misconfigured`. Wrong key: **401**.

## 5. Admin UI (human operators)

Logged-in **admin** users can use **Alignment context** at `/admin/alignment` (session cookie; no shared secret in the browser). See [ALIGNMENT_CONTEXT_API.md](./ALIGNMENT_CONTEXT_API.md).
