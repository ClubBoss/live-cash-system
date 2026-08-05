# Carrot Grade 1 Initial Batch 01 — Technical QA v1

Date: 2026-08-05  
Status: `ACCEPTED_FOR_CANONICAL_INGESTION / GRADE_1_PARTIAL`

## Inputs

### Transcript archive

- file: `transcripts_mlx_large_v3(5).zip`;
- SHA-256: `033d016389e333bb70ef91224195e5c6d8ec3c6a0487158285a07864c7225f1a`;
- engine: `mlx-whisper`;
- model: `large-v3`;
- language: English;
- translation: disabled.

### Exam artifact

- file: `Grade 1 - Exam.pdf`;
- SHA-256: `cc5e1c2c1ce9239e97ccac75cbb58b7f3e89cc14bf909a09a16ba241461650c6`;
- pages: 13;
- author metadata: Peter Clarke.

## Package inventory

The transcript archive contains two source videos, each with all five preferred artifacts:

- `Lecture 01`;
- `Grade 1 - Exam Feedback`.

Formats for each:

- `.txt`;
- `.timestamped.txt`;
- `.srt`;
- `.vtt`;
- `.segments.json`.

macOS metadata under `__MACOSX` is ignored.

## Transcript QA

| Source | Duration | Segments | Words | Mean word confidence | Words below 0.5 | Max gap | Long-repeat result | Plain text = JSON |
|---|---:|---:|---:|---:|---:|---:|---|---|
| Lecture 01 | 66:30.98 | 863 | 14,481 | 0.9693 | 172 (1.18%) | 1.00 s | one legitimate repeated definition | PASS |
| Grade 1 Exam Feedback | 74:23.30 | 958 | 16,697 | 0.9667 | 254 (1.51%) | 1.88 s | none | PASS |

Checks performed:

- no consecutive duplicate segments;
- no catastrophic Whisper loop;
- no repeated long passage indicating a decoding loop;
- no empty transcript tail;
- coherent terminal outro;
- timestamp continuity;
- plain `.txt` equals concatenated JSON segment text after whitespace normalisation.

## ASR residuals

Recurring local noise:

- PioSolver rendered as `Pile Solver`, `Payo` and similar;
- villain rendered in several malformed variants;
- Carrot Poker School occasionally distorted;
- card ranks and suits locally misheard;
- GTO, EV and range terminology occasionally split or repeated.

The errors do not break lesson-level mechanisms. Exact cards, suits, frequencies and numerical solver outputs remain visual-dependent.

## PDF QA

The exam PDF rendered cleanly across all 13 pages.

Important reading rule:

- rendered card graphics and action columns are authoritative;
- parsed text omits or reorders some suits and board cards;
- the PDF contains questions only, while the feedback transcript supplies solutions.

## Source-identity decision

Assigned immutable IDs:

- `CP-G1-L01` — Lecture 01: Equity and EV;
- `CP-G1-EXAM` — Grade 1 Final Exam PDF;
- `CP-G1-EXAM-FB` — Grade 1 Final Exam Feedback.

The exam and feedback are supplemental Grade 1 sources, not numbered replacements for Lectures 02–10.

## Coverage boundary

Received:

- Lecture 01;
- final exam;
- exam feedback.

Not received:

- the lecture sequence between Lecture 01 and the final exam.

The feedback explicitly refers to later lectures, including Lecture 10. It can support Grade 1 competency mapping but cannot establish full lesson-by-lesson source continuity.

## Batch verdict

`CARROT_G1_INITIAL_BATCH_01_ACCEPTED`

`LECTURE_01_AND_EXAM_FEEDBACK_NO_RERUN_REQUIRED`

`GRADE_1_SOURCE_CORPUS_REMAINS_PARTIAL`
