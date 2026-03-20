# Alignment context HTTP API (agent + operator contract)

Single reference for **machines and agents** integrating with OpenAtlas `alignment_context_items`. UI operators may prefer `/admin/alignment` (session auth).

**Related:** [OPERATOR_ALIGNMENT_SETUP.md](./OPERATOR_ALIGNMENT_SETUP.md), [PUBLIC_SURFACE_AUDIT.md](../security/PUBLIC_SURFACE_AUDIT.md), [DEPLOYMENT.md](../../DEPLOYMENT.md).

## Base URL

- Local dev (matches `npm run dev` in OpenAtlas `package.json`): **`http://localhost:3001`**
- Production: your deployed origin

Always set `OPENATLAS_BASE_URL` explicitly in scripts/agents if the origin might differ. The [alignment-context-cli.mjs](../../scripts/alignment-context-cli.mjs) defaults to the same port as local dev.

## Public API (shared secret)

All of the following require header **`x-alignment-context-key`** when `ALIGNMENT_CONTEXT_API_SECRET` is set in server env (including all production deploys). Value must match the env var exactly.

| Condition | Response |
|-----------|----------|
| `NODE_ENV=production` and secret missing/blank | **503** `Misconfigured` |
| Secret set, wrong/missing header | **401** `Unauthorized` |
| Dev, secret unset | Open (use localhost only) |

### `GET /api/alignment-context`

Query params:

- `limit` — optional, default `100`, max `500`
- `status` — optional: `draft` | `active` | `archived`

Response **200:**

```json
{ "items": [ { "id", "title", "body", "tags", "priority", "status", "linked_node_id", "attendee_id", "source", "created_by", "created_at", "updated_at" } ] }
```

Headers: `Cache-Control: private, no-store`

### `POST /api/alignment-context`

Body (JSON):

| Field | Required | Notes |
|-------|----------|--------|
| `title` | yes | string, 1–2000 chars |
| `body` | no | string or null |
| `tags` | no | string array (default `[]`) |
| `priority` | no | integer or null |
| `status` | no | `draft` \| `active` \| `archived` (default `draft`) |
| `linked_node_id` | no | string or null |
| `attendee_id` | no | UUID or null |

Server sets `source` to **`api`** (ignored if client sends it).

Response **201:** `{ "item": { ... } }`  
**400:** `{ "error": "Validation failed", "issues": ... }`

### `PATCH /api/alignment-context/:id`

Body: any subset of create fields plus optional `source` (`ui` \| `import` \| `api`). At least one field required.

Response **200:** `{ "item": { ... } }`  
**404:** `{ "error": "Not found" }`

### `DELETE /api/alignment-context/:id`

Hard delete.

Response **200:** `{ "ok": true, "id": "<uuid>" }`  
**404:** not found

---

## Admin BFF (browser session)

For logged-in **admin** users (same cookie session as `/admin`). **No** `x-alignment-context-key`.

| Method | Path | Notes |
|--------|------|--------|
| GET | `/api/admin/alignment-context` | Same query params as public GET |
| POST | `/api/admin/alignment-context` | Creates with `source: ui`, `created_by: <user id>` |
| PATCH | `/api/admin/alignment-context/:id` | Same as public PATCH |
| DELETE | `/api/admin/alignment-context/:id` | Same as public DELETE |

**401** if not logged in. **403** if logged in but not `user_metadata.role === 'admin'`.

---

## CLI (harness / agents)

From `OpenAtlas` directory:

```bash
set OPENATLAS_BASE_URL=http://localhost:3001
set ALIGNMENT_CONTEXT_API_SECRET=your-secret

node scripts/alignment-context-cli.mjs list
node scripts/alignment-context-cli.mjs list --status=active
node scripts/alignment-context-cli.mjs create --title "Hello" --body "Optional"
node scripts/alignment-context-cli.mjs patch <uuid> --status active
node scripts/alignment-context-cli.mjs delete <uuid>
```

PowerShell: `$env:OPENATLAS_BASE_URL="..."`; `$env:ALIGNMENT_CONTEXT_API_SECRET="..."`.

If secret is unset locally, CLI omits the header (matches open dev server behavior).

---

## A2UI / declarative UI

OpenAtlas visualization exposes `data-region` and `usageHint` on components (see [A2UI_FRONTEND_DESIGN_GUIDANCE.md](../../../.cursor/docs/A2UI_FRONTEND_DESIGN_GUIDANCE.md)). This document is the **operator data API** contract; it does not duplicate A2UI component schemas.
