# Carrot Grade 3 Lectures 08–09 — Original Assessment Blueprint v0.1

Status: `ACTIVE / SOURCE-INDEPENDENT / SIX_FAMILIES`

## Purpose

Convert the durable mechanisms from protected checking and OOP 3-bet-pot defence into original learner assessments without copying source boards, hands, frequencies, solver grids or exam wording.

## Design rules

- use independently generated nodes;
- require prediction before feedback;
- score action and reason separately;
- distinguish theory from opponent-specific override;
- avoid fake solver precision;
- preserve exact-depth and population uncertainty;
- do not convert class membership into an automatic action.

## Family 1 — Protected-check trade-off ledger

### Skill

Compare immediate betting gains with the gains and sacrifices created by checking.

### Prompt structure

Provide a strong but non-nut hand and two opponent models. Ask the learner to fill four fields:

- hands that call a bet but check back;
- hands that fold to a bet but may bluff after a check;
- better hands against which checking saves or realises equity;
- future check-raise or check-call branches.

### Pass condition

The learner evaluates the whole tree instead of judging the check by whether one branch checks through.

### Repair target

`STRONG_HAND_MUST_BET_NOW`.

## Family 2 — Next-node protection sufficiency

### Skill

Determine whether a checking range can resist the opponent's likely next action.

### Prompt structure

Give a range sketch after Hero checks and ask:

1. Which parts can call?
2. Which parts can raise?
3. Which parts fold?
4. What happens if the opponent stabs range or uses a large polar bet?
5. Which strong hands must remain in the checking range?

### Pass condition

The learner protects the range with credible calls and raises rather than adding random slow-plays.

## Family 3 — Solver-to-opponent checking delta

### Skill

Translate an equilibrium checking range into a conditional live exploit.

### Prompt structure

Show the same node against:

- a passive player who rarely bets after checks;
- an aggressive regular who over-stabs perceived weakness.

Ask the learner to adjust the checking range and state the falsifier that would return the strategy toward baseline.

### Pass condition

The learner changes strategy only through an explicit opponent branch and does not universalise a pool claim.

## Family 4 — Identical-class 3-bet-pot defends

### Skill

Compare visually different hands by future winning routes and call EV class.

### Prompt structure

Present four independently generated OOP 3-bet-pot hands:

- medium pocket pair;
- two large overcards;
- lower overcards with backdoors;
- immediate draw with domination risk.

Ask the learner to classify each as likely winning, close or losing call and explain:

- live pair draws;
- immediacy;
- domination;
- OOP realisation.

### Pass condition

The learner does not rank hands by visual attractiveness alone.

## Family 5 — Tier-one raise eligibility gate

### Skill

Decide whether an OOP range can support a raise range on a given texture.

### Prompt structure

Provide two preflop ranges and two flops. Ask:

```text
Does Hero own tier-one value?
→ if yes, which value classes support raises?
→ which bluffs or hybrids can be attached?
→ if no, should raising collapse even if defence remains wide?
```

### Pass condition

The learner separates total range EV, defence frequency and raise eligibility.

## Family 6 — Low-SPR turn-jam construction

### Skill

Build a repolarised OOP turn-jam range after a 3-bet-pot c-bet-call branch.

### Prompt structure

Ask the learner to assign hands into:

- thick value jam;
- high-EV bluff jam;
- selected hybrid jam;
- call;
- fold.

Require a separate denial statement for each jam candidate.

### Pass condition

Denial strengthens value/bluff candidates but does not authorise jamming the median range.

### Repair target

`DENIAL_EQUALS_PERMISSION_TO_JAM`.

## Runtime placement

Recommended order:

```text
Family 1
→ Family 2
→ Family 3
→ Family 4
→ Family 5
→ Family 6
→ changed texture
→ changed opponent
→ delayed retest
```

## Scoring dimensions

- node and range ancestry;
- action threshold;
- branch trade-off quality;
- realisation reasoning;
- top-end value support;
- denial discipline;
- theory-versus-field separation;
- confidence calibration.

## Count effect

```text
Grade 1 families:          24
Grade 2 families:          20
Grade 3 L01–L02 families:   6
Grade 3 L03–L04 families:   7
Grade 3 L05–L07 families:   7
Grade 3 L08–L09 families:   6
Total Carrot families:     70
```

Feedback repair paths remain separate.

## Source-purity statement

These families use original scenarios and wording. They do not reproduce source boards, exact hands, solver percentages, EV values or exam questions.

## Verdict

`SIX_NON_DUPLICATIVE_ORIGINAL_FAMILIES_READY`

`PROTECTED_CHECKING_AND_OOP_3BET_DEFENCE_ASSESSABLE`

`TOTAL_CARROT_ASSESSMENT_FAMILIES_70`
