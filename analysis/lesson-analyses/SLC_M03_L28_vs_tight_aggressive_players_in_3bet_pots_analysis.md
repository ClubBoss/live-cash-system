# Lesson Analysis

## Source identity

- Course: Smash Live Cash
- Module: 3-Post flop 3-Bet Pots
- Lesson: Vs Tight-Aggressive Players in 3-Bet Pots
- Transcript path: `sources/smash-live-cash/transcripts/SLC_M03_L28_vs_tight_aggressive_players_in_3bet_pots.md`
- Source status: NEEDS_VISUAL_REVIEW
- Analysis status: ANALYZED

## 1. Source-faithful summary

Petrangelo studies a tight, value-heavy 3-bettor who lacks middling pairs and suited bluffs, then overplays overpairs on low flops while checking many high-card hands. Against the value-heavy flop bet, the defender must continue very tightly. When the flop checks through, however, the opponent's range becomes much weaker than equilibrium, allowing out of position to lead turns at very high frequency for value and protection.

## 2. Core concepts

1. The same opponent profile can require opposite adjustments on adjacent branches.
2. Bet branch: fold more because the c-bet is overpair-heavy and bluff-deficient.
3. Check-back branch: attack more because too many strong hands were removed by the overpair-heavy betting strategy.
4. Equilibrium checks some overpairs on low boards to protect a high-card-heavy checking range.
5. Live opponents often fail to find the light raises and marginal continues required against aggressive turn leads.

## 3. Assumptions and game conditions

- Pot type: 3-bet pot
- Board family: low board
- Opponent profile: tight preflop, high-card and premium-pair heavy, overbets overpairs relative to equilibrium
- Exact positions, board, stack, and sizings: visual review required

## 4. Strategic classification

- Fundamental mechanism: range splitting and branch-specific capping
- Solver baseline: protected check-back range containing overpairs
- Population tendency: overpairs bet too often; ace-high and king-high check too often
- Exploitative deviation: over-fold to the flop bet, then lead aggressively after check-check

## 5. Relevance to current leak map

- 3-bet pots: direct and high relevance
- OOP play: high relevance
- One-pair discipline: high relevance because the exploit begins with disciplined flop folding
- Player adjustment: high relevance

## 6. Cross-source comparison

- Strong candidate for Carrot Poker comparison on capped ranges and turn leads
- Strong candidate for FTGU comparison on protecting checking ranges
- Exact claim that turn checking frequency falls from roughly 70–75% to about 4% requires visual confirmation

## 7. Compression candidates

### Candidate H-M03-05 — Bet branch tight, check branch weak

> Against a tight player who bets overpairs too often: respect the flop bet, but attack the flop check-back. Their two branches are not equally strong.

### Candidate H-M03-06 — Ask what strong hands left the range

> Before attacking a capped range, identify which strong hands the opponent already spent in the prior action.

## 8. Playbook admission decision

- Decision: CANDIDATE
- Destination: 3-bet pots OOP / low boards / turn lead exploits
- Confidence: high on the branch logic, medium on frequencies and board boundaries
- Required validation: original solver visuals and cross-source review

## 9. Training conversion

- Drill: given a player who c-bets overpairs and checks high cards, choose the correct response on `bet` versus `check-back` branches.
- In-game prompt: “Did the flop action remove most overpairs from the range I now face?”

## 10. Sharky candidates

- Mechanism: `branch-strength inversion`.
- Lesson family: `respect bet / attack check`.
