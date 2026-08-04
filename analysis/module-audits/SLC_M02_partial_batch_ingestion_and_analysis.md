# Smash Live Cash — Module 2 Partial Batch Ingestion and Analysis

Status: `NEW_DELTA_PROCESSED / TEN_LESSONS_RECEIVED / FIVE_RERUNS_OPEN`

## Evidence package

- Uploaded archive: `Whisper large-v3 transcripts(2).zip`
- Size: 11,281,330 bytes
- SHA-256: `9db8736eeacc59be2fd0d999bc35de8f9ab64715faac75ebadf9990d05fa10ba`
- Processing date: 2026-08-04
- Engine: whisper.cpp large-v3, English forced
- Formats: segments JSON, SRT, VTT, timestamped TXT and plain TXT

## Delta and duplicate check

Every file already present in `Whisper large-v3 transcripts(1).zip` is byte-identical in this archive. Existing canonical records were not overwritten. The new delta consists of ten Module 2 lessons:

`SLC-M02-L06`, `L10–L12`, `L16–L19`, `L21`, `L22`.

## Coverage and admission

| Source ID | Lesson | Whisper endpoint | Result |
|---|---|---:|---|
| `SLC-M02-L06` | Vs Tight-Passive Players Part 1 | 19:28.75 | Complete source record; analyzed |
| `SLC-M02-L10` | Turn Barreling IP Part 2 | 24:40.31 | Complete source record; analyzed |
| `SLC-M02-L11` | Turn Barreling IP Part 3 | 19:48.70 | Partial; loop from 04:27; analysis withheld |
| `SLC-M02-L12` | Playing Turns vs Capped Ranges | 30:54.52 | Core recovered; two gaps; analyzed conservatively |
| `SLC-M02-L16` | Check-Raise Top Pair Part 1 | 19:18.78 | Core recovered; tail loop; analyzed conservatively |
| `SLC-M02-L17` | Check-Raise Top Pair Part 2 | 28:18.87 | Complete source record; analyzed |
| `SLC-M02-L18` | Leading Turns After Calling | 21:57.42 | Core recovered; local gap; analyzed conservatively |
| `SLC-M02-L19` | Leading Turn vs Nodelocked Strategy | 16:20.26 | Complete source record; analyzed |
| `SLC-M02-L21` | Playing Deep SRP OOP | 26:54.63 | Complete after local deduplication; analyzed |
| `SLC-M02-L22` | HJ vs BTN 50-Flop Report | 26:05.22 | Partial; loop from 19:08; analysis withheld |

## Targeted reruns

1. `L11`: `03:55–19:49`.
2. `L12`: `17:15–19:20` and `23:50–30:55`.
3. `L16`: `15:10–19:19`.
4. `L18`: `13:00–15:05`.
5. `L22`: `18:35–26:05`.

## Structural validation

All ten source records contain canonical metadata, verified timestamp headings no more than 120 seconds apart, explicit visual dependencies and the four required extracted-object subsections. Missing material is marked with `[AUDIO TRANSCRIPTION GAP]` or `[TRANSCRIPT INCOMPLETE]`; no exact card, action, frequency or EV was reconstructed from expectation.

# Source-Limited Lesson Analyses

## SLC-M02-L06 — Vs Tight-Passive Players Part 1

### Source-faithful result

Nick models a BB who reaches the flop with a plausible range but under-defends and under-check-raises. On K-6-3 rainbow, BTN can increase small c-bet frequency with air and thin value because BB fails to execute the difficult weak-pair, ace-high and backdoor responses.

### Compression candidates

- Separate preflop looseness from postflop under-defence.
- When BB cannot punish the flop bet, bet more—but after a call, update to a stronger and more condensed turn range.
- Node-lock the specific missing defence rather than labelling the entire player generically.

Decision: `CANDIDATE`, confidence medium-high.

## SLC-M02-L10 — Turn Barreling Strategies IP Part 2

### Source-faithful result

At 200bb on K-7-2 two-tone with a paired low turn, Nick constructs a polarized overbet strategy from the value threshold first. Bluffs are divided into equity-driven draws, blocker-driven broadways and very low-equity candidates selected for future-river utility.

### Compression candidates

- Value threshold first; bluff volume second.
- A turn bluff must improve usefully, remove strong calls or create required river bluffs.
- Do not import shallow-stack barrel volume into 200bb pots.
- If live players over-fold middle pairs to a huge turn bet, increase the correct low-equity barrels rather than random bluffs.

Decision: `CANDIDATE`, confidence high on the mechanism; exact combos remain visual-dependent.

## SLC-M02-L12 — Playing Turns vs Capped Ranges

### Source-faithful result

