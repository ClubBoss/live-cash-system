# Live Cash System - Candidate-to-Module Validation Workbench v0.4

Status: `ACTIVE_POST_SOURCE_VALIDATION_SSOT / PREFLOP_ANCHOR_WAVE_COMPLETE`

Supersedes `CANDIDATE_TO_MODULE_VALIDATION_WORKBENCH_v0_3.md`.

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
| `H-W01-001` | `LCM-01` | 1 | DIRECT | `SQ-DEP-01` | `B / L` |
| `H-W01-002` | `LCM-02` | 3 | DIRECT | `SQ-PF-01`, `SQ-RNG-01` | `A / L / F` |
| `H-W01-003` | `LCM-01` | 2 | DIRECT | `SQ-DEP-03` | `B / F` |
| `H-W01-004` | `LCM-03` | 4 | DIRECT | `SQ-SRP-01`, `SQ-RNG-01` | `A / L / F` |
| `H-W01-005` | `LCM-04` | 5 | DIRECT | `SQ-SRP-02` | `R / C` |
| `H-W01-006` | `LCM-03` | 6 | ANSWER_KEY_GATED | `SQ-DEP-02`, `SQ-SRP-05` | `B / L` |
| `H-W01-007` | `LCM-04` | 4 | DIRECT | `SQ-SRP-01` | `C / L` |
| `H-W01-008` | `LCM-02` | 3 | DIRECT | `SQ-PF-03`, `SQ-RNG-01` | `A / L / F` |
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
| `H-W03-001` | `LCM-07` | 11 | DIRECT | `SQ-3B-01` | `A / L / F` |
| `H-W03-002` | `LCM-07` | 11 | DIRECT | `SQ-PF-02`, `SQ-RNG-01` | `A / B / L / F` |
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
DIRECT: 32
ANSWER_KEY_GATED: 2
INDIRECT_ONLY: 0
```

Remaining answer-key factories:

1. `H-W01-006` - exact deep OOP protected calls;
2. `H-R04-007` - multiway delayed aggression.

## Preflop artifacts

- assumptions: `../ranges/assumptions/BATUMI_LIVE_PREFLOP_ASSUMPTIONS_v1.md`;
- machine library: `../ranges/independent/PREFLOP_ANCHOR_LIBRARY_v0_1.json`;
- table anchors: `../ranges/anchors/LIVE_CASH_PREFLOP_ANCHORS_v0_1.md`;
- validation: `../ranges/validation/PREFLOP_ANCHOR_VALIDATION_REPORT_v0_1.md`;
- direct drills: `../learning/drills/PREFLOP_SQUEEZE_AND_POLAR_TARGET_DRILL_PACK_v0_1.md`.

## Lane-level build order

1. multiway action-order and delayed aggression;
2. deep OOP and exact depth/SPR boundaries;
3. learner diagnostics and error-probability update;
4. target-live field calibration;
5. solver calibration of exact preflop edge bands;
6. final compression and admission.

Authority:

`synthesis/MAX_EV_CANDIDATE_PRIORITY_RANKING_v0_2.md`

## Workbench verdict

`POST_SOURCE_VALIDATION_WORKBENCH_V0_4_ACTIVE`

`32_OF_34_CANDIDATES_HAVE_DIRECT_ORIGINAL_DRILLS`

`TWO_ANSWER_KEYS_REMAIN_EVIDENCE_GATED`

`PREFLOP_DIRECTIONAL_ANCHOR_WAVE_COMPLETE`
