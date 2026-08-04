# Source Metadata

Course: Smash Live Cash  
Module: 0-Intro  
Lesson: Intro to PioSolver  
Instructor: Nick Petrangelo (Nicky P)  
Original filename: Intro to Piosolver.mp4  
Source duration: 26:06  
Source type: audio extracted from video  
Primary language: English  
Visual information available: yes, but not included in the current evidence package  
Transcription model: whisper.cpp large-v3, English forced  
Processing date: 2026-08-04  
Source status: NEEDS_VISUAL_REVIEW

# Detailed Transcript

## [00:00] Why PioSolver Is Used in the Course

My dogs, my dogs. What are we staring at right here? We're staring at one of the greatest tools that the poker gods have ever sent down for us to use. Thank you, Piotr. Maybe not everybody who plays live cash games loves the solver. Maybe they do not use it a lot. Maybe they think it does not apply to their games. The truth is that this is a necessary tool, and we're going to use it extensively in this course.

First, we're going to use it to find a baseline strategy. You can call that theory-based, optimal, or equilibrium. I hate the term GTO; I do not like to use it. Whenever I say theory-based, optimal, or equilibrium, I mean the baseline strategy the solver produces after playing an enormous number of hands against itself, exploiting itself until it reaches a strategy where both players are playing perfectly against each other.

[VISUAL REQUIRED]
The instructor is showing the PioSolver interface. The exact version, configuration fields, and displayed tree settings are not available in the current audio-only evidence.

## [01:13] Baseline as a Foundation for Exploitative Play

Is that realistic to put directly into play? Absolutely not. Do I want you to play exactly like that, or do I play exactly like that? No. Is it the best way to understand how poker works, how cards interact, how ranges interact, and what you want to do on different boards before working from there? Yes.

We want to play exploitative poker all the time. We want to do whatever makes us the most money in every situation. That means doing whatever we think is best with our given hand in each situation we encounter. To understand how to do that, we need to know what a perfect strategy looks like.

We might say: this opponent is too tight, so I will not call the river as often as I should against someone aggressive; this opponent is too tight, so I will bluff him more; or this opponent does not have bluffs on this board. Those are useful ideas, but without equilibrium or a baseline, how do we know where and how far to deviate?

## [02:26] Establish Baseline, Then Model the Opponent

My big thing is always to establish the baseline, talk about what it looks like, and understand the shape of the strategy. Supercomputers and algorithmic programs are probably very smart. Poker is a math game, and we have limitations in the cards, boards, and spots we get.

We're going to use the solver to get the baseline, then do something called node locking: make it play the way we believe the opponent plays, based on our assumptions, and see what we should do in response.

All we're doing is saying: I know Jimmy does not 3-bet these hands; I know he has this range on this board and is too tight; I know that when he bets, he always has it. We put Jimmy into the computer and figure out how to play against him. It is as simple as that.

We do not have to be intimidated by the solver or think it only applies to super-high rollers or super-high stakes. It is for anyone who wants to understand how to play poker. Before solvers, we asked what our opponent was doing and how to adjust to make the most money, but our human brains have limitations. Now we can put our assumptions about tendencies, sizings, and ranges into specific spots, estimate what opponents will do, and let the program produce the best response under those assumptions.

## [04:26] Solver Setup Inputs

Let's talk about the basic functionalities I like to use and that we're going to use in this course. If you are already comfortable with the solver, you can move ahead. For completeness and to make sure we're all on the same page, I'm going to walk through it from start to finish.

This is a blank solver. We put in the ranges for the spot. These will be heads-up pots; we use a different solver for multiway. We enter the ranges, board, starting pot, stack sizes, and available bet and raise sizes. It then gives us the equilibrium strategy for a situation such as HJ versus BTN or BTN versus the blinds.

[VISUAL REQUIRED]
The exact input ranges, pot, stack, board, and tree-building fields need the original video.

## [05:29] Sizings as Study Abstractions, Not Scripts

I tinker with sizes all the time. For the purpose of study and hand analysis, we're not trying to say that one fixed size is mandatory in every situation. We're using the solver to get the shape of a strategy and an idea of what we want to do.

When you're in a game, use the size that feels right. I do not want to remove your intuition or feel for the game by saying you must always bet 20% pot on this flop, or that on the river you can only bet 50% or 100%. When I'm playing, sometimes I bet 40% on the turn, sometimes 33%; on the river, sometimes 66%, sometimes 40%. Use your intuition, especially in non-robotic live cash games and when playing very deep. The point is to understand the idea of the strategy.

Once we enter the sizes, board, and spot, the solver produces an answer. I'm going to load an equilibrium solve and a solve where I have edited how my opponent plays.

