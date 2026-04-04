# Implementation plan: alignment context (Approach B)

> **Superseded runtime (2026-04):** Production alignment + survey persistence is **SQLite + Drizzle** in-app; there is no Supabase deploy path. This document is **historical** (design + migration file naming). For current ops, see [DEPLOYMENT.md](../../DEPLOYMENT.md) and [OPERATOR_ALIGNMENT_SETUP.md](../agent/OPERATOR_ALIGNMENT_SETUP.md).

**Tracked task ID:** `OA-ALIGN-1` (see [pending_tasks.md](../../../.cursor/state/pending_tasks.md) § PENDING_OPENGRIMOIRE)  
**Status (historical):** Phases 1–4 were implemented against an earlier Postgres-oriented plan; **current repo** uses SQLite bootstrap instead of `supabase db push`.  
**Design (approved):** [2026-03-19-OpenGrimoire-alignment-context-design.md](./2026-03-19-OpenGrimoire-alignment-context-design.md) — Approach B, `alignment_context_items` table.  
**Reuse analysis (read first):** [2026-03-19-OpenGrimoire-refactor-reuse-alignment.md](./2026-03-19-OpenGrimoire-refactor-reuse-alignment.md)

## What to reuse vs build new

- **Reuse:** `src/lib/supabase/client.ts` patterns, RLS discipline, [PUBLIC_SURFACE_AUDIT.md](../security/PUBLIC_SURFACE_AUDIT.md) logging rules (no row payloads in client console by default).
- **New:** Migration + RLS for `alignment_context_items`; dedicated read path (server route). **Do not** extend `useVisualizationData` for alignment rows (keeps survey pipeline focused — per refactor-reuse memo).
- **Later compose:** Optional “context bundle” route can merge brain map JSON + alignment rows; not part of this task’s MVP.

---

## Phase 1 — Migration

**Deliverable:** `supabase/migrations/YYYYMMDDHHMMSS_alignment_context_items.sql`

**Table sketch** (adjust names/types to match project conventions):

| Column | Type | Notes |
|--------|------|--------|
| `id` | `UUID` PK, default `gen_random_uuid()` or `uuid_generate_v4()` | |
| `title` | `TEXT` NOT NULL | Short label |
| `body` | `TEXT` | Longer alignment / context text |
| `tags` | `TEXT[]` | Optional; default `'{}'` |
| `priority` | `INTEGER` or small enum | Optional; nullable |
| `status` | `TEXT` or enum | e.g. `draft`, `active`, `archived` |
| `linked_node_id` | `TEXT` nullable | Stable brain-map node id when linked |
| `attendee_id` | `UUID` nullable FK → `attendees(id)` | Optional tie to survey world |
| `source` | `TEXT` NOT NULL | `ui` \| `import` \| `api` |
| `created_at` / `updated_at` | `TIMESTAMPTZ` | Match existing trigger pattern |
| `created_by` | `UUID` nullable | If/when wired to Supabase Auth |

**Also:** `updated_at` trigger; indexes on `status`, `created_at`, optional `linked_node_id`.

---

## Phase 2 — RLS

**Deliverable:** Policies in the same migration or a follow-up migration.

**Policy intent (tune to your threat model):**

- **Default deny** for anonymous if alignment is operator-only.
- **Authenticated** role(s) or `service_role` for server routes — prefer **server route** using service role or session + RLS for user JWT, not exposing service key to the client.
- **Public demo:** optional separate policy for rows marked `is_public` *or* use a dedicated Supabase project for demos (per design § governance).

Document the chosen matrix in a short comment block above the policies in SQL.

---

## Phase 3 — Types

- Regenerate or hand-update `src/lib/supabase/types.ts` after schema is applied (match your existing workflow: Supabase CLI, etc.).

---

## Phase 4 — One read route (no UI polish)

**Deliverable:** `GET /api/alignment-context` (or `GET /api/alignment/items`) — **Route Handler** in `src/app/api/.../route.ts`.

**Behavior:**

- Returns JSON list (or paginated list) of rows **allowed by policy** for the caller.
- Uses server-side Supabase client if you inject service role **only on server**; or uses user session + anon client if RLS is user-scoped.
- **No** logging of full row bodies in production server logs; align with audit doc.
- `Cache-Control` appropriate for freshness (e.g. `private, no-store` if operator-sensitive).

**Verification:**

- `curl` or browser: route returns 200 with expected shape on dev DB with seed row(s).
- Anonymous access matches RLS intent (401/403 or empty as designed).

---

## Phase 5 — Shipped (2026-03-20)

- `POST`/`PATCH`/`DELETE` on `/api/alignment-context` (+ `[id]`), admin BFF `/api/admin/alignment-context`, UI `/admin/alignment`.
- Agent contract + CLI: `docs/agent/ALIGNMENT_CONTEXT_API.md`, `scripts/alignment-context-cli.mjs`, `npm run alignment:cli`.
- Deferred: client hook `useAlignmentContext` + realtime subscription (only if product requires live updates).

---

## Definition of done (OA-ALIGN-1)

- [x] Migration file in repo: `supabase/migrations/20260319140000_alignment_context_items.sql` — **you** apply to hosted DB.
- [x] RLS in migration: `anon` denied by default; `authenticated` SELECT; `service_role` bypasses (server route).
- [x] Types: `src/lib/supabase/types.ts` includes `alignment_context_items`.
- [x] GET route: `src/app/api/alignment-context/route.ts` — `npm run build` passes; returns `{ items: [] }` until table exists / has rows.
- [x] No visualization UI added in this task.

**Smoke test after migration:** `GET http://localhost:3000/api/alignment-context` (optional header `x-alignment-context-key` if `ALIGNMENT_CONTEXT_API_SECRET` is set). Requires `SUPABASE_SERVICE_ROLE_KEY` in server env.

---

## Links

- Security: [NEXT_PUBLIC_AND_SECRETS.md](../security/NEXT_PUBLIC_AND_SECRETS.md), [PUBLIC_SURFACE_AUDIT.md](../security/PUBLIC_SURFACE_AUDIT.md)
