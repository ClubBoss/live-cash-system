# Rerun Checkpoint 04 — Multi-Source QA

Date: 2026-08-04  
Status: `CHECKPOINT_ACCEPTED / SEVEN_ISSUES_CLOSED / ONE_NARROW_RESIDUAL`

## Package

- Uploaded archive: `reruns(3).zip`
- Archive size: 1,807,557 bytes
- SHA-256: `ce01d510277b2e17620c8a14741be50ef76ac8625ab0057ebbbab89cca714d2e`
- Engine: faster-whisper
- Model: large-v3
- Language: English forced
- Translation: disabled

The archive contains prior accepted outputs for `SLC-M01-L01`, `SLC-M02-L14` and `SLC-M02-L15`. Those files were treated as duplicates and were not re-integrated.

New material covers seven lessons and eight issue IDs:

- `SGL-0032` — `SLC-M04-L38`;
- `SGL-0038` — `SLC-M06-L58`;
- `SGL-0018` — `SLC-M03-L25`;
- `SGL-0020` — `SLC-M03-L27`;
- `SGL-0005` — `SLC-M05-L44`;
- `SGL-0003` — `SLC-M05-L42`;
- `SGL-0046A` and `SGL-0046B` — `SLC-M02-L12`.

# 1. SGL-0032 — SLC-M04-L38 Small Bets to Force Over-Folds

## Received coverage

| Part | Requested | Actual final timestamp | Supplied status |
|---|---:|---:|---|
| 1 | `07:40–15:00` | `15:29.97` | PASS |
| 2 | `14:30–22:00` | `22:29.56` | PASS |
| 3 | `21:30–29:00` | `29:29.77` | PASS |
| 4 | `28:30–36:45` | `37:14.06` | PASS |

Independent adjacent overlap agreement:

- part 1 → 2: 90.9%;
- part 2 → 3: 97.0%;
- part 3 → 4: 96.1%.

The restored interval overlaps the previously usable source on both sides and recovers the complete middle solver discussion without loops or semantic branch changes.

Verdict: `SGL-0032 — CLOSED / AUDIO_COMPLETE / VISUAL_REVIEW_REMAINS`.

# 2. SGL-0038 — SLC-M06-L58 Ginge Check-Raise

## Received coverage

| Part | Requested | Actual final timestamp | Supplied status |
|---|---:|---:|---|
| 1 | `01:00–08:00` | `08:29.24` | PASS |
| 2 | `07:30–14:30` | `14:59.84` | PASS |
| 3 | `14:00–21:00` | `21:29.53` | PASS |
| 4 | `20:30–29:13` | `29:12.18` | COVERAGE_SHORT |

Three terminal recoveries were supplied.

Independent agreement:

- part 1 → 2: 93.7%;
- part 2 → 3: 95.3%;
- part 3 → 4: 92.6%;
- main part 4 versus recoveries: 97.1–99.6%.

The final audio contains a complete lesson conclusion and spoken outro. The missing 0.82 seconds contain no additional speech.

Verdict: `SGL-0038 — CLOSED / AUDIO_COMPLETE / VISUAL_REVIEW_REMAINS`.

# 3. SGL-0018 — SLC-M03-L25 Locked 3-Bet Ranges Part 2

## Received coverage

| Part | Requested | Actual final timestamp | Supplied status |
|---|---:|---:|---|
| 1 | `08:25–14:30` | `14:59.86` | PASS |
| 2 | `14:00–20:00` | `20:29.28` | PASS |
| 3 | `19:30–25:12` | `24:47.75` | COVERAGE_SHORT |

Independent agreement:

- part 1 → 2: 90.7%;
- part 2 → 3: 93.5%;
- main part 3 versus recoveries: 97.2–99.0%.

The rerun restores a coherent strategic discussion through 24:47.75. Both the main chunk and terminal recovery stop at the same phrase.

However, the nominal video duration is 25:12, leaving approximately 24.25 seconds unverified. This is materially longer than the prior accepted trailing-silence cases. Transcript agreement alone cannot establish that the entire nominal tail contains no speech.

Accepted now:

- all recovered strategic content through 24:47.75;
- source analysis of the over-wide, value-heavy and double-exploit profiles.

