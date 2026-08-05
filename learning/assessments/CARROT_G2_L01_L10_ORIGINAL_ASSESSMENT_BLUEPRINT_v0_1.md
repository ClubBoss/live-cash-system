# Carrot Grade 2 Lectures 01–10 — Original Assessment Blueprint v0.1

Status: `ORIGINAL / SOURCE-INDEPENDENT / ANSWER_KEYS_MECHANISM_STABLE`

## Purpose

Convert Grade 2 mechanisms into original adaptive assessment families without copying source boards, hands, solver grids, theorem wording or course sequence.

The families test reasoning steps, not source recall.

## Assessment family 1 — Filter direction

Present two ranges before and after an action. Ask whether the action mainly:

- polarises;
- condenses;
- weakens without capping;
- leaves shape broadly unchanged.

Score separately:

- action classification;
- explanation of which hand regions were removed;
- confidence.

Target misconceptions:

- every check caps;
- every bet polarises strongly;
- absolute labels without relative comparison.

## Assessment family 2 — Favourability versus polarisation

Give two nodes where Hero has similar range equity but different nut distributions.

Ask the learner to choose independently:

- betting frequency direction;
- sizing direction;
- raising direction.

Correct reasoning distinguishes:

- world favourability as a major frequency input;
- relative polarisation as a major size/raise input.

## Assessment family 3 — Pot-odds norm adjustment

Provide a bet size and a neutral mathematical fold benchmark, then change the landing ranges.

Ask whether expected defence should move above or below the neutral benchmark and why.

The answer must cite range asymmetry, not player emotion or “MDF must always be met.”

## Assessment family 4 — Value tier and finishing equity

Present four made hands with similar landing equity but different opponent continue ranges.

Ask the learner to rank them into:

- large-value tier;
- medium-value tier;
- thin/small-value tier;
- check tier.

The key is finishing equity after calls and raises, not current equity alone.

## Assessment family 5 — Size toolkit construction

Give one node with three available sizes. Require the learner to:

1. identify the value regions;
2. state the investment ceiling;
3. remove redundant sizes;
4. assign bluffs only after the value structure.

Misuse check: low frequency does not automatically imply large size.

## Assessment family 6 — River-blunder gate

Create two river nodes with the same air hand:

- one favourable for Hero’s range;
- one unfavourable.

Ask whether checking is a material error in each.

The learner must compare bet EV with check EV rather than say “air always bluffs.”

## Assessment family 7 — Bluff-tier selection

Provide several low-showdown-value hands with:

- positive removal;
- neutral removal;
- blockers to folding missed draws.

Ask for preferred, optional and poor bluff candidates after the node’s favourability is established.

## Assessment family 8 — Frequency versus magnitude

Offer two river sizes:

- one called frequently for a small amount;
- one called less often for a larger amount.

Require an EV comparison that includes calls, folds and raises. Do not accept “more calls means more value.”

## Assessment family 9 — Scattered-aggression contrast

Use two original lines:

- opponent bets flop, checks turn, Hero probes river;
- Hero bets flop, checks turn, then considers river bet.

Ask which line preserves more value, air and cappedness. The learner must not transfer one river heuristic mechanically to the other.

## Assessment family 10 — Slow-play classification

Give three strong-hand checks and classify them as:

- theoretical slow-play;
- exploitative slow-play;
- erroneous slow-play.

Require a reason based on opponent betting frequency, blockers, range protection and check EV.

## Assessment family 11 — Robust versus frail

Present hands with similar equity facing a bet but different ability to beat bluffs without improving.

Ask for call, raise or fold direction and identify:

- robustness;
- frailness;
- future bluff tax;
- improvement-dependent realisation.

## Assessment family 12 — Hybrid-bet audit

Give a hand that has partial value, denial and improvement potential.

Ask the learner to:

1. identify each contribution;
2. compare bet with check;
3. decide whether “hybrid” is justified or being used as a vague excuse.

## Assessment family 13 — Response range geography

Display an ordered abstract hand-strength list rather than a source chart. Ask the learner to mark:

- worst value raise;
- strongest call-only hand;
- marginal call/fold point;
- preferred bluff raise;
- mandatory fold region.

Score threshold coherence, not exact solver reproduction.

## Assessment family 14 — Range bet versus selective bet

Use the same board and size with two different betting ranges:

- range-wide merged;
- selective polar.

Ask how Hero’s call, fold and raise thresholds change.

Expected direction:

- wider defence and more merged raising versus the range-wide bet;
- fewer raises and more robust calls versus the polar bet.

## Assessment family 15 — Bluff-catching ancestry

Give three river bets with identical size but different:

- preflop origin positions;
- earlier action filters;
- natural missed-draw supply.

Ask for underbluffed, overbluffed or unclear classification and one falsifier for each conclusion.

Population magnitude remains field-gated.

## Assessment family 16 — 3-bet-pot flop plan

Provide an original 3-bet-pot flop and require the learner to choose a coherent range plan:

- high-frequency small bet;
- polar large bet with protected checks;
- check-heavy response with aggressive raises.

The answer must explicitly use:

- preflop range shape;
- SPR;
- range equity;
- nut distribution;
- caller-exclusive strong hands.

## Assessment family 17 — Monetary-stack trap

Describe the same strategic node twice using different currency amounts but identical SPR.

Ask whether strategy should change. The correct answer rejects buy-in or dinner-value framing unless bankroll or tilt is explicitly part of a separate game-selection decision.

## Assessment family 18 — Raise breadth from bet shape

Present three opposing bets:

- small merged range bet;
- small selective bet;
- large polar bet.

Ask the learner to rank Hero’s raise breadth and explain the value threshold behind each.

## Assessment family 19 — Volatile value realisation

Compare:

- a robust medium hand with flat equity realisation;
- a draw or pair-plus-draw with rare high-payoff branches.

Ask which can value-raise more often over the full tree and why current showdown equity is insufficient.

## Assessment family 20 — Small river bet raising

Give an original small river bet node. Require construction of:

- thin value raises;
- bluff raises linked to value volume;
- calls;
- folds;
- response to a re-raise.

The learner must state what evidence would justify deviating from baseline.

## Runtime use

Recommended deployment:

```text
cold classification
→ action and reason score
→ confidence score
→ one contrastive variant
→ one boundary variant
→ delayed retest
→ field cue
```

## Source-purity constraints

- no source board or exact hand is reproduced;
- no source solver percentage is copied;
- source theorem names are not required from the learner;
- all examples must be independently generated;
- answer keys use directional mechanisms unless exact independent anchors exist.

## Coverage effect

These twenty assessment families improve learner-facing coverage for:

- `LCM-01`;
- `LCM-03` through `LCM-07`;
- `LCM-09` through `LCM-11`.

They do not close direct-drill gaps requiring:

- squeeze construction;
- deep-stack-specific OOP thresholds;
- polar preflop target folds;
- multiway delayed aggression.

## Verdict

`TWENTY_ORIGINAL_GRADE_2_ASSESSMENT_FAMILIES_READY`

`NO_SOURCE_EXAMPLES_COPIED`

`DIRECT_DRILL_COVERAGE_REMAINS_30_OF_34`
