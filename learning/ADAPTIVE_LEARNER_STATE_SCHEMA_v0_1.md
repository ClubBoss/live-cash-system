# General Live Cash — Adaptive Learner State Schema v0.1

Status: `ACTIVE_SCHEMA / IMPLEMENTATION_READY`

## Purpose

Represent learner knowledge as evidence across mechanisms, not as completion of source lessons.

A learner may have watched a lesson and still be structurally weak. A learner may also master a mechanism without consuming every source item. The state model therefore tracks decision quality, reasoning, transfer and retention.

## Learner-state dimensions

Each module or candidate receives separate scores for:

| Dimension | Meaning |
|---|---|
| `NODE_RECOGNITION` | Correctly identifies positions, depth, pot type, players and action branch |
| `MECHANISM_EXPLANATION` | States why the rule applies |
| `ACTION_SELECTION` | Chooses the defensible action family |
| `BOUNDARY_CONTROL` | Recognises when the rule does not apply |
| `SPEED` | Retrieves the mechanism under a practical time limit |
| `CONFIDENCE_CALIBRATION` | Confidence matches correctness and evidence quality |
| `VARIANT_TRANSFER` | Applies the mechanism after cards, sizes, positions or depth change |
| `RETENTION` | Retrieves correctly after delay |
| `FIELD_TRANSFER` | Recognises or reconstructs the mechanism in a real hand |

## Module-state vocabulary

- `UNEXPOSED`
- `DIAGNOSED_GAP`
- `INTRODUCED`
- `FRAGILE`
- `WORKING`
- `RETAINED`
- `FIELD_TEST_PENDING`
- `FIELD_VALIDATED`
- `REPAIR_REQUIRED`
- `SCOPE_SPLIT`

No module becomes `RETAINED` from a single correct answer.

## Response classification

Every interaction records both action and reasoning:

- `A`: correct action and correct reasoning;
- `B`: wrong action but partially correct mechanism;
- `C`: correct action for the wrong reason;
- `D`: wrong action and wrong mechanism;
- `E`: correct baseline choice but exploit confidence is unjustified;
- `U`: explicit unknown/baseline response where evidence is insufficient.

`C` is not mastery. `U` can be the correct advanced response.

## Confidence calibration

Store confidence from 0–100.

Priority flags:

- high-confidence structural error;
- repeated low-confidence correct answer;
- unjustified exploit certainty;
- failure to use `UNKNOWN / BASELINE`;
- confidence that does not decay when evidence is stale.

## Evidence record

Minimum interaction record:

```yaml
interaction_id:
timestamp:
module_id:
candidate_ids: []
misconception_ids: []
interaction_type:
node_signature:
answer:
reasoning:
confidence:
response_class:
time_seconds:
variant_distance:
source_scope_version:
result:
repair_action:
next_retest:
field_relevance:
```

## Node signature

A node signature should include only strategically relevant variables:

```yaml
pot_type:
positions:
effective_stack_band:
players:
preflop_shape:
board_family:
action_branch:
size_shape:
environment_profile:
```

This allows the system to detect false transfer, such as applying heads-up logic multiway or treating a large polar bet like a small range bet.

## Mastery gate

Default transition to `RETAINED` requires:

- two correct reasoning responses in distinct variants;
- no high-confidence structural error in the latest two attempts;
- one delayed retrieval;
- correct boundary or counterexample recognition;
- acceptable response time for the module class.

Exact thresholds are configuration values, not architectural constants.

## Repair selection

Structural error priority:

1. prerequisite repair;
2. contrastive example;
3. immediate near-transfer variant;
4. delayed far-transfer variant;
5. field observation cue when appropriate.

Do not repeat the same explanation unchanged after failure.

## Spaced repetition

Retest scheduling considers:

- severity of misconception;
- confidence error;
- prior retrieval count;
- variant diversity;
- field relevance;
- time since last exposure;
- upcoming session profile.

Suggested initial intervals:

- immediate contrast;
- later in the same study session;
- 1–2 days;
- 4–7 days;
- 14–21 days;
- field-triggered retest.

## Source-update compatibility

The learner record points to module/candidate IDs and scope versions, not source lesson order.

When new evidence arrives:

- confirmation does not reset mastery;
- simplification schedules one lightweight confirmation;
- extension adds only the new branch as untested;
- context split preserves old-context mastery and tests the new context;
- revision marks only affected dimensions provisional;
- rejection invokes an explicit migration record.

## Initial personalisation inputs

For the current learner profile, initial weighting should emphasise:

- MTT-to-cash depth translation;
- SB versus BB identity;
- BB defence and realisation;
- OOP versus aggressive 3-bettors;
- 100–200bb as primary band;
- 200bb+ as controlled secondary band;
- multiway and straddle recognition;
- minimal chart memorisation;
- fast table cues and explanation-based drills.

These are learner configuration values, not universal course architecture.

## Verdict

`ADAPTIVE_LEARNER_STATE_SCHEMA_V0_1_ACTIVE`

`PROGRESS_TRACKED_BY_MECHANISM_NOT_BY_COURSE_COMPLETION`
