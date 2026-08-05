# FTGU Final Incremental Transcript Batch 03 — QA v1

Date: 2026-08-05  
Status: `ACCEPTED_FOR_CANONICAL_INGESTION / SEVEN_NEW_LESSONS / COURSE_AUDIO_COVERAGE_COMPLETE`

## Package

- Archive: `transcripts_mlx_large_v3 2.zip`
- SHA-256: `f716191fdd901106631b5e3d9400931c6ed63b10ad71dd611246788fea3ee807`
- Engine: `mlx-whisper`
- Model: `large-v3`
- Language: English
- Translation: disabled

## Delta against Batch 02

The archive contains all 30 episodes and 150 real transcript artifacts.

The 23 previously accepted episodes are byte-identical to Batch 02 across all five artifacts and were not re-ingested.

Seven lessons are new:

- Episode 3 — When Someone Limps;
- Episode 4 — Calling an Open in Position;
- Episode 5 — Calling Out of the Big Blind;
- Episode 6 — Small Blind 3-Bet or Fold Strategies;
- Episode 7 — Selective vs Unselective C-Betting;
- Episode 8 — Call-Only Strategies vs C-Bets;
- Episode 9 — Polarised Flop Raising.

## Format completeness

Every new lesson contains:

- `.txt`
- `.timestamped.txt`
- `.srt`
- `.vtt`
- `.segments.json`

macOS metadata under `__MACOSX` is ignored.

## Technical QA

| Episode | Duration | Segments | Words | Mean confidence | Words below 0.5 | Max gap | Long repeat |
|---:|---:|---:|---:|---:|---:|---:|---|
| 3 | 12:44.18 | 200 | 2,823 | 0.968 | 39 (1.38%) | 3.34 s | none |
| 4 | 17:46.30 | 299 | 4,074 | 0.969 | 54 (1.33%) | 3.72 s | none |
| 5 | 10:28.70 | 145 | 2,371 | 0.966 | 36 (1.52%) | 2.12 s | none |
| 6 | 11:19.54 | 213 | 2,523 | 0.961 | 50 (1.98%) | 2.82 s | none |
| 7 | 19:33.62 | 280 | 4,218 | 0.966 | 65 (1.54%) | 2.44 s | none |
| 8 | 11:39.14 | 149 | 2,550 | 0.958 | 42 (1.65%) | 2.32 s | none |
| 9 | 22:13.30 | 340 | 4,900 | 0.967 | 64 (1.31%) | 3.30 s | none |

Checks performed:

- no consecutive duplicate segments;
- no duplicated 12-word shingles;
- no catastrophic Whisper loop;
- no empty terminal segment;
- coherent lesson ending in every file;
- normalized plain text equals concatenated JSON segment text;
- all 115 artifacts shared with Batch 02 are byte-identical.

## Residual ASR risk

The mechanisms are usable, but exact examples remain conservative because local errors affect:

- instructor/course names;
- player labels such as villain and nit;
- occasional card ranks and suits;
- exact example sizes and frequencies;
- isolated terms such as 3-bet, c-bet and SPR.

No full-lesson rerun is justified. Visual review remains claim-driven only.

## Verdict

`FTGU_FINAL_BATCH_03_ACCEPTED`

`SEVEN_NEW_LESSONS_CANONICALLY_INGESTIBLE`

`FTGU_ALL_30_EPISODES_AUDIO-COMPLETE`
