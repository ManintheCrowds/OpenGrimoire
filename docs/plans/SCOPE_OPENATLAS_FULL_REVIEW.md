# OpenAtlas — full product-scope review (charter)

**Status:** Draft — fill during OA-FR-SCOPE.  
**Harness tasks:** [.cursor/state/pending_tasks.md](../../../.cursor/state/pending_tasks.md) § **OPENATLAS_FULL_REVIEW**.

## Definition of “fully functioning”

_Complete after stakeholder pass:_ e.g. production deploy confidence, operator workflows end-to-end, no critical security gaps, documented env + runbooks, and agreed MVP vs deferred.

## Four systems (review units)

| # | System | Primary surfaces | Notes |
|---|--------|------------------|--------|
| 1 | **Survey & moderation** | `/survey`, `/admin`, `/login`, `POST /api/survey` | Supabase RLS, attendee/responses pipeline |
| 2 | **Data visualization** | `/visualization`, `/visualization/*`, constellation/test pages | Alluvial/Chord, hooks, quotes, debug flags |
| 3 | **Brain map / context atlas** | `build_brain_map.py` → JSON → `GET /api/brain-map/graph` → `/context-atlas` | Ports, `BRAIN_MAP_*`, EMPTY_GRAPH |
| 4 | **Alignment & operator APIs** | `/api/alignment-context`, `/admin/alignment`, `docs/agent/*`, CLI | Migration, prod secret, agent parity |

## Product-scope outputs (per system)

For each system, capture:

1. **Requirements** — numbered, who it’s for, dependencies on other systems.  
2. **Acceptance criteria** — Given/When/Then or checklist an independent reviewer can run.  
3. **Gaps** — vs code, vs [PUBLIC_SURFACE_AUDIT.md](../security/PUBLIC_SURFACE_AUDIT.md), vs critic notes.  
4. **Verification** — commands, URLs, operator order.

## Cross-cutting

- Deployment: [DEPLOYMENT.md](../../DEPLOYMENT.md), Docker, env matrix ([.env.example](../../.env.example)).  
- Agent-native parity: [MCP_CAPABILITY_MAP](../../../.cursor/docs/MCP_CAPABILITY_MAP.md) § OpenAtlas.  
- **Goal–constraint conflicts:** escalate; do not silently narrow scope.
