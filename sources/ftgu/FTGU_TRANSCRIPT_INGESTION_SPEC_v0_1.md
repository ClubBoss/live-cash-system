# From the Ground Up — Transcript Ingestion Specification v0.1

Status: `READY_FOR_INPUT`

## Goal

Accept FTGU material as an independent source corpus and compare it with the existing Smash mechanisms without silently blending the courses.

## Preferred package per lesson

Minimum acceptable:

- one plain transcript file;
- lesson title;
- source duration.

Preferred:

- `lesson_name.txt` — plain transcript;
- `lesson_name.timestamped.txt` or `.srt`;
- `lesson_name.segments.json` when available;
- screenshots only when a chart or visual action is strategically necessary.

Do not delay delivery merely because every preferred format is unavailable.

## Required metadata

For every lesson record, preserve when known:

- course: From the Ground Up Cash;
- module and lesson number;
- lesson title;
- instructor;
- original filename;
- source duration;
- transcription model and language;
- whether strategic visuals are present;
- whether the transcript is complete, partial or uncertain.

## Source-fidelity rules

1. Preserve hedging such as usually, often, can, may and depends.
2. Do not replace the instructor’s baseline with Smash conclusions.
3. Do not guess cards, suits, actions, sizes, frequencies or stack depth.
4. Mark unclear passages as `[UNCLEAR]` or `[AUDIO TRANSCRIPTION GAP]`.
5. Keep exact source terminology in the raw record even when the final Playbook will use independent language.
6. Separate instructor statements from later system inference.
7. Do not import external poker advice during transcription or canonical cleanup.

## Canonical record structure

Each lesson will become:

```text
Source Metadata
Editorial Note
Detailed Source-Faithful Record
Extracted Poker Objects
Explicit Instructor Mechanisms
Uncertainties Requiring Review
Cross-Source Hooks
```

## Cross-source hooks

For each FTGU mechanism, classify its relationship to Smash as one of:

- `CONFIRMS` — materially same mechanism and scope;
- `SIMPLIFIES` — same mechanism in a more executable form;
- `EXTENDS` — adds a new trigger, exception or street;
- `CONTEXT_SPLIT` — differs because of rake, depth, position or range;
- `CONFLICTS` — incompatible recommendation under apparently same assumptions;
- `ORTHOGONAL` — useful but not mapped to an existing candidate;
- `INSUFFICIENT` — wording is too vague or source evidence is incomplete.

## Admission discipline

FTGU support can strengthen or revise a heuristic. It cannot:

- repair a missing Smash passage;
- authorise copying FTGU wording or proprietary charts;
- convert an exact frequency into a universal rule without matching assumptions;
- move a candidate to `ADMITTED` without an original drill and misuse check.

## Delivery workflow

1. Send lessons incrementally or in module batches.
2. Preserve original filenames.
3. Include a simple manifest when several files are sent.
4. Duplicates will be detected and ignored rather than re-ingested.
5. Each accepted batch will receive QA, canonical records and a cross-source delta.

## Intake verdict

`FTGU_CORPUS_READY_FOR_INCREMENTAL_INGESTION`