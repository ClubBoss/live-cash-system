# Smash Live Cash — Whisper large-v3 Batch QA (2026-08-04)

Status: `BATCH_INDEXED / MODULE_3_TRANCHE_1_PROCESSED / RESIDUALS_TRACKED`

## Evidence package

- Uploaded archive: `Whisper large-v3 transcripts.zip`
- Processing date: 2026-08-04
- Engine: whisper.cpp large-v3
- Language: English forced
- Included formats: segments JSON, SRT, timestamped TXT, plain TXT, VTT
- Included modules: 0, 3, 5, and 7

## Duplicate handling

Module 0 duplicates already processed sources and was ignored. Existing Module 5 lessons 43–46, 48–51, and 53 were not duplicated into new canonical files; their prior QA rows remain authoritative until cleanup is completed.

## Newly received source packages

### Module 3 — Postflop 3-Bet Pots

Received: 24, 25, 26, 27, 28, 29, 31, 32, 33, and 34.  
Still missing from the current transcript sequence: 30 and 35.

### Module 5 — Coaching Brad Owen

Newly received: 42, 47, 52, 54, and 55.

### Module 7 — Going Forward

Newly received: 63.

## ASR integrity findings

| Source ID | Coverage | Finding | Current decision |
|---|---:|---|---|
| `SLC-M03-L24` | 00:00–08:50 | Complete endpoint; ordinary terminology and visual dependencies | Canonical audio-layer transcript and analysis created; `NEEDS_VISUAL_REVIEW` |
| `SLC-M03-L25` | 00:00–25:11 | Catastrophic repeated phrase from approximately 08:54 to the end | Partial transcript created; `RERUN_REQUIRED` |
| `SLC-M03-L26` | 00:00–04:05 | Complete endpoint | Canonical audio-layer transcript and analysis created; `NEEDS_VISUAL_REVIEW` |
| `SLC-M03-L27` | 00:00–17:17 | Repeated phrase dominates approximately 04:00 to the end | Partial transcript created; `RERUN_REQUIRED` |
| `SLC-M03-L28` | 00:00–10:32 | Complete endpoint | Canonical audio-layer transcript and analysis created; `NEEDS_VISUAL_REVIEW` |
| `SLC-M03-L29` | 00:00–18:36 | Complete endpoint; several short local repetitions removed conservatively | Canonical audio-layer transcript and analysis created; `NEEDS_VISUAL_REVIEW` |
| `SLC-M03-L31` | 00:00–28:47 | Complete endpoint; cleanup and visual review pending | `RAW_MACHINE_TRANSCRIPT` |
| `SLC-M03-L32` | 00:00–14:49 | Complete endpoint; cleanup and visual review pending | `RAW_MACHINE_TRANSCRIPT` |
| `SLC-M03-L33` | 00:00–26:46 | Complete endpoint; short local loops around opening and late lead discussion | `CLEANUP_PENDING` |
| `SLC-M03-L34` | 00:00–34:54 | Complete endpoint; short local loops | `CLEANUP_PENDING` |
| `SLC-M05-L42` | 00:00–06:12 | Catastrophic repetition from approximately 00:55 to 05:55 | `RERUN_REQUIRED` |
| `SLC-M05-L47` | 00:00–30:14 | Complete endpoint; hand and visual cleanup pending | `RAW_MACHINE_TRANSCRIPT` |
| `SLC-M05-L52` | 00:00–20:48 | Complete endpoint; hand and visual cleanup pending | `RAW_MACHINE_TRANSCRIPT` |
| `SLC-M05-L54` | 00:00–25:33 | Complete endpoint; one timing gap and low-confidence phrases | `CLEANUP_PENDING` |
| `SLC-M05-L55` | 00:00–04:55 | Complete endpoint | `RAW_MACHINE_TRANSCRIPT` |
| `SLC-M07-L63` | 00:00–19:12 | Repeated aggregate-report sentence dominates the final section from approximately 17:30 | `RERUN_REQUIRED` |

## Module 3 tranche 1 learning result

The processed lessons establish four candidate mechanisms:

1. Against a value-heavy live 3-bet range, dominated big cards lose value faster than pocket pairs and strong low suited connectors.
2. A player who enters the flop too wide but c-bets normally or aggressively fails to compensate for range weakness and can be defended against more widely.
3. A tight player who over-bets overpairs creates a strong flop-bet branch but a weak check-back branch; fold more versus the bet and attack more after check-check.
4. Future bluffs must be seeded preflop and on the flop. Low suited connectors and apparently irrelevant low pairs can be required to support later straight- and flush-completing barrels.

All four remain `CANDIDATE`, not admitted Playbook rules, until the exact solver visuals and cross-source comparison are complete.

## Next processing order

1. Clean and analyse Module 3 lessons 31–34.
2. Process complete Module 5 sources 47, 52, 54, and 55.
3. Targeted reruns: M03-L25, M03-L27, M05-L42, M05-L44, M05-L53, and M07-L63.
4. Await missing M03-L30 and M03-L35 transcript packages.
