# Agent harness — staff engineer improvement prompt (canonical)

**Status:** Reusable prompt template (not product spec).  
**Paired research:** [AGENT_HARNESS_PRIMITIVES_2026-04-03.md](./AGENT_HARNESS_PRIMITIVES_2026-04-03.md) — primitives catalog, **gap matrix**, **P1–P12 backlog seeds**.  
**Filled example:** [AGENT_HARNESS_IMPROVEMENT_PROGRAM_2026-04-03.md](./AGENT_HARNESS_IMPROVEMENT_PROGRAM_2026-04-03.md) — one run of this prompt against that snapshot.

## How to use

1. Attach or `@` **AGENT_HARNESS_PRIMITIVES_2026-04-03.md** (or a fork with an updated gap matrix).
2. Optionally specify **priority scope:** OpenGrimoire (OpenGrimoire) only, harness (MiscRepos + OpenHarness), Arc_Forge workspace, or **all three** (default).
3. Paste everything below the line **---** into the same message.

---

**Role:** You are a staff engineer helping us turn a research note into an ordered improvement program. Be precise; cite the doc’s **P1–P12** IDs when mapping work. Treat unverified vendor-specific claims in the source as **illustrative**, not requirements.

**Context document:** `OpenGrimoire/docs/research/AGENT_HARNESS_PRIMITIVES_2026-04-03.md` (secondary-source synthesis of agent-harness primitives, gap matrix for OpenGrimoire / MiscRepos+OpenHarness / Arc_Forge, and P1–P12 backlog seeds).

**Inputs I will provide (or infer from the doc):**

1. The **gap matrix** row(s) or full table (A/P/G per repo per primitive).
2. Optional: which **repo or product** we are prioritizing first (e.g. OpenGrimoire only vs harness vs workspace).

**Do the following in order:**

1. **Executive read (3–5 bullets):** Restate the doc’s core thesis in your own words (e.g. plumbing vs model, premature complexity). Do not add new frameworks unless labeled *suggestion*.

2. **Task decomposition from gap analysis:** For each primitive **P1–P12**, using the gap matrix:
   - State current maturity (**A / P / G**) for our **chosen priority scope** (default: all three columns if I did not specify).
   - Turn the gap into **1–3 concrete work packages** (title + 1 sentence outcome + **dependency** on other P# if any).
   - Map each work package to the doc’s **matching backlog seed** row (same P#) and extend acceptance criteria only where needed (keep criteria **verifiable**).

3. **Improve using the 12 principles:** Produce a **phased roadmap** (Phase 1 = highest leverage / lowest risk; justify in 1 line each). Prefer **foundation before ornament**: registry/permissions/state (P1–P4) before multi-agent patterns (P10–P11) unless a cell is **A** and blocking.

4. **Beyond the twelve — meta-principles and process:** Extract **non-catalog** lessons implied by the doc and the source framing (e.g. *premature complexity kills projects*; *velocity requires guardrails*). For each meta-principle:
   - Name it in one line.
   - Propose how it maps to **our** existing controls: **critic loop**, **intent-alignment / drift gate**, **verifier vs implementer**, **pre-commit / checksum / contract matrix** — or say **gap** if we lack a hook.
   - One **concrete** process rule (e.g. “no new MCP server without updating capability map + risk tier”) or **review checkpoint**.

5. **Risks and anti-patterns:** List 3–5 ways this roadmap could fail (e.g. gold-plating P11 before P4). How we detect each early.

**Output format:** Use headings: **Summary → Work packages by P# → Phased roadmap → Meta-principles & process hooks → Risks.** Keep the whole response **skimmable**; tables welcome.

**Constraints:** Do not paste long Q&A from the original video. Do not treat revenue figures or internal architecture details as facts. If the doc conflicts with product reality, **flag the conflict** and suggest a **single** validation step.
