# General Live Cash — Session Review and Field Evidence Loop v0.1

Status: `FIELD_TRANSFER_ARCHITECTURE`

Purpose: convert live-session uncertainty into prioritized learning repairs and convert repeated observations into cautious environment and opponent evidence.

## Core principles

1. Record uncertain decisions, not every hand.
2. Separate decision quality from monetary result.
3. Diagnose reasoning before consulting an answer.
4. Update player reads at branch level.
5. Promote population tendencies only from repeated evidence.
6. Feed recurring mistakes back into drills.
7. Do not let one memorable pot rewrite the general core.

## Session lifecycle

`PRE-SESSION INTENT → LIGHTWEIGHT CAPTURE → POST-SESSION TRIAGE → HAND RECONSTRUCTION → MISCONCEPTION DIAGNOSIS → DRILL ASSIGNMENT → DELAYED RETEST → FIELD EVIDENCE UPDATE`

# 1. Pre-session card

Complete in under two minutes.

```text
Session ID:
Game/stakes:
Expected stack band:
Straddle expectation:
Core cue 1:
Core cue 2:
Fragile mechanism:
One pool hypothesis to observe:
What would falsify that hypothesis:
```

Rules:

- no more than two table cues;
- no more than one pool hypothesis;
- hypothesis is observational, not permission for automatic exploit;
- do not enter the session trying to force a recently studied play.

# 2. In-session capture

Capture only when one of these occurs:

- uncertain high-frequency node;
- large-pot decision with genuine ambiguity;
- repeated same-family error;
- unexpected opponent branch;
- unclear effective stack or side-pot structure;
- action contradicts current profile;
- emotional or timing pressure changed reasoning.

## Minimal live note

```text
Hand ID:
Time:
Positions:
Effective stack:
Players to flop:
Pot type:
Board/action shorthand:
Decision point:
My action:
Why uncertain:
Opponent reveal/read:
```

Do not write a full narrative at the table if it damages attention or game quality.

# 3. Post-session triage

Score each captured hand from 0–3 on:

- `FREQUENCY`: how often the node occurs;
- `LEVERAGE`: likely EV impact;
- `UNCERTAINTY`: how unclear the decision remains;
- `RECURRENCE`: whether similar errors have repeated;
- `TRANSFER`: whether the mechanism affects many spots.

Priority score:

`FREQUENCY + LEVERAGE + UNCERTAINTY + RECURRENCE + TRANSFER`

Review the highest-value hands first. Largest pot does not automatically win.

## Triage classes

- `T1 — Immediate repair`: structural recurring error.
- `T2 — Study queue`: meaningful but not urgent.
- `T3 — Profile evidence`: decision was clear; opponent model is the main value.
- `T4 — Archive`: result noise or insufficient reconstruction.

# 4. Hand reconstruction form

```yaml
hand_id:
session_id:
game:
stakes:
rake_or_time_charge:
straddle:
hero_position:
villain_positions: []
starting_stacks:
pairwise_effective_stacks:
preflop_action:
flop:
  board:
  action:
turn:
  card:
  action:
river:
  card:
  action:
decision_node:
known_hands:
uncertain_details: []
hero_reasoning_at_table:
alternative_actions_considered: []
emotional_or_time_pressure:
result_hidden_for_review: true
```

If action, size or stack is uncertain, preserve the uncertainty. Do not manufacture precision.

# 5. Decision audit

Evaluate in order:

1. Was the node identified correctly?
2. Was effective depth correct?
3. Were ranges sourced from preflop action correctly?
4. Was action size translated into range shape?
5. Were ranges updated after calls/checks?
6. Was the card's ownership effect evaluated?
7. Did Hero assign a job to the hand?
8. Was the future tree considered?
9. Was exploit evidence branch-specific and strong enough?
10. Did multiway structure change the defence burden?

## Audit outcome