## [06:52] Equilibrium Solve and the Search for Extra EV

An equilibrium solve is the computer matching strategies against itself. It exploits itself until neither player can win extra money by changing strategy. Both players are responding perfectly to each other.

But we need to dig through these solutions and understand where we can make extra money from our opponents, what exploit we can use, what counter-exploit that leaves us open to, and whether the counter-exploit even matters.

Often you can exploit someone by betting too much or too little, calling too much or too little, making a hero call that becomes worth a lot, or making a bluff that becomes worth a lot. We're going to find those spots.

## [07:52] Why Human Deviations Change Play Values

In equilibrium, bluff-catching is generally worth no extra money. If you're bluffing and the opponent calls properly, the bluff is worth little or no extra money. But against humans, especially in deep-stack poker, there will be spots where an opponent significantly over-bluffs and all your bluff-catchers become worth a lot, or significantly over-folds and your bluffs become worth a lot. Conversely, when the opponent lacks bluffs on a river, you should be very tight and make extra money by folding almost everything that is not the nuts.

We're not using the solver as a script. We're using it to evaluate plays and see where extra money can be made against opponents.

## [09:06] Preflop Ranges and the Goal of Strategy Shape

Every setup will contain preflop ranges. I'm not going to go through the ranges every time we examine a simulation. I'll say that it is, for example, HJ versus BB in a single-raised pot. Going through all the preflop ranges every time is a waste of time and is boring.

If the preflop ranges are off by a small amount and nothing is wildly wrong, we can still get the shape of the strategy. The purpose of this software is to give us strategy shapes we can work from.

In this example I have a BTN range and a BB range, then the board and pot. The course uses [UNCLEAR AUDIO: the instructor appears to say “50/100” blinds] so the numbers are clean to track. Sometimes I remove the zeros and display everything directly in big blinds. The outputs are intended to be easily translatable into big blinds.

## [10:22] Tree Construction, Boards, and Teaching Method

I make sure there is a thorough abstraction with multiple raise sizes and a number of bet sizes. The exact tree-building details are not important here. In the browser, the board is always visible, although it is small. I'll try to repeat the board during videos, but especially at the beginning you may need to pause and look at it.

I'm going to discuss many hypotheticals and card interactions and teach small ideas you can use on the fly. This is not memorization. It involves a lot of talking, tangents, and hypotheticals.

I'm a huge proponent of using as few boards and as few examples as possible to illustrate many concepts that can then be extrapolated to other spots. It is not useful to memorize how to play King-Queen-Four, then King-Ten-Five, then King-Queen-Four with a flush draw as separate scripts. You need to understand how to play poker. The solver is not for memorizing 1,700 flop strategies. That is not reasonable.

The whole point is to get an idea of what is happening, then use what we see to dig in and beat games where nobody—even at the highest level—is playing close to the optimal strategy at every rare, nuanced, or esoteric node.

## [12:11] Reading the Strategy Tab

As we move through the tree, the actions appear in the interface. This example is BB versus BTN, beginning with a check. I'll click through many views. It may look overwhelming, but this is how I teach and how I learn, and I think it is the best way to use the solver.

The strategy tab is color-coded. There are usually two or three sizes plus check. In the displayed example, there is almost no use of the large size, and the strategy mainly mixes a small bet and check. Without reading every number, you can see which action is important from how much of each hand box is shaded. When you hover over a hand, the exact frequencies appear.

The instructor refers to a strategy with approximately 75% small betting in the displayed node. He explains that the broad visual pattern can tell you that the small bet is used often, while hovering gives exact hand-level frequencies.

[VISUAL REQUIRED]
The color-action mapping is internally unclear in the audio transcript, and the exact board, sizes, total frequencies, and A8s hand frequencies require visual verification.

## [13:57] Hand-Level Frequencies and Range Interactions

This is how we'll work when doing deeper theory study. I'll bring up a solution and say that we are betting small roughly 75% of the time, describe which hands prefer to check, hover over pairs and other hand classes, and point out exact frequencies in the interface.

I'll discuss the interactions that create the strategy while moving over the full hand grid. The upper triangle represents suited hands and the lower triangle offsuit hands. This is a basic functionality we'll use throughout the course.

## [14:52] Reading the Defender's Response

After the in-position player bets small, the display switches to the out-of-position strategy. The defender has fold, call, and multiple raise sizes. The strategy is color-coded, and the top of the screen displays aggregate percentages.

We can visually inspect the value region and how polar the raising strategy is. In this example, pocket Fours raise every time, while hands such as Q4 and K4 do not raise very often, and a larger raise size is part of the polar strategy.

