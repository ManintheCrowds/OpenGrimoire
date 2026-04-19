# OA-FR-4 — System 4 Alignment and operator APIs

**Harness ID:** OA-FR-4  
**Charter:** [SCOPE_OPENGRIMOIRE_FULL_REVIEW.md](./SCOPE_OPENGRIMOIRE_FULL_REVIEW.md) — System 4  
**Status:** Matrix + gaps + verification (this document).  
**Normative contracts:** [ALIGNMENT_CONTEXT_API.md](../agent/ALIGNMENT_CONTEXT_API.md) · [ARCHITECTURE_REST_CONTRACT.md](../ARCHITECTURE_REST_CONTRACT.md) · [AGENT_INTEGRATION.md](../AGENT_INTEGRATION.md) · [PUBLIC_SURFACE_AUDIT.md](../security/PUBLIC_SURFACE_AUDIT.md)  
**Agent printable one-pager:** [OA_FR_4_ALIGNMENT_AGENT_ONE_PAGER.md](../agent/OA_FR_4_ALIGNMENT_AGENT_ONE_PAGER.md)

---

## 1. Scope and surfaces

| Surface | Path / artifact | Role |
|---------|-----------------|------|
| Public list/create | [`src/app/api/alignment-context/route.ts`](../../src/app/api/alignment-context/route.ts) | `GET`/`POST` `/api/alignment-context`; shared-secret gate ([api-auth.ts](../../src/lib/alignment-context/api-auth.ts)). |
| Public patch/delete | [`src/app/api/alignment-context/[id]/route.ts`](../../src/app/api/alignment-context/[id]/route.ts) | `PATCH`/`DELETE`; public PATCH **omits** `source` ([schemas.ts](../../src/lib/alignment-context/schemas.ts)). |
| Admin BFF list/create | [`src/app/api/admin/alignment-context/route.ts`](../../src/app/api/admin/alignment-context/route.ts) | `GET`/`POST` under `/api/admin/alignment-context`; session + admin role. |
| Admin BFF patch/delete | [`src/app/api/admin/alignment-context/[id]/route.ts`](../../src/app/api/admin/alignment-context/[id]/route.ts) | `PATCH` accepts optional `source`; `DELETE` hard delete. |
| Admin UI | [`src/app/admin/alignment/page.tsx`](../../src/app/admin/alignment/page.tsx) | Operator CRUD via admin BFF (credentials include). |
| Agent CLI | [`scripts/alignment-context-cli.mjs`](../../scripts/alignment-context-cli.mjs) | Thin `fetch` to public API (`list`, `create`, `patch`, `delete`). |
| Capability map | [`src/app/api/capabilities/route.ts`](../../src/app/api/capabilities/route.ts) | Documents alignment paths + auth strings. |
| Moderation auth purity | [`scripts/verify-moderation-auth-purity.mjs`](../../scripts/verify-moderation-auth-purity.mjs) | CI guard: moderation must not use `x-alignment-context-key` as auth. |

**Body schemas:** [`src/lib/alignment-context/schemas.ts`](../../src/lib/alignment-context/schemas.ts) — `alignmentContextCreateBodySchema`, `alignmentContextPatchBodySchema` (admin), `alignmentContextPublicPatchBodySchema` (public; no `source`).

---

## 2. Authorization

**Current product:** Alignment rows live in **SQLite** (`OPENGRIMOIRE_DB_PATH`). There is **no Postgres RLS** on this path.

| Layer | What enforces access |
|-------|----------------------|
| **Public alignment API** | `checkAlignmentContextApiGate`: when `ALIGNMENT_CONTEXT_API_SECRET` is set, require `x-alignment-context-key` (timing-safe compare). Production without secret → **503**. Local without secret → **503** unless `ALIGNMENT_CONTEXT_ALLOW_INSECURE_LOCAL=true` (non-production only). |
| **Admin BFF** | `requireOpenGrimoireAdminRoute()` — signed `opengrimoire_session` after `POST /api/auth/login`; `user_metadata.role === 'admin'`. **No** alignment shared-secret header on admin routes. |
| **Moderation / operator-only** | Session only; `x-alignment-context-key` must **not** authorize moderation — see ARCHITECTURE + `verify-moderation-auth-purity.mjs`. |

