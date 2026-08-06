# Live Cash System - Multiway Action-Order Wave Terminal Report v1

Date: 2026-08-06  
Status: `MULTIWAY_DIRECTIONAL_WAVE_ACCEPTED / DEEP_OOP_NEXT`

## Milestone

Completed the full multiway action-order and delayed-aggression wave:

```text
source audit
-> role map
-> shared defence
-> nut ownership
-> bluff support
-> field-clear transition
-> delayed aggression
-> fast-play/protect overlay
-> original direct drills
-> field schema
-> SSOT rerouting
```

## Directional architecture

Five learner cards are active:

1. role before hand strength;
2. OPAL ownership;
3. shared defence and response shape;
4. multiway bluff support;
5. field clear and delayed aggression.

Machine-readable authority:

`synthesis/MULTIWAY_DECISION_TREE_v0_1.json`

Table-facing authority:

`learning/anchors/MULTIWAY_ACTION_ORDER_CARDS_v0_1.md`

## Core decisions closed directionally

### Action order

- middle actor has highest collision risk;
- closing actor receives more information and response freedom;
- reopener can act after bet-call filtering;
- field-clear survivor carries a multiway-filtered range, not a generic heads-up range.

### Shared defence

No individual defender owes a fabricated heads-up MDF. Defence burden depends on the live ranges behind and whether Hero closes action.

### Nut ownership

OPAL audit:

```text
Offsuit nuts
Premium retention/removal
Action order
Low-card/suited coverage
```

### Bluff support

Multiway bluffs prioritise equity, nutted improvement, removal, unblocked folds and future jobs. Random heads-up air is rejected unless a precise small-price exploit is evidenced.

### Delayed aggression

A turn lead or raise is valid when a specific flop action was suppressed by a player behind, that player leaves, value survives, bluffs target the filtered range and the turn does not repair Villain.

### Fast-play/protect

Move value forward when expected aggression will not arrive; retain strong checks when future aggression is credible. Magnitude remains field-gated.

## Direct drill effect

Created:

`learning/drills/MULTIWAY_ACTION_ORDER_AND_DELAYED_AGGRESSION_DRILL_PACK_v0_1.md`

Effect:

```text
H-R04-007 direct answer key: active
direct candidate drills: 33/34
remaining direct gap: H-W01-006
```

`H-R04-007` was already `DRILL_READY`; no status promotion was required.

## Candidate state

```text
heuristic candidates: 34
DRILL_READY: 28
VALIDATION_PENDING: 6
FIELD_TEST_PENDING: 0
ADMITTED: 0
```

No candidate status changed. The improvement is evidence and direct-drill coverage, not status inflation.

## Module readiness

`LCM-08` becomes `READY directional`.

Still pending:

- exact per-seat frequencies;
- exact lead/raise size trees;
- deep unequal-stack/side-pot boundaries;
- target-field aggression magnitude;
- learner validation.

## Field calibration

Created:

`fieldwork/batumi/MULTIWAY_FIELD_CALIBRATION_CARD_v0_1.md`

It records opportunity denominators for:

- tiny-bet fold/call/raise response;
- closing-player aggression;
- field-clear turn leads;
- call-call barrels;
- slow-play value arrival.

No generic Batumi population claim is admitted.

## Files created

- `synthesis/MULTIWAY_SOURCE_EVIDENCE_MAP_v0_1.md`;
- `synthesis/MULTIWAY_ACTION_ORDER_AND_DELAYED_AGGRESSION_ARCHITECTURE_v0_1.md`;
- `synthesis/MULTIWAY_DECISION_TREE_v0_1.json`;
- `learning/anchors/MULTIWAY_ACTION_ORDER_CARDS_v0_1.md`;
- `learning/drills/MULTIWAY_ACTION_ORDER_AND_DELAYED_AGGRESSION_DRILL_PACK_v0_1.md`;
- `fieldwork/batumi/MULTIWAY_FIELD_CALIBRATION_CARD_v0_1.md`;
- `analysis/system-audits/MULTIWAY_ACTION_ORDER_WAVE_QA_v1.md`;
- `synthesis/HEURISTIC_CANDIDATE_REGISTRY_v0_6.md`;
- `synthesis/REMAINING_SOURCE_QUESTION_MATRIX_v1_5.md`;
- `synthesis/CANDIDATE_TO_MODULE_VALIDATION_WORKBENCH_v0_5.md`;
- `synthesis/MAX_EV_CANDIDATE_PRIORITY_RANKING_v0_3.md`;
- `synthesis/PROVISIONAL_FINAL_RULE_SLOT_ARCHITECTURE_v0_5.md`;
- `learning/ADAPTIVE_MODULE_READINESS_MANIFEST_v0_10.md`;
- this terminal report.

## Exact limitations

The wave does not claim:

- exact multiway MDF;
- exact solver frequencies;
- universal size or lead menu;
- exact three-way/four-way scaling;
- validated Batumi under-aggression;
- final admitted rules.

## Next full milestone

`DEEP OOP PROTECTED-CALL AND EXACT DEPTH/SPR BOUNDARY`

Full-wave objectives:

1. define robust versus frail hand classes;
2. split static and dynamic boards;
3. map 100/200/400bb and SPR transitions;
4. distinguish discomfort raise from range-required raise;
5. define future-barrel source and check-branch protection;
6. activate direct `H-W01-006` answer key;
7. reach direct candidate drill coverage `34/34` if evidence supports it;
8. preserve exact-frequency and field boundaries.

## Terminal verdict

`MULTIWAY_DIRECTIONAL_WAVE_ACCEPTED`

`FIVE_MULTIWAY_CARDS_ACTIVE`

`H_R04_007_DIRECT_GAP_CLOSED`

`DIRECT_DRILL_COVERAGE_33_OF_34`

`DEEP_OOP_NEXT`

`NO_FINAL_ADMISSION`
