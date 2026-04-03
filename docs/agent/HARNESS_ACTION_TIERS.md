# Harness action tiers (trust and HTTP mapping)

**Purpose:** Map **read-only**, **mutating**, and **shell / OS** work to OpenGrimoire’s public HTTP contract and to harness-side execution. Normative detail: [ARCHITECTURE_REST_CONTRACT.md](../ARCHITECTURE_REST_CONTRACT.md). **Unified manifest:** [AGENT_TOOL_MANIFEST.md](../AGENT_TOOL_MANIFEST.md).

| Tier | Agent meaning | OpenGrimoire HTTP | Harness / MCP |
|------|----------------|-------------------|---------------|
| **Read** | Repeatable observation; no durable writes | GET to documented public routes; `GET /api/capabilities` needs no secret | Read-only tools (e.g. fetch, list, grep) per [MiscRepos MCP_CAPABILITY_MAP.md](../../../MiscRepos/.cursor/docs/MCP_CAPABILITY_MAP.md) |
| **Mutate** | Creates or changes persisted state | POST / PATCH / DELETE per matrix; secrets in headers per route | Tools that write DB, open PRs, or POST to mutate endpoints |
| **Shell** | Executes host commands | *Not* exposed as arbitrary shell over HTTP | `run_terminal_cmd`, Docker MCP, etc. — same map |

---

## curl examples (local dev)

Set **`BASE=http://localhost:3001`** (see `package.json` `dev` port). Replace secrets with your `.env.local` values.

### Read tier — discovery (no auth)

```bash
curl -sS "$BASE/api/capabilities" | head -c 400
```

### Read tier — alignment list (requires `ALIGNMENT_CONTEXT_API_SECRET`)

```bash
curl -sS -H "x-alignment-context-key: YOUR_SECRET" "$BASE/api/alignment-context"
```

### Mutate tier — create alignment item

```bash
curl -sS -X POST "$BASE/api/alignment-context" \
  -H "Content-Type: application/json" \
  -H "x-alignment-context-key: YOUR_SECRET" \
  -d '{"title":"Tier example","body":"From HARNESS_ACTION_TIERS.md"}'
```

### Mutate tier — Sync Session submit (public POST; body shape from survey schema)

```bash
curl -sS -X POST "$BASE/api/survey" \
  -H "Content-Type: application/json" \
  -d '{}'
```

`200` responses include `attendeeId` and `surveyResponseId` when validation passes; empty `{}` may **422** — use a real payload for integration tests ([SYNC_SESSION_HANDOFF.md](./SYNC_SESSION_HANDOFF.md)).

### Shell tier

There is **no** `curl` for shell. Use the harness (MiscRepos/OpenHarness scripts, Cursor `run_terminal_cmd`, MCP servers) per [AGENT_TOOL_MANIFEST.md](../AGENT_TOOL_MANIFEST.md) § Workspace MCP.

---

## Cross-links

- [AGENT_INTEGRATION.md](../AGENT_INTEGRATION.md) — quick reference and headers.  
- [ADR_IDEMPOTENCY_AND_RETRY.md](./ADR_IDEMPOTENCY_AND_RETRY.md) — safe retries vs blind POST retries.
