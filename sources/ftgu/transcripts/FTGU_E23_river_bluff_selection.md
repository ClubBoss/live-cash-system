# Source Metadata

Course: From the Ground Up  
Episode: 23  
Lesson: River Bluff Selection  
Instructor: Peter Clarke  
Original filename: `episode 23 bluff selection.mp4`  
Source duration: `15:33.96`  
Transcription engine: `mlx-whisper large-v3`  
Source status: `AUDIO_COMPLETE / NEEDS_VISUAL_REVIEW`

# Source-Faithful Record

This lesson builds the betting side of the prior bluff-catcher analysis. A river size determines the required value-to-bluff ratio; the player then selects only enough bluff combinations to support the value region rather than betting every missed draw.

The best bluffs block strong calls or value, avoid blocking folds, and must plausibly have reached the river through the prior streets. The same physical card can be useful or harmful depending on which value hands, bluff-catchers and missed draws remain. The source also distinguishes baseline balance from exploit: bluff less against calling-heavy opponents and more only when overfolding is evidenced.

# Explicit Instructor Mechanisms

- Derive bluff volume from size and value-combo count.
- Do not bluff every missed draw merely because it lacks showdown value.
- Select bluffs by blocking calls/value while preserving folds.
- Respect range ancestry: the bluff must exist in the flop and turn branches.
- A larger bet permits more bluffs relative to value, but value still outnumbers bluffs in ordinary river pots.
- Deviate from baseline only in the direction supported by actual calling/folding evidence.

# Cross-Source Hooks

- `CONFIRMS H-W02-001`: establish the value region before bluff volume.
- `CONFIRMS H-W02-002`: each earlier-street bluff needs a river role.
- `CONFIRMS H-W03-005`: river bluff supply must be seeded earlier.
- `CONFIRMS H-W03-011`: blocker quality is line- and target-dependent.

# Uncertainties

Exact combo counts, boards and suit-specific blocker examples remain visual-dependent.
