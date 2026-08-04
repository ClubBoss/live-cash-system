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
| `SGL-0003` | `SLC-M05-L42` | Coaching Brad Owen Intro | Catastrophic ASR repetition loop | Approximately `00:55–05:55` | P0 | `RERUN_REQUIRED` | Most of the six-minute lesson | Retranscribe approximately `00:30–06:15`; split into smaller chunks if the repeated phrase returns |
| `SGL-0004` | `SLC-M05-L43` | Advanced Postflop Strategy Building Part 1 | Local ASR loops | Around `03:23` and `07:52–07:59` | P2 | `CLEANUP_PENDING` | Only the affected sentences | Clean against neighbouring segments; rerun only if continuity cannot be reconstructed safely |
| `SGL-0005` | `SLC-M05-L44` | Advanced Postflop Strategy Building Part 2 | Catastrophic ASR repetition loop | `26:12–38:32` | P0 | `RERUN_REQUIRED` | Final 12 minutes 20 seconds and canonical completion of the lesson | Retranscribe from approximately `25:45` to the end with overlap; split the interval into smaller chunks if the loop repeats |
| `SGL-0006` | `SLC-M05-L45` | Advanced Postflop Strategy Building Part 3 | Low-confidence poker terminology | Scattered; no long missing interval detected | P2 | `CLEANUP_PENDING` | Exact wording of isolated poker terms | Perform conservative terminology cleanup; mark unresolved cards, sizes, positions, or frequencies rather than guessing |
| `SGL-0007` | `SLC-M05-L46` | 88 Check-Raise on 7-6-6 | Visual hand/solver evidence missing | Whole hand review | P1 | `VISUAL_REVIEW_PENDING` | Blocks exact board suits, ranges, action frequencies, and solver outputs | Obtain video/screenshots for the hand and solver nodes after the audio transcript is cleaned |
| `SGL-0008` | `SLC-M05-L47` | Multiway QTo Bluff | Newly received machine transcript requires cleanup and visual reconciliation | Whole lesson; complete endpoint `30:14` | P1 | `CLEANUP_PENDING` | Exact hand history, suits, action sizes and solver conclusions | Clean the transcript, preserve unclear hand details, then obtain the relevant hand/solver visuals |
| `SGL-0009` | `SLC-M05-L48` | Q4 Bluff Review | Minor repeated wording | Around `20:54` | P2 | `CLEANUP_PENDING` | Local sentence only | Remove the duplicate after confirming continuous meaning from adjacent segments |
| `SGL-0010` | `SLC-M05-L49` | Squeezing with QQ | Isolated low-confidence phrase | Around `05:28` | P2 | `CLEANUP_PENDING` | One local statement | Compare tokens and neighbouring context; rerun a short interval only if the action or sizing remains ambiguous |
| `SGL-0011` | `SLC-M05-L50` | 4-Betting A5s | Brief hallucinated loop | Around `14:41–14:43` | P2 | `CLEANUP_PENDING` | Local sentence only | Delete the duplicated loop if continuity is preserved; otherwise rerun with 20–30 seconds of overlap |
| `SGL-0012` | `SLC-M05-L51` | 3-Betting KT in CO vs MP Open | Repeated phrase and repeated ending | Around `19:09–19:26` and final section | P2 | `CLEANUP_PENDING` | Affected local passages | Deduplicate conservatively and confirm that no unique statement is lost |
| `SGL-0013` | `SLC-M05-L52` | QQ in HJ in 4-Bet Pot OOP | Newly received machine transcript requires cleanup and visual reconciliation | Whole lesson; complete endpoint `20:48` | P1 | `CLEANUP_PENDING` | Exact hand history, board suits, sizes and solver outputs | Clean the transcript and obtain the corresponding hand/solver visuals |
| `SGL-0014` | `SLC-M05-L53` | Check-Raising Exercise with Nick | Unrecovered audio-transcription gap caused by ASR loop | Approximately `21:07–21:50` | P0 | `RERUN_REQUIRED` | Forty-three-second exercise interval and full audio verification | Retranscribe approximately `20:40–22:15`; compare with the existing output and preserve the old raw files |
| `SGL-0015` | `SLC-M05-L54` | Bet-Sizing | Timing gap and low-confidence machine phrases | Gap approximately `19:49–20:01`; scattered low-confidence phrases | P1 | `CLEANUP_PENDING` | One interval plus exact sizing/hand statements | Clean the complete transcript; rerun the gap only if neighbouring context cannot recover continuity; verify visuals |
| `SGL-0016` | `SLC-M05-L55` | Brad's Takeaways | Newly received machine transcript requires cleanup | Whole lesson; complete endpoint `04:55` | P2 | `CLEANUP_PENDING` | Exact final wording only | Perform conservative cleanup; no rerun unless a material gap is found |
| `SGL-0017` | `SLC-M03-L24` | Preflop Adjustments vs Locked 3-Bet Ranges Part 1 | Visual evidence missing | Charts and solver demonstrations throughout `00:00–08:50` | P1 | `VISUAL_REVIEW_PENDING` | Exact range weights, EV values, 4-bet mixes and the 98s boundary | Obtain targeted screenshots/video and reconcile the listed uncertainties |
| `SGL-0018` | `SLC-M03-L25` | Preflop Adjustments vs Locked 3-Bet Ranges Part 2 | Catastrophic ASR repetition loop | Approximately `08:54–25:11` | P0 | `RERUN_REQUIRED` | Final 16 minutes 17 seconds and canonical completion | Retranscribe approximately `08:25–25:12` with overlap; split into smaller chunks if needed |
| `SGL-0019` | `SLC-M03-L26` | Preflop Adjustments vs Locked 3-Bet Ranges Part 3 | Visual evidence missing | Solver demonstrations throughout `00:00–04:05` | P1 | `VISUAL_REVIEW_PENDING` | Exact board, range weights, sizes, frequencies and call-down boundaries | Obtain the original video or targeted screenshots |
| `SGL-0020` | `SLC-M03-L27` | Exploiting OOP C-Bet Strategies in 3-Bet Pots | Catastrophic ASR repetition loop | Approximately `04:00–17:17` | P0 | `RERUN_REQUIRED` | The lesson's main exploit demonstration and canonical completion | Retranscribe approximately `03:30–17:18` with overlap and smaller chunks |
| `SGL-0021` | `SLC-M03-L28` | Vs Tight-Aggressive Players in 3-Bet Pots | Visual evidence missing | Solver demonstrations throughout `00:00–10:32` | P1 | `VISUAL_REVIEW_PENDING` | Exact low board, positions, frequencies and turn-leading thresholds | Obtain video/screenshots and verify the branch-specific solver outputs |
| `SGL-0022` | `SLC-M03-L29` | Barreling Heuristics on Ace-High Board Part 1 | Visual evidence missing | Solver demonstrations throughout `00:00–18:36` | P1 | `VISUAL_REVIEW_PENDING` | Exact suits, sizes, hand frequencies and runout-specific bluff selections | Obtain video/screenshots for the principal flop, turn and river nodes |
| `SGL-0023` | `SLC-M03-L31` | Playing a Scary Flop After Squeezing | Machine transcript cleanup and visual review pending | Whole lesson; complete endpoint `28:47` | P1 | `CLEANUP_PENDING` | Exact hand, board, range locks and solver outputs | Clean terminology and repetitions, then reconcile the solver visuals |
| `SGL-0024` | `SLC-M03-L32` | When the 3-Bettor is IP (CO vs HJ) | Machine transcript cleanup and visual review pending | Whole lesson; complete endpoint `14:49` | P1 | `CLEANUP_PENDING` | Exact board, positions, sizes and frequencies | Clean the transcript and obtain the relevant solver screens |
| `SGL-0025` | `SLC-M03-L33` | Exploitative Lines on Low Equity Boards Part 1 | Local ASR loops and visual dependency | Opening repeated phrase and late repeated lead phrase; complete endpoint `26:46` | P2 | `CLEANUP_PENDING` | Affected local passages and exact solver branches | Deduplicate against adjacent segments, then verify visuals |
| `SGL-0026` | `SLC-M03-L34` | Exploitative Lines on Low Equity Boards Part 2 | Local ASR loops and visual dependency | Short repeated phrases in opening and later sections; complete endpoint `34:54` | P2 | `CLEANUP_PENDING` | Affected local passages and exact solver branches | Deduplicate conservatively, then verify visuals |
| `SGL-0027` | `SLC-M07-L63` | How To Build Your Own Stuff Going Forward | Catastrophic repeated aggregate-report sentence | Approximately `17:30–19:12` | P0 | `RERUN_REQUIRED` | Final study-workflow section and canonical completion | Retranscribe approximately `17:00–19:13` with overlap; split into smaller chunks |
| `SGL-0028` | `SLC-M03-L30` | Adjusting vs Bluff-Deficient Ranges Part 2 | Transcript package not received | Whole lesson | P1 | `MISSING_INPUT` | Lesson unavailable for analysis | Run Whisper and provide segments JSON plus a readable timestamped output |
| `SGL-0029` | `SLC-M03-L35` | Exploitative Lines on Low Equity Boards Part 3 | Transcript package not received | Whole lesson | P1 | `MISSING_INPUT` | Lesson unavailable for analysis | Run Whisper and provide segments JSON plus a readable timestamped output |

## Transcript-package backlog

The audio sources are catalogued, but transcript packages for the following ranges have not yet been received in the current ingestion sequence.

| Module | Source range | Current state |
|---|---|---|
| Module 1 — Preflop | `SLC-M01-L01` through `SLC-M01-L03` | `TRANSCRIPT_PACKAGE_NOT_RECEIVED` |
| Module 2 — Single-Raised Pots | `SLC-M02-L04` through `SLC-M02-L23` | `TRANSCRIPT_PACKAGE_NOT_RECEIVED` |
| Module 3 — 3-Bet Pots | `SLC-M03-L30`, `SLC-M03-L35` | `PARTIAL_MODULE_PACKAGE_RECEIVED` |
| Module 4 — Multiway Pots | `SLC-M04-L36` through `SLC-M04-L41` | `TRANSCRIPT_PACKAGE_NOT_RECEIVED` |
| Module 6 — Play & Explains | `SLC-M06-L56` through `SLC-M06-L62` | `TRANSCRIPT_PACKAGE_NOT_RECEIVED` |

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
