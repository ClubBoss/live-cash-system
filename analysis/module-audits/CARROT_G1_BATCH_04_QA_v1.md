# Carrot Grade 1 Batch 04 — Technical and Source QA v1

Date: 2026-08-05  
Status: `ACCEPTED / GRADE_1_LECTURE_CONTINUITY_COMPLETE`

## Input

- archive: `transcripts_mlx_large_v3(9).zip`;
- archive SHA-256: `8457f3c42759c9a9e61e7e2a9d39aa7cd774ee046dc1945fe88fef1499535d25`.

## Inventory

The archive contains complete five-format transcript bundles for:

- Grade 1 Lectures 01–10;
- Grade 1 Final Exam Feedback.

Ignoring macOS metadata files, the archive contains:

- `55` transcript files;
- `11` source objects;
- five files per source object.

## Duplicate result

Compared with accepted Batch 03 archive `transcripts_mlx_large_v3(8).zip`:

- `50/50` overlapping transcript files are byte-identical;
- Lectures 01–09 are exact repeats;
- Exam Feedback is an exact repeat;
- no prior canonical source requires replacement.

New delta:

- `Lecture 10.txt`;
- `Lecture 10.timestamped.txt`;
- `Lecture 10.srt`;
- `Lecture 10.vtt`;
- `Lecture 10.segments.json`.

## Lecture 10 technical metrics

| Metric | Result |
|---|---:|
| Source duration | `46:14.06` |
| JSON segments | `646` |
| Plain-text words | `10,609` |
| Word-token observations | `10,669` |
| Mean word probability | `0.96819` |
| Median word probability | `0.99902` |
| Tokens below `0.50` | `123` (`1.153%`) |
| Tokens below `0.30` | `32` |
| Gaps above two seconds | `0` |
| Largest segment gap | `0.78s` |
| Overlaps above `0.50s` | `0` |
| Repeated exact segment runs of three or more | `0` |
| Non-adjacent repeated 12-word windows | `0` |
| Normalised plain text equals segment text | `PASS` |

## Integrity checks

- all five expected formats are present;
- timestamps start at `00:00:04.780` and reach `00:46:14.060`;
- timing is continuous;
- no catastrophic Whisper loop is present;
- no long repeated block is present;
- no missing tail is indicated;
- the source closes coherently with Grade 1 completion and exam instructions;
- no full rerun is required.

## Local ASR and visual dependencies

Local terminology noise includes examples such as:

- `Karat Poker School` for Carrot Poker School;
- `Eevee` for EV;
- occasional malformed poker hand or solver terminology.

These do not damage the core source mechanisms. Exact cards, suits, solver cells, frequencies, EV values and bet sizes remain visual-dependent.

The approximate statement that best-to-worst blockers may move equity by around four to five percent is retained as a source claim, not a universal quantitative fact.

## Source continuity result

Grade 1 now has canonical records for:

- Lectures 01–10;
- Final Exam PDF;
- Final Exam Feedback.

No known lecture continuity gap remains for Grade 1.

Unknown supplements, worksheets or charts can still be ingested if later supplied, but they do not block lecture-corpus completion.

## QA verdict

`CARROT_G1_BATCH_04_ACCEPTED`

`LECTURE_10_TECHNICALLY_COMPLETE`

`NO_RERUN_REQUIRED`

`GRADE_1_LECTURES_01_TO_10_COMPLETE`
