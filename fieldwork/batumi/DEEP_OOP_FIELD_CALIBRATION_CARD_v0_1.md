# Batumi Deep OOP Field Calibration Card v0.1

Status: `OBSERVATION_SCHEMA / NO_POPULATION_CLAIM`

## Purpose

Measure the branches that determine whether protected calls or faster value perform better in the target games. Record opportunities, not only memorable pots.

## Opportunity record

```text
date/session:
stake:
blind/straddle:
effective stack:
pot type:
current pot:
bet faced:
post-call SPR:
board urgency: low / medium / high
Villain bet shape estimate: wide / selective / unknown
Hero hand class: R / V / F
Hero action:
next-street Villain action:
showdown/reveal:
confidence:
```

## Counters

### Future aggression after OOP call

- opportunities;
- turn bets;
- river follow-throughs;
- obvious give-ups;
- value-only follow-throughs.

### Small/wide bet response

- opportunities;
- OOP calls;
- OOP raises;
- raise shown as value;
- raise shown as bluff/semi-bluff;
- no-showdown.

### Large/selective bet response

Use the same counters, separately.

### Slow-play value arrival

When OOP holds strong value and calls/checks:

- did Villain bet again?
- did worse call later?
- did the pot stagnate?
- did a runout kill action?
- was the original read supported?

### Under-raising evidence

- opportunities to raise;
- natural value raises observed;
- natural draw raises observed;
- calls with later-revealed raising candidates;
- sample confidence.

## Evidence grades

- `E0`: intuition only;
- `E1`: one observed branch;
- `E2`: repeated player-specific pattern;
- `E3`: repeated table/pool pattern with denominators;
- `E4`: stable across sessions and stakes.

No population override before `E3`.

## Use boundary

Field evidence can adjust robust-call weight, fast-play value weight, future-barrel expectation and bluff-raise credibility. It cannot create random hand classes or overwrite range construction.
