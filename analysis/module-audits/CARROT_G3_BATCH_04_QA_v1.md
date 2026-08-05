# Carrot Grade 3 Batch 04 — Technical QA v1

Date: 2026-08-06  
Status: `ACCEPTED / TWO_NEW_LECTURES / LECTURE_10_PENDING`

## Package identity

- archive: `Archive(3).zip`;
- SHA-256: `b9a2a664ca0ae8696b771fd82bc1c5f51eadb573495a6eac96c25e00ff040137`;
- ZIP entries: `20`;
- substantive files: `10`;
- macOS metadata files: `10`.

## Bundle inventory

Two complete transcript bundles are present:

- Lecture 08;
- Lecture 09.

Each contains:

- `.txt`;
- `.timestamped.txt`;
- `.srt`;
- `.vtt`;
- `.segments.json`.

No earlier lecture, Final Exam or Exam Feedback bundle is present.

## Technical metrics

| Source | Duration | Segments | Plain words | Word records | Mean confidence | Below 0.50 | Max gap | Overlaps |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Lecture 08 | 53:24.04 | 718 | 12,264 | 12,278 | 0.96893 | 115 / 0.937% | 1.22s | 0 |
| Lecture 09 | 51:05.02 | 701 | 11,672 | 11,692 | 0.96005 | 146 / 1.249% | 1.72s | 0 |

For both sources:

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

- Lecture 08 explicitly transitions to Lecture 09 and announces 3-bet-pot coverage;
- Lecture 09 explicitly transitions to Lecture 10;
- Lecture 09 describes Lecture 10 as the final lecture and announces 4-bet-pot situations.

Therefore:

```text
Grade 3 lectures received: L01–L09
Lecture 10:                pending
Final Exam PDF:            received
Exam Feedback:             received
answer-key continuity:     complete
lecture continuity:        partial
```

## Repetition analysis

No repeated 12-word shingles were found in either new lecture. Local repeated words are natural speech disfluencies and do not constitute Whisper looping.

## ASR risk boundaries

The transcripts are technically clean, but exact visual claims remain unadmitted where audio alone is insufficient:

- board cards and suits;
- exact hand combinations;
- exact preflop and postflop range matrices;
- exact solver frequencies and EV;
- exact size menus and numeric thresholds;
- exact source-example SPR;
- exact population magnitude.

Low-confidence pockets are local and do not disrupt the main mechanism or ending continuity.

## Rerun decision

`NO_FULL_RERUN_REQUIRED`

Targeted video or solver-screen review is warranted only when an exact claim can change:

- a final rule or boundary;
- an independent range anchor;
- an original assessment answer;
- a cross-source contradiction;
- a depth or sizing threshold.

## QA verdict

`CARROT_G3_BATCH_04_ACCEPTED`

`LECTURES_08_TO_09_NEW`

`ALL_FIVE_FORMATS_PRESENT`

`NO_LOOP_OR_MISSING_TAIL`

`GRADE_3_L01_TO_L09_RECEIVED`

`GRADE_3_LECTURE_10_PENDING`

`NO_RERUN_REQUIRED`
