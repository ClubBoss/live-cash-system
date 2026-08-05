# Carrot Grade 3 Batch 02 — Technical QA v1

Status: `ACCEPTED / TWO_DUPLICATE_LECTURES / TWO_NEW_LECTURES / NEW_EXAM_FEEDBACK`

## Package identity

- archive: `transcripts_mlx_large_v3(20260805-221934).zip`;
- SHA-256: `e957e3b8a699ed43378099cffbc8e5b874ca97283a7935984c1ae924b5dd4d70`;
- ZIP entries: `51`;
- substantive files: `25`;
- macOS metadata files: `26`.

## Bundle inventory

Five complete transcript bundles are present:

- Lecture 01;
- Lecture 02;
- Lecture 03;
- Lecture 04;
- Grade 3 Exam Feedback.

Each substantive bundle contains:

- `.txt`;
- `.timestamped.txt`;
- `.srt`;
- `.vtt`;
- `.segments.json`.

## Duplicate result

All ten Lecture 01–02 files match the previously accepted Grade 3 Batch 01 files byte-for-byte.

They were not re-ingested and do not replace `CP-G3-L01` or `CP-G3-L02`.

New source delta:

- `CP-G3-L03`;
- `CP-G3-L04`;
- `CP-G3-EXAM-FB`.

## Technical metrics

| Source | Duration | Segments | Plain words | Word records | Mean confidence | Below 0.50 | Max gap | Overlaps |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Lecture 03 | 46:53.00 | 610 | 10,386 | 10,407 | 0.96076 | 181 / 1.739% | 0.82s | 0 |
| Lecture 04 | 59:08.80 | 773 | 12,870 | 12,891 | 0.95818 | 178 / 1.381% | 1.24s | 0 |
| Grade 3 Exam Feedback | 58:08.84 | 801 | 13,856 | 13,872 | 0.96586 | 205 / 1.478% | 1.10s | 0 |

For all three new sources:

- engine: `mlx-whisper`;
- model: `large-v3`;
- language: English;
- translation: false;
- plain transcript matches concatenated JSON segment text after whitespace normalisation;
- no timeline overlap;
- no consecutive duplicate segment;
- no missing tail;
- logical spoken ending is present.

## Repetition analysis

Long-shingle repeats were rare:

- Lecture 03: `1` repeated 12-word shingle;
- Lecture 04: `2`;
- Exam Feedback: `11`.

Inspection shows pedagogical restatement and repeated question language, not Whisper looping.

## Continuity result

- Lecture 03 ends by transitioning to Lecture 4;
- Lecture 04 explicitly announces Lecture 5;
- Exam Feedback contains identifiable sections for Questions 1–10 and closes the full Grade 3 exam answer key.

Therefore:

```text
Grade 3 lectures received: L01–L04
later lectures:            pending
Final Exam PDF:            received
Exam Feedback:             received
answer-key continuity:     complete
lecture continuity:        partial
```

## ASR risk boundaries

Exact visual-dependent claims remain unadmitted where audio alone is insufficient:

- cards and suits;
- exact solver frequencies;
- exact EV values;
- exact range matrices;
- exact bet/raise geometry;
- exact population magnitudes.

The Grade 3 exam PDF controls question geometry. Solver screens should be reviewed only when an exact claim can change an original answer key, boundary or final rule.

## Rerun decision

`NO_FULL_RERUN_REQUIRED`

Targeted source-video review is only necessary for a later claim-driven visual dependency.

## QA verdict

`CARROT_G3_BATCH_02_ACCEPTED`

`LECTURES_01_TO_02_EXACT_DUPLICATES`

`LECTURES_03_TO_04_AND_EXAM_FEEDBACK_NEW`

`ALL_FIVE_FORMATS_PRESENT`

`NO_LOOP_OR_MISSING_TAIL`

`GRADE_3_ANSWER_KEY_CONTINUITY_COMPLETE`

`GRADE_3_LATER_LECTURES_PENDING`
