# Source Registry

This is the canonical inventory of all received course material.

| Source ID | Course | Module | Lesson | Instructor | Transcript path | Visuals | QA status | Analysis status | Playbook impact | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| SLC-M00-L00 | Smash Live Cash | 0-Intro | Intro | Nick Petrangelo | `sources/smash-live-cash/transcripts/SLC_M00_L00_intro.md` | Talking head only | SOURCE_VERIFIED | ANALYZED | NONE | Timeline and visual continuity verified directly from `Intro.mp4`; Whisper large-v3 cross-check completed, but its false repetition near 03:54 was rejected |
| SLC-M00-L01 | Smash Live Cash | 0-Intro | Intro to Node Locking | Nick Petrangelo | `sources/smash-live-cash/transcripts/SLC_M00_L01_intro_to_node_locking.md` | PioSolver screens not yet available | NEEDS_VISUAL_REVIEW | ANALYZED | CANDIDATE | Full Whisper timeline through 12:31; audio-layer defects cleaned; exact node, sizes, combinations, frequencies, and EV remain visual residuals |
| SLC-M00-L02 | Smash Live Cash | 0-Intro | Intro to PioSolver | Nick Petrangelo | `sources/smash-live-cash/transcripts/SLC_M00_L02_intro_to_piosolver.md` | PioSolver and spreadsheet screens not yet available | NEEDS_VISUAL_REVIEW | ANALYZED | CANDIDATE | Full Whisper timeline through 26:05; strategy-shape and tool-method claims retained; exact screen labels and example values remain visual residuals |

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