```text
Action quality: GOOD / PLAUSIBLE / LIKELY_ERROR / UNRESOLVED
Reasoning quality: SOUND / INCOMPLETE / WRONG_PATH / RESULT_DRIVEN
Primary misconception ID:
Secondary misconception ID:
Mapped heuristic:
Missing evidence:
Minimal repair:
```

# 6. Repair assignment

Every `T1` hand creates exactly one primary repair target.

Repair package:

1. one recognition drill;
2. one exception/counterexample;
3. one time-pressure variant;
4. one delayed variant;
5. optional solver/source check only after the learner states the mechanism.

Avoid assigning an entire module because one hand was misplayed.

# 7. Field evidence records

Field evidence belongs to one of three scopes:

### Player evidence

Specific opponent and branch.

### Table evidence

Current lineup dynamics that may disappear when players change.

### Environment evidence

Repeated pattern across sessions, tables and players in the same game type.

## Evidence record

```yaml
evidence_id:
scope: PLAYER | TABLE | ENVIRONMENT
subject:
node:
observed_hand_class_or_action:
direct_or_inferred:
session_count:
independent_players:
confidence_grade: E0 | E1 | E2 | E3 | E4
supports_profile:
contradicts_profile:
possible_selection_bias:
next_falsifier_to_watch:
```

## Promotion to environment hypothesis

Require more than a memorable anecdote.

Minimum recommended conditions:

- repeated pattern across multiple sessions;
- more than one independent player unless the environment is a stable private lineup;
- same branch definition;
- no obvious selection bias from only recorded large pots;
- contradictory evidence recorded rather than discarded.

These are governance defaults and can be tuned.

# 8. Session metrics

Track learning quality, not only win/loss.

### Decision metrics

- node-identification accuracy;
- effective-stack accuracy;
- number of branch-specific reads versus vague labels;
- repeated misconception count;
- time-pressure failures;
- confidence-calibration quality.

### Process metrics

- captured hands reviewed;
- repairs completed;
- delayed retests passed;
- field hypotheses supported/contradicted;
- unresolved source-dependent spots.

### Poker outcome metrics

Keep separate:

- hours;
- stakes;
- result;
- all-in-adjusted result where available;
- major pots;
- table quality.

Do not use a short-term monetary result as proof that a heuristic is correct.

# 9. Weekly synthesis

Once per review block:

1. list top three recurring misconceptions;
2. identify one mechanism moving from `FRAGILE` to `STABLE`;
3. identify one regression;
4. update player profiles;
5. update environment hypotheses;
6. select next week's drill packs;
7. archive low-value unresolved hands.

## Weekly report template

```text
Period:
Sessions/hours:
Top misconception 1:
Top misconception 2:
Top misconception 3:
Most improved mechanism:
Regression:
Most valuable opponent read:
Environment hypothesis update:
Next drill pack:
Source/solver questions remaining:
```

# 10. Candidate admission from field evidence

Field evidence can:

- raise priority of a heuristic;
- reveal misuse and require a stronger exception;
- validate a table cue;
- show that a drill does not transfer;
- support an environment overlay.

Field evidence cannot by itself:

- prove a universal rule;
- overwrite stronger source/theory evidence after one result;
- justify copying a proprietary course example;
- close an audio or visual source gap.

# 11. Initial database entities

A future app or structured repository should support:

- `sessions`;
- `hands`;
- `decision_nodes`;
- `misconceptions`;
- `heuristics`;
- `drill_attempts`;
- `player_profiles`;
- `evidence_records`;
- `environment_profiles`;
- `source_questions`.

# 12. Minimal manual workflow before an app exists

The complete system can operate with Markdown or a spreadsheet:

1. one session note;
2. one hand-review file per prioritized hand;
3. misconception ID;
4. heuristic ID;
5. drill queue;
6. player/environment evidence table.

No software build is required before validating the learning loop.

## Loop verdict

`SESSION_REVIEW_AND_FIELD_EVIDENCE_LOOP_CREATED`
