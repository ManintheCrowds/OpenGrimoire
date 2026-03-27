# OpenGrimoire — operational tradeoffs

Concise engineering decisions for production and agent integration. Normative HTTP rules remain in [`ARCHITECTURE_REST_CONTRACT.md`](../ARCHITECTURE_REST_CONTRACT.md).

| Topic | Decision |
|-------|----------|
| **Rate limits** | In-memory sliding windows in [`middleware.ts`](../../middleware.ts) are **per Node process**. Multi-instance or serverless replicas need a **shared** limiter (Redis / edge KV) or accept **approximate** limits per instance. |
| **Survey visualization reads** | Tradeoff: **`SURVEY_VISUALIZATION_ALLOW_PUBLIC=true`** (simple public demos) vs **strict** gating (no public reads; admin session or headers only). See [`survey-read-gate.ts`](../../src/lib/survey/survey-read-gate.ts) and [`AGENT_INTEGRATION.md`](../AGENT_INTEGRATION.md). |
| **Operator auth** | **Single** shared operator password + signed JWT cookie session. **Multi-operator** or multi-device sessions would require a different model (e.g. Lucia + SQLite sessions table) — optional upgrade path. |
| **Capability discovery** | **Hand-maintained** [`GET /api/capabilities`](../../src/app/api/capabilities/route.ts) + entity matrix in [`ARCHITECTURE_REST_CONTRACT.md`](../ARCHITECTURE_REST_CONTRACT.md) vs **generated OpenAPI** (OA-REST-2): lower drift risk from codegen vs ongoing maintenance cost. |
| **Agent-native parity / discovery scores** | Raising scores in the [agent-native audit](../AGENT_NATIVE_AUDIT_OPENGRIMOIRE.md) usually means **harness** and **MCP** work **outside** this repo (thin tools over REST), not additional React surface area. |

## Related

- [`HITL_INTENT_SURVEY_BACKLOG.md`](../HITL_INTENT_SURVEY_BACKLOG.md) — future async human-intent form (not the intake survey).
