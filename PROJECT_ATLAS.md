# Live Cash System — Project Atlas

Status: `ACTIVE / DIAGNOSTIC_EXECUTION_PHASE`

## Fast navigation

| Need | Open |
|---|---|
| bootstrap | `START_HERE.md` |
| machine state | `state/CURRENT_PROJECT_STATE.yaml` |
| latest report | `reports/LEARNER_DIAGNOSTIC_RUNTIME_WAVE_TERMINAL_REPORT_v1.md` |
| active questions | `learning/diagnostics/INITIAL_PERSONALISED_DIAGNOSTIC_BATTERY_v0_1.md` |
| evaluator key | `learning/diagnostics/DIAGNOSTIC_ANSWER_KEY_AND_ROUTING_v0_1.md` |
| runtime/scoring | `learning/diagnostics/DIAGNOSTIC_RUNTIME_AND_SCORING_v0_1.md` |
| machine manifest | `learning/diagnostics/DIAGNOSTIC_ITEM_MANIFEST_v0_1.json` |
| learner profile | `profiles/CURRENT_LEARNER_BASELINE_PROFILE_v0_1.yaml` |
| learner state | `training/learner-state/CURRENT_LEARNER_STATE_v0_1.yaml` |
| active queue | `training/drill-queue.md` |
| micro-cycle | `training/PERSONALISED_MICRO_CYCLE_v0_1.md` |
| Max-EV priority | `synthesis/MAX_EV_CANDIDATE_PRIORITY_RANKING_v0_5.md` |
| readiness | `learning/ADAPTIVE_MODULE_READINESS_MANIFEST_v0_12.md` |

## Inventory

```text
34 candidates
29 DRILL_READY
5 VALIDATION_PENDING
34/34 direct drills
30 misconception IDs
9 learner dimensions
20 diagnostic items
10 active T1 items
0 measured responses
0 admitted rules
```

## Directional memory systems

- preflop A1–A5;
- multiway M1–M5;
- deep OOP D1–D5.

## Measurement architecture

```text
prior hypotheses
→ cold free-text decisions
→ response class
→ misconception evidence
→ shrinkage estimate
→ changed-node retest
→ repair family
→ delayed retrieval
→ field transfer
```

## Current path

```text
run T1
→ score
→ tentative personal rerank
→ first repair micro-cycle
→ targeted T2
→ delayed retest
→ Batumi field calibration
```

## Truth boundary

Diagnostic readiness is not learner mastery. Untested means `UNMEASURED`, not weak or retained.

## Verdict

`DIAGNOSTIC_RUNTIME_READY`

`T1_EXECUTION_NEXT`

`FINAL_RULE_COUNT_EMERGENT`
