# Optional thin MCP over OpenGrimoire (stub)

There is **no** MCP server package in this repo. Agents should use **`fetch`** / **`curl`** to documented HTTP routes, or the alignment CLI — see [docs/agent/INTEGRATION_PATHS.md](../../docs/agent/INTEGRATION_PATHS.md).

If you add a dedicated MCP server **elsewhere** (e.g. portfolio harness), map tools 1:1 to existing methods:

| Tool name (example) | HTTP |
|---------------------|------|
| `alignment_context_list` | `GET /api/alignment-context` |
| `alignment_context_create` | `POST /api/alignment-context` |
| `alignment_context_patch` | `PATCH /api/alignment-context/:id` |
| `alignment_context_delete` | `DELETE /api/alignment-context/:id` |
| `brain_map_graph_get` | `GET /api/brain-map/graph` |
| `clarification_requests_*` | per [CLARIFICATION_QUEUE_API.md](../../docs/agent/CLARIFICATION_QUEUE_API.md) |

Pass through headers (`x-alignment-context-key`, `x-clarification-queue-key`, `x-brain-map-key`) and env-backed secrets; do not embed business rules beyond request shaping.

Portfolio MCP inventory (if present): `.cursor/docs/MCP_CAPABILITY_MAP.md` in your MiscRepos / Cursor workspace.
