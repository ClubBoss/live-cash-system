# Carrot Poker Grade 2 Final Exam — Source Audit v1

Status: `VISUAL_ARTIFACT_ACCEPTED / REFERENCE_ONLY`

## Source metadata

- source ID: `CP-G2-EXAM`;
- artifact: `Grade 2 - Exam.pdf`;
- pages: `12`;
- PDF SHA-256: `49f5337fb5807698b412d35ed0c72355c3901bfaca7c01c72a580af9d61a3fd5`;
- author metadata: Peter Clarke;
- source family: Carrot Poker School;
- grade: 2.

## Visual QA

All 12 pages were rendered and inspected.

- page 1: cover;
- page 2: exam guidance;
- pages 3–12: ten competency questions;
- cards, suits, action buttons and solver-input panels are visually readable;
- parsed text alone is not authoritative for suits, board order or exact action geometry;
- rendered pages are the authority for exact source visuals.

No PDF repair or OCR rerun is required.

## Exam guidance

The source asks the learner to:

- explain why the strategy occurs rather than report a solver output;
- write answers before watching feedback;
- keep answers concise;
- spend no more than roughly 15 minutes per question;
- compare written reasoning with the feedback video afterwards.

This is accepted as assessment-process evidence, not as a product-facing script.

## Competency map

### Question 1 — Turn card changes to frequency and size

Tests whether the learner can compare betting frequency and sizing across different turns after the same flop branch, using IP equity and EV rather than card labels alone.

Primary concepts:

- action filtering;
- world favourability;
- frequency versus sizing;
- range and nut distribution after turn changes.

### Question 2 — Turn probe construction

Tests:

- probe frequency;
- probe sizing;
- bluff-candidate comparison;
- why a bet can be worse than zero EV when checking has positive EV.

Primary concepts:

- bluff tiers;
- world favourability;
- check EV;
- blocker and removal quality subordinate to the action family.

### Question 3 — Mandatory betting and fold-equity adjustment

Tests:

- mandatory bets;
- fold equity relative to the neutral pot-odds benchmark;
- why a draw may check;
- why another draw/air class may gain EV by betting.

Primary concepts:

- pot-odds norm adjustment;
- river-blunder / missed-opportunity gate;
- showdown-value opportunity cost;
- full-tree EV.

### Question 4 — Hand-class sizing and action comparison

Tests value-tier assignment across several hand classes within one river line.

Primary concepts:

- finishing equity;
- value tiers;
- size toolkit;
- check versus small/large bet;
- relative strength inside the actual range.

### Question 5 — OOP slow-play and bluff selection

Tests:

- why some strong hands mix small bets;
- why other strong hands check sometimes;
- why the strongest region may not check;
- why similar low-equity hands differ as bluff candidates.

Primary concepts:

- theoretical versus erroneous slow-play;
- protected checks;
- robust versus frail value;
- bluff-tier and removal selection.

### Question 6 — Urgency, Tier 3 value and positive check EV

Tests:

- urgency;
- Tier 3 hand behaviour;
- why a hopeless-looking bluff may bet;
- where positive check EV comes from.

Primary concepts:

- value/bluff tiers;
- check EV;
- future branches;
- favourable world;
- hybrid-bet audit.

### Question 7 — Robustness and frailness thresholds

Tests:

- robustness threshold;
- frailness threshold;
- Grade A/B/C bluff catchers;
- why a medium made hand can raise sometimes.

Primary concepts:

- response range geography;
- robust versus frail;
- future bluff tax;
- volatile value realisation;
- raise threshold.

### Question 8 — Triple-barrel bluff-catching and bluff-raising

Tests exact hand comparisons after a triple-barrel line:

- relative call EV;
- bluff-raise eligibility;
- why one missed draw is not a good bluff raise;
- suit/blocker differences between otherwise similar calls.

Primary concepts:

- origin-range bluff supply;
- filter density;
- value beater / bluff catcher / frail classification;
- blocker ordering;
- river bluff-raise value blockers.

### Question 9 — 3-bet-pot flop frequency and sizing

Tests comparison of flop c-bet strategy across three materially different textures in a 3-bet pot.

Primary concepts:

- preflop range shape;
- SPR;
- range advantage versus nut advantage;
- frequency versus size;
- coherent flop plan family.

### Question 10 — Facing a flop c-bet and postflop raising

Tests:

- three-way action mixes;
- pros and cons of call versus raise;
- the betting-sink concept;
- why thin/merged value may raise even when weaker hands can fold.

Primary concepts:

- raise breadth from opposing bet shape;
- range geography;
- volatile value realisation;
- merged raising;
- full-tree EV rather than keep-weaker-in isolation.

## Source-to-product boundary

The PDF is retained as a private reference-only artifact.

Do not copy into product-facing material:

- exact boards;
- exact hole cards;
- exact action sequences;
- exact solver menus;
- exact question wording;
- source layout or visual design.

Product-facing assessments must remain original and mechanism-based.

## Audit result

The exam validates the major Grade 2 competency families already derived from Lectures 01–10.

It does not add a new strategic mechanism and does not close:

- preflop squeeze construction;
- exact deep-stack thresholds;
- polar preflop target folds;
- multiway delayed aggression;
- independent range anchors.

## Verdict

`CP_G2_FINAL_EXAM_VISUALLY_ACCEPTED`

`TEN_COMPETENCY_QUESTIONS_MAPPED`

`SOURCE_EXAMPLES_REFERENCE_ONLY`

`GRADE_2_EXAM_FEEDBACK_STILL_PENDING`
