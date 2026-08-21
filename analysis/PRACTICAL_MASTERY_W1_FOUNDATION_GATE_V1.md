# Practical Mastery — Wave 1 Foundation Gate V1

Status: `W1_SPEC_COMPLETE / IMPLEMENTATION_PENDING`

## Objective

Add a competency-gated foundation layer so a strong player can test out, while any weak foundation is explicitly remediated before higher-order practical modules rely on it.

## Skill families

### FND-01 Pot odds and required equity
Learner must connect price-to-call with required equity and identify when a call is structurally profitable before later-street uncertainty.

### FND-02 Raw vs realised equity
Learner distinguishes hand/range equity from how much of that equity can actually be realised given position, future action, rake and stack depth.

### FND-03 Implied / reverse implied odds
Learner recognizes when future wins improve a call and when domination/nut disadvantage makes nominal equity misleading.

### FND-04 Outs quality
Learner distinguishes clean, dirty, dominated and dead outs instead of mechanically counting visible improvements.

### FND-05 Combo counting / removal
Learner can use 16/4/6 starting combo counts, board/hole-card removal and remaining value/bluff combinations in practical river/preflop reasoning.

### FND-06 SPR / effective stack
Learner calculates the effective stack and understands how SPR changes commitment/leverage, without treating a nominal buy-in depth as the operative depth.

### FND-07 Break-even intuition
Learner connects bet size to bluff break-even logic and call price to required equity without overclaiming exact equilibrium frequencies.

## Source locks

Primary already-ingested authorities:

- FTGU-E01 Equity and EV
- FTGU-E11 Introduction to Combos
- FTGU-E13 Introduction to Blockers
- LCM-01 existing effective-stack / SPR mechanism
- LCM-03 existing equity-realisation mechanism

Exact chart/solver-frequency material remains excluded unless separately source-admitted.

## Competency-gate contract

This wave is not a mandatory beginner course.

For each foundation family:

1. cold recognition/calculation check;
2. if passed, mark prerequisite satisfied for routing purposes;
3. if failed, deliver compact remediation lesson;
4. require changed-number or changed-context confirmation;
5. failure may create review work but must not masquerade as higher-order strategy mastery.

## Practice requirements

Minimum anchor intent, not a numerical quota:

- direct calculation examples;
- one contextual poker decision using the calculation;
- one changed-number transfer item;
- one misconception distractor for the common mechanical error.

## W1 DoD

W1 may close only when:

- seven foundation families exist in the canonical skill graph;
- a test-out path exists conceptually;
- remediation is separated from advanced mastery;
- existing LCM-01/03 mechanisms are reused rather than duplicated inconsistently;
- no unsupported exact solver/chart frequency is introduced;
- W2 preflop can depend on these skills without assuming invisible knowledge.

Current verdict: `SPEC_PASS / RUNTIME_IMPLEMENTATION_PENDING`
