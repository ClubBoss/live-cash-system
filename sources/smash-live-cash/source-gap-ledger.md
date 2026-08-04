# Smash Live Cash — Source Gap & Reprocessing Ledger

Status: `ACTIVE / TARGETED_RERUN_QUEUE_COMPLETE_EXCEPT_ONE_MEDIA_TAIL`

Last updated: 2026-08-05

## Purpose

Canonical record of transcript reruns, cleanup tasks and visual dependencies. A gap blocks only the stated interval or exact visual claim.

## Remaining targeted media verification

| Issue ID | Source ID | Lesson | Remaining interval | Blocking scope | Priority |
|---|---|---|---|---|---|
| `SGL-0018` | `SLC-M03-L25` | Locked 3-Bet Ranges Part 2 | Original-video verification `24:47.75–25:12` | Nominal terminal tail only; recovered strategy through `24:47.75` is accepted | P1 |

There are no remaining bulk Whisper reruns in the approved targeted queue.

## Canonical ingestion and cleanup backlog

Machine-complete or partially canonical lessons still requiring conservative source-faithful ingestion/terminology cleanup:

- `SLC-M03-L31` through `SLC-M03-L34`.
- `SLC-M05-L43`, `L45–L52`, `L54`, `L55`.
- First approximately 25 minutes of `SLC-M05-L44`; the targeted rerun tail is complete.
- Non-targeted portions of `SLC-M05-L53`; the required exercise interval is complete.
- First approximately 17 minutes of `SLC-M07-L63`; the required final workflow is complete.
- Local non-blocking terminology residuals documented in earlier batch QA files.

These are ingestion/cleanup tasks, not evidence that the accepted targeted reruns failed.

## Visual review backlog

Exact cards, suits, position labels, sizes, combo weights, frequencies and EV remain visual-dependent for lessons marked `NEEDS_VISUAL_REVIEW` in `sources/source-registry.md`.

Visual review should be targeted to claims that may change a final heuristic. It is not necessary to capture every solver cell.

## Transcript package backlog

`NONE` — the first cycle contains an input package for every catalogued lesson. Catalog completeness does not close cleanup, visual review or the one media-tail verification.

## Resolved source issues

| Issue ID | Asset | Resolution |
|---|---|---|
| `SGL-R001` | `SLC-M00-L00` | False Whisper repetition rejected; video-verified transcript retained |
| `SGL-R002` | Missing rake chart export | Scenario recovered in workbook cell `D18` |
| `SGL-R003` | Mislabeled no-rake chart | Mapping corrected using workbook cell `A8` |
| `SGL-R004` | `SLC-M02-L21` | Local repeated phrase removed; surrounding continuity preserved |
| `SGL-R005` | Final first-cycle archive | Previously received duplicate files were byte-identical; canonical files were not overwritten |
| `SGL-0053` | `SLC-M01-L01 Preflop 101` | Seven-part large-v3 rerun plus two tail recoveries restored complete speech through `50:29.70`; final 2.3 seconds confirmed as non-speech |
| `SGL-0055` | `SLC-M02-L14 Turns After Flop Overbet` | Two-part large-v3 rerun restored `10:30–23:53.48`; overlap and terminal transition verified |
| `SGL-0056` | `SLC-M02-L15 Hard Continues from BB` | Three-part rerun restored complete speech through `25:43.19`; overlaps and terminal recovery reconciled |
| `SGL-0003` | `SLC-M05-L42 Coaching Brad Owen Intro` | Main rerun and recoveries restored complete speech through `06:12.10` |
| `SGL-0005` | `SLC-M05-L44 Advanced Postflop Strategy Building Part 2` | Two-part rerun restored targeted tail `25:19.11–38:32.24`; earlier canonical ingestion remains separate |
| `SGL-0020` | `SLC-M03-L27 Exploiting OOP C-Bets` | Two-part rerun and recoveries restored complete main demonstration through `17:17.18` |
| `SGL-0032` | `SLC-M04-L38 Small Bets to Force Over-Folds` | Four-part rerun restored the complete missing middle through `37:14.06` |
| `SGL-0038` | `SLC-M06-L58 Ginge Check-Raise` | Four-part rerun plus terminal recoveries restored complete hand and outro through `29:12.18` |
| `SGL-0046A` | `SLC-M02-L12 Turns vs Capped Ranges` | Rerun restored the missing low-brick comparison `17:15–19:49.62` |
| `SGL-0046B` | `SLC-M02-L12 Turns vs Capped Ranges` | Rerun plus terminal recoveries restored final multi-size section through `30:53.89` |
| `SGL-0045` | `SLC-M02-L11 Turn Barreling IP Part 3` | Three-part rerun plus terminal recoveries restored complete speech through `19:48.64`; overlaps 95.3–96.0% |
| `SGL-0047` | `SLC-M02-L16 Check-Raise Top Pair Part 1` | Main rerun and two recoveries restored complete tail through `19:18.01` |
| `SGL-0049` | `SLC-M02-L18 Leading Turns After Calling` | Bounded rerun bridged the failed transition with context through `15:34.82` |
| `SGL-0052` | `SLC-M02-L22 HJ vs BTN 50-Flop Report` | Rerun restored the complete low-EV board deep-dive tail through exact endpoint `26:05.00` |
| `SGL-0054` | `SLC-M02-L04 Postflop Intro` | Main and recovery restored complete closing framework through `08:15.72` |
| `SGL-0014` | `SLC-M05-L53 Check-Raising Exercise` | Targeted internal interval restored with surrounding context `20:10–22:44.91` |
| `SGL-0027` | `SLC-M07-L63 Build Your Own Stuff` | Main and recovery restored final study workflow through `19:12.81` |

## Targeted rerun protocol retained for future use

1. Preserve original outputs and use separate rerun filenames.
2. Include 20–30 seconds overlap on both sides.
3. Prefer clean 16 kHz mono WAV and force English.
4. Split long intervals into 6–10 minute chunks; reduce to 3–5 minutes if looping returns.
5. Do not pass hallucinated prior text as prompt/context.
6. Save segments JSON, SRT, VTT, timestamped TXT and plain TXT.
7. Never reconstruct cards, actions, sizes, frequencies or EV from expectation.
8. Close an issue only after source continuity is established.
9. Small endpoint deficits may be accepted only when independent outputs and a complete terminal sentence establish non-speech.
10. Endpoint deficits larger than a few seconds require direct media verification.

## Admission rule

Cross-source support may validate a final heuristic, but it never retroactively rewrites a missing Smash Live Cash passage.

## Ledger verdict

`SMASH_TARGETED_RERUN_QUEUE_COMPLETE_EXCEPT_SGL-0018_MEDIA_TAIL`
