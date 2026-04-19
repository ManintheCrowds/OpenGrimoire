# OA-FR-X — Cross-cutting go-live checklist

**Harness ID:** OA-FR-X  
**Charter:** [SCOPE_OPENGRIMOIRE_FULL_REVIEW.md](./SCOPE_OPENGRIMOIRE_FULL_REVIEW.md) — cross-cutting (last gate after OA-FR-1 … OA-FR-4)  
**Status:** Go-live matrix (this document).  
**Normative deployment:** [DEPLOYMENT.md](../../DEPLOYMENT.md) · **Env template:** [`.env.example`](../../.env.example) · **Security:** [PUBLIC_SURFACE_AUDIT.md](../security/PUBLIC_SURFACE_AUDIT.md) · **REQ / waves:** [OPENGRIMOIRE_BASE_FEATURES_ENGINEERING_PLAN.md](./OPENGRIMOIRE_BASE_FEATURES_ENGINEERING_PLAN.md)

---

## 1. Scope

This checklist is for **operators and maintainers** preparing a production or staging cut: Docker vs bare Node, required secrets, local verification commands, agent-vs-human parity expectations, and where to read next. It does **not** replace [DEPLOYMENT.md](../../DEPLOYMENT.md); it sequences and cross-checks it against the repo.

**Per-system matrices (already shipped):**

| System | Matrix |
|--------|--------|
| 1 Survey & moderation | [OA_FR_1_SYSTEM1_SURVEY_MODERATION.md](./OA_FR_1_SYSTEM1_SURVEY_MODERATION.md) |
| 2 Data visualization | [OA_FR_2_SYSTEM2_DATA_VISUALIZATION.md](./OA_FR_2_SYSTEM2_DATA_VISUALIZATION.md) |
| 3 Brain map / context atlas | [BRAIN_MAP_HUB.md](../../../MiscRepos/docs/BRAIN_MAP_HUB.md) (MiscRepos hub) + charter System 3 notes |
| 4 Alignment & operator APIs | [OA_FR_4_SYSTEM4_ALIGNMENT_OPERATOR_APIS.md](./OA_FR_4_SYSTEM4_ALIGNMENT_OPERATOR_APIS.md) |

---

## 2. Docker and runtime parity

| Mode | Listen port | Notes |
|------|-------------|--------|
| `npm run dev` | **3001** | [package.json](../../package.json) `next dev -p 3001`. [.env.example](../../.env.example) defaults `NEXT_PUBLIC_APP_URL=http://localhost:3001`. |
| `docker compose up` | **3000** inside container; host map **3000:3000** | [docker-compose.yml](../../docker-compose.yml); healthcheck `curl -f http://localhost:3000/`. [DEPLOYMENT.md](../../DEPLOYMENT.md) § Quick Docker. |

**Operator footgun:** Do not mix dev URLs (`:3001`) with Docker (`:3000`) without updating `NEXT_PUBLIC_APP_URL` and any reverse proxy `proxy_pass` (DEPLOYMENT § Nginx shows `localhost:3000` for Docker).

**Checklist:**

1. [ ] `cp .env.example .env.local` (or compose env file) and set production secrets (§3).
2. [ ] For Docker: volume or bind for `OPENGRIMOIRE_DB_PATH` (default `/data/opengrimoire.sqlite` in compose).
3. [ ] `docker compose up -d` then `docker compose logs -f opengrimoire` until healthy.
4. [ ] `curl -f http://localhost:3000/` (or mapped host port) returns success.
5. [ ] `/login` works with `OPENGRIMOIRE_ADMIN_PASSWORD` or hash + `OPENGRIMOIRE_SESSION_SECRET`.

---

## 3. Environment completeness (production vs `.env.example`)

| Variable / topic | Production (per DEPLOYMENT) | Row in `.env.example` | Notes |
|------------------|----------------------------|------------------------|--------|
| `OPENGRIMOIRE_SESSION_SECRET` | Required | Commented template | Cookie signing for `/admin/*`. |
| `OPENGRIMOIRE_ADMIN_PASSWORD` or `_HASH` | Required (one of) | Commented | Prefer hash in prod. |
| `ALIGNMENT_CONTEXT_API_SECRET` | Required for alignment public API | Commented | Callers send `x-alignment-context-key`. |
| `OPENGRIMOIRE_DB_PATH` | Recommended for persistent SQLite | Commented | Docker default `/data/opengrimoire.sqlite`. |
| `NEXT_PUBLIC_APP_URL` | Set to public origin | Example `localhost:3001` | Must match user-facing URL scheme/host/port. |
| `NODE_ENV=production` | Yes for prod | `development` in template | Override in real deploy env. |
| `CLARIFICATION_QUEUE_API_SECRET` | Recommended (blast radius) | Commented | Optional dedicated `x-clarification-queue-key`. |
| `BRAIN_MAP_SECRET` | Optional hardening | Commented | See AGENT_INTEGRATION + NEXT_PUBLIC note. |
| Survey visualization / Turnstile / webhook | Optional ops | Commented block | See [AGENT_INTEGRATION.md](../AGENT_INTEGRATION.md). |

