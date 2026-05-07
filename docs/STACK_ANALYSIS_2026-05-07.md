# OpenGrimoire software stack analysis (2026-05-07)

## 1) Context and intention

OpenGrimoire is intentionally built as a **local-first operator workspace** where context (brain map), intent alignment, and human-in-the-loop operator controls live in one product. It separates:

- **Context atlas path** (static JSON graph and visualization), and
- **Operational path** (survey/alignment/admin on local SQLite + authenticated operator sessions).

This split suggests a design intention to keep the high-frequency exploration UI lightweight while preserving durable operator workflows in local persistence.

## 2) Current software stack (what it does)

### Frontend/UI
- **Next.js 14 + React 18 + TypeScript + Tailwind** for App Router pages and typed UI.
- **D3.js + Three.js** for 2D/3D context visualization.
- **React Context + Zustand** for client-side state slices.

### Backend/API
- **Next.js route handlers** expose product APIs (brain-map graph, survey, alignment context, clarification queue, capabilities, auth/session).
- **Local SQLite (`better-sqlite3`)** with app-managed schema/bootstrap for survey/alignment/admin data.
- **Operator auth cookie session** for admin surfaces; optional shared-secret header path for alignment/agent endpoints.

### Data/integration model
- **Graph data contract** is static JSON in `public/*` and served via `/api/brain-map/graph`.
- **Graph generation pipeline** is externalized to sibling tooling (`MiscRepos/.cursor/scripts/build_brain_map.py`) and can merge multiple state/vault roots.
- **Wiki mirror** is one-way read-only from vault into `public/wiki` (Phase B behavior), preserving markdown vault as SSOT.

## 3) Architectural patterns observed

1. **Deliberate dual-mode architecture**
   - Mode A: static local graph for reliability/simplicity.
   - Mode B: authenticated operational workflows with SQLite persistence.

2. **Strict boundary between UX names and system entities**
   - “Sync Session” (UX) vs “Alignment Context” (system API) are explicitly differentiated.

3. **Spec-driven governance**
   - The repo codifies REST contracts, route index verification, capabilities index, and API surface checks (`verify:*`) as guardrails.

4. **Local ownership > hosted dependency**
   - Avoiding hosted DB by default lowers operational complexity and supports private single-operator workflows.

5. **Agent-native interoperability as first-class concern**
   - Dedicated agent integration docs, capabilities endpoint, and alignment CLI indicate intent to support both human and machine operators.

## 4) Improvement/optimization opportunities

### A. Performance and UX
- Add **incremental graph loading** for large atlases (chunked node/edge hydration).
- Use **web workers** for heavy D3 layout computation to reduce main-thread jank.
- Cache static graph responses with **ETag + immutable fingerprints** for fast reloads.
- Introduce **server/client rendering boundaries audit** to ensure heavy viz remains client-only while reducing JS bundle size elsewhere.

### B. Data model and operations
- Add **SQLite WAL mode + vacuum/backup policy** docs and startup checks.
- Add **schema/version health endpoint** for operator diagnostics.
- Introduce **retention policies** for survey/clarification/study tables and UI controls for pruning/export.

### C. Developer and release quality
- Expand `verify` gates with:
  - OpenAPI drift diff check artifact,
  - capabilities/openapi/route index parity report,
  - migration/bootstrap idempotency tests.
- Add **contract tests** for auth matrix in REST contract (public vs session vs shared-secret).

## 5) Security hardening ideas

1. **Session hardening**
   - Rotate session secrets with explicit key versioning strategy.
   - Enforce secure cookie flags per environment and add expiry/inactivity thresholds.

2. **Secret handling**
   - Guardrails that fail CI if `NEXT_PUBLIC_*` includes known secret-like names.
   - Runtime warning banner when insecure local alignment mode is enabled.

3. **API abuse protection**
   - Add rate limiting for login, survey submission, and alignment POST/PATCH routes.
   - Add structured audit events for failed auth and sensitive mutation endpoints.

4. **Input integrity and provenance**
   - Tighten payload schema validation and response normalization at route boundaries.
   - Optional signing/provenance metadata for imported graph/wiki artifacts.

5. **Operational security visibility**
   - Extend admin observability with endpoint-level auth failure dashboards.
   - Add “security posture” panel showing required env vars and active protection toggles.

## 6) Feature brainstorm (high-value additions)

### Product capabilities
- **Cross-surface timeline** linking Sync Session submissions, alignment updates, and clarification events.
- **Context freshness scoring** for stale brain-map nodes and orphaned references.
- **Trust-boundary annotations** in graph nodes/edges (human assertion vs generated vs external source).
- **Runbook automation hooks** from `/admin/observability` to remediation actions.

### Agent-native enhancements
- `/api/capabilities` auto-generation from OpenAPI + policy overlays.
- Machine-readable **auth policy manifest** (route x allowed auth modes).
- “Dry-run mutation mode” for agents (simulate writes; return validation/audit diffs).

### Governance and reliability
- Built-in **backup/restore UI** for SQLite with checksum verification.
- **Data residency profile switch** (strict local-only vs synchronized mirror mode).
- **Changefeed export** (append-only JSONL) for external analytics and incident replay.

## 7) Suggested prioritization (90-day)

1. **Security baseline sprint**: rate limiting, auth event logs, secret posture checks.
2. **Performance sprint**: workerized graph layout + cache semantics + bundle audit.
3. **Reliability sprint**: SQLite backup/restore, retention, and health endpoints.
4. **Agent maturity sprint**: auth policy manifest + dry-run writes + capability automation.

## 8) Success metrics

- P95 visualization interaction latency (large graph) reduced by 30%.
- Failed auth attempts fully observable with actionable admin dashboards.
- Zero undocumented auth modes across public routes.
- 100% parity across OpenAPI, capabilities endpoint, and route index checks.
- Recovery time objective for local DB restore under 15 minutes.
