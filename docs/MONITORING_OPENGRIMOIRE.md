# Monitoring: OpenGrimoire (product) vs portfolio

**Purpose:** Split observability so Next.js/API metrics are not confused with MiscRepos orchestration or MCP host processes.

---

## OpenGrimoire (this repo)

| Signal | How | Notes |
|--------|-----|--------|
| Dev server | `npm run dev` (port **3001** per `package.json`) | Crash = no UI. |
| API errors | Server logs, browser Network tab | 401 alignment/brain-map when secrets mis-set; 503 misconfig. |
| Rate limit | `middleware.ts` — survey **429** | Per-process; see REST contract. |
| E2E health | `npm run test:e2e` | Playwright; CI gate if wired. |

**Not in-repo by default:** Centralized APM, log shipping, or Redis-backed rate limits—add only if product scopes them.

---

## Portfolio (MiscRepos, local-proto, harness scripts)

| Signal | Where to look |
|--------|----------------|
| Orchestrator runs | MiscRepos `.cursor/scripts/orchestrator.py`, `orchestrator_config.json` |
| Brain map build | `build_brain_map.py`, CI job logs |
| MCP servers | `.cursor/mcp.json`, MCP host stderr |

Document run-level success/failure in **orchestrator** or **known-issues** docs; do not duplicate full logs inside this app.

---

## OpenHarness

Handoff integrity and scripts: `OpenHarness` docs + `validate_handoff_scp.py` references in [HANDOFF_FLOW.md](../../OpenHarness/docs/HANDOFF_FLOW.md).

---

## Links

- [scope_opengrimoire_mvp_agent_native.md](./scope_opengrimoire_mvp_agent_native.md) — R5 monitoring split.
- [ARCHITECTURE_REST_CONTRACT.md](./ARCHITECTURE_REST_CONTRACT.md) — HTTP behavior.
