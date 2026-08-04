# General Live Cash — Initial Reasoning Diagnostic v0.1

Status: `MANUAL_DIAGNOSTIC_READY`

Purpose: establish a baseline misconception profile before structured study. This is not an exact-range exam.

## Instructions

For each item record:

- answer;
- one-sentence reason;
- confidence from 0–100;
- time taken.

Do not check the answer key until all questions are complete.

# Questions

## Section A — Node and depth

### 1. Effective stack

$2/$5. Hero has $1,250. Villain has $425.

What effective depth should drive the decision?

A. 250bb  
B. 170bb  
C. 85bb  
D. Depends only on Hero's hand

### 2. Straddled depth

$1/$3/$6 with a live straddle. Hero and Villain are $720 effective.

What is the most useful first approximation?

A. 240bb  
B. 120 straddle units  
C. Both numbers are identical strategically  
D. Stack depth is irrelevant after a straddle

### 3. Multiway effective depth

Hero has $900, Villain A has $270 and Villain B has $1,200 in a $1/$3 game.

Which statement is correct?

A. The hand is 300bb effective against everyone.  
B. Hero is 90bb versus A and 300bb versus B.  
C. Hero is 90bb against everyone because A is shortest.  
D. Multiway pots have no meaningful effective stack.

### 4. Position structure

Three players remain. Hero acts after the bettor but before another uncapped player.

Hero is:

A. closing action;  
B. sandwiched;  
C. heads-up in practice;  
D. automatically required to defend widest.

## Section B — Range source and size shape

### 5. Blind identity

The same dry flop is reached once versus BB and once versus a cold-calling SB.

Which default is more defensible?

A. Use the same c-bet plan because board cards are identical.  
B. Expect SB's range to be more condensed and reassess aggression.  
C. Bet more versus SB because SB is out of position.  
D. Blind identity matters only preflop.

### 6. Flop call filter

Villain is known to overfold flops. Hero increases c-bets and Villain calls.

On the turn Hero should:

A. continue bluffing automatically because Villain is weak;  
B. update Villain to a stronger surviving range;  
C. assume Villain has exactly top pair;  
D. ignore the call and use the preflop range.

### 7. Small versus large c-bet

Which branch generally forces wider calls and more linear raises when ranges are constructed normally?

A. Small/wide c-bet.  
B. Large/polar c-bet.  
C. Both require identical defence.  
D. Only board rank matters.

### 8. Read quality

You saw one river bluff from a player. You have no evidence about their flop overbet branch.

Best approach:

A. label the player aggressive everywhere;  
B. defend every large bet wider;  
C. keep flop branch near baseline until relevant evidence exists;  
D. assume river bluff proves wide preflop ranges.

## Section C — Aggression construction

### 9. Value-first principle

Before selecting turn bluffs, the first question is:

A. Which hand has the lowest showdown value?  
B. What is the weakest value hand for the intended size?  
C. Which card looks scariest?  
D. Which bluff would be most impressive?

### 10. Barrel job

A hand has little showdown value, blocks folds, has almost no equity and no useful river continuation.

Best classification:

A. automatic bluff;  
B. savage-air candidate;  
C. reject as a barrel candidate;  
D. value protection bet.

### 11. Turn ownership

A turn completes draws that are concentrated in Villain's flop-calling range.

The card:

A. automatically supports an overbet because it is scary;  
B. may repair Villain's range and reduce Hero's large-bet incentive;  
C. changes nothing because Hero was preflop aggressor;  
D. always requires checking.

### 12. Low-kicker top pair

Why can low-kicker top pair sometimes have more raise incentive than high-kicker top pair against a small wide c-bet?

A. Low kicker is always stronger.  
B. It needs protection and may unblock more high-card folds.  
C. Solvers always raise weak hands.  
D. High kicker cannot call.

## Section D — 3-bet and multiway

### 13. Value-heavy 3-bet

Against a strongly value-heavy 3-bet range, which family is most damaged by domination?

