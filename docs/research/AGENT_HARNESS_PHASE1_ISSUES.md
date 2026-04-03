# Phase 1 — GitHub issue definitions (agent harness)

**Epic:** Agent harness improvement — [Phase 1](AGENT_HARNESS_IMPROVEMENT_PROGRAM_2026-04-03.md#phased-roadmap) (P1, P2, P4, P12).  
**Labels (create if missing):** `agent-harness`, `P1`, `P2`, `P4`, `P12`, `documentation` (optional).

**Repos:** Default **OpenGrimoire** for all issues below. **P1.2** and **P2.2** may be filed on **Arc_Forge** (or your Cursor workspace repo) if you keep workspace-only docs there—link back to OpenGrimoire PRs that touch the shared manifest. **Naming / URLs:** [OPENGRIMOIRE_NAMING_AND_URLS.md](../engineering/OPENGRIMOIRE_NAMING_AND_URLS.md).

Use this file to open issues manually on the OpenGrimoire repo, or run **`.\scripts\gh-phase1-setup.ps1`** from OpenGrimoire after `gh auth login` (see [scripts/README_GH_PHASE1.md](../../scripts/README_GH_PHASE1.md)). Or run `gh issue create` by hand when the [GitHub CLI](https://cli.github.com/) is installed and authenticated.

**Dependency order:** Complete **P1.1** before **P1.2**; **P4.1** before **P4.2**; **P12.1** before **P12.2**.

**Implemented artifacts (track here):** [AGENT_TOOL_MANIFEST.md](../AGENT_TOOL_MANIFEST.md) (P1.1), [agent/HARNESS_ACTION_TIERS.md](../agent/HARNESS_ACTION_TIERS.md) (P2.1), [agent/ADR_IDEMPOTENCY_AND_RETRY.md](../agent/ADR_IDEMPOTENCY_AND_RETRY.md) (P4.1), [engineering/DEPLOY_AND_VERIFY.md](../engineering/DEPLOY_AND_VERIFY.md) (P12.2); Arc_Forge: [WORKSPACE_MCP_REGISTRY.md](../../../Arc_Forge/docs/WORKSPACE_MCP_REGISTRY.md) (P1.2), [CURSOR_PLANS_TASK_STATE.md](../../../Arc_Forge/docs/CURSOR_PLANS_TASK_STATE.md) (P4.2), [USER_RULES_VS_POLICY_ENGINE.md](../../../Arc_Forge/docs/USER_RULES_VS_POLICY_ENGINE.md) (P2.2).

---

## P1.1 — Unified tool manifest (OpenGrimoire + workspace)

**Title:** `[agent-harness] P1.1 Unified tool manifest (HTTP + MCP tools)`

**Labels:** `agent-harness`, `P1`, `documentation`

**Body:**

```markdown
## Phase 1 — P1.1

**Outcome:** One markdown or JSON listing OpenGrimoire **HTTP** surfaces and workspace **MCP** tools with name, risk tier, and doc link; PR checklist references it.

**Seed:** [AGENT_HARNESS_PRIMITIVES_2026-04-03.md — P1 backlog](AGENT_HARNESS_PRIMITIVES_2026-04-03.md#backlog-seeds-p112)

## Acceptance criteria

- [ ] Single artifact lives in **one** chosen location (repo root `docs/` or `research/`); header says owning repo / update policy.
- [ ] Each entry: name, risk tier (read / mutate / shell or equivalent), link to `AGENT_INTEGRATION`, `ARCHITECTURE_REST_CONTRACT`, or MCP capability map as appropriate.
- [ ] [CONTRIBUTING.md](../../CONTRIBUTING.md) or this Phase 1 doc links to this manifest for “new tool” PRs.

**Blocks:** P1.2
```

---

## P1.2 — Arc_Forge / workspace MCP registry stub

**Title:** `[agent-harness] P1.2 Workspace MCP registry stub + link to capability map`

**Labels:** `agent-harness`, `P1`, `documentation`

**Depends on:** P1.1

**Body:**

```markdown
## Phase 1 — P1.2

**Outcome:** Short note (Arc_Forge `docs/` or `.cursor/`) listing enabled MCP servers and linking to MiscRepos `MCP_CAPABILITY_MAP` (or sibling path).

**Seed:** Same as P1; [IMPROVEMENT PROGRAM — P1.2](AGENT_HARNESS_IMPROVEMENT_PROGRAM_2026-04-03.md)

## Acceptance criteria

- [ ] P1.1 merged; this doc links to unified manifest and external map.
- [ ] Path is valid for sibling-repo layout (`GitHub/MiscRepos` or documented alternative).

**Depends on:** P1.1
```

---

## P2.1 — Harness action tiers (read / mutate / shell)

**Title:** `[agent-harness] P2.1 Harness action tiers doc + curl examples`

**Labels:** `agent-harness`, `P2`, `documentation`

**Body:**

```markdown
## Phase 1 — P2.1

**Outcome:** `docs/` page describing trust tiers for harness actions (read-only vs mutate vs shell), mapped to [docs/ARCHITECTURE_REST_CONTRACT.md](../ARCHITECTURE_REST_CONTRACT.md).

**Seed:** [P2 backlog](AGENT_HARNESS_PRIMITIVES_2026-04-03.md#backlog-seeds-p112)

## Acceptance criteria

- [ ] At least one **curl** example per tier against OpenGrimoire base URL pattern.
- [ ] Cross-link from [docs/AGENT_INTEGRATION.md](../AGENT_INTEGRATION.md).
```

---

## P2.2 — Workspace: user rules vs automated policy (Arc_Forge)

**Title:** `[agent-harness] P2.2 Workspace note — user rules ≠ policy engine`

**Labels:** `agent-harness`, `P2`, `documentation`

**Body:**

```markdown
## Phase 1 — P2.2

**Outcome:** Short note under Arc_Forge (or portfolio doc) that Cursor user rules and agent-intent **do not** replace automated policy; link to MiscRepos rules as needed.

**Seed:** P2 delta in [IMPROVEMENT PROGRAM](AGENT_HARNESS_IMPROVEMENT_PROGRAM_2026-04-03.md)

## Acceptance criteria

- [ ] One page or section; no false claim of automated enforcement in empty workspace repos.
```

---

## P4.1 — Idempotency ADR (clarification, alignment, survey)

**Title:** `[agent-harness] P4.1 ADR — idempotent vs non-idempotent agent flows`

**Labels:** `agent-harness`, `P4`, `documentation`

**Body:**

```markdown
## Phase 1 — P4.1

**Outcome:** Short ADR: which operations are safe to retry; links from [docs/agent/SYNC_SESSION_HANDOFF.md](../agent/SYNC_SESSION_HANDOFF.md) and [docs/agent/CLARIFICATION_QUEUE_API.md](../agent/CLARIFICATION_QUEUE_API.md).

**Seed:** [P4 backlog](AGENT_HARNESS_PRIMITIVES_2026-04-03.md#backlog-seeds-p112)

## Acceptance criteria

- [ ] Lists clarification, alignment, survey (and related) with retry semantics.
- [ ] Linked from the two docs above (or single index that both reference).

**Blocks:** P4.2
```

---

## P4.2 — Plan files vs chat (task state)

**Title:** `[agent-harness] P4.2 Document .cursor/plans as task state vs chat`

**Labels:** `agent-harness`, `P4`, `documentation`

**Depends on:** P4.1

**Body:**

```markdown
## Phase 1 — P4.2

**Outcome:** Document `.cursor/plans` as **task** state vs conversational transcript; link OpenHarness handoff docs where applicable.

**Depends on:** P4.1

## Acceptance criteria

- [ ] P4.1 merged.
- [ ] Harness or MiscRepos doc cross-link (path documented for sibling clone).
```

---

## P12.1 — Contract / capabilities change log in CONTRIBUTING

**Title:** `[agent-harness] P12.1 CONTRIBUTING — change log line for contract + capabilities`

**Labels:** `agent-harness`, `P12`, `documentation`

**Body:**

```markdown
## Phase 1 — P12.1

**Outcome:** [CONTRIBUTING.md](../../CONTRIBUTING.md) requires a release-note or changelog line when `ARCHITECTURE_REST_CONTRACT` or `/api/capabilities` changes (same spirit as existing API checklist).

**Seed:** [P12 backlog](AGENT_HARNESS_PRIMITIVES_2026-04-03.md#backlog-seeds-p112)

## Acceptance criteria

- [ ] CONTRIBUTING explicitly mentions changelog / release notes for contract + capabilities drift.
- [ ] Aligns with existing numbered API steps (no duplicate bureaucracy).

**Blocks:** P12.2 (optional CI follow-up)
```

---

## P12.2 — Hosting CI alignment (optional follow-up)

**Title:** `[agent-harness] P12.2 Verify CI runs verify on deploy path (hosting)`

**Labels:** `agent-harness`, `P12`, `ci`

**Depends on:** P12.1

**Body:**

```markdown
## Phase 1 — P12.2

**Outcome:** Document or configure `npm run verify` (or subset) on the deployment pipeline so OpenGrimoire **P** on P12 moves toward **G** where hosting allows.

**Depends on:** P12.1

## Acceptance criteria

- [ ] Documented in README or ops runbook **or** CI config updated with owner approval.
- [ ] No false green: if only partial verify in CI, state which scripts run.
```

---

## One-shot `gh` examples (optional)

From a machine with `gh` authenticated to the OpenGrimoire repository:

```bash
cd path/to/OpenGrimoire
gh issue create --title "[agent-harness] P1.1 Unified tool manifest ..." --label "agent-harness,P1,documentation" --body-file ...
```

Repeat per section above, or paste bodies from the markdown blocks.
