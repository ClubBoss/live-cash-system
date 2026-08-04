# Source Metadata

Course: Smash Live Cash  
Module: 3-Post flop 3-Bet Pots  
Lesson: Preflop Adjustments vs Locked 3-Bet Ranges Part 2  
Instructor: Nick Petrangelo (Nicky P)  
Original filename: 25- Preflop Adjustments vs Locked 3-Bet Ranges Part 2.mp4  
Source duration: 25:12  
Source type: audio extracted from video  
Primary language: English  
Visual information available: yes, but not included in the current evidence package  
Transcription model: whisper.cpp large-v3, English forced  
Processing date: 2026-08-04  
Source status: RERUN_REQUIRED

# Detailed Transcript

## [00:00] Expanding and Contracting Versus Different BB 3-Bet Profiles

Let's talk about adjustments in 3-bet pots, continuing the idea that not everybody plays preflop like our charts. They may have their own charts, have no charts, or do whatever they want in the moment.

We already looked at a player who has essentially no BB 3-bet bluffs. I think that profile is realistic in many populations, even at high stakes. You can probably identify players in your own games who sometimes get a little frisky, but when they 3-bet BB versus BTN, they mostly have it.

Now we want to see what happens when someone becomes wider and changes the combo use. We will carry that adjusted range to a low board. The prepared example is 7-3-2 rainbow. If OOP has no low-card bluffs, they struggle to construct the range on this board: they mostly have overpairs and high cards such as AQ, while the wider player can arrive with more pocket pairs, bottom and middle pairs, 65-type hands, and 98-type hands.

[VISUAL REQUIRED]
The instructor is navigating preflop charts and solver outputs. Exact range weights, suits, selected nodes, frequencies, and EV values require the original video or screenshots.

## [01:45] Use the Profile to Generate the Direction of the Adjustment

The exact combos are less important than the method. Use the spot to generate ideas about how different player types change the strategy on different boards. The real preflop answer will usually lie somewhere between the extreme re-solved outputs, after also considering postflop skill and expected realization.

The machine output briefly repeats a prior sentence in this part; the duplicate was removed. The recovered unique content then returns to the range comparison.

## [03:18] Equilibrium Shape and BTN Continuation

The example begins from a normal BTN opening range and a roughly equilibrium BB 3-bet range. The BB range contains premium value, suited aces, suited connectors and one-gappers, small amounts of offsuit material, and some mixed medium pairs. The exact combos are not the point; the important feature is the overall shape.

Against that range, BTN's defence in a no-ante game is much tighter than in an ante game, especially versus the large 3-bet sizes common in live cash. The value 4-bet region remains concentrated around AA, KK and AKs, with other hands filling the mixed part of the 4-bet strategy. The main focus is the border of the calling range: it contracts against a tighter 3-bet range and expands against a looser one.

Against the equilibrium range, offsuit Jx hands and much of KQo and QJo are near or outside the calling boundary. The range remains strong even though it contains suited connectors.

## [05:44] Building a Generic Too-Wide 3-Bet Range

Now consider a recreational or generally loose player who enters an aggressive mood. They may overuse suited aces, suited connectors and pocket pairs, but not in a stable randomized pattern. Sometimes they call those hands and sometimes they 3-bet them. The goal is not to model one exact combo error; it is to model someone whose total 3-bet frequency is roughly fifty percent too high and whose extra hands are drawn from across the grid.

Pulling the excess weight from many regions prevents the re-solve from producing a response that depends on one oddly overused combo.

## [07:57] How the Calling Range Expands

Against the generally over-wide range, BTN moves toward an ante-game-style continuation structure. More suited hands continue, the lower suited-connectors and suited-seven region expands, and offsuit Jx hands become much more viable. Some hands that mixed or folded against equilibrium become pure continues.

The practical takeaway from the recovered portion is: when an opponent appears too loose across many hand classes—because they are tilted, trying to make every pot large, or trying to run over the table—expand the call range broadly rather than responding only to one suspected bluff combo. Strong offsuit Jx and suited material gain the most; weaker offsuit Tx generally remains folded apart from AT.

[TRANSCRIPT INCOMPLETE]
Resume from source timestamp: 08:54
Last completed topic: BTN continuation versus a generally over-wide BB 3-bet range
Next expected topic: The remaining comparison with tight and other opponent profiles

# Extracted Poker Objects

## Hand Examples

### Example 1 — BTN versus BB on 7-3-2 rainbow

- Recovered setup: compare a normal, bluff-deficient, and generally over-wide BB 3-bet range.
- Purpose: show how preflop range composition changes BTN's continuation and later low-board play.
- Exact suits, stack, sizes, weights and solver outputs: `NEEDS_VISUAL_REVIEW`.

## Charts and Solver Screens

- BTN open range.
- Equilibrium BB 3-bet range.
- BTN call and 4-bet response.
- A re-solved response versus a generally too-wide BB range.

## Explicit Statements by the Instructor

- The correct continuation range expands against a generally over-wide 3-bet range and contracts against a value-heavy one.
- Ante and no-ante structures create materially different continuation widths.
- It is better to model a generic loose profile by adding hands across multiple regions than by over-weighting one arbitrary combo.
- Against a broadly too-wide live 3-bettor, suited hands and offsuit Jx can continue much more often.

## Uncertainties Requiring Review

- Whisper enters a catastrophic repeated loop at approximately 08:54 and does not recover before the 25:11 endpoint.
- Retranscribe approximately 08:25–25:12 with overlap; use smaller chunks if the loop repeats.
- Exact chart weights, 4-bet mixes, stack depth, 3-bet size and visual hand boundaries remain unverified.