**Gap (track):** If DEPLOYMENT adds a new required variable, update `.env.example` in the same PR.

---

## 4. Verification and CI

**Local merge gate (authoritative today):**

```bash
npm ci
npm run verify    # lint + type-check + test + verify:capabilities + verify:openapi + verify:route-index + verify:moderation-auth
```

**Optional deeper gate:**

```bash
npm run verify:e2e   # verify + Playwright (see playwright.config.ts for webServer env)
```

**`verify:*` scripts** (from [package.json](../../package.json)): `verify:capabilities`, `verify:moderation-auth`, `verify:openapi`, `verify:route-index`.

**Hosted CI:** This workspace clone may **not** include `.github/workflows/` (no in-repo Actions at matrix time). Treat **GitHub Actions** as optional until a workflow is committed; do not assume remote CI runs on every PR. When workflows exist, align them with `npm run verify` (see engineering plan Wave 1 — CI truth layer). **Doc drift:** [README.md](../../README.md), [DEPLOY_AND_VERIFY.md](../engineering/DEPLOY_AND_VERIFY.md), and [OPENGRIMOIRE_SYSTEMS_INVENTORY.md](../OPENGRIMOIRE_SYSTEMS_INVENTORY.md) may still mention a `ci.yml` path — reconcile or add waiver in ADR when adopting hosted CI.

---

## 5. Agent-native parity table (UI vs HTTP/CLI vs harness)

Thin agents should use **REST + documented CLIs**; workspace MCP tools stay **thin `fetch`** per [MiscRepos MCP_CAPABILITY_MAP.md](../../../MiscRepos/.cursor/docs/MCP_CAPABILITY_MAP.md) § OpenGrimoire / Brain Map.

| Capability | Operator UI | HTTP / npm script | Harness / MCP |
|------------|-------------|-------------------|---------------|
| Alignment CRUD | `/admin/alignment` (session) | `GET/POST/PATCH/DELETE` `/api/alignment-context` + header; `npm run alignment:cli` | MCP map: `alignment-context-cli.mjs` pattern |
| Capabilities discovery | (indirect) | `GET /api/capabilities` | Documented for agents |
| Brain map JSON | `/context-atlas`, `/brain-map` | `GET /api/brain-map/graph` | Rebuild: `build_brain_map.py` from MiscRepos |
| Sync Session submit | `/operator-intake` | `POST /api/survey` | See OA-FR-1 matrix |
| Moderation | `/admin` | Admin BFF routes (session only) | Alignment key must **not** authorize moderation ([verify-moderation-auth-purity.mjs](../../scripts/verify-moderation-auth-purity.mjs)) |

**Known partial parity:** REQ-4.1 full REST vs MCP same-payload golden tests — see [OA_FR_4_SYSTEM4_ALIGNMENT_OPERATOR_APIS.md](./OA_FR_4_SYSTEM4_ALIGNMENT_OPERATOR_APIS.md) gap G-S4-04 and engineering plan Wave 2.

---

## 6. Operator documentation index

**OpenGrimoire (this repo)**

| Audience | Start here |
|----------|--------------|
| Operator / deploy | [DEPLOYMENT.md](../../DEPLOYMENT.md), [OPERATOR_GUI_RUNBOOK.md](../OPERATOR_GUI_RUNBOOK.md), [USAGE_GUIDE.md](../USAGE_GUIDE.md) |
| Developer | [DEVELOPER_GUIDE.md](../DEVELOPER_GUIDE.md), [CONTRIBUTING.md](../../CONTRIBUTING.md), [TROUBLESHOOTING.md](../../TROUBLESHOOTING.md) |
| Agents / automation | [AGENT_INTEGRATION.md](../AGENT_INTEGRATION.md), [INTEGRATION_PATHS.md](../agent/INTEGRATION_PATHS.md), [ALIGNMENT_CONTEXT_API.md](../agent/ALIGNMENT_CONTEXT_API.md), [OA_FR_4_ALIGNMENT_AGENT_ONE_PAGER.md](../agent/OA_FR_4_ALIGNMENT_AGENT_ONE_PAGER.md) |
| Product + systems | [OPENGRIMOIRE_BASE_FEATURES.md](../OPENGRIMOIRE_BASE_FEATURES.md), [OPENGRIMOIRE_SYSTEMS_INVENTORY.md](../OPENGRIMOIRE_SYSTEMS_INVENTORY.md) |
| Security | [PUBLIC_SURFACE_AUDIT.md](../security/PUBLIC_SURFACE_AUDIT.md), [NEXT_PUBLIC_AND_SECRETS.md](../security/NEXT_PUBLIC_AND_SECRETS.md) |

