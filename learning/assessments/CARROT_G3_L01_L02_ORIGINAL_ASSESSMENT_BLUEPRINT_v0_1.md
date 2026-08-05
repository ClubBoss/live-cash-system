# Carrot Grade 3 Lectures 01–02 — Original Assessment Blueprint v0.1

Status: `ORIGINAL / PARTIAL_GRADE / SOURCE-INDEPENDENT / ANSWER_KEYS_MECHANISM_STABLE`

## Purpose

Convert the first two Grade 3 lectures into original adaptive assessment families without copying source boards, hands, solver grids, mixed frequencies or exam questions.

These families test execution of mixing and toolkit selection, not source recall.

## Family G3-A01 — Mix eligibility gate

Present three decisions:

- one where action A clearly dominates;
- one where actions A and B are near-indifferent;
- one where the learner lacks enough information to know.

Ask whether to:

- take a pure action;
- randomise;
- defer the mix and choose the safer pure branch.

Required reasoning:

- compare expected values;
- distinguish true indifference from uncertainty;
- state whether visibility or repeated exposure makes balance relevant.

Target misconception:

`RNG can compensate for not knowing the node.`

## Family G3-A02 — Three-action threshold map

Give an ordered abstract range facing a bet.

Ask the learner to mark:

- pure raises;
- raise/call mixes;
- pure calls;
- call/fold mixes;
- pure folds.

Then change one suit or redraw property while preserving nominal hand rank.

Score separately:

- threshold order;
- effect of realisation and future branches;
- confidence.

## Family G3-A03 — Repolarisation interference

Create an original river node where Hero called an earlier street and now faces a polar bet.

Provide several possible bluff-raise candidates that differ in:

- blockers to the opponent's bet/call value;
- blockers to the opponent's bet/fold bluffs;
- showdown value;
- availability of supporting value raises.

Require the learner to select the best candidate and explain why the bottom of range is not automatically preferred.

## Family G3-A04 — RNG misuse repair

Show a recorded session decision in which the learner used an RNG to take an inferior action.

Require classification as:

- valid mix;
- harmless optional deviation;
- unsupported randomisation;
- material EV error.

Then ask for one replacement cue that can be used live before rolling.

Recommended cue:

```text
PURE OR MIX?
IF UNCERTAIN, DO NOT ROLL.
```

## Family G3-A05 — Practical size-toolkit compression

Give a node with four solver-available sizes and a description of the value regions.

Ask the learner to:

1. identify which value regions require distinct investment ceilings;
2. remove redundant sizes;
3. choose a practical toolkit;
4. predict where simplification could lose EV;
5. state what evidence would justify adding a size back.

The answer is evaluated directionally. Exact solver EV is not required.

## Family G3-A06 — Frequency buckets and value-led bluff allocation

Provide an original node with one earlier-street size and a separate river node with three sizes.

Part A: classify hands into:

- pure check;
- bet infrequently;
- bet sometimes;
- bet frequently;
- pure bet.

Part B: construct the river size distribution by:

- locating value tiers first;
- estimating which sizes are common or rare for value;
- assigning bluff capacity from the supported value volume and pot odds;
- removing a size when the hand has strongly adverse removal for that size.

Reject answers that allocate bluffs equally across sizes without reference to value.

## Runtime

```text
cold classification
→ written action
→ written reason
→ confidence
→ pure-versus-mix gate
→ changed suit or runout
→ delayed retest
```

## Exam relation

- `G3-Q01` is primarily supported by `G3-A01` and `G3-A02`;
- `G3-Q02` is primarily supported by `G3-A05` and `G3-A06`;
- `G3-A03` prepares later river and raising questions;
- `G3-A04` is a global Grade 3 execution guardrail.

No exact Grade 3 exam answer is embedded.

## Source-purity constraints

- no source board or hand is reproduced;
- no solver frequency is copied;
- no exact source size tree is copied;
- terminology may be simplified in the final product;
- all examples must be independently generated;
- answer keys remain directional until independently validated.

## Coverage effect

These six families strengthen:

- `LCM-05`;
- `LCM-06`;
- `LCM-09`;
- `LCM-11`.

They do not close the four source-gated direct candidate drill gaps.

## Count effect

```text
Grade 1 original families:             24
Grade 2 original families:             20
Grade 3 L01–L02 original families:      6
Total original Carrot families:        50
```

## Verdict

`SIX_ORIGINAL_GRADE_3_BATCH_01_FAMILIES_READY`

`NO_SOURCE_EXAMPLES_COPIED`

`GRADE_3_EXAM_ANSWER_KEYS_STILL_PENDING`
