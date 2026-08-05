# Live Cash System - Adaptive Module Readiness Manifest v0.7

Status: `ACTIVE_READINESS_SSOT / CARROT_GRADES_1_TO_3_COMPLETE`

Supersedes `ADAPTIVE_MODULE_READINESS_MANIFEST_v0_6.md`.

## Readiness values

- `READY`
- `WORKING`
- `PARTIAL`
- `PENDING_ANCHOR`
- `PENDING_FIELD`
- `NOT_REQUIRED`

## Module overview

| Module | Mechanism | Explanation | Boundaries | Diagnostic | Direct drills | Anchors | Overlays | Field | Current use |
|---|---|---|---|---|---|---|---|---|---|---|
| `LCM-01` Node/depth | READY | READY | PARTIAL | READY | READY | NOT_REQUIRED core | PARTIAL | WORKING | teach now; exact bands open |
| `LCM-02` Preflop architecture | WORKING | READY | PARTIAL | WORKING | PARTIAL | PENDING_ANCHOR | PARTIAL | WORKING | teach direction only |
| `LCM-03` Blind identity/realisation | READY mechanism | READY | PARTIAL | READY | PARTIAL | PENDING_ANCHOR | PARTIAL | WORKING | robust/frail and protected-check model active; deep boundary open |
| `LCM-04` Filtering/ownership | READY | READY | READY core | READY | READY | NOT_REQUIRED core | WORKING | WORKING | high-confidence active |
| `LCM-05` Bet/response shape | READY | READY | READY core / refinement only | READY | READY | PARTIAL | PENDING_FIELD | WORKING | merged/polar response and small-bet defence active |
| `LCM-06` Aggression/future jobs | READY | READY | READY core / context splits | READY | READY | PARTIAL | WORKING | WORKING | size gate, hybrid bets, protected checks and jams active |
| `LCM-07` 3-bet/4-bet ancestry | READY mechanism | READY | WORKING | READY | READY | PENDING_ANCHOR | PENDING_FIELD | WORKING | direct postflop support complete; anchors and exact boundaries pending |
| `LCM-08` Multiway | PARTIAL | READY | PARTIAL | READY | WORKING | PARTIAL | PENDING_FIELD | WORKING | conservative structural core only |
| `LCM-09` River audit | READY | READY | READY mechanism | READY | READY | NOT_REQUIRED core | PENDING_FIELD | WORKING | high-confidence active |
| `LCM-10` Opponent/environment overlays | READY methodology | READY | READY methodology | READY | READY | NOT_REQUIRED | PENDING_FIELD | READY schema | teach evidence discipline only |
| `LCM-11` Field transfer/repair | READY schema | READY | WORKING | READY | READY schema | NOT_REQUIRED | READY schema | PENDING_FIELD | 74 Carrot assessments; field calibration pending |

## Grade 3 completion effects

### LCM-03 - Blind identity and realisation

Grade 3 strengthens:

- protected checks;
- full-tree bet-versus-check trade-offs;
- stable versus vulnerable slow-play;
- low-SPR check-call and check-jam resistance.

Remaining boundary:

- exact deep-OOP continue and protected-call thresholds.

### LCM-04 - Filtering and ownership

Grade 3 confirms:

```text
ACTION HISTORY
-> RANGE FILTERING
-> CURRENT RANGE SHAPE
-> WORLD FAVOURABILITY
-> RANGE ADVANTAGE + RELATIVE POLARISATION
-> FREQUENCY / SIZE / RESPONSE
```

### LCM-05 - Bet and response shape

Grade 3 adds:

- winning, indifferent and losing calls;
- identical-class hand comparison;
- extremely wide in-position defence against small bets;
- raise suppression when no credible top-end value region exists;
- reopen cost at low SPR.

### LCM-06 - Aggression and future jobs

Grade 3 supports:

- pure-versus-mix gate;
- value-led size toolkits;
- extreme-size eligibility;
- blocker-function vectors;
- hybrid-bet EV decomposition;
- jam-exposure audit;
- protected strong checks;
- low-SPR jam construction.

### LCM-07 - 3-bet and 4-bet ancestry

Grade 3 directly validates:

- protected 3-bet-pot checking;
- OOP 3-bet-pot response geography;
- tier-one raise eligibility;
- low-SPR turn jams;
- four-bet-pot flop compression;
- turn size by opponent range shape;
- caller defence and reopen suppression.

Remaining work:

- exact preflop family anchors;
- exact depth and position boundaries;
- target-live field calibration.

### LCM-09 - River audit

Grade 3 adds:

- bet EV minus check EV;
- winning, optional and losing bluff classes;
- extreme size and investment-ceiling reasoning;
- call quality and blocker ordering.

### LCM-11 - Adaptive assessment and repair

Current Carrot inventory:

```text
Grade 1 original families: 24
Grade 2 original families: 20
Grade 3 original families: 30
Total original families:   74
```

Grade 3 also supplies ten original feedback repair paths.

## Direct drill status

```text
34 candidate mechanisms
30 with direct original drills
4 source-gated direct drill gaps
74 original Carrot assessment families
```

Remaining direct-drill gaps:

- `H-W01-002` - squeeze purification;
- `H-W01-006` - deep OOP protected-call boundary;
- `H-W01-008` - polar preflop target folds;
- `H-R04-007` - multiway delayed aggression.

Carrot completion improves explanation and assessment quality but does not supply exact answer keys for these four drills.

## Priority policy

Module order is selected by system-wide Max-EV:

```text
spot frequency
x average error cost
x current error probability
x transfer value
x learnability per unit time
x evidence confidence
```

Known learner discomfort is not an automatic priority.

## Final-rule policy

Final rule count is emergent, not fixed.

`MINIMUM COMPLEXITY SUBJECT TO NO MATERIAL EV LOSS`

The 16 provisional synthesis slots are non-binding.

## Current build boundary

Ready now:

- core EV-tree and filtering curriculum;
- frequency/size/raise operating model;
- protected IP/OOP branch curriculum;
- 3-bet and low-SPR 4-bet postflop teaching;
- river bluff-catching and blocker/interference audit;
- Grade 1-3 exam-mode and repair system;
- 30 direct original drills;
- 74 Carrot assessment families;
- adaptive runtime and progress preservation.

Still deferred:

- cross-corpus completeness and defect audit;
- material visual verification;
- exact preflop anchors;
- exact depth and straddle overlays;
- multiway closure;
- target-live population confidence;
- final mastery thresholds;
- admitted Playbook.

## Readiness verdict

`CARROT_GRADES_1_TO_3_COMPLETE_READINESS_PASS`

`GRADE_3_LECTURE_AND_ANSWER_KEY_CONTINUITY_COMPLETE`

`GENERAL_POSTFLOP_CORE_MATURE_AT_MECHANISM_LEVEL`

`DIRECT_DRILL_COVERAGE_REMAINS_30_OF_34`

`FINAL_RULE_COUNT_EMERGENT_NOT_FIXED`

`CROSS_CORPUS_AUDIT_NEXT`
