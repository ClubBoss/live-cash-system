# Cash Injection Initial Transcript Batch 01 — QA v1

Date: 2026-08-05  
Status: `ACCEPTED_FOR_CANONICAL_INGESTION / ONE_NEW_EPISODE`

## Package

- Archive: `transcripts_mlx_large_v3(2).zip`
- Size: `190,432` bytes
- SHA-256: `f99198d0087bf3363b67cf8f05aeba95289b277cab7198b1534fe4a9d0560069`
- Engine: `mlx-whisper`
- Model: `large-v3`
- Language: English
- Translation: disabled

## Contents

One real source lesson is present:

- `Episode 01.mp4`

Five preferred artifacts are supplied:

- `.txt`
- `.timestamped.txt`
- `.srt`
- `.vtt`
- `.segments.json`

macOS metadata under `__MACOSX` is ignored.

## Technical QA

| Metric | Result |
|---|---:|
| Source coverage from first speech to ending | `00:06.08–26:49.14` |
| Segments | 360 |
| Plain transcript words | 5,999 |
| Word-confidence records | 6,052 |
| Mean word confidence | 0.9705 |
| Words below 0.5 confidence | 68 (1.12%) |
| Maximum inter-segment gap | 0.74 s |
| Consecutive duplicate segments | 0 |
| Duplicated 12-word shingles | 0 |
| Plain text versus concatenated JSON | exact after whitespace normalisation |

Checks performed:

- no catastrophic Whisper loop;
- no repeated long passage;
- no empty terminal segment;
- coherent course outro;
- continuous segment sequence;
- complete five-format package.

## Residual ASR risk

The lesson-level mechanism is stable. Local uncertainty remains around:

- exact cards and suits;
- exact hand labels in matrices;
- course/instructor naming outside the explicit audio;
- isolated poker terms;
- exact percentages, EV values and raise sizes displayed visually.

The transcript does not justify a full rerun. Exact visual claims should be reviewed only when they change a final drill, sizing threshold, pool hypothesis or Playbook branch.

## Evidence-quality distinction

The audio contains three different evidence classes:

1. solver baseline description;
2. instructor-created node-lock assumptions;
3. broad population claims about overfolding and under-three-betting.

They must not be treated as equal.

- The response-shape and elasticity mechanisms are accepted.
- Exact solver outputs remain visual-dependent.
- Population magnitude remains a hypothesis until independent data or field evidence supports it.

## Verdict

`CASH_INJECTION_BATCH_01_ACCEPTED`

`CINJ_E01_CANONICALLY_INGESTIBLE`

`NO_RERUN_REQUIRED`
