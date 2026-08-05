# Carrot Grade 1 Batch 03 QA v1

Date: 2026-08-05  
Status: `ACCEPTED / GRADE_1_LECTURES_05_TO_09`

## Input

- archive: `transcripts_mlx_large_v3(8).zip`;
- SHA-256: `f7520f9f712564bb4c77c482962758701727a023f97c39c08cba7eae53913b6d`;
- package inventory: Lectures 01–09 plus Grade 1 Exam Feedback;
- new delta: Lectures 05–09.

## Duplicate result

Compared with the previously accepted Grade 1 Batch 02 archive:

- Lectures 01–04 are byte-identical in all five formats;
- Exam Feedback is byte-identical in all five formats;
- duplicate files were not re-ingested.

## New source set

- `CP-G1-L05` — Facing Bets and Calling;
- `CP-G1-L06` — Range and Nut Advantage for Flop C-Betting;
- `CP-G1-L07` — Turn Barrel Opportunities;
- `CP-G1-L08` — Float Betting the Flop;
- `CP-G1-L09` — River Textural Awareness and Range Geography.

## Format completeness

Every new lecture contains:

- `.txt`;
- `.timestamped.txt`;
- `.srt`;
- `.vtt`;
- `.segments.json`.

macOS metadata under `__MACOSX` is ignored.

## Technical QA

| Lecture | Duration | Segments | Words | Mean word confidence | Words below 0.5 | Max inter-segment gap | Long-repeat result |
|---:|---:|---:|---:|---:|---:|---:|---|
| 05 | 57:25.42 | 780 | 13,316 | 0.969 | 1.28% | 0.92 s | none |
| 06 | 59:07.08 | 818 | 13,257 | 0.967 | 1.18% | 0.94 s | none |
| 07 | 56:52.84 | 811 | 13,158 | 0.966 | 1.26% | 1.00 s | none |
| 08 | 1:04:29.26 | 903 | 15,092 | 0.969 | 1.21% | 1.56 s | none |
| 09 | 54:47.60 | 766 | 12,915 | 0.968 | 1.20% | 1.16 s | no loop; repeated threshold wording only |

Checks performed:

- no consecutive duplicate segments;
- no catastrophic Whisper loop;
- no empty transcript tail;
- coherent lesson ending;
- plain `.txt` matches concatenated JSON segment text after whitespace normalisation;
- repeated 12-word sequences in Lecture 09 are intentional reuse of the range-threshold exercise wording, not transcript duplication.

## ASR residuals

Recurring harmless noise:

- `Carrot` rendered locally as `Karat`, `Kara` or similar;
- local card-rank and suit substitutions;
- `villain`, `PioSolver`, `c-bet`, `showdown value` and position labels occasionally malformed;
- some sentence boundaries lost in long solver explanations.

Strategy-sensitive details left visual-dependent:

- exact boards and suits;
- exact pot sizes and bet sizes;
- exact solver EV/equity/frequency values;
- exact hand-class boundaries and mixed frequencies.

## Batch verdict

`CARROT_G1_BATCH_03_ACCEPTED`

`LECTURES_05_TO_09_CANONICALLY_READY`

`NO_RERUN_REQUIRED`
