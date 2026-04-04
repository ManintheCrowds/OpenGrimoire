# Agent harness improvement program (derived snapshot)

**Status:** Work program derived from [AGENT_HARNESS_PRIMITIVES_2026-04-03.md](./AGENT_HARNESS_PRIMITIVES_2026-04-03.md) **gap matrix** and **backlog seeds** as of **2026-04-03 (UTC)**.  
**Last revised:** 2026-04-03 (UTC) — regeneration procedure, Phase 1 issue stubs, CONTRIBUTING review hooks, `scripts/gh-phase1-setup.ps1`, [regeneration checklist](./AGENT_HARNESS_REGENERATION_CHECKLIST.md).  
**Prompt used:** [AGENT_HARNESS_IMPROVEMENT_PROMPT.md](./AGENT_HARNESS_IMPROVEMENT_PROMPT.md).

**Scope note:** Maturity **A/P/G** is per column **OpenGrimoire | MiscRepos + OpenHarness | Arc_Forge** unless a section says otherwise.

---

## Summary

- Production agent value skews to **infrastructure (“plumbing”)** over raw model capability; **premature complexity** (extra agents, tools, or state models before foundations) is a primary failure mode.
- The primitives note frames **twelve checklists (P1–P12)**—metadata, permissions, persistence, workflow vs chat, budgets, observability, verification, tool scoping, compaction, roles, multi-context permissions, velocity + guardrails—not as vendor gospel but as **engineering patterns**.
- Our stacks already show **strengths** in **P2**, **P7** (MiscRepos/OpenHarness), **P8** (harness), and **contract/capabilities** surfaces on OpenGrimoire; **weak spots** cluster around **typed streaming (P6)**, **token budgets and compaction inside the app (P5, P9)**, and **unified tool registry artifacts (P1)** across repos.
- Source narrative in the original research is **secondary**; do not treat leaked-product specifics or revenue claims as requirements for OpenGrimoire.

---

## Work packages by P#

