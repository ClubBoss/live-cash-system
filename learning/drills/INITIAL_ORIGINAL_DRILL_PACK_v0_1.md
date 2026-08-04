# General Live Cash — Initial Original Drill Pack v0.1

Status: `ORIGINAL_DRILLS / MANUAL_TEST_READY`

Purpose: test currently source-supported reasoning mechanisms with original scenarios. These drills do not reproduce course hands, charts or exact solver frequencies.

## Instructions

For every drill:

1. answer before reading the key;
2. state the reasoning step, not only the action;
3. use `UNKNOWN / BASELINE` when exploit evidence is insufficient;
4. exact mixed frequencies are not required.

# Pack A — Effective stack and straddle translation

## A1 — Pairwise effective stack

Game: $2/$5.  
Hero: $1,000.  
Villain: $350.

Question:

- What is the effective stack in big blinds?
- Should Hero plan the hand as a 200bb confrontation?

### Answer key

- Effective stack: 70bb.
- No. Hero's unused chips do not affect the pairwise confrontation.

Reasoning:

Use the smaller relevant stack before selecting ranges and commitment thresholds.

Mapped misconception: `MC-001`.

---

## A2 — Straddle changes the denominator

Game: $1/$3 with a live $6 straddle.  
Hero and Villain are each $900 effective.

Question:

- How many normal big blinds deep?
- How many straddle units deep?
- Which number is more useful for planning the straddled pot?

### Answer key

- 300 normal big blinds.
- 150 straddle units.
- The straddle-unit depth is the more useful first approximation for the current pot structure.

Reasoning:

The forced live amount changes raise sizes and expected SPR.

Mapped misconception: `MC-002`.

---

## A3 — Multiway pairwise depths

Game: $1/$3.  
Hero: $900.  
Villain A: $300.  
Villain B: $1,500.

Question:

State Hero's pairwise effective depth versus each opponent.

### Answer key

- Versus A: 100bb.
- Versus B: 300bb.

Reasoning:

One multiway hand can contain different strategic depths and possible side-pot structures.

Mapped misconception: `MC-001`.

---

## A4 — Open size and SPR intent

A straddled pot is approximately 120 straddle units deep. A player proposes using a very large automatic open because “live games use 4x.”

Question:

What must be checked before accepting that size?

### Answer key

Check:

- resulting SPR;
- number and elasticity of callers;
- position;
- rake/game structure;
- whether the hand benefits from creating a shallower pot.

Reasoning:

A memorized multiple is not a universal objective. Preserve useful SPR unless the environment or hand incentives justify compression.

Mapped misconceptions: `MC-002`, `MC-003`.

# Pack B — Range source and action filtering

## B1 — Same flop, different blind

An opener reaches the same dry flop once against BB and once against a cold-calling SB.

Question:

Which blind is generally expected to have the more condensed preflop calling range, and why can that change c-bet aggression?

### Answer key

SB is generally more condensed, with stronger pairs, suited hands and broadways. Therefore the opener should not automatically reuse the wider-aggression default used against BB.

Mapped misconception: `MC-005`.

---

## B2 — Flop exploit worked, Villain called

Villain is believed to overfold and under-check-raise flops. Hero increases small c-bet frequency. Villain calls.

Question:

Should Hero automatically continue over-bluffing the turn because Villain is a weak flop defender?

### Answer key

No. The flop call filters out many weak hands and creates a stronger turn range. Hero must update rather than carry the original profile label unchanged.

Mapped misconception: `MC-007`.

---

## B3 — Large bet versus small bet

Villain uses a small c-bet with almost the whole range in one sample, and a large value-heavy bet in another.

Question:

Which branch generally requires wider calls and more linear raises?

### Answer key

The small/wide branch.

Reasoning:

It contains more air and gives a better price. The large/value-heavy branch supports tighter and more polar defence.

Mapped misconception: `MC-012`.

---

## B4 — Unknown branch

You have seen a player bluff once on a river but have no evidence about their flop large-bet range.

Question:

Can you label their flop large-bet branch “aggressive” and defend widely?

### Answer key

No. Evidence is branch-specific. Preserve baseline until the relevant action class is observed.

Mapped misconceptions: `MC-015`, `MC-030`.

# Pack C — Value-first aggression and bluff jobs

## C1 — Bluff before value

Hero says: “This hand has no showdown value, so I should bluff the turn.”

Question:

What question must come first?

### Answer key

`What is the weakest value hand for the intended size, and how much value exists?`

Reasoning:

Bluff volume follows value threshold and size, not the visual weakness of Hero's hand.

Mapped misconception: `MC-009`.

---

## C2 — Jobless barrel

A turn hand has almost no equity, blocks no strong calls, blocks some folds and has no credible river continuation.

Question:

Is low showdown value enough to make it a barrel?

### Answer key

No. The hand has no useful equity, blocker/matcher or future-air job and may actively harm fold equity.

Mapped misconception: `MC-010`.

---

## C3 — Scary turn

The turn completes an obvious draw and materially improves Villain's flop-calling range.

Question:

Does the fact that the card looks scary automatically make it an overbet card for Hero?

### Answer key

No. If the card repairs Villain's range or reduces Hero's value advantage, the strategy may prefer smaller bets or more checking.

