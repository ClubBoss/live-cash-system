# Carrot Grade 2 Exam — Original Runtime Protocol v0.1

Status: `ORIGINAL / SOURCE-INDEPENDENT / ASSESSMENT_MODE`

## Purpose

Convert the Grade 2 exam's assessment process into an original runtime mode for the adaptive course without copying source questions or layouts.

## Runtime sequence

```text
COLD PROMPT
→ WRITTEN ACTION
→ WRITTEN REASON
→ CONFIDENCE
→ OPTIONAL RANGE-SHAPE SKETCH
→ TIME LIMIT
→ FEEDBACK
→ SELF-COMPARISON
→ ONE CHANGED VARIANT
→ DELAYED RETEST
```

## Session rules

- one question at a time;
- no answer hints before commitment;
- explanation required even when the action is correct;
- solver use is allowed only after the learner has stated an independent reason;
- target time: normally 5–12 minutes, hard cap about 15 minutes for a complex node;
- answers should be concise enough to reproduce under table pressure;
- exact mixed frequencies are not required unless an independent anchor exists.

## Required answer fields

1. **Node** — positions, pot type, effective depth and prior action.
2. **Range state** — who is polarised, condensed, capped or advantaged and why.
3. **Action family** — check, bet, call, raise or fold direction.
4. **Frequency and size** — treated as separate outputs.
5. **Hand tier** — value beater, value tier, bluff catcher, frail hand or bluff tier.
6. **Future branch** — what happens after calls, raises or later cards.
7. **Blocker role** — only after the action family is justified.
8. **Confidence** — 0–100.

## Scoring

Score independently:

- node recognition;
- range-shape explanation;
- action selection;
- sizing/frequency separation;
- hand-tier classification;
- future-tree reasoning;
- blocker ordering;
- confidence calibration.

A correct action with a wrong or incomplete reason is not mastery.

## Feedback format

Feedback should contain only:

1. the strongest correct element;
2. the first causal error;
3. the minimal corrected chain;
4. one contrastive variant;
5. one field cue.

Do not provide a long solver lecture before the learner attempts the variant.

## Exam blocks

Recommended ten-block original exam structure:

1. turn frequency versus size;
2. probe construction and check EV;
3. mandatory versus optional bluffing;
4. value tiers and sizing;
5. OOP slow-play classification;
6. urgency and hybrid EV;
7. robustness/frailness thresholds;
8. triple-barrel bluff-catching ancestry;
9. 3-bet-pot flop plan;
10. raise breadth from opposing bet shape.

Each block must use an independently generated node.

## Graduation rule

A learner passes the mode only when:

- action score is stable;
- reasoning score is stable;
- confidence is calibrated;
- at least one changed variant is solved;
- delayed retrieval remains above threshold.

No single exam score creates final mastery.

## Source-purity constraints

- no source board or hole-card combination;
- no source wording;
- no source solver grid;
- no source exact frequency;
- no source visual design;
- no requirement to remember source theorem names.

## Verdict

`GRADE_2_EXAM_MODE_READY`

`REASONING_BEFORE_FEEDBACK`

`SOURCE_CONTENT_NOT_COPIED`
