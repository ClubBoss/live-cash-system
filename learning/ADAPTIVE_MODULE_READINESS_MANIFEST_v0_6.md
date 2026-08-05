# Live Cash System — Adaptive Module Readiness Manifest v0.6

Status: `ACTIVE_READINESS_SSOT / CARROT_GRADES_1_AND_2_COMPLETE`

This file supersedes v0.5.

## Readiness values

- `READY`
- `WORKING`
- `PARTIAL`
- `PENDING_CARROT`
- `PENDING_ANCHOR`
- `PENDING_FIELD`
- `NOT_REQUIRED`

## Module overview

| Module | Mechanism | Explanation | Boundaries | Diagnostic | Direct drills | Anchors | Overlays | Field | Current use |
|---|---|---|---|---|---|---|---|---|---|---|
| `LCM-01` Node/depth | READY | READY | PARTIAL | READY | READY | NOT_REQUIRED core | PARTIAL | WORKING | teach now; exact bands open |
| `LCM-02` Preflop architecture | WORKING | READY | PARTIAL | WORKING | PARTIAL | PENDING_ANCHOR | PARTIAL | WORKING | teach direction only |
| `LCM-03` Blind identity/realisation | READY mechanism | READY | PARTIAL | READY | PARTIAL | PENDING_ANCHOR | PARTIAL | WORKING | robust/frail and check-EV model active; deep boundary open |
| `LCM-04` Filtering/ownership | READY | READY | READY core | READY | READY | NOT_REQUIRED core | WORKING | WORKING | high-confidence active |
| `LCM-05` Bet/response shape | READY | READY | READY core / refinement only | READY | READY | PARTIAL | PENDING_FIELD | WORKING | active; merged/polar response model explicit |
| `LCM-06` Aggression/future jobs | READY | READY | READY core / context splits | READY | READY | PARTIAL | WORKING | WORKING | active; tier, urgency and negative-EV-bet repairs validated |
| `LCM-07` 3-bet ancestry | READY mechanism | READY | WORKING | READY | READY | PENDING_ANCHOR | PENDING_FIELD | WORKING | flop-plan model active; preflop anchors pending |
| `LCM-08` Multiway | PARTIAL | READY | PENDING_CARROT | READY | WORKING | PARTIAL | PENDING_FIELD | WORKING | conservative structural core only |
| `LCM-09` River audit | READY | READY | READY mechanism | READY | READY | NOT_REQUIRED core | PENDING_FIELD | WORKING | high-confidence active; ancestry and interference ordering explicit |
| `LCM-10` Opponent/environment overlays | READY methodology | READY | READY methodology | READY | READY | NOT_REQUIRED | PENDING_FIELD | READY schema | teach evidence discipline only |
| `LCM-11` Field transfer/repair | READY schema | READY | WORKING | READY | READY schema | NOT_REQUIRED | READY schema | PENDING_FIELD | Grade 1–2 assessment and repair layer complete |

## Grade 2 completion effects

### LCM-03 — Blind identity and realisation

The complete Grade 2 set validates:

- OOP/IP check-value asymmetry;
- theoretical, exploitative and erroneous slow-play;
- robust versus frail continues;
- future bluff tax;
- delayed fold equity as part of check EV;
- aggregate hand labels being insufficient when suits alter redraws and blockers.

Remaining boundary:

- exact deep-OOP continue and protected-call thresholds.

### LCM-04 — Filtering and ownership

The full Grade 2 answer key confirms:

```text
ACTION HISTORY
→ RANGE FILTERING
→ CURRENT RANGE SHAPE
→ WORLD FAVOURABILITY
→ FREQUENCY / SIZE / RESPONSE
```

This module is ready at mechanism, explanation and core-boundary levels.

### LCM-05 — Bet and response shape

Grade 2 lectures, exam and feedback jointly validate:

- range-wide merged versus selective polar bets;
- frequency and size as independent outputs;
- raise breadth from relative polarisation;
- response range geography;
- value beater, bluff catcher and frail response classes;
- three-way fold/call/raise threshold mixes;
- thin and hybrid raising against wide small bets.

Remaining work is exact board/depth thresholds and field response magnitude.

### LCM-06 — Aggression and future jobs

The complete Grade 2 set now supports:

