# Brainstorm: ACE-first AI profiles, alignment, and context

**Date:** 2026-03-24  
**Status:** Captured (WHAT, not HOW)  
**Sources:** Shapiro et al., [Conceptual Framework for Autonomous Cognitive Entities](https://arxiv.org/abs/2310.06775) (arXiv:2310.06775); portfolio docs below.

---

## What we're exploring

Early **conceptual engineering** for **AI profiles** (stable operator/agent stance, capabilities, and constraints) and how they connect to **alignment** and **context** in this stack—not a commitment to implement full ACE runtimes.

---

## ACE framework — variables (six layers)

The paper frames an **Autonomous Cognitive Entity (ACE)** as a layered architecture (OSI-inspired). Each layer is a distinct concern; together they span “moral compass” through execution:

| Layer | Role (from paper abstract / common descriptions) |
|-------|---------------------------------------------------|
| **1. Aspirational** | Values, principles, vision, mission — “moral compass.” |
| **2. Global strategy** | Long-term strategic view, world/fortress context. |
| **3. Agent model** | Self-knowledge: capabilities, state, limits (“ego”). |
| **4. Executive function** | Decision-making, task selection, prioritization. |
| **5. Cognitive control** | Failure handling, adaptation, recovery. |
| **6. Task prosecution** | Concrete task execution. |

**Cross-cutting (paper):** Mechanisms for **failure handling** and **adapting actions** for robustness.

---

## Why this matters for AI alignment and context

- **Alignment** is not only model weights: it is **where** norms live (aspirational), **how** they constrain strategy and task choice, and **what** is visible to humans (auditability).
- **Context** must not collapse into one blob: separating **mission** vs **current world state** vs **self-model** vs **next action** matches how humans reason and how you already split artifacts (handoff, vault, graph, alignment API).

---

## How we have done this elsewhere (portfolio)

| Pattern | Where | ACE-ish mapping |
|---------|--------|-----------------|
| Operator wisdom + optional graph overlays | [OPEN_GRIMOIRE_LOCAL_FIRST_INTEGRATION.md](../OPEN_GRIMOIRE_LOCAL_FIRST_INTEGRATION.md), [BRAIN_MAP_SCHEMA.md](../BRAIN_MAP_SCHEMA.md) | Tags, trust, axes → **agent model** hints + **strategy** orientation on artifacts |
| Human-visible intent / scope | [ALIGNMENT_CONTEXT_API.md](../agent/ALIGNMENT_CONTEXT_API.md), `linked_node_id` | **Aspirational** / milestone linkage to graph nodes |
| Session vs durable state | [OG2_BRAINSTORM_SCOPE.md](../research/OG2_BRAINSTORM_SCOPE.md) | Parallels ACE separation of stable identity vs execution |
| DF-inspired design mining | [OPENGRIMOIRE_OG2_DF_DESIGN_MINING.md](../research/OPENGRIMOIRE_OG2_DF_DESIGN_MINING.md) | Metaphors for stress, provenance, goals—not ACE, but complementary “psychology” vocabulary |
| Agent HTTP contract | [AGENT_INTEGRATION.md](../AGENT_INTEGRATION.md) | **Task prosecution** surface; secrets and capabilities discovery |

---

## Key decisions (proposed)

1. **Treat “AI profile” as documentation + optional metadata first** (YAML/Markdown in repo, optional `grimoire_tags` / `compass_axis`), not a new required graph schema.
2. **ACE layer = lens for organizing prompts and handoff sections**, not a mandate for six separate LLM calls until a product needs it.
3. **Aspirational content is human-authored or human-approved** for high-stakes agents; avoid inferring values from chat alone.

---

## Resolved (2026-03-24)

**ACE as the primary framework** — Adopted. The **six ACE layers** are the **canonical** way to talk about agent cognition, scope, and governance in this portfolio. **OG-2 / Dwarf Fortress** material stays a **secondary vocabulary**: useful for stress, rumor/provenance, and social metaphors where it clarifies operator intuition—it does **not** define structure or file layout. New docs and profiles should default to ACE headings; OG-2 rows are cited only when they add a concrete analogy.

---

## Open question 2 — Granularity: one profile per what?

**The tension:** Identity is **multi-dimensional**. Repo, role, and session answer different questions; you often need **composition**, not a single pick.

### 2.1 What each axis is for

| Granularity | Answers | Typical stability | ACE layers most affected |
|-------------|---------|---------------------|---------------------------|
| **Repo (project)** | “What codebase and product constraints apply?” | Months–years | Global strategy, Agent model (tooling, stack), Task prosecution (conventions) |
| **Role (persona)** | “What is this agent *for* in the harness?” | Weeks–months (reusable) | Aspirational, Executive function, Cognitive control (refusal patterns) |
| **Session / instance** | “What is true *right now*?” | Hours–days | Agent model (current focus), Executive function (today’s queue), Task prosecution |

### 2.2 Composition pattern (recommended default)

- **Base profile per repo** (or per monorepo root): non-negotiables—stack, secrets posture, links to `AGENT_INTEGRATION`, brain-map expectations.
- **Role overlay** (optional): e.g. `role:security`, `role:docs`—aspirational + exec-function deltas; **inherits** repo base.
- **Session overlay** (ephemeral or handoff block): current goal, blockers, “what changed since last run”—**does not** replace base; **patches** Agent model + strategy for this run.

If you force a **single** profile only, you usually end up duplicating repo facts across roles or stuffing ephemeral junk into durable files—both hurt alignment.

### 2.3 Decision checklist

- **One profile per repo only** — Choose if agents are homogeneous and sessions are short. Risk: role-specific norms get diluted.
- **Repo + role** — Choose if the same repo uses multiple agent personas with different risk/posture. This is the **sweet spot** for most portfolio work.
- **Add session layer** — Choose when runs are long, handoff-heavy, or multiple concurrent threads need different “now” state.

### 2.4 Resolved

See [Resolved 2.4 / 3.4](#resolved-24--34).

---

## Open question 3 — Minimum viable profile artifact (shape)

**Constraint:** ACE is primary, so the MVP must **make the six layers legible** without requiring six LLM calls or a database on day one.

### 3.1 Three MVP shapes (not mutually exclusive)

| Shape | Contents | Pros | Cons |
|-------|----------|------|------|
| **A. Single `ACE_PROFILE.md` (or `PROFILE.md`)** | One file, **six top-level headings** matching ACE layers + a short “Cross-cutting: failures” subsection | One place to read; easy grep; matches “ACE as primary” | Large file in big repos; merge conflicts if many editors |
| **B. Split: `profile/aspirational.md` … `profile/task-prosecution.md`** | One file per layer under `profile/` or `.cursor/profile/` | Parallel editing; clearer ownership per layer | More clicks; needs an **index** (`profile/README.md`) listing order and inheritance |
| **C. Alignment-context items (OpenGrimoire API)** | Rows for milestones, operator-visible intent, `linked_node_id` to graph | Great for **human-visible** and **API** consumers; audit trail | Bad as the **only** store for layers 4–6 (too chatty, wrong granularity); **supplement**, not replace A or B |

**Practical default:** **A for MVP** (single file, six headings). Move to **B** when multiple people own different layers or files exceed ~400–600 lines.

### 3.2 What “minimum” means per layer (content bar)

- **Aspirational:** Non-empty: principles + escalation path (when to stop and ask human).
- **Global strategy:** What “world” this repo lives in (dependencies, deploy target, other repos in play).
- **Agent model:** Tools available, limits (what it must not do), pointer to capabilities route / MCP map.
- **Executive function:** How tasks are ordered (critic before ship, verifier rules)—can be short if inherited from org.
- **Cognitive control:** What happens on failure (retry budget, handoff to human, known-issues pointer).
- **Task prosecution:** Naming/linking to repo scripts, conventions, definition of done.

### 3.3 Relationship to OpenGrimoire alignment API

- Use **alignment context** for **items that need visibility in the app** or **machine CRUD** (milestones, drift warnings, operator commitments).
- Use **markdown profile** for **authoring** and **version control** of the full ACE stack; sync **summaries** or **links** into alignment items if needed—avoid duplicating six layers twice without automation.

### 3.4 Resolved

See [Resolved 2.4 / 3.4](#resolved-24--34).

---

## Resolved 2.4 / 3.4

**Date:** 2026-03-24 (tech-lead / architect pass). Portfolio repos should **link** to shared aspirational sources instead of duplicating them; per-repo `ACE_PROFILE` **Aspirational** section stays short and points upward.

| Open point | Resolution |
|------------|--------------|
| **Portfolio aspirational** | **MiscRepos** [`.cursor/docs/GOLDEN_PRINCIPLES.md`](../../../MiscRepos/.cursor/docs/GOLDEN_PRINCIPLES.md) (+ [ALIGNMENT_SURFACE.md](../../../MiscRepos/.cursor/docs/ALIGNMENT_SURFACE.md)); optional [org-intent-spec](../../../MiscRepos/org-intent-spec/docs/README.md) for formal inheritance. |
| **Per-MCP** | In-repo ACE **Agent model** / **Task prosecution**; add a **portfolio** doc (e.g. MCP conflict matrix) only when the **same** tool behaves differently across repos. |
| **Canonical path** | **`docs/ACE_PROFILE.md`** is canonical; **`.cursor/ACE_PROFILE.md`** is a **pointer** or **symlink** to that file (single source of truth). |
| **YAML** | Optional front matter on the canonical file: `inherits_portfolio`, `role_overlay`, `ace_profile_version`. |

**Note:** Relative links above assume **`OpenGrimoire`** (this app) and **`MiscRepos`** are **sibling** directories under the same parent (e.g. `Documents/GitHub/`). If your clone is still named `OpenGrimoire`, adjust paths. See [OPENGRIMOIRE_NAMING_AND_URLS.md](../engineering/OPENGRIMOIRE_NAMING_AND_URLS.md).

---

## Next steps

- Pick defaults for **2.2** (repo + role + optional session) and **3.1** (start with single `ACE_PROFILE.md`).
- Implement **Resolved 2.4 / 3.4**: add `docs/ACE_PROFILE.md` (and optional `.cursor` stub) with Aspirational link to portfolio golden principles.
- Optional: `/workflows:plan` or a small “OG-3 ACE profile schema” doc if you want implementation phases.
