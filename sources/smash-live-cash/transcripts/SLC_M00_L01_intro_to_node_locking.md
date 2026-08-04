# Source Metadata

Course: Smash Live Cash  
Module: 0-Intro  
Lesson: Intro to Node Locking  
Instructor: Nick Petrangelo (Nicky P)  
Original filename: Intro to Node Locking.mp4  
Source duration: 12:32  
Source type: audio extracted from video  
Primary language: English  
Visual information available: yes, but not included in the current evidence package  
Transcription model: whisper.cpp large-v3, English forced  
Processing date: 2026-08-04  
Source status: NEEDS_VISUAL_REVIEW

# Detailed Transcript

## [00:00] Purpose of Node Locking and Baseline Strategy

All right, guys. We're going to talk about something in this video that we are going to use a lot in this course, and it's super important. It's going to be really important after you guys finish this course and do your own study to understand how to use this functionality. This is the gist of everything we're doing. Like I said, our mission here is not to play optimal poker; it's to play optimally versus our opponents, meaning cater our strategies every single time we can understand where we're going to make extra money versus them.

The best way to do that is to first look at the optimal strategy. Then I'm going to give a really easy example of how we do this. Let's stick with the King-Queen-Four board and optimal play. The details of this hand do not really matter, but it is BTN versus BB. We're going to look at what BTN is supposed to do at equilibrium, then talk about what we think one certain player type might do, how we are going to cater the strategy, use the solver to emulate the people we're playing against, and use it to help us make extra money.

This is our introduction to node locking. Node locking just means making the computer play like the person we're playing against so that we can practise playing against different opponents in our games.

[VISUAL REQUIRED]
The instructor is navigating a PioSolver solution. Exact board suits, stack configuration, preflop ranges, pot size, available sizings, and displayed frequencies require the original video or screenshots.

## [01:26] Practical Use in Session Review

The way you're going to use this is whether you're reviewing a session and had a hand versus a player in your games that you know is over-bluffing or under-bluffing, and you want to figure out what you should do against that type of player. The computer solutions can help you go beyond what you're capable of figuring out with your brain. There is a lot the computer can help with.

We're going to take our assumptions, toss them into the computer, re-solve it, and see how we actually want to play against our opponents. But first, in order to do that, we need to know what we want to do at baseline.

## [02:10] Example Setup on King-Queen-Four

This is [UNCLEAR: the instructor appears to say “a 75bb spot” or “75bb pot”], just a solution I'm using as our example. King-Queen-Four. Let's go down a very simple line: check, bet, call. The turn is a Jack; it could be a Ten too for the purpose of illustrating this point. Check. Now let's look at our in-position strategy.

He's using a lot of A2o and A3o. He's using a lot of A2s and A3s. But the other Ax hands he is not using too much. As soon as he gets to A5, A6, A7, and A8, he is not using them a lot.

[VISUAL REQUIRED]
The precise board suits, turn card suit, selected bet size, exact Ax combinations, and strategy frequencies are referenced on screen but are not independently verified from the audio-only package.

## [02:55] River Bluff-Catchers at Equilibrium

Now let's say he bets, we call, brick river, check. On the river he is going all in a lot. He's got value and some bluffs. The technical details of this hand are not important. This hand is actually part of the deep-stack MTT section of the course. The point is whether we think our opponent is going to play like this.

If we do, then when he goes all in we'll call the hands we're supposed to if we think he plays perfectly and has perfect frequencies with everything he gets there with. But is that going to be the case? Very likely no.

Here you can see all of your bluff-catchers: K3, K7, K8. Another functionality is that we can show the EV of a play along with our strategy. If we hover over something like K7, K8, or J9, the bluff-catchers are losing slightly. Fold is zero EV. Some of them are close to zero. The nature of a mixed strategy is that it will be pretty much zero EV both ways. K2 here is a mixed strategy, with super-small differences in suits. K5 is basically a pure fold most of the time.

