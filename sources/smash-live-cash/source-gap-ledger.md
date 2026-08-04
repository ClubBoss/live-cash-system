# Smash Live Cash — Source Gap & Reprocessing Ledger

Status: `ACTIVE`

Last updated: 2026-08-04

## Purpose

This is the canonical ledger for missing transcription packages, ASR defects, unrecovered audio intervals, visual dependencies, and source-asset anomalies.

The ledger prevents four failure modes:

1. silently treating incomplete machine text as a complete source;
2. repeatedly investigating an issue that was already resolved;
3. forgetting exact intervals that need a targeted rerun or screenshot;
4. allowing a local source gap to block unrelated course processing.

Every newly received batch must be checked against this ledger. Existing rows are updated; they are not deleted.

## Status vocabulary

- `MISSING_INPUT` — required transcript, video, screenshot, or source file has not been received.
- `CLEANUP_PENDING` — machine transcript is substantially complete and can probably be repaired without rerunning the source.
- `RERUN_REQUIRED` — an interval is unusable and must be transcribed again.
- `VISUAL_REVIEW_PENDING` — audio is usable, but exact strategically relevant screen information is not verified.
- `RESOLVED` — the defect was closed with sufficient evidence.
- `ACCEPTED_RESIDUAL` — the gap is documented and does not justify further work unless it becomes strategically material.

## Priority vocabulary

- `P0` — blocks canonical completion of the lesson or a material interval.
- `P1` — blocks an important claim, hand, or exercise but not the entire surrounding lesson.
- `P2` — precision or cleanup issue; downstream concept extraction may continue conservatively.
- `P3` — archival or provenance issue with no current strategic impact.

## Open issue ledger

| Issue ID | Source ID | Lesson / asset | Issue type | Exact interval or scope | Priority | Status | Blocking scope | Required action |
|---|---|---|---|---|---|---|---|---|
| `SGL-0001` | `SLC-M00-L01` | Intro to Node Locking | Visual evidence missing | Solver demonstrations throughout `00:00–12:31` | P2 | `VISUAL_REVIEW_PENDING` | Blocks exact board suits, stack, ranges, pot, sizes, selected combinations, frequencies, and EV; does not block the node-locking method | Obtain the original video or targeted screenshots and verify only strategically relevant screens |
| `SGL-0002` | `SLC-M00-L02` | Intro to PioSolver | Visual evidence missing | Solver and spreadsheet demonstrations throughout `00:00–26:05` | P2 | `VISUAL_REVIEW_PENDING` | Blocks exact setup tree, color legends, hovered hand frequencies, board/runout labels, and spreadsheet columns; does not block the study-method concepts | Obtain the original video or targeted screenshots and reconcile the listed visual uncertainties |
| `SGL-0003` | `SLC-M05-L42` | Coaching Brad Owen Intro | Transcript package not received | Whole lesson | P1 | `MISSING_INPUT` | Lesson unavailable for analysis | Run Whisper and provide segments JSON plus a readable timestamped output |
| `SGL-0004` | `SLC-M05-L43` | Advanced Postflop Strategy Building Part 1 | Local ASR loops | Around `03:23` and `07:52–07:59` | P2 | `CLEANUP_PENDING` | Only the affected sentences | Clean against neighbouring segments; rerun only if continuity cannot be reconstructed safely |
| `SGL-0005` | `SLC-M05-L44` | Advanced Postflop Strategy Building Part 2 | Catastrophic ASR repetition loop | `26:12–38:32` | P0 | `RERUN_REQUIRED` | Final 12 minutes 20 seconds and canonical completion of the lesson | Retranscribe from approximately `25:45` to the end with overlap; split the interval into smaller chunks if the loop repeats |
| `SGL-0006` | `SLC-M05-L45` | Advanced Postflop Strategy Building Part 3 | Low-confidence poker terminology | Scattered; no long missing interval detected | P2 | `CLEANUP_PENDING` | Exact wording of isolated poker terms | Perform conservative terminology cleanup; mark unresolved cards, sizes, positions, or frequencies rather than guessing |
| `SGL-0007` | `SLC-M05-L46` | 88 Check-Raise on 7-6-6 | Visual hand/solver evidence missing | Whole hand review | P1 | `VISUAL_REVIEW_PENDING` | Blocks exact board suits, ranges, action frequencies, and solver outputs | Obtain video/screenshots for the hand and solver nodes after the audio transcript is cleaned |
| `SGL-0008` | `SLC-M05-L47` | Multiway QTo Bluff | Transcript package not received | Whole lesson | P1 | `MISSING_INPUT` | Lesson unavailable for analysis | Run Whisper and provide segments JSON plus readable timestamped output |
| `SGL-0009` | `SLC-M05-L48` | Q4 Bluff Review | Minor repeated wording | Around `20:54` | P2 | `CLEANUP_PENDING` | Local sentence only | Remove the duplicate after confirming continuous meaning from adjacent segments |
| `SGL-0010` | `SLC-M05-L49` | Squeezing with QQ | Isolated low-confidence phrase | Around `05:28` | P2 | `CLEANUP_PENDING` | One local statement | Compare tokens and neighbouring context; rerun a short interval only if the action or sizing remains ambiguous |
| `SGL-0011` | `SLC-M05-L50` | 4-Betting A5s | Brief hallucinated loop | Around `14:41–14:43` | P2 | `CLEANUP_PENDING` | Local sentence only | Delete the duplicated loop if continuity is preserved; otherwise rerun with 20–30 seconds of overlap |
| `SGL-0012` | `SLC-M05-L51` | 3-Betting KT in CO vs MP Open | Repeated phrase and repeated ending | Around `19:09–19:26` and final section | P2 | `CLEANUP_PENDING` | Affected local passages | Deduplicate conservatively and confirm that no unique statement is lost |
| `SGL-0013` | `SLC-M05-L52` | QQ in HJ in 4-Bet Pot OOP | Transcript package not received | Whole lesson | P1 | `MISSING_INPUT` | Lesson unavailable for analysis | Run Whisper and provide segments JSON plus readable timestamped output |
| `SGL-0014` | `SLC-M05-L53` | Check-Raising Exercise with Nick | Unrecovered audio-transcription gap caused by ASR loop | Approximately `21:07–21:50` | P0 | `RERUN_REQUIRED` | Forty-three-second exercise interval and full audio verification | Retranscribe approximately `20:40–22:15`; compare with the existing output and preserve the old raw files |
| `SGL-0015` | `SLC-M05-L54` | Bet-Sizing | Transcript package not received | Whole lesson | P1 | `MISSING_INPUT` | Lesson unavailable for analysis | Run Whisper and provide segments JSON plus readable timestamped output |
| `SGL-0016` | `SLC-M05-L55` | Brad's Takeaways | Transcript package not received | Whole lesson | P1 | `MISSING_INPUT` | Lesson unavailable for analysis | Run Whisper and provide segments JSON plus readable timestamped output |

