# Live Cash System — Current Source Course Evaluation v4

Date: 2026-08-06  
Status: `CURRENT / CARROT_GRADES_1_AND_2_COMPLETE`

## Evaluation scope

Included:

- Smash Live Cash — complete received corpus;
- From the Ground Up — 30/30;
- Cash Injection — 10/10;
- Carrot Poker Grade 1 — lectures, exam and feedback complete;
- Carrot Poker Grade 2 — lectures, exam and feedback complete.

Not yet evaluated as received:

- Carrot Grade 3;
- unknown supplements;
- exact visual solver outputs not needed for current mechanisms.

Scores estimate usefulness for this project's learner and target live environment. They are not universal course rankings.

## Executive comparison

| Dimension | Smash | FTGU | Cash Injection | Carrot Grades 1–2 complete |
|---|---:|---:|---:|---:|
| Foundational theory | 8.5 | 9.0 | 7.0 | 9.5 |
| Cash-specific depth | 9.3 | 7.5 | 7.5 | 8.7 |
| Preflop architecture | 8.0 | 8.3 | 6.5 | 5.8 |
| Blinds / OOP / realisation | 9.0 | 8.0 | 8.0 | 9.5 |
| Deep-stack relevance | 9.2 | 6.0 | 6.5 | 7.3 |
| Postflop range construction | 9.3 | 8.6 | 8.2 | 9.8 |
| 3-bet-pot coverage | 9.2 | 8.0 | 8.5 | 8.9 |
| Multiway coverage | 8.8 | 5.5 | 5.0 | 4.5 |
| River reasoning | 9.0 | 8.5 | 9.0 | 9.8 |
| Exploit methodology | 8.5 | 7.8 | 9.4 | 8.6 |
| Live transfer potential | 8.8 | 8.0 | 8.7 guarded | 9.1 |
| Pedagogical clarity | 7.2 | 9.0 | 8.0 | 9.8 |
| Adaptive-course usefulness | 8.6 | 8.8 | 8.8 | 9.9 |
| Standalone completeness for this learner | 8.0 | 8.2 | 6.5 | 9.0 before Grade 3 |
| Misuse risk without guardrails | Medium | Low-medium | High | Low-medium |

## Grade 2 completion delta

The exam and feedback do not add a new strategic mechanism. They validate that the lecture-derived operating model is also the intended assessment model:

```text
ACTION HISTORY
→ RANGE FILTERING
→ WORLD FAVOURABILITY
→ FREQUENCY
→ RELATIVE POLARISATION
→ SIZE / RAISE BREADTH
→ HAND TIER / RESPONSE THRESHOLD
→ CHECK EV / FINISHING EQUITY
→ BLOCKERS
→ FIELD EVIDENCE
```

Strongest completion gains:

- source answer keys for all ten Grade 2 exam questions;
- better-hand versus better-bluff distinction;
- negative-EV-bet examples;
- delayed fold equity as check EV;
- explicit robustness/frailness thresholds;
- suit-specific bluff-catching and bluff-raising logic;
- bottom-of-range bluff-raise repair;
- frequency-versus-magnitude repair;
- exam-mode runtime and misconception repair map.

## Updated Carrot verdict

### Best role

The strongest current pedagogical and operational system for heads-up postflop range reasoning, betting, responding, assessment and misconception repair.

### Strongest blocks

- full-tree EV;
- action filtering and relative range shape;
- betting frequency versus sizing;
- value/bluff/check tiering;
- OOP/IP protected branches;
- facing-bet thresholds;
- robustness and frailness;
- bluff-catching ancestry;
- river audit and blocker/interference ordering;
- 3-bet-pot flop simplification;
- postflop raising;
- exam-mode adaptive assessment.

### Remaining weaknesses

- little squeeze construction;
- limited preflop architecture;
- no independently admissible exact anchors;
- exact deep-stack thresholds remain incomplete;
- multiway remains a major weakness;
- Grade 3 may add preflop, depth, multiway or advanced raising context;
- some exact solver boundaries remain visual-dependent.

### Score

```text
pedagogy:             9.8/10
strategic evidence:   9.2/10
adaptive usefulness:  9.9/10
standalone route:     9.0/10 before Grade 3
```

## Best source by function

| Function | Best current source | Why |
|---|---|---|
| Foundational sequence | FTGU | broad coherent progression with low cognitive load |
| Advanced cash depth | Smash | strongest deep, OOP, multiway and difficult 3-bet-pot evidence |
| Exploit construction | Cash Injection | clearest branch-specific human-error layer |
| Pedagogy and assessments | Carrot | strongest executable terminology, exams and repair design |
| Betting frequency and sizing | Carrot | clearest separation of favourability, polarisation, tiers and toolkits |
| Facing bets and bluff-catching | Carrot + Cash Injection | threshold system plus ancestry and field-gated exploit |
| River range audit | Carrot + Cash Injection + Smash | thresholds, ancestry, blockers and advanced composition |
| Multiway | Smash | other received courses remain materially weaker |
| Preflop teaching | FTGU | best broad structure; exact anchors still independent work |
| Deep OOP | Smash, with Carrot pedagogy | Smash provides depth; Carrot supplies robust/frail and slow-play language |
| 3-bet-pot flop planning | Smash + Carrot | advanced architecture plus teachable simplification |

## Combined-system assessment

```text
FTGU
→ conceptual floor and broad sequence

Smash
→ advanced cash depth and multiway architecture

Cash Injection
→ guarded exploit branches and falsifiers

Carrot Grades 1–2
→ mature postflop pedagogical, assessment and repair operating system
```

Current combined evidence quality: `9.3/10`.

Current learner-facing product readiness: approximately `8.1/10`.

Theoretical readiness is high for ordinary heads-up 100–150bb pots and strong for many 100–200bb postflop nodes. Readiness for 200–400bb exact thresholds, multiway, straddled pots and Batumi-specific population exploits remains incomplete.

## Remaining source value

Grade 3 is now the primary open source phase. Its highest-value potential is:

- preflop and squeeze construction;
- exact deep-OOP boundaries;
- multiway structure;
- advanced flop/turn raising;
- depth and straddle context;
- true counterexamples to currently mature postflop mechanisms;
- closure of the four source-gated direct drills.

## Stop decision

Do not finalise exact anchors or admit the final Playbook yet. Grade 2 is complete, and further unsourced postflop polishing has lower value than ingesting Grade 3 and then performing final consolidation.

## Terminal verdict

`CARROT_GRADES_1_AND_2_COMPLETE_AND_HIGH_VALUE`

`BEST_CURRENT_POSTFLOP_PEDAGOGICAL_ASSESSMENT_AND_REPAIR_SYSTEM`

`GENERAL_POSTFLOP_CORE_MATURE_AT_MECHANISM_LEVEL`

`NO_NEW_CORE_CANDIDATE_REQUIRED`

`GRADE_3_REMAINS_PRIMARY_OPEN_SOURCE_PHASE`
