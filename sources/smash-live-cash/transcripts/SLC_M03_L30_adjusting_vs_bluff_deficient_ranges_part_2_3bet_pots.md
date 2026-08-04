# Source Metadata

Course: Smash Live Cash  
Module: 3-Post flop 3-Bet Pots  
Lesson: Adjusting vs Bluff-Deficient Ranges (AKTss Part 2) in 3-Bet Pots  
Instructor: Nick Petrangelo (Nicky P)  
Original filename: 30- Adjusting vs Bluff-Deficient Ranges (AKTss Part 2) in 3-Bet Pots.mp4  
Source duration: 09:38  
Source type: audio extracted from video  
Primary language: English  
Visual information available: yes, but not included in the current evidence package  
Transcription model: whisper.cpp large-v3, English forced  
Processing date: 2026-08-04  
Source status: NEEDS_VISUAL_REVIEW

# Detailed Transcript

## [00:00] Rebuilding the OOP Range Around Realistic Bluff Frequency

Nick continues the A-K-T two-tone 3-bet-pot study. The equilibrium OOP range contains low suited connectors at meaningful preflop frequency and then c-bets many of them despite very low immediate equity. He rebuilds the range around a more humanly realistic assumption: fewer of these hands preflop and much less willingness to barrel complete air on the flop.

[VISUAL REQUIRED]
The instructor is navigating preflop charts and PioSolver. Exact suits, range weights, selected nodes, sizes, frequencies and EV values require the original video or screenshots.

## [01:35] Elite Opponents Versus Bluff-Deficient Opponents

Against elite or well-studied opponents who actually arrive with the low suited connectors and continue barreling them, IP must defend close to the solver and protect the range widely. Against players who do not take those preflop and flop actions, the later-street strategy changes materially.

## [03:10] Why Missing Low Suited Connectors Changes River Defence

The equilibrium turn and river bluffs are frequently drawn from low suited connectors and paired low cards that have little showdown value. They support bluffs on flush-completing, straight-completing and paired runouts. If those hands are absent, the OOP range becomes much more concentrated in Ax, Kx, made pairs and natural broadway draws.

## [04:48] Node-Locking the Hard-to-Find C-Bets

Nick reduces the preflop frequency of hands such as J9s, J8s and T9s and lowers the flop-bet frequency of the no-equity suited connectors. He still gives the model some natural flush draws and broadway bluffs, describing the lock as relatively generous rather than an extreme assumption.

## [06:24] IP Can Fold Strong-Looking Bluff Catchers

Once the difficult bluffs are removed, IP is permitted to fold much more on the turn. Hands such as AQ and AJ become indifferent or clear folds on later runouts. On four-flush, paired and one-liner runouts, OOP has very few natural bluffs unless the missing suited connectors were preserved earlier.

## [08:06] Practical Bluff-Catching Rule

The practical conclusion is not to copy solver defence frequencies without checking how the opponent constructed the range. Before calling, identify which exact flop bluffs can survive to the river. If those candidates were missing preflop or checked on the flop, large folds become correct even with apparently strong bluff catchers.

# Extracted Poker Objects

## Hand Examples

- 3-bet pot on the A-K-T two-tone board family.
- OOP aggressor versus IP caller.
- Exact suits, stack, sizes and frequencies: `NEEDS_VISUAL_REVIEW`.

## Charts and Solver Screens

- Equilibrium OOP 3-bet range.
- Human-adjusted node-locked preflop and flop ranges.
- Turn and river defence comparisons.

## Explicit Statements by the Instructor

- Later-street defence depends on whether OOP actually reaches the node with the low suited connectors that support equilibrium bluffs.
- Small preflop and flop-frequency changes can materially alter turn and river bluff density.
- Against bluff-deficient players, IP can fold much more than equilibrium.
- Blockers matter only after confirming that the opponent retains the underlying bluff candidates.

## Uncertainties Requiring Review

- Exact board suits, stack depth, preflop range weights and bet sizes.
- Exact turn and river frequencies and solver EV values.
- Exact combinations altered in each node lock.
