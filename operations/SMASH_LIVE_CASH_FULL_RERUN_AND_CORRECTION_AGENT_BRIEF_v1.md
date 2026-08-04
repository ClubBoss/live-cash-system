# Smash Live Cash — Full Targeted Rerun and Correction Agent Brief v1

Status: `READY_FOR_EXECUTION`

Canonical baseline: `97c007c87c1af28c668fb887b18cf14457a7c698`  
Repository: `ClubBoss/live-cash-system`  
Canonical issue source: `sources/smash-live-cash/source-gap-ledger.md`

## Mission

Repair the audio-transcription defects remaining after the first Smash Live Cash ingestion cycle. Produce a complete evidence package that another reviewer can use to update canonical transcripts without guessing.

This is a source-recovery task, not a poker-strategy rewriting task.

## Write safety

1. Do not modify or push directly to `main`.
2. Preserve all original Whisper outputs.
3. Do not replace a canonical transcript with a rerun until the interval passes the acceptance checks below.
4. Never reconstruct cards, suits, positions, actions, sizings, frequencies, EV, solver labels, or instructor wording from poker logic or context.
5. Do not use the hallucinated transcript passage as an initial prompt or context.
6. If working in GitHub, use a separate branch such as `agent/smash-targeted-reruns-v1` and leave it unmerged.
7. The preferred deliverable is an archive plus manifest and correction report. Canonical integration will be done separately.

## Transcription configuration

- Model: Whisper `large-v3`.
- Language: force English.
- Translation: disabled.
- Input: clean `16 kHz mono WAV` where possible.
- Add 20–30 seconds of overlap before and after every target interval.
- Split long intervals into chunks of 6–10 minutes.
- Use 20–30 seconds overlap between chunks.
- If a loop returns, reduce that chunk to 3–5 minutes and retry without previous generated text.
- Save for every chunk:
  - `segments.json`
  - `.srt`
  - `.vtt`
  - `.timestamped.txt`
  - plain `.txt`

Naming format:

`<SOURCE_ID>__rerun_<START>-<END>__part_<N>`

## Mandatory rerun queue

All intervals below are required. Do not silently drop a row because surrounding text appears understandable.

### Wave A — foundational or large missing intervals

| Issue | Source ID | Lesson | Required chunks |
|---|---|---|---|
| `SGL-0053` | `SLC-M01-L01` | Preflop 101 | `00:30–08:30`; `08:00–16:00`; `15:30–23:30`; `23:00–31:00`; `30:30–38:30`; `38:00–46:00`; `45:30–50:32` |
| `SGL-0032` | `SLC-M04-L38` | Using Small Bet Sizes to Force Over-Folds | `07:40–15:00`; `14:30–22:00`; `21:30–29:00`; `28:30–36:45` |
| `SGL-0038` | `SLC-M06-L58` | Ginge Takes Savage Check-Raise Line | `01:00–08:00`; `07:30–14:30`; `14:00–21:00`; `20:30–29:13` |
| `SGL-0018` | `SLC-M03-L25` | Locked 3-Bet Ranges Part 2 | `08:25–14:30`; `14:00–20:00`; `19:30–25:12` |
| `SGL-0020` | `SLC-M03-L27` | Exploiting OOP C-Bet Strategies | `03:30–10:30`; `10:00–17:18` |
| `SGL-0045` | `SLC-M02-L11` | Turn Barreling Strategies IP Part 3 | `03:55–10:00`; `09:30–15:30`; `15:00–19:49` |
| `SGL-0055` | `SLC-M02-L14` | Playing Turns After Overbetting Flops IP | `11:00–18:00`; `17:30–23:54` |
| `SGL-0056` | `SLC-M02-L15` | Finding Hard Continues After Defending BB | `07:55–14:30`; `14:00–20:30`; `20:00–25:44` |

### Wave B — material missing sections

| Issue | Source ID | Lesson | Required chunks |
|---|---|---|---|
| `SGL-0005` | `SLC-M05-L44` | Advanced Postflop Strategy Building Part 2 | `25:45–32:30`; `32:00–38:33` |
| `SGL-0003` | `SLC-M05-L42` | Coaching Brad Owen Intro | `00:30–06:15`; split to two 3–4 minute chunks if looping returns |
| `SGL-0046A` | `SLC-M02-L12` | Playing Turns vs Capped Ranges — middle | `17:15–19:20` |
| `SGL-0046B` | `SLC-M02-L12` | Playing Turns vs Capped Ranges — tail | `23:50–30:55` |
| `SGL-0047` | `SLC-M02-L16` | Check-Raise Top Pair Part 1 | `15:10–19:19` |
| `SGL-0052` | `SLC-M02-L22` | HJ vs BTN 50-Flop Report | `18:35–26:05` |
| `SGL-0027` | `SLC-M07-L63` | How to Build Your Own Stuff | `17:00–19:13` |

### Wave C — short bounded defects

| Issue | Source ID | Lesson | Required interval |
|---|---|---|---|
| `SGL-0014` | `SLC-M05-L53` | Check-Raising Exercise | `20:40–22:15` |
| `SGL-0049` | `SLC-M02-L18` | Leading Turns After Calling | `13:00–15:05` |
| `SGL-0054` | `SLC-M02-L04` | Postflop Intro | `05:40–08:17` |

