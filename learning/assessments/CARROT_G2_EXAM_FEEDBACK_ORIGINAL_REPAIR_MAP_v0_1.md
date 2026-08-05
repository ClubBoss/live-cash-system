# Carrot Grade 2 Exam Feedback — Original Repair Map v0.1

Status: `ORIGINAL / SOURCE-INDEPENDENT / ANSWER_KEY_VALIDATED`

## Purpose

Convert the Grade 2 feedback into reusable misconception repairs without copying source boards, hands, solver values or wording.

This document does not add new assessment families. It supplies repair logic for the existing twenty Grade 2 families.

## Repair 1 — Better hand versus better bluff

Trigger:

- learner chooses the higher-equity hand as the preferred bluff.

Repair:

```text
HAND QUALITY ≠ BLUFF QUALITY

BLUFF QUALITY
= EV(BET) − EV(CHECK)
```

Changed variant:

- give one strong hand with valuable check EV and one weak hand with negligible check EV;
- require the learner to choose the bluff and explain opportunity cost.

## Repair 2 — Negative-EV betting

Trigger:

- learner assumes betting cannot be worse than folding because checking remains available.

Repair questions:

- which folds does the hand block?
- which continues does it unblock?
- what check EV is being sacrificed?
- how often does the bet reach a hostile continue range?

## Repair 3 — Protected check-back assumption

Trigger:

- learner treats a prior check as automatic weakness or cappedness.

Repair:

- reconstruct which strong hands preserve the check branch;
- compare the current range with the original preflop range;
- classify the branch as protected, underprotected or unknown.

## Repair 4 — Frequency versus size

Trigger:

- learner chooses one output from the other, such as low frequency therefore large bet.

Repair:

```text
WORLD FAVOURABILITY → FREQUENCY
RELATIVE POLARISATION → SIZE / RAISE BREADTH
```

Both outputs must be justified independently.

## Repair 5 — Aggregate hand-label error

Trigger:

- learner calls all combinations of a pocket pair or top pair equivalent.

Repair:

- split by suit;
- identify value blockers, bluff blockers and redraw differences;
- compare actual EV classes rather than the hand-name label.

## Repair 6 — Bottom-of-range bluff-raise

Trigger:

- learner automatically raises the weakest hand.

Repair order:

```text
CREDIBLE VALUE RAISES
→ TARGET BET-CALL / BET-FOLD REGIONS
→ BLOCK VALUE OR CALLS
→ UNBLOCK BET-FOLDS
→ SELECT BLUFF RAISES
```

## Repair 7 — Slow-play classification

Trigger:

- learner checks a strong hand simply to “trap.”

Require classification:

- theoretical slow-play;
- exploitative slow-play;
- erroneous slow-play.

The answer must cite urgency, check-raise access, opponent betting frequency, blockers and lost check-back value.

## Repair 8 — Frequency-over-magnitude bias

Trigger:

- learner prefers the line that is paid more often without comparing pot size.

Repair:

- calculate EV across folds, calls and raises;
- compare how often value is earned with how much is earned;
- identify when a raise trades win frequency for win magnitude.

## Repair 9 — Absolute-strength bias

Trigger:

- learner refuses thin value or raises because the hand “does not look strong enough.”

Repair:

- reconstruct which stronger hands would have acted earlier;
- locate the hand inside current range geography;
- compare against the opponent's actual continue range.

## Repair 10 — Weak-hand check-EV blindness

Trigger:

- learner assigns zero check EV to air.

Repair:

- identify delayed fold-equity branches;
- identify improvement branches;
- identify future probe or bluff opportunities;
- distinguish current showdown value from full-tree check EV.

## Runtime integration

Use after a failed Grade 2 assessment:

```text
classify failure
→ select one repair
→ ask one contrastive question
→ require action + reason + confidence
→ test one boundary variant
→ delayed retest
```

Do not provide the full answer before the learner commits to an action and reason.

## Source-purity constraints

- all practice spots must be original;
- no source hand or board is reproduced;
- no exact source percentage is required;
- theorem labels are optional;
- directional mechanisms control the answer key unless independently validated exact anchors exist.

## Verdict

`GRADE_2_FEEDBACK_REPAIR_MAP_READY`

`TWENTY_EXISTING_ASSESSMENT_FAMILIES_RETAINED`

`NO_SOURCE_EXAMPLES_COPIED`
