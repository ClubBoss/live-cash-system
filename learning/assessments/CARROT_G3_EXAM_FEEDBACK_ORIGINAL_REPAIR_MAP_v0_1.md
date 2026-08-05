# Carrot Grade 3 Exam Feedback — Original Repair Map v0.1

Status: `ORIGINAL / SOURCE-INDEPENDENT / TEN_REPAIR_PATHS`

## Purpose

Convert the Grade 3 source answer key into original misconception-repair paths without copying source questions, boards, hands or solver outputs.

## Repair 1 — Raise threshold exceeds call threshold

Trigger:

- learner identifies a hand as a good bluff-catcher and therefore assumes it is also a good raise.

Repair:

```text
CALL EV
→ RAISE REOPENS ACTION
→ VALUE / DENIAL / FUTURE BRANCH REQUIREMENTS
→ HIGHER RAISE THRESHOLD
```

Changed variant: preserve blocker quality but weaken future improvement or fold equity.

## Repair 2 — Extreme size without supporting value

Trigger:

- learner chooses the largest size because the node is favourable or the hand wants folds.

Repair:

```text
VALUE REGION
→ OPPONENT CONTINUE RANGE
→ INVESTMENT CEILING
→ AVAILABLE SIZE
```

Changed variant: retain range advantage but remove the value class capable of using the extreme size.

## Repair 3 — Weak hand equals bluff

Trigger:

- learner bluffs the lowest-equity combo without checking whether it blocks common folds.

Repair:

```text
LOW SHOWDOWN VALUE
≠
GOOD BLUFF
```

Require identification of the opponent's missed backdoors, ace-high and pocket-pair folds.

## Repair 4 — Frozen hand class

Trigger:

- learner keeps the flop label `hybrid`, `thin value` or `high-EV bluff` unchanged after the raise is called and the turn changes.

Repair:

```text
FLOP CLASS
→ CALL FILTER
→ TURN CARD
→ NEW RANGE STATE
→ NEW CLASS
```

Changed variant: use three turns that promote, preserve and demote the same flop hand.

## Repair 5 — Solver call copied into an underbluffed pool

Trigger:

- learner cites equilibrium indifference as sufficient evidence for a live river call.

Repair:

```text
THEORY BASELINE
→ EXACT BRANCH
→ OBSERVED BLUFF SUPPLY
→ FIELD-GATED OVERRIDE
→ RETURN CONDITION
```

Require one falsifier that would restore the baseline call.

## Repair 6 — Equilibrium size mistaken for universal exploit

Trigger:

- learner treats a solver's very large size as mandatory against every pool.

Repair:

Separate:

- equilibrium value ceiling;
- population fold/call/raise response;
- alternative exploit size;
- evidence needed to deviate.

## Repair 7 — Medium showdown value assumed to check

Trigger:

- learner checks because the hand has some showdown value, ignoring an extremely favourable river and abundant value support.

Repair:

```text
CURRENT SHOWDOWN VALUE
→ CHECK EV
→ FOLD EQUITY
→ VALUE SUPPORT
→ BLUFF THRESHOLD
```

## Repair 8 — Strong check means missed value

Trigger:

- learner believes a strong made hand must bet immediately because checking forfeits value.

Repair:

Require comparison of:

- bet/call and bet/raise branches;
- check/bet/check-raise branch;
- opponent stab frequency;
- urgency and investment ceiling.

## Repair 9 — Range disadvantage forbids raising

Trigger:

- learner removes all raises on a board simply because Hero has lower range equity.

Repair:

Ask whether Hero still has:

- credible value raises;
- high-EV draws;
- thin value/hybrids against a merged bet;
- sufficiently cheap low-SPR investments.

No-value-region boards may have no raise even when other disadvantaged boards do raise.

## Repair 10 — Value bet must be favourite when called

Trigger:

- learner rejects an OOP thin value/denial bet because Hero is below 50% against the call range.

Repair:

```text
BET EV
versus
CHECK EV WITH ACTION STILL OPEN
```

Require analysis of opponent betting frequency after check, fold equity, denial and poor OOP realisation.

## Runtime

```text
identify misconception
→ show minimal counterexample
→ restate decision order
→ changed variant
→ delayed retest
→ field cue
```

## Source-purity boundary

Every repair must use newly generated positions and abstract ranges. The original Grade 3 exam questions remain reference-only.

## Count effect

```text
Grade 3 feedback repair paths: 10
assessment-family count:       unchanged by feedback
```

## Verdict

`TEN_ORIGINAL_GRADE_3_EXAM_FEEDBACK_REPAIR_PATHS_READY`

`ANSWER_KEY_USED_FOR_REPAIR_NOT_SOURCE_COPYING`
