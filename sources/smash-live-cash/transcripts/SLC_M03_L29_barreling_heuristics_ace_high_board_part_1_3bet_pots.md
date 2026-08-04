# Source Metadata

Course: Smash Live Cash  
Module: 3-Post flop 3-Bet Pots  
Lesson: Barreling Heuristics on Ace-High Board (AKTss Part 1) in 3-Bet Pots  
Instructor: Nick Petrangelo (Nicky P)  
Original filename: 29- Barreling Heuristics on Ace-High Board (AKTss Part 1) in 3-Bet Pots.mp4  
Source duration: 18:37  
Source type: audio extracted from video  
Primary language: English  
Visual information available: yes, but not included in the current evidence package  
Transcription model: whisper.cpp large-v3, English forced  
Processing date: 2026-08-04  
Source status: NEEDS_VISUAL_REVIEW

# Detailed Transcript

## [00:00] Why A-K-T Supports an Aggressive OOP C-Bet

We are going to examine the out-of-position c-bet strategy in a 3-bet pot on A-K-T two-tone. The goal is to understand which combos must exist preflop and which hands must begin betting on the flop so that OOP can have bluffs across different runouts.

This is a very aggressive c-bet board because it is extremely good for OOP. We begin with the equilibrium strategy, which I will call the solid-pro strategy: a player who is playing preflop well enough that, even if the exact combo weights differ, the range has the correct shape.

The bluffing heart of the BB 3-bet range contains hands such as J8s and T8s, the suited one-gapper region, and lower suited connectors such as 54s, 65s, 76s and 87s. There may also be some suited Ax depending on how the preflop range is constructed. The value region remains the expected premium hands—roughly JJ+, with AQ and related broadway material mixed according to the solve.

[VISUAL REQUIRED]
The instructor is navigating preflop charts and PioSolver. Exact suits, range weights, selected nodes, bet sizes, frequencies, equity and EV values require the original video or screenshots.

## [01:30] Where the Necessary Flop Bluffs Come From

Those low suited hands must appear preflop at meaningful frequency, and then they must begin betting this flop aggressively. It is difficult to implement if you have not studied it. Hands such as 54s may bet at meaningful frequency despite having almost no immediate showdown value. Pair-plus-gutter hands, weak Tx, and apparently irrelevant suited connectors all contribute to the c-bet range.

The reason is that many of the more obvious preflop bluffs have now made a pair or a draw. J9s has a draw; T8s and T9s have pair or draw interaction; QTs and KJ may already be made hands or strong draws. If OOP only bets the obvious hands, later Q, J, flush and brick runouts will not contain enough bluffs.

If you or your opponent misses the low suited connectors preflop or checks them on the flop, the range becomes bluff-deficient on future streets.

## [03:00] IP Defence Versus Small and Large Sizes

Now look at what IP is supposed to continue against. The small size is difficult to defend against because many hands are close to indifferent and the defence mixes across a large part of the range. That gives the small bet practical appeal: live players may not find the marginal continues required by theory.

When comparing the small and larger sizes, I do not expect live opponents to find all the tight folds against the big bet, but I also do not expect them to find all the loose continues against the small bet. Against a larger bet, the defender is supposed to fold some weak Ax and Kx combinations whose kickers block OOP's natural bluffs. The exact combo pattern is visible in the solver.

Against the small bet, low pocket pairs and other weak made hands may need to continue and sometimes raise. Lower- and mid-stakes live players often enter “fight or flight” mode in a deep 3-bet pot and do not want to continue with 22–99 against a range they perceive as strong.

## [04:30] Exploitative Sizing When Opponents Under-Defend

When two theoretical c-bet sizes have similar EV, I prefer to manipulate them according to the population response. I will be more value-heavy in the larger size because opponents are not finding enough tight top-pair or strong-pair folds. I will place more bluffs into the small size because the small bet gets through hands that are theoretically supposed to continue.

