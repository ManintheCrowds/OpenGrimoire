# OpenAtlas public surface audit

**Date:** 2026-03-19  
**Scope:** Application source, `public/`, Supabase migrations, in-repo docs, env examples, and local/runtime configuration patterns. Live Supabase dashboard / RLS verification is out of scope for this document.

## Summary

| Severity | Count (initial) | Post-remediation notes |
|----------|------------------|-------------------------|
| Critical | 1 | Client console logged survey row samples (PII) — gated / removed |
| High     | 2 | JWT-shaped examples in `DEPLOYMENT.md`; `NEXT_PUBLIC_BRAIN_MAP_SECRET` exposes “secret” in browser bundle |
| Medium   | 3 | Verbose `console.*` in visualization path; schema history naming; operator risk copying real keys into docs |
| Low      | 2 | No OpenAtlas-local CI workflows; `.gitignore` already excludes `.env*` |

## Findings table

| ID | Severity | Location | Issue | Fix | Verification |
|----|----------|----------|-------|-----|--------------|
| F1 | Critical | `src/components/DataVisualization/shared/useVisualizationData.ts` | `console.log` included `sampleData: validResponses.slice(0, 2)` (survey + nested `attendee`) | Remove row payloads from logs; gate remaining debug logs behind `NEXT_PUBLIC_DEBUG_VISUALIZATION=1` and `development` | Load `/visualization` with DevTools: default build shows no row dumps |
| F2 | High | `DEPLOYMENT.md` | Example env block used JWT-looking truncated strings for anon/service keys | Use opaque placeholders (`<your-anon-public-key>`, `<your-service-role-key>`) and point to Supabase **Project Settings → API** | Run methodology § below: no JWT-shaped literals in tracked env examples |
| F3 | High | `README.md`, `BrainMapGraph.tsx`, `.env.example` | `NEXT_PUBLIC_BRAIN_MAP_SECRET` is compiled into the client; anyone can read it and replay `x-brain-map-key` | Document as **obfuscation only**; prefer server session/cookie or short-lived tokens for real protection; server checks `BRAIN_MAP_SECRET` only | Docs + `.env.example` warn; optional future route refactor |
| F4 | Medium | `useVisualizationData.ts` | Multiple unconditional `console.log` / `warn` in client | Same debug gate as F1 | Same as F1 |
| F5 | Medium | `console.error` paths | Logging full `Error` objects can surface internal details | Log `err.message` only when not in viz debug mode | Spot-check console on forced failure |
| F6 | Medium | `supabase/migrations/*` | Historical column `years_at_medtronic` (renamed to `tenure_years`) | Leave migrations as-is (reproducibility); optional cosmetic rename of filename only if team agrees | N/A |
| F7 | Low | `.env.local` (disk) | Real keys may exist locally | Never commit; `.gitignore` lists `.env`, `.env.local` | `git ls-files OpenAtlas/.env.local` → empty |
| F8 | Low | CI | No `.github/workflows` under `OpenAtlas/` | When adding CI, use `secrets.*` only; do not echo env in logs | Manual review on first workflow |

## `NEXT_PUBLIC_*` inventory (threat model)

| Variable | Bundled to browser? | Intended exposure | Notes |
|----------|--------------------|--------------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Yes (project URL) | Public by design; protect data with RLS |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Yes (anon JWT) | Public by design; **not** a secret — RLS must enforce authz |
| `NEXT_PUBLIC_APP_URL` | Yes | Yes | App origin |
| `NEXT_PUBLIC_DEBUG_SUPABASE` | Yes | Dev-only flag | Gated with `NODE_ENV === 'development'` in client |
| `NEXT_PUBLIC_DEBUG_VISUALIZATION` | Yes | Dev-only flag | Must stay off in production builds used with real data |
| `NEXT_PUBLIC_BRAIN_MAP_SECRET` | Yes | **Misleading name** | Value is visible in compiled JS; treat as shared “gate token”, not a server secret |

**Never** put `SUPABASE_SERVICE_ROLE_KEY` in any `NEXT_PUBLIC_*` variable or client code.

## Tracked secrets scan (methodology)

Run from repo root (exclude build output):

```powershell
rg "eyJ[A-Za-z0-9_-]{20,}" OpenAtlas --glob '!**/.next/**' --glob '!**/node_modules/**'
rg "SUPABASE_SERVICE_ROLE" OpenAtlas/src OpenAtlas/docs OpenAtlas/*.md --glob '!**/node_modules/**'
```

Expect: no real JWT material in tracked sources after remediation.

## API routes (server-only secrets)

| Route | Auth / exposure | Notes |
|-------|-----------------|-------|
| `GET/POST /api/alignment-context` | `SUPABASE_SERVICE_ROLE_KEY` on server (bypasses RLS). **Production:** non-empty `ALIGNMENT_CONTEXT_API_SECRET` required (**503** if missing). With secret set: **`x-alignment-context-key`** must match (**401** otherwise). **Dev:** secret optional (localhost only). | GET `{ items }`. POST `{ item }` (201), `source` forced `api`. Zod validation → **400**. See [ALIGNMENT_CONTEXT_API.md](../agent/ALIGNMENT_CONTEXT_API.md). |
| `PATCH/DELETE /api/alignment-context/[id]` | Same secret gate as GET/POST. | PATCH partial update; DELETE hard delete; **404** if id missing. |
| `GET/POST /api/admin/alignment-context` | **Supabase session cookie** + `user_metadata.role === 'admin'`. **401/403** otherwise. Uses service role after auth — no shared secret in browser. | Operator UI at `/admin/alignment`. |
| `PATCH/DELETE /api/admin/alignment-context/[id]` | Same admin session gate. | Same semantics as public PATCH/DELETE without header. |
| `GET /api/brain-map/graph` | Optional `BRAIN_MAP_SECRET` + `x-brain-map-key` | Static JSON file, not DB |

## Operator checklist

1. Copy `.env.example` → `.env.local`; paste keys only from Supabase dashboard (never from chat logs).
2. Rotate Supabase keys if they ever appeared in a commit, screenshot, or shared doc.
3. For production, set strict RLS and review policies for `survey_responses`, `attendees`, and `alignment_context_items` (anon has no SELECT; authenticated read-only; API uses service role).
4. If `GET /api/alignment-context` is deployed with `NODE_ENV=production`, **set `ALIGNMENT_CONTEXT_API_SECRET`** and configure callers with `x-alignment-context-key`. Without it the route returns 503 and does not read the database.
5. Do not enable `NEXT_PUBLIC_DEBUG_*` in production when using real survey data.

## Related docs

- [NEXT_PUBLIC and brain-map auth notes](./NEXT_PUBLIC_AND_SECRETS.md) (same folder)
- [DEPLOYMENT.md](../../DEPLOYMENT.md)
- [Alignment context agent/operator API](../agent/ALIGNMENT_CONTEXT_API.md)
- [Operator alignment setup](../agent/OPERATOR_ALIGNMENT_SETUP.md)
