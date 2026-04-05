# Agent harness primitives (Claude Code architecture — secondary source)

**Status:** Research note (not normative product spec).  
**Date:** 2026-04-03 (UTC).  
**Source:** [YouTube — discussion of Claude Code / agent infrastructure](https://www.youtube.com/watch?v=FtCdYhspm7w&t=55s).

## Provenance and epistemic limits

- **Narration baseline:** The video’s **YouTube caption transcript** (auto-generated speech recognition on [the same URL](https://www.youtube.com/watch?v=FtCdYhspm7w&t=55s)) was pulled for alignment. It is **not** a human-stenographer transcript; expect **ASR drift** (e.g. “Clawed” for “Claude”) and occasional word errors. It **is** the platform-published text of what was said on camera, without using leak artifacts directly.
- **Enumeration vs synthesis:** In the video, **twelve primitives** are presented as **eight “day one” items** then **four “operational maturity” items** (tool pool assembly → transcript compaction → permission handlers in multiple contexts → **six built-in agent types**). This doc’s **P12 (velocity + guardrails)** is a deliberate **cross-cutting synthesis** from the **opening** (velocity vs operational discipline, pipeline/publish validation) and closing (“80% plumbing”)—it is **not** the same slot as the video’s **last named primitive** (agent types), which here maps to **P10**.
- **Not independently confirmed:** Numeric or structural claims the speaker attributes to leaked code (e.g. “207” / “184” registry counts, “18-module” bash stack, internal JSON layouts) remain **uncorroborated** against Anthropic primary sources; treat as **illustrative**.
- **Purpose:** A **checklist of engineering primitives** for production agent harnesses, aligned with classical backend discipline—usable regardless of vendor.

### Transcript alignment (video enumeration → P1–P12)

| Speaker order (eight + four) | Doc ID | Notes |
|------------------------------|--------|--------|
| Metadata-first tool registry | **P1** | Two parallel registries in transcript; entry counts are speaker-attributed, not verified here. |
| Permission / trust tiers (+ bash depth) | **P2** | Three tiers; “18 module” stack is speaker-attributed. |
| Session persistence (full recoverable state) | **P3** | JSON persistence, resume/reconstruct framing. |
| Workflow state ≠ conversation state | **P4** | Retries, checkpoints, side effects. |
| Token budgets + pre-turn checks | **P5** | Hard limits, compaction threshold, stop before overspend. |
| Typed streaming **then** system event logging | **P6** | Video uses two slots (6 and 7); this doc’s matrix combines them as “logging + typed streaming.” |
| Verification (run + harness change) | **P7** | Two levels in transcript. |
| Session tool pool assembly | **P8** | Dynamic subset per run. |
| Transcript compaction | **P9** | Thresholds, persist flags in narration. |
| Three permission-handler contexts | **P11** | Interactive / coordinator / “swarm worker” in transcript. |
| Six built-in agent types | **P10** | explore, plan, verify, guide, general purpose, status line setup (ASR wording). |
| *(Intro/closing theme, not the 12th numbered item)* | **P12** | Velocity vs discipline, leak context, “boring” pipeline guardrails. |

## Executive summary

The framing is that **most production value in agent products sits in infrastructure**, not in the frontier model alone: **roughly 80% plumbing versus 20% model**, with **premature complexity** (multi-agent sprawl, unbounded tools, unclear state) a common failure mode.

A useful synthesis is **twelve primitives**: metadata-first tool definition, tiered permissions, durable session state, **workflow state separate from chat transcript**, token budgets, structured logging and streaming, verification at both task and harness levels, dynamic tool scoping, transcript compaction, explicit agent roles/types, permission handling that varies by execution mode (e.g. interactive vs delegated), and **velocity paired with guardrails** (pipelines, audits, config discipline).

This document archives that synthesis, reflects it against **OpenGrimoire**, **MiscRepos + OpenHarness**, and the **Arc_Forge** workspace, and seeds **P1–P12** backlog items with acceptance-style criteria.

---

## Primitive catalog

| Primitive | Intent | Failure mode if missing |
|-----------|--------|-------------------------|
| **P1** Metadata-first tool registry | Capabilities as data; introspect without executing | Accidental tool invocation; opaque debugging |
| **P2** Permission / trust tiers | Match controls to risk (built-in vs user-defined) | One-size policy; over-trust of user skills |
| **P3** Session persistence | Reconstruct engine after crash (usage, config, history) | Lost work; opaque restarts |
| **P4** Workflow vs conversation state | Task step + side effects ≠ chat text | Duplicate writes; unsafe retries |
| **P5** Token budgeting | Hard limits + pre-turn checks | Runaway cost; unbounded loops |
| **P6** Logging + typed streaming | System truth + user-visible progress | No audit trail; “black box” failures |
| **P7** Verification (task + harness) | Task success + harness safety unchanged | Regressions in guardrails |
| **P8** Dynamic tool pool | Session-scoped tool sets | Prompt bloat; wrong tools in context |
| **P9** Transcript compaction | Trim stale context; keep instructions | Context exhaustion; cost drag |
| **P10** Agent types / roles | Constrain behavior by role | Monolithic agent; weak control |
| **P11** Multi-context permission handlers | Right policy for interactive vs orchestrated vs batch | Wrong approval path per mode |
| **P12** Velocity + guardrails | Fast ship **with** checksums, audits, publish gates | Drift; leaks; broken automation |

---

## Reflections (alignment with existing stacks)

- **REST contract + capabilities:** OpenGrimoire exposes [`GET /api/capabilities`](../api/capabilities) and documents auth in [ARCHITECTURE_REST_CONTRACT.md](../ARCHITECTURE_REST_CONTRACT.md)—a form of **manifest-first** surface for agents (related to **P1**, **P6**).
- **Separation of concerns:** Sync Session (`POST /api/survey`) vs alignment context (`/api/alignment-context`) vs clarification queue maps to **distinct workflows** (related to **P4**).
- **Harness discipline (MiscRepos / OpenHarness):** `agent-intent` policy checksum, handoff/state as **memory not runbook**, verifier runs without silent code edits, and scripts indexed in harness docs—**P7**, **P12**.
- **P3 session boundary (OA vs harness):** In-app persistence is domain + operator session only, not a full agent-engine dump; harness-side snapshot fields—[AGENT_INTEGRATION.md](../AGENT_INTEGRATION.md) § Agent session boundary; template: MiscRepos [`docs/agent/SESSION_SNAPSHOT_TEMPLATE.md`](../../../MiscRepos/docs/agent/SESSION_SNAPSHOT_TEMPLATE.md).
- **Untrusted LLM content:** [AGENT_INTEGRATION.md](../AGENT_INTEGRATION.md) explicitly warns on alignment body/title and points to safeguard docs—**P2**, **P6**.
- **Gaps:** No first-class **typed event stream** from the app for agent observability; **token budgeting** is caller-side; **workflow checkpoints** for idempotent retries are not uniformly modeled outside individual APIs.

---

## Gap matrix (honest snapshot)

Legend: **A** = Absent, **P** = Partial, **G** = Good. One example per cell.

| ID | OpenGrimoire | MiscRepos + OpenHarness | Arc_Forge (Cursor workspace) |
|----|--------------------------|-------------------------|------------------------------|
| **P1** | **P** — `/api/capabilities` + route docs; MCP map externalized to workspace | **G** — `MCP_CAPABILITY_MAP`, `capabilities.harness.yaml`, skills index | **P** — plans reference repos; no single generated registry file in repo |
| **P2** | **G** — layered API keys, admin vs alignment vs survey gates per contract | **G** — rules/skills security audit skill; tiered secrets policy | **P** — user rules + agent-intent; no automated policy engine |
| **P3** | **P** — SQLite sessions for app data; browser session for admin; not a full “agent engine” JSON dump | **P** — `handoff_latest`, `state/` schema; manual discipline | **P** — chat/session in IDE; no app-level persistence |
| **P4** | **P** — survey vs alignment vs clarification separated; long-running **task** state is product-specific, not a generic workflow engine | **P** — handoff vs decision-log; explicit HITL docs | **P** — `.cursor/plans` for tasks; no shared workflow store |
| **P5** | **A** — server does not enforce LLM token budgets (client/harness responsibility) | **P** — model-selection guidance; pre-commit output limits | **A** — no repo-enforced spend caps |
| **P6** | **P** — server logs exist; no public **typed** agent event API for harnesses | **P** — `log_agent_event.py`, meta-review; not a streaming event bus | **P** — transcripts in UI; no structured stream export |
| **P7** | **P** — `npm run verify`, Playwright; harness-level “rules checksum” lives in sibling automation | **G** — `checksum_integrity.py`, verify scripts, verifier agent | **P** — depends on user running checks; no CI in Arc_Forge alone |
| **P8** | **P** — MCP optional/thin; tools are product-scoped | **G** — role-routing; skill exclusion graph; load-on-demand skills | **P** — workspace enables many MCP servers; manual curation |
| **P9** | **A** — app does not compact agent transcripts | **P** — handoff + CHEATSHEET compaction guidance | **P** — manual summarization; no automated compaction |
| **P10** | **P** — “agent” vs “operator” flows; no named subagent types in product | **G** — subagent types in Task tool; role skills | **P** — user may use plans; not enforced |
| **P11** | **P** — interactive admin vs API keys vs clarification secrets; not swarm/coordinator | **P** — frontier-ops / HITL docs; single-user default | **A** — no multi-agent orchestration layer in repo |
| **P12** | **P** — CONTRIBUTING + contract matrix; depends on CI in hosting | **G** — sanitize/validate/mask pre-commit; audit scripts | **P** — plans archived; no release train in repo |

---

## Backlog seeds (P1–P12)

Use **labels** `agent-harness` and `P1` … `P12` in your tracker, or mirror these as Cursor plan todos.

| ID | Acceptance criteria (verifiable) |
|----|----------------------------------|
| **P1** | Single markdown or generated JSON in **one** chosen repo listing **all** MCP tools + OpenGrimoire HTTP tools with name, risk tier, and doc link; updated in same PR when adding a tool. |
| **P2** | Document **trust tiers** for harness actions (read-only vs mutate vs shell) in `docs/` with examples; align with [ARCHITECTURE_REST_CONTRACT.md](../ARCHITECTURE_REST_CONTRACT.md) gates. |
| **P3** | For harness: define **minimum durable fields** for a “session snapshot” (IDs, correlation IDs, last successful API call); store template in OpenHarness `state/` or MiscRepos docs. |
| **P4** | Add a **short ADR or subsection** describing which entities are **idempotent** vs not for clarification + alignment + survey; link from SYNC_SESSION_HANDOFF / CLARIFICATION_QUEUE_API. |
| **P5** | Document **caller-side** token/cost caps for scripts that call paid APIs (env vars + abort behavior); add to alignment CLI or harness CHEATSHEET. |
| **P6** | Extend **observability**: either document server log fields operators rely on, or add one **structured** log line for tool/API denial (no PII) for audit replay. |
| **P7** | Ensure **verify** scripts (`npm run verify` in OpenGrimoire; `checksum_integrity` in MiscRepos) run in **documented** CI or pre-push checklist for touched areas. |
| **P8** | Curate **minimal MCP server set** per project profile in workspace docs (which servers load for OpenGrimoire work vs unrelated work). |
| **P9** | Publish **handoff compaction** checklist (max sections, drop rules) in harness CHEATSHEET or handoff template—one page. |
| **P10** | Map **three roles** (e.g. explore / implement / verify) to existing skills or Task subagent types in MiscRepos README or OpenHarness AGENT_ENTRY. |
| **P11** | If multi-agent grows: specify **which handler** applies (human approval vs delegated) in one doc; until then, **explicit “single-agent default”** in frontier-ops notes. |
| **P12** | Add **change log** line to CONTRIBUTING or release notes when **ARCHITECTURE_REST_CONTRACT** or capabilities changes—tie API drift to review. |

---

## Seeding mechanics (how to use this doc)

1. **GitHub:** Open **12 issues** (or one epic + 12 children); paste the acceptance row; label `agent-harness` + `P#`.
2. **Cursor:** Add a plan under `.cursor/plans/` with todos `p1-registry` … `p12-velocity-guardrails`.
3. **Review cadence:** Quarterly skim this matrix and update **Gap snapshot** row examples if the codebase moved.

## How to operationalize

- **Reusable prompt:** [AGENT_HARNESS_IMPROVEMENT_PROMPT.md](./AGENT_HARNESS_IMPROVEMENT_PROMPT.md) — staff-engineer template (attach this primitives doc + optional scope); use for a fresh decomposition in any session.
- **Filled program (snapshot):** [AGENT_HARNESS_IMPROVEMENT_PROGRAM_2026-04-03.md](./AGENT_HARNESS_IMPROVEMENT_PROGRAM_2026-04-03.md) — one completed pass (Summary → work packages → roadmap → meta-principles → risks) derived from the gap matrix above; **regenerate** when the matrix changes (see **Regeneration procedure** in that file).
- **Phase 1 GitHub issues:** [AGENT_HARNESS_PHASE1_ISSUES.md](./AGENT_HARNESS_PHASE1_ISSUES.md) — ready-to-paste issue bodies for P1 / P2 / P4 / P12 work packages; or run [scripts/gh-phase1-setup.ps1](../../scripts/gh-phase1-setup.ps1) after `gh auth login` ([README](../../scripts/README_GH_PHASE1.md)). Meta-principles enforced at review via [CONTRIBUTING.md](../../CONTRIBUTING.md) § *Code review — agent harness*.
- **Regeneration checklist:** [AGENT_HARNESS_REGENERATION_CHECKLIST.md](./AGENT_HARNESS_REGENERATION_CHECKLIST.md) — when to refresh the improvement program after gap-matrix edits.

## See also

- [AGENT_INTEGRATION.md](../AGENT_INTEGRATION.md) — OpenGrimoire HTTP entry for agents.
- [PRIVATE_RESEARCH_LAYOUT.md](./PRIVATE_RESEARCH_LAYOUT.md) — optional **gitignored** consulting/strategy research under `docs/private/research/` (not in public clone).
- OpenHarness (sibling clone): [`../../../OpenHarness/docs/AGENT_ENTRY.md`](../../../OpenHarness/docs/AGENT_ENTRY.md) — harness entry chain (path assumes `GitHub/OpenGrimoire` and `GitHub/OpenHarness` siblings).
