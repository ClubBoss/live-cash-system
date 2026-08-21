# A6 — Single-Raised Pot Decision Engine — 10/10 DoD V1

Status: `ACTIVE`

## Mission

Build the first-street SRP role engine from A5 recognition: learner sees board/range/hand state, then chooses a role-appropriate action rather than recalling a c-bet slogan.

## Scope split

A6 closes the high-frequency flop/core SRP families:

- OOP-01 range checking as PFR;
- OOP-02 check-call / check-fold;
- OOP-03 check-raise;
- OOP-04 defend vs small c-bet;
- OOP-05 defend vs large c-bet;
- IP-01 range vs selective c-bet;
- IP-02 check-back / delayed-aggression setup.

The following registry skills remain valid but are intentionally proven later where their prerequisites are richer:

- OOP-06 turn leads → A8;
- OOP-07 river block/bluff-catch → A8;
- IP-03 turn barreling → A8;
- IP-04 capped-range attacks → A8;
- IP-05 overbet branches → A8;
- IP-06 thin value → A8.

This is not missing scope; it removes the old topic-chapter assumption and places skills at the highest-EV point in the spiral route.

## 10/10 definition

A6 is 10/10 when:

1. Flop decisions begin from board × arriving ranges × role, not initiative.
2. OOP PFR can recognize when high-frequency checking/range-check simplification is appropriate.
3. A protected OOP checking branch includes calls, raises and folds; checking is not taught as surrender/cappedness.
4. Check-call/check-fold decisions respond to hand stability, sizing and realisation.
5. Check-raise value is judged versus the continuing range, with urgency/vulnerability and suitable bluff properties.
6. Small and large c-bets are not defended with one generic threshold; price and range shape move the continue region.
7. IP PFR can distinguish broad small betting from selective/polar betting based on range/nut interaction.
8. Check-back is a protected branch with future jobs, not failure to c-bet.
9. Supported core families have ≥2 recognition, ≥3 direct, ≥2 changed/mixed and ≥1 boundary stimuli.
10. At least one same-board/different-range and one same-range/different-board transfer exists.
11. At least one same-hand/different-sizing transfer exists for defence.
12. Practical Rules state default + why + reversal rather than `always c-bet/check` slogans.
13. Distractors express plausible misconceptions: initiative autopilot, made-hand autopilot, price blindness, absolute-hand shortcuts.
14. No solver frequency or size is universalised beyond source-supported directional families.
15. Remaining improvements are later-street scope, additional volume, visual verification or real-user calibration.

Executable validation remains pending while local execution is unavailable. GitHub Actions are not a development gate.
