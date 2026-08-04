# Source Metadata

Course: Smash Live Cash  
Module: 2-Post flop Single-Raised Pots  
Lesson: Vs Tight-Passive Players (Button vs Big Blind) Part 1  
Instructor: Nick Petrangelo (Nicky P)  
Original filename: 6- Vs Tight-Passive Players (Button vs Big Blind) Part 1.mp4  
Source duration: 19:29  
Source type: audio extracted from video  
Primary language: English  
Visual information available: yes, but not included in the current evidence package  
Transcription model: whisper.cpp large-v3, English forced  
Processing date: 2026-08-04  
Source status: NEEDS_VISUAL_REVIEW  

# Detailed Transcript

## [00:00] Population Leak: Weak Flop Defence

Nick introduces BTN versus BB as a common 100bb no-ante spot. The target profile reaches the flop with a plausible preflop range but lacks check-raises, folds too often and under-bluffs. IP can respond with thinner value and more frequent air bets because the checking range is not protected.

## [01:55] Use Reports to Reach an Answer, Not as the Answer

The spreadsheet and equilibrium solve provide the baseline. The practical question is whether real opponents defend and check-raise closely enough for the equilibrium checking frequency to remain necessary.

## [03:50] King-Six-Three Rainbow Baseline

On K-6-3 rainbow, equilibrium retains a substantial BTN check-back range and primarily uses a small c-bet. Strong hands, air and mixed checks protect the strategy against a BB that finds difficult continues and creative check-raises.

## [05:45] Model the Live Big-Blind Range

Nick argues that many $2/$5 through $10/$20 live opponents lack the balanced preflop and postflop bluff regions shown by the solver. A wider but bluff-deficient BB range alone does not dramatically change BTN's c-bet; the decisive leak is what BB does versus the bet.

## [07:38] The Difficult BB Continues

Equilibrium asks BB to continue and check-raise with weak pairs, ace-highs, backdoors and low-card hands. Low cards are valuable check-raise components because they do not block BTN's weakest c-bets.

## [09:31] Why the Population Misses the Defence

The required defence contains second-pair raises, bottom-pair raises, weak backdoors and broadway backdoors. Nick treats many of these as unrealistic for the average tight-passive live opponent.

## [11:26] Node-Locking the Missing Raises

He reduces frequencies rather than deleting every bluff. The purpose is to represent a player who occasionally finds an aggressive line but systematically under-raises the relevant categories.

## [13:20] BTN Response to Under-Defence

Once BB's check-raise and continue frequencies are reduced, BTN can simplify toward betting the flop much more often. The exploit comes from winning immediately and from avoiding punishment when betting thinly.

## [15:15] Scope of the Flop Exploit

The flop adjustment is not assumed to persist unchanged. A player who calls but rarely raises reaches the turn with fewer high-card bluffs and proportionally more made hands.

## [17:10] Transition to Turn Strategy

Nick closes by separating the easy flop profit from the next problem: how to play turns against the stronger, more condensed calling range created by the exploit.

# Extracted Poker Objects

## Hand Examples

### Example — BTN vs BB on K-6-3 rainbow

- Stack: 100bb
- Structure: no ante
- Baseline: BTN small c-bet or check
- Exploit target: BB under-defends and under-check-raises
- Exact suits, ranges and frequencies: NEEDS_VISUAL_REVIEW

## Charts and Solver Screens

- 50-flop / aggregate report used to select K-6-3 rainbow.
- Equilibrium BTN c-bet matrix.
- BB call and check-raise matrix.
- Node-locked weak-defence response.

## Explicit Statements by the Instructor

- Start from equilibrium, then alter the response that real opponents fail to execute.
- A wider preflop range does not automatically justify a radically different c-bet; postflop defence is the key variable.
- Against a BB that over-folds and under-check-raises, BTN can bet air and thin value more frequently.
- After the flop exploit, expect the calling range to be stronger on the turn.

## Uncertainties Requiring Review

- Exact suits and all displayed frequencies require the video.
- Exact node-lock weights and which combinations were reduced require the solver screen.
