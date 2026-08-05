# Carrot Grade 1 Batch 02 QA v1

Date: 2026-08-05  
Status: `ACCEPTED / THREE_NEW_LECTURES / GRADE_1_PARTIAL`

## Input

- archive: `transcripts_mlx_large_v3(7).zip`;
- SHA-256: `c4aed76cd6beb0317bcab87083e43bdf265b478caf6409a391d2050e18169bd4`;
- engine: `mlx-whisper`;
- model: `large-v3`;
- language: English;
- translation: disabled.

## Inventory result

The archive contains five transcript bundles:

- Lecture 01;
- Lecture 02;
- Lecture 03;
- Lecture 04;
- Grade 1 Final Exam Feedback.

Lecture 01 and Exam Feedback are byte-identical to the previously accepted Grade 1 batch in all five formats.

New delta:

- Lecture 02 — Value Betting;
- Lecture 03 — Bluffing;
- Lecture 04 — Polarisation and Relative Hand Strength.

## Format completeness

Every new lecture contains:

- `.txt`;
- `.timestamped.txt`;
- `.srt`;
- `.vtt`;
- `.segments.json`.

Plain `.txt` matches concatenated JSON segment text after whitespace normalisation.

## Technical QA

| Source | Duration | Segments | Words | Mean word confidence | Words below 0.5 | Max inter-segment gap | Long repeats |
|---|---:|---:|---:|---:|---:|---:|---|
| `CP-G1-L02` | 63:34.50 | 864 | 14,457 | 0.9703 | 167 (1.15%) | 1.02 s | none |
| `CP-G1-L03` | 60:54.88 | 832 | 13,821 | 0.9691 | 180 (1.30%) | 1.14 s | none |
| `CP-G1-L04` | 65:05.78 | 824 | 13,779 | 0.9692 | 180 (1.30%) | 0.90 s | none |

Checks:

- no consecutive duplicate segments;
- no duplicated 12-word shingles;
- no catastrophic Whisper loop;
- no missing transcript tail;
- coherent lecture outro;
- transcript/JSON agreement.

## ASR residuals

Recurring harmless noise:

- `Carrot` rendered locally as `Card` or `Carry`;
- `PioSolver` and course names malformed locally;
- `villain` and individual card names occasionally corrupted;
- `3-bet` rendered locally as `3-bit`.

Strategy-sensitive visual dependencies:

- exact boards, suits and hand labels;
- exact solver frequencies and EV values;
- exact range graphs;
- precise bet sizes and pot geometry;
- exact mixed-strategy cells.

These do not invalidate the lecture-level mechanisms.

## Source verdicts

- `CP-G1-L02`: `ACCEPT / SOLVER_VISUALS_PENDING`;
- `CP-G1-L03`: `ACCEPT / SOLVER_VISUALS_PENDING`;
- `CP-G1-L04`: `ACCEPT / SOLVER_VISUALS_PENDING`.

## Grade coverage

Received canonical Grade 1 lectures:

- L01;
- L02;
- L03;
- L04.

Also received:

- final exam;
- exam feedback.

Still pending:

- Lectures 05–10;
- any missing Grade 1 supplements;
- Grades 2–3.

## Batch verdict

`CARROT_G1_BATCH_02_ACCEPTED`

`THREE_NEW_LECTURES_CANONICALLY_READY`

`NO_RERUN_REQUIRED`

`GRADE_1_REMAINS_PARTIAL`
