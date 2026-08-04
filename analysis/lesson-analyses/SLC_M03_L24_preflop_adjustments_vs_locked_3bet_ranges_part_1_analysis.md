# Lesson Analysis

## Source identity

- Course: Smash Live Cash
- Module: 3-Post flop 3-Bet Pots
- Lesson: Preflop Adjustments vs Locked 3-Bet Ranges Part 1
- Transcript path: `sources/smash-live-cash/transcripts/SLC_M03_L24_preflop_adjustments_vs_locked_3bet_ranges_part_1.md`
- Source status: NEEDS_VISUAL_REVIEW
- Analysis status: ANALYZED

## 1. Source-faithful summary

Nick Petrangelo models a common live profile: a BB player who calls too much and 3-bets a range with far too few bluffs. He compares the normal 200bb no-ante BTN-versus-BB structure with a value-heavy node-locked BB range. The re-solved BTN response becomes much tighter, especially with dominated offsuit high cards and suited broadways. Small pairs and strong low suited connectors retain more value because they are less dominated and can make nutted hands.

## 2. Core concepts

1. Preflop defence must respond to the opponent's actual 3-bet composition, not only the observed frequency.
2. A low 3-bet frequency allows wider BTN opening, but the hands chosen to continue after a 3-bet must tighten sharply when the range is value-heavy.
3. Dominated high-card hands suffer most against a concentrated premium range.
4. Low suited connectors and pocket pairs can outperform visually stronger broadways because their value comes from nutted outcomes rather than dominated pair strength.
5. A weak opponent postflop does not automatically justify a negative preflop call when their starting range is too strong.

## 3. Assumptions and game conditions

- Position: BTN versus BB
- Stack depth: 200bb
- Ante: no ante
- Opponent profile: tight-passive or bluff-deficient BB 3-bettor
- Analysis type: equilibrium baseline compared with a node-locked range
- Visual dependency: exact range weights and EV values remain unverified

## 4. Strategic classification

- Fundamental mechanism: domination and range concentration
- Solver baseline: equilibrium 200bb BTN versus BB
- Population tendency: live BB under-3-betting and under-bluffing
- Exploitative deviation: open wider before action reaches BB, but continue much tighter after the value-heavy 3-bet
- Instructor preference: retain pocket pairs and the best low suited connectors; fold many big-card calls

## 5. Relevance to current leak map

- OOP versus 3-bets: indirect; reinforces profile-specific preflop defence
- Deep-stack discipline: high relevance at 200bb
- One-pair / reverse implied odds: high relevance because dominated high cards are specifically downgraded
- Blind play: high relevance
- Multiway: none

## 6. Cross-source comparison

- Reinforces: the project rule that stack depth alone is insufficient; range composition and effective domination matter
- Candidate for later comparison with: Carrot Poker material on reverse implied odds and FTGU material on 3-bet defence
- Missing evidence: exact chart boundaries and whether 98s is uniquely downgraded at all relevant sizes or only in this solve

## 7. Compression candidates

### Candidate H-M03-01 — Value-heavy 3-bet filter

> Against a live 3-bettor with too few bluffs, remove dominated big cards first; retain hands that can make nutted outcomes without sharing the opponent's high-card region.

### Candidate H-M03-02 — Weak player does not mean wide call

> Do not justify a losing preflop call only by saying the opponent is weak postflop; a range that starts too strong can deny the realization you expected.

## 8. Playbook admission decision

- Decision: CANDIDATE
- Destination: Preflop / BB 3-bet profiles / 150–200bb delta
- Confidence: medium-high on the mechanism, medium on exact hand boundaries
- Required validation: charts/video plus cross-source comparison

## 9. Training conversion

- Drill: classify ten candidate calls into `dominated high-card`, `nutted-potential`, or `marginal` against a bluff-deficient 3-bet range.
- Prompt: “Am I continuing because this hand is actually profitable, or because I expect to outplay a range that is simply too strong?”

## 10. Sharky candidates

- Opponent profile card: `BB 3-bets rarely / value-heavy`.
- Repair concept: `weak-player-overcall`.