## Transcript-package backlog

The audio sources are catalogued, but transcript packages for the following ranges have not yet been received in the current ingestion sequence.

| Module | Source range | Current state |
|---|---|---|
| Module 1 — Preflop | `SLC-M01-L01` through `SLC-M01-L03` | `TRANSCRIPT_PACKAGE_NOT_RECEIVED` |
| Module 2 — Single-Raised Pots | `SLC-M02-L04` through `SLC-M02-L23` | `TRANSCRIPT_PACKAGE_NOT_RECEIVED` |
| Module 3 — 3-Bet Pots | `SLC-M03-L24` through `SLC-M03-L35` | `TRANSCRIPT_PACKAGE_NOT_RECEIVED` |
| Module 4 — Multiway Pots | `SLC-M04-L36` through `SLC-M04-L41` | `TRANSCRIPT_PACKAGE_NOT_RECEIVED` |
| Module 6 — Play & Explains | `SLC-M06-L56` through `SLC-M06-L62` | `TRANSCRIPT_PACKAGE_NOT_RECEIVED` |
| Module 7 — Going Forward | `SLC-M07-L63` | `TRANSCRIPT_PACKAGE_NOT_RECEIVED` |

The backlog is an inventory state, not a quality failure. As partial archives arrive, the corresponding ranges must be narrowed and any defects added as individual `SGL-*` rows.

## Resolved issue ledger

| Issue ID | Source ID / asset | Resolved defect | Resolution | Rerun needed |
|---|---|---|---|---|
| `SGL-R001` | `SLC-M00-L00` | Whisper inserted a false repeated phrase near `03:54` | Rejected the machine repetition and retained the independently video-verified canonical transcript | No |
| `SGL-R002` | Preflop rake extension asset | Standalone export missing for `RAKE\|SQUEEZE_2_CALLERS\|100BB\|ANTE\|SB\|HJ+CO+BTN` | Scenario recovered and verified in `Mastersheet Cash Extension RAKE.xlsx`, sheet `SQZ 2callers 100bb`, cell `D18` | No |
| `SGL-R003` | Preflop no-rake extension asset | Standalone image labelled `SB vs EP+MP+BTN` was actually `SB vs EP+HJ+BTN` | Canonical mapping corrected using workbook cell `A8` and image comparison | No |

## Targeted rerun protocol

When an issue is marked `RERUN_REQUIRED`:

1. Preserve the original raw outputs; never overwrite the evidence package.
2. Extract or transcribe the affected interval with at least 20–30 seconds of overlap on both sides.
3. Prefer clean 16 kHz mono WAV input for the retry.
4. Use Whisper large-v3 with English forced and translation disabled.
5. If the model loops again, split the interval into smaller chunks and retry without carrying prior generated text across the boundary.
6. Compare the retry with the original transcript and surrounding context.
7. Do not reconstruct cards, suits, positions, actions, sizings, frequencies, or EV from semantic expectation alone.
8. Close the issue only after continuity and source fidelity are established; otherwise retain an explicit `[AUDIO TRANSCRIPTION GAP]`.

## Admission rule

An open issue blocks only the scope stated in its row.

- A missing visual frequency does not invalidate an audio-supported concept.
- A local ASR loop does not invalidate the rest of a complete lesson.
- A catastrophic missing interval prevents the lesson from being called fully audio-verified.
- Cross-source support from Carrot Poker or From the Ground Up may support a final heuristic, but it does not retroactively fill or rewrite a missing Smash Live Cash source passage.
