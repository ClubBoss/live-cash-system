# Cash Injection Complete Course — Cross-Source Delta v1

Status: `COMPLETE_10_EPISODE_PASS / NO_NEW_CORE_CANDIDATE_REQUIRED`

## Course-level contribution

Cash Injection contributes primarily an exploit and branch-classification layer. Its strongest reusable contribution is not any single population claim, but a compact model for predicting where human ranges may become air-rich or value-heavy.

## Compression scaffold

```text
ORIGIN RANGE WIDTH
→ FILTER DENSITY
→ SURVIVING AIR / VALUE
→ SIZE ELASTICITY
→ BRANCH-SPECIFIC RESPONSE
→ EVIDENCE / FALSIFIER
```

### Origin range width

Wide late-position and blind ranges begin with more offsuit air and marginal combinations. Tight early-position ranges begin with less.

### Filter density

Every voluntary bet, call or raise removes combinations. A range that checks through can remain broad and unfiltered; a range that calls or raises repeatedly becomes narrow and value-concentrated.

### Surviving air/value

The current node must be reconstructed from the actual line. Missing early bluffs cannot appear later. Conversely, wide ranges that were not filtered can preserve a large air supply.

### Size elasticity

Smaller bets and raises give better prices and require wider defence. If humans fold the same hand classes regardless of price, the smaller size may exploit a larger error.

### Branch-specific response

The same opponent can:

- overfold one branch;
- overbluff another;
- underbluff a raise branch;
- overprobe after a check;
- adapt after repeated pressure.

No global player label replaces branch analysis.

### Evidence/falsifier

Population direction is a hypothesis until the relevant branch is observed or independently supported.

## Episode map

| Episode | Main mechanism | Pool-hypothesis layer | Primary modules | Primary slots |
|---:|---|---|---|---|
| 1 | small range-bet response elasticity; merged raises | overfold / under-three-bet versus small check-raise | `LCM-05`, `LCM-10` | 7, 16 |
| 2 | bet-check-bet river ancestry | bet-check-bet overbluff | `LCM-09`, `LCM-10` | 15, 16 |
| 3 | 3-bet-pot triple-barrel ancestry and overfold | river overfold after triple barrel | `LCM-07`, `LCM-09`, `LCM-10` | 11, 15, 16 |
| 4 | filtered versus unfiltered range density | aggression from unfiltered ranges overbluffed | `LCM-04`, `LCM-09`, `LCM-10` | 5, 15, 16 |
| 5 | origin-range width predicts bluff supply | wide-origin overbluff / tight-origin underbluff | `LCM-02`, `LCM-04`, `LCM-09` | 3, 5, 15 |
| 6 | protect check-back; attack over-wide turn probes | turn probes too wide and too merged | `LCM-04`, `LCM-05`, `LCM-06`, `LCM-10` | 6, 7, 10, 16 |
| 7 | protect OOP check; induce and attack float bets | float bets too wide and overfold to raises | `LCM-05`, `LCM-06`, `LCM-10` | 6, 7, 16 |
| 8 | small merged river probe; price elasticity | overfold versus small river probes | `LCM-06`, `LCM-09`, `LCM-10` | 8, 15, 16 |
| 9 | small IP raises in 3-bet pots; branch split | overfold to raise / underbluff three-bet | `LCM-05`, `LCM-07`, `LCM-10` | 7, 11, 12, 16 |
| 10 | heavily filtered air-poor branch; exploitative fold | late-street filtered nodes underbluffed | `LCM-04`, `LCM-09`, `LCM-10` | 5, 15, 16 |

## Apparent contradictions resolved

### Episodes 2, 4 and 5 versus Episode 10

Not a contradiction.

- E02/E04/E05 focus on wide or weakly filtered branches with many surviving air combinations.
- E10 focuses on ranges filtered repeatedly by voluntary investments, leaving few natural bluffs.

Resolution: `CONTEXT_SPLIT / RANGE_ANCESTRY`.

### Episode 3 versus Episode 10

Not a contradiction.

- E03 is Hero's bluffing decision against an assumed overfolding defending range.
- E10 is Hero's bluff-catching decision against an assumed underbluffed aggressive range.

Resolution: `DIFFERENT_PLAYER_ROLE_AND_BRANCH`.

### Episode 6 versus “every bluff needs a future job”

Partial wording tension.

The instructor says a turn raise can be immediately profitable without a complete river plan. This does not remove the need to know the main river response classes.

Resolution: `GRANULARITY_DIFFERENCE`.

### Episode 9 raise-more and fold-more

Not contradictory.

The c-bet branch may overfold while the flop three-bet branch may be value-heavy. The exploit explicitly splits the branches.

Resolution: `BRANCH_SPLIT`.

## Candidate relations

### Strongly strengthened

- `H-W01-009` — prior reach and origin range;
- `H-W02-004` — bet size determines response breadth;
- `H-W02-007` — node-lock the branch;
- `H-W02-008` — remove speculative continues versus air-poor value-heavy ranges;
- `H-W02-009` — river value/bluff/size audit;
- `H-W03-001` — 3-bet shape persists;
- `H-W03-004` — split strong and weak branches;
- `H-W03-005` — bluff supply is seeded earlier;
- `H-W03-006` — small sizes create demanding defence elasticity;
- `H-W03-011` — blocker value depends on ancestry;
- `H-R04-010` — protect passive branches;
- `H-R05-001` — recalculate after filtering;
- `H-R05-002` — passive strategies need active calls and raises.

### Directly closes or materially advances drill gaps

- `H-W02-006` — turn lead/probe from flop range composition;
- `H-W02-008` — value-heavy branch and float removal;
- `H-R04-010` — protected passive branches;
- `H-W01-007` — high-weight range mass;
- `H-W01-009` — prior reach;
- `H-R04-008` — evidence, not conclusion;
- `H-R05-001` — timed ownership recalculation.

### Still source-sensitive after Cash Injection

- exact deep-OOP protected-call boundaries;
- squeeze purification;
- polar preflop target folds;
- multiway delayed aggression;
- exact preflop anchors;
- population magnitude in target live games.

## New-candidate gate

No new general-core candidate is required.

Potentially novel Cash Injection language is nested as follows:

- origin range → `H-W01-009`, `H-W03-001`, `H-W03-005`;
- unfiltered range → `H-W01-009`, `H-R05-001`;
- transparency-seeking raise → value/protection plus response filtering under `H-W02-004`, `H-W02-005`, `H-W03-004`;
- small probe → sizing/value construction under `H-W02-001`, `H-W02-003`, `H-W03-006`;
- exploitative fold → `H-W02-008`, `H-W02-009`, `H-W03-011`.

## Product-facing compression candidate

The course supplies one internal diagnostic sequence:

```text
How wide did the range start?
What voluntary actions filtered it?
How much value and air can still exist?
What does the size require?
Which exact branch error is evidenced?
```

This is an internal step shared by Slots 5, 15 and 16, not a seventeenth final rule by default.

## Pool-hypothesis treatment

Every population claim is stored separately with:

- node trigger;
- evidence grade;
- falsifiers;
- context splits;
- field observation mission;
- baseline-return rule.

No Cash Injection population frequency is admitted as a Batumi default.

## Course verdict

`CASH_INJECTION_10_OF_10_CROSS_SOURCE_PASS_COMPLETE`

`FILTER_DENSITY_AND_BRANCH_ELASTICITY_MODEL_ACCEPTED`

`NO_NEW_CORE_CANDIDATE_COUNT_INCREASE`

`POPULATION_MAGNITUDE_REMAINS_FIELD_GATED`
