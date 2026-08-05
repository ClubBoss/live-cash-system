# Live Cash System — Candidate-to-Module Validation Workbench v0.1

Status: `ACTIVE_PRECONSOLIDATION_SSOT / 34_CANDIDATES_MAPPED`

## Purpose

Map every heuristic candidate to:

- one primary adaptive module;
- optional secondary modules;
- current direct-drill coverage;
- remaining validation questions;
- likely consolidation role;
- permitted future source mutation.

This prevents repeated redistribution work after each Cash Injection or Carrot batch.

## Drill coverage vocabulary

- `DIRECT`: an original drill explicitly tests the candidate.
- `INDIRECT`: the mechanism appears inside a broader drill but lacks isolated testing.
- `MISSING`: no adequate original drill currently exists.

## Consolidation role vocabulary

- `CORE_RULE_SEED`: likely to survive as a final table-facing rule.
- `NESTED_STEP`: likely to become a step inside a larger algorithm.
- `BOUNDARY`: likely to remain an exception or misuse guard.
- `OVERLAY`: opponent/environment-dependent adjustment.
- `ADVANCED_BRANCH`: lower-frequency branch retained outside the first core route.

## Full workbench

| Candidate | Primary module | Secondary modules | Drill coverage | Remaining question IDs | Consolidation role | Expected future mutation |
|---|---|---|---|---|---|---|
| `H-W01-001` Effective stack sets preflop architecture | `LCM-01` | `LCM-02`, `LCM-07` | DIRECT: A1, A3 | `SQ-DEP-01` | CORE_RULE_SEED | add context branches; do not replace core cue |
| `H-W01-002` Expand squeezes by purifying candidates | `LCM-02` | `LCM-10` | MISSING | `SQ-PF-01`, `SQ-RNG-01` | CORE_RULE_SEED or NESTED_STEP | add candidate families and protected-flat boundary |
| `H-W01-003` Straddle changes denominator; preserve SPR | `LCM-01` | `LCM-02`, `LCM-10` | DIRECT: A2, A4 | `SQ-DEP-03` | CORE_RULE_SEED + ENVIRONMENT BRANCH | add sizing/profile overlay only |
| `H-W01-004` Identify blind range before reading board | `LCM-03` | `LCM-04` | DIRECT: B1 | `SQ-SRP-01`, `SQ-RNG-01` | CORE_RULE_SEED | improve compact blind-range anchors |
| `H-W01-005` Update turn range after flop exploit | `LCM-04` | `LCM-10` | DIRECT: B2 | `SQ-SRP-02` | NESTED_STEP inside filtering rule | likely wording/drill refinement only |
| `H-W01-006` Deep OOP protects call range first | `LCM-03` | `LCM-05`, `LCM-06` | MISSING | `SQ-DEP-02`, `SQ-SRP-05` | CORE_RULE_SEED or BOUNDARY | scope may split by SPR and board urgency |
| `H-W01-007` Read high-weight offsuit/pair mass first | `LCM-04` | `LCM-02`, `LCM-03` | INDIRECT: B1, E4 | `SQ-SRP-01` | NESTED_STEP | add fast range-reading drill and examples |
| `H-W01-008` Polar preflop bluffs target dominating offsuit opens | `LCM-02` | `LCM-06` | MISSING | `SQ-PF-03`, `SQ-RNG-01` | BOUNDARY/NESTED_STEP | likely nested under range-purpose construction |
| `H-W01-009` Current frequency depends on prior reach | `LCM-04` | `LCM-02`, `LCM-07`, `LCM-09` | INDIRECT: D4 | `SQ-PF-04`, `SQ-3B-01` | NESTED_STEP | add mixed-reach and players-behind variants |
| `H-W02-001` Value threshold before bluff volume | `LCM-06` | `LCM-09` | DIRECT: C1 | `SQ-AGG-01` | CORE_RULE_SEED | likely final compression with sizing/bluff jobs |
| `H-W02-002` Every turn bluff needs a river job | `LCM-06` | `LCM-09` | DIRECT: C2 | `SQ-AGG-02` | CORE_RULE_SEED or NESTED_STEP | add river-class taxonomy and counterexamples |
| `H-W02-003` Overbet only when polarization preserved | `LCM-06` | `LCM-04`, `LCM-09` | DIRECT: C3 | `SQ-AGG-03` | BOUNDARY/ADVANCED_BRANCH | retain ownership test; exact boards remain external |
| `H-W02-004` Flop size determines raise breadth | `LCM-05` | `LCM-04`, `LCM-10` | DIRECT: B3, C4, CI2, CI3 | `SQ-SRP-03`, `SQ-AGG-04` | CORE_RULE_SEED | likely broaden wording beyond top pair to response shape |
| `H-W02-005` Vulnerable low kicker may raise more | `LCM-05` | `LCM-06` | DIRECT: C4, CI3 | `SQ-SRP-03` | BOUNDARY/NESTED_STEP | preserve as hand-class selector, not standalone broad rule |
| `H-W02-006` Turn lead follows flop range composition | `LCM-06` | `LCM-04`, `LCM-08` | MISSING | `SQ-SRP-04` | ADVANCED_BRANCH | add direct line-based lead drill; scope may split |
| `H-W02-007` Node-lock branch, not personality | `LCM-10` | all strategic modules | DIRECT: B4, CI1, CI4, CI5 | `SQ-EXP-01` | CORE_RULE_SEED | add evidence grades/falsifiers, preserve baseline return |
| `H-W02-008` Remove speculative floats versus value-heavy bets | `LCM-10` | `LCM-05`, `LCM-09` | MISSING | `SQ-EXP-02`, `SQ-RIV-02` | OVERLAY | keep pool claim separate from range-composition mechanism |
| `H-W02-009` Audit value and size exclusions before bluff-catching | `LCM-09` | `LCM-10` | DIRECT: F2, F4 | `SQ-RIV-01`, `SQ-RIV-02` | CORE_RULE_SEED | likely merge into final river algorithm |
| `H-W03-001` 3-bet range begins preflop and persists | `LCM-07` | `LCM-02`, `LCM-04`, `LCM-09` | DIRECT: D4 | `SQ-3B-01` | CORE_RULE_SEED | add compact range-shape branches |
| `H-W03-002` Dominated big cards lose first versus value-heavy 3-bets | `LCM-07` | `LCM-02`, `LCM-10` | DIRECT: D1 | `SQ-PF-02`, `SQ-RNG-01` | OVERLAY/BOUNDARY | direction may stay; exact calls move to anchors |
| `H-W03-003` Wide preflop range must check more postflop | `LCM-07` | `LCM-05`, `LCM-10` | DIRECT: D2 | `SQ-3B-02` | NESTED_STEP | distinguish preflop width from flop range-betting width |
| `H-W03-004` Respect bet, attack check by branch | `LCM-10` | `LCM-07` | DIRECT: D3 | `SQ-3B-03`, `SQ-EXP-01` | CORE_RULE_SEED/OVERLAY | add protected-check boundary and falsifier |
| `H-W03-005` Bluff supply must be seeded before river | `LCM-09` | `LCM-06`, `LCM-07` | DIRECT: D4, F3 | `SQ-AGG-02`, `SQ-3B-04`, `SQ-RIV-02` | NESTED_STEP inside ancestry audit | likely merge with reach/filter/blocker chain |
| `H-W03-006` Small bets can be harder to defend | `LCM-05` | `LCM-10` | DIRECT: B3, CI2 | `SQ-AGG-04`, `SQ-EXP-05` | BOUNDARY + OVERLAY | split theoretical elasticity from population failure |
| `H-W03-007` Multiway defence is shared | `LCM-08` | `LCM-01` | DIRECT: E1 | `SQ-MW-01` | CORE_RULE_SEED | add sandwich/closing branches; await Carrot validation |
| `H-W03-008` Multiway bluffs need backup equity/removal | `LCM-08` | `LCM-06` | DIRECT: E2 | `SQ-MW-02` | CORE_RULE_SEED or NESTED_STEP | add candidate hierarchy and collision counterexamples |
| `H-W03-009` Fast-play value when aggression will not arrive | `LCM-08` | `LCM-10`, `LCM-11` | DIRECT: E3 | `SQ-MW-05`, `SQ-EXP-03` | OVERLAY | theory trigger plus field confidence branch |
| `H-W03-010` Multiway nut ownership follows preflop combos | `LCM-08` | `LCM-02`, `LCM-04` | DIRECT: E4 | `SQ-MW-03`, `SQ-RNG-01` | NESTED_STEP | add high-weight combo comparison, not full charts |
| `H-W03-011` Blocker matters only inside line-created range | `LCM-09` | `LCM-04`, `LCM-06` | DIRECT: F1, F3 | `SQ-RIV-03` | NESTED_STEP/BOUNDARY | mechanism effectively closed; simplify only |
| `H-R04-007` Suppressed flop aggression can reappear as turn lead | `LCM-08` | `LCM-04`, `LCM-06` | MISSING | `SQ-SRP-04`, `SQ-MW-04` | ADVANCED_BRANCH | add sandwich/delayed-aggression drill |
| `H-R04-008` Live tell is evidence, not conclusion | `LCM-10` | `LCM-11` | INDIRECT: B4, CI5 | `SQ-EXP-01`, `SQ-EXP-04` | CORE_RULE_SEED/BOUNDARY | add dedicated live-tell evidence drill |
| `H-R04-010` Preserve turn-resilient hands in passive branches | `LCM-05` | `LCM-03`, `LCM-06` | MISSING | `SQ-DEP-02`, `SQ-SRP-05` | NESTED_STEP | add protected check-back/call variants |
| `H-R05-001` Recalculate ownership after filtering actions | `LCM-04` | `LCM-06`, `LCM-07`, `LCM-09` | INDIRECT: B2, D4, F3 | `SQ-SRP-02`, `SQ-3B-04` | CORE_RULE_SEED | likely central consolidation rule; needs isolated timed drill |
| `H-R05-002` Heavy-check strategy needs active raise defence | `LCM-05` | `LCM-03`, `LCM-06` | DIRECT: CI1, CI3; broader architecture indirect | `SQ-SRP-03`, `SQ-SRP-05` | NESTED_STEP/BOUNDARY | broaden to calls + polar/merged raises by urgency |

