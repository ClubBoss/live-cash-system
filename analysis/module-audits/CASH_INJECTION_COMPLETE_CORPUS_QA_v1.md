# Cash Injection Complete Transcript Corpus — QA v1

Date: 2026-08-05  
Status: `ACCEPTED / COMPLETE_10_EPISODE_CORPUS`

## Package

- Archive: `transcripts_mlx_large_v3(4).zip`
- Size: `1,734,793` bytes
- SHA-256: `79a321d626a769a073e181731aa424cd0beaff5b5f39199697fa3716f7fc6882`
- Engine: `mlx-whisper`
- Model: `large-v3`
- Language: English
- Translation: disabled

## Delta against Batch 01

The package contains Episodes 01–10.

Episode 01 is identical to the previously accepted package in all five formats:

- `.txt`
- `.timestamped.txt`
- `.srt`
- `.vtt`
- `.segments.json`

The new source delta is therefore Episodes 02–10.

## Format completeness

Every episode contains all five preferred artifacts. macOS metadata under `__MACOSX` is ignored.

## Technical QA

| Episode | Speech end | Segments | Plain words | Mean word confidence | Words below 0.5 | Max inter-segment gap | Long repeat result |
|---:|---:|---:|---:|---:|---:|---:|---|
| 1 | 26:49.14 | 360 | 6,046 | 0.9705 | 68 (1.12%) | 0.74 s | none |
| 2 | 24:47.20 | 347 | 5,872 | 0.9664 | 71 (1.21%) | 3.14 s | none |
| 3 | 19:40.26 | 263 | 4,540 | 0.9599 | 82 (1.80%) | 0.98 s | none |
| 4 | 21:53.22 | 281 | 4,944 | 0.9628 | 81 (1.63%) | 0.92 s | none |
| 5 | 25:47.02 | 339 | 5,821 | 0.9633 | 91 (1.56%) | 2.96 s | none |
| 6 | 19:32.34 | 288 | 4,768 | 0.9674 | 55 (1.15%) | 0.62 s | none |
| 7 | 23:35.62 | 361 | 5,721 | 0.9640 | 80 (1.40%) | 0.76 s | none |
| 8 | 22:53.12 | 323 | 5,318 | 0.9676 | 66 (1.24%) | 0.94 s | none |
| 9 | 25:58.14 | 401 | 5,947 | 0.9623 | 92 (1.55%) | 1.64 s | none |
| 10 | 23:48.56 | 329 | 5,810 | 0.9680 | 65 (1.12%) | 0.76 s | none |

Checks performed:

- no catastrophic Whisper loops;
- no consecutive duplicated segments;
- no duplicated 12-word shingles;
- no empty transcript tails;
- all episodes end coherently;
- plain text matches concatenated JSON segment text exactly after whitespace normalisation;
- timestamp progression is continuous;
- Episode 01 deduplication is byte-confirmed.

## Residual ASR risk

The strategic mechanism of every episode is recoverable from audio. Local uncertainty remains around:

- exact cards and suits;
- exact hand labels and matrix cells;
- exact sizes, frequencies, EV values and node-lock edits;
- occasional poker terminology;
- several brand/course references;
- local numerical wording where the display is necessary for certainty.

No full-episode rerun is justified. Exact visual review remains claim-driven only.

## Evidence-quality distinction

Across the course, the instructor repeatedly combines:

1. baseline solver output;
2. personal hand examples;
3. instructor-created node locks;
4. references to mass data without supplying the underlying dataset;
5. broad claims about regulars, recreational players and lower-stakes pools.

These layers are not equivalent.

Accepted directly:

- range ancestry and filtering mechanisms;
- size and response elasticity;
- filtered versus unfiltered branch logic;
- hand-class effects inside an exploit;
- evidence and falsifier requirements.

Hypothesis-gated:

- magnitude and universality of pool overbluffing/underbluffing;
- extremely high exploit frequencies;
- transfer from online pools to Batumi live $1/$3 or $2/$5;
- claims that most opponents fail in one exact branch.

## Verdict

`CASH_INJECTION_COMPLETE_CORPUS_ACCEPTED`

`EPISODES_01_TO_10_AUDIO_COMPLETE`

`EPISODES_02_TO_10_READY_FOR_CANONICAL_INGESTION`

`NO_RERUN_REQUIRED`
