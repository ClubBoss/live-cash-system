# Live Cash System - Candidate-to-Module Validation Workbench v0.3

Status: `ACTIVE_POST_SOURCE_VALIDATION_SSOT / ALL_CATALOGUED_SOURCES_COMPLETE`

Supersedes `CANDIDATE_TO_MODULE_VALIDATION_WORKBENCH_v0_2.md`.

Module and candidate identities are unchanged. This version removes the obsolete `permitted Carrot mutation` field and routes each candidate to its actual post-source validation lane.

## Drill vocabulary

- `DIRECT` - a direct original drill exists;
- `ANSWER_KEY_GATED` - a shell exists, but a stable direct answer key is not yet defensible.

## Validation lanes

- `A` independent anchors;
- `B` exact boundary or targeted visual review;
- `L` learner diagnostic/misuse testing;
- `F` target-game field calibration;
- `C` compression only;
- `R` ready core, changed variants only.

## Workbench

| Candidate | Module | Slot | Drill | Question IDs | Active validation lanes |
|---|---|---:|---|---|---|
| `H-W01-001` | `LCM-01` | 1 | DIRECT | `SQ-DEP-01` | `A / B / L` |
| `H-W01-002` | `LCM-02` | 3 | ANSWER_KEY_GATED | `SQ-PF-01`, `SQ-RNG-01` | `A / B / L` |
| `H-W01-003` | `LCM-01` | 2 | DIRECT | `SQ-DEP-03` | `B / F` |
| `H-W01-004` | `LCM-03` | 4 | DIRECT | `SQ-SRP-01`, `SQ-RNG-01` | `A / L` |
| `H-W01-005` | `LCM-04` | 5 | DIRECT | `SQ-SRP-02` | `R / C` |
| `H-W01-006` | `LCM-03` | 6 | ANSWER_KEY_GATED | `SQ-DEP-02`, `SQ-SRP-05` | `B / L` |
| `H-W01-007` | `LCM-04` | 4 | DIRECT | `SQ-SRP-01` | `A / C / L` |
| `H-W01-008` | `LCM-02` | 3 | ANSWER_KEY_GATED | `SQ-PF-03`, `SQ-RNG-01` | `A / B / L` |
| `H-W01-009` | `LCM-04` | 5 | DIRECT | `SQ-PF-04`, `SQ-3B-01` | `A / C / L` |
| `H-W02-001` | `LCM-06` | 8 | DIRECT | `SQ-AGG-01` | `C / L` |
| `H-W02-002` | `LCM-06` | 8 | DIRECT | `SQ-AGG-02` | `C / L` |
| `H-W02-003` | `LCM-06` | 9 | DIRECT | `SQ-AGG-03` | `B / C / L` |
| `H-W02-004` | `LCM-05` | 7 | DIRECT | `SQ-SRP-03` | `R / L` |
| `H-W02-005` | `LCM-05` | 7 | DIRECT | `SQ-SRP-03` | `B / L` |
| `H-W02-006` | `LCM-06` | 10 | DIRECT | `SQ-SRP-04` | `B / L` |
| `H-W02-007` | `LCM-10` | 16 | DIRECT | `SQ-EXP-01` | `F / L` |
| `H-W02-008` | `LCM-10` | 16 | DIRECT | `SQ-EXP-02`, `SQ-RIV-02` | `F / L` |
| `H-W02-009` | `LCM-09` | 15 | DIRECT | `SQ-RIV-01`, `SQ-RIV-02` | `F / C / L` |
| `H-W03-001` | `LCM-07` | 11 | DIRECT | `SQ-3B-01` | `A / L` |
| `H-W03-002` | `LCM-07` | 11 | DIRECT | `SQ-PF-02`, `SQ-RNG-01` | `A / B / L` |
| `H-W03-003` | `LCM-07` | 12 | DIRECT | `SQ-3B-02` | `B / L` |
| `H-W03-004` | `LCM-10` | 12 | DIRECT | `SQ-3B-03`, `SQ-EXP-01` | `F / L` |
| `H-W03-005` | `LCM-09` | 15 | DIRECT | `SQ-3B-04`, `SQ-RIV-02` | `A / C / L` |
| `H-W03-006` | `LCM-05` | 7 | DIRECT | `SQ-AGG-04`, `SQ-EXP-05` | `F / L` |
| `H-W03-007` | `LCM-08` | 13 | DIRECT | `SQ-MW-01` | `B / L` |
| `H-W03-008` | `LCM-08` | 13 | DIRECT | `SQ-MW-02` | `B / L` |
| `H-W03-009` | `LCM-08` | 14 | DIRECT | `SQ-MW-05`, `SQ-EXP-03` | `B / F / L` |
| `H-W03-010` | `LCM-08` | 13 | DIRECT | `SQ-MW-03`, `SQ-RNG-01` | `A / B / L` |
| `H-W03-011` | `LCM-09` | 15 | DIRECT | `SQ-RIV-03` | `C / L` |
| `H-R04-007` | `LCM-08` | 10 | ANSWER_KEY_GATED | `SQ-MW-04`, `SQ-SRP-04` | `B / L` |
| `H-R04-008` | `LCM-10` | 16 | DIRECT | `SQ-EXP-04` | `F / L` |
| `H-R04-010` | `LCM-05` | 6 | DIRECT | `SQ-DEP-02`, `SQ-SRP-05` | `B / L` |
| `H-R05-001` | `LCM-04` | 5 | DIRECT | `SQ-SRP-02`, `SQ-3B-04` | `R / C / L` |
| `H-R05-002` | `LCM-05` | 6, 7 | DIRECT | `SQ-SRP-03`, `SQ-SRP-05` | `B / C / L` |

## Coverage count

```text
DIRECT: 30
ANSWER_KEY_GATED: 4
INDIRECT_ONLY: 0
```

Answer-key-gated factories:

1. `H-W01-002` - squeeze purification;
2. `H-W01-006` - exact deep OOP protected calls;
3. `H-W01-008` - polar preflop target folds and call branch;
4. `H-R04-007` - multiway delayed aggression.

The existing drill shells remain useful. They must not be activated by inventing exact boundaries.

## Lane-level build order

Current neutral-prior closure order:

1. independent preflop architecture and anchors;
2. multiway structure and delayed aggression;
3. depth/SPR/straddle overlays;
4. target-live field calibration;
5. learner diagnostics and final compression.

Authority:

`synthesis/MAX_EV_CANDIDATE_PRIORITY_RANKING_v0_1.md`

## Consolidation lanes

Nine lanes remain stable:

1. node/depth/environment;
2. preflop architecture;
3. range source/filtering/ownership;
4. bet shape/protected response;
5. aggression/future jobs;
6. 3-bet/4-bet ancestry;
7. multiway;
8. river audit;
9. opponent evidence.

## Workbench verdict

`POST_SOURCE_VALIDATION_WORKBENCH_V0_3_ACTIVE`

`30_OF_34_CANDIDATES_HAVE_DIRECT_ORIGINAL_DRILLS`

`FOUR_ANSWER_KEYS_REMAIN_EVIDENCE_GATED`

`NO_FUTURE_COURSE_IS_A_GENERIC_BLOCKER`