- value and bluff tiers;
- size-toolkit construction;
- finishing versus landing equity;
- river-blunder gate;
- urgency and investment ceiling;
- negative-EV betting;
- better-hand-versus-better-bluff repair;
- frequency versus magnitude;
- theoretical/exploitative/erroneous slow-play;
- hybrid-bet audit.

The general mechanism is ready. Grade 3 may still add true context splits or counterexamples.

### LCM-07 — 3-bet-pot ancestry

Grade 2 confirms:

- preflop action, positions and SPR as flop inputs;
- range advantage for frequency;
- nut advantage / relative polarisation for size;
- low-dry and paired-board plan families;
- strategy-before-hand placement;
- rejection of monetary-stack framing.

Remaining work:

- exact preflop family anchors;
- depth and position boundaries;
- target-live field calibration.

### LCM-09 — River audit

Current ordered sequence:

```text
ORIGIN RANGE
→ FILTER DENSITY
→ WORLD FAVOURABILITY
→ VALUE / BLUFF / CHECK THRESHOLDS
→ BET SIZE
→ VALUE BEATER / BLUFF CATCHER / FRAIL HAND
→ ROBUSTNESS
→ VALUE / BET-FOLD INTERFERENCE
→ BLOCKERS
→ FIELD EVIDENCE
```

Grade 2 feedback adds explicit repairs for:

- blocking bluffs with bluff catchers;
- blocking bet-folds with bluff raises;
- bottom-of-range bluff-raise error;
- suit-specific ancestry effects;
- frequency-over-magnitude bias.

Remaining work is field magnitude and learner misuse testing, not mechanism discovery.

### LCM-11 — Adaptive assessment and repair

Current Carrot inventory:

```text
Grade 1 original families: 24
Grade 2 original families: 20
Total original families:   44
```

Grade 2 completion adds:

- Final Exam visual competency validation;
- exam-mode runtime;
- source answer-key continuity;
- ten original misconception-repair paths;
- no new assessment family count.

Active authorities:

- `learning/assessments/CARROT_G2_L01_L10_ORIGINAL_ASSESSMENT_BLUEPRINT_v0_1.md`;
- `learning/assessments/CARROT_G2_EXAM_ORIGINAL_RUNTIME_PROTOCOL_v0_1.md`;
- `learning/assessments/CARROT_G2_EXAM_FEEDBACK_ORIGINAL_REPAIR_MAP_v0_1.md`.

## Direct drill status

```text
34 candidate mechanisms
30 with direct original drills
4 source-gated direct drill gaps
44 original Carrot assessment families
```

Remaining direct-drill gaps:

- `H-W01-002` — squeeze purification;
- `H-W01-006` — deep OOP protected-call boundary;
- `H-W01-008` — polar preflop target folds;
- `H-R04-007` — multiway delayed aggression.

Grade 2 completion improves explanation and repair quality but does not supply the missing source-specific answer keys for these four drills.

## Remaining Carrot priority

1. `LCM-08` — multiway structure and delayed aggression;
2. `LCM-02` — preflop and squeeze architecture;
3. `LCM-03` — exact deep-OOP boundaries;
4. `LCM-07` — preflop 3-bet families and depth limits;
5. `LCM-01` — exact depth/straddle overlays;
6. all other modules only for genuine counterexample, context split or assessment refinement.

## Current build boundary

Ready now:

- core EV-tree and filtering curriculum;
- frequency/size/raise operating model;
- protected IP/OOP branch curriculum;
- 3-bet-pot flop-plan teaching;
- river bluff-catching and blocker/interference audit;
- Grade 1–2 exam-mode and repair system;
- 30 direct original drills;
- 44 Carrot assessment families;
- adaptive runtime and progress preservation.

Still deferred:

- final 14–18-rule compression;
- exact preflop anchors;
- exact depth and straddle overlays;
- multiway closure;
- target-live population confidence;
- final mastery thresholds;
- admitted Playbook.

## Readiness verdict

`CARROT_GRADES_1_AND_2_COMPLETE_READINESS_PASS`

`GRADE_2_ANSWER_KEY_AND_REPAIR_LAYER_COMPLETE`

`GENERAL_POSTFLOP_CORE_MATURE_AT_MECHANISM_LEVEL`

`GRADE_3_VALUE_IS_PRIMARILY_PREFLOP_DEPTH_MULTIWAY_AND_TRUE_BOUNDARIES`

`DIRECT_DRILL_COVERAGE_REMAINS_30_OF_34`
