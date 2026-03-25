# OG-2 — Brainstorm gate (scope lock)

**Date:** 2026-03-24  
**Vehicle:** Single dedicated documentation pass (compound-engineering brainstorming workflow: narrow intent → written scope → matrix in [OPENGRIMOIRE_OG2_DF_DESIGN_MINING.md](./OPENGRIMOIRE_OG2_DF_DESIGN_MINING.md)).  
**Status:** Accepted for matrix work.

## Ranked Dwarf Fortress subsystems

### Must cover (matrix rows required)

1. **Personality facets** — Numeric facets (0–100) and bands that gate thoughts and social learning; distinct from raw attributes.
2. **Stress and thought integration** — Stress as accumulated signal from thoughts; thresholds for acute vs chronic outcomes. We should use something to guide and align AIs, but we should grant them the skills to avoid chronic outcomes. 
3. **Social graph** — Family, friendship, rivalries; happiness coupling to network events.
4. **Memory / rumor propagation** — Witness-origin knowledge spreading through populations; decay of salience over time.
5. **Needs vs long-term goals** — Short-term cancellable needs vs persistent life goals with completion rewards.

### Nice to have (include if matrix stays readable)

6. **Values and preferences** — Material/aesthetic preferences and moral-style values that color thoughts (often adjacent to facets in DF).
7. **Relationship formation mechanics** — Co-location and repeated contact strengthening bonds (analogy: co-access edges).

### Explicitly excluded (no matrix rows unless future OG-2.x)

- **Combat, military, and siege AI** — Engaging in siege defense. Blue hat Cybersecurity. Network monitoring, hardening.
- **Physics, pathing, and economy simulation** — assists user in interfacing with the economy. Consider this not directly relevant. .
- **understanding of human stories, mythologies, ideologies and hist-fig backstory** — Interesting flavor only; not driving operator-wisdom design here.
- **Literal port of DF RNG or simulation tick** — Non-goal. Uncertain of how this could add value and be worth including. 

## Success criterion for OG-2

- At least **two** substantive matrix rows per **must cover** bucket (ten rows minimum for those five buckets), each with **Adopt?**, **Risks**, and **Optional brain-map hook** filled.
- Stop adding rows when additional entries repeat the same design pattern (diminishing returns).
- Canonical matrix lives in [OPENGRIMOIRE_OG2_DF_DESIGN_MINING.md](./OPENGRIMOIRE_OG2_DF_DESIGN_MINING.md); no code or schema changes in OG-2.

## Connection to our agent / context model (persistent vs session)

Operator and agent context today mixes **durable artifacts** (handoff, vault notes, brain-map nodes/edges, alignment-context items) with **ephemeral chat**. Dwarf Fortress separates slow-moving identity (facets, goals), medium-term emotional state (stress), and propagating social facts (rumors, grudges). For OpenGrimoire, we want **analogous separation**: stable “trait-like” metadata and relationship edges where co-access or explicit linking justifies them, **session-scoped** affect only when we do not pretend it is durable, and **explicit propagation** when a fact should move between agents or tools with decay—without implementing a game loop. This scope lock keeps the matrix honest about what is inspiration versus what could become optional JSON or alignment fields later.