Still required:

- direct original-video inspection or verified audio extraction for `24:47.75–25:12`.

Verdict: `SGL-0018 — PARTIAL / RECOVERED_CONTENT_ACCEPTED / NOMINAL_TAIL_REMAINS_OPEN`.

# 4. SGL-0020 — SLC-M03-L27 Exploiting OOP C-Bets

## Received coverage

| Part | Requested | Actual final timestamp | Supplied status |
|---|---:|---:|---|
| 1 | `03:30–10:30` | `10:59.18` | PASS |
| 2 | `10:00–17:18` | `17:17.18` | COVERAGE_SHORT |

Independent agreement:

- part 1 → 2: 96.4%;
- main part 2 versus recoveries: 98.1–99.6%.

The final sentence is complete and summarises the exploit. The remaining 0.82 seconds contain no additional strategic speech.

Verdict: `SGL-0020 — CLOSED / AUDIO_COMPLETE / VISUAL_REVIEW_REMAINS`.

# 5. SGL-0005 — SLC-M05-L44 Advanced Postflop Strategy Building Part 2

## Received coverage

| Part | Requested | Actual final timestamp | Supplied status |
|---|---:|---:|---|
| 1 | `25:45–32:30` | `32:59.84` | PASS |
| 2 | `32:00–38:33` | `38:32.24` | COVERAGE_SHORT |

Independent agreement:

- part 1 → 2: 96.3%;
- main part 2 versus recoveries: 96.4–100%.

The tail discussion ends with a completed exchange about river bluff candidates and missed-draw blockers. The remaining 0.76 seconds contain no additional speech.

The rerun issue is closed, but the first approximately 25 minutes still require canonical ingestion from the first-cycle machine package.

Verdict: `SGL-0005 — CLOSED / TARGETED_TAIL_AUDIO_COMPLETE / EARLIER_CANONICAL_INGESTION_PENDING`.

# 6. SGL-0003 — SLC-M05-L42 Coaching Brad Owen Intro

## Received coverage

- Main rerun speech: `00:00.08–06:12.10`.
- Recovery agreement: 96.6–98.0%.

The final paragraph is complete and states the full course methodology. The remaining approximately 2.9 seconds contain no additional speech.

Verdict: `SGL-0003 — CLOSED / AUDIO_VERIFIED`.

# 7. SGL-0046A and SGL-0046B — SLC-M02-L12 Turns vs Capped Ranges

## Received coverage

| Issue | Requested | Actual final timestamp | Supplied status |
|---|---:|---:|---|
| SGL-0046A | `17:15–19:20` | `19:49.62` | PASS |
| SGL-0046B | `23:50–30:55` | `30:53.89` | COVERAGE_SHORT |

The two intervals are separate source gaps rather than adjacent chunks. Each includes sufficient surrounding context for reconciliation with the original usable sections.

Terminal recovery agreement for the final interval:

- recovery 1: 98.4%;
- recovery 2: 98.1%.

The final sentence is a complete lesson summary. The remaining 1.11 seconds contain no additional speech.

Verdicts:

- `SGL-0046A — CLOSED / AUDIO_COMPLETE`;
- `SGL-0046B — CLOSED / AUDIO_COMPLETE`.

Exact turn-card matrices remain visual-dependent.

# Package-Level Integrity

Across all new chunks:

- no repeated loops were detected;
- no empty or marker-only segment chains were found;
- every required file family was present: JSON, SRT, VTT, timestamped TXT and plain TXT;
- adjacent overlaps preserved speaker and strategic continuity;
- ordinary ASR duplication within a few passages was removed only when the adjacent sequence was clearly repeated;
- cards, suits, sizes and frequencies were not reconstructed where audio or visuals were ambiguous.

# Final Verdict

`RERUN_CHECKPOINT_04_ACCEPTED`

Closed issue IDs:

- `SGL-0003`;
- `SGL-0005`;
- `SGL-0020`;
- `SGL-0032`;
- `SGL-0038`;
- `SGL-0046A`;
- `SGL-0046B`.

Narrow residual:

- `SGL-0018` — verify original-video interval `24:47.75–25:12`.
