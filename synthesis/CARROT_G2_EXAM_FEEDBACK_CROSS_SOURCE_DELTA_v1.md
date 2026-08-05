# Carrot Grade 2 Exam Feedback — Cross-Source Delta v1

Status: `ANSWER_KEY_CONTINUITY_COMPLETE / NO_NEW_CORE_CANDIDATE`

## Purpose

Map the Grade 2 exam feedback to existing evidence, questions, candidates and modules without copying the source's exact boards or solver outputs.

## Course-level result

The feedback confirms one coherent decision order:

```text
ACTION HISTORY
→ RANGE FILTERING
→ WORLD FAVOURABILITY
→ FREQUENCY
→ RELATIVE POLARISATION
→ SIZE / RAISE BREADTH
→ HAND TIER / RESPONSE THRESHOLD
→ CHECK EV / FINISHING EQUITY
→ BLOCKERS
→ FIELD EVIDENCE
```

No new independent strategic mechanism was found.

## Question-to-system map

| Exam question | Main existing mechanisms | Primary modules | Delta |
|---|---|---|---|
| Q1 turn cards | range/nut advantage, frequency/size separation, turn filtering | `LCM-04`, `LCM-05`, `LCM-06` | confirms different turn cards can change EV, frequency and size in different directions |
| Q2 OOP probe | unfavourable world, polar probe, bluff quality as bet-minus-check EV | `LCM-03`, `LCM-06`, `LCM-09` | strengthens negative-EV-bet and blocker-to-folds boundary |
| Q3 mandatory river bet | river-blunder gate, fold equity above neutral norm, line-derived value threshold | `LCM-06`, `LCM-09` | confirms mandatory action can arise from low check EV rather than hand strength alone |
| Q4 value tiers | finishing equity, unblockers, action reopening | `LCM-05`, `LCM-06`, `LCM-09` | confirms blocker direction can reverse size choice within top value |
| Q5 OOP delayed c-bet | theoretical slow-play, check-raise access, thin value/denial | `LCM-03`, `LCM-05`, `LCM-06` | strengthens optional-bet and protected-check architecture |
| Q6 urgency and weak bluffs | urgency, investment ceiling, delayed fold equity | `LCM-03`, `LCM-06` | confirms weak hands may have positive check EV from future bluff opportunities |
| Q7 facing bets | robustness/frailness, suit-specific threshold geography | `LCM-05`, `LCM-09` | confirms aggregate hand labels are insufficient when suits alter value/bluff interaction |
| Q8 triple barrel | origin range, bluff supply, value blockers, bet-fold blockers | `LCM-04`, `LCM-09`, `LCM-10` | strongly confirms ancestry-before-blockers and non-bottom-of-range bluff raises |
| Q9 3-bet pots | range advantage for frequency, relative polarisation for size, SPR | `LCM-01`, `LCM-05`, `LCM-07` | validates the compact 3-bet-pot flop-plan model |
| Q10 raising | frailness threshold, hybrid/thin raise, frequency-versus-magnitude | `LCM-05`, `LCM-06`, `LCM-10` | confirms merged raises versus range bets; exploit magnitude remains field-gated |

## Candidate effect

The feedback strengthens existing rows, especially:

- `H-W01-005` — recalculate ownership after every action;
- `H-W01-006` — OOP realisation and protected passive branches;
- `H-W01-009` — range origin and prior reach;
- `H-W02-001` — value-first aggression;
- `H-W02-002` — bluff jobs and check EV;
- `H-W02-003` — value-driven sizing;
- `H-W02-004` — bet shape and response shape;
- `H-W02-005` — medium-strength active raises;
- `H-W02-009` — river ordered audit;
- `H-W03-001` — 3-bet-pot ancestry;
- `H-W03-005` — inherited bluff supply;
- `H-W03-006` — wide response versus small merged bets;
- `H-W03-011` — blockers as final selectors;
- `H-R04-010` — protected checks and calls;
- `H-R05-001` — whole-tree recalculation;
- `H-R05-002` — active defence inside passive strategies.

No candidate is created, admitted, rejected or migrated.

```text
candidate count:       34
DRILL_READY:           27
VALIDATION_PENDING:     7
ADMITTED:                0
```

## Assessment effect

The feedback validates the answer keys and misconception targets for the existing twenty Grade 2 original assessment families.

It adds no new family count.

```text
Grade 1 original families: 24
Grade 2 original families: 20
Total Carrot families:      44
```

## Newly explicit repair rules

1. **Better hand is not automatically better bluff.** Compare bet EV with check EV.
2. **A bet can be worse than folding.** Negative blockers and retained check EV can make betting negative.
3. **Do not infer range shape from the action label alone.** A check-back may remain protected.
4. **Do not use aggregate hand labels where suits materially alter blockers or redraws.**
5. **Do not bluff-raise the bottom of range automatically.** Block value/calls and avoid blocking bet-folds.
6. **Do not equate more frequent calls with higher value EV.** Frequency and magnitude are separate.
7. **Do not assume slow-play is good because the hand is strong.** Classify theoretical, exploitative or erroneous slow-play.
8. **Do not let absolute hand strength override line-derived relative strength.**

## Remaining-source effect

The feedback closes Grade 2 answer-key continuity but does not close:

- squeeze purification;
- exact deep-OOP thresholds;
- polar preflop target folds;
- players-behind compression;
- independent live-rake anchors;
- multiway shared defence and bluff construction;
- multiway delayed aggression;
- exact depth/straddle overlays;
- target-live population magnitude.

## Source-purity boundary

The product must not copy:

- source boards or hands;
- exact solver outputs;
- exact mixed frequencies;
- source wording or page/video sequence;
- the instructor's exploit recommendation as a universal live default.

## Verdict

`CARROT_G2_ANSWER_KEY_CONTINUITY_COMPLETE`

`EXISTING_TWENTY_FAMILY_ASSESSMENT_LAYER_VALIDATED`

`NO_NEW_CORE_CANDIDATE`

`GRADE_3_REMAINS_PRIMARY_OPEN_SOURCE_PHASE`
