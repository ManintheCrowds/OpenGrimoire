# OpenGrimoire — community post (draft)

**Purpose:** Paste-ready **Discord** (or similar) announcement plus optional **short video** talking points. Wording aligns with the **OpenGrimoire copy pack** (Sync Session ↔ Alignment Context). **Link for readers:** [README quick start](../../README.md#quick-start) and [One-path smoke](../../README.md#one-path-smoke-local-demo).

---

## Short post (Discord / thread starter)

**OpenGrimoire** — local-first context graph and Sync Session platform for human↔agent alignment.

OpenGrimoire helps humans and agents run structured one-on-ones (“Sync Sessions”) to align context, reduce drift, and make decisions legible before action.

**Try it locally:** clone your OpenAtlas / OpenGrimoire repo (folder may still be named `OpenAtlas`), `npm install`, `cp .env.example .env.local`, set admin/session vars for `/login`, `npm run dev` → **http://localhost:3001**. Full **one-path smoke:** see README section **“One-path smoke (local demo)”** in the repo root.

**What to run first:** `/operator-intake` (Sync Session) → `/context-atlas` (brain map) → `/login` + `/admin/*` if you want operator views.

---

## Longer post (optional)

OpenGrimoire is a local-first context graph and alignment workspace for human-to-agent collaboration. Its core workflow, **Sync Session**, is a structured virtual one-on-one that aligns intent, context, and constraints before execution. The system stores alignment outcomes as **Alignment Context** records so decisions stay reviewable and reusable.

- **Sync Session (what you see in the UI)** — `/operator-intake` or `/survey` (same form); submissions go to `POST /api/survey` (SQLite when the DB is configured).
- **Alignment Context (system API)** — separate from the survey submit path; see `docs/agent/ALIGNMENT_CONTEXT_API.md`.
- **Brain map** — `/context-atlas` / `/brain-map`; graph from static JSON or regenerate via MiscRepos `build_brain_map.py`.

Agents and HTTP contracts: `docs/AGENT_INTEGRATION.md`, `docs/ARCHITECTURE_REST_CONTRACT.md`.

---

## Optional 2–3 minute video (Loom) outline

1. **Hook (15s):** “Quick tour of OpenGrimoire — Sync Sessions and a local context graph — all runnable from the README.”
2. **Demo (90s):** Show `localhost:3001` → home → `/operator-intake` (scroll form, don’t submit real PII) → `/context-atlas` → mention optional `/login` for admin.
3. **Close (30s):** “Alignment Context is a separate API from the survey path — check the docs if you’re wiring agents. Link in the repo README.”

Use the **opening paragraph** from the copy pack as your script verbatim if you want zero drift from canonical messaging.

---

## Changelog bullets (paste under your post)

Replace `(commit)` with the SHA after you push.

- README: **One-path smoke (local demo)** — numbered path for Sync Session, brain map, admin, Alignment Context. `(commit)`
- Docs: [docs/community/OPENGRIMOIRE_COMMUNITY_POST_2026-04-01.md](./OPENGRIMOIRE_COMMUNITY_POST_2026-04-01.md) — Discord + optional video draft. `(commit)`
- Docs: [docs/engineering/HANDOFF_FOLLOWUP_TRIAGE_2026-04-01.md](../engineering/HANDOFF_FOLLOWUP_TRIAGE_2026-04-01.md) — engineering follow-up triage (defer MCP; next: optional `GET` by id). `(commit)`

---

## Repo link

Primary entry: **README** [Quick start](../../README.md#quick-start) and [One-path smoke](../../README.md#one-path-smoke-local-demo).
