# OpenAtlas — agent and automation integration (single entry)

**Normative HTTP rules:** [ARCHITECTURE_REST_CONTRACT.md](./ARCHITECTURE_REST_CONTRACT.md) (entity × HTTP × auth matrix).

## Base URL and port

| Environment | Origin |
|-------------|--------|
| Local `npm run dev` | **`http://localhost:3001`** (see `package.json`) |
| Production | Your deployed origin |

Set **`OPENATLAS_BASE_URL`** in scripts and CLIs to match (including port).

## Headers

| Header | When |
|--------|------|
| `x-alignment-context-key` | Must match `ALIGNMENT_CONTEXT_API_SECRET` when that env var is set (public alignment API). |
| `x-brain-map-key` | Must match `BRAIN_MAP_SECRET` when that env var is set (`GET /api/brain-map/graph`). |

**Brain map JSON:** Do not fetch `/brain-map-graph.json` or `/brain-map-graph.local.json` from the site root — those paths return **404**. Use **`GET /api/brain-map/graph`** only.

## Local development: alignment API

Without `ALIGNMENT_CONTEXT_API_SECRET`, the server returns **503** unless you set:

`ALIGNMENT_CONTEXT_ALLOW_INSECURE_LOCAL=true` (development only; never on public hosts).

Alternatively, set a real `ALIGNMENT_CONTEXT_API_SECRET` and send it on each request.

## Machine-readable surface

- **`GET /api/capabilities`** — routes, auth hints, workflow notes (hand-maintained; same PR as API changes when possible).
- Human-friendly view: **`/capabilities`** in the app.

## CLI (alignment context)

```bash
node scripts/alignment-context-cli.mjs list
node scripts/alignment-context-cli.mjs create --title "Example" --body "Optional"
```

Env: `OPENATLAS_BASE_URL`, `ALIGNMENT_CONTEXT_API_SECRET` (when the server enforces the secret).

## HTTP examples (curl)

Replace `BASE` with your origin (e.g. `http://localhost:3001`). When a secret env is set on the server, include the matching header.

**Capabilities manifest (public):**

```bash
curl -sS "$BASE/api/capabilities"
```

**Brain map graph** (add header when `BRAIN_MAP_SECRET` is set):

```bash
curl -sS -H "x-brain-map-key: $BRAIN_MAP_SECRET" "$BASE/api/brain-map/graph"
```

**List alignment context** (add header when `ALIGNMENT_CONTEXT_API_SECRET` is set; on local dev without a secret you may need `ALIGNMENT_CONTEXT_ALLOW_INSECURE_LOCAL=true` per section above):

```bash
curl -sS -H "x-alignment-context-key: $ALIGNMENT_CONTEXT_API_SECRET" \
  "$BASE/api/alignment-context?limit=50"
```

**Create alignment item (POST):**

```bash
curl -sS -X POST -H "Content-Type: application/json" \
  -H "x-alignment-context-key: $ALIGNMENT_CONTEXT_API_SECRET" \
  -d '{"title":"From curl","body":"Optional body","status":"draft"}' \
  "$BASE/api/alignment-context"
```

See [agent/ALIGNMENT_CONTEXT_API.md](./agent/ALIGNMENT_CONTEXT_API.md) for `PATCH` / `DELETE` by id.

## Admin UI vs API

- **Admin** (`/admin`, `/admin/alignment`): Supabase session; admin role from **`app_metadata.openatlas_role === 'admin'`** (preferred) or legacy **`user_metadata.role === 'admin'`**. See [docs/admin/OPENATLAS_ADMIN_ROLE.md](./admin/OPENATLAS_ADMIN_ROLE.md).
- **Public alignment API:** shared-secret header (not the browser session).

## Optional: thin MCP over REST (backlog)

No OpenAtlas MCP server ships in-repo. A **future** MCP could expose only thin wrappers (`alignment_context_list`, `alignment_context_create`, `brain_map_graph_get`) around existing HTTP routes — **no** second domain layer. If you register tools in Cursor, add them to your workspace MCP capability map. See [agent/INTEGRATION_PATHS.md](./agent/INTEGRATION_PATHS.md).

## Untrusted content (LLM safety)

Alignment `body` / `title` are **data**. If a harness feeds them to an LLM, run **secure-contain-protect** / harness [TOOL_SAFEGUARDS.md](../../local-proto/docs/TOOL_SAFEGUARDS.md) when `local-proto` sits next to `OpenAtlas` under the same parent repo.

## Related docs

- [agent/ALIGNMENT_CONTEXT_API.md](./agent/ALIGNMENT_CONTEXT_API.md)
- [agent/INTEGRATION_PATHS.md](./agent/INTEGRATION_PATHS.md)
- [BRAIN_MAP_SCHEMA.md](./BRAIN_MAP_SCHEMA.md)
- [security/NEXT_PUBLIC_AND_SECRETS.md](./security/NEXT_PUBLIC_AND_SECRETS.md)