## Cleanup and correction backlog

These files are substantially complete and should not automatically be fully retranscribed. First perform conservative deduplication and terminology review against `segments.json`, SRT and neighbouring timestamps. Run a short targeted rerun only when continuity or a strategically material word cannot be established.

### Module 3

| Source ID | Known correction scope |
|---|---|
| `SLC-M03-L31` | Whole lesson terminology/repetition cleanup; exact hand and solver labels remain visual-dependent |
| `SLC-M03-L32` | Whole lesson terminology cleanup; exact board, position, size and frequency remain visual-dependent |
| `SLC-M03-L33` | Opening repeated phrase and late repeated lead phrase; deduplicate against adjacent segments |
| `SLC-M03-L34` | Short repeated phrases in opening and later sections; deduplicate conservatively |

### Module 5 — Coaching Brad Owen

| Source ID | Known correction scope |
|---|---|
| `SLC-M05-L43` | Local loops around `03:23` and `07:52–07:59` |
| `SLC-M05-L45` | Scattered low-confidence poker terminology |
| `SLC-M05-L46` | Whole transcript terminology cleanup; exact hand/solver data remain visual-dependent |
| `SLC-M05-L47` | Whole transcript cleanup and action continuity review |
| `SLC-M05-L48` | Repeated wording around `20:54` |
| `SLC-M05-L49` | Low-confidence phrase around `05:28` |
| `SLC-M05-L50` | Brief loop around `14:41–14:43` |
| `SLC-M05-L51` | Repetition around `19:09–19:26` and repeated ending |
| `SLC-M05-L52` | Whole transcript cleanup and action continuity review |
| `SLC-M05-L54` | Timing gap around `19:49–20:01` plus scattered low-confidence phrases; rerun that interval if continuity is not recoverable |
| `SLC-M05-L55` | Conservative cleanup of the full short lesson |

## Visual-only residuals

Do not treat missing solver screens as an audio-transcription failure. Exact cards, suits, positions, size labels, combo weights, frequencies and EV remain visual-dependent for lessons marked `NEEDS_VISUAL_REVIEW` in `sources/source-registry.md`.

For this assignment:

- record the timestamp of any screen that is necessary to understand a recovered sentence;
- do not manually infer what is displayed;
- do not spend time screenshotting every solver cell;
- flag only visual facts that could materially change a final heuristic.

## Acceptance checks for every rerun chunk

A chunk passes only when all applicable checks pass:

1. The last timestamp reaches the requested chunk endpoint within normal audio tolerance.
2. No identical sentence repeats more than twice consecutively.
3. No long sequence of empty text, `--`, identical segments, or timestamp-only output exists.
4. The first and last 20–30 seconds overlap coherently with adjacent original or rerun material.
5. Speaker meaning remains source-faithful; grammar cleanup must not change poker action identity.
6. Cards, positions, actions, sizes and numbers that remain uncertain are marked `[UNCLEAR]` rather than guessed.
7. A long rerun is not called complete merely because the final timestamp exists; semantic continuity must also be present.

## Required deliverables

### 1. Rerun archive

Recommended structure:

```text
rerun_package/
  SLC-M01-L01/
    ...part_1.segments.json
    ...part_1.srt
    ...part_1.vtt
    ...part_1.timestamped.txt
    ...part_1.txt
  ...
```

### 2. Manifest

Create `RERUN_RESULT_MANIFEST.md` and include one row per issue/chunk:

- issue ID;
- source ID;
- requested interval;
- actual first/last timestamp;
- model/settings;
- result: `PASS`, `PARTIAL`, or `FAILED`;
- repetition detected: yes/no;
- continuity verified: yes/no;
- remaining uncertainty;
- output file paths.

### 3. Correction report

Create `TRANSCRIPT_CORRECTION_REPORT.md` with:

- exact original defect;
- whether the rerun closes it;
- corrected source-faithful passage with timestamps;
- overlap reconciliation notes;
- any remaining audio or visual gap;
- explicit statement that no strategic details were inferred.

### 4. Cleanup report

For every cleanup-backlog file, report:

- duplicate or low-confidence passage;
- action taken: `REMOVED_DUPLICATE`, `TERM_CORRECTED_FROM_AUDIO`, `SHORT_RERUN_REQUIRED`, or `UNRESOLVED`;
- evidence used;
- whether the correction changes a strategic claim.

## Completion standard

The assignment is complete only when:

- every mandatory issue row has a `PASS`, `PARTIAL`, or `FAILED` result;
- no issue silently disappears;
- every `PASS` has continuity evidence;
- every unresolved passage remains explicitly marked;
- the archive, manifest and reports are internally consistent.

Final verdict format:

`SMASH_TARGETED_RERUN_AND_CORRECTION_PASS_COMPLETE`

or, when defects remain:

`SMASH_TARGETED_RERUN_AND_CORRECTION_PARTIAL — <OPEN ISSUE IDS>`