## Coverage summary

### Directly drilled

23 candidates currently have at least one reasonably direct original drill.

### Indirect-only

4 candidates are represented indirectly and need isolated variants:

- `H-W01-007`;
- `H-W01-009`;
- `H-R04-008`;
- `H-R05-001`.

### Missing adequate direct drill

7 candidates need dedicated original drills before final admission:

- `H-W01-002` — squeeze purification;
- `H-W01-006` — deep OOP protected calls;
- `H-W01-008` — polar preflop target folds;
- `H-W02-006` — turn lead from flop composition;
- `H-W02-008` — value-heavy bet/float removal;
- `H-R04-007` — suppressed aggression reappearing later;
- `H-R04-010` — protected passive branches.

Scenario factories for all of these and the four indirect-only candidates are prepared in:

`../learning/drills/PRE_SOURCE_DIRECT_DRILL_SHELLS_v0_1.md`

## Precomputed consolidation lanes

### Lane 1 — Node, depth and environment

Candidates:

- `H-W01-001`;
- `H-W01-003`;
- depth branch of `H-W01-006`.

Expected final output:

- one core depth cue;
- straddle/environment branch;
- deep-OOP boundary.

### Lane 2 — Preflop range architecture

Candidates:

- `H-W01-002`;
- `H-W01-008`;
- `H-W01-009`;
- `H-W03-002`.

