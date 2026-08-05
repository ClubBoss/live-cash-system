# Carrot Grade 2 Lecture Corpus — Technical QA v1

Date: 2026-08-05  
Status: `ACCEPTED / LECTURES_01_TO_10_AUDIO_COMPLETE`

## Input

- archive: `transcripts_mlx_large_v3(10).zip`;
- SHA-256: `58cae6b4bab467901203406d7261026ffee89b19b4f667f9479257cc6599575b`;
- archive entries: `101`;
- substantive transcript files: `50`;
- macOS metadata entries: `51`.

## Grade identification

Lecture 01 explicitly welcomes the learner to Grade 2. Lectures 02–10 identify themselves as Grade 2 in their introductions. Lecture 10 describes itself as the final lecture before the Grade 2 exam.

The package therefore contains:

- `CP-G2-L01` through `CP-G2-L10`;
- no Grade 2 Final Exam PDF;
- no Grade 2 Exam Feedback transcript.

## Duplicate result

Compared with the accepted Grade 1 closing archive:

- `0/50` substantive Grade 2 files are byte-identical to the same-named Grade 1 files;
- all ten lectures are new source material;
- no Grade 1 canonical record is replaced.

## Format completeness

Each lecture contains:

- `.txt`;
- `.timestamped.txt`;
- `.srt`;
- `.vtt`;
- `.segments.json`.

All ten five-format bundles are complete.

## Per-lecture QA

| Source | Duration | Segments | Plain-text words | Mean word confidence | Tokens below 0.50 | Max inter-segment gap |
|---|---:|---:|---:|---:|---:|---:|
| `CP-G2-L01` | 76:07.32 | 900 | 15,583 | 0.97158 | 1.078% | 0.92s |
| `CP-G2-L02` | 62:10.88 | 758 | 13,267 | 0.97213 | 0.982% | 1.04s |
| `CP-G2-L03` | 63:13.14 | 764 | 13,118 | 0.96708 | 1.265% | 1.72s |
| `CP-G2-L04` | 60:42.84 | 783 | 12,709 | 0.96174 | 1.496% | 1.08s |
| `CP-G2-L05` | 53:41.38 | 750 | 11,797 | 0.96071 | 1.391% | 1.28s |
| `CP-G2-L06` | 59:42.48 | 813 | 13,021 | 0.96589 | 1.335% | 2.18s |
| `CP-G2-L07` | 59:57.34 | 810 | 13,110 | 0.96198 | 1.221% | 2.10s |
| `CP-G2-L08` | 63:02.92 | 830 | 13,866 | 0.96492 | 1.124% | 1.30s |
| `CP-G2-L09` | 50:55.78 | 683 | 11,141 | 0.95450 | 1.638% | 1.72s |
| `CP-G2-L10` | 54:00.06 | 729 | 11,914 | 0.96294 | 1.444% | 2.12s |

## Integrity findings

- Normalised plain text matches joined JSON segment text for all ten lectures.
- No material segment overlaps were found.
- Three pauses slightly above two seconds occur in L06, L07 and L10; surrounding text remains coherent and no source content appears missing.
- No catastrophic Whisper loops were found.
- Repeated twelve-word sequences in L01 and L08 occur only twice and reflect repeated instructional wording, not transcript duplication.
- All ten lectures end coherently.
- No missing tail was detected.

## Local ASR noise

Recurring non-blocking noise includes:

- `Carrot` rendered as `Karat`, `Carry`, `Cari` or similar;
- `3-bet` rendered as `3-bit`;
- `PioSolver` and poker notation variants;
- theorem names occasionally distorted locally;
- card names and suits occasionally uncertain without the screen.

Canonical records use conservative terminology correction only where the intended term is unambiguous. Exact cards, suits, frequencies, sizes and solver outputs are not reconstructed from audio guesses.

## Claim-driven visual dependencies

Visual review is warranted only when it can change:

- a final heuristic or context split;
- an original assessment answer;
- a sizing or SPR boundary;
- a genuine cross-source conflict;
- an independent range anchor.

Current visual dependencies include:

- exact PioSolver grids;
- exact hand tiers and mixed cells;
- exact board textures and positions;
- exact frequency and EV examples;
- exact low-dry 3-bet-pot plans;
- exact raising thresholds.

## Technical verdict

`CARROT_G2_LECTURES_01_TO_10_TECHNICALLY_ACCEPTED`

`NO_FULL_RERUN_REQUIRED`

`GRADE_2_EXAM_AND_FEEDBACK_NOT_PRESENT`

`CLAIM_DRIVEN_VISUAL_REVIEW_ONLY`
