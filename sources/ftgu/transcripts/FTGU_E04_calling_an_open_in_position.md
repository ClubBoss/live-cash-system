# Source Metadata

Course: From the Ground Up  
Episode: 4  
Lesson: Calling an Open in Position  
Instructor: Peter Clarke  
Original filename: `episode 4 calling an open in position.mp4`  
Source duration from transcript: `17:46.30`  
Transcription engine: `mlx-whisper`  
Model: `large-v3`  
Language: English  
Translation: disabled  
Source status: `AUDIO_COMPLETE / LOCAL_ASR_CLEANUP_REQUIRED / NEEDS_VISUAL_REVIEW`

# Detailed Source-Faithful Record

## Two principal reasons to cold-call

A cold-call in position needs a clearer justification than opening the pot because the caller receives no blind discount and can still face action behind.

The two stated reasons are:

1. **Value** — the hand performs well against the opening range but may not gain enough by 3-betting.
2. **Implied odds** — the hand is behind the opening range but can make a sufficiently strong hand relative to its small initial investment and expected future payout.

## Calling versus 3-betting

A hand can sometimes support both lines because each earns EV from different branches:

- 3-betting benefits from folds and range isolation;
- calling avoids being 4-bet, keeps weaker hands in and can exploit postflop position.

The choice depends on the opener, players behind and how the hand realises equity.

## Players behind and capped ranges

Cold-calling normally removes premium hands from the caller's range. This creates a capped range that can be attacked by squeezes from uncapped players behind. A nominally profitable call can become inferior to 3-betting or folding when squeeze risk, strong players behind or excessive multiway participation reduce equity realisation.

## Hand-class realisation

Small pairs realise implied odds in a relatively discrete way: they flop a set or they do not. Suited connectors often improve gradually and may need to invest across several streets before completing. This makes position, stack depth and pressure from strong ranges especially important for suited connectors.

One-pair hands also lose value as the number of players increases.

# Explicit Instructor Mechanisms

- Cold-call for value or implied odds, not because a hand merely looks playable.
- Compare call and 3-bet through the branches of the EV tree.
- Account for players behind before evaluating a call.
- Capped cold-call ranges are vulnerable to squeezes.
- Implied-odds hands differ in how quickly and cheaply they realise their upside.
- One-pair value falls as pots become more multiway.

# Cross-Source Hooks

- `CONFIRMS H-W01-001`: stack depth, position and realisation shape preflop architecture.
- `CONFIRMS H-W01-009`: the current node must include the probability of surviving players-behind action.
- `CONFIRMS H-W03-001`: preflop line choice creates the range shape carried postflop.
- `EXTENDS H-W03-002`: dominated broadways and gradual-equity hands suffer first against strong filtered ranges.

# Uncertainties Requiring Review

- Exact example positions, cards and stack sizes.
- Local ASR errors in hand labels and episode references.
