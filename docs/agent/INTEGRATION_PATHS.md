# OpenAtlas — agent and harness integration paths

**Purpose:** Recommended stack for **action parity** without inventing parallel business layers. There is **no** OpenAtlas-branded MCP server in this repo; parity is **API-shaped** first.

**Normative contract:** [ARCHITECTURE_REST_CONTRACT.md](../ARCHITECTURE_REST_CONTRACT.md).

---

## Primary: HTTP + thin CLI

- **Alignment context:** Full list/create/patch/delete via [ALIGNMENT_CONTEXT_API.md](./ALIGNMENT_CONTEXT_API.md) and [`scripts/alignment-context-cli.mjs`](../../scripts/alignment-context-cli.mjs) (`list`, `create`, `patch`, `delete`).
- **Brain-map graph:** `GET /api/brain-map/graph` for the JSON document consumed by the viewer.

Set `OPENATLAS_BASE_URL` to your OpenAtlas origin (local dev defaults to port **3001** — see README). Set `ALIGNMENT_CONTEXT_API_SECRET` when the server enforces `x-alignment-context-key`.

---

## Browser automation (UI-only paths)

Where there is no stable API for a user action, use **Playwright** (CI truth), **Maestro** (optional YAML smoke), or generic browser MCP — see [e2e/maestro/README.md](../../e2e/maestro/README.md) and portfolio-harness [Agent-Native-Testing.md](../../../docs/Agent-Native-Testing.md).

---

## Optional future: thin MCP over REST

A dedicated MCP server could expose **only** thin wrappers around existing endpoints (e.g. `alignment_context_list`, `alignment_context_create`, `brain_map_graph_get`) — **not** a second orchestration or business layer. Workspace-wide MCP inventory: [`.cursor/docs/MCP_CAPABILITY_MAP.md`](../../../.cursor/docs/MCP_CAPABILITY_MAP.md).

Scoring note: “OpenAtlas in the name” on a tool is **optional**; parity is measured by **REST + CLI + E2E**, not branding.