The recovered material uses BTN versus BB on 9-7-2 two-tone to distinguish neutral low turns from range-changing cards. Low bricks preserve BTN's polar overpair/top-pair advantage and support overbets; flush, straight and middling cards reduce that leverage. The final 6:34 and one middle interval are missing.

### Compression candidates

- Overbet cards that preserve polarization, not automatically aces or kings.
- Neutral low brick after a polar flop bet is a strong overbet candidate.
- Range-changing turn means reduce size, narrow value or check more.
- Block the caller's strongest one-pair continues when choosing bluffs.

Decision: `CANDIDATE`, confidence medium because the tail is missing.

## SLC-M02-L16 — Check-Raise Top Pair Part 1

### Source-faithful result

The recovered lesson compares textures where OOP should fast-play top pair versus keep it in check-call. On paired low boards, vulnerable low-kicker top pair often raises because it needs protection and does not block IP's high-card c-bets. The last 3:35 is missing.

### Compression candidates

- Low kicker can be a better raise than high kicker because it unblocks folds.
- Paired board plus retained trips can support linear top-pair raises.
- Do not place every top pair into immediate bluff-catcher mode.

Decision: `CANDIDATE`, confidence medium pending the missing conclusion.

## SLC-M02-L17 — Check-Raise Top Pair Part 2

### Source-faithful result

Nick extends the framework across paired, dynamic, ace-high and monotone boards. Vulnerable top pair raises more against wide or small c-bets; large polar c-bets sharply reduce frequency. Monotone boards keep ordinary top pair passive and use a polar raise range.

### Compression candidates

- Wide/small c-bet plus vulnerable top pair creates a protection-raise candidate.
- Large polar c-bet means cool the raise frequency.
- Change weights of baseline-approved hands before inventing new bluff categories.
- Monotone boards generally exclude ordinary top pair from the raise range.

Decision: `CANDIDATE`, confidence high on the general shape.

## SLC-M02-L18 — Leading Turns After Calling Flop C-Bets

### Source-faithful result

Turn leads are derived from IP's flop c-bet composition. A polar high-card-heavy bet creates polar leads on favorable low turns; a wide small c-bet creates small linear value/protection leads when second or bottom pair pairs. A 69-second transition is missing.

### Compression candidates

- Before leading, ask what IP actually bet on the flop and what the turn removes from that range.
- Polar large flop bet can produce a polar lead on low favorable cards.
- Wide small flop bet can produce a small linear paired-turn lead.
- The exploit depends on IP missing the required wide calls and raises.

Decision: `CANDIDATE`, confidence medium-high.

## SLC-M02-L19 — Leading Turn vs Nodelocked Strategy

### Source-faithful result

On K-Q-2 two-tone, Nick removes Qx from a human large flop c-bet range. Once second pair is absent from that branch, a queen turn favors BB sharply and lead frequency increases approximately threefold in the displayed solve.

### Compression candidates

- Ask which merged medium-strength hands are absent from the opponent's large size.
- If the missing second-pair card pairs, OOP may gain a major leading range.
- Node-lock the sizing branch, not the player's entire identity.
- River blocker quality depends on the opponent's actual remaining low cards.

Decision: `CANDIDATE`, confidence high on the branch-specific mechanism.

## SLC-M02-L21 — Playing Deep in Single-Raised Pots OOP

### Source-faithful result

The lesson builds a defensive 200bb OOP framework on dynamic low boards. Raw equity is distinguished from realized EV. OOP checks heavily, protects the call range with overpairs and strong draws, and uses selective low-card/backdoor raises. A short local Whisper repetition was safely removed.

### Compression candidates

- Deep plus OOP plus dynamic board means default more defensive.
- Raw equity is not permission to build a large pot.
- Keep overpairs and strong draws in check-call to protect the middle of the range.
- Versus larger c-bets, call more and raise less.

Decision: `CANDIDATE`, confidence high; this is central Batumi material.

# Module-Level Batumi Relevance

The strongest usable mechanisms in this batch are:

1. exploit weak BB flop defence without forgetting that calls strengthen the later range;
2. construct deep turn overbets from value and future-street bluff utility;
3. choose overbet cards through range preservation rather than surface card rank;
4. fast-play vulnerable top pair selectively, especially when low kickers unblock folds;
5. derive turn leads from the opponent's flop sizing range;
6. protect deep OOP check-call ranges with genuinely strong hands.

No rule is admitted to the final Playbook yet. Carrot Poker / From the Ground Up comparison and relevant visual verification remain required.

## Closure verdict

`MODULE_2_PARTIAL_BATCH_INGESTION_COMPLETE`

Remaining Module 2 transcript packages: `L04`, `L05`, `L07–L09`, `L13–L15`, `L20`, `L23`.
