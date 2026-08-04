# General Live Cash — Misconception Taxonomy v0.1

Status: `ACTIVE_DIAGNOSTIC_SCHEMA`

Purpose: represent why a player made a wrong decision, not merely whether the final action was wrong.

## Diagnostic principle

A decision can be accidentally correct for the wrong reason. Learning repair should target the failed reasoning step rather than repeat the exact hand.

Canonical loop:

`ACTION → REASONING STEP → MISCONCEPTION → TARGETED REPAIR → VARIANT RETEST`

## Severity

- `S1 — Local`: narrow mistake with low transfer risk.
- `S2 — Structural`: repeated error across a family of spots.
- `S3 — Architecture`: corrupts multiple streets or entire game trees.

## Taxonomy

| ID | Misconception | Severity | Observable failure | Correct repair target | Mapped heuristics |
|---|---|---:|---|---|---|
| `MC-001` | Nominal-stack thinking | S3 | Uses Hero's stack instead of pairwise effective stack | Recalculate effective depth before any range or size decision | `H-W01-001`, `H-W01-003` |
| `MC-002` | Straddle denominator blindness | S3 | Calls a pot “200bb deep” while ignoring that it is ~100 straddles | Translate stack and raise size into straddle units and predicted SPR | `H-W01-003` |
| `MC-003` | Chart-cell absolutism | S2 | Treats a mixed chart hand as mandatory independent of pool, depth and rake | Classify action family and preserve uncertainty instead of memorizing a cell | `H-W01-001`, `H-W01-002` |
| `MC-004` | Random exploit expansion | S2 | Adds arbitrary squeeze or bluff hands because opponents seem weak | Purify baseline-approved candidates first | `H-W01-002`, `H-W02-007` |
| `MC-005` | Blind identity collapse | S2 | Reuses BB strategy against SB or vice versa | Reconstruct the caller's preflop source range before reading the board | `H-W01-004` |
| `MC-006` | Initiative entitlement | S2 | Bets because Hero was the preflop aggressor despite poor range interaction | Identify nut/range ownership and position before action | `H-W03-010`, `H-W03-007` |
| `MC-007` | Unfiltered turn continuation | S3 | Continues barreling after a flop call as if Villain retained the full weak range | Update the range after every bet/call filter | `H-W01-005` |
| `MC-008` | OOP discomfort raise | S2 | Raises to avoid future decisions rather than because the range requires aggression | Protect check-call with strong hands and accept realization disadvantage | `H-W01-006` |
| `MC-009` | Bluff-first construction | S3 | Chooses a bluff hand, then invents a value story | Define value threshold and size before adding bluffs | `H-W02-001` |
| `MC-010` | Jobless barrel | S2 | Barrels because hand has low showdown value but no useful rivers or blockers | Assign equity, blocker/matcher or savage-air job | `H-W02-002` |
| `MC-011` | Scary-card overbet | S2 | Overbets any ace, king, flush or straight card without range analysis | Test whether the card preserves polarization or repairs Villain | `H-W02-003` |
| `MC-012` | Size-blind defence | S3 | Responds to small and large c-bets with the same call/raise architecture | Infer width and polarity from size plus actual hand classes | `H-W02-004`, `H-W03-006` |
| `MC-013` | Hand-strength-only top-pair logic | S2 | Always slowplays strong kicker and calls weak kicker without protection analysis | Compare protection need and which bluffs the kicker blocks | `H-W02-005` |
| `MC-014` | Turn-card-only lead | S2 | Leads because turn “helps BB” without tracing the flop betting range | Identify which hand class Villain's flop size omitted | `H-W02-006` |
| `MC-015` | Personality-label exploit | S3 | Uses “nit”, “whale” or “aggro” without specifying bet/check composition | Translate read into a falsifiable branch-level range error | `H-W02-007` |
| `MC-016` | Theoretical-float attachment | S2 | Continues weak backdoors against a value-heavy range because solver sometimes calls | First locate total air in Villain's betting range | `H-W02-008` |
| `MC-017` | Relative-strength river fold | S3 | Folds because hand is “only one pair” without counting represented value | Count value, size exclusions, credible bluffs and blockers | `H-W02-009`, `H-W03-011` |
| `MC-018` | Preflop/postflop disconnect | S3 | Assigns postflop bluffs that were absent from the preflop range | Carry preflop range shape through every street | `H-W03-001`, `H-W03-005` |
| `MC-019` | Pretty-hand defence | S2 | Calls a value-heavy 3-bet with AQ/KQ because the hand looks premium | Evaluate domination against the actual value concentration | `H-W03-002` |
| `MC-020` | Range-compensation blindness | S3 | Assumes an over-wide 3-bettor can c-bet normally without excess air | Test whether the player compensates by checking enough | `H-W03-003` |
| `MC-021` | Profile averaging | S3 | Treats all actions of a tight player as strong or all actions of an aggro player as weak | Split the profile into bet and check branches | `H-W03-004` |
| `MC-022` | Blocker without ancestry | S3 | Hero-calls or bluffs based on blocker without proving the relevant combos reached river | Trace value and bluffs backward through the line | `H-W03-005`, `H-W03-011` |
| `MC-023` | Big-bet intimidation | S2 | Assumes large size is always strategically harder than small size | Compare the actual hand classes required to defend each size | `H-W03-006` |
| `MC-024` | Heads-up defence transfer to multiway | S3 | Defends as if Hero alone carries minimum defence burden | Apply shared defence and account for range behind | `H-W03-007` |
| `MC-025` | Multiway air import | S2 | Imports heads-up low-equity bluffs into multiway pots | Require backup equity, removal and collision tolerance | `H-W03-008` |
| `MC-026` | Passive-pool slowplay | S2 | Checks value expecting aggression that the table rarely provides | Identify who is supposed to bet next and fast-play when they will not | `H-W03-009` |
| `MC-027` | Nut-ownership by initiative | S3 | Assigns nut advantage to opener without comparing offsuit combos and omissions | Count relevant nut combos by preflop range | `H-W03-010` |
| `MC-028` | Visible-blocker fetish | S2 | Treats any nut blocker as a bluff candidate | Evaluate removal against realistic value, bluffs and folds | `H-W03-011` |
| `MC-029` | Frequency mimicry | S2 | Copies solver frequency without reproducing the supporting range construction | Learn strategy shape and required hand classes before frequency | Multiple |
| `MC-030` | Result-oriented exploit validation | S3 | Treats one successful bluff/call as proof of a population read | Validate through repeated branch evidence, not pot outcome | `H-W02-007`, `H-W03-004` |

