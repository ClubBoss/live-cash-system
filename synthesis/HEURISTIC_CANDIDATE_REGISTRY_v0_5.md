# General Live Cash - Heuristic Candidate Registry v0.5

Status: `ACTIVE_CANDIDATE_REGISTRY / PREFLOP_ANCHOR_WAVE_COMPLETE / POST_SOURCE_GATES_ACTIVE`

Supersedes `HEURISTIC_CANDIDATE_REGISTRY_v0_4.md`. Candidate IDs and module ownership remain stable.

## Status vocabulary

- `VALIDATION_PENDING`
- `DRILL_READY`
- `FIELD_TEST_PENDING`
- `ADMITTED`
- `REVISED`
- `REJECTED`
- `BLOCKED`

## Residual gate vocabulary

- `ANCHOR` - further independent range calibration required;
- `BOUNDARY` - exact depth, size, position or context split required;
- `VISUAL` - material source geometry can change the answer;
- `DRILL` - stable original direct answer key missing;
- `LEARNER` - misuse/error probability not measured;
- `FIELD` - target-game frequency or magnitude not validated;
- `COMPRESSION` - final merge/split or wording only;
- `NONE_CORE` - core mechanism stable.

## Unified registry

| ID | Compact mechanism | Module | Slot | Status | Current residual gate |
|---|---|---|---:|---|---|
| `H-W01-001` | Effective stack sets preflop architecture | `LCM-01` | 1 | VALIDATION_PENDING | `BOUNDARY / LEARNER`: 40-60/80-120/150-250/300-400 structural bands active; exact line thresholds pending |
| `H-W01-002` | Expand squeezes by purifying existing candidates | `LCM-02` | 3 | DRILL_READY | `ANCHOR / LEARNER / FIELD`: direct family answer key active; exact mixes and room response pending |
| `H-W01-003` | Straddle changes denominator and SPR | `LCM-01` | 2 | DRILL_READY | `BOUNDARY / FIELD`: denominator rule active; exact game sizing pending |
| `H-W01-004` | Identify blind/source range before board | `LCM-03` | 4 | DRILL_READY | `ANCHOR / LEARNER`: compact RFI and blind anchors active; room calibration pending |
| `H-W01-005` | Update range after an exploited street continues | `LCM-04` | 5 | DRILL_READY | `NONE_CORE`: changed examples and timed retrieval only |
| `H-W01-006` | Deep OOP: protect resilient calls before raising | `LCM-03` | 6 | VALIDATION_PENDING | `BOUNDARY / VISUAL / DRILL`: exact deep OOP response boundary |
| `H-W01-007` | Read high-weight offsuit and pair mass first | `LCM-04` | 4 | DRILL_READY | `COMPRESSION / LEARNER`: anchor mass examples active |
| `H-W01-008` | Polar preflop bluffs target dominating folds | `LCM-02` | 3 | DRILL_READY | `ANCHOR / LEARNER / FIELD`: direct target-fold answer key active; exact mix and response calibration pending |
| `H-W01-009` | Current frequency depends on origin and prior reach | `LCM-04` | 5 | DRILL_READY | `ANCHOR / LEARNER`: players-behind and reach overlays active |
| `H-W02-001` | Value threshold before bluff volume | `LCM-06` | 8 | DRILL_READY | `COMPRESSION / LEARNER` |
| `H-W02-002` | Every turn bluff needs a future job | `LCM-06` | 8 | DRILL_READY | `COMPRESSION / LEARNER` |
| `H-W02-003` | Large size only when polarization survives | `LCM-06` | 9 | DRILL_READY | `BOUNDARY / VISUAL` |
| `H-W02-004` | Bet shape determines raise breadth | `LCM-05` | 7 | DRILL_READY | `NONE_CORE` |
| `H-W02-005` | Vulnerable made hands may raise more | `LCM-05` | 7 | DRILL_READY | `BOUNDARY / LEARNER` |
| `H-W02-006` | Turn lead/probe follows flop range composition | `LCM-06` | 10 | DRILL_READY | `BOUNDARY`: multiway integration pending |
| `H-W02-007` | Exploit the exact branch, not the personality | `LCM-10` | 16 | DRILL_READY | `FIELD / LEARNER` |
| `H-W02-008` | Remove speculative continues versus air-poor value-heavy bets | `LCM-10` | 16 | VALIDATION_PENDING | `FIELD` |
| `H-W02-009` | River bluff-catch begins with value, size and ancestry | `LCM-09` | 15 | VALIDATION_PENDING | `FIELD / LEARNER` |
| `H-W03-001` | A 3-bet/4-bet-pot range begins preflop and persists | `LCM-07` | 11 | DRILL_READY | `ANCHOR / LEARNER`: compact family anchors active; exact matrices pending |
| `H-W03-002` | Dominated big cards lose first versus value-heavy 3-bets | `LCM-07` | 11 | VALIDATION_PENDING | `ANCHOR / BOUNDARY`: fold-first hierarchy active; exact continue ranges pending |
| `H-W03-003` | Wide preflop ranges require postflop compensation | `LCM-07` | 12 | DRILL_READY | `BOUNDARY / LEARNER` |
| `H-W03-004` | Split strong and weak action branches | `LCM-10` | 12 | DRILL_READY | `FIELD` |
| `H-W03-005` | Bluff supply must be seeded before river | `LCM-09` | 15 | DRILL_READY | `COMPRESSION / LEARNER` |
| `H-W03-006` | Small sizes can be harder to defend | `LCM-05` | 7 | DRILL_READY | `FIELD / LEARNER` |
| `H-W03-007` | Multiway defence is shared | `LCM-08` | 13 | DRILL_READY | `BOUNDARY / VISUAL` |
| `H-W03-008` | Multiway bluffs need backup equity/removal | `LCM-08` | 13 | DRILL_READY | `BOUNDARY / VISUAL` |
| `H-W03-009` | Fast-play value when aggression will not arrive | `LCM-08` | 14 | VALIDATION_PENDING | `FIELD / BOUNDARY` |
| `H-W03-010` | Multiway nut ownership follows preflop combos | `LCM-08` | 13 | DRILL_READY | `ANCHOR / VISUAL` |
| `H-W03-011` | Blockers matter only inside line-created ranges | `LCM-09` | 15 | DRILL_READY | `COMPRESSION / LEARNER` |
| `H-R04-007` | Suppressed flop aggression can reappear later | `LCM-08` | 10 | DRILL_READY | `BOUNDARY / VISUAL / DRILL`: multiway delayed-aggression answer key pending |
| `H-R04-008` | A live tell is evidence, not a conclusion | `LCM-10` | 16 | DRILL_READY | `FIELD / LEARNER` |
| `H-R04-010` | Preserve resilient hands in passive branches | `LCM-05` | 6 | DRILL_READY | `BOUNDARY`: deep OOP split shared with `H-W01-006` |
| `H-R05-001` | Recalculate ownership after every range filter | `LCM-04` | 5 | DRILL_READY | `NONE_CORE` |
| `H-R05-002` | Heavy-check strategies need active calls and raises | `LCM-05` | 6, 7 | DRILL_READY | `BOUNDARY / LEARNER` |