A. Dominated big cards.  
B. Every pocket pair equally.  
C. Every suited connector equally.  
D. Only premium pairs.

### 14. Over-wide 3-bettor

Villain 3-bets too wide but c-bets at normal high frequency.

Hero's flop continuation should generally move:

A. tighter;  
B. wider;  
C. unchanged regardless of board;  
D. to raise-only.

### 15. Branch split

A tight player bets overpairs on low flops and checks most high cards.

Correct directional response:

A. call the bet wider and check turn after check-back;  
B. defend tightly versus bet and attack suitable turns after check-back;  
C. treat both branches as equally strong;  
D. fold every branch.

### 16. Multiway bluff

Which candidate is generally strongest for a multiway bluff?

A. Zero-equity hand with no blocker.  
B. Pair-plus-draw that blocks strong continues and can improve nuttedly.  
C. Any offsuit high card.  
D. The hand with the prettiest blocker regardless of line.

## Section E — River and metacognition

### 17. Blocker ancestry

Hero blocks the nut flush. Before bluffing or hero-calling, Hero must first:

A. act because nut blockers are always powerful;  
B. reconstruct value, bluffs and folds that reached the node;  
C. ignore previous streets;  
D. compare only absolute hand strength.

### 18. Correct action, wrong reason

Hero makes a correct fold but says, “One pair can never call a huge river bet.”

Learning result:

A. mastered because action was correct;  
B. no feedback needed;  
C. repair required because the reasoning is structurally wrong;  
D. automatic promotion to advanced material.

# Answer key and diagnostic mapping

| Q | Answer | Primary dimension | Likely misconception if wrong |
|---|---|---|---|
| 1 | C | Effective depth | `MC-001` |
| 2 | B | Straddle translation | `MC-002` |
| 3 | B | Pairwise effective depth | `MC-001` |
| 4 | B | Multiway structure | `MC-024` |
| 5 | B | Range source | `MC-005` |
| 6 | B | Action filtering | `MC-007` |
| 7 | A | Size shape | `MC-012`, `MC-023` |
| 8 | C | Evidence calibration | `MC-015`, `MC-030` |
| 9 | B | Aggression construction | `MC-009` |
| 10 | C | Combo job | `MC-010` |
| 11 | B | Card ownership | `MC-011` |
| 12 | B | Protection/unblocker logic | `MC-013` |
| 13 | A | Range matchup | `MC-019` |
| 14 | B | Compensation test | `MC-020` |
| 15 | B | Branch modelling | `MC-021` |
| 16 | B | Multiway backup equity | `MC-025` |
| 17 | B | Bluff/value ancestry | `MC-022`, `MC-028` |
| 18 | C | Reasoning diagnosis | `MC-017` / meta-learning gap |

# Scoring

## Action score

- 1 point per correct answer: 18 maximum.

## Reasoning score

For each item:

- 2: correct mechanism stated;
- 1: partial or vague mechanism;
- 0: wrong mechanism or no reason.

Maximum: 36.

## Confidence calibration

Flag:

- high confidence on wrong structural answer;
- low confidence on consistently correct domain;
- correct `UNKNOWN / BASELINE` choices in later adaptive diagnostics.

## Interpretation

### Strong action, weak reasoning

High action score but low reasoning score:

- likely pattern recognition or guessing;
- prioritize variant drills and explanation requirements.

### Structural gaps

Two or more misses within one family:

- effective depth;
- range filtering;
- aggression construction;
- 3-bet ancestry;
- multiway;
- blocker audit.

Assign the corresponding initial drill pack.

### Suggested starting route

- 0–10 correct: begin Stage 1 and proceed sequentially.
- 11–14 correct: use misconception-weighted route.
- 15–18 correct: test Level 2 exceptions and time-pressure transfer before skipping foundations.

These thresholds are initial product-design defaults and should be calibrated after beta use.

## Diagnostic verdict

`INITIAL_REASONING_DIAGNOSTIC_CREATED`