Expected final output:

- baseline candidate families;
- players-behind/realisation filter;
- value-heavy-range domination overlay;
- exact anchors kept outside rule count.

### Lane 3 — Range source, filtering and ownership

Candidates:

- `H-W01-004`;
- `H-W01-005`;
- `H-W01-007`;
- `H-W03-001`;
- `H-W03-005`;
- `H-W03-011`;
- `H-R05-001`.

Expected final output:

`SOURCE RANGE → ACTION FILTER → CURRENT OWNERSHIP → ANCESTRY → BLOCKER`

Likely one or two core rules rather than seven.

### Lane 4 — Bet shape and protected response

Candidates:

- `H-W01-006`;
- `H-W02-004`;
- `H-W02-005`;
- `H-W03-006`;
- `H-R04-010`;
- `H-R05-002`.

Expected final output:

- one response-shape rule;
- vulnerability/urgency selector;
- protected-passive boundary;
- elasticity exploit overlay.

### Lane 5 — Aggression and future jobs

Candidates:

- `H-W02-001`;
- `H-W02-002`;
- `H-W02-003`;
- `H-W02-006`.

Expected final output:

`VALUE → SIZE → BLUFF JOB → FUTURE STREET`

with overbet and turn-lead branches.

### Lane 6 — 3-bet-pot range ancestry

Candidates:

- `H-W03-001`;
- `H-W03-002`;
- `H-W03-003`;
- `H-W03-004`;
- `H-W03-005`.

Expected final output:

- one preflop-shape persistence rule;
- one compensation/branch exploit rule;
- one value-heavy overlay.

### Lane 7 — Multiway

Candidates:

- `H-W03-007`;
- `H-W03-008`;
- `H-W03-009`;
- `H-W03-010`;
- `H-R04-007`.

Expected final output:

- one structural core rule;
- one aggression/value timing branch;
- population overlay separated.

### Lane 8 — River audit

Candidates:

- `H-W02-009`;
- `H-W03-005`;
- `H-W03-011`.

Expected final output:

`VALUE → SIZE EXCLUSIONS → BLUFF ANCESTRY → BLOCKERS → EVIDENCE`

### Lane 9 — Opponent evidence

Candidates:

- `H-W02-007`;
- `H-W02-008`;
- `H-W03-004`;
- `H-W03-009`;
- `H-R04-008`;
- Cash Injection pool hypotheses.

Expected final output:

- one evidence/falsifier rule;
- separate branch overlays;
- no universal population claim.

## Finalisation rule

Do not merge candidates merely because they share vocabulary.

A consolidation is accepted only when:

1. one cue retrieves all required steps;
2. boundaries remain visible;
3. drills can diagnose which internal step failed;
4. environment-sensitive claims remain overlays;
5. learner progress can be migrated without ambiguity.

## Workbench verdict

`ALL_34_CANDIDATES_HAVE_STABLE_MODULE_OWNERSHIP`

`DRILL_COVERAGE_IS_23_DIRECT_4_INDIRECT_ONLY_7_MISSING`

`FUTURE_SOURCE_DELTAS_CAN_UPDATE_TARGETED_ROWS_ONLY`

`FINAL_CONSOLIDATION_REMAINS_DEFERRED_UNTIL_SOURCE_COMPLETION`
