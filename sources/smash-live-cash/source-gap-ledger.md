# Smash Live Cash — Source Gap & Reprocessing Ledger

Status: `ACTIVE`

Last updated: 2026-08-04

## Purpose

Canonical record of missing transcript intervals, cleanup tasks, visual dependencies and resolved source anomalies. An issue blocks only the scope stated in its row.

## Status vocabulary

- `MISSING_INPUT`
- `CLEANUP_PENDING`
- `RERUN_REQUIRED`
- `VISUAL_REVIEW_PENDING`
- `RESOLVED`
- `ACCEPTED_RESIDUAL`

## Open issue ledger

| Issue ID | Source ID | Lesson / asset | Issue type | Exact interval or scope | Priority | Status | Blocking scope | Required action |
|---|---|---|---|---|---|---|---|---|
| `SGL-0001` | `SLC-M00-L01` | Intro to Node Locking | Visual evidence missing | `00:00–12:31` | P2 | `VISUAL_REVIEW_PENDING` | Exact solver setup and frequencies | Targeted video/screenshots |
| `SGL-0002` | `SLC-M00-L02` | Intro to PioSolver | Visual evidence missing | `00:00–26:05` | P2 | `VISUAL_REVIEW_PENDING` | Exact setup, colors, hand frequencies and report columns | Targeted video/screenshots |
| `SGL-0003` | `SLC-M05-L42` | Coaching Brad Owen Intro | Catastrophic ASR loop | `00:55–05:55` | P0 | `RERUN_REQUIRED` | Most of lesson | Rerun `00:30–06:15` in smaller chunks |
| `SGL-0004` | `SLC-M05-L43` | Advanced Postflop Strategy Building Part 1 | Local ASR loops | `03:23`, `07:52–07:59` | P2 | `CLEANUP_PENDING` | Local sentences | Conservative cleanup; rerun only if continuity fails |
| `SGL-0005` | `SLC-M05-L44` | Advanced Postflop Strategy Building Part 2 | Catastrophic ASR loop | `26:12–38:32` | P0 | `RERUN_REQUIRED` | Final 12:20 | Rerun `25:45–end` |
| `SGL-0006` | `SLC-M05-L45` | Advanced Postflop Strategy Building Part 3 | Low-confidence terms | Scattered | P2 | `CLEANUP_PENDING` | Isolated wording | Conservative cleanup |
| `SGL-0007` | `SLC-M05-L46` | 88 Check-Raise on 7-6-6 | Visual evidence missing | Whole hand | P1 | `VISUAL_REVIEW_PENDING` | Board, ranges, frequencies and EV | Obtain video/screenshots |
| `SGL-0008` | `SLC-M05-L47` | Multiway QTo Bluff | Cleanup and visual reconciliation | Whole lesson | P1 | `CLEANUP_PENDING` | Exact hand and solver conclusions | Clean, then verify visuals |
| `SGL-0009` | `SLC-M05-L48` | Q4 Bluff Review | Repeated wording | Around `20:54` | P2 | `CLEANUP_PENDING` | Local sentence | Deduplicate |
| `SGL-0010` | `SLC-M05-L49` | Squeezing with QQ | Low-confidence phrase | Around `05:28` | P2 | `CLEANUP_PENDING` | One statement | Compare context; short rerun only if needed |
| `SGL-0011` | `SLC-M05-L50` | 4-Betting A5s | Brief ASR loop | `14:41–14:43` | P2 | `CLEANUP_PENDING` | Local sentence | Deduplicate |
| `SGL-0012` | `SLC-M05-L51` | 3-Betting KT in CO vs MP | Repeated phrase and ending | `19:09–19:26`, ending | P2 | `CLEANUP_PENDING` | Local passages | Deduplicate |
| `SGL-0013` | `SLC-M05-L52` | QQ in HJ in 4-Bet Pot OOP | Cleanup and visual reconciliation | Whole lesson | P1 | `CLEANUP_PENDING` | Exact hand and solver output | Clean, then verify visuals |
| `SGL-0014` | `SLC-M05-L53` | Check-Raising Exercise | Unrecovered ASR gap | `21:07–21:50` | P0 | `RERUN_REQUIRED` | Exercise interval | Rerun `20:40–22:15` |
| `SGL-0015` | `SLC-M05-L54` | Bet-Sizing | Timing gap / low confidence | `19:49–20:01`, scattered | P1 | `CLEANUP_PENDING` | One interval and exact statements | Clean; rerun gap if needed |
| `SGL-0016` | `SLC-M05-L55` | Brad's Takeaways | Cleanup pending | Whole lesson | P2 | `CLEANUP_PENDING` | Exact wording | Conservative cleanup |
| `SGL-0017` | `SLC-M03-L24` | Locked 3-Bet Ranges Part 1 | Visual evidence missing | Whole lesson | P1 | `VISUAL_REVIEW_PENDING` | Exact charts and EV | Targeted visual review |
| `SGL-0018` | `SLC-M03-L25` | Locked 3-Bet Ranges Part 2 | Catastrophic ASR loop | `08:54–25:11` | P0 | `RERUN_REQUIRED` | Final 16:17 | Rerun `08:25–25:12` |
| `SGL-0019` | `SLC-M03-L26` | Locked 3-Bet Ranges Part 3 | Visual evidence missing | Whole lesson | P1 | `VISUAL_REVIEW_PENDING` | Exact board/ranges/frequencies | Targeted visual review |
| `SGL-0020` | `SLC-M03-L27` | Exploiting OOP C-Bets | Catastrophic ASR loop | `04:00–17:17` | P0 | `RERUN_REQUIRED` | Main demonstration | Rerun `03:30–17:18` |
| `SGL-0021` | `SLC-M03-L28` | Vs Tight-Aggressive Players | Visual evidence missing | Whole lesson | P1 | `VISUAL_REVIEW_PENDING` | Exact node and thresholds | Targeted visual review |
| `SGL-0022` | `SLC-M03-L29` | AKTss Part 1 | Visual evidence missing | Whole lesson | P1 | `VISUAL_REVIEW_PENDING` | Exact runout and bluff selections | Targeted visual review |
| `SGL-0023` | `SLC-M03-L31` | Scary Flop After Squeezing | Cleanup / visual review | Whole lesson | P1 | `CLEANUP_PENDING` | Exact hand and locks | Clean then verify visuals |
| `SGL-0024` | `SLC-M03-L32` | 3-Bettor IP | Cleanup / visual review | Whole lesson | P1 | `CLEANUP_PENDING` | Exact board and frequencies | Clean then verify visuals |
| `SGL-0025` | `SLC-M03-L33` | Low Equity Boards Part 1 | Local loops / visuals | Scattered | P2 | `CLEANUP_PENDING` | Local passages and branches | Deduplicate then verify |
| `SGL-0026` | `SLC-M03-L34` | Low Equity Boards Part 2 | Local loops / visuals | Scattered | P2 | `CLEANUP_PENDING` | Local passages and branches | Deduplicate then verify |
| `SGL-0027` | `SLC-M07-L63` | Build Your Own Stuff | Catastrophic ASR loop | `17:30–19:12` | P0 | `RERUN_REQUIRED` | Final workflow section | Rerun `17:00–19:13` |
| `SGL-0028` | `SLC-M03-L30` | Bluff-Deficient Ranges Part 2 | Visual evidence missing | Whole lesson | P1 | `VISUAL_REVIEW_PENDING` | Exact locks, frequencies and runouts | Targeted visual review |
| `SGL-0029` | `SLC-M03-L35` | Low Equity Boards Part 3 | Visual evidence missing | Whole lesson | P1 | `VISUAL_REVIEW_PENDING` | Exact small-bet node and blockers | Targeted visual review |
| `SGL-0030` | `SLC-M04-L36` | Multiway Sandwich | Visual evidence missing | Whole lesson | P1 | `VISUAL_REVIEW_PENDING` | Exact ranges, sizes and check-raises | Targeted visual review |
| `SGL-0031` | `SLC-M04-L37` | Triton Hand Continued | Visual evidence missing | Whole lesson | P1 | `VISUAL_REVIEW_PENDING` | Exact runout, suits and river blocker | Targeted visual review |
| `SGL-0032` | `SLC-M04-L38` | Small Bets to Force Over-Folds | Catastrophic ASR loop | `08:09–36:19` | P0 | `RERUN_REQUIRED` | Central 28:10 of lesson | Rerun `07:40–36:45` in short chunks |
| `SGL-0033` | `SLC-M04-L39` | Low Connected Flops Multiway | Visual evidence missing | Whole lesson | P1 | `VISUAL_REVIEW_PENDING` | Exact lead and barrel frequencies | Targeted visual review |
| `SGL-0034` | `SLC-M04-L40` | KT9ss Part 1 | Visual evidence missing | Whole lesson | P1 | `VISUAL_REVIEW_PENDING` | Exact ranges and c-bet response | Targeted visual review |
| `SGL-0035` | `SLC-M04-L41` | KT9ss Part 2 | Visual evidence missing | Whole lesson | P1 | `VISUAL_REVIEW_PENDING` | Exact turn sizes and removal hands | Targeted visual review |
| `SGL-0036` | `SLC-M06-L56` | Doug vs EZ | Visual evidence missing | Whole hand | P1 | `VISUAL_REVIEW_PENDING` | Exact cards, sizes and node lock | Obtain stream/screenshots |
| `SGL-0037` | `SLC-M06-L57` | Josh vs EZ | Visual evidence missing | Whole hand | P1 | `VISUAL_REVIEW_PENDING` | Exact board, sizes and assumptions | Obtain stream/screenshots |
| `SGL-0038` | `SLC-M06-L58` | Ginge Check-Raise | Catastrophic ASR loop | `01:31–29:12` | P0 | `RERUN_REQUIRED` | Almost entire hand | Rerun `01:00–29:13` in short chunks |
| `SGL-0039` | `SLC-M06-L59` | Alan Keating vs JR | Visual evidence missing | Whole hand | P1 | `VISUAL_REVIEW_PENDING` | Exact cards, range construction and sizes | Obtain stream/screenshots |
| `SGL-0040` | `SLC-M06-L60` | Lodge $25/$50 Hands | Visual evidence missing | All examples | P1 | `VISUAL_REVIEW_PENDING` | Exact hand histories and actions | Obtain stream/screenshots |
| `SGL-0041` | `SLC-M06-L61` | $2/$5/$10 Part 1 | Visual evidence missing | All examples | P1 | `VISUAL_REVIEW_PENDING` | Exact positions, cards and sizes | Obtain stream/screenshots |
| `SGL-0042` | `SLC-M06-L62` | $2/$5/$10 Part 2 | Visual evidence missing | All examples | P1 | `VISUAL_REVIEW_PENDING` | Exact positions, cards and timing | Obtain stream/screenshots |
| `SGL-0043` | `SLC-M02-L06` | Tight-Passive BTN vs BB Part 1 | Visual evidence missing | Whole lesson | P1 | `VISUAL_REVIEW_PENDING` | Exact K-6-3 suits, ranges, frequencies and node-lock weights | Targeted video/screenshots |
| `SGL-0044` | `SLC-M02-L10` | Turn Barreling IP Part 2 | Visual evidence missing | Whole lesson | P1 | `VISUAL_REVIEW_PENDING` | Exact board suits, sizes, combo weights and river outputs | Targeted video/screenshots |
| `SGL-0045` | `SLC-M02-L11` | Turn Barreling IP Part 3 | Catastrophic ASR loop | `04:27–19:48` | P0 | `RERUN_REQUIRED` | Most of lesson and node-lock comparison | Rerun `03:55–19:49` |
| `SGL-0046` | `SLC-M02-L12` | Playing Turns vs Capped Ranges | Two unrecovered intervals | `17:46–18:53`, `24:20–30:54` | P0 | `RERUN_REQUIRED` | First low-brick comparison and final 6:34 | Rerun `17:15–19:20` and `23:50–30:55` |
| `SGL-0047` | `SLC-M02-L16` | Check-Raise Top Pair Part 1 | Catastrophic tail loop | `15:43–19:18` | P0 | `RERUN_REQUIRED` | Final comparison and conclusion | Rerun `15:10–19:19` |
| `SGL-0048` | `SLC-M02-L17` | Check-Raise Top Pair Part 2 | Visual evidence missing | Whole lesson | P1 | `VISUAL_REVIEW_PENDING` | Exact boards, sizes, positions and frequencies | Targeted video/screenshots |
| `SGL-0049` | `SLC-M02-L18` | Leading Turns After Calling | Local ASR gap | `13:29–14:38` | P1 | `RERUN_REQUIRED` | Transition between first and second examples | Rerun `13:00–15:05` |
| `SGL-0050` | `SLC-M02-L19` | Leading Turn vs Nodelocked Strategy | Visual evidence missing | Whole lesson | P1 | `VISUAL_REVIEW_PENDING` | Exact K-Q-2 suits, large size, lock weights and river frequencies | Targeted video/screenshots |
| `SGL-0051` | `SLC-M02-L21` | Playing Deep SRP OOP | Visual evidence missing | Whole lesson | P1 | `VISUAL_REVIEW_PENDING` | Exact low-board setup, ranges, bet sizes and response frequencies | Targeted video/screenshots |
| `SGL-0052` | `SLC-M02-L22` | HJ vs BTN 50-Flop Report | Catastrophic tail loop | `19:08–26:05` | P0 | `RERUN_REQUIRED` | Individual low-board deep dives and conclusion | Rerun `18:35–26:05` |

