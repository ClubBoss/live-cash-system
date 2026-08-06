# Preflop Squeeze and Polar-Target Drill Pack v0.1

Date: 2026-08-06  
Status: `ACTIVE_ORIGINAL_DIRECT_DRILLS / ANSWER_KEYS_STABLE_DIRECTIONALLY`

## Purpose

Close the direct answer-key gaps for:

- `H-W01-002` squeeze purification;
- `H-W01-008` polar preflop bluffs target dominating folds.

All spots and wording are original. Exact source chart cells are not reproduced.

## Scoring

Score separately:

1. action;
2. reason;
3. confidence;
4. whether Hero identified the call branch;
5. whether Hero named a real fold target.

A correct action with invented reasoning is not mastery.

# Factory S1 - Squeeze purification

## S1.1 Value squeeze

```text
100bb
CO opens 3bb
BTN calls
Hero SB: TT
```

Answer: `SQUEEZE CORE`.

Reason:

- late opener and cold caller are wide enough;
- TT benefits from value, denial and heads-up conversion;
- SB realisation as a flat is poor;
- this is an existing value candidate, not an invented bluff.

Misconception trigger: `I should call because TT is not premium.`

## S1.2 Preserve the call

```text
200bb
HJ opens 3bb
CO calls
Hero BTN: 76s
blinds are passive
```

Answer: `CALL / DO NOT PURIFY INTO A SQUEEZE`.

Reason:

- position and depth create realisation and implied-odds value;
- 76s does not block the strongest continue region well;
- it can be dominated by suited call branches after a squeeze;
- removing a flat does not automatically create a bluff.

Misconception trigger: `Suited connector means good squeeze bluff.`

## S1.3 Offsuit invention

```text
100bb
EP opens 4bb
HJ calls
Hero CO: KJo
```

Answer: `FOLD`.

Reason:

- opener zone and size are strong;
- KJo is dominated by calls and continues;
- it blocks some hands Hero wants to fold;
- poor multiway and squeeze-call realisation.

Misconception trigger: `Blocker-looking broadway must be a bluff.`

## S1.4 Polar flex candidate

```text
100bb
CO opens 3bb
BTN calls
Hero SB: A5s
BB is not aggressive
```

Answer: `SQUEEZE FLEX`.

Reason:

- blocks strong Ax continues;
- has nut-flush and wheel equity when called;
- SB flat realisation is weak;
- late ranges supply real folds.

Boundary:

Against a tight CO or a caller who traps strong hands, reduce the bluff frequency.

## S1.5 Value density rises with two callers

```text
120bb
HJ opens 3bb
CO calls
BTN calls
Hero BB: AQo
```

Answer: `SQUEEZE VALUE/FOLD-EQUITY CORE`.

Reason:

- AQo performs poorly as a passive multiway call;
- the pot contains dead money;
- callers are capped more often than the opener;
- size must increase with both callers.

Sizing answer:

`4x open + one open-size unit per caller`, then adjust slightly for stickiness.

## S1.6 Do not squeeze because calling feels weak

```text
150bb
CO opens 3bb
BTN calls
Hero BB: 98s
```

Answer: `CALL CORE / SQUEEZE ONLY WITH STRONG SPECIFIC EVIDENCE`.

Reason:

- BB closes action;
- hand realises and retains broad board coverage;
- does not block the strongest continue range;
- calling is not a strategic failure.

Misconception trigger: `Aggression is automatically higher EV than closing action.`

## S1.7 Players-behind penalty

```text
150bb
HJ opens 3bb
CO calls
Hero BTN: 55
SB is a frequent squeezer
```

Answer: `CALL BECOMES FRAGILE; FOLD MORE, DO NOT AUTO-SQUEEZE`.

Reason:

- 55 wants cheap realisation, not a large pot;
- aggressive players behind reduce call EV;
- it is not promoted into a bluff merely because the flat worsens.

## S1.8 Short stack linearisation

```text
55bb
BTN opens 2.5bb
SB calls
Hero BB: AJo
```

Answer: `SQUEEZE LINEAR FLEX`, not a deep-stack speculative call.

Reason:

- lower SPR increases high-card value;
- implied odds for suited/connected alternatives fall;
- BTN/SB ranges are wide;
- the branch is value/denial-led, not polar invention.

# Factory P1 - Polar target folds

## P1.1 First candidate