The goal is not to become the player who refuses to adapt. If an opponent does not continue the low pairs that theory requires, we should recognize two consequences:

1. our small c-bets earn extra folds immediately;
2. when that opponent reaches later flush- or straight-completing cards, they are unlikely to contain the correct bluff candidates themselves, allowing us to make larger folds against their value-heavy lines.

## [06:00] Hard Continues That Live Players Miss

The difficult continues are memorable once you see them. The defender may need to continue pocket pairs and weak made hands because they form the bottom of the range that prevents OOP from betting everything profitably.

If those hands disappear, the defender also loses later bluff candidates. This is important for our own development: we want to become the player who can continue appropriately rather than the regular who preserves comfort at the cost of being run over.

Take the small-bet line and examine difficult turns. Because OOP entered preflop with J9s, J8s, some J7s and other low connected hands, many straight-completing turns still leave OOP with a strong, coherent range. OOP can use a small linear bet with thin value, including some two-pair and pair-plus-draw hands, while carrying the lowest suited connectors as bluffs.

## [07:30] Barreling Straight-Completing Turns

On a straight-completing turn, OOP may continue with 54s, 65s, 76s, T8s and T9s—the hands that had to begin betting the flop. Some of these hands now contain bottom pair or a gutter; others remain low-equity bluffs.

The blocker logic matters. If the defender's flop calls contain weak Ax, Kx, Tx, pocket pairs and pair-plus-draw hands, the best bluffs should avoid blocking those folds. Some middling connectors perform poorly as bluffs because they block exactly the combinations OOP is trying to make fold.

Against live players, the small second barrel may make extra money because many opponents react inelastically to size. They see another bet in a 3-bet pot and release weak top pairs or marginal pairs without considering that the bet is small and the range must still contain bluffs.

## [09:00] Finding Bluffs on Flush-Completing Turns

Now consider a low flush-completing turn. The natural Jx and Qx draws are easy to find; any competent player who found the preflop 3-bet will recognize a gutter or obvious blocker. Those hands alone are not enough.

OOP must sometimes continue betting hands such as T8, a low pair, 65s or 54s. The hands that paired the low turn after c-betting the flop can become pure or high-frequency bluffs on selected branches.

A common mistake is to say, “I will wait until I have one card of the flush suit.” Stop and ask which one-suit hands actually exist. The range may contain AQ or KQ with the relevant suit, but those are often too strong or too valuable to supply the entire bluff region. If the only candidate bluffs are strong broadways, the line is not properly constructed.

## [10:30] Why Low Suited Hands Support Three Streets

Low suited connectors such as 54s and 65s interact very little with the defender's call-call-fold range. That makes them useful three-street bluff candidates. They preserve folds, can continue across many runouts, and allow the value region to be paid on bricks, paired boards and completed draws.

The point of carrying bluffs is not only “balance” in an abstract sense. If we value-bet a set and the board pairs, the defender needs to face enough bluffs to call. If we make a flush on a brick river, the defender must believe the line can contain missed low hands. These bluffs support value realization, and against under-defending opponents they can also make extra money directly.

## [12:00] Linear Versus Polar Turn Construction

Not every turn uses the same structure. On some straight-completing cards, many hands remain close together in equity, allowing a small, relatively linear bet. On lower-equity or more polarizing cards, the strategy shifts toward a larger size or check.

Looking only at total equity can be misleading. You need to ask where the equity comes from and how it is distributed across the range. A range with many medium-strength hands can bet small and broadly. A range split between premium hands and dust prefers a larger polar size.

The exact value threshold and size in the displayed solve require visual review. The audio indicates that premium two pair and sets form much of the larger value region, while the low suited hands supply the weakest bluffs.

## [13:30] Population Under-Defence on Scary Turns

Against a flush-completing turn, IP may theoretically need to continue roughly two-thirds of the range. Much of that defence has to come from Ax, suited hands and marginal made hands because the only major offsuit hands are AK and AQ.

