# Source Metadata

Course: Smash Live Cash  
Module: 2-Post flop Single-Raised Pots  
Lesson: Playing Turns After Overbetting Flops IP  
Instructor: Nick Petrangelo (Nicky P)  
Source duration: 23:54  
Source type: audio extracted from video  
Primary language: English  
Visual information available: yes, but not included in the current evidence package  
Original machine transcript: catastrophic loop after approximately 11:37  
Targeted rerun engine: faster-whisper  
Targeted rerun model: large-v3, English forced, translation disabled  
Verified rerun interval: 10:30–23:53.48  
Source status: AUDIO_COMPLETE / NEEDS_VISUAL_REVIEW  

# Detailed Source-Faithful Record

## [00:00] Turn play after a flop overbet

The lesson studies how a flop overbet changes pot geometry, range composition and the turn sizing tree. Turn strategy must begin from the value and bluff classes that actually used the flop overbet rather than from ordinary single-raised-pot defaults.

## [02:00] The caller already invested more than in a normal line

The flop overbet forces significantly more money into the pot and creates a narrower calling range. On later streets, relative hand strength alone can mislead both players because blockers and the remaining bluff supply matter more than in an ordinary small-bet line.

## [06:00] Bluff ancestry matters from both sides

When Hero is the aggressor, turn and river bluffs must be hands that could credibly have overbet the flop. When facing the line, Hero can fold more against players who fail to preserve the difficult low-equity flop bluffs needed for later streets.

The source explicitly warns that a turn bluff such as a low pocket pair or irrelevant suited connector must have entered the overbet range on the flop. If the opponent is unlikely to take that first action, later bluff-catching ranges can contract.

## [10:30] River size splitting after overbet and large turn barrel

On one low-turn branch, the river strategy splits between a pot-sized bet and a much larger all-in size rather than putting the full range into one polar size.

Hands with very strong equity but poor call-range blockers—such as top two-pair combinations that block important calls—can remain in the smaller value size. The largest size is built from nutted value whose blockers fit the opponent's continuing range more cleanly.

The exact board, suits, frequencies and solver weights remain visual-dependent.

## [13:00] Irrelevant suited connectors often bluff the smaller river size

Low suited connectors that have no interaction with the value region can remain pure bluffs but may fit the smaller river size rather than the all-in. Their lack of useful value matching and blockers makes them weaker candidates for the largest size.

By contrast, broadway hands that block two-pair and straight calls can fit the largest size more naturally because they better match the nutted value region.

Transferable mechanism: when a river tree uses multiple sizes, the weakest irrelevant bluffs do not automatically belong in the largest size. Candidate quality must be evaluated relative to the value region of each size.

## [15:00] Middling brick turns support maximum pressure

After moving from a low or straight-completing turn to a middling brick, the solver uses very large turn bets more often. The caller has little two-pair density, many one-pair hands become immediately indifferent and the aggressor can continue using hands with pair-plus-straight interaction.

Nick warns against checking automatically merely because a bluff candidate paired the turn. Hands such as weak pair-plus-gutter combinations can still be valuable large-barrel candidates when they fold out stronger one-pair hands and preserve useful river blockers.

## [17:00] Shift the bluff region with the height of the turn card

The same bluff classes are not used mechanically on every turn. The candidate region moves up or down depending on which part of the range gained interaction:

- when the low part of the range completes or gains strong interaction, more middling and high-card candidates supply the bluffs;
- when higher cards interact, some lower irrelevant hands can remain the bluff supply;
- broadways are used more heavily on selected high-card branches;
- lower suited candidates are reduced when they have become value or showdown hands.

The practical simplification is to organise turns into broad low, medium and high classes rather than memorising every individual card without understanding the range shift.

## [19:00] High-frequency betting cards generally use smaller sizes

On a turn that gives OOP broadway and two-pair improvement, overbets disappear even though IP continues betting frequently. The source uses this to illustrate a recurring relationship:

- as the betting range becomes wider and more linear, the dominant size usually decreases;
- very high-frequency betting and very large sizing rarely coexist without an exceptional range advantage.

Some one-pair hands can value-bet for a smaller size, and the bluff region must be rebuilt to support that wider value range.

## [20:30] Tight preflop ranges force bluffs from stronger hand classes

In a tight no-ante early-position configuration, the aggressor may lack enough irrelevant suited connectors. The strategy therefore draws some bluffs from pocket pairs, pair-plus-draw hands and stronger high-card regions.

This is not permission to bluff random showdown value. The selected hands retain equity, block future two-pair or call-down regions, and are needed because the original preflop range contains fewer low-equity hands.

One machine phrase compares ante and no-ante construction unclearly. The robust source-supported conclusion is that tighter starting ranges have fewer natural low-equity bluffs and must sometimes recruit stronger hand classes.

## [22:00] Removal versus the call-call-fold range

On brick rivers, the lowest available pocket pair can become a natural bluff when it removes or avoids blocking the opponent's call-call-fold region. The exact lowest pair changes by node; the transferable rule is to identify the bottom showdown class that has useful removal rather than memorising a fixed rank.

The opponent's bluff-catchers also depend on which kickers interact with the aggressor's actual bluffs. A top-pair hand can be a poor call when its kicker blocks the low suited or pair-based bluffs used in that branch.

## [23:00] Three broad turn classes

The lesson closes by organising the turn deck into broad low, medium and high classes. Each class changes:

- the available value threshold;
- the dominant size;
- which portion of the range supplies bluffs;
- how the defender's kickers interact with those bluffs.

Nick recommends understanding this movement rather than becoming overly specific about each individual rank before the range mechanism is clear. The next lesson in the series studies a different flop and the overbet-call turn node.

The final transcript ends at `23:53.48` with a complete sentence and explicit transition to the next lesson. The nominal file duration is `23:54`, so the missing 0.52 seconds contain no unrecovered strategic speech.

# Extracted Poker Objects

## Strategic examples

- Flop overbet followed by a large turn barrel and split river sizes.
- Low irrelevant suited connectors used as smaller-size river bluffs.
- Broadway blockers used more often in the largest river size.
- Middling brick turns using pair-plus-straight candidates for very large barrels.
- Higher-frequency betting cards shifting to smaller turn sizes.
- Tight preflop ranges recruiting pocket pairs and stronger hand classes as bluffs.

Exact cards, suits, board classes and frequency weights require visual review.

## Charts and Solver Screens

- Turn-card grid after a flop overbet.
- Value and bluff composition for large and smaller turn sizes.
- River split between pot-sized and very large all-in bets.
- OOP response matrices by kicker and blocker.

## Explicit Instructor Mechanisms

- Turn and river bluffs must descend from hands that used the flop overbet.
- Players who omit difficult flop bluffs become bluff-deficient later.
- River bluff candidates must match the value region of the selected size.
- Pairing the turn does not automatically remove a hand from the bluff region.
- Bluff classes shift with low, medium and high turn categories.
- Wider, higher-frequency betting ranges generally use smaller sizes.
- Tight starting ranges may need to recruit pocket pairs or stronger hands as bluffs.
- Removal must be measured against the actual call-call-fold range.

## Uncertainties Requiring Review

- Exact flop and runout cards and suits.
- Exact frequencies, sizes, EV values and mixed weights.
- One unclear ante/no-ante comparison phrase around the pocket-pair bluff discussion.
- Exact hand boundaries for each low, medium and high turn class.