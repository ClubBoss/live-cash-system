# Live Cash System — Deep OOP Source Evidence Map v0.1

Status: `ACTIVE_EVIDENCE_MAP / DIRECTIONAL_BOUNDARY_SUPPORTED / EXACT_NUMERIC_THRESHOLDS_GATED`

## Purpose

Establish the strongest source-supported answer to:

> When should an out-of-position range preserve a strong call branch, and when must it raise or fold as effective depth, current SPR, board dynamism, bet shape and future aggression change?

This map supports an original directional decision architecture. It does not reproduce source boards, solver grids, exact combo assignments or mixed frequencies.

## Primary evidence

| Source | Relation | Supported mechanism | Exact limits |
|---|---|---|---|
| `SLC-M02-L21` | DIRECT | Deep high-SPR OOP play protects the middle through substantial checking/calling; strong hands remain in call; larger bets reduce raises | exact board, sizes, weights and frequencies |
| `SLC-M02-L15` | EXTENDS | Difficult backdoor/high-card calls can preserve future range and bluff inventory | exact cards and threshold calls |
| `SLC-M02-L16` | DIRECT | Vulnerable made hands can raise for value/protection when they unblock folds; stronger resilient hands can call | exact board weights |
| `SLC-M02-L17` | DIRECT | Small/wide bets permit broader protection raises; large/polar bets suppress thin raises; passive future action moves value forward | exact frequencies |
| `CP-G2-L05` | DIRECT | Robust hands preserve passive branches; frail hands need more urgent action; slow-play may be theoretical, exploitative or erroneous | exact robustness boundary |
| `CP-G2-L07` | DIRECT | Map call/raise/fold geography; range-wide and selective bets require different responses | exact hand landmarks |
| `CP-G3-L05` | DIRECT | Value beater, bluff catcher and frail are distinct; call and raise thresholds are separate tests | exact combo/EV thresholds |
| `CP-G3-L08` | DIRECT | Strong checks/calls invest in future branch resistance; compare immediate gain with check-branch gains and sacrifices | exact frequencies |
| `CP-G3-L09` | DIRECT | Lower SPR increases immediacy; OOP raising needs top-end support; denial does not authorise median jams | exact SPR examples |
| `FTGU-E08` | CONFIRMS | Call-only can be coherent when urgency is low and later aggression is credible; wetness/vulnerability restores raises | exact SPR/boards |
| `FTGU-E09` | CONFIRMS | Raise when value, protection and OOP urgency justify it; value must perform versus the continuing range | exact size/frequency |
| `FTGU-E10` | CONFIRMS | Small range-wide betting supports merged protection raises; selective/polar betting suppresses them | exact frequencies |
| `FTGU-E14` | EXTENDS | Defence is street-by-street range filtering; no fixed percentage shortcut | exact MDF examples |
| `FTGU-E29` | CONTEXT_SPLIT | A protected passive branch need not always contain a large raise tree | exact hand partition |
| `SLC-M06-L57` | EXTENDS | Nominal depth can mislead in straddled pots; under-raising changes future realisation | exact stream node |

## Cross-source invariants

### Nominal depth is not the selector

```text
CURRENT POT + BET SIZE + STACK BEHIND
→ POST-ACTION SPR
→ NUMBER OF MEANINGFUL FUTURE BETS
```

A nominally deep straddled or 3-bet pot can have a compressed tree. A 100bb single-raised pot can retain an extended tree.

### Protected call is a range function

A strong call can:

- prevent the passive branch from becoming capped;
- retain opponent bluffs;
- preserve future check-raises, leads and bluff-catches;
- reduce exposure to a polar continuing range;
- protect weaker calls.

Calling is not justified by discomfort with raising or by raw equity alone.

### Raise and call thresholds are separate

A hand can be:

- a winning call but an inferior raise;
- a losing call but a viable bluff raise;
- a value/protection raise against a merged range;
- too frail for either branch.

“Probably ahead” is not a value-raise test. The hand must perform against the range that continues.

### Bet shape changes response geography

```text
SMALL / RANGE-WIDE / MERGED
→ wider calls
→ thinner value/protection raises

LARGE / SELECTIVE / POLAR
→ compressed calls
→ fewer thin raises
→ stronger polar raise branch
```

### Board dynamism changes urgency

Dynamic boards increase runout volatility, positional leverage, denial value for vulnerable hands and the need for clean redraws. Static boards increase the viability of strong calls when later aggression is credible.

### Future aggression changes slow-play EV

- Credible future betting supports protected calls and traps.
- Missing future betting shifts value toward direct raises/leads.
- This is an opponent-specific switch, not a population claim.

## Operational SPR bands

The system uses three execution bands, not solver cutoffs:

| Band | Post-action SPR | Operational meaning |
|---|---:|---|
| `C — compressed` | `<=1.5` | roughly one meaningful future investment |
| `M — middle` | `>1.5 to 4` | one to two meaningful decisions |
| `E — extended` | `>4` | multiple future decisions; position and robustness gain weight |

## Exact claims not supported

The evidence does not justify:

- one universal bb threshold for “deep”;
- one exact SPR at which a hand changes action;
- exact board-by-board raise frequencies;
- exact combo assignments;
- a universal under-barrel magnitude;
- a rule that deeper always means more calling.

## Evidence verdict

`DEEP_OOP_DIRECTIONAL_BOUNDARY_SUPPORTED`

`POST_ACTION_SPR_OVERRIDES_NOMINAL_DEPTH_LABEL`

`PROTECTED_CALL_AND_REQUIRED_RAISE_BRANCHES_SEPARATED`

`EXACT_NUMERIC_AND_COMBO_BOUNDARIES_REMAIN_GATED`
