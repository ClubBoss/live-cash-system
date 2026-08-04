# Smash Live Cash — Source Gap & Reprocessing Ledger

Status: `ACTIVE / FIRST_CYCLE_CATALOG_COMPLETE`

Last updated: 2026-08-04

## Purpose

Canonical record of transcript reruns, cleanup tasks and visual dependencies. A gap blocks only the stated interval or exact visual claim.

## Targeted rerun queue

| Issue ID | Source ID | Lesson | Rerun interval | Blocking scope | Priority |
|---|---|---|---|---|---|
| `SGL-0003` | `SLC-M05-L42` | Coaching Brad Owen Intro | `00:30–06:15` | Most of lesson | P0 |
| `SGL-0005` | `SLC-M05-L44` | Advanced Postflop Strategy Building Part 2 | `25:45–38:33` | Final 12 minutes | P0 |
| `SGL-0014` | `SLC-M05-L53` | Check-Raising Exercise | `20:40–22:15` | Exercise interval | P0 |
| `SGL-0018` | `SLC-M03-L25` | Locked 3-Bet Ranges Part 2 | `08:25–25:12` | Final 16 minutes | P0 |
| `SGL-0020` | `SLC-M03-L27` | Exploiting OOP C-Bets | `03:30–17:18` | Main demonstration | P0 |
| `SGL-0027` | `SLC-M07-L63` | Build Your Own Stuff | `17:00–19:13` | Final workflow section | P0 |
| `SGL-0032` | `SLC-M04-L38` | Small Bets to Force Over-Folds | `07:40–36:45` | Central 28 minutes | P0 |
| `SGL-0038` | `SLC-M06-L58` | Ginge Check-Raise | `01:00–29:13` | Almost entire hand | P0 |
| `SGL-0045` | `SLC-M02-L11` | Turn Barreling IP Part 3 | `03:55–19:49` | Most of lesson | P0 |
| `SGL-0046A` | `SLC-M02-L12` | Turns vs Capped Ranges | `17:15–19:20` | Middle comparison | P0 |
| `SGL-0046B` | `SLC-M02-L12` | Turns vs Capped Ranges | `23:50–30:55` | Final section | P0 |
| `SGL-0047` | `SLC-M02-L16` | Check-Raise Top Pair Part 1 | `15:10–19:19` | Final comparison | P0 |
| `SGL-0049` | `SLC-M02-L18` | Leading Turns After Calling | `13:00–15:05` | Transition interval | P1 |
| `SGL-0052` | `SLC-M02-L22` | HJ vs BTN 50-Flop Report | `18:35–26:05` | Low-board deep dives | P0 |
| `SGL-0053` | `SLC-M01-L01` | Preflop 101 | `00:30–50:32 in 6–10 min chunks` | Almost entire lesson | P0 |
| `SGL-0054` | `SLC-M02-L04` | Postflop Intro | `05:40–08:17` | Intro conclusion | P0 |
| `SGL-0055` | `SLC-M02-L14` | Turns After Flop Overbet | `11:00–23:54 in two chunks` | Second half | P0 |
| `SGL-0056` | `SLC-M02-L15` | Hard Continues from BB | `07:55–25:44 in three chunks` | Most examples and conclusion | P0 |

## Cleanup backlog

Machine-complete lessons that still need conservative terminology cleanup before canonical analysis:

- `SLC-M03-L31` through `SLC-M03-L34`.
- `SLC-M05-L43`, `L45–L52`, `L54`, `L55`.
- Local non-blocking cleanup residuals remain documented in batch QA files.

## Visual review backlog

Exact cards, suits, position labels, sizes, combo weights, frequencies and EV remain visual-dependent for lessons marked `NEEDS_VISUAL_REVIEW` in `sources/source-registry.md`. Visual review should be targeted to claims that may change a final heuristic; it is not necessary to screenshot every solver cell.

## Transcript package backlog

`NONE` — the first cycle now contains an input package for every catalogued lesson. Catalog completeness does not close the rerun or visual backlog.

## Resolved source issues

| Issue ID | Asset | Resolution |
|---|---|---|
| `SGL-R001` | `SLC-M00-L00` | False Whisper repetition rejected; video-verified transcript retained |
| `SGL-R002` | Missing rake chart export | Scenario recovered in workbook cell `D18` |
| `SGL-R003` | Mislabeled no-rake chart | Mapping corrected using workbook cell `A8` |
| `SGL-R004` | `SLC-M02-L21` | Local repeated phrase removed; surrounding continuity preserved |
| `SGL-R005` | Final first-cycle archive | All previously received duplicate files were byte-identical; canonical files were not overwritten |

## Targeted rerun protocol

1. Preserve original outputs and use separate rerun filenames.
2. Include 20–30 seconds overlap on both sides.
3. Prefer clean 16 kHz mono WAV and force English.
4. Split long intervals into 6–10 minute chunks; reduce to 3–5 minutes if looping returns.
5. Do not pass hallucinated prior text as prompt/context.
6. Save segments JSON, SRT, VTT, timestamped TXT and plain TXT.
7. Never reconstruct cards, actions, sizes, frequencies or EV from expectation.
8. Close an issue only after source continuity is established.

## Admission rule

Cross-source support may validate a final heuristic, but it never retroactively rewrites a missing Smash Live Cash passage.