The idea is that if you have a bluff-catcher, you're not making money. If it is an indifferent bluff-catcher where it is a mixed strategy, you're mixing sometimes so that you do not get over-bluffed, but it is not making money. Once you get to a hand that pure calls, such as QJ that beats some value, you'll make money there.

[VISUAL REQUIRED]
The exact river card, call/fold frequencies, hand-suit distinctions, EV values, and which hands are pure or mixed require visual verification.

## [04:47] Building an Opponent Assumption

Remember this strategy. When we're playing computer poker, we do not think that this opponent—or anyone—has the precision to make sure he has the right number of hands by the time he gets to the river. He may bet A8 too much or A7 too much. He may not check at all, or he may check way too much.

We need to start here and ask what our opponent is going to do. If we think he is going to pure bet, we need to change that because he is going to get to the turn and river with more hands. If we leave the flop somewhat reasonable, which seems humanly possible, in this example let's assume we're playing against a very aggressive, loose opponent who likes to put people in tough spots and probably played the flop as a pure c-bet.

He views this turn card—King-Queen-Four, now with a Jack—as very good for him because the out-of-position player does not have much by way of sets. They have AT and some T9, but otherwise they are lacking AK, KK, QQ, and JJ. They have a lot of 4x and a lot of Ace-high. So the in-position player decides he is going to put this player to the test, and we think it is a spot where opponents will overuse Ax bluffs. Not in some crazy way, but simply use them more than zero, which is a very human thing to do here.

## [06:24] Editing Frequencies and Using Lock All

If we want to change that—and I already have the locked solution so you can see how this works—we pop up this feature and now have our opponent's range. We are in computer world, but we are about to make it reflect what we think our opponent actually does.

We can change all of his hands. Let's take the hands we think he is going to over-bluff with: A8, A7, maybe increase the frequency with A5. The exact strategy choices are not important here; it is the idea. Let's say A2, A5, A6, A7, A8, and A2, A3, A5, A6, A7, A8. Now we have those hands selected and say we want him to bet more often—maybe half the time with all of those hands.

Then we would lock it. The computer is smart enough to know we changed its strategy. If you do not use Lock All—which means locking the rest of the strategy—it will compensate for the over-bluffing somehow. It might add extra value or take out other bluffs. But our assumption is that the opponent keeps much of the same value and other bluffs while using too much Ax as a turn bluff. We therefore have to Lock All, because otherwise the computer will make up for the Ax over-bluffing.

We save and close it, then run it again the same way we did the initial solve. I have already done this for us.

[VISUAL REQUIRED]
The exact PioSolver node-locking controls, selected combos, percentage sliders, action columns, and whether all remaining actions were locked require the original video.

## [08:15] Re-Solved Response to Ax Over-Bluffing

Now this has been re-solved for the opponent bluffing too much Ax. In the previous simulation, on the turn we were folding all of our Qx and continuing all of our Kx. Now we have increased the frequencies—not in an insane way, just using A8, A7, and A6 more than zero—and every Queen is continuing, and every King is continuing.

We call and get the same river. Now we get a strategy where we believe he is going to continue overusing Ax as a bluff. Not a ton, but simply not zero. We'll get into the theory of why these bluffs are not great on the turn and river in the actual video about this hand. This example is only to illustrate how node locking works.

We have locked him to over-bluff the turn with Ax and over-bluff the river with Ax. If you had someone in your game who is capable of this—or your read is that in wide-range spots he loses track of how many combinations he is bluffing with—then when he goes all in, you literally never fold a bluff-catcher.

[VISUAL REQUIRED]
The exact defending range, whether every displayed bluff-catcher is a pure call, and the hand-specific EV changes require visual confirmation.

## [09:47] Solver Study for Live Cash Exploits

This is why we're using the solver to figure out how to play against people. I'm trying to dispel the myth that the solver is not for live games, not for soft games, or not for $2/$5 because we do not know what people are doing.

Most of playing poker is understanding what your opponents are doing and how you want to counter that strategy. Except for preflop—where there are still opportunities for exploits—poker is not memorizing a scripted strategy, memorizing how the computer plays, and putting that into play yourself. Poker is understanding your opponents' tendencies, adjusting to them, and making the right decision at every node against them.

