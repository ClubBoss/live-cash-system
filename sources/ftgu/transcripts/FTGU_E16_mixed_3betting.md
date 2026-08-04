# Source Metadata

Course: From the Ground Up  
Episode: 16  
Lesson: Mixed 3-Betting  
Instructor: Peter Clarke  
Original filename: `episode 16 mixed 3 betting.mp4`  
Source duration: `12:02.70`  
Transcription engine: `mlx-whisper large-v3`  
Source status: `AUDIO_COMPLETE / NEEDS_VISUAL_REVIEW`

# Source-Faithful Record

This lesson introduces a middle strategy between the polar and linear extremes. It assumes a viable calling range and neither exceptionally high nor exceptionally low fold equity.

Very strong hands can pure three-bet. Some flexible hands with similar EV as calls and three-bets can mix between the two actions to give both ranges coverage. Other hands remain pure calls because they gain more from keeping the opening range wide, retaining domination and avoiding unnecessary pot inflation.

The instructor frames mixing as a practical approximation rather than a demand to reproduce exact solver randomisation. Position, rake, opening range and stack depth alter which hands belong to the pure, mixed and call-only regions.

# Explicit Instructor Mechanisms

- Use a mixed structure when fold equity does not clearly demand polar or linear play.
- Mix hands whose call and three-bet EV are close rather than forcing every hand into one permanent action.
- Preserve a pure value region, a mixed region and a pure calling region.
- Use flexible suited and playable hands to give both branches board coverage.
- Tighten all regions against earlier, stronger opening ranges.
- Exact mixing is less important than avoiding structurally weak or uncovered ranges.

# Cross-Source Hooks

- `EXTENDS H-W03-001`: preflop range shape can include pure and mixed branches, not only polar/linear binaries.
- `CONFIRMS H-W01-009`: node frequency depends on how often a mixed hand reaches each branch.
- `SUPPORTS learning`: teach branch purpose before exact percentages.

# Uncertainties

Exact mixed frequencies and hand cells require the video. Spoken fold-equity bands depend on rake, size, depth and positions and are not universal thresholds.
