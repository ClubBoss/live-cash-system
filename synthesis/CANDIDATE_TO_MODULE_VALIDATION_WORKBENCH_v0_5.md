# Live Cash System - Candidate-to-Module Validation Workbench v0.5

Status: `ACTIVE_VALIDATION_SSOT / MULTIWAY_DIRECTIONAL_WAVE_COMPLETE`

Supersedes `CANDIDATE_TO_MODULE_VALIDATION_WORKBENCH_v0_4.md`.

## Drill vocabulary

- `DIRECT` — direct original drill exists;
- `ANSWER_KEY_GATED` — direct shell exists but answer key remains unstable.

Validation lanes: `A` anchor, `B` boundary/visual, `L` learner, `F` field, `C` compression, `R` ready core.

## Workbench

| Candidate | Module | Drill | Questions | Active lanes |
|---|---|---|---|---|
| `H-W01-001` | `LCM-01` | DIRECT | `SQ-DEP-01` | `B / L` |
| `H-W01-002` | `LCM-02` | DIRECT | `SQ-PF-01`, `SQ-RNG-01` | `A / L / F` |
| `H-W01-003` | `LCM-01` | DIRECT | `SQ-DEP-03` | `B / F` |
| `H-W01-004` | `LCM-03` | DIRECT | `SQ-SRP-01`, `SQ-RNG-01` | `A / L / F` |
| `H-W01-005` | `LCM-04` | DIRECT | `SQ-SRP-02` | `R / C` |
| `H-W01-006` | `LCM-03` | ANSWER_KEY_GATED | `SQ-DEP-02`, `SQ-SRP-05` | `B / L` |
| `H-W01-007` | `LCM-04` | DIRECT | `SQ-SRP-01` | `C / L` |
| `H-W01-008` | `LCM-02` | DIRECT | `SQ-PF-03`, `SQ-RNG-01` | `A / L / F` |
| `H-W01-009` | `LCM-04` | DIRECT | `SQ-PF-04`, `SQ-3B-01` | `A / C / L` |
| `H-W02-001` | `LCM-06` | DIRECT | `SQ-AGG-01` | `C / L` |
| `H-W02-002` | `LCM-06` | DIRECT | `SQ-AGG-02` | `C / L` |
| `H-W02-003` | `LCM-06` | DIRECT | `SQ-AGG-03` | `B / C / L` |
| `H-W02-004` | `LCM-05` | DIRECT | `SQ-SRP-03` | `R / L` |
| `H-W02-005` | `LCM-05` | DIRECT | `SQ-SRP-03` | `B / L` |
| `H-W02-006` | `LCM-06` | DIRECT | `SQ-SRP-04`, `SQ-MW-04` | `R / L` |
| `H-W02-007` | `LCM-10` | DIRECT | `SQ-EXP-01` | `F / L` |
| `H-W02-008` | `LCM-10` | DIRECT | `SQ-EXP-02`, `SQ-RIV-02` | `F / L` |
| `H-W02-009` | `LCM-09` | DIRECT | `SQ-RIV-01`, `SQ-RIV-02` | `F / C / L` |
| `H-W03-001` | `LCM-07` | DIRECT | `SQ-3B-01` | `A / L / F` |
| `H-W03-002` | `LCM-07` | DIRECT | `SQ-PF-02`, `SQ-RNG-01` | `A / B / L / F` |
| `H-W03-003` | `LCM-07` | DIRECT | `SQ-3B-02` | `B / L` |
| `H-W03-004` | `LCM-10` | DIRECT | `SQ-3B-03`, `SQ-EXP-01` | `F / L` |
| `H-W03-005` | `LCM-09` | DIRECT | `SQ-3B-04`, `SQ-RIV-02` | `A / C / L` |
| `H-W03-006` | `LCM-05` | DIRECT | `SQ-AGG-04`, `SQ-EXP-05` | `F / L` |
| `H-W03-007` | `LCM-08` | DIRECT | `SQ-MW-01` | `B_EXACT / L` |
| `H-W03-008` | `LCM-08` | DIRECT | `SQ-MW-02` | `B_EXACT / L` |
| `H-W03-009` | `LCM-08` | DIRECT | `SQ-MW-05`, `SQ-EXP-03` | `F / L` |
| `H-W03-010` | `LCM-08` | DIRECT | `SQ-MW-03`, `SQ-RNG-01` | `A / B_EXACT / L / F` |
| `H-W03-011` | `LCM-09` | DIRECT | `SQ-RIV-03` | `C / L` |
| `H-R04-007` | `LCM-08` | DIRECT | `SQ-MW-04`, `SQ-SRP-04` | `B_EXACT / F / L` |
| `H-R04-008` | `LCM-10` | DIRECT | `SQ-EXP-04` | `F / L` |
| `H-R04-010` | `LCM-05` | DIRECT | `SQ-DEP-02`, `SQ-SRP-05` | `B / L` |
| `H-R05-001` | `LCM-04` | DIRECT | `SQ-SRP-02`, `SQ-3B-04` | `R / C / L` |
| `H-R05-002` | `LCM-05` | DIRECT | `SQ-SRP-03`, `SQ-SRP-05` | `B / C / L` |

## Coverage

```text
DIRECT: 33
ANSWER_KEY_GATED: 1
INDIRECT_ONLY: 0
```

Remaining direct gap:

`H-W01-006 — deep OOP protected-call boundary`

## Multiway direct artifacts

- `../synthesis/MULTIWAY_SOURCE_EVIDENCE_MAP_v0_1.md`;
- `../synthesis/MULTIWAY_ACTION_ORDER_AND_DELAYED_AGGRESSION_ARCHITECTURE_v0_1.md`;
- `../synthesis/MULTIWAY_DECISION_TREE_v0_1.json`;
- `../learning/anchors/MULTIWAY_ACTION_ORDER_CARDS_v0_1.md`;
- `../learning/drills/MULTIWAY_ACTION_ORDER_AND_DELAYED_AGGRESSION_DRILL_PACK_v0_1.md`;
- `../fieldwork/batumi/MULTIWAY_FIELD_CALIBRATION_CARD_v0_1.md`.

## New build order

1. deep OOP protected-call and exact depth/SPR boundary;
2. learner diagnostics and error-probability reranking;
3. target-live field calibration;
4. targeted preflop/multiway solver calibration;
5. final compression and admission.

## Verdict

`VALIDATION_WORKBENCH_V0_5_ACTIVE`

`DIRECT_DRILL_COVERAGE_33_OF_34`

`ONLY_DEEP_OOP_ANSWER_KEY_REMAINS`
