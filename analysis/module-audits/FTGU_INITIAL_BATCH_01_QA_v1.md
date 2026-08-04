# FTGU Initial Transcript Batch QA v1

Date: 2026-08-05  
Status: `ACCEPTED_FOR_CANONICAL_INGESTION / PARTIAL_COURSE_BATCH`

## Package

- Archive: `transcripts_mlx_large_v3.zip`
- SHA-256: `12bb80c270c1987a8a648f61c577aee9965eaf162a222aebcd230b42cba2edd1`
- Engine: `mlx-whisper`
- Model: `large-v3`
- Language: English
- Translation: disabled

## Lessons received

1. Episode 1 — Equity and EV
2. Episode 10 — Merged Flop Raising
3. Episode 11 — Introduction to Combos
4. Episode 12 — Bet Sizing Special
5. Episode 13 — Introduction to Blockers
6. Episode 14 — Pyramidal Defence
7. Episode 30 — Three Tips for Success

This is an intentionally partial course batch. Episodes 2-9 and 15-29 are not present.

## Format completeness

Every lesson contains all five preferred artifacts:

- `.txt`
- `.timestamped.txt`
- `.srt`
- `.vtt`
- `.segments.json`

The archive also contains macOS metadata files under `__MACOSX`; they are ignored.

## Technical QA

| Episode | Duration | Segments | Words | Mean word confidence | Words below 0.5 | Max inter-segment gap | Long repeat result |
|---|---:|---:|---:|---:|---:|---:|---|
| 1 | 17:52.22 | 246 | 3,757 | 0.970 | 47 (1.25%) | 3.12 s | none |
| 10 | 18:40.18 | 292 | 3,988 | 0.960 | 91 (2.28%) | 2.40 s | none |
| 11 | 15:48.86 | 248 | 3,442 | 0.960 | 62 (1.80%) | 2.80 s | none |
| 12 | 16:55.60 | 253 | 3,802 | 0.969 | 45 (1.18%) | 2.20 s | none |
| 13 | 11:41.48 | 164 | 2,701 | 0.966 | 52 (1.93%) | 1.84 s | none |
| 14 | 19:09.12 | 284 | 4,251 | 0.965 | 56 (1.32%) | 2.88 s | none |
| 30 | 12:48.68 | 190 | 2,751 | 0.979 | 23 (0.84%) | 2.48 s | none |

Checks performed:

- no consecutive duplicate segments;
- no duplicate 12-word shingles;
- no catastrophic Whisper loop;
- no empty transcript tail;
- every lesson reaches a coherent outro or completed terminal point;
- plain `.txt` content matches concatenated JSON segment text exactly after normalization.

## ASR residuals

The batch is materially stronger than the failed first-cycle Smash transcripts, but it is not publication-ready verbatim text.

Recurring harmless noise:

- `Run It Once` / `Run at Once` variants;
- Peter Clarke rendered as `Pete Carters-Clark`, `characters Clark` and similar;
- `From the Ground Up` rendered once as `From the Grown Duck`;
- `villain` rendered locally as `Billan`, `Phil and` or similar.

Potentially strategy-relevant local noise requiring conservative handling:

- individual card ranks in Episode 10;
- exact hand/suit examples in Episodes 11-14;
- one-pair wording and numeric examples in Episode 1;
- exact sizing boundaries and pot values in Episode 12.

These defects do not break the lesson-level mechanisms. Exact cards, suits, sizes and frequencies remain visual-dependent.

## Initial source-quality verdict

- Episode 1: `ACCEPT`
- Episode 10: `ACCEPT / VISUAL_DEPENDENCIES`
- Episode 11: `ACCEPT / VISUAL_DEPENDENCIES`
- Episode 12: `ACCEPT / VISUAL_DEPENDENCIES`
- Episode 13: `ACCEPT / VISUAL_DEPENDENCIES`
- Episode 14: `ACCEPT / VISUAL_DEPENDENCIES`
- Episode 30: `ACCEPT / LEARNING_PROCESS_EVIDENCE`

## Batch verdict

`FTGU_INITIAL_BATCH_01_ACCEPTED`

`SEVEN_LESSONS_READY_FOR_CROSS_SOURCE_MAPPING`
