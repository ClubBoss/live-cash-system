# Source Registry

This is the canonical inventory of all received course material.

| Source ID | Course | Module | Lesson | Instructor | Transcript path | Visuals | QA status | Analysis status | Playbook impact | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| SLC-M00-L00 | Smash Live Cash | 0-Intro | Intro | Nick Petrangelo | `sources/smash-live-cash/transcripts/SLC_M00_L00_intro.md` | Talking head only | SOURCE_VERIFIED | ANALYZED | NONE | Timeline and visual continuity verified directly from `Intro.mp4`; Whisper large-v3 cross-check completed, but its false repetition near 03:54 was rejected |
| SLC-M00-L01 | Smash Live Cash | 0-Intro | Intro to Node Locking | Nick Petrangelo | `sources/smash-live-cash/transcripts/SLC_M00_L01_intro_to_node_locking.md` | PioSolver screens not yet available | NEEDS_VISUAL_REVIEW | ANALYZED | CANDIDATE | Full Whisper timeline through 12:31; audio-layer defects cleaned; exact node, sizes, combinations, frequencies, and EV remain visual residuals |
| SLC-M00-L02 | Smash Live Cash | 0-Intro | Intro to PioSolver | Nick Petrangelo | `sources/smash-live-cash/transcripts/SLC_M00_L02_intro_to_piosolver.md` | PioSolver and spreadsheet screens not yet available | NEEDS_VISUAL_REVIEW | ANALYZED | CANDIDATE | Full Whisper timeline through 26:05; strategy-shape and tool-method claims retained; exact screen labels and example values remain visual residuals |
| SLC-M03-L24 | Smash Live Cash | 3-Post flop 3-Bet Pots | Preflop Adjustments vs Locked 3-Bet Ranges Part 1 | Nick Petrangelo | `sources/smash-live-cash/transcripts/SLC_M03_L24_preflop_adjustments_vs_locked_3bet_ranges_part_1.md` | Preflop charts and solver visuals not supplied | NEEDS_VISUAL_REVIEW | ANALYZED | CANDIDATE | Complete audio layer; 200bb no-ante BTN vs value-heavy BB 3-bet profile; exact chart weights and EV remain visual residuals |
| SLC-M03-L25 | Smash Live Cash | 3-Post flop 3-Bet Pots | Preflop Adjustments vs Locked 3-Bet Ranges Part 2 | Nick Petrangelo | `sources/smash-live-cash/transcripts/SLC_M03_L25_preflop_adjustments_vs_locked_3bet_ranges_part_2.md` | Preflop charts and solver visuals not supplied | NEEDS_REVIEW | NOT_STARTED | CANDIDATE | Usable through 08:54; repeated Whisper loop replaces 08:54–25:11; targeted rerun required |
| SLC-M03-L26 | Smash Live Cash | 3-Post flop 3-Bet Pots | Preflop Adjustments vs Locked 3-Bet Ranges Part 3 | Nick Petrangelo | `sources/smash-live-cash/transcripts/SLC_M03_L26_preflop_adjustments_vs_locked_3bet_ranges_part_3.md` | Solver visuals not supplied | NEEDS_VISUAL_REVIEW | ANALYZED | CANDIDATE | Complete audio layer; wide preflop range plus over-wide flop c-bet profile |
| SLC-M03-L27 | Smash Live Cash | 3-Post flop 3-Bet Pots | Exploiting OOP C-Bet Strategies in 3-Bet Pots | Nick Petrangelo | `sources/smash-live-cash/transcripts/SLC_M03_L27_exploiting_oop_cbet_strategies_in_3bet_pots.md` | Solver visuals not supplied | NEEDS_REVIEW | NOT_STARTED | CANDIDATE | Opening recovered through approximately 04:00; repeated Whisper phrase replaces the remaining 13 minutes |
| SLC-M03-L28 | Smash Live Cash | 3-Post flop 3-Bet Pots | Vs Tight-Aggressive Players in 3-Bet Pots | Nick Petrangelo | `sources/smash-live-cash/transcripts/SLC_M03_L28_vs_tight_aggressive_players_in_3bet_pots.md` | Solver visuals not supplied | NEEDS_VISUAL_REVIEW | ANALYZED | CANDIDATE | Complete audio layer; branch-specific exploit: respect overpair-heavy flop bet, attack weak check-back turn range |
| SLC-M03-L29 | Smash Live Cash | 3-Post flop 3-Bet Pots | Barreling Heuristics on Ace-High Board (AKTss Part 1) in 3-Bet Pots | Nick Petrangelo | `sources/smash-live-cash/transcripts/SLC_M03_L29_barreling_heuristics_ace_high_board_part_1_3bet_pots.md` | Solver visuals not supplied | NEEDS_VISUAL_REVIEW | ANALYZED | CANDIDATE | Complete audio layer; several local ASR repetitions removed conservatively; exact runout and sizing frequencies remain visual residuals |
| SLC-M03-L31 | Smash Live Cash | 3-Post flop 3-Bet Pots | Playing a Scary Flop After Squeezing | Nick Petrangelo | — | Solver and hand visuals not supplied | RAW_MACHINE_TRANSCRIPT | NOT_STARTED | CANDIDATE | Complete endpoint through 28:47; terminology cleanup and visual review pending |
| SLC-M03-L32 | Smash Live Cash | 3-Post flop 3-Bet Pots | When the 3-Bettor is IP (CO vs HJ) | Nick Petrangelo | — | Solver visuals not supplied | RAW_MACHINE_TRANSCRIPT | NOT_STARTED | CANDIDATE | Complete endpoint through 14:49; cleanup and visual review pending |
| SLC-M03-L33 | Smash Live Cash | 3-Post flop 3-Bet Pots | Exploitative Lines on Low Equity Boards Part 1 | Nick Petrangelo | — | Solver visuals not supplied | RAW_MACHINE_TRANSCRIPT | NOT_STARTED | CANDIDATE | Complete endpoint through 26:46; short local loops require conservative cleanup |
| SLC-M03-L34 | Smash Live Cash | 3-Post flop 3-Bet Pots | Exploitative Lines on Low Equity Boards (CO vs HJ) Part 2 | Nick Petrangelo | — | Solver visuals not supplied | RAW_MACHINE_TRANSCRIPT | NOT_STARTED | CANDIDATE | Complete endpoint through 34:54; short local loops require conservative cleanup |
| SLC-M05-L42 | Smash Live Cash | 5-Coaching Brad Owen | Coaching Brad Owen Intro | Nick Petrangelo / Brad Owen | — | Talking-head or coaching visuals not supplied | NEEDS_REVIEW | NOT_STARTED | CANDIDATE | Whisper repeats one phrase from approximately 00:55 to 05:55; targeted rerun required |
| SLC-M05-L43 | Smash Live Cash | 5-Coaching Brad Owen | Advanced Postflop Strategy Building Part 1 | Nick Petrangelo / Brad Owen | — | Solver and spreadsheet visuals not supplied | RAW_MACHINE_TRANSCRIPT | NOT_STARTED | CANDIDATE | Full endpoint; local Whisper loops at 03:23 and 07:52–07:59; indexed in `analysis/module-audits/SLC_M05_archive2_batch_qa.md` |
| SLC-M05-L44 | Smash Live Cash | 5-Coaching Brad Owen | Advanced Postflop Strategy Building Part 2 | Nick Petrangelo / Brad Owen | — | Solver and spreadsheet visuals not supplied | NEEDS_REVIEW | NOT_STARTED | CANDIDATE | Tail from 26:12 to 38:32 is a repeated Whisper hallucination; retranscription required |
| SLC-M05-L45 | Smash Live Cash | 5-Coaching Brad Owen | Advanced Postflop Strategy Building Part 3 | Nick Petrangelo / Brad Owen | — | Solver visuals not supplied | RAW_MACHINE_TRANSCRIPT | NOT_STARTED | CANDIDATE | Complete endpoint; ordinary poker-term cleanup and visual verification remain |
| SLC-M05-L46 | Smash Live Cash | 5-Coaching Brad Owen | 88 Check-Raise on 7-6-6 | Nick Petrangelo / Brad Owen | — | Hand-history and solver visuals not supplied | RAW_MACHINE_TRANSCRIPT | NOT_STARTED | CANDIDATE | Complete endpoint; exact board suits, frequencies, and EV require visual review |
| SLC-M05-L47 | Smash Live Cash | 5-Coaching Brad Owen | Multiway QTo Bluff | Nick Petrangelo / Brad Owen | — | Hand-history and solver visuals not supplied | RAW_MACHINE_TRANSCRIPT | NOT_STARTED | CANDIDATE | Complete endpoint through 30:14; cleanup and visual review pending |
| SLC-M05-L48 | Smash Live Cash | 5-Coaching Brad Owen | Q4 Bluff Review | Nick Petrangelo / Brad Owen | — | Hand-history and solver visuals not supplied | RAW_MACHINE_TRANSCRIPT | NOT_STARTED | CANDIDATE | Complete endpoint; minor repeated wording near 20:54 |
| SLC-M05-L49 | Smash Live Cash | 5-Coaching Brad Owen | Squeezing with QQ | Nick Petrangelo / Brad Owen | — | Hand-history and solver visuals not supplied | RAW_MACHINE_TRANSCRIPT | NOT_STARTED | CANDIDATE | Complete endpoint; isolated low-confidence phrase near 05:28 |
| SLC-M05-L50 | Smash Live Cash | 5-Coaching Brad Owen | 4-Betting A-5s | Nick Petrangelo / Brad Owen | — | Hand-history and solver visuals not supplied | RAW_MACHINE_TRANSCRIPT | NOT_STARTED | CANDIDATE | Complete endpoint; brief Whisper loop at 14:41–14:43 |
| SLC-M05-L51 | Smash Live Cash | 5-Coaching Brad Owen | 3-Betting KT in CO vs MP Open | Nick Petrangelo / Brad Owen | — | Hand-history and solver visuals not supplied | RAW_MACHINE_TRANSCRIPT | NOT_STARTED | CANDIDATE | Complete endpoint; duplicated phrase around 19:09–19:26 and repeated ending require cleanup |
| SLC-M05-L52 | Smash Live Cash | 5-Coaching Brad Owen | QQ in HJ in 4-Bet Pot OOP | Nick Petrangelo / Brad Owen | — | Hand-history and solver visuals not supplied | RAW_MACHINE_TRANSCRIPT | NOT_STARTED | CANDIDATE | Complete endpoint through 20:48; cleanup and visual review pending |
| SLC-M05-L53 | Smash Live Cash | 5-Coaching Brad Owen | Check-Raising Exercise w Nick | Nick Petrangelo / Brad Owen | — | Multi-board solver drill visuals not supplied | NEEDS_REVIEW | NOT_STARTED | CANDIDATE | Endpoint complete but 21:07–21:50 is unrecovered due to a Whisper loop |
| SLC-M05-L54 | Smash Live Cash | 5-Coaching Brad Owen | Bet-Sizing | Nick Petrangelo / Brad Owen | — | Solver and hand visuals not supplied | RAW_MACHINE_TRANSCRIPT | NOT_STARTED | CANDIDATE | Complete endpoint through 25:33; one timing gap and low-confidence phrases require cleanup |
| SLC-M05-L55 | Smash Live Cash | 5-Coaching Brad Owen | Brad's Takeaways | Nick Petrangelo / Brad Owen | — | Coaching visuals not supplied | RAW_MACHINE_TRANSCRIPT | NOT_STARTED | CANDIDATE | Complete endpoint through 04:55; cleanup pending |
| SLC-M07-L63 | Smash Live Cash | 7-Going Forward | How To Build Your Own Stuff Going Forward | Nick Petrangelo | — | PioSolver, script and trainer visuals not supplied | NEEDS_REVIEW | NOT_STARTED | CANDIDATE | Usable through approximately 17:30; repeated aggregate-report phrase replaces the final section to 19:12 |

## Status rules

### QA status

- `PENDING`
- `RAW_MACHINE_TRANSCRIPT`
- `AUDIO_VERIFIED`
- `NEEDS_VISUAL_REVIEW`
- `SOURCE_VERIFIED`
- `NEEDS_REVIEW`
- `REJECTED`

### Analysis status

- `NOT_STARTED`
- `ANALYZED`
- `SYNTHESIZED`
- `DORMANT`

### Playbook impact

- `NONE`
- `CANDIDATE`
- `ADMITTED`
- `REVISED`
- `REJECTED`
