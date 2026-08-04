# General Live Cash — Drill and Spaced Repetition System v0.1

Status: `LEARNING_SYSTEM_ARCHITECTURE`

Purpose: convert compact heuristics into executable decisions that can be recalled under live-table pressure.

## Design objective

The learner should not memorize hundreds of isolated chart cells. The system should train:

1. rapid node recognition;
2. correct reasoning sequence;
3. robust action category;
4. exception recognition;
5. transfer to changed cards, positions and depths;
6. post-session repair of recurring mistakes.

## Canonical learning loop

`HEURISTIC → RECOGNITION → DECISION → REASON → FEEDBACK → VARIANT → DELAYED RETEST → SESSION EVIDENCE`

## Drill object schema

Every drill must contain:

```yaml
id:
heuristic_ids: []
misconception_ids: []
domain:
difficulty:
node:
scenario:
question_type:
allowed_answers: []
correct_action_family:
required_reasoning_steps: []
acceptable_variants: []
critical_exception:
feedback_correct:
feedback_incorrect_by_misconception:
followup_variant_rule:
time_target_seconds:
source_support:
status:
```

## Question types

### `QT-01 — Node recognition`

Learner identifies:

- pot type;
- positions;
- number of players;
- effective stack;
- straddle units;
- sandwich/closing-action identity.

Purpose: prevent downstream reasoning on the wrong node.

### `QT-02 — Range-shape classification`

Learner labels a range or action branch:

- polar;
- linear;
- value-heavy truncated;
- over-wide;
- protected check;
- weak/capped check;
- unknown.

### `QT-03 — Directional action`

Answers are category-level rather than exact-frequency:

- more fold;
- more call;
- more raise;
- more check;
- more bet;
- larger size family;
- smaller size family;
- no reliable exploit.

### `QT-04 — Candidate sorting`

Sort hands into:

- value;
- equity bluff;
- blocker/matcher bluff;
- savage air;
- bluff-catcher;
- protected check/call;
- reject.

### `QT-05 — Branch comparison`

Same opponent and board, different action branch:

- bet versus check;
- small versus large size;
- call versus raise;
- heads-up versus multiway.

### `QT-06 — Range ancestry trace`

Learner proves that proposed value or bluff combos could enter preflop and survive prior streets.

### `QT-07 — Full decision sequence`

Learner completes a compact algorithm such as:

`SIZE SHAPE → RANGE UPDATE → TURN OWNERSHIP → COMBO JOB → RIVER PLAN`

or:

`NUT OWNER → SANDWICH → SHARED DEFENCE → EXPECTED AGGRESSION → BACKUP EQUITY`

### `QT-08 — Error diagnosis`

Given a wrong decision and stated reasoning, learner identifies the misconception ID and minimal repair.

### `QT-09 — Session hand repair`

A real hand is converted into:

- decision node;
- uncertainty;
- likely misconception;
- one targeted drill family;
- delayed retest.

## Difficulty levels

### Level 0 — Recognition

- one mechanism;
- no close alternatives;
- no exact frequencies;
- unlimited reasoning time.

### Level 1 — Single decision

- one main mechanism;
- one plausible distractor;
- action category required.

### Level 2 — Exception discrimination

- same heuristic across two contexts;
- learner must detect when the default changes.

### Level 3 — Multi-step tree

- range update across two or three streets;
- future plan required.

### Level 4 — Time pressure

- table cue and action family within 10–20 seconds;
- short explanation after action.

### Level 5 — Noisy live environment

- incomplete information;
- uncertain player read;
- multiple effective stacks;
- learner must preserve baseline when exploit evidence is weak.

## Scoring dimensions

A drill score is not only final-action accuracy.

| Dimension | Weight guidance | Meaning |
|---|---:|---|
| Node identity | 15% | Correct pot, position, player count and depth |
| Range construction | 20% | Correct preflop/source-range understanding |
| Action filtering | 15% | Correct update after prior actions |
| Mechanism choice | 20% | Correct heuristic or algorithm branch |
| Action family | 15% | Correct directional decision |
| Exception handling | 10% | Avoids overgeneralization |
| Confidence calibration | 5% | Knows when evidence is insufficient |

Weights are design defaults, not source claims. Exact product scoring can be tuned after beta testing.

## Response classes

- `A — Correct action, correct reason`
- `B — Correct action, incomplete reason`
- `C — Correct action, wrong reason`
- `D — Wrong action, partially correct mechanism`
- `E — Wrong action, structural misconception`
- `U — Uncertain but appropriately preserves baseline`

A `C` response requires repair even though the action was correct.

## Feedback format

### Immediate feedback

Keep it short:

1. decision verdict;
2. failed reasoning step;
3. one-sentence correction;
4. table cue.

Example:

```text
Action is too aggressive.
You treated a sandwiched multiway spot as heads-up.
Defence is shared and a strong range remains behind.
Cue: Who can still wake up behind me?
```

### Expanded feedback

