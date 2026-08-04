# Lesson Analysis

## Source identity

- Course: Smash Live Cash
- Module: 3-Post flop 3-Bet Pots
- Lesson: Preflop Adjustments vs Locked 3-Bet Ranges Part 3
- Transcript path: `sources/smash-live-cash/transcripts/SLC_M03_L26_preflop_adjustments_vs_locked_3bet_ranges_part_3.md`
- Source status: NEEDS_VISUAL_REVIEW
- Analysis status: ANALYZED

## 1. Source-faithful summary

The lesson examines the opposite extreme from the value-heavy profile: a BB range that is too wide and then c-bets too much. Petrangelo argues that players usually fail to make the compensating high-frequency flop checks required by an overly weak range. The in-position player can therefore continue substantially wider preflop and on the flop, then expect the opponent either to over-bluff later or to give up too much on turns.

## 2. Core concepts

1. A preflop deviation changes the correct postflop baseline.
2. A range that is too wide must check more frequently postflop to preserve its weak hands.
3. Real players commonly keep using a normal or aggressive c-bet strategy instead of making that compensation.
4. The defender can respond by continuing more hands on the flop and being stickier on suitable later runouts.
5. Opponent modelling should remain fluid rather than assigning one static chart to every loose player.

## 3. Assumptions and game conditions

- Position: BTN versus BB 3-bet
- Opponent profile: too wide preflop and too aggressive on the flop
- Stack depth / board: shown in solver but not fully recoverable from audio
- Analysis type: node-locked preflop range plus forced wide c-bet

## 4. Strategic classification

- Fundamental mechanism: weak-range compensation and bluff density
- Population tendency: loose preflop aggressors fail to check enough on the flop
- Exploitative deviation: expand continuation and prepare to call down or capture turn give-ups
- Instructor preference: infer later-street tendencies from the combined preflop and flop profile

## 5. Relevance to current leak map

- OOP versus frequent 3-bettors: high relevance from the defender's perspective
- 3-bet pots: direct relevance
- Bluff-catch discipline: relevant because wider ranges create more natural bluffs
- Deep stacks: likely relevant, but exact stack in this lesson needs visual confirmation

## 6. Cross-source comparison

- Candidate for comparison with Carrot Poker range-width mechanics and FTGU c-bet construction
- No conflict identified yet
- Exact call-down thresholds remain visual and runout dependent

## 7. Compression candidates

### Candidate H-M03-03 — Loose range must compensate

> When an opponent enters the flop too wide but c-bets as if their range were normal, defend wider: they either contain too many bluffs now or must surrender too much later.

### Candidate H-M03-04 — Read the sequence, not one statistic

> “Loose 3-bettor” is not enough. Combine preflop width, flop c-bet frequency, and turn follow-through before choosing the exploit.

## 8. Playbook admission decision

- Decision: CANDIDATE
- Destination: 3-bet pots / versus wide BB aggression
- Confidence: high on the mechanism, medium on executable hand thresholds
- Required validation: exact solver node and cross-source support

## 9. Training conversion

- Drill: choose between `fold more`, `call flop and reassess`, and `call down wider` for profiles with different preflop/flop/turn combinations.

## 10. Sharky candidates

- Profile sequence: `wide 3-bet → wide c-bet → turn give-up`.
- Diagnostic question: `Did the opponent compensate for their weak preflop range?`
