# Mission Control patterns — OpenGrimoire alignment

**Purpose:** Map Mission Control-style *operator* value to **OpenGrimoire** without adopting a separate control-plane product wholesale. This file is the **OpenGrimoire-local bridge**; comparative scoring and the full candidate set stay in the portfolio SSOT (`local-proto`).

**Portfolio SSOT (external to this repo):** This OpenGrimoire repo does not keep the Mission Control SSOT docs locally. Use the canonical files in `local-proto/docs/integrations/mission-control/`:

| Doc | Canonical path |
|-----|----------------|
| Executive summary (strategy) | `local-proto/docs/integrations/mission-control/EXECUTIVE_SUMMARY.md` |
| Candidate register + T-MC / P-MC | `local-proto/docs/integrations/mission-control/INTEGRATION_CANDIDATE_REGISTER.md` |
| Comparative matrix | `local-proto/docs/integrations/mission-control/COMPARATIVE_MATRIX.md` |
| Phased roadmap (checkpoints) | `local-proto/docs/integrations/mission-control/PHASED_ROADMAP.md` |
| Security decision log (SDL, HITL/SCP, phase gate) | `local-proto/docs/integrations/mission-control/SECURITY_DECISION_LOG.md` |
| Source register (MC-SRC) | `local-proto/docs/integrations/mission-control/SOURCE_REGISTER.md` |

**Compounding learnings (portfolio):** `local-proto/docs/solutions/architecture-patterns/mission-control-patterns-opengrimoire.md` (one-page pattern doc; no second comparative matrix in OG).

**Multi-panel operator GUI (in-app):** [operator-cockpit-panels.md](operator-cockpit-panels.md) — which panels belong inside the existing admin/survey/A2UI shell, with data contracts and phasing. **Task decomposition (OG-OC-*)** is tracked in MiscRepos `.cursor/state/pending_tasks.md` under `PENDING_OPENGRIMOIRE_OPERATOR_COCKPIT`.

## Canonical execution ledger policy

- **Canonical source:** `MiscRepos/.cursor/state/pending_tasks.md` is the single source of truth for `MC-INT-*`, `OG-MC-*`, and `OG-OC-*` execution status.
- **This doc role:** this alignment file is a derived strategy/bridge view; it must not become an independent state tracker.
- **Conflict resolution:** when this file and canonical ledger differ, canonical ledger is authoritative and this file should be updated to match.
- **Update order:** lifecycle changes belong in canonical first; links, summaries, and rationale updates can follow here after reconciliation.

---

## Strategy (one paragraph)

Replicate **patterns** (quality gates, operator visibility, recurring operational discipline, trust/audit *surfaces*) at OpenGrimoire's seams: **admin API/UI**, **moderation + survey read gates**, **CI and scheduled jobs**, and **versioned REST**. A **multi-panel operator cockpit** may live **inside** the current GUI (see [operator-cockpit-panels.md](operator-cockpit-panels.md)); each panel needs a **data contract** and **SDL-04/07** review. Do **not** re-create the full external Mission Control *product* as a separate stack or duplicate the portfolio comparative matrix in this repo.

**Rejected / deferred (portfolio decision):** full platform migration (MC-08) - **reject**; multi-tenant (MC-07) - **defer** until explicitly needed.

---

## OpenGrimoire dependency anchors

Use these existing OG docs as integration anchors (paths from OG repo root):

| Anchor | Role |
|--------|------|
| `docs/OPENGRIMOIRE_SYSTEMS_INVENTORY.md` | System boundaries, phases |
| `docs/ARCHITECTURE_REST_CONTRACT.md` | REST / auth non-goals, contract shape |
| `docs/agent/SCP_LLM_INGESTION_CHECKLIST.md` | SCP before LLM/alignment/survey-sourced text |
| `docs/OPEN_GRIMOIRE_LOCAL_FIRST_INTEGRATION.md` | Local-first and vault alignment |

---

## MC candidate -> OpenGrimoire mapping

| MC ID | Theme | OpenGrimoire locus | OG ticket id (suggested) | Notes |
|-------|--------|-------------------|-------------------------|--------|
| MC-01 | Quality gate parity | Moderation queue, survey approval / read-gate flow, admin | **OG-MC-01** | Align stage names, docs, and tests with T-MC-01; no auth bypass. |
| MC-02 | Recurring-task templates | GitHub Actions / scheduled smoke, runbooks | **OG-MC-02** | T-MC-02 analog: documented cadence + owners (see Phase 1 below). |
| MC-03 | Trust/telemetry normalization | Server logs, moderation/alignment events | **OG-MC-03** | Phase 2 pilot: event schema, least privilege (SDL-04). |
| MC-04 | Operator status (read-only) | **Multi-panel admin cockpit** — [operator-cockpit-panels.md](operator-cockpit-panels.md) | **OG-MC-04** | Phase 2; read-only first; compose moderation + activity + health panels. |
| MC-05 | Skills / registry visibility | **N/A in-app** unless OG hosts MCP UI | **— / harness** | Prefer portfolio harness + MCP catalog; link only. |
| MC-06 | API-first automation | `ARCHITECTURE_REST_CONTRACT`, admin API | **OG-MC-06** | Phase 2: versioned contract + sample client. |
| MC-07 | Multi-tenant | — | **Defer** | Re-eval with product. |
| MC-08 | Full platform migration | — | **Reject** | — |

---

## Phased alignment (mirrors portfolio roadmap)

| OG phase | Portfolio | Focus in OpenGrimoire |
|----------|-----------|------------------------|
| **OG Phase 1** | Phase 1 (0-3 weeks) | **OG-MC-01**, **OG-MC-02** + docs; HITL/SCP attestation (see portfolio security decision log SDL-07) |
| **OG Phase 2** | Phase 2 (pilots) | **OG-MC-03**, **OG-MC-04**, **OG-MC-06** pilots; optional portfolio phase gate log row if posture shifts |
| **OG Phase 3** | Phase 3 (expansion or hold) | Re-eval **OG-MC-07**-style scope; go/no-go memo |

---

## Phase gate (OpenGrimoire)

When a PR **materially** changes authentication, moderation bypass paths, PII display, or external ingestion:

1. Complete portfolio HITL/SCP checks where relevant (see `local-proto/docs/integrations/mission-control/SECURITY_DECISION_LOG.md`).
2. Optionally add a row to the portfolio Phase gate log and/or an entry per SDL-08 in that log if the change affects multiple repos.

---

## Changelog

| Date | Change |
|------|--------|
| 2026-04-29 | Added standalone-repo copy with externalized Mission Control SSOT references |