## Transcript-package backlog

| Module | Source range | Current state |
|---|---|---|
| Module 1 — Preflop | `SLC-M01-L01` through `SLC-M01-L03` | `TRANSCRIPT_PACKAGE_NOT_RECEIVED` |
| Module 2 — Single-Raised Pots | `SLC-M02-L04`, `L05`, `L07–L09`, `L13–L15`, `L20`, `L23` | `PARTIAL_MODULE_PACKAGE_RECEIVED` |

## Resolved issue ledger

| Issue ID | Source ID / asset | Resolution |
|---|---|---|
| `SGL-R001` | `SLC-M00-L00` | False Whisper repetition rejected; video-verified transcript retained |
| `SGL-R002` | Missing rake chart export | Scenario recovered in workbook cell `D18` |
| `SGL-R003` | Mislabeled no-rake chart | Mapping corrected using workbook cell `A8` |
| `SGL-R004` | `SLC-M02-L21` | Local repeated phrase near `10:42–10:58` removed; surrounding continuity preserved |

## Targeted rerun protocol

1. Preserve original outputs.
2. Include 20–30 seconds overlap on both sides.
3. Prefer 16 kHz mono WAV.
4. Force English; translation disabled.
5. Split long intervals if looping returns.
6. Never reconstruct cards, actions, sizes, frequencies or EV from expectation.
7. Close only after source continuity is established.

## Admission rule

A local gap blocks only that interval. Cross-source support may validate a final heuristic but never rewrites a missing source passage.
