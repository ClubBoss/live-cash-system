# Carrot Grade 3 Batch 01 — Technical QA v1

Date: 2026-08-06  
Status: `ACCEPTED / TWO_NEW_LECTURES / NO_RERUN_REQUIRED`

## Package

- archive: `transcripts_mlx_large_v3(20260805-215511).zip`;
- SHA-256: `56a05d55cb573c4f01ad9b337f9e9534db638e78fae0d6ec95cf6d21eeb51f82`;
- ZIP entries: `22`;
- substantive transcript files: `10`;
- substantive lecture bundles: `2`;
- remaining entries: directories and macOS metadata.

## Inventory

### Lecture 01

- `.txt`;
- `.timestamped.txt`;
- `.srt`;
- `.vtt`;
- `.segments.json`.

### Lecture 02

- `.txt`;
- `.timestamped.txt`;
- `.srt`;
- `.vtt`;
- `.segments.json`.

No exam feedback or unrelated lecture bundle is present.

## Lecture 01 metrics

```text
source:                    Lecture 01.mp4
duration:                  49:23.14
segments:                  696
plain-text words:          11,400
word records:              11,409
mean word confidence:      0.96561
word records below 0.50:   147 (1.288%)
maximum intersegment gap:  1.18s
material overlaps:         0
consecutive duplicates:    0
repeated 12-word shingles: 0
```

The plain transcript exactly matches concatenated JSON segment text after whitespace normalisation.

The lecture begins with a clear Grade 3 / Lecture 1 introduction and ends with an explicit transition to Lecture 2.

## Lecture 02 metrics

```text
source:                    Lecture 02.mp4
duration:                  41:06.02
segments:                  545
plain-text words:          9,530
word records:              9,548
mean word confidence:      0.96325
word records below 0.50:   114 (1.194%)
maximum intersegment gap:  1.56s
material overlaps:         0
consecutive duplicates:    0
repeated 12-word shingles: 0
```

The plain transcript exactly matches concatenated JSON segment text after whitespace normalisation.

The lecture begins with a clear Grade 3 / Lecture 2 introduction and ends with an explicit transition to Lecture 3.

## ASR risk assessment

Low-confidence words are sparse and concentrated in:

- course-name recognition;
- card/suit names;
- solver terminology;
- sizing notation;
- individual combinations.

No low-confidence region changes the lecture-level mechanism.

Exact cards, suits, frequencies, sizes and EV values remain visual-dependent.

## Loop and continuity result

No evidence was found of:

- catastrophic Whisper loops;
- duplicated long passages;
- segment overlap;
- missing tail;
- format mismatch;
- accidental translation;
- mixed lecture audio.

## Canonical records

Created:

- `sources/carrot-poker/transcripts/CP_G3_L01_mixing_facing_bets.md`;
- `sources/carrot-poker/transcripts/CP_G3_L02_mixing_continued_bet_check.md`.

## Coverage effect

```text
Grade 3 lectures received:  L01–L02
Grade 3 later lectures:     pending
Grade 3 Final Exam PDF:     received and audited
Grade 3 Exam Feedback:      pending
```

## QA verdict

`CARROT_G3_BATCH_01_ACCEPTED`

`LECTURES_01_AND_02_CANONICALLY_INGESTIBLE`

`NO_RERUN_REQUIRED`

`CLAIM_DRIVEN_VISUAL_REVIEW_ONLY`