Available after the learner answers:

- range explanation;
- why the distractor was attractive;
- critical exception;
- mapped heuristic and misconception;
- one follow-up scenario.

## Variant generation rules

A valid variant changes visible features while preserving the mechanism.

Change at least two of:

- board cards;
- suits;
- position pair;
- stack depth;
- bet size;
- blind identity;
- player count;
- opponent branch;
- straddle state.

Do not create a variant by changing only hand labels while leaving the exact decision tree identical.

## Spaced repetition states

- `NEW`
- `LEARNING`
- `FRAGILE`
- `STABLE`
- `TRANSFER_PENDING`
- `FIELD_VALIDATED`
- `REGRESSED`

## Initial scheduling policy

This is a product-design default and may be tuned:

### New or failed structural mechanism

- immediate variant after feedback;
- delayed retest next study session;
- another variant after 2–4 sessions;
- transfer test after 1–2 weeks.

### Correct action, wrong reason

- no identical immediate repeat;
- reasoning-focused variant later in the same session;
- delayed variant within several sessions.

### Stable mechanism

- less frequent mixed review;
- reactivated when session evidence shows a related error.

### Field regression

- return to `FRAGILE`;
- repair with one simple recognition drill;
- then one time-pressure variant;
- then one real-hand reconstruction.

## Mastery criteria

A heuristic is not mastered after one correct answer.

Minimum evidence should include:

1. correct recognition in at least three visually different variants;
2. correct exception on at least one counterexample;
3. correct action under time pressure;
4. no reasoning-level misconception;
5. successful delayed retest;
6. at least one correct use or accurate review in a real/session hand for `FIELD_VALIDATED`.

## Daily micro-session structure

Target duration: approximately 15–25 minutes.

1. **Warm recall — 2–3 minutes**
   - two table cues;
   - one prior fragile mechanism.

2. **New mechanism — 5–7 minutes**
   - one heuristic;
   - one worked example;
   - one exception.

3. **Drill block — 6–10 minutes**
   - 4–8 variants;
   - mixed question types.

4. **Transfer — 3–5 minutes**
   - one noisy or time-pressure spot;
   - one confidence-calibration choice.

5. **Close — 1 minute**
   - verbalize the table cue;
   - state what evidence would invalidate the exploit.

## Session-to-study loop

After a live session, record no more than the most valuable uncertain hands.

For each hand:

```text
Hand ID:
Node:
Effective stack:
Players:
Decision uncertainty:
Observed action:
Reasoning used:
Likely misconception:
Mapped heuristic:
Evidence quality:
Required drill family:
```

Prioritize hands by:

`frequency × pot leverage × uncertainty × recurrence`

Do not study only the largest lost pots. A repeated small structural leak can be higher priority.

## Initial drill packs to build

### Pack 1 — Effective stack and straddle

Mapped heuristics:

- `H-W01-001`
- `H-W01-003`

Primary misconceptions:

- `MC-001`
- `MC-002`

### Pack 2 — Blind identity and range update

Mapped heuristics:

- `H-W01-004`
- `H-W01-005`

Primary misconceptions:

- `MC-005`
- `MC-007`

### Pack 3 — Value-first aggression

Mapped heuristics:

- `H-W02-001`
- `H-W02-002`
- `H-W02-003`

Primary misconceptions:

- `MC-009`
- `MC-010`
- `MC-011`

### Pack 4 — Size-shape defence

Mapped heuristics:

- `H-W02-004`
- `H-W02-005`
- `H-W03-006`

Primary misconceptions:

- `MC-012`
- `MC-013`
- `MC-023`

### Pack 5 — Opponent branch modelling

Mapped heuristics:

- `H-W02-007`
- `H-W02-008`
- `H-W03-003`
- `H-W03-004`

Primary misconceptions:

- `MC-015`
- `MC-020`
- `MC-021`
- `MC-030`

### Pack 6 — 3-bet range ancestry

Mapped heuristics:

- `H-W03-001`
- `H-W03-002`
- `H-W03-005`

Primary misconceptions:

- `MC-018`
- `MC-019`
- `MC-022`

### Pack 7 — Multiway structure

Mapped heuristics:

- `H-W03-007`
- `H-W03-008`
- `H-W03-009`
- `H-W03-010`

Primary misconceptions:

- `MC-024`
- `MC-025`
- `MC-026`
- `MC-027`

### Pack 8 — River blocker and bluff-catcher audit

Mapped heuristics:

- `H-W02-009`
- `H-W03-011`

Primary misconceptions:

- `MC-017`
- `MC-022`
- `MC-028`

## Content purity rule

All commercial or Sharky-ready drills must use:

- original scenarios;
- original wording;
- independently generated ranges/solutions where exact validation is required;
- no copied course screenshots, charts or hand scripts.

Source courses support internal mechanism discovery only.

## System verdict

`DRILL_AND_SPACED_REPETITION_ARCHITECTURE_CREATED`