[VISUAL REQUIRED]
The exact hand frequencies, raise sizes, color legend, and whether every pocket-Four combination is a pure raise require the original screen.

## [15:40] Comparing All Turn Runouts

One of my favourite tools is comparing what happens on different runouts. We may want to know what happens after BTN bets, BB calls, and the turn is a Five, Two, Three, Jack, or any other card.

I open a comparison window containing every possible turn card, from Deuce through Ace in every suit. The boxes correspond to specific cards such as 2c, 3c, 2d, and As. Selecting Strategy produces a visual and numeric summary showing how the in-position range plays on every card in the deck.

This is not the only way we'll study each turn card, but it is an important tool for getting a general idea of the strategy.

## [17:15] Aggregate Turn Frequencies

In the displayed example, after BTN bets and BB calls, the aggregate turn strategy checks about 63%.

The solution usually contains a small, medium, and large turn size. Across all turn cards in this example, the displayed aggregate frequencies are approximately 30% large bet, 4.3% medium bet, 2% small bet, and the remainder check. We can then inspect what the range does on any individual card.

[VISUAL REQUIRED]
The exact flop, flop size, turn sizes, aggregate frequencies, and individual card boxes require verification against the video.

## [17:58] Using Strategy, Equity, and EV Across Runouts

The aggregate view gives us an initial shape: in this example, when the range bets, it often uses the large size, while overall it does not bet very frequently. We can use the visual pattern to form that broad understanding.

Other tabs show equity and EV for each range on different cards. Equity is the chance a range has to win at showdown. The instructor describes the displayed equity view as color-coded and toggles between out-of-position and in-position ranges.

[UNCLEAR AUDIO / VISUAL REQUIRED]
The audio gives contradictory color descriptions for the equity scale. The low-to-high color mapping must be read from the screen rather than reconstructed from speech.

Because only 100% total equity exists between the two players, a high-equity card for one player is a lower-equity card for the other, though the instructor notes that range interaction is not always as simple as only reading that number. The point of the video is to explain tool usage, not teach the full theory of the specific node.

## [19:30] Expected Value and Isolated-Card Views

Expected value can be inspected in the same comparison window for both players. EV and equity are not identical because of equity realization and positional factors. [AUDIO TRANSCRIPTION GAP: a short phrase immediately before “back and forth between both players” was not recovered cleanly.] The EV values are shown relative to the pot. In the displayed line, the pot contains 11 units after a seven-unit pot and a bet of two, with the units treated as big blinds.

Most of the time we'll use the Strategy tab, but I'll click through EV and equity views to illustrate range-interaction points. The same views can also be opened on one isolated turn card to show every hand's exact equity or EV.

## [20:52] Range Explorer and Proportional Thinking

Another tool I'll use all the time is Range Explorer. Suppose the in-position player uses the large turn bet, gets called, reaches a river, and is checked to. Range Explorer is another way to read and analyse the data, but in a simpler form.

It shows what percentage of the range consists of each hand class. That is important for becoming a more precise player, locating exploits, understanding where a range is strong or weak, and seeing how equities shift based on the dominant combinations in the range.

In the displayed line, after the in-position player bets twice and uses the big size, Range Explorer shows figures such as approximately 14% flushes and 6% straights. The exact figures are example-specific.

If you still think only in raw combination counts, you need to change the way you think. Raw counts are incomplete if they ignore how often hands take a particular line or how frequently they exist in the range. You should think proportionally: what percentage of the range is made up of each hand class.

[VISUAL REQUIRED]
The exact board, line, hand-class percentages, filters, and colour meanings in Range Explorer require the original video.

## [22:45] Equity and EV Graphs in Range Explorer

Range Explorer can also display equity and EV and provide small graphs. I do not use those graphs very much in this course because they are not always the most important thing when we're trying to understand broad shapes. I will still highlight important equity shifts when relevant.

We can toggle between the players, and this is another major tool used in the course.

## [23:30] Aggregated Reports and Spreadsheet Views

The last tool we use quite a bit is the aggregated report. It exports the data into a spreadsheet so we can organize it and take a broad view of a spot before digging into individual nodes.

In the same way that the runout-comparison table gives a broad picture across cards, an aggregated Excel report can show many flops in one place. We'll use these reports at the beginning of some video series. The spreadsheet contains every board, each player's equity and EV, the available bet sizes, and the frequency of each action.

We can identify good and bad boards, sort for the highest-equity boards, inspect the strategy on those boards, or find the boards where the player checks most often. This is a tool for building a broad general understanding before detailed analysis.

