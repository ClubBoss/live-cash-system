# Live Cash System — Adaptive Module Readiness Manifest v0.12

Status: `ACTIVE_READINESS_SSOT / DIAGNOSTIC_RUNTIME_READY`

Supersedes `ADAPTIVE_MODULE_READINESS_MANIFEST_v0_11.md`.

## Module overview

| Module | Mechanism | Direct drills | Diagnostic state | Current use |
|---|---|---|---|---|
| `LCM-01` Node/depth | READY directional | READY | T1 instrumented | deploy and measure |
| `LCM-02` Preflop | READY directional | READY | follow-up pool available | deploy core/flex |
| `LCM-03` Blind/OOP | READY directional | READY | T1 instrumented | measure source/deep OOP |
| `LCM-04` Filtering | READY | READY | T2 instrumented | deploy |
| `LCM-05` Bet/response | READY | READY | T1/T2 instrumented | measure changed sizes |
| `LCM-06` Aggression | READY | READY | T2 instrumented | deploy |
| `LCM-07` 3-bet/4-bet | READY directional | READY | T1 instrumented | measure OOP/ancestry |
| `LCM-08` Multiway | READY directional | READY | T1/T2 instrumented | measure role transfer |
| `LCM-09` River | READY mechanism | READY | T1 instrumented | measure ancestry |
| `LCM-10` Opponent evidence | READY methodology | READY | T2 and T1 overlap | measure confidence |
| `LCM-11` Transfer/repair | READY runtime | `34/34 DIRECT` | ACTIVE T1 | run diagnostics |

## New diagnostic layer

- original items: `20`;
- active T1: `10`;
- candidate mechanisms directly sampled: `28/34`;
- response dimensions: `9`;
- misconception IDs preserved: `30`;
- scorer and schema: active;
- learner performance records: `0`;
- measured candidate error estimates: `0`.

## Boundary

`READY TO MEASURE` is not `MEASURED`, `RETAINED` or `ADMITTED`.

No module state is downgraded or promoted before learner responses.

## Next action

`RUN T1 → SCORE → SELECT TWO REPAIR FAMILIES → RELEASE TARGETED T2`

## Verdict

`DIAGNOSTIC_RUNTIME_READY`

`DIRECT_COVERAGE_34_OF_34`

`PERFORMANCE_UNMEASURED`

`NO_FINAL_ADMISSION`