**MiscRepos (sibling)**

| Topic | Doc |
|-------|-----|
| PKM / hybrid demo | [CONTEXT_PKM_E2E_DEMO.md](../../../MiscRepos/docs/CONTEXT_PKM_E2E_DEMO.md), [CONTEXT_PKM_PREREQUISITES.md](../../../MiscRepos/docs/CONTEXT_PKM_PREREQUISITES.md) |
| MCP matrix | [MCP_CAPABILITY_MAP.md](../../../MiscRepos/.cursor/docs/MCP_CAPABILITY_MAP.md) § OpenGrimoire |
| Ports | [PORT_REGISTRY.md](../../../MiscRepos/.cursor/docs/PORT_REGISTRY.md) |

---

## 7. Requirements, acceptance criteria, and gaps

### REQ-SX.1 — Reproducible deploy path

| ID | Requirement | Acceptance criteria |
|----|-------------|----------------------|
| SX.1.1 | Operator can follow documented steps without private tribal knowledge. | Clone → env from `.env.example` → `npm run verify` passes; or Docker path in DEPLOYMENT succeeds. |
| SX.1.2 | Production secrets documented. | DEPLOYMENT checklist vars present in `.env.example` (commented) or explicitly noted as operator-supplied only. |

### REQ-SX.2 — Verification before ship

| ID | Requirement | Acceptance criteria |
|----|-------------|----------------------|
| SX.2.1 | Local merge gate exists. | `npm run verify` is green before release tag or image publish. |
| SX.2.2 | Optional E2E | `npm run verify:e2e` documented; failures triaged or waived with reason. |

### REQ-SX.3 — Agent parity awareness

| ID | Requirement | Acceptance criteria |
|----|-------------|----------------------|
| SX.3.1 | No UI-only critical path without documented HTTP/CLI alternative for alignment and brain map reads. | Parity table §5 matches MCP map intent. |

### Gap list

| Gap ID | Description | Severity |
|--------|-------------|----------|
| G-SX-01 | Hosted GitHub Actions may be absent; README / DEPLOY_AND_VERIFY / inventory may reference `ci.yml` anyway. | Medium (docs) |
| G-SX-02 | Dev **3001** vs Docker **3000** — recurring misconfiguration risk. | Medium (ops) |
| G-SX-03 | REQ-4.1 full golden parity (REST vs MCP) still partial per OA-FR-4. | Medium (product) |

---

## 8. Verification commands (copy-paste)

**Bare Node (typical maintainer):**

```bash
git clone <repo-url>
cd OpenGrimoire
cp .env.example .env.local
# Edit .env.local: session secret, admin password or hash, alignment secret for prod-like tests
npm ci
npm run verify
npm run test:e2e   # optional; requires Playwright deps
```

**Docker:**

```bash
cp .env.example .env.local
# Export or compose-file: set OPENGRIMOIRE_SESSION_SECRET, OPENGRIMOIRE_ADMIN_PASSWORD, ALIGNMENT_CONTEXT_API_SECRET, NEXT_PUBLIC_APP_URL
docker compose up -d --build
curl -f http://localhost:3000/
```

---

## 9. Related

- [MiscRepos pending_tasks — OPENGRIMOIRE_FULL_REVIEW](../../../MiscRepos/.cursor/state/pending_tasks.md) — mark OA-FR-X **done** when this checklist is accepted.  
- [SCOPE_OPENGRIMOIRE_FULL_REVIEW.md](./SCOPE_OPENGRIMOIRE_FULL_REVIEW.md) — MVP cross-cutting row.

---

## 10. Changelog

| Date | Change |
|------|--------|
| 2026-04-16 | Initial OA-FR-X go-live matrix: Docker/env, `.env.example` matrix, local CI bar, parity table, operator index, gaps. |
