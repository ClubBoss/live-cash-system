# Source Metadata

Course: Smash Live Cash  
Module: 2-Post flop Single-Raised Pots  
Lesson: Playing Turns vs Capped Ranges  
Instructor: Nick Petrangelo (Nicky P)  
Original filename: 12-Playing Turns vs Capped Ranges.mp4  
Source duration: 30:55  
Source type: audio extracted from video  
Primary language: English  
Visual information available: yes, but not included in the current evidence package  
Original machine transcript: local repeated interval near 17:46–18:53 and catastrophic tail loop from approximately 24:20  
Targeted rerun engine: faster-whisper  
Targeted rerun model: large-v3, English forced, translation disabled  
Recovered intervals: 17:15–19:49.62 and 23:20–30:53.89  
Source status: AUDIO_COMPLETE / NEEDS_VISUAL_REVIEW  

# Detailed Source-Faithful Record

## [00:00] Turn sizing against a capped calling range

BTN versus BB in a deep single-raised pot is used to compare large bets on neutral turns with smaller bets or checks on cards that improve the defender. The core object is not one memorised board. It is how a polar flop range interacts with different classes of turn cards.

## [01:55] Polar flop construction creates turn leverage

BTN checks frequently and uses a large flop c-bet with a value-heavy, polar range. BB mostly calls rather than check-raises, reaching the turn with top pairs, draws, medium-strength hands and unpaired continues.

The caller is capped relative to BTN, but not equally weak on every turn.

## [03:50] Turn sizing errors can dominate small flop inaccuracies

Reasonable flop sizes may be close in EV, while a poor turn-size choice at deep SPR can be much more expensive. Position is especially valuable on dynamic boards because the in-position player controls whether money enters across flush, straight, overcard and brick runouts.

## [07:40] Low neutral cards preserve the overbet advantage

A low brick that misses both ranges preserves BTN's overpairs, strong top pair and set region while BB still contains many draws and medium-strength hands. These turns allow the widest polar pressure.

The lesson repeatedly frames low bricks as the green light for the largest turn size.

## [09:35] Range-changing turns reduce size or increase checking

Flush completers, straight completers and cards that improve BB's broad defend range reduce BTN's clean polar advantage. Overpairs lose equity and top pair becomes less dominant, so BTN must either narrow the large-bet region, use a medium or small size, or check more.

## [13:25] Bluff selection starts from value and strongest continues

Broadway and low-card bluff candidates are selected according to:

- which strong top-pair kickers they block;
- which weaker hands they allow BB to retain and fold;
- whether they have equity or future-runout utility;
- whether the selected hand belongs beside the value represented by the size.

Exact combo weights remain visual-dependent.

## [17:15] Recovered low-brick overbet construction

The rerun restores the missing first low-brick comparison. BTN's large-bet value region is built first from the strongest top pair, overpairs and sets. Nut flush draws and other high-equity candidates are natural bluffs beside that value.

The spoken method is explicit:

1. identify the value threshold;
2. select the size supported by that value region;
3. add equity-driven and blocker-compatible bluffs.

The source describes this low brick as a turn on which the strongest made hands can use the overbet at very high frequency. Exact board cards, suits and frequencies require the solver screen.

## [20:00] A card can be rare overall but highly actionable inside its class

The total overbet frequency across the entire turn deck may be modest while individual low bricks use the overbet very frequently. The practical lesson is to avoid averaging away strategically distinct card classes.

## [23:20] Middling turns change value ownership

On a middling straight-interacting card, BB gains more two-pair, straight and draw continues. BTN's strongest top pair is no longer an automatic pure value bet and overpairs begin checking more.

The large-bet region becomes more blocker-oriented and relies on hands that interact with the new strongest continues: straights, two pair and relevant straight blockers. Overpairs migrate toward a medium size rather than remaining in the largest bucket.

## [24:22] Wet and high flush-completing turns favour a small linear size

When a high flush completer substantially improves BB and compresses both ranges toward similar equity, BTN shifts toward a small linear bet. Overpairs can still bet for value and protection, but the range no longer supports a highly polar overbet architecture.

This small size can overperform against live opponents who do not find the required check-raises with one-card flush blockers, gutters and mixed semi-bluffs.

## [26:36] Low flush completers can retain a medium size

Not all flush completers are identical. On lower flush cards, BTN can retain more of its strongest flushes while BB loses some low suited combinations. Overpairs retain more equity, allowing a medium size to remain available.

A small size is still a robust simplification. The costly error is forcing the same small strategy onto low neutral bricks where the range wants to put substantially more money in.

## [28:24] Value and bluff classes shift upward as the turn rises

Above the flop top pair, overbetting progressively disappears. Medium betting remains because overpairs still retain value, while the top-pair value region shifts upward to the new paired rank.

The transferable mechanism is dynamic range reassignment: when the turn changes which made hands are strong, both the value threshold and bluff blockers must move with it.

## [29:24] Live exploit: size closer to hand value when punishment is absent

Against opponents who do not find enough one-card floats, turn check-raises or later bluff conversions, BTN can use the size that best fits the current hand class more directly:

- medium or large with hands whose equity supports it;
- small with overpairs on compressed wet turns;
- planned check-back rivers after extracting one street.

This is an exploit branch, not an equilibrium licence to become transparently hand-strength based against attentive opponents.

## [30:22] Lesson conclusion

The final audio summary is complete:

- low bricks are the main overbet cards;
- flush and straight completers introduce medium and small sizes;
- value threshold and opponent response determine the branch;
- multi-size turn strategies are built from range interaction, not from one fixed list of hands.

The final 1.11 seconds after the recovered speech contain no additional strategic sentence.

# Extracted Poker Objects

## Hand and range examples

- Deep BTN versus BB single-raised pot after a large flop c-bet and call.
- Low neutral turn supporting overpairs, sets, strongest top pair and nut-draw bluffs.
- Middling straight-interacting turn moving overpairs into a medium bucket.
- High and low flush-completing turns producing different small/medium architectures.

Exact cards, suits, sizes, frequencies and hand weights remain visual-dependent.

## Explicit instructor mechanisms

- Build turn strategy in the order `value threshold → size → bluff candidates`.
- Low bricks preserve the polar advantage and support the largest bets.
- Middling cards require blocker-oriented large bets and medium overpair betting.
- Wet high turns produce wider, smaller, more linear betting.
- Turn-card classes matter more than an average frequency across the deck.
- Live opponents may permit hand-class-specific sizing when they fail to punish it.

# Uncertainties Requiring Visual Review

- Exact flop and turn cards and suits.
- Exact size menu and solver frequencies.
- Hand-level mixed weights.
- Displayed equity and EV values.
- Exact boundary between medium and small sizes on each turn class.