## Preflop wave effect

Created:

- explicit Batumi assumptions grid;
- five independent anchor cards;
- machine-readable anchor library;
- changed-node validation;
- direct original squeeze and polar-target drill pack.

No proprietary chart or exact source cell was copied.

## Direct drill coverage

```text
direct original drill: 32
answer-key-gated direct drill gap: 2
indirect-only: 0
```

Remaining gaps:

- `H-W01-006` - exact deep OOP protected-call boundary;
- `H-R04-007` - multiway delayed aggression.

## Status counts

- total: `34`;
- `DRILL_READY`: `28`;
- `VALIDATION_PENDING`: `6`;
- `FIELD_TEST_PENDING`: `0`;
- `ADMITTED`: `0`.

Only `H-W01-002` changes status in this wave. `H-W01-008` was already `DRILL_READY`, but its missing direct answer key is now closed.

## Validation boundary

The preflop anchor wave supports directional execution and original drills. It does not establish:

- exact equilibrium mixes;
- universal room ranges;
- exact 200bb/400bb matrices;
- Batumi population frequencies;
- final admission.

## Priority routing

Preflop architecture moves from highest-value unbuilt lane to active provisional system. Next closure lane is multiway action order and delayed aggression.

Authority:

`synthesis/MAX_EV_CANDIDATE_PRIORITY_RANKING_v0_2.md`

## Final consolidation policy

`MINIMUM COMPLEXITY SUBJECT TO NO MATERIAL EV LOSS`

No numerical rule target applies.

## Verdict

`UNIFIED_CANDIDATE_REGISTRY_V0_5_ACTIVE`

`PREFLOP_DIRECTIONAL_ANCHORS_ACTIVE`

`DIRECT_DRILL_COVERAGE_32_OF_34`

`H_W01_002_PROMOTED_TO_DRILL_READY`

`NO_ADMISSION_PROMOTION`
