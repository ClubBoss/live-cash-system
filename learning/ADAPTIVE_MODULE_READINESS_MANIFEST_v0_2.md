# Live Cash System — Adaptive Module Readiness Manifest v0.2

Status: `ACTIVE_READINESS_SSOT / CASH_INJECTION_COMPLETE / CARROT_PENDING`

This file supersedes v0.1 as the current dimensional-readiness authority.

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
| `LCM-01` Node/depth | READY | READY | PARTIAL | READY | READY | NOT_REQUIRED core | PARTIAL | WORKING | teach now |
| `LCM-02` Preflop architecture | WORKING | READY | PARTIAL | WORKING | PARTIAL | PENDING_ANCHOR | PARTIAL | WORKING | teach direction only |
| `LCM-03` Blind identity/realisation | WORKING | READY | PARTIAL | READY | PARTIAL | PENDING_ANCHOR | PARTIAL | WORKING | teach structure now |
| `LCM-04` Filtering/ownership | READY | READY | READY core | READY | READY | NOT_REQUIRED core | WORKING | WORKING | high-confidence active |
| `LCM-05` Bet/response shape | READY mechanism | READY | WORKING | READY | READY | PARTIAL | PENDING_FIELD | WORKING | active; exploit branches guarded |
| `LCM-06` Aggression/future jobs | READY mechanism | READY | WORKING | READY | READY | PARTIAL | WORKING | WORKING | active at mechanism level |
| `LCM-07` 3-bet ancestry | READY mechanism | READY | WORKING | READY | READY | PENDING_ANCHOR | PENDING_FIELD | WORKING | active directionally |
| `LCM-08` Multiway | PARTIAL | READY | PENDING_CARROT | READY | WORKING | PARTIAL | PENDING_FIELD | WORKING | conservative structural core only |
| `LCM-09` River audit | READY | READY | READY mechanism | READY | READY | NOT_REQUIRED core | PENDING_FIELD | WORKING | high-confidence active |
| `LCM-10` Opponent/environment overlays | READY methodology | READY | READY methodology | READY | READY | NOT_REQUIRED | PENDING_FIELD | READY schema | teach evidence discipline only |
| `LCM-11` Field transfer/repair | READY schema | READY | WORKING | READY | READY schema | NOT_REQUIRED | READY schema | PENDING_FIELD | activate with learner/session data |

## Cash Injection effects

### LCM-04 — Filtering and ownership

Now strengthened by:

- origin-range width;
- filtered versus unfiltered branches;
- repeated voluntary filters;
- timed contrastive drill `CI-C01`.

Remaining work: examples and Carrot simplification only.

### LCM-05 — Bet shape and response shape

Now includes:

- small range-bet raises;
- protected calls;
- polar and merged raises;
- float-bet check-raises;
- IP click-back raises in 3-bet pots;
- small-size elasticity;
- hand-specific winners and losers inside one exploit.

Remaining work:

- depth/board boundaries;
- exact response anchors kept outside core;
- target-live field calibration.

### LCM-06 — Aggression and future jobs

Now includes:

- induced turn probes;
- turn raise response classes;
- small river probes;
- thin value versus low-cost bluff construction;
- immediate-EV versus future-plan boundary.

Remaining work:

- Carrot compression;
- overbet boundaries;
- multiway delayed-aggression scope.

### LCM-07 — 3-bet ancestry

Now includes:

- triple-barrel overfold hypothesis;
- small IP click-back raise branch;
- c-bet/fold versus c-bet/three-bet branch split;
- preflop origin and later bluff supply.

Remaining work:

- exact anchors;
- Carrot simplification;
- live field magnitude.

### LCM-09 — River audit

Now has a stronger internal sequence:

```text
ORIGIN RANGE
→ FILTER DENSITY
→ VALUE / AIR SUPPLY
→ SIZE REQUIREMENT
→ BLOCKERS
→ EVIDENCE
```

This nests inside the existing table cue:

```text
VALUE → SIZE EXCLUSIONS → BLUFF ANCESTRY → BLOCKERS → EVIDENCE
```

Remaining work is field calibration, not mechanism discovery.

### LCM-10 — Opponent overlays

Ten Cash Injection pool hypotheses now have:

- trigger;
- evidence grades;
- falsifiers;
- context splits;
- baseline-return rule;
- field mission.

Specific exploit magnitudes remain `PENDING_FIELD`.

## Direct drill status

After the complete Cash Injection pack:

- 30 candidates have direct original drills;
- 4 remain source-gated.

Remaining module drill gaps:

- LCM-02: squeeze purification and polar preflop target folds;
- LCM-03: deep OOP protected-call boundary;
- LCM-08: multiway delayed aggression.

## Carrot priority by module

1. `LCM-08` multiway scope;
2. `LCM-02` preflop/squeeze architecture;
3. `LCM-03` deep OOP and blind boundaries;
4. `LCM-06` sizing and future-job compression;
5. `LCM-07` 3-bet-pot simplification;
6. all other modules only for boundaries, counterexamples or better pedagogy.

## Readiness verdict

`CASH_INJECTION_MODULE_PASS_COMPLETE`

`LCM_04_LCM_05_LCM_09_LCM_10_MATERIALLY_STRENGTHENED`

`CARROT_IS_NOW_PRIMARILY_A_BOUNDARY_MULTIWAY_PREFLOP_AND_DEPTH_VALIDATOR`
