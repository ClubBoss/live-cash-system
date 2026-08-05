# Carrot Grade 3 Lectures 05–07 — Original Assessment Blueprint v0.1

Status: `ORIGINAL / SOURCE-INDEPENDENT / ANSWER_KEYS_DIRECTIONALLY_STABLE`

## Purpose

Convert the stable mechanisms from Grade 3 Lectures 05–07 into original adaptive assessments without copying source boards, hands, size menus, solver grids or theorem wording.

## Assessment family 1 — Call-quality classification

Present several hands facing the same bet and require classification as:

- value beater;
- bluff catcher;
- frail hand.

Score separately:

- category;
- which value and bluff regions matter;
- confidence.

Misconception target: nominal hand strength determines call quality.

## Assessment family 2 — Winning, indifferent or losing call

Keep the hand fixed while changing:

- bet size;
- street;
- prior action filters;
- opponent bluff supply.

Ask whether the call is winning, near-indifferent or losing and why.

The answer key is directional unless independently validated frequencies exist.

## Assessment family 3 — Call-versus-raise separation

Give a river hand with plausible call and raise branches.

Require the learner to identify independently:

- call EV direction;
- raise candidacy;
- supporting value raises;
- blocker effect on bet/call and bet/fold regions.

Misconception target: a solver raise proves that the hand is a strong call.

## Assessment family 4 — Extreme-size eligibility gate

Present several river range states and ask which, if any, can support an extreme overbet.

Required checks:

```text
VERY HIGH-EQUITY VALUE REGION
→ OPPONENT CONDENSED RELATIVE TO IT
→ VALUE DOES NOT OVER-BLOCK CALLS
→ RIVER INVESTMENT CEILING
→ CREDIBLE BLUFF SUPPLY
```

Misconception target: polar range automatically permits any large size.

## Assessment family 5 — Value-led multi-size allocation

Provide abstract value tiers and three possible sizes.

Ask the learner to:

1. assign value regions to sizes;
2. remove a redundant size;
3. rank bluff capacity by size;
4. estimate only rough frequency buckets.

The answer must begin with value abundance, not preferred bluff combos.

## Assessment family 6 — Triple-barrel bluffing-EV tier

Present several river air or low-showdown-value hands after the same three-street line.

Classify each as:

- winning / mandatory bluff;
- optional / near-break-even bluff;
- losing bluff / give-up.

Require explicit comparison of bet EV and check EV.

Misconception targets:

- air always bluffs;
- showdown value always checks;
- lowest hand is automatically the best bluff.

## Assessment family 7 — Solver combo to transferable heuristic

Give one solver-like combo output and require the learner to rewrite it as a conditional rule containing:

- origin ranges;
- prior action filters;
- runout favourability;
- expected call and fold regions;
- blocker-function direction;
- one falsifier;
- one field override trigger.

Reject answers that merely memorise a hand or position label.

## Runtime use

```text
cold action
→ category / threshold
→ reason
→ confidence
→ one changed-size variant
→ one changed-line variant
→ field-evidence question
→ delayed retest
```

## Source-purity constraints

- no source board or hand is reproduced;
- no source size menu is copied;
- no solver frequency or EV value is copied;
- exact population claims remain field-gated;
- source terminology may inform internal mapping but is not required from the learner.

## Coverage effect

These seven families primarily strengthen:

- `LCM-05`;
- `LCM-06`;
- `LCM-07`;
- `LCM-09`;
- `LCM-10`;
- `LCM-11`.

They do not close the four source-gated candidate-drill gaps.

## Count effect

```text
Grade 1 families:          24
Grade 2 families:          20
Grade 3 L01–L02:            6
Grade 3 L03–L04:            7
Grade 3 L05–L07:            7
Total Carrot families:     64
```

Feedback repair paths remain separate from assessment-family counts.

## Verdict

`SEVEN_ORIGINAL_GRADE_3_L05_L07_FAMILIES_READY`

`NO_SOURCE_EXAMPLES_COPIED`

`TOTAL_CARROT_ASSESSMENT_FAMILIES_64`

`DIRECT_CANDIDATE_DRILL_COVERAGE_REMAINS_30_OF_34`
