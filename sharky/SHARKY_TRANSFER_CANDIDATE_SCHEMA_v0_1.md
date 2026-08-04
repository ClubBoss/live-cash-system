# Live Cash → Sharky Transfer Candidate Schema v0.1

Status: `BOUNDARY_DEFINED`

Purpose: transfer source-pure poker mechanisms and learning structures into Sharky without coupling repositories, importing paid-course content or expanding the active Sharky curriculum prematurely.

## Boundary rule

The Live Cash repository is a domain research and evidence system.

Sharky is a learner-facing product and pedagogy system.

Only independently written, admitted and source-pure artifacts may cross the boundary.

## Transfer object

```yaml
transfer_id:
mechanism_id:
title:
source_repository:
content_purity_status:
admission_status:
learner_level:
prerequisites: []
trigger:
default_decision:
reasoning_steps: []
main_exception:
table_cue:
misconception_ids: []
diagnostic_dimensions: []
scenario_requirements:
  pot_type:
  positions:
  stack_band:
  player_count:
  board_family:
  action_history:
original_example_required:
visual_asset_requirements:
allowed_question_types: []
repair_strategy:
delayed_retest_rule:
evidence_summary:
known_limits:
sharky_track_candidate:
status:
```

## Eligible transfer classes

### `T-01 — Learning mechanic`

Examples:

- correct action / wrong reason distinction;
- misconception-linked repair;
- delayed variant retest;
- confidence calibration;
- mechanism-based spaced repetition.

Can transfer before advanced poker content.

### `T-02 — Diagnostic dimension`

Examples:

- effective stack;
- range source;
- action filtering;
- size shape;
- multiway structure.

Can strengthen existing Sharky lessons without importing a new advanced curriculum.

### `T-03 — General poker mechanism`

Examples:

- identify the blind range before reading the board;
- update the range after a call;
- value threshold before bluff volume.

Requires learner-level and curriculum-fit review.

### `T-04 — Advanced live-cash mechanism`

Examples:

- protected deep-OOP checking;
- branch-specific node locks;
- multiway shared defence;
- blocker ancestry.

Should enter only a future advanced/live track.

### `T-05 — Environment overlay`

Not appropriate for the universal Sharky core. May support optional deployment packs later.

## Source-purity gate

A transfer candidate is eligible only when:

1. wording is independently created;
2. no paid-course transcript is embedded;
3. no proprietary chart or screenshot is required;
4. examples are original;
5. exact strategy claims are independently validated where necessary;
6. the mechanism is not still rerun-blocked;
7. evidence scope and exceptions are explicit;
8. Live Cash admission status is at least `A3 — Drill validated` for poker content.

Learning mechanics and schemas can transfer earlier because they are original product design rather than source-derived strategy content.

## Initial high-value learning-mechanic candidates

### STC-001 — Correct action, wrong reason

Sharky should distinguish:

- correct action and correct mechanism;
- correct action by guess or wrong mechanism;
- incorrect action with partially correct reasoning;
- calibrated uncertainty.

### STC-002 — Misconception-targeted repair

Feedback maps to one failed reasoning dimension and one minimal repair, not a full lesson replay.

### STC-003 — Variant-based delayed retest

The repair closes only after a changed scenario tests the same mechanism later.

### STC-004 — Table cue compression

Each mechanism receives a short recall question rather than a slogan that hides conditions.

### STC-005 — Evidence-confidence layer

Learner sees whether a rule is:

- baseline;
- exploit;
- environment-sensitive;
- uncertain.

### STC-006 — Decision-step diagnosis

A complex hand can be decomposed internally into:

`NODE → RANGE → FILTER → OWNERSHIP → JOB → PLAN`

Sharky can identify the first failed step even if the learner sees one compact interaction.

## Initial diagnostic-dimension candidates

- `EFFECTIVE_DEPTH`
- `BLIND_IDENTITY`
- `RANGE_SOURCE`
- `SIZE_SHAPE`
- `ACTION_FILTER`
- `CARD_OWNERSHIP`
- `COMBO_JOB`
- `FUTURE_PLAN`
- `OPPONENT_BRANCH`
- `MULTIWAY_STRUCTURE`

## Current curriculum constraint

Do not inject deep-stack, straddle, node-lock and multiway modules into the active foundational Sharky route merely because the research now exists.

Recommended separation:

- current Volume I remains focused on its existing learning goals;
- source-pure learning mechanics may improve diagnostics and repairs;
- advanced live-cash content waits for an independently scoped track.

## Transfer workflow

1. Live Cash candidate reaches required admission state.
2. Create transfer object.
3. Replace all source-specific examples.
4. Run IP/source-purity review.
5. Map learner prerequisites.
6. Create Sharky-native scenario and distractors.
7. Run pedagogy and accessibility review.
8. Admit through Sharky governance independently.

## Repository rule

- Live Cash does not directly modify Sharky code or canonical curriculum.
- Sharky does not read paid-course transcripts.
- A transfer package is a small reviewed artifact, not a repository dependency.

## Verdict

`LIVE_CASH_TO_SHARKY_TRANSFER_BOUNDARY_DEFINED`
