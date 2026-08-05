# Carrot Grade 2 Exam Feedback — Transcript QA v1

Status: `ACCEPTED_FOR_CANONICAL_INGESTION`

## Input

- archive: `Grade_2_Exam_Feedback_transcripts.zip`
- SHA-256: `d69c728eaf41122f5b6e202fbaa83042a1831d925796c091ae5fe5d3eca00e5c`
- source media: `Grade 2 - Exam Feedback.mp4`

## Inventory

Five required files are present:

- `.txt`
- `.timestamped.txt`
- `.srt`
- `.vtt`
- `.segments.json`

No duplicate or unrelated source bundle is present.

## Engine metadata

- engine: `mlx-whisper`
- model: `large-v3`
- language: `en`
- translation: `false`

## Technical metrics

```text
first speech:              00:04.66
last transcript end:       57:36.04
segments:                  760
plain-text words:          13,049
word records:              13,177
mean word confidence:      0.96346
word records below 0.50:   191
maximum intersegment gap:  1.08s
material overlaps:         0
```

The plain transcript matches concatenated JSON segment text after whitespace normalisation.

## Continuity result

All ten exam-answer sections are present in order:

```text
Q1  00:31
Q2  07:57
Q3  15:10
Q4  19:49
Q5  25:52
Q6  30:13
Q7  36:47
Q8  41:13
Q9  46:02
Q10 52:19
```

The transcript ends with a coherent course transition to Grade 3.

## Loop and repetition audit

No catastrophic Whisper loop, repeated long block, duplicate answer section, missing tail or timeline overlap was found.

Normal pedagogical repetition of concepts such as world favourability, pot-odds norm, urgency, robustness and range geography is source content rather than ASR failure.

## ASR risk areas

Claim-driven visual review remains appropriate for:

- exact card ranks and suits;
- exact board runouts;
- solver colours and grid cells;
- exact frequencies and EV values;
- exact bet-size menus;
- mixed-frequency magnitude;
- source-specific theorem names.

Several likely lexical risks are harmless at mechanism level, including occasional course-name and solver-term variation.

## Rerun decision

A full rerun is not justified.

Targeted visual confirmation is needed only if an exact source spot is later used to settle:

- a final boundary;
- a suit-specific answer key;
- a sizing threshold;
- a genuine cross-source conflict.

## QA verdict

`CARROT_G2_EXAM_FEEDBACK_ACCEPTED`

`FIVE_FORMAT_BUNDLE_COMPLETE`

`ALL_TEN_ANSWER_SECTIONS_PRESENT`

`NO_FULL_RERUN_REQUIRED`
