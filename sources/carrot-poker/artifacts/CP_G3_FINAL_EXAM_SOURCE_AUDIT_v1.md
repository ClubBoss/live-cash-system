# Carrot Poker Grade 3 Final Exam — Source Audit v1

Status: `VISUAL_ARTIFACT_ACCEPTED / LECTURES_AND_FEEDBACK_PENDING`

## Source identity

- source ID: `CP-G3-EXAM`;
- source artifact: `Grade 3 - Exam.pdf`;
- PDF SHA-256: `3a7c09366de76b0a9055d3391f695ef5c26b13a842fedcc6384316486cd03250`;
- pages: `12`;
- format: PowerPoint-exported PDF, 16:9 pages;
- author metadata: Peter Clarke;
- creation metadata: 2022-06-28.

The original PDF remains private and reference-only. This audit records its structure and competency profile without copying the source questions into product-facing material.

## Visual QA

All 12 pages were rendered and visually inspected.

```text
page 1: Carrot Corner cover
page 2: Grade 3 Exam cover
pages 3–12: ten exam questions
```

Result:

- all pages render correctly;
- cards, suits, positions, action histories and sizing labels are visible;
- no clipping, corruption, missing page or broken layout was observed;
- parsed text alone is not authoritative for exact suits, card order or action geometry;
- no PDF repair or OCR rerun is required.

## Question-level competency inventory

### Q1 — turn defence and check-raise selection

The question asks for comparison of call versus raise EV across multiple hand classes after a flop bet/call and turn bet.

Visible competency targets:

- combo-specific call/raise selection;
- equity realisation versus active denial;
- draw and made-hand class differences;
- coaching a likely overcall or misclassified continue.

### Q2 — mixed turn betting and sizing ceiling

The question asks for a thought process when mixing whether to bet and how large, identification of non-obvious large value bets, and explanation for exclusion of an extreme overbet.

Visible competency targets:

- separate frequency from size;
- value-tier and finishing-equity reasoning;
- identify thin or non-obvious large value;
- explain why a larger size is not supported by range architecture.

### Q3 — combo-level bluff selection

The question compares suited bluff candidates, asks for a solver approach to a made/draw hand, and asks why one suit combination has higher betting EV than related combinations.

Visible competency targets:

- suit- and blocker-sensitive bluff selection;
- check EV versus bet EV;
- hybrid value/denial classification;
- combo-specific future-branch reasoning.

### Q4 — five-part check-raising range and turn reclassification

The question explicitly asks the learner to reproduce five parts of a check-raising range and reassess each class on multiple turn cards after the raise is called.

Visible competency targets:

- check-raise range architecture;
- range-class taxonomy;
- turn-dependent class migration;
- future-street planning after active aggression.

### Q5 — river bluff-catching and bluff unblocking

The question focuses on why unblocking bluffs matters, which bluff-catchers fail that test, a large EV loss from one call, and coaching a student who cites a solver output.

Visible competency targets:

- origin-range bluff supply;
- suit-level bluff interference;
- value-beater versus bluff-catcher distinction;
- solver-output misuse and context validation;
- coaching from mechanism rather than screenshot authority.

### Q6 — very large turn overbet architecture

The question asks why a very large overbet uses diverse air, why one made hand must use the largest size in equilibrium, whether that remains true in a real pool, why one top-pair class checks more than another and why intermediate sizes disappear.

Visible competency targets:

- overbet bluff diversification;
- value/bluff size exclusivity;
- equilibrium versus pool-exploit distinction;
- check EV and hand-class robustness;
- size-set compression.

### Q7 — river overbet and showdown-value geography

The question asks how favorable a river is for the aggressor, how one specific hand plays, why the checking range contains little showdown value and what previously missed plays become available.

Visible competency targets:

- river range favorability;
- showdown-value scarcity;
- large-size value/bluff construction;
- thin or unconventional aggression enabled by range geography.

### Q8 — protected checks and high check-raise frequency in a 3-bet pot

The question asks for unintuitive checks, why a high raise frequency follows after checking and facing a small bet, and why only one turn size is used.

Visible competency targets:

- protected OOP checking range;
- check-raise breadth against a small/merged response;
- mandatory raise candidates;
- relative polarisation and single-size selection.

### Q9 — texture-dependent defence and raising in a 3-bet pot

The question asks for flop textures producing very low folds, no raises and near-neutral fold equity, then asks for a turn hybrid value/denial raise after calling.

Visible competency targets:

- texture-dependent response shape;
- fold and raise frequency drivers;
- pot-odds norm adjusted by range asymmetry;
- turn class migration;
- hybrid value/denial raising.

### Q10 — turn strategy in a 4-bet pot

The question asks for combo-specific behavior, expected pool misplay, why the in-position player almost never raises after a bet and why two overpair classes use different strategies.

Visible competency targets:

- low-SPR 4-bet-pot range architecture;
- combo-specific bluff/value placement;
- pool deviation forecasting;
- absent-raise explanation;
- overpair class differences and protected checking.

## Preliminary module routing

The exam artifact visibly targets:

- `LCM-04` — action filtering and ownership;
- `LCM-05` — bet shape and response shape;
- `LCM-06` — aggression and future jobs;
- `LCM-07` — 3-bet/4-bet-pot ancestry and SPR-sensitive planning;
- `LCM-09` — river audit and bluff-catching;
- `LCM-11` — reasoning-first assessment and coaching.

The exam alone does not establish direct Grade 3 evidence for:

- preflop squeeze construction;
- exact opening/defence anchors;
- multiway strategy;
- straddle overlays;
- exact deep-stack bands.

## Important scope correction

Before receiving this artifact, Grade 3 was provisionally expected to concentrate mainly on preflop, exact depth and multiway gaps.

The actual exam instead shows substantial emphasis on advanced postflop range construction:

- check-raising;
- turn and river overbets;
- combo-level bluff selection;
- river bluff-catching;
- 3-bet-pot defence;
- 4-bet-pot turn strategy.

This is an assessment-level observation only. The full Grade 3 lecture scope remains unknown until the lecture transcripts arrive.

## Answer-key boundary

The PDF provides questions, not source answers.

Therefore it does not currently support:

- final action keys;
- exact solver frequencies;
- exact EV gaps;
- exact mixed strategies;
- final original assessment answer keys;
- candidate promotion or rejection.

Those remain pending the Grade 3 lectures and Exam Feedback.

## Source-purity rule

Do not copy into product-facing materials:

- exact boards or hands;
- exact suits;
- exact action sequences;
- source wording;
- solver screenshots or sizing menus;
- page design.

Future original assessments may test the same competencies using independently created nodes and answer keys grounded in the complete Grade 3 source set.

## Audit verdict

`CP_G3_EXAM_VISUALLY_ACCEPTED`

`TWELVE_PAGES / TEN_QUESTIONS`

`GRADE_3_ADVANCED_POSTFLOP_COMPETENCY_PROFILE_VISIBLE`

`LECTURE_AND_ANSWER_KEY_CONTINUITY_PENDING`

`NO_PDF_REPAIR_REQUIRED`

`NO_STRATEGIC_ADMISSION_EFFECT`
