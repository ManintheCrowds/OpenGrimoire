# Handoff follow-up triage (2026-04-01)

Source: sibling **MiscRepos** repo — `.cursor/state/handoff_latest.md` (OpenGrimoire “Next” bullets: thin MCP, `GET /api/alignment-context/[id]`, `/help`, rate limits).

## Decision

| Item | Disposition | Notes |
|------|-------------|--------|
| **Thin MCP package** | **Deferred** | Largest surface area; revisit when you need discoverable packaged tools for external agents. |
| **`GET /api/alignment-context/[id]`** | **Next candidate** when API parity matters | Single read-by-id endpoint improves agent ergonomics without committing to a full MCP server. |
| **`/help` linking USAGE + capabilities** | **Deferred** | Documentation-first; capabilities already exposed at `GET /api/capabilities`. |
| **Rate limits (alignment APIs)** | **Deferred** | Handoff calls out when automation volume increases; already documented for production patterns elsewhere. |

## Rationale

Ship **community-visible** README and announcement paths first. Prioritize **one REST gap** (read by id) over **MCP packaging** when you next touch agent integration.

## References

- [docs/AGENT_INTEGRATION.md](../AGENT_INTEGRATION.md)
- [docs/agent/ALIGNMENT_CONTEXT_API.md](../agent/ALIGNMENT_CONTEXT_API.md)
- `GET /api/capabilities` — route implementation under `src/app/api/capabilities/`
