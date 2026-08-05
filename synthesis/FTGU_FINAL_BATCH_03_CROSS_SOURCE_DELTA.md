# FTGU Final Batch 03 — Cross-Source Delta

Status: `SEVEN_LESSONS_MAPPED / FTGU COURSE COMPLETE / NO_AUTOMATIC_ADMISSION`

## Scope

New FTGU evidence:

- E03 — When Someone Limps;
- E04 — Calling an Open in Position;
- E05 — Calling Out of the Big Blind;
- E06 — Small Blind 3-Bet or Fold Strategies;
- E07 — Selective vs Unselective C-Betting;
- E08 — Call-Only Strategies vs C-Bets;
- E09 — Polarised Flop Raising.

The other 23 episodes are byte-identical to previously accepted packages and produce no new evidence.

## Major cross-source effects

### 1. Preflop decisions now have one complete structural sequence

E03–E06 add the missing path from limped pots through cold-calling and blind defence:

`PRICE → RANGE STRENGTH → PLAYERS BEHIND → POSITION/REALISATION → LINE SHAPE`

Key effects:

- limped-pot isolation depends on frequent strength, fold equity and position;
- cold-calls need value or implied-odds justification and must survive players-behind action;
- big-blind calls gain a third reason — pot odds — and are compared with the EV of folding;
- small-blind flats lose value through poor price, position, cappedness and squeeze risk;
- 3-betting is evaluated through the called branch, not used merely because flatting feels unattractive.

Strongest relations:

- H-W01-001 — extended through price, realisation, implied odds and stack remaining;
- H-W01-004 — strongly confirmed by the BB/SB structural split;
- H-W01-007 — extended by frequent-strength versus rare-strength language;
- H-W01-009 — strongly confirmed through squeeze survival and players-behind reach;
- H-W03-001 — confirmed: preflop line choice creates the postflop range;
- H-W03-002 — confirmed: dominated big cards suffer after range filtering;
- H-W03-009 — extended by the distinction between value acceleration and preserving future aggression.

### 2. The complete flop response spectrum is now explicit

E07–E10 form a coherent sequence:

`RANGE BET → SELECTIVE BET → CALL-ONLY RESPONSE → POLAR RAISE → MERGED RAISE`

This is not five independent rules. It is one range-shape decision family governed by:

- preflop range advantage;
- board filtering;
- urgency to deny equity or build the pot;
- position and SPR;
- whether the betting range is merged or polar;
- whether future aggression is likely to arrive.

Strongest relations:

- H-W01-004 — strongly confirmed: board texture must be applied to preflop ranges;
- H-W02-001 — strongly confirmed: the value threshold precedes bluff volume;
- H-W02-003 — confirmed: merged/high-frequency branches use smaller sizes while polar branches support larger sizes;
- H-W02-004 — extended from top-pair raises to the full response-shape family;
- H-W02-007 — confirmed: adjustments attach to the exact bet/check branch;
- H-R04-010 — confirmed: low-urgency nodes preserve strong hands in calls;
- H-R05-001 — confirmed: ownership follows filtered ranges rather than initiative;
- H-R05-002 — bounded: active raises protect passive ranges in urgent nodes, while protected calls can perform that job in low-urgency nodes.

### 3. Fast-play versus slow-play becomes conditional rather than stylistic

The final FTGU foundation clarifies a recurring Smash mechanism:

- fast-play when value is vulnerable, the board is wet, position is poor or future aggression is unlikely;
- preserve calls when SPR is already low, position gives control, multiway participation helps suitable hands or an aggressive bettor will continue bluffing.

This supports H-W03-009 and H-R04-010 without creating a generic "always raise wet / always slow-play dry" shortcut.

## Candidate-consolidation effect

No new independent table heuristic is added.

The most useful compression scaffolds are:

### Preflop

`PRICE → RANGE → PLAYERS BEHIND → REALISATION → LINE`

### Flop

`RANGE ADVANTAGE → URGENCY → BET SHAPE → RESPONSE SHAPE`

These should consolidate several existing candidates rather than increase the registry count above 34.

## Conflict findings

No direct Smash–FTGU strategic conflict was found.

Apparent tensions resolve as context splits:

- isolation sizing changes with position and squeeze risk;
- small blind 3-bet-or-fold remains a default with conditional flats;
- call-only strategies coexist with active raise defence because urgency, SPR and position differ;
- range betting and selective betting are endpoints on a spectrum rather than contradictory systems.

## FTGU corpus status

All 30 episodes now have canonical source-faithful records.

Remaining FTGU dependencies are claim-driven only:

- exact cards and suits;
- displayed sizes and frequencies;
- chart boundaries and solver outputs;
- proprietary hand charts remain reference-only.

## Verdict

`FTGU_FINAL_BATCH_03_CROSS_SOURCE_DELTA_ACCEPTED`

`FTGU_30_OF_30_CANONICALLY_INGESTED`

`NO_NEW_RULE_COUNT_INCREASE`

`READY_FOR_FULL_FTGU_CONSOLIDATION_AND_CARROT_VALIDATION`
