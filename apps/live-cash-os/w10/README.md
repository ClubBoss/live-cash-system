# Live Cash OS — W10 evidence pack

This directory supports the empirical-validation stage. It does **not** change learner state, scheduler behavior, mastery thresholds, curriculum, or poker strategy truth.

## Inputs

1. `live-cash-progress.json` — export from **Data & Recovery → Export progress** in the app.
2. A local copy of `observation-ledger.example.json`, filled during real use.

The progress export remains the source for machine-readable decision, confidence, review, card and field-note evidence. The observation ledger exists only for evidence the state model cannot reconstruct honestly after the fact: completed-session duration, navigation friction, unnecessary clicks, queue overload, desire to return, before-play usefulness and explicit comprehension observations.

## Observation contract

Use one session row per real learning session. `phase` is one of:

- `baseline`
- `learning`
- `post_instruction`
- `delayed`
- `field`

Use friction categories from the W10 protocol:

- `content_error`
- `language_problem`
- `ambiguous_question`
- `weak_distractor`
- `routing`
- `scheduling`
- `visual_friction`
- `mobile_friction`
- `field_workflow_friction`
- `navigation_confusion`
- `queue_overload`
- `no_action`

Severity is `P0`, `P1`, `P2` or `P3`. Reuse the same `repeatKey` when the same friction recurs. Keep optional `note` text local unless there is a deliberate reason to share it.

Do not backfill observations from memory merely to satisfy a gate. Unknown values should remain `null` or be omitted.

## Generate a report

From `apps/live-cash-os`:

```bash
npm run w10:report -- /path/to/live-cash-progress.json /path/to/w10-observations.json /path/to/output
```

The command emits:

- `w10-evidence.json` — machine-readable evidence summary;
- `w10-evidence.md` — compact human review summary.

The compiler validates the current schema-v2 progress export. It will not silently migrate malformed or legacy evidence. Import/migrate old progress through the app first, then export a fresh snapshot.

## Acceptance boundary

The report may reach `READY_FOR_HUMAN_W10_REVIEW`. It can never output `W10_COMPLETE`.

Human judgment remains required for comprehension quality, calibration trend, misconception-recurrence interpretation, field-hand support, recurring-friction adjudication and final Wave 10 acceptance.

Metrics that cannot be reconstructed honestly from the current export are emitted as `NOT_MEASURABLE_FROM_EXPORT` rather than guessed.

## Privacy

Generated summaries intentionally exclude:

- raw Diagnostic reasoning;
- raw explain-back text;
- raw real-hand cue/action/reason/evaluator text;
- free-text friction notes;
- user identifiers.

The raw progress export and observation ledger should be treated as private local evidence.
