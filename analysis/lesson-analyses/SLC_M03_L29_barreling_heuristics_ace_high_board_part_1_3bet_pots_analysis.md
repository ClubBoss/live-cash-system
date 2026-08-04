# Lesson Analysis

## Source identity

- Course: Smash Live Cash
- Module: 3-Post flop 3-Bet Pots
- Lesson: Barreling Heuristics on Ace-High Board (AKTss Part 1) in 3-Bet Pots
- Transcript path: `sources/smash-live-cash/transcripts/SLC_M03_L29_barreling_heuristics_ace_high_board_part_1_3bet_pots.md`
- Source status: NEEDS_VISUAL_REVIEW
- Analysis status: ANALYZED

## 1. Source-faithful summary

On an A-K-T two-tone flop in a 3-bet pot, the out-of-position 3-bettor has a strong range and uses a high-frequency c-bet. Petrangelo traces where future bluffs must originate. Natural draws are insufficient: low suited connectors, one-gappers, pair-plus-gutter hands, and apparently irrelevant low suited hands must enter the range preflop, c-bet the flop, and continue on selected straight-, flush-, paired-, and brick runouts. He also argues that small flop and turn sizes can exploit live players who fail to continue weak pairs and marginal top pairs often enough.

## 2. Core concepts

1. Later-street bluff density is created on earlier streets.
2. A player cannot wait until the turn or river to search for bluffs if the necessary hand classes were absent preflop or checked on the flop.
3. Low suited connectors can be superior bluff candidates because they do not block the opponent's folds and often avoid interacting with the call-call-fold region.
4. Small sizing can force difficult continues from hands live players prefer to discard.
5. Bluff selection changes by river: the relevant blocker is the opponent's actual call range on that branch.
6. One-card flush blockers are not always numerous enough; low pairs and suited connectors may need to continue bluffing.

## 3. Assumptions and game conditions

- Pot type: 3-bet pot
- Aggressor: out of position
- Flop family: A-K-T two-tone
- Range model: theory-based, diverse 3-bet range
- Stack depth: described as sufficiently deep for multiple sizings and three streets; exact depth requires video
- Population model: lower- to mid-stakes live players under-defend weak pairs and marginal made hands

## 4. Strategic classification

- Fundamental mechanism: bluff supply across streets
- Solver baseline: high-frequency OOP c-bet on a strong board
- Population tendency: failure to find hard continues; bluff-deficient later streets
- Exploitative deviation: use small sizes more aggressively with selected low-equity hands; value-weight larger sizes
- Instructor preference: when theoretical sizes are close, separate them exploitatively by population response

## 5. Relevance to current leak map

- 3-bet pots: direct and high relevance
- Multi-street planning: very high relevance
- Bluff selection: high relevance
- One-pair discipline: relevant from the defender's side
- Deep stack: relevant because the line preserves meaningful turn and river play

## 6. Cross-source comparison

- Candidate for Carrot Poker comparison on natural bluff candidates, unblockers, and range construction
- Candidate for FTGU comparison on betting small with range advantage
- Exact hand frequencies, suit identities, and sizing thresholds remain unverified

## 7. Compression candidates

### Candidate H-M03-07 — Seed future bluffs early

> Before betting a value-heavy runout, ask which low-equity hands entered preflop and bet the flop. If none did, the later range is probably bluff-deficient.

### Candidate H-M03-08 — Bluff supply test

> “I will bluff when I have a blocker” is incomplete. First count whether the line naturally contains enough blocker hands; if not, selected low pairs and suited connectors must carry the bluff load.

### Candidate H-M03-09 — Live small-bet pressure

> Small bets gain extra value when the opponent is supposed to continue weak pairs but instead reacts to the fact that another bet entered the pot.

## 8. Playbook admission decision

- Decision: CANDIDATE
- Destination: 3-bet pots / multi-street bluff construction / scary runouts
- Confidence: high on the mechanism, medium on individual combos and exploit magnitude
- Required validation: video, exact solver tree, and cross-source confirmation

## 9. Training conversion

- Drill: for five turn cards after a small flop c-bet, identify the bluff supply created by the preflop range and flop action.
- In-game prompt: “What worse hand did I deliberately carry here to bluff, and what folds does it unblock?”

## 10. Sharky candidates

- Mechanism: `bluff-supply lineage`.
- Repair concept: `river-bluff-from-nowhere`.
- Drill family: `seed → carry → finish`.
