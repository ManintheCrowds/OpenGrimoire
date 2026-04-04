# Operator runbook — OpenGrimoire GUI

**Audience:** Operators using the browser app. **Secrets:** Env **names** only; never paste keys into chat or commit them.

---

## Local dev

1. From repo root: `npm install` then `npm run dev` — app listens on **http://localhost:3001** (see `package.json`).
2. Open **Context graph:** `/context-atlas` or `/brain-map` (same UI).
3. Graph data: `GET /api/brain-map/graph` serves `public/brain-map-graph.local.json` if present, else `public/brain-map-graph.json`. **Do not** rely on `/brain-map-graph.json` static URLs (blocked by middleware); use the API.

---

## Primary flows

| Goal | Steps |
|------|--------|
| View context graph | Navigate to `/context-atlas`; wait for load; use **Graph** / **Table** / **Vault** tabs as needed. |
| Refresh after data change | Regenerate JSON with `build_brain_map.py` (see README), then **refresh browser** — no live SSE. |
| See API surface | `/capabilities` page or `GET /api/capabilities`. |
| Alignment (admin) | Operator password: `/login` then `/admin/alignment` (see `.env.example`). Focus/visibility triggers refetch for external CLI changes. |
| Alignment (API / agents) | [AGENT_INTEGRATION.md](./AGENT_INTEGRATION.md), [ALIGNMENT_CONTEXT_API.md](./agent/ALIGNMENT_CONTEXT_API.md); header `x-alignment-context-key` when secret set. |

---

## Troubleshooting

| Symptom | Check |
|---------|--------|
| Empty graph | `public/brain-map-graph*.json` exists? Builder env vars set? See README. |
| 401 on graph API | `BRAIN_MAP_SECRET` set → need `x-brain-map-key` or `NEXT_PUBLIC_BRAIN_MAP_SECRET` in UI config per [security/NEXT_PUBLIC_AND_SECRETS.md](./security/NEXT_PUBLIC_AND_SECRETS.md). |
| 503 alignment | `ALIGNMENT_CONTEXT_API_SECRET` missing in production, or local flag not set for dev. |
| Admin redirects to login | No valid session cookie — sign in at `/login` (`OPENGRIMOIRE_SESSION_SECRET` + operator password env). |

---

## OpenHarness (no browser)

OpenGrimoire (this repo; folder often still named `OpenGrimoire`) is the **browser app**. **OpenHarness** is a separate repo: portable **markdown workflows**, `.cursor` rules/skills, and `state/`—not a React GUI. When your work is handoffs, scripts, or skills rather than the web UI, use the harness docs and paths below.

**Layout:** With a typical clone layout (`OpenGrimoire` and `OpenHarness` as siblings under the same parent, e.g. `Documents/GitHub/`), paths from this repo are like `../../OpenHarness/...`.

| Topic | Where |
|-------|--------|
| Handoff procedure, definition of done | [OpenHarness `docs/HANDOFF_FLOW.md`](../../OpenHarness/docs/HANDOFF_FLOW.md) |
| Live handoff file | `OpenHarness/.cursor/state/handoff_latest.md` (after you copy or symlink harness into a project, often `.cursor/state/`) |
| Brain map from harness / visualization skill | [brain-map-visualization `SKILL.md`](../../OpenHarness/.cursor/skills/brain-map-visualization/SKILL.md) |
| Handoff integrity + portfolio scripts (monitoring split) | [MONITORING_OPENGRIMOIRE.md](./MONITORING_OPENGRIMOIRE.md) (OpenHarness section) |
| Part B audit alignment (dimensions → paths) | [OpenHarness `docs/HARNESS_AUDIT_ALIGNMENT.md`](../../OpenHarness/docs/HARNESS_AUDIT_ALIGNMENT.md) |
| Capability manifest (scripts list, checklist anchors) | [OpenHarness `capabilities.harness.yaml`](../../OpenHarness/capabilities.harness.yaml) |

**Relationship:** [OPENGRIMOIRE_SYSTEMS_INVENTORY.md](./OPENGRIMOIRE_SYSTEMS_INVENTORY.md) explains how OpenHarness patterns and brain-map builds relate to this app.

---

## Related docs

- [README.md](../README.md) — routes table, brain-map regeneration.
- [MONITORING_OPENGRIMOIRE.md](./MONITORING_OPENGRIMOIRE.md) — where logs/metrics live.
- [scope_opengrimoire_mvp_agent_native.md](./scope_opengrimoire_mvp_agent_native.md) — MVP acceptance criteria.