Here we've decided we're facing an over-bluff. We've edited our opponent's strategy with the software to tell us what to do. We have figured out that we can call every time if he is bluffing this much with Ax. Based on our assumptions, this call is now worth about 14 big blinds instead of zero or negative.

This is especially important in live cash against soft opponents. We can node lock any spot where we think somebody is not check-raising enough, is not barreling enough, or vice versa. This is what we're going to do in this course.

## [11:20] Limitations and Required Methodological Precision

The computer knows how to make up for strategies. If you do not lock things from the first street, then go to the next street and lock again, and then go to the next street and lock again, the outputs will be wonky because the solver is trying to make up for the EV being lost from an inferior strategy.

It is thorough and tedious work, but it is important to use this software to understand how you want to adjust to your opponents. We've got to know equilibrium. We have to know the baseline before we know how to deviate. Then we need to put our assumptions in, lock them, re-solve, and go with the strategy that makes the most extra money possible. That is how we want to approach every spot.

We're going to leave ourselves open to exploits, and if people want to counter-exploit us, we'll play that game when we get to it. For now, we want to find the little spots in our games where people have leaks, pounce on them, and make that extra cheese.

# Extracted Poker Objects

## Hand Examples

### Hand 1 — BTN vs BB Node-Locking Demonstration

- Timestamp: 02:10
- Positions: BTN vs BB
- Effective stack / pot configuration: [UNCLEAR: instructor appears to say “75bb spot” or “75bb pot”]
- Board: King-Queen-Four / Jack / brick river; suits not verified
- Flop action: check, bet, call
- Turn action: check, IP strategy inspected; later Ax hands are forced to bet more often in the node-locked model
- River action: check, IP all-in; BB call/fold response inspected
- Baseline conclusion stated: indifferent bluff-catchers mix near zero EV, while some weaker bluff-catchers are losing calls and fold
- Node-locked conclusion stated: after Ax is overused as a turn and river bluff, the defender never folds a bluff-catcher in the demonstrated re-solve

## Charts and Solver Screens

### Solver Screen 1 — Baseline Strategy

- Timestamp: 00:00
- Situation: BTN vs BB on King-Queen-Four
- Purpose: establish equilibrium baseline before changing opponent behaviour
- Status: NEEDS_VISUAL_REVIEW

### Solver Screen 2 — Turn Ax Bluff Selection

- Timestamp: 06:24
- Situation: IP turn strategy node
- Purpose: increase betting frequency of selected Ax hands and use Lock All
- Status: NEEDS_VISUAL_REVIEW

### Solver Screen 3 — Re-Solved Defence

- Timestamp: 08:15
- Situation: OOP response after opponent Ax over-bluffing
- Purpose: compare baseline bluff-catcher defence with exploit response
- Status: NEEDS_VISUAL_REVIEW

## Explicit Statements by the Instructor

- Establish the equilibrium baseline before deciding how to deviate against an opponent.
- Node locking means making the solver play like the opponent you believe you are facing.
- If the rest of the opponent's strategy is not locked, the solver may compensate for a forced mistake by changing other value or bluff frequencies.
- Multi-street node locking must begin at the first relevant deviation and continue street by street, or later outputs may be distorted.
- Poker study should focus on opponent tendencies and counter-strategies rather than memorizing a scripted solver strategy.
- In the demonstrated model, adding Ax turn and river over-bluffs makes bluff-catching substantially more profitable.

## Uncertainties Requiring Review

- Exact board suits and river card.
- Whether the spoken configuration at 02:10 is “75bb spot,” “75bb pot,” or another 75bb parameter.
- Exact turn and river bet sizes.
- Exact selected Ax combinations and forced frequencies in the node-locking window.
- Exact baseline and node-locked frequencies and EV values for each bluff-catcher.
- Visual confirmation of the statement that every displayed Queen and King continues in the re-solve.
