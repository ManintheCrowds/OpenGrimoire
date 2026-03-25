# OpenGrimoire OG-2 — Dwarf Fortress–inspired design mining

**Date:** 2026-03-24  
**Scope lock:** [OG2_BRAINSTORM_SCOPE.md](./OG2_BRAINSTORM_SCOPE.md)  
**Intent:** Extract design ideas from *Dwarf Fortress* for **persistent traits, social simulation, and intent evolution** in agent/context models. **Inspiration only** — not an implementation of DF, not a product commitment to simulate dwarves.

**Non-goals:** Game engine code, new required brain-map JSON fields, or conflating this work with the upstream OpenCompass CSV pipeline (see [OPEN_GRIMOIRE_LOCAL_FIRST_INTEGRATION.md](../OPEN_GRIMOIRE_LOCAL_FIRST_INTEGRATION.md)).

---

## Core matrix

| Dimension | DF mechanism | Our mapping | Adopt? | Risks / limits | Optional brain-map hook |
|-----------|--------------|-------------|--------|----------------|-------------------------|
| **Facet bands** | Personality facets are 0–100 values; only the **extreme bands** (e.g. very high / very low) surface in “thoughts and preferences” reports and affect which thoughts fire and social skill learning. See [Personality facet](https://dwarffortresswiki.org/index.php?title=Personality_facet) (Dwarf Fortress Wiki). | Represent stable “operator or agent disposition” as **coarse bands** on a few axes (e.g. risk tolerance, verbosity) rather than raw numeric spam; only surface extremes in UI or prompts. | **Maybe** — useful if we keep a small fixed set of axes; avoid pseudo-precision. | We are not sampling thousands of creatures; over-fitting facets to LLM sessions feels fake without measurement. | `compass_axis` (label which axis); `grimoire_tags` e.g. `facet:high_risk` |
| **Facet–thought coupling** | Facets influence whether certain actions yield **good or bad thoughts** (same event, different reaction by personality). | Route “same event, different agent stance” through **policy or preference profiles** (files, MCP config) rather than hard-coded mood. | **Yes** — pattern matches heterogeneous agents/tools. | Requires explicit profile per agent or role; not automatic from free text. | `constraint` on node; `grimoire_tags` |
| **Stress integration** | Stress is tracked on a large internal scale; **negative is good**; bad thoughts push stress up; thresholds at +10k, +25k, +50k for escalating effects. See [Stress](https://dwarffortresswiki.org/index.php/Stress) (wiki; values may vary by version). | Treat “alignment drift” or **operator fatigue** as a **bounded scalar** updated by events (failed verifications, scope creep) with explicit thresholds for escalation (human review, pause automation). | **Maybe** — valuable metaphor only if we **instrument** events; else theater. | Wrong scale if we expose raw numbers; users may game or ignore it. | `trust_score` (inverse semantic: stress↑ trust display↓) — use carefully; prefer separate internal metric in docs |
| **Thought streams** | Recent thoughts and memories drive short-term mood; **positive thoughts lower stress**; negative raise it. See [Thoughts and preferences](https://dwarffortresswiki.org/index.php/Thoughts_and_preferences). | Map to **append-only session log** or handoff “Recent outcomes” that agents summarize before planning; correlates with critic/verifier outcomes. | **Yes** — fits handoff + alignment context narrative. | Chat logs are noisy; needs summarization or structured events. | `insight_level` on curated summaries; link alignment items via `linked_node_id` |
| **Acute vs chronic** | Short-term: tantrums, depression, etc.; long-term: worse outcomes at extreme stress. | Distinguish **one bad day** (ignore) vs **sustained pattern** (policy: reduce autonomy, require human). | **Yes** — governance framing. | Needs explicit definition of “chronic” in your ops. | `review_status` = `stale` / risk tiers on nodes |
| **Family and friendship** | Relationships include family and friends; **strong networks increase happiness** but amplify loss. See [Relationship](https://dwarffortresswiki.org/index.php/Relationship). | **Weighted edges** between artifacts (handoff ↔ skills ↔ vault notes) with “importance” affecting how much breakage hurts (e.g. removing a core skill file). | **Maybe** — metaphor for **dependency** more than sentiment. | Graph is co-access today, not emotional kinship; do not anthropomorphize files. | Edge `weight`; `grimoire_tags` on high-centrality nodes |
| **Grudges** | Negative ties; forced interaction with a grudge target yields bad thoughts; personality conflicts increase likelihood. See [Grudge](https://dwarffortresswiki.org/index.php/Grudge). | **Incompatibility** between tools or agents (e.g. conflicting MCP servers) recorded as “avoid pairing” hints in operator docs or tags. | **Maybe** — useful as **documentation** of conflicts; fragile if automated. | Automated “grudge” between agents could become toxic meme; keep human-in-the-loop. | `constraint` on edge or node; `grimoire_tags` e.g. `conflict:with:agent-x` |
| **Rumor truth and spread** | Rumors are **witness-origin** knowledge that spreads; generally truthful except secret-identity cases; **fade** over time for some topics. See [Rumor](https://dwarffortresswiki.org/index.php/Rumor). | Model **provenance chains** for facts entering the brain map: who saw what, decay of **stale** intel, flag **unverified** vs **repeated**. | **Yes** — aligns with [BRAIN_MAP_SCHEMA.md](../BRAIN_MAP_SCHEMA.md) provenance story. | Full witness simulation is heavy; start with manual tags. | `provenance` + `insight_level`; `trust_score` for confidence |
| **Rumor ingress** | Rumors arrive via liaison, diplomats, visitors. | External signals (feeds, eval CSVs, imported stubs) enter graph as **labeled** nodes with source and freshness. | **Yes** — matches OpenGrimoire/OpenCompass ingest *pattern* (different domain, same hygiene). | Do not mix OpenCompass row semantics with DF; keep pipelines named clearly. | `grimoire_tags` = `source:…`; `compass_axis` for eval dimension if applicable |
| **Short-term needs** | Needs appear as jobs (low vs high priority); **unmet needs cause stress**; high-priority needs resist cancellation. See [Need](https://dwarffortresswiki.org/index.php/DF2014:Need). | **Interruptible vs non-interruptible** tasks for agents: e.g. “security review” cannot be cancelled by a new chat; “nice-to-have doc polish” can. | **Yes** — clear ops policy. | Requires task taxonomy in harness; not a graph-only feature. | `priority` on alignment-context items; optional `constraint` |
| **Life goals** | Long-term personality goals (e.g. master a skill, create art) with **happy thought on completion**. See [Personality goal](https://dwarffortresswiki.org/index.php/Personality_goal). | **Milestone goals** for long-running agent work (e.g. “close brain-map gap X”) stored as alignment items or decision-log entries; celebrate completion to reinforce intent. | **Maybe** — good for morale; **low** formal priority. | Goal rot if projects pivot; mark goals `archived`. | Alignment `status`; `linked_node_id` to graph milestone |
| **Social learning** | Facets influence which **social skills** are learned from interaction. | Agents that **observe** resolved debates or handoffs improve routing rules (meta-review), stored as operator wisdom—not automatic RL. | **Maybe** — human-curated only in near term. | Auto-learning from chats risks prompt injection. | `insight_level` = `validated` when human approves |
| **Co-location bonding** | Strong bonds often within **migrant wave** / shared spaces; time together increases tie strength. | **Co-access edges** in the brain map already encode “files used together”; treat sustained high weight as **affinity** for bundling docs or skills in packs. | **Yes** — native to current graph builder. | Co-access ≠ liking; it is correlation. | Edge `weight`; `sessionType` |

---

## Appendix A — Optional graph semantics (non-binding)

These are **future** optional uses of nodes/edges; **not** part of the stable contract today.

1. **Facet bands** → Prefer **node**-level `compass_axis` + `grimoire_tags` on a small “profile” note, not every file.
2. **Rumor / provenance** → **Edge** or node `provenance` + `insight_level` to mark how confident we are that an inference is still true.
3. **Social loss amplification** → When **removing** a high-weight hub node from a workflow, run a **manual** review (policy), not an automatic graph mutation.
4. **Grudge / conflict** → Use **`constraint`** text sparingly on edges between tools or repos that are known to conflict when used together.
5. **Goals** → **Alignment** items with `linked_node_id` pointing at a **milestone** node in the graph; archive when obsolete.

---

## Appendix B — Alignment context and intent drift

When a row implies **operator-visible intent drift** or **stress/governance**:

- **Alignment context** items ([ALIGNMENT_CONTEXT_API.md](../agent/ALIGNMENT_CONTEXT_API.md)) can carry human-readable `title`/`body` and optional **`linked_node_id`** to a brain-map node (e.g. a decision or scope artifact).
- Use **`status`** (`draft` / `active` / `archived`) to reflect whether a “life goal” or “rumor” is still operative.
- **Do not** treat alignment rows as a simulation tick; they are **documentation and API** for humans and agents.

---

## Sources (Dwarf Fortress Wiki)

- Personality facet — `https://dwarffortresswiki.org/index.php?title=Personality_facet`
- Stress — `https://dwarffortresswiki.org/index.php/Stress`
- Thoughts and preferences — `https://dwarffortresswiki.org/index.php/Thoughts_and_preferences`
- Relationship — `https://dwarffortresswiki.org/index.php/Relationship`
- Grudge — `https://dwarffortresswiki.org/index.php/Grudge`
- Rumor — `https://dwarffortresswiki.org/index.php/Rumor`
- Need — `https://dwarffortresswiki.org/index.php/DF2014:Need`
- Personality goal — `https://dwarffortresswiki.org/index.php/Personality_goal`

Wiki content and game mechanics change across DF versions; treat numbers and thresholds as **illustrative** unless you re-verify against your installed version.