Mapped misconception: `MC-011`.

---

## C4 — Low-kicker top pair

OOP faces a small, wide c-bet on a paired board. Hero compares weak-kicker top pair with strong-kicker top pair.

Question:

Why can the weaker kicker have more raise incentive?

### Answer key

It needs more protection and may unblock more high-card bluffs/folds. The stronger kicker can dominate the betting range and protect the call line.

Mapped misconception: `MC-013`.

# Pack D — 3-bet-pot profile logic

## D1 — Value-heavy blind 3-bet

A blind has shown only premium pairs and strong high cards in several 3-bet pots and rarely shows suited bluff candidates.

Question:

Which hand family should lose confidence first when defending: dominated big cards or the best low suited connectors?

### Answer key

Dominated big cards lose confidence first.

Reasoning:

Their apparent strength is damaged by domination against the concentrated value range. This does not mean all suited connectors are automatic calls.

Mapped misconception: `MC-019`.

---

## D2 — Wide 3-bet, normal flop c-bet

Villain 3-bets far wider than baseline and then uses the same frequent flop c-bet they use with a normal range.

Question:

Hero's flop continuation should generally move in which direction?

### Answer key

Wider.

Reasoning:

Villain reaches the flop with excessive weak material and has not compensated by checking enough.

Mapped misconception: `MC-020`.

---

## D3 — Same player, opposite branches

A tight 3-bettor bets overpairs aggressively on low flops but checks most unpaired high cards.

Question:

How should Hero treat the flop bet branch and the check-back branch?

### Answer key

- Defend tightly versus the bet.
- Attack appropriate turns after check-back.

Mapped misconception: `MC-021`.

---

## D4 — River bluff without ancestry

On the river, a proposed Villain bluff would need to be a low suited connector. But this player did not include those hands in the preflop 3-bet range.

Question:

Should Hero count that bluff because it is theoretically natural on the river card?

### Answer key

No. The hand could not realistically reach the node through the observed range construction.

Mapped misconceptions: `MC-018`, `MC-022`.

# Pack E — Multiway structure

## E1 — Sandwiched versus closing action

Three players see a flop. Hero acts between the bettor and another uncapped player.

Question:

Should Hero defend as widely as if closing action heads-up?

### Answer key

No. A strong live range remains behind, defence is shared and collision risk is higher.

Mapped misconception: `MC-024`.

---

## E2 — Random air check-raise

Hero considers a multiway check-raise with almost no equity, no meaningful blocker and no robust continuation.

Question:

Is the hand a good candidate because heads-up solvers sometimes use low-equity bluffs?

### Answer key

No. Multiway bluffs generally require stronger backup equity and removal because several ranges must be cleared.

Mapped misconception: `MC-025`.

---

## E3 — Waiting for passive player

Hero holds very strong value. A passive closing player is expected to stab or check-raise in theory but has repeatedly failed to do so.

Question:

What adjustment direction is justified?

### Answer key

Fast-play more value rather than waiting for aggression that is unlikely to arrive.

Mapped misconception: `MC-026`.

---

## E4 — Nut ownership by initiative

The preflop opener sees a low connected flop multiway and says: “I raised, so I own the board.”

Question:

What must be compared instead?

### Answer key

- offsuit and suited nut combinations;
- low-card coverage;
- premiums removed by preflop action;
- sandwich and closing-action positions.

Mapped misconception: `MC-027`.

# Pack F — River value and blocker audit

## F1 — Visible nut blocker

Hero holds a card that blocks the nut flush and considers bluffing.

Question:

What three regions must be checked before acting?

### Answer key

- Villain's realistic value region;
- Villain's bluff/fold region;
- which of those Hero's blocker removes.

A nut blocker can be bad if it removes too many folds or missed bluffs.

Mapped misconception: `MC-028`.

---

## F2 — Large size and excluded value

Villain makes an extreme river re-raise. Some natural medium-strength value hands would usually choose a smaller size.

Question:

Why can this matter to a bluff-catcher?

### Answer key

The exact size may narrow represented value. Hero should count what remains and compare it with credible blocker bluffs rather than folding by relative hand strength alone.

Mapped misconception: `MC-017`.

---

## F3 — Strong hand, no bluffs

Hero has a strong bluff-catcher, but Villain's preflop and flop construction removed nearly every low-equity bluff family before the river.

Question:

Do good Hero blockers automatically rescue the call?

### Answer key

No. Blockers are secondary when the underlying bluff supply is absent.

Mapped misconception: `MC-022`.

---

## F4 — Correct fold, wrong reason

Hero correctly folds river but explains: “One pair is never good for this many chips.”

Question:

Should the system mark the mechanism mastered?

### Answer key

No. The action may be correct, but the relative-strength reasoning is structurally wrong. Repair must teach value counting and bluff ancestry.

Response class: `C — Correct action, wrong reason`.

Mapped misconception: `MC-017`.

# Manual scoring sheet

For each drill record:

```text
Drill ID:
Action answer:
Reasoning answer:
Confidence 0–100:
Response class A/B/C/D/E/U:
Misconception diagnosed:
Immediate variant required: yes/no
Delayed retest date/session:
```

# Pack verdict

`INITIAL_ORIGINAL_DRILL_PACK_CREATED`