**MCP / agents:** REQ-4.1 expects workspace MCP to remain thin `fetch` wrappers over this REST contract — not fat logic in-repo. See [MiscRepos MCP_CAPABILITY_MAP.md](../../../MiscRepos/.cursor/docs/MCP_CAPABILITY_MAP.md) § OpenGrimoire.

---

## 3. Persistence (SQLite canonical)

| Artifact | Role |
|----------|------|
| Drizzle model | [`src/db/schema.ts`](../../src/db/schema.ts) — `alignmentContextItems` / table `alignment_context_items`. |
| Bootstrap DDL | [`src/db/client.ts`](../../src/db/client.ts) — `CREATE TABLE IF NOT EXISTS alignment_context_items (...)` on first open. |

**Out of supported runtime:** Hosted Postgres / Supabase as the primary store is **not** the current product path unless an ADR adds it. Operators mirror or backup the SQLite file per [DEPLOYMENT.md](../../DEPLOYMENT.md).

---

## 4. Requirements and acceptance criteria

### REQ-S4.1 — Public alignment CRUD

| ID | Requirement | Acceptance criteria (observer) |
|----|-------------|--------------------------------|
| S4.1.1 | List with optional filters. | `GET /api/alignment-context?limit=&status=` returns **200** `{ "items": [...] }` with `Cache-Control: private, no-store` when gate passes. |
| S4.1.2 | Create row. | `POST` with JSON per ALIGNMENT_CONTEXT_API → **201** `{ "item": { ... } }`; server sets `source` to **`api`**. |
| S4.1.3 | Patch without `source`. | `PATCH` body rejecting unknown keys (strict Zod); `source` in body → **400** on public route. |
| S4.1.4 | Delete row. | `DELETE` → **200** `{ "ok": true, "id": "..." }` or **404**. |

### REQ-S4.2 — Production secret gate

| ID | Requirement | Acceptance criteria |
|----|-------------|---------------------|
| S4.2.1 | Secret required in production. | `NODE_ENV=production` and blank `ALIGNMENT_CONTEXT_API_SECRET` → **503** `Misconfigured`. |
| S4.2.2 | Wrong or missing header when secret set. | **401** `Unauthorized`. |
| S4.2.3 | Correct header. | **2xx** for valid operations. |

### REQ-S4.3 — Admin BFF

| ID | Requirement | Acceptance criteria |
|----|-------------|---------------------|
| S4.3.1 | Unauthenticated admin routes. | `GET`/`POST`/`PATCH`/`DELETE` `/api/admin/alignment-context*` → **401** without session. |
| S4.3.2 | Authenticated non-admin. | **403** when session lacks admin role (per `requireOpenGrimoireAdminRoute`). |
| S4.3.3 | Admin PATCH provenance. | Optional `source` in JSON accepted (`ui` \| `import` \| `api`) per ALIGNMENT_CONTEXT_API. |

### REQ-S4.4 — Operator UI parity with BFF

| ID | Requirement | Acceptance criteria |
|----|-------------|---------------------|
| S4.4.1 | Title/body editable in UI. | From `/admin/alignment`, operator can change **title** and **body** and persist via `PATCH /api/admin/alignment-context/:id` without using curl/CLI alone. |
| S4.4.2 | Status shortcuts. | UI can still set `draft` / `active` / `archived` via PATCH. |

### REQ-S4.5 — CLI parity

| ID | Requirement | Acceptance criteria |
|----|-------------|---------------------|
| S4.5.1 | Patch all public fields. | `alignment-context-cli.mjs patch` supports every field allowed on public PATCH, including `attendee_id` (`--attendee-id`). |

---

## 5. Gap list (vs code + public audit)