[UNCLEAR AUDIO]
The instructor names the runout-comparison feature before comparing it with the spreadsheet report; the Whisper output sounds like “hotness comparison,” but the exact feature name requires the screen or original audio check.

## [25:20] Tools Used Throughout the Course and Transition to Node Locking

I do not want you to be dropped into a large number of spreadsheets without explanation. I'll explain them as the relevant videos come up.

The main PioSolver tools used throughout the course are the Strategy tab, switching between players, equity, EV, Range Explorer, runout comparisons, and aggregated reports.

Once we have the game-theory optimal strategy, the next part of the solver series asks where we make extra money and how we use the solver to emulate the actual play of our opponents. That is called node locking, which is a fancy way of saying: put in what we think this opponent is actually going to do.

# Extracted Poker Objects

## Hand Examples

### Example 1 — BTN vs BB Single-Raised Pot Interface Demonstration

- Timestamp: 09:06
- Positions: BTN vs BB
- Pot type: single-raised pot
- Purpose: demonstrate loading ranges, board, pot, stack, and tree settings
- Exact board and preflop ranges: not verified from audio

### Example 2 — Flop Small Bet and BB Response

- Timestamp: 12:11
- Positions: BTN vs BB
- Flop action: BB checks; BTN uses a small bet in the example; BB response is inspected
- Value / raise examples stated: 44 raises every time in the displayed solution; Q4 and K4 raise less often
- Exact board, suits, and frequencies: NEEDS_VISUAL_REVIEW

### Example 3 — Turn Runout Comparison

- Timestamp: 15:40
- Positions: BTN vs BB
- Prior action: BTN bets flop; BB calls
- Purpose: compare strategy, equity, and EV over all possible turn cards
- Aggregate numbers stated: check about 63%; approximately 30% large bet, 4.3% medium bet, and 2% small bet across all turn cards
- Exact board and sizes: NEEDS_VISUAL_REVIEW

### Example 4 — River Range Explorer

- Timestamp: 20:52
- Prior action: in-position player bets twice, including a large turn size, and is checked to on the river
- Example hand-class proportions stated: approximately 14% flushes and 6% straights
- Exact board, line, and filter settings: NEEDS_VISUAL_REVIEW

## Charts and Solver Screens

### Screen 1 — Blank PioSolver Setup

- Timestamp: 04:26
- Shows: ranges, board, starting pot, stacks, bet sizes, and raise sizes
- Status: NEEDS_VISUAL_REVIEW

### Screen 2 — Strategy Matrix

- Timestamp: 12:11
- Shows: hand grid, color-coded actions, aggregate frequencies, and hand-level hover frequencies
- Status: NEEDS_VISUAL_REVIEW

### Screen 3 — All-Runouts Comparison

- Timestamp: 15:40
- Shows: every possible turn card with Strategy, Equity, and EV views
- Status: NEEDS_VISUAL_REVIEW

### Screen 4 — Range Explorer

- Timestamp: 20:52
- Shows: range composition by hand class and related equity/EV views
- Status: NEEDS_VISUAL_REVIEW

### Screen 5 — Aggregated Excel Report

- Timestamp: 23:30
- Shows: boards, player equity, player EV, action sizes, and action frequencies
- Status: NEEDS_VISUAL_REVIEW

## Explicit Statements by the Instructor

- Use equilibrium as a baseline for understanding poker, not as a rigid script to copy in live games.
- Establish the baseline before deciding where and how to deviate against an opponent.
- Solver bet sizes are study abstractions used to understand strategy shape; live sizing can be adapted with judgment.
- Use as few representative boards and examples as possible to learn concepts that can be extrapolated to other spots.
- Do not try to memorize a separate strategy for every flop.
- Strategy, equity, EV, Range Explorer, runout comparisons, and aggregated reports are the main PioSolver tools used in the course.
- Think about hand classes as percentages of a range, not only as raw combination counts.
- Node locking is used to model how an opponent actually plays and calculate the best response.

## Uncertainties Requiring Review

- Exact PioSolver version and all setup parameters.
- Exact preflop ranges, board, pot, stack, and sizing tree in the demonstration solve.
- Whether the stated blind normalization is exactly 50/100.
- Exact strategy color legend at 12:11 and equity color legend at 18:22.
- Exact flop and turn bet sizes corresponding to the stated aggregate frequencies.
- Exact hand frequencies for A8s, 44, Q4, K4, and other hovered hands.
- Missing short phrase around 19:49 before the instructor resumes discussing both players' EV.
- Exact name of the runout-comparison feature referred to near 23:58.
- All visual spreadsheet columns and sorting selections.