I do not expect many live opponents to recognize this. They see a hand such as A9 without the relevant redraw on a scary board and think it is struggling—which it is, even against a correctly constructed range. Against a human range that lacks the low air-ball bluffs, the hand may be doing even worse.

This creates a strong exploit opportunity when Hero actually carries the required low bluffs. A medium or small turn bet can get through too many weak top pairs and marginal continues.

## [15:00] River Bluff Selection and Call-Range Blockers

If IP calls the scary turn and the river bricks, OOP's bluff selection changes. Some low suited connectors can continue, but the value range is tighter and other hands may have better blockers to the river call range.

At this point, Jx and Qx become more important because IP's river calls may be concentrated around Qx, Jx and related made hands. The correct river bluff is not automatically the hand that was the best turn bluff. The relevant question is: which hands block the defender's actual river calls without blocking folds?

On the displayed branch, the solver sometimes shifts from low irrelevant hands toward Jx and Qx bluffs. Exact hand weights and bet sizes require the screen.

## [16:30] Paired Rivers and Low-Connector Bluffs

On paired rivers, the low connectors can return as high-frequency bluffs. For example, when the board pairs a ten, hands such as 54s, 65s and 76s may become pure or nearly pure bluffs because they do not block the defender's bluff-catchers and they preserve the value story.

These hands keep the range intact and are also the hands most likely to make extra money against live defenders who do not call often enough.

## [18:05] Transition to the Bluff-Deficient Response

The next part will reverse the perspective. After seeing how aggressively a well-constructed range must carry suited connectors, one-pair-plus-gutter hands and apparently irrelevant low cards, we can remove those bluffs from an opponent's range and observe how much more tightly IP should defend.

The practical question becomes: if we are the caller rather than the barreler, how do our call frequencies change when the opponent underuses these hands preflop and on the flop?

# Extracted Poker Objects

## Hand Examples

### Example 1 — OOP 3-bettor on A-K-T two-tone

- Equilibrium c-bets very aggressively because the board strongly favours the 3-bettor.
- Bluff candidates begin with suited connectors, suited one-gappers, pair-plus-gutter hands, and low suited hands that appear irrelevant on the flop.

### Example 2 — Small flop bet into straight- and flush-completing turns

- Low suited connectors such as 54s, 65s and 76s are carried forward as turn and sometimes river bluffs.
- Pair blockers and the opponent's call-call-fold region influence later-street bluff selection.

## Charts and Solver Screens

- OOP c-bet matrix on A-K-T two-tone.
- IP defence versus small and larger flop bets.
- Turn and river strategies across straight-completing, flush-completing, paired and brick runouts.
- Exact suits, frequencies, bet sizes and individual hand EVs: `NEEDS_VISUAL_REVIEW`.

## Explicit Statements by the Instructor

- A well-constructed 3-bet range must carry low suited connectors and one-gappers at meaningful frequency to create enough future bluffs.
- If those hands are absent preflop or not c-bet on the flop, later straight- and flush-completing runouts become bluff-deficient.
- Small flop bets may make extra money in live games because opponents fail to find difficult continues with low pairs and weak made hands.
- When two theoretical sizes have similar EV, the instructor prefers a value-heavy large size and places more bluffs into the small size against under-defending live opponents.
- Waiting only for a natural one-card flush blocker can leave a range without enough bluffs; some low pairs and suited connectors must continue barreling.
- Bluff candidates change by river because the goal shifts toward blocking the opponent's actual call range.

## Uncertainties Requiring Review

- Exact preflop chart weights and all mixed frequencies shown on screen.
- Exact suits, pot size, stack depth, available solver sizings, equity and EV values.
- Exact hand identities on each straight-, flush- and paired-runout branch.
- Several short Whisper repetitions were removed where the same clause appeared consecutively; no strategic claim was added to replace them.