| Gap ID | Description | Severity | Status |
|--------|-------------|----------|--------|
| G-S4-01 | Admin UI previously PATCHed only `status` (no title/body in UI). | Medium (critic) | **Closed** — `/admin/alignment` edit flow ships with OA-FR-4. |
| G-S4-02 | CLI `patch` lacked `--attendee-id`. | Low | **Closed** — flag added + doc. |
| G-S4-03 | `PATCH source` policy for operators | Low | **Documented** — optional provenance select in admin UI + API-only alternative in ALIGNMENT_CONTEXT_API; public route never accepts `source`. |
| G-S4-04 | REQ-4.1 automated same-payload REST vs MCP proof | Medium | **Partial** — Vitest covers **public vs admin PATCH `source`** at the Zod layer ([schemas.test.ts](../../src/lib/alignment-context/schemas.test.ts)); full HTTP/MCP golden parity still **deferred** Wave 2 in [OPENGRIMOIRE_BASE_FEATURES_ENGINEERING_PLAN.md](./OPENGRIMOIRE_BASE_FEATURES_ENGINEERING_PLAN.md). |
| G-S4-05 | Alignment `body` may hold untrusted text | Medium (process) | **Open** — harness must apply secure-contain-protect; see AGENT_INTEGRATION + TOOL_SAFEGUARDS cross-links. |

---

## 6. Verification and smoke checklist

### 6.1 Preconditions

- Repo root: `npm install`, `npm run dev` (default **http://localhost:3001**).
- Set `ALIGNMENT_CONTEXT_API_SECRET` for gate tests (or `ALIGNMENT_CONTEXT_ALLOW_INSECURE_LOCAL=true` in non-production only).

### 6.2 Public API (curl)

Replace `<SECRET>` and `<BASE>` (e.g. `http://localhost:3001`).

```bash
export BASE=http://localhost:3001
export HDR="x-alignment-context-key: <SECRET>"

curl -sS -H "$HDR" "$BASE/api/alignment-context?limit=5"
curl -sS -H "$HDR" -H "Content-Type: application/json" \
  -d '{"title":"OA-FR-4 smoke","body":null,"tags":[],"status":"draft"}' \
  "$BASE/api/alignment-context"
# Note item id from response as ID
curl -sS -H "$HDR" -H "Content-Type: application/json" \
  -X PATCH -d '{"title":"OA-FR-4 smoke updated"}' \
  "$BASE/api/alignment-context/ID"
curl -sS -H "$HDR" -X DELETE "$BASE/api/alignment-context/ID"
```

**Negative:** omit header when secret is set → **401**. In production with no secret → **503**.

### 6.3 CLI

```bash
set ALIGNMENT_CONTEXT_API_SECRET=<SECRET>
node scripts/alignment-context-cli.mjs list --limit=5
node scripts/alignment-context-cli.mjs create --title "CLI smoke"
node scripts/alignment-context-cli.mjs patch <uuid> --title "patched" --body "text" --attendee-id null
node scripts/alignment-context-cli.mjs delete <uuid>
```

### 6.4 Admin UI + BFF

1. Log in at `/login` (admin operator).
2. Open `/admin/alignment` — list loads from `GET /api/admin/alignment-context`.
3. Use **Edit** on a row: change title/body (and optional **Source** for provenance correction); **Save** → `PATCH` with JSON body.
4. Use status buttons → `PATCH` with `{ status }` only.

### 6.5 Unit — PATCH `source` (Zod)

- `npm run test -- src/lib/alignment-context/schemas.test.ts` — public PATCH schema rejects `source`; admin PATCH schema accepts `ui` \| `import` \| `api`.

### 6.6 Optional Playwright / e2e

- Patterns for `x-alignment-context-key`: [e2e/clarification-queue.spec.ts](../../e2e/clarification-queue.spec.ts), [e2e/admin-moderation.spec.ts](../../e2e/admin-moderation.spec.ts) (alignment key must not authorize moderation).

---

## 7. Related

- [OPENGRIMOIRE_SYSTEMS_INVENTORY.md](../OPENGRIMOIRE_SYSTEMS_INVENTORY.md) — alignment row + SQLite note.  
- [MiscRepos pending_tasks — OPENGRIMOIRE_FULL_REVIEW](../../../MiscRepos/.cursor/state/pending_tasks.md) — mark OA-FR-4 **done** when this matrix + harness row are accepted.

---

## 8. Changelog

| Date | Change |
|------|--------|
| 2026-04-16 | Initial OA-FR-4 matrix: SQLite canonical persistence, REQ/AC, gaps, verification; admin UI + CLI parity closure. |
| 2026-04-16 | `OPENGRIMOIRE_BASE_URL` doc/code cleanup (removed duplicate `process.env` reads); G-S4-04 partial — `schemas.test.ts` for public vs admin `source`. |
