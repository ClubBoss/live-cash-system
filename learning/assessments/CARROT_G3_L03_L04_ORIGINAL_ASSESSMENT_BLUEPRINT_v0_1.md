# Carrot Grade 3 Lectures 03–04 — Original Assessment Blueprint v0.1

Status: `ORIGINAL / SOURCE-INDEPENDENT / ANSWER_KEYS_DIRECTIONALLY_STABLE`

## Purpose

Convert the blocker-function and raise-class mechanisms from Grade 3 Lectures 03–04 into original adaptive assessments without copying source boards, hands, solver outputs, toy-game implementation or exam wording.

## Assessment family 1 — Blocker-function vector

Give one bluff candidate and one bluff-catcher candidate in original river nodes.

Require the learner to classify separately whether each combo:

- blocks calls;
- unblocks folds;
- blocks folds;
- unblocks calls;
- blocks value;
- unblocks bluffs;
- blocks bluffs;
- unblocks value.

The learner must identify which functions are relevant to the chosen action rather than merely naming a blocker.

## Assessment family 2 — Favourability-selectivity interaction

Present the same blocker profile in two range states:

- a favourable world;
- an unfavourable world.

Ask whether the combo is:

- pure investment;
- optional investment;
- rejected.

Correct reasoning states that unfavourable worlds require more positive blocker functions.

## Assessment family 3 — Unblock-fold ranking

Create three air hands with similar raw equity and similar blocking of calls but different interference with the opponent's missed-draw and ace-high folding regions.

Ask the learner to rank their bluff EV directionally.

Target misconception:

```text
blocking the strongest possible hand
is always more important than preserving common folds
```

## Assessment family 4 — Five-part raise construction

Give an original small merged flop bet and a set of abstract hand classes.

Require construction of:

1. thick value;
2. thin value;
3. high-EV bluffs;
4. hybrids;
5. low-EV bluffs.

The answer must explain the job of each class and the opponent region it pressures.

## Assessment family 5 — Candidate versus mandatory raise

For each of the five classes, provide two hands with similar labels but different future-tree properties.

Ask which are:

- pure raises;
- mixed call/raises;
- pure calls;
- rejected raise candidates.

The learner must not treat membership in a class as a pure-action instruction.

## Assessment family 6 — Turn class migration

After Hero's original flop raise is called, reveal three distinct turn cards.

For each card, require the learner to reclassify selected hands from their flop role into their new turn role.

Possible migrations include:

- bluff → value;
- thin value → check;
- hybrid → value, bluff or give-up;
- high-EV bluff → made hand;
- low-EV bluff → continued bluff or abandoned branch.

Score the range-level explanation separately from the hand action.

## Assessment family 7 — Called-raise turn toolkit

Provide the two filtered ranges after a flop check-raise and call.

Require the learner to derive:

- current range equity direction;
- nut/polarisation direction;
- betting-frequency direction;
- practical turn size toolkit;
- which classes protect the check range.

The learner must rebuild the turn strategy rather than automatically continue the flop aggression.

## Runtime

```text
cold range-state classification
→ action or class answer
→ blocker/future-job explanation
→ confidence
→ changed runout
→ misconception tag
→ delayed retest
```

## Source-purity constraints

- no source board, exact hand or solver percentage is reproduced;
- the source toy game is not copied;
- five-part labels may be used as evidence terminology but examples remain original;
- final answer keys stay directional until independent exact anchors exist.

## Coverage effect

These seven families strengthen:

- `LCM-04`;
- `LCM-05`;
- `LCM-06`;
- `LCM-09`;
- `LCM-11`.

They do not close the four remaining direct candidate-drill gaps.

## Count effect

```text
prior Carrot assessment families: 50
new Grade 3 L03–L04 families:      7
total Carrot assessment families: 57
```

## Verdict

`SEVEN_ORIGINAL_GRADE_3_L03_L04_ASSESSMENT_FAMILIES_READY`

`NO_SOURCE_EXAMPLES_COPIED`

`DIRECT_CANDIDATE_DRILL_COVERAGE_REMAINS_30_OF_34`