```text
100bb
Hero BTN opens 2.5bb
BB 3-bets 10bb
Hero: A5s
BB is capable of wide blind 3-bets and folding to 4-bets
```

Answer: `4-BET BLUFF CANDIDATE`.

Required reason:

- blocks AA/AK/AQ-type continues;
- retains nut-flush/wheel equity;
- can fold out better Ax and broadway hands;
- call branch remains viable but is not automatically superior.

## P1.2 No real fold target

```text
100bb
Hero EP opens 3bb
very tight SB 3-bets 12bb
Hero: A5s
```

Answer: `FOLD / NO AUTOMATIC 4-BET BLUFF`.

Reason:

- tight 3-bet range contains too few better hands that fold;
- blocker alone does not create fold equity;
- continue region dominates Hero heavily.

Misconception trigger: `A5s is always the solver bluff.`

## P1.3 Call candidate, not bluff candidate

```text
150bb
Hero BTN opens 2.5bb
BB 3-bets 10bb
Hero: 98s
```

Answer: `CALL CORE`.

Reason:

- excellent realisation in position;
- does not block premium continues;
- 4-betting burns a useful call family;
- better candidates exist for the polar branch.

## P1.4 Rare king blocker

```text
100bb
Hero CO opens 3bb
BTN 3-bets 9bb
Hero: KTs
BTN 3-bets linearly, folds KQ/KJ often and rarely flats 4-bets
```

Answer: `CONDITIONAL 4-BET BLUFF FLEX`.

Reason:

- blocks KK/AK/KQ-type strength;
- can target better Kx folds;
- condition fails if BTN calls 4-bets widely with suited broadways.

## P1.5 Bad blocker direction

```text
100bb
Hero BTN opens 2.5bb
SB 3-bets 11bb
Hero: QJo
```

Answer: `FOLD`, not 4-bet bluff.

Reason:

- dominated when called;
- weak realisation;
- blocks QJ/QT/JT-type folds rather than mainly premium continues;
- lacks suited/nut back-up equity.

## P1.6 Secondary ace candidate

```text
100bb
Hero BTN opens 2.5bb
BB 3-bets 10bb
Hero: A3s
BB is wide and 5-bets narrowly
```

Answer: `SECONDARY 4-BET BLUFF CANDIDATE`.

Reason:

- preserves ace blocker and suited equity;
- lower priority than A5s/A4s;
- requires the same fold-target and narrow-continue conditions.

## P1.7 Value range first

```text
100bb
Hero CO opens 3bb
BTN 3-bets 9bb
Hero knows BTN folds often
Hero has not defined a value 4-bet range
```

Question: may Hero choose bluff combos first?

Answer: `NO`.

Reason:

- bluff volume follows the value region and investment ceiling;
- a high fold estimate does not authorise unlimited bluffs;
- define value, size and continue response before selecting blockers.

## P1.8 Better hands that fold

```text
Hero considers a 4-bet bluff with A5s.
Opponent 3-bets only QQ+/AK and never folds.
```

Answer: `NO BLUFF`.

Required verbal answer:

`There are no credible better-hand folds, so the polar target is absent.`

# Changed-variant protocol

After a correct first answer, change exactly one variable:

- open size `2.5x -> 4x`;
- depth `100bb -> 200bb`;
- passive -> aggressive player behind;
- late opener -> early opener;
- wide 3-bettor -> tight 3-bettor;
- call-heavy -> 5-bet-or-fold response;
- no straddle -> live straddle.

The learner must state what changed in the denominator, call branch or fold target.

# Mastery gate

A factory is provisionally mastered when the learner:

- scores action and reason correctly on `5/6` changed variants;
- names a real call branch;
- rejects at least two attractive but invented bluffs;
- identifies the value region before bluff volume;
- keeps confidence calibration within one grade of actual performance.

## Coverage effect

```text
H-W01-002: DIRECT ANSWER KEY ACTIVE
H-W01-008: DIRECT ANSWER KEY ACTIVE
Direct candidate drill coverage: 32/34
Remaining answer-key gaps: H-W01-006, H-R04-007
```

## Verdict

`PREFLOP_SQUEEZE_AND_POLAR_TARGET_DRILLS_ACTIVE`

`TWO_DIRECT_ANSWER_KEY_GAPS_CLOSED`

`EXACT_MIX_FREQUENCIES_NOT_REQUIRED_FOR_DRILL_ACTIVATION`