Legend: **OA** = OpenGrimoire, **MH** = MiscRepos + OpenHarness, **AF** = Arc_Forge.  
**Seed:** See [Backlog seeds](./AGENT_HARNESS_PRIMITIVES_2026-04-03.md#backlog-seeds-p112) in the primitives doc; rows below **add** only tightening deltas.

### P1 — Metadata-first tool registry

| Col | Maturity | Example from matrix |
|-----|----------|---------------------|
| OA | P | `/api/capabilities` + route docs; MCP map in workspace |
| MH | G | `MCP_CAPABILITY_MAP`, `capabilities.harness.yaml`, skills index |
| AF | P | No single generated registry file in repo |

| # | Work package | Outcome | Depends on | Seed + delta |
|---|----------------|--------|------------|--------------|
| P1.1 | **Unified tool manifest** | One markdown or JSON listing **HTTP tools** (OpenGrimoire) + **MCP tools** (workspace) with name, risk tier, doc link; PR checklist references it | — | Seed P1; **delta:** name owning repo in file header (OpenGrimoire vs MiscRepos vs workspace doc). |
| P1.2 | **Arc_Forge registry stub** | Add `docs/` or `.cursor/` note listing enabled MCP servers and link to MiscRepos capability map | P1.1 | Same seed; **delta:** AF-only path. |

### P2 — Permission / trust tiers

| OA | MH | AF |
|----|----|-----|
| G | G | P |

| # | Work package | Outcome | Depends on | Seed + delta |
|---|----------------|--------|------------|--------------|
| P2.1 | **Harness action tiers doc** | `docs/` page: read-only vs mutate vs shell; maps to [ARCHITECTURE_REST_CONTRACT.md](../ARCHITECTURE_REST_CONTRACT.md) | — | Seed P2; **delta:** include one OpenGrimoire curl example per tier. |
| P2.2 | **Workspace policy reminder** | Short note under Arc_Forge that user rules ≠ automated enforcement; link agent-intent rule | — | Seed P2; **delta:** AF scope only. |

### P3 — Session persistence

| OA | MH | AF |
|----|----|-----|
| P | P | P |

| # | Work package | Outcome | Depends on | Seed + delta |
|---|----------------|--------|------------|--------------|
| P3.1 | **Session snapshot template** | Define minimum durable fields (session IDs, correlation IDs, last successful API call) in OpenHarness `state/` or MiscRepos docs | — | Seed P3. |
| P3.2 | **OpenGrimoire “agent session” boundary** | Decide what is **in-app** vs **harness-side** persistence; one paragraph in AGENT_INTEGRATION or primitives cross-link | P3.1 | Seed P3; **delta:** explicit “not a full agent engine dump” for OA. |

### P4 — Workflow vs conversation state

| OA | MH | AF |
|----|----|-----|
| P | P | P |

| # | Work package | Outcome | Depends on | Seed + delta |
|---|----------------|--------|------------|--------------|
| P4.1 | **Idempotency ADR** | Short ADR: which operations are safe to retry (clarification, alignment, survey); link from SYNC_SESSION_HANDOFF + CLARIFICATION_QUEUE_API | — | Seed P4. |
| P4.2 | **Plan file convention** | Document `.cursor/plans` as **task** state vs chat; link handoff doc in MH | P4.1 | Seed P4; **delta:** AF. |

### P5 — Token budgeting

| OA | MH | AF |
|----|----|-----|
| A | P | A |

| # | Work package | Outcome | Depends on | Seed + delta |
|---|----------------|--------|------------|--------------|
| P5.1 | **Caller-side caps** | Document env vars + abort behavior for scripts calling paid APIs; alignment CLI or CHEATSHEET | — | Seed P5. |
| P5.2 | **Product boundary note** | OA: server does not enforce LLM budgets—document explicitly in OPERATIONAL_TRADEOFFS or AGENT_INTEGRATION | — | Seed P5; **delta:** avoids false expectation of server-side caps. |

### P6 — Logging + typed streaming

| OA | MH | AF |
|----|----|-----|
| P | P | P |

| # | Work package | Outcome | Depends on | Seed + delta |
|---|----------------|--------|------------|--------------|
| P6.1 | **Denial audit line** | One structured log line on API/tool denial (no PII) or operator doc of server log fields | — | Seed P6. |
| P6.2 | **Streaming gap** | Document “no typed agent event API” as backlog, not silent absence | P6.1 | Seed P6; **delta:** roadmap honesty. |

### P7 — Verification (task + harness)

| OA | MH | AF |
|----|----|-----|
| P | G | P |

| # | Work package | Outcome | Depends on | Seed + delta |
|---|----------------|--------|------------|--------------|
| P7.1 | **CI checklist** | CONTRIBUTING or pre-push: run `npm run verify` when touching OpenGrimoire; sibling `checksum_integrity` when touching rules/skills | — | Seed P7. |
| P7.2 | **Arc_Forge discipline** | Document “run verify from sibling repo” in workspace README or plan template | P7.1 | Seed P7; **delta:** AF. |

### P8 — Dynamic tool pool

| OA | MH | AF |
|----|----|-----|
| P | G | P |

| # | Work package | Outcome | Depends on | Seed + delta |
|---|----------------|--------|------------|--------------|
| P8.1 | **Profile: OpenGrimoire MCP** | Minimal MCP server set for OpenGrimoire work vs other work (workspace doc) | P1.1 | Seed P8. |
| P8.2 | **Thin MCP policy** | Reinforce [AGENT_INTEGRATION.md](../AGENT_INTEGRATION.md) optional MCP = thin wrappers only | — | Seed P8; **delta:** OA product constraint. |

### P9 — Transcript compaction

| OA | MH | AF |
|----|----|-----|
| A | P | P |

| # | Work package | Outcome | Depends on | Seed + delta |
|---|----------------|--------|------------|--------------|
| P9.1 | **Handoff compaction one-pager** | CHEATSHEET or handoff template: max sections, drop rules | — | Seed P9. |
| P9.2 | **OA scope** | App does not compact agent transcripts—document as non-goal or future | — | Seed P9; **delta:** clarity for P9 **A** on OA. |

### P10 — Agent types / roles

| OA | MH | AF |
|----|----|-----|
| P | G | P |

| # | Work package | Outcome | Depends on | Seed + delta |
|---|----------------|--------|------------|--------------|
| P10.1 | **Three-role map** | explore / implement / verify mapped to Task subagent types or skills (MiscRepos README or OpenHarness AGENT_ENTRY) | — | Seed P10. |
| P10.2 | **Product roles** | Optional: name “agent vs operator” in OpenGrimoire UX copy only—no forced subagent product | — | Seed P10; **delta:** OA P scope. |

### P11 — Multi-context permission handlers

| OA | MH | AF |
|----|----|-----|
| P | P | A |

| # | Work package | Outcome | Depends on | Seed + delta |
|---|----------------|--------|------------|--------------|
| P11.1 | **Single-agent default** | One doc paragraph: human approval vs API keys vs clarification; defer swarm/coordinator until needed | — | Seed P11. |
| P11.2 | **Validation** | If multi-agent grows, re-run gap matrix and add handler matrix | P11.1 | Seed P11; **delta:** gate. |

### P12 — Velocity + guardrails

| OA | MH | AF |
|----|----|-----|
| P | G | P |

| # | Work package | Outcome | Depends on | Seed + delta |
|---|----------------|--------|------------|--------------|
| P12.1 | **Contract change log** | CONTRIBUTING: line when ARCHITECTURE_REST_CONTRACT or `/api/capabilities` changes | — | Seed P12. |
| P12.2 | **Hosting CI** | Tie OA **P** to actual CI on deploy path (owner action) | P12.1 | Seed P12; **delta:** external dependency called out. |

---

## Phased roadmap

| Phase | Focus | Primitives | Rationale (one line) |
|-------|--------|------------|----------------------|
| **1** | Foundation + visibility | P1, P2, P4, P12 | Registry clarity, trust documentation, idempotent workflow story, and contract discipline—low risk, high leverage on confusion. |
| **2** | Durability + observability | P3, P6, P7, P8 | Session templates, audit logs, verify scripts, and MCP scoping reduce “black box” failures without new product features. |
| **3** | Cost + context economy | P5, P9 | Caller-side caps and handoff compaction; explicit OA non-goals for server-side LLM budgets/transcript compaction. |
| **4** | Roles + scale (only if needed) | P10, P11 | Role mapping and permission-handler story **after** P1–P4 solid—avoids premature multi-agent complexity (P11 **A** on AF is acceptable until needed). |

**Ordering rule:** P1–P4 and P12 before heavy P10–P11 **unless** a release is blocked by verification (then elevate **P7** within Phase 1). P5/P9 **A** on OpenGrimoire are **product-boundaries**, not blockers for multi-agent work in harness repos.

---

## Meta-principles & process hooks

| Meta-principle | Maps to | Hook or gap | Concrete rule / checkpoint |
|----------------|---------|-------------|----------------------------|
| Premature complexity kills projects | Scope creep in agents/tools | **Intent-alignment / drift gate** (MiscRepos); **critic loop** for multi-file outputs | No new MCP server without updating capability map + risk tier + doc link (P1/P8). |
| Velocity needs guardrails | Fast ship without drift | **Pre-commit** (sanitize/validate/mask), **checksum_integrity**, **ARCHITECTURE_REST_CONTRACT** | Any PR touching routes updates contract matrix + capabilities in same PR (P12). |
| Design for failure | Resumability, idempotency | **Verifier vs implementer**; handoff/state docs | Retry table (P4) must exist before automating “retry on failure” scripts. |
| Transcript ≠ workflow | Wrong retries | **Intent gate** + explicit ADR | Handoff template states current **workflow step** (not just chat summary) (P4/P9). |
| Auditability | Trust in ops | **Critic** on docs; structured logging | One structured denial log line or operator doc (P6) before marketing “enterprise” observability. |

---

## Risks

| Risk | Early signal | Mitigation |
|------|--------------|------------|
| Gold-plating **P11** (multi-agent permissions) before **P4** idempotency | Docs talk about coordinators before ADR on retries | Keep P11.1 “single-agent default” until P4.1 ships. |
| **Registry drift (P1)** | New MCP tool in workspace with no manifest entry | PR checklist: touch unified manifest (P1.1). |
| Skipping **P7** verify on “doc-only” PRs that change contracts | CI green but contract wrong | Require contract/capabilities diff → run verify (P12.1). |
| **False expectation** of server-side token limits (P5) | Users expect OA to cap LLM spend | P5.2 boundary note in AGENT_INTEGRATION / tradeoffs. |
| **Overloading** Arc_Forge with CI expectations | AF remains **P** on verify | P7.2: explicit “run from sibling repo” only; no fake CI in empty workspace. |

---

## Phase 2 follow-ups (explicit backlog)

| Item | Status | Notes |
|------|--------|--------|
| **Typed agent event / progress API** | **Not shipped** | OpenGrimoire has no SSE/WebSocket (or similar) **typed** stream for agent progress, tool steps, or token usage. Harnesses use HTTP responses, polling, and **structured `access_denied` lines** ([OPERATOR_LOG_FIELDS.md](../engineering/OPERATOR_LOG_FIELDS.md)) only. A future stream would need API design, contract matrix rows, auth model, and manifest updates—treat as **backlog**, not an undocumented absence. |
| **P6.1 denial logging** | **Shipped** | JSON lines via [`access-denial-log.ts`](../../src/lib/observability/access-denial-log.ts); field reference: [OPERATOR_LOG_FIELDS.md](../engineering/OPERATOR_LOG_FIELDS.md). |

---

## Phase 3 artifacts (P5, P9 — shipped)

| Item | Artifact |
|------|----------|
| **P5.1** | [MiscRepos `docs/agent/CALLER_SIDE_LLM_BUDGETS.md`](../../../MiscRepos/docs/agent/CALLER_SIDE_LLM_BUDGETS.md) (links [LOCAL_AI_TOKEN_OFFLOAD_POLICY.md](../../../MiscRepos/local-proto/docs/LOCAL_AI_TOKEN_OFFLOAD_POLICY.md)) |
| **P5.2** | [AGENT_INTEGRATION.md](../AGENT_INTEGRATION.md) § Token budgets; [OPERATIONAL_TRADEOFFS.md](../engineering/OPERATIONAL_TRADEOFFS.md) |
| **P9.1** | [MiscRepos `docs/agent/HANDOFF_COMPACTION.md`](../../../MiscRepos/docs/agent/HANDOFF_COMPACTION.md); entry from [HANDOFF_FLOW.md](../../../MiscRepos/.cursor/HANDOFF_FLOW.md), [COMMANDS_README.md](../../../MiscRepos/.cursor/docs/COMMANDS_README.md) |
| **P9.2** | [AGENT_INTEGRATION.md](../AGENT_INTEGRATION.md) § Agent transcripts; [OPERATIONAL_TRADEOFFS.md](../engineering/OPERATIONAL_TRADEOFFS.md) |

---

## Regeneration procedure

**Regenerate** this file when any of the following change materially:

- The **gap matrix** or **backlog seeds** in [AGENT_HARNESS_PRIMITIVES_2026-04-03.md](./AGENT_HARNESS_PRIMITIVES_2026-04-03.md).
- The **stack audit** (e.g. OpenGrimoire ships typed streaming, or MiscRepos changes MCP layout).

**Steps:**

1. Update the primitives doc (matrix / seeds) in the same PR as the narrative refresh.
2. Run [AGENT_HARNESS_IMPROVEMENT_PROMPT.md](./AGENT_HARNESS_IMPROVEMENT_PROMPT.md) with the updated doc attached; merge the model output into **Summary**, **Work packages**, **Phased roadmap**, **Meta-principles**, and **Risks** as needed.
3. Set **Last revised** in this file’s header to the commit date (UTC).
4. If Phase 1 issues exist on GitHub, **close or retitle** superseded items and add a short comment linking the new snapshot.

**Trivial edits** (typos, link fixes) do not require full regeneration.

## Next steps

| Step | Action |
|------|--------|
| 1 | Open GitHub issues from [AGENT_HARNESS_PHASE1_ISSUES.md](./AGENT_HARNESS_PHASE1_ISSUES.md) (or `gh issue create` when CLI is available). |
| 2 | Execute **P1.1 → P1.2**, **P4.1 → P4.2**, **P12.1 → P12.2** in dependency order; **P2** and **P12.2** can parallelize with other streams where no conflict. |
| 3 | Enforce **Code review — agent harness** in [CONTRIBUTING.md](../../CONTRIBUTING.md) on relevant PRs. |
| 4 | Start **Phase 2** (P3, P6, P7, P8) when Phase 1 acceptance criteria are met or explicitly descoped; update the gap matrix first, then regenerate this program. |

## See also

- [scripts/README_GH_PHASE1.md](../../scripts/README_GH_PHASE1.md) — run `gh-phase1-setup.ps1` after `gh auth login` to create labels and issues.
- [AGENT_HARNESS_REGENERATION_CHECKLIST.md](./AGENT_HARNESS_REGENERATION_CHECKLIST.md) — short checklist when the gap matrix changes.
- [AGENT_HARNESS_PHASE1_ISSUES.md](./AGENT_HARNESS_PHASE1_ISSUES.md) — copy-paste issue bodies for Phase 1.
- [AGENT_HARNESS_IMPROVEMENT_PROMPT.md](./AGENT_HARNESS_IMPROVEMENT_PROMPT.md) — re-run prompt template.
- [AGENT_INTEGRATION.md](../AGENT_INTEGRATION.md) — OpenGrimoire HTTP entry for agents.
