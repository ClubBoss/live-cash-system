# Lesson Analysis

## Source identity

- Course: Smash Live Cash
- Module: 3-Post flop 3-Bet Pots
- Lesson: Adjusting vs Bluff-Deficient Ranges (AKTss Part 2) in 3-Bet Pots
- Transcript path: `sources/smash-live-cash/transcripts/SLC_M03_L30_adjusting_vs_bluff_deficient_ranges_part_2_3bet_pots.md`
- Source status: NEEDS_VISUAL_REVIEW
- Analysis status: ANALYZED

## 1. Source-faithful summary

Nick compares equilibrium defence on A-K-T two-tone with a node-locked OOP range that contains fewer low suited connectors preflop and checks those hands more often on the flop. Removing these bluff candidates materially strengthens later barrels and allows IP to fold much more aggressively.

## 2. Core concepts

1. Later-street defence depends on the actual bluff candidates that survive from preflop and flop.
2. Small range-frequency changes can produce large turn and river effects.
3. Solver-wide bluff-catcher defence is necessary against players who construct the bluffs, not against players who cannot.
4. A blocker is not enough evidence by itself; the opponent must retain the relevant bluff region.

## 3. Assumptions and game conditions

- 3-bet pot, A-K-T two-tone family, OOP aggressor versus IP caller.
- Exact stack, suits, sizes and frequencies require visuals.

## 4. Relevance to Batumi preparation

High. Live opponents are often bluff-deficient on difficult multi-street runouts, making this a direct framework for avoiding expensive hero calls.

## 5. Compression candidates

- Before bluff-catching, ask: **what exact flop bluffs survive to this river?**
- If the low suited connectors are missing preflop or checked on the flop, fold more later.
- Do not defend at solver frequency against a player who cannot construct the solver bluff region.

## 6. Playbook admission decision

- Decision: CANDIDATE
- Confidence: medium-high on the mechanism; exact thresholds pending visuals and cross-source comparison.
- Destination: bluff-catching and 3-bet-pot exploit module.

## 7. Training conversion

Create river decisions where the same blocker changes value depending on whether the opponent's preflop and flop ranges contain the required low suited bluffs.
