# Source Metadata

Course: Smash Live Cash  
Module: 3-Post flop 3-Bet Pots  
Lesson: Preflop Adjustments vs Locked 3-Bet Ranges Part 1  
Instructor: Nick Petrangelo (Nicky P)  
Original filename: 24- Preflop Adjustments vs Locked 3-Bet Ranges Part 1.mp4  
Source duration: 08:51  
Source type: audio extracted from video  
Primary language: English  
Visual information available: yes, but not included in the current evidence package  
Transcription model: whisper.cpp large-v3, English forced  
Processing date: 2026-08-04  
Source status: NEEDS_VISUAL_REVIEW

# Detailed Transcript

## [00:00] Why Live BB 3-Bet Ranges Need a Separate Model

What's up? This is a quick video as part of our study of 3-bet pots versus the blinds. I will include this type of analysis for every position pair, but when we talk about playing against specific opponents, the BB 3-bet range varies a lot from player to player and the adjustments can be extreme.

If you face someone who does not include enough bluffs—which is difficult to do correctly—their range can become very value-heavy. In my live-cash experience, BB players often call too much and fail to 3-bet hands such as J7s and similar suited hands. You probably know the players in your games who have almost no BB 3-bet bluffs, or use them only infrequently. Their overall strategy is missing bluffs preflop and usually postflop as well.

I do not want you to take my word for it; we need to prove the adjustment. We will use a 200bb example with a very wide BTN opening range. That is what you can do against opponents who do not 3-bet enough.

[VISUAL REQUIRED]
The instructor is navigating preflop charts and PioSolver. Exact hand weights, color coding, selected nodes, frequencies, and EV values require the original video or screenshots.

## [01:38] BTN Opening and Equilibrium BB 3-Betting

You can open almost as wide as possible. This range is around the threshold of how far I would push it. If both blinds do not 3-bet enough and lack bluffs, BTN can go very wide and print. In this simulation the SB is still playing equilibrium, but our main concern is the BB 3-bet range.

We are looking at the 200bb no-ante spot. The equilibrium BB 3-bet range is polar and contains a lot of suited middle-region hands: J7s, T7s, J8s, J9s, T9s, suited connectors and similar hands, plus small amounts of offsuit material. These hands fold out dominated parts of BTN's wide opening range and create postflop barreling opportunities on runouts where the value region otherwise struggles to find bluffs.

## [03:05] BTN Continuation Against the Baseline Range

Against the equilibrium 3-bet range, BTN continues with pocket pairs, 54s and other suited connectors and one-gappers, T8s, suited broadways, suited aces, AQo and KQo. We are focusing on the call line rather than the 4-bet strategy.

For a tight-passive live profile, I give the opponent only small residual frequencies—roughly ten-percent weights—of many bluffs that equilibrium uses heavily. The point is not that the exact ten percent is correct; it prevents the example from becoming completely extreme while preserving the value-heavy shape.

If the BB omits the suited connectors and related bluffs, their later ranges also struggle to find natural barrels. They must reach for awkward bluffs with pairs and stronger hands because the low suited material never entered the pot.

## [04:34] Locking a Value-Heavy BB Range

After locking the value-heavy 3-bet range and re-solving, BTN's calling range becomes dramatically tighter. The actual practical answer will usually lie between equilibrium and this extreme lock, but the result shows the direction of the adjustment.

AQo becomes a very poor call in the displayed solution, losing about three big blinds; jamming would lose much more. Many Ax hands and suited broadways also lose substantial value. Do not panic and assume you must always play exactly this tight. The purpose is to understand which hand classes survive best against a range that is concentrated around premium value.

The low suited connectors remain among the better continues. 98s is a notable exception in this example: many boards on which 98s makes a strong hand also interact well with a tight 3-bet range, particularly deep. The exact comparison and EVs require the visual chart.

## [06:04] Which Hands Retain Value Against the Tight Range

The broadway region performs poorly because it is dominated by the opponent's strong Ax and premium high-card range. The practical adjustment is to fold many Ax, KQ and AQ combinations, then evaluate whether any negative preflop call can truly be recovered postflop.

It is tempting to say, “This player is tight-passive and weak postflop, so I will call my normal range and outplay them.” The problem is that their range contains too many strong hands. On high-card boards they are often already near the top of range with their offsuit holdings, and they can deny your ability to realize equity. A player who 3-bets this tightly is not necessarily the same player who stacks off incorrectly on every bad board.

More often, you cool yourself and leak big blinds with dominated ace-highs, broadways and marginal pairs.

## [07:38] Practical Live Adjustment and Next Step

My practical recommendation is to keep the pocket pairs and the best low suited connectors, while committing to folds with much of the big-card region. Then take the same logic and adjust it opponent by opponent.

This example is BTN versus BB against a range with very few bluffs. Future videos will look at looser profiles. We will also carry this adjusted preflop range into postflop examples to see where BTN can recover EV and where the strength of the tight range shuts BTN out completely.

# Extracted Poker Objects

## Hand Examples

### Example 1 — BTN versus BB, 200bb, no ante

- Timestamp: 01:38
- BTN opens very wide against blinds believed to under-3-bet.
- BB's equilibrium 3-bet range is compared with a value-heavy locked range containing only small residual bluff frequencies.
- The resulting BTN call strategy becomes dramatically tighter.

## Charts and Solver Screens

- Preflop charts for BTN opening, BB 3-betting, and BTN continuing versus the 3-bet.
- Node-locked BB 3-bet range and the re-solved BTN response.
- Exact hand weights and EV values: `NEEDS_VISUAL_REVIEW`.

## Explicit Statements by the Instructor

- Live BB 3-bet ranges often contain too few bluffs and too many calls.
- BTN can open very wide when both blinds under-3-bet.
- Against a strongly value-heavy BB 3-bet range, big offsuit cards and many suited broadways lose substantial value.
- Pocket pairs and the best low suited connectors retain more value than dominated high-card hands.
- Calling the normal range merely because the opponent is weak postflop can still be a leak when the opponent begins with too many strong hands.
- 98s can perform worse than neighbouring low suited connectors against a tight deep range because many of its strong boards also interact well with the tight range.

## Uncertainties Requiring Review

- Exact preflop chart weights and all mixed frequencies shown on screen.
- Exact suits, available 4-bet strategy, and displayed EV values.
- The exact board sequences referenced when explaining why 98s performs poorly.
- Any hand-level boundary that depends on cursor position or color intensity rather than explicit speech.
