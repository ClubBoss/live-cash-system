# Deep OOP Protected-Call Drill Pack v0.1

Status: `ACTIVE_ORIGINAL_DIRECT_DRILLS / H-W01-006`

All nodes are original. Answers are directional unless arithmetic is requested. A correct action with “I did not want a turn” fails the reasoning gate.

## DOP-01 — Nominal 200bb, extended tree

Pot `12bb`, stack behind `188bb`, Villain bets `4bb`.

### Key

```text
post-call pot = 20
post-call stack = 184
SPR = 9.2
band = E
```

Direction: preserve substantial call weight with a robust hand when Villain retains air. Raise requires value/denial beyond discomfort.

Changed node: Villain checks back most turns after being called. Move more value forward; the call loses induction EV.

---

## DOP-02 — Same stack, larger polar bet

Pot `12bb`, stack `188bb`, Villain bets `10bb`.

```text
post-call pot = 32
post-call stack = 178
SPR = 5.56
band = E
```

Despite extended SPR, the selective bet compresses calls and sharply narrows thin protection raises. Robust calls can remain.

---

## DOP-03 — 100bb is not automatically compressed

Pot `7bb`, stack `93bb`, bet `2.5bb`.

```text
post-call pot = 12
post-call stack = 90.5
SPR = 7.54
band = E
```

The node retains multiple future decisions. Do not import low-SPR stack-off logic merely because stacks began at 100bb.

---

## DOP-04 — Large preflop pot collapses nominal depth

Pot `42bb`, stack `158bb`, bet `14bb`.

```text
post-call pot = 70
post-call stack = 144
SPR = 2.06
band = M
```

Immediacy rises. Flimsy backdoors lose relative value; live pair draws, immediate equity and top-end support matter more.

Changed node: same stack, pot `18bb`, bet `6bb`.

```text
post-call SPR = 152 / 30 = 5.07
```

Future-tree quality and robust calls gain.

---

## DOP-05 — Compressed turn

Pot `70bb`, stack `130bb`, bet `35bb`.

```text
post-call pot = 140
post-call stack = 95
SPR = 0.68
band = C
```

One meaningful investment remains. A jam range needs top-end value plus high-EV bluffs/hybrids; denial does not authorise jamming the middle.

---

## DOP-06 — Robust versus volatile

Same small merged bet:

- Hand A beats bluffs, has a clean redraw and survives many turns.
- Hand B is usually ahead now but many overcards and draws damage it.

Key:

- A is the stronger protected-call candidate.
- B is the stronger thin-value/denial raise candidate if worse continues and OOP owns top-end.

The stronger current hand need not be the more frequent raise.

---

## DOP-07 — Frail hand trap

Hero has a nominal pair that loses to some Villain bluffs and improves mainly to dominated routes.

Key: classify `F`. Deep stacks do not rescue the call. Fold unless a coherent bluff-raise exists with blockers, fold targets and a future plan.

---

## DOP-08 — Static board, credible aggressor

Board changes little on turns. Villain barrels air frequently after calls.

Key: robust calls gain. Raising can destroy induction and isolate against a stronger continue range.

Changed node: Villain rarely barrels without value. Move selected value forward.

---

## DOP-09 — Dynamic board, small range bet

OOP owns sets/two pair. Hero has vulnerable top pair that unblocks overcard folds. Villain bets small with a wide range.

Key: a merged protection raise can be valid because top-end support exists, worse can continue, folds surrender meaningful equity and future turns are difficult. No exact frequency is inferred.

---

## DOP-10 — Dynamic board, large polar bet

Same board and hand as DOP-09, but Villain uses a large selective size.

Key: raise branch contracts. The continuing range is stronger, denial target is smaller and thin value is less credible.

---

## DOP-11 — Call-branch cap test

Hero raises every overpair and strong top pair against a small c-bet.

Failure: the call branch becomes draw/weak-pair heavy and can be attacked later.

Repair: retain robust strong hands in calls; raise vulnerable value and supported bluffs selectively.

---

## DOP-12 — Discomfort raise

Reason:

> “I raised because playing the turn OOP would be hard.”

Reject. Ease of play is not a raise job.

Required repair:

1. name value against continues;
2. name denial target;
3. show top-end support;
4. show call/re-raise plan;
5. compare with protected-call EV.

---

## DOP-13 — Winning call, losing raise

Hero beats Villain's bluffs, survives many turns and gains little denial. Villain's raise-calling range dominates Hero.

Key: call can win while raise loses. Separate thresholds.

---

## DOP-14 — Losing call, viable bluff raise

Hero is frail as a call but blocks strong continues, unblocks folds and has a clean improvement route. OOP owns top-end.

Key: a bluff raise can be viable even when call is losing. It remains candidate-level, not automatic.

---

## DOP-15 — No top-end, no raise tree

OOP defends widely but lacks credible tier-one value.

Key: a broad raise strategy can disappear. Defend through calls/folds; do not manufacture raises to satisfy an aggression quota.

---

## DOP-16 — Protected simple branch

A split 3-bet-pot strategy already uses selective bets and medium-strength checks. Adding a large check-raise tree produces little extra value.

Key: a simpler protected call/fold branch can be preferred. “Protected” does not mean every node needs many raises.

---

## DOP-17 — Straddle denominator

Stacks are `400bb` relative to the original big blind but `100 straddles`; the preflop pot is large.

Key: do not call the node “400bb deep” operationally. Recalculate in straddle units and post-action SPR.

---

## DOP-18 — Backdoor immediacy switch

Same unpaired hand:

- Node A: post-call SPR `6.5`;
- Node B: post-call SPR `1.2`.

Key: the weak backdoor route has more future value in A. In B, immediate live pair/draw equity matters more.

---

## DOP-19 — Future-bluff inventory

Hero folds every uncomfortable backdoor on the flop.

Key: later bluff inventory becomes too pair-heavy. Preserve source-supported hard continues; do not call all backdoors.

---

## DOP-20 — Opponent switch without randomisation

Baseline gives Hero a supported semi-bluff raise. Villain overfolds.

Key: increase the weight of the existing supported candidate. Do not add unrelated air.

---

## DOP-21 — 100 / 200 / 400 latency test

For three nodes, state within 12 seconds:

```text
post-call SPR
band
R/V/F
bet shape
action direction
```

Pass:

- no nominal-depth shortcut;
- no discomfort raise;
- no exact-frequency claim;
- reason changes when only one node variable changes.

## Direct answer key

`H-W01-006` is answered by:

```text
post-action geometry
+ hand resilience
+ board urgency
+ bet shape
+ top-end support
+ future aggression
```

Default:

> Protect resilient OOP calls before raising. Raise only for a real range job.

## Coverage verdict

`H_W01_006_DIRECT_DRILL_ACTIVE`

`DIRECT_CANDIDATE_COVERAGE_34_OF_34`
