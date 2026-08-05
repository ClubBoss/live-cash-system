# Carrot Grade 3 Batch 03 — Technical QA v1

Status: `ACCEPTED / FIVE_DUPLICATE_BUNDLES / THREE_NEW_LECTURES`

## Package identity

- archive: `transcripts_mlx_large_v3 2(1).zip`;
- SHA-256: `bf46ac4ba2f0cffc6d5fa5763e9569cd4b9e7795b457203a0b244bc92820053d`;
- ZIP entries: `81`;
- substantive files: `40`;
- macOS metadata files: `41`.

## Bundle inventory

Eight complete five-format bundles are present:

- Lectures 01–07;
- Grade 3 Exam Feedback.

Each bundle contains:

- `.txt`;
- `.timestamped.txt`;
- `.srt`;
- `.vtt`;
- `.segments.json`.

## Duplicate result

All 25 files for Lectures 01–04 and Grade 3 Exam Feedback match the previously accepted Batch 02 archive byte-for-byte.

They were not re-ingested and do not replace existing canonical records.

New source delta:

- `CP-G3-L05` — Calling Bets;
- `CP-G3-L06` — Extreme Bet Sizing;
- `CP-G3-L07` — Triple Barreling.

## Technical metrics

| Source | Duration | Segments | Plain words | Word records | Mean confidence | Below 0.50 | Max gap | Overlaps |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Lecture 05 | 62:36.04 | 829 | 13,754 | 13,848 | 0.96604 | 179 / 1.293% | 1.56s | 0 |
| Lecture 06 | 55:46.62 | 729 | 11,948 | 12,068 | 0.96640 | 152 / 1.260% | 1.60s | 0 |
| Lecture 07 | 39:11.66 | 533 | 8,634 | 8,731 | 0.96273 | 139 / 1.592% | 1.02s | 0 |

For all three new sources:

- engine: `mlx-whisper`;
- model: `large-v3`;
- language: English;
- translation: false;
- plain transcript matches concatenated JSON segment text after whitespace normalisation;
- no timeline overlap;
- no consecutive duplicate segment;
- no repeated 12-word shingle;
- no missing tail;
- logical spoken ending is present.

## Continuity result

- Lecture 5 explicitly transitions to Lecture 6;
- Lecture 6 explicitly transitions to Lecture 7;
- Lecture 7 explicitly announces Lecture 8 and says several lectures remain.

Therefore:

```text
Grade 3 lectures received: L01–L07
later lectures:            pending
Final Exam PDF:            received
Exam Feedback:             received
answer-key continuity:     complete
lecture continuity:        partial
```

## ASR risk boundaries

Exact source claims remain unadmitted where audio alone is insufficient:

- cards and suits;
- solver grids and range matrices;
- exact mixed frequencies;
- exact EV differences;
- exact size menus and numeric thresholds;
- exact population magnitudes.

Low-confidence word records are sparse and locally distributed. No interval shows structural ASR collapse.

## Rerun decision

`NO_FULL_RERUN_REQUIRED`

Targeted source-video review is necessary only when an exact visual claim can change an original answer key, boundary, anchor or final rule.

## QA verdict

`CARROT_G3_BATCH_03_ACCEPTED`

`LECTURES_01_TO_04_AND_EXAM_FEEDBACK_EXACT_DUPLICATES`

`LECTURES_05_TO_07_NEW`

`ALL_FIVE_FORMATS_PRESENT`

`NO_LOOP_OVERLAP_OR_MISSING_TAIL`

`GRADE_3_LECTURE_08_PLUS_PENDING`
