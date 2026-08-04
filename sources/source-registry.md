# Source Registry

This is the canonical inventory of all received course material.

| Source ID | Course | Module | Lesson | Instructor | Transcript path | Visuals | QA status | Analysis status | Playbook impact | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| SLC-M00-L00 | Smash Live Cash | 0-Intro | Intro | Nick Petrangelo | `sources/smash-live-cash/transcripts/SLC_M00_L00_intro.md` | Talking head only | SOURCE_VERIFIED | ANALYZED | NONE | Timeline and visual continuity verified directly from `Intro.mp4`; Whisper large-v3 cross-check completed, but its false repetition near 03:54 was rejected |
| SLC-M00-L01 | Smash Live Cash | 0-Intro | Intro to Node Locking | Nick Petrangelo | `sources/smash-live-cash/transcripts/SLC_M00_L01_intro_to_node_locking.md` | PioSolver screens not yet available | NEEDS_VISUAL_REVIEW | ANALYZED | CANDIDATE | Full Whisper timeline through 12:31; audio-layer defects cleaned; exact node, sizes, combinations, frequencies, and EV remain visual residuals |
| SLC-M00-L02 | Smash Live Cash | 0-Intro | Intro to PioSolver | Nick Petrangelo | `sources/smash-live-cash/transcripts/SLC_M00_L02_intro_to_piosolver.md` | PioSolver and spreadsheet screens not yet available | NEEDS_VISUAL_REVIEW | ANALYZED | CANDIDATE | Full Whisper timeline through 26:05; strategy-shape and tool-method claims retained; exact screen labels and example values remain visual residuals |
| SLC-M05-L43 | Smash Live Cash | 5-Coaching Brad Owen | Advanced Postflop Strategy Building Part 1 | Nick Petrangelo / Brad Owen | — | Solver and spreadsheet visuals not supplied | RAW_MACHINE_TRANSCRIPT | NOT_STARTED | CANDIDATE | Full endpoint; local Whisper loops at 03:23 and 07:52–07:59; indexed in `analysis/module-audits/SLC_M05_archive2_batch_qa.md` |
| SLC-M05-L44 | Smash Live Cash | 5-Coaching Brad Owen | Advanced Postflop Strategy Building Part 2 | Nick Petrangelo / Brad Owen | — | Solver and spreadsheet visuals not supplied | NEEDS_REVIEW | NOT_STARTED | CANDIDATE | Tail from 26:12 to 38:32 is a repeated Whisper hallucination; retranscription required |
| SLC-M05-L45 | Smash Live Cash | 5-Coaching Brad Owen | Advanced Postflop Strategy Building Part 3 | Nick Petrangelo / Brad Owen | — | Solver visuals not supplied | RAW_MACHINE_TRANSCRIPT | NOT_STARTED | CANDIDATE | Complete endpoint; ordinary poker-term cleanup and visual verification remain |
| SLC-M05-L46 | Smash Live Cash | 5-Coaching Brad Owen | 88 Check-Raise on 7-6-6 | Nick Petrangelo / Brad Owen | — | Hand-history and solver visuals not supplied | RAW_MACHINE_TRANSCRIPT | NOT_STARTED | CANDIDATE | Complete endpoint; exact board suits, frequencies, and EV require visual review |
| SLC-M05-L48 | Smash Live Cash | 5-Coaching Brad Owen | Q4 Bluff Review | Nick Petrangelo / Brad Owen | — | Hand-history and solver visuals not supplied | RAW_MACHINE_TRANSCRIPT | NOT_STARTED | CANDIDATE | Complete endpoint; minor repeated wording near 20:54 |
| SLC-M05-L49 | Smash Live Cash | 5-Coaching Brad Owen | Squeezing with QQ | Nick Petrangelo / Brad Owen | — | Hand-history and solver visuals not supplied | RAW_MACHINE_TRANSCRIPT | NOT_STARTED | CANDIDATE | Complete endpoint; isolated low-confidence phrase near 05:28 |
| SLC-M05-L50 | Smash Live Cash | 5-Coaching Brad Owen | 4-Betting A-5s | Nick Petrangelo / Brad Owen | — | Hand-history and solver visuals not supplied | RAW_MACHINE_TRANSCRIPT | NOT_STARTED | CANDIDATE | Complete endpoint; brief Whisper loop at 14:41–14:43 |
| SLC-M05-L51 | Smash Live Cash | 5-Coaching Brad Owen | 3-Betting KT in CO vs MP Open | Nick Petrangelo / Brad Owen | — | Hand-history and solver visuals not supplied | RAW_MACHINE_TRANSCRIPT | NOT_STARTED | CANDIDATE | Complete endpoint; duplicated phrase around 19:09–19:26 and repeated ending require cleanup |
| SLC-M05-L53 | Smash Live Cash | 5-Coaching Brad Owen | Check-Raising Exercise w Nick | Nick Petrangelo / Brad Owen | — | Multi-board solver drill visuals not supplied | NEEDS_REVIEW | NOT_STARTED | CANDIDATE | Endpoint complete but 21:07–21:50 is unrecovered due to a Whisper loop |

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
