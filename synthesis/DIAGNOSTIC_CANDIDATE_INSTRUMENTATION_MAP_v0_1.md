# Live Cash System — Diagnostic Candidate Instrumentation Map v0.1

Status: `ACTIVE_DIAGNOSTIC_ROUTING / PERFORMANCE_UNMEASURED`

## Purpose

Map the first 20 original diagnostic items to modules, candidates and misconception IDs. This does not change candidate admission status.

| Item | Module | Candidates | Misconceptions | Tranche |
|---|---|---|---|---|
| `LD-001` | `LCM-01` | `H-W01-003`, `H-W01-001` | `MC-002` | `T1` |
| `LD-002` | `LCM-01` | `H-W01-001` | `MC-001` | `T1` |
| `LD-003` | `LCM-03` | `H-W01-004`, `H-W01-007` | `MC-005` | `T1` |
| `LD-004` | `LCM-07` | `H-W03-002` | `MC-019` | `T1` |
| `LD-005` | `LCM-07` | `H-W03-003`, `H-W03-004` | `MC-020`, `MC-021` | `T1` |
| `LD-006` | `LCM-05` | `H-W02-004`, `H-W02-005`, `H-R05-002` | `MC-012`, `MC-013` | `T1` |
| `LD-007` | `LCM-05` | `H-W02-004`, `H-W02-005`, `H-W01-006` | `MC-012`, `MC-008`, `MC-013` | `T1` |
| `LD-008` | `LCM-03` | `H-W01-006`, `H-R04-010` | `MC-008` | `T1` |
| `LD-009` | `LCM-08` | `H-W03-007`, `H-W03-010` | `MC-024`, `MC-027` | `T1` |
| `LD-010` | `LCM-09` | `H-W03-011`, `H-W02-009`, `H-R04-008` | `MC-022`, `MC-028`, `MC-015` | `T1` |
| `LD-011` | `LCM-05` | `H-W02-004`, `H-W03-006` | `MC-012`, `MC-023` | `T2` |
| `LD-012` | `LCM-04` | `H-W01-005`, `H-R05-001` | `MC-007` | `T2` |
| `LD-013` | `LCM-06` | `H-W02-001` | `MC-009` | `T2` |
| `LD-014` | `LCM-06` | `H-W02-002` | `MC-010` | `T2` |
| `LD-015` | `LCM-06` | `H-W02-003`, `H-W02-006` | `MC-011`, `MC-014` | `T2` |
| `LD-016` | `LCM-08` | `H-W03-008` | `MC-025` | `T2` |
| `LD-017` | `LCM-08` | `H-R04-007`, `H-W02-006` | `MC-014` | `T2` |
| `LD-018` | `LCM-08` | `H-W03-009` | `MC-026` | `T2` |
| `LD-019` | `LCM-10` | `H-W02-007`, `H-R04-008` | `MC-015`, `MC-030` | `T2` |
| `LD-020` | `LCM-11` | `H-W02-009` | `MC-017` | `T2` |

## Coverage

- original diagnostic items: `20`;
- candidate mechanisms directly sampled: `28/34`;
- modules sampled: `10/11`;
- all 30 misconception IDs remain available for evaluator mapping;
- unsampled candidates remain `UNMEASURED`, not low priority or mastered.

## Boundary

The first battery intentionally does not sample every exact preflop edge, river branch or exploit magnitude. Those are selected after T1 when the measured error pattern is known.

## Verdict

`DIAGNOSTIC_INSTRUMENTATION_MAP_ACTIVE`

`NO_CANDIDATE_STATUS_CHANGE`
