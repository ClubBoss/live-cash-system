# FTGU Incremental Transcript Batch 02 — QA v1

Date: 2026-08-05  
Status: `ACCEPTED_FOR_CANONICAL_INGESTION / SIXTEEN_NEW_LESSONS`

## Package

- Archive: `transcripts_mlx_large_v3(1).zip`
- SHA-256: `39894185c1c074d2effa8acd5a154d85d93dc729e050be2a90797fb92a352b0f`
- Engine: `mlx-whisper`
- Model: `large-v3`
- Language: English
- Translation: disabled

## Delta against Batch 01

The archive contains 23 lessons in total.

Seven previously accepted lessons are byte-identical duplicates across all five files and were not re-ingested:

- Episodes 1, 10, 11, 12, 13, 14 and 30.

Sixteen lessons are new:

- Episode 2 — Opening Ranges by Position;
- Episodes 15–18 — three-bet and four-bet architecture;
- Episodes 19–23 — flop/turn initiative and river selection;
- Episodes 24–27 — exploitative folding/calling, capped ranges and range checking;
- Episodes 28–29 — high-frequency and selective three-bet-pot strategies.

## Format completeness

Every new lesson contains all five preferred artifacts:

- `.txt`
- `.timestamped.txt`
- `.srt`
- `.vtt`
- `.segments.json`

macOS metadata under `__MACOSX` is ignored.

## Technical QA

| Episode | Duration | Segments | Words | Mean confidence | Words below 0.5 | Max gap | Long repeat |
|---:|---:|---:|---:|---:|---:|---:|---|
| 2 | 19:30.68 | 296 | 4,270 | 0.971 | 55 (1.29%) | 3.56 s | none |
| 15 | 19:33.02 | 290 | 4,433 | 0.968 | 61 (1.38%) | 2.68 s | none |
| 16 | 12:02.70 | 208 | 2,766 | 0.963 | 43 (1.55%) | 3.14 s | none |
| 17 | 16:26.86 | 239 | 3,522 | 0.968 | 51 (1.45%) | 3.92 s | none |
| 18 | 13:21.72 | 223 | 3,033 | 0.963 | 52 (1.71%) | 2.46 s | none |
| 19 | 14:36.18 | 221 | 3,132 | 0.965 | 42 (1.34%) | 1.80 s | none |
| 20 | 14:42.84 | 255 | 3,392 | 0.959 | 61 (1.80%) | 3.50 s | none |
| 21 | 23:57.06 | 362 | 5,315 | 0.963 | 96 (1.81%) | 4.98 s | none |
| 22 | 12:22.14 | 213 | 2,652 | 0.971 | 25 (0.94%) | 3.68 s | none |
| 23 | 15:33.96 | 272 | 3,457 | 0.963 | 57 (1.65%) | 3.40 s | none |
| 24 | 12:39.52 | 186 | 2,834 | 0.969 | 41 (1.45%) | 3.22 s | none |
| 25 | 15:11.58 | 269 | 3,393 | 0.966 | 49 (1.44%) | 2.20 s | none |
| 26 | 10:06.84 | 160 | 2,373 | 0.966 | 40 (1.69%) | 2.38 s | none |
| 27 | 13:12.76 | 211 | 2,957 | 0.965 | 49 (1.66%) | 2.16 s | none |
| 28 | 11:17.46 | 180 | 2,539 | 0.967 | 45 (1.77%) | 2.00 s | none |
| 29 | 10:49.36 | 168 | 2,331 | 0.963 | 37 (1.59%) | 3.36 s | none |

Checks performed:

- no consecutive duplicate segments;
- no duplicated 12-word shingles;
- no catastrophic Whisper loop;
- no empty terminal segment;
- coherent lesson ending in every file;
- normalized plain text equals concatenated JSON segment text.

## Residual ASR risk

The mechanisms are usable, but exact examples remain conservative because local errors affect:

- instructor/course names;
- occasional card ranks and suits;
- exact displayed range boundaries;
- individual sizing and frequency examples;
- some terms such as villain, SPR and c-bet.

These defects do not justify rerunning the full lessons. Visual review is required only when an exact example changes a final heuristic, drill answer, sizing threshold or anchor range.

## Verdict

`FTGU_INCREMENTAL_BATCH_02_ACCEPTED`

`SIXTEEN_NEW_LESSONS_READY_FOR_CANONICAL_AND_CROSS_SOURCE_INGESTION`
