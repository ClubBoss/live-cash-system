# Drill Queue

Status: `ACTIVE_DIAGNOSTIC_QUEUE / T1_NEXT`

## Active

| Drill/Tranche | Purpose | Items | Due | Result | Status |
|---|---|---|---|---|---|
| `DIAG-T1` | cold high-EV baseline | `LD-001`–`LD-010` | next interaction | pending | `AWAITING_LEARNER_RESPONSES` |
| `DIAG-T2` | targeted disambiguation | selected from `LD-011`–`LD-020` | after T1 score | pending | `LOCKED` |
| `REPAIR-01` | highest measured structural family | generated after T1 | after T1 | pending | `NOT_GENERATED` |
| `DELAYED-01` | delayed changed-node retrieval | generated after repair | later session | pending | `NOT_GENERATED` |

## Answer contract

Every active item requires:

```text
action/direction
+ one-sentence reason
+ confidence 0–100
+ rough time in seconds
```

## Load guard

- complete the active tranche before feedback;
- at most two repair families after T1;
- 5–10 high-quality decisions per block;
- no exact mixed-frequency memorisation;
- failure creates a changed-node repair, not a global reset.

## Authority

- battery: `../learning/diagnostics/INITIAL_PERSONALISED_DIAGNOSTIC_BATTERY_v0_1.md`;
- scoring: `../learning/diagnostics/DIAGNOSTIC_RUNTIME_AND_SCORING_v0_1.md`;
- learner state: `learner-state/CURRENT_LEARNER_STATE_v0_1.yaml`.
