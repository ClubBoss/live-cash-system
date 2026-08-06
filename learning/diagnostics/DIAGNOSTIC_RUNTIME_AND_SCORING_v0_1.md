# Live Cash System — Diagnostic Runtime and Error-Probability Model v0.1

Status: `ACTIVE_INSTRUMENTATION / RESPONSES_PENDING`

## Objective

Convert free-text learner decisions into a conservative, auditable estimate of current structural error probability without confusing one quiz result with mastery.

## Runtime

```text
FREEZE T1 QUESTIONS
→ COLLECT ACTION + REASON + CONFIDENCE + TIME
→ EVALUATE WITHOUT MID-TRANCHE TEACHING
→ ASSIGN RESPONSE CLASS
→ MAP ONLY OBSERVED MISCONCEPTIONS
→ SHRINK TOWARD NEUTRAL PRIOR
→ RANK REPAIR VALUE
→ ISSUE CHANGED-NODE RETEST
→ BUILD MICRO-CYCLE
→ SCHEDULE DELAYED RETRIEVAL
```

## Separate measurements

Every response stores:

- action-family correctness;
- mechanism/reasoning quality;
- boundary control;
- confidence calibration;
- latency;
- changed-node transfer;
- mapped misconception evidence.

No composite score may erase a `C` response: correct action with wrong reasoning.

## Response-class error weights

| Class | Structural-error weight |
|---|---:|
| `A` | 0.00 |
| `B` | 0.55 |
| `C` | 0.70 |
| `D` | 1.00 |
| `E` | 0.65 |
| `U` | 0.00 only when the key permits baseline uncertainty |

High confidence on a structural error increases its evidence weight modestly. Low-confidence correct answers create a confidence/retention flag but do not become errors.

## Shrinkage model

For each candidate:

```text
prior = Beta(2, 2)
posterior mean =
(2 + weighted structural errors)
/
(4 + weighted exposures)
```

This prior deliberately prevents one answer from producing a fake near-0% or near-100% estimate.

Evidence grades:

- `UNMEASURED`: zero exposure;
- `TENTATIVE`: less than two effective exposures;
- `WORKING`: at least two exposures plus one changed-node or boundary item;
- `STABLE_ESTIMATE`: at least five diverse exposures including delayed retrieval.

The posterior is a prioritisation estimate, not a claim about true poker EV or population frequency.

## Candidate priority

After evidence exists:

```text
base live-EV tier
× posterior structural-error estimate
× transfer value
× evidence confidence
× learnability
```

Until T1 is complete, the existing neutral-prior order remains active.

## Leak confirmation

A user-reported hypothesis becomes `CONFIRMED_LEAK` only after:

- at least two structurally related failures;
- at least two distinct visible variants;
- one failure is not explainable solely by misunderstanding the question;
- the mechanism is relevant to the target game.

A single high-confidence `D` can trigger immediate repair but remains `TENTATIVE_HIGH_RISK`, not confirmed.

## Stop and branch rules

- T1 is completed before feedback.
- After T1, repair at most two families in one session.
- T2 is selectively released; it is not a mandatory linear exam.
- A prerequisite `S3` error can pause downstream testing.
- No module is globally reset.
- Correct untested modules remain `UNMEASURED`, not `RETAINED`.
- Exact-frequency uncertainty does not block directional diagnosis.

## Machine execution

- item manifest: `DIAGNOSTIC_ITEM_MANIFEST_v0_1.json`;
- response schema: `DIAGNOSTIC_RESPONSE_SCHEMA_v0_1.json`;
- scorer: `../../scripts/score_learner_diagnostic.py`;
- current state: `../../training/learner-state/CURRENT_LEARNER_STATE_v0_1.yaml`.

## Verdict

`DIAGNOSTIC_RUNTIME_ACTIVE`

`ERROR_PROBABILITY_UNMEASURED_UNTIL_T1`

`NO_GLOBAL_PROGRESS_RESET`