## Diagnostic dimensions

Every wrong answer should be evaluated across these dimensions:

1. `NODE_IDENTITY` — positions, pot type, number of players.
2. `EFFECTIVE_DEPTH` — pairwise stack and straddle units.
3. `RANGE_SOURCE` — how each range reached the node.
4. `SIZE_SHAPE` — what the action size says about range composition.
5. `ACTION_FILTER` — what prior calls, bets and checks removed.
6. `OWNERSHIP` — range/nut advantage after the new card.
7. `COMBO_JOB` — value, equity bluff, removal bluff, bluff-catcher or protected check.
8. `FUTURE_TREE` — planned continuation and shutdown rivers.
9. `OPPONENT_MODEL` — exact branch deviation and evidence quality.
10. `MULTIWAY_STRUCTURE` — sandwich, closing action and shared defence.

## Diagnosis format

```text
Observed action:
Stated reasoning:
Correct final action?: yes/no/uncertain
Failed dimension:
Misconception ID:
Severity:
Minimal repair:
Retest family:
Confidence:
```

## Repair rules

### Minimal repair

Teach the smallest missing mechanism that would change the decision. Do not replay an entire lesson when one reasoning step failed.

### Variant retest

The retest must preserve the mechanism but change visible details:

- different cards;
- different position pair;
- different effective stack;
- same board with a different blind;
- same action line with a different size;
- heads-up versus multiway variant.

### Delayed retest

A repair is not closed by an immediate identical question. Require a delayed variant after other material.

## Priority misconception families for initial product

1. Effective-depth errors: `MC-001`, `MC-002`.
2. Range-update errors: `MC-007`, `MC-018`, `MC-022`.
3. Size/range-shape errors: `MC-012`, `MC-014`, `MC-023`.
4. Opponent-model errors: `MC-015`, `MC-020`, `MC-021`, `MC-030`.
5. Multiway transfer errors: `MC-024`, `MC-025`, `MC-027`.
6. Aggression-construction errors: `MC-009`, `MC-010`, `MC-011`.

## Taxonomy verdict

`LIVE_CASH_MISCONCEPTION_TAXONOMY_CREATED`
