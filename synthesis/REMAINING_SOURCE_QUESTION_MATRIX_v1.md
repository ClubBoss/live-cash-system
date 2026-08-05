# Live Cash System — Remaining Source Question Matrix v1

Status: `ACTIVE_ROUTING_SSOT / CASH_INJECTION_1_OF_10 / CARROT_PENDING`

## Purpose

Convert the remaining source workload into explicit validation questions.

Incoming Cash Injection and Carrot lessons should be routed to these question IDs before any new candidate or curriculum object is created.

A lesson may answer several questions. A question may require several sources. Absence of discussion is recorded as `NO_EVIDENCE`, not treated as disagreement.

## Closure vocabulary

- `OPEN`: material question remains.
- `PARTIAL`: direction is supported but boundary or context remains open.
- `MECHANISM_CLOSED`: robust direction is sufficient for teaching without exact frequencies.
- `CONTEXT_SPLIT`: different recommendations are preserved under different assumptions.
- `ANCHOR_PENDING`: mechanism is clear but exact range/sizing work remains separate.
- `FIELD_PENDING`: source mechanism exists but target live-population evidence is absent.
- `VISUAL_PENDING`: only an exact displayed claim remains.
- `NOT_REQUIRED`: question proved unnecessary for final compression.

## A. Depth, SPR and preflop architecture

| Question ID | Validation question | Current state | Preferred remaining evidence | Affected objects | Closure gate |
|---|---|---|---|---|---|
| `SQ-DEP-01` | Which strategic changes are robust at 30–70bb, ~100bb, 125–200bb and 200bb+ without pretending the bands are universal? | PARTIAL | Carrot depth treatment; exact source visuals only if thresholds matter | `H-W01-001`, `LCM-01`, `LCM-02` | context-aware depth branches with no false exactness |
| `SQ-DEP-02` | When does deep OOP dynamic-board strategy require preserving strong calls rather than raising? | OPEN | Carrot deep-OOP material; counterexamples and SPR scope | `H-W01-006`, `H-R04-010`, `LCM-03`, `LCM-05` | trigger, exception and misuse-resistant drill |
| `SQ-DEP-03` | How should straddles alter opening/3-bet size objectives beyond simple stack translation? | PARTIAL | Carrot or Injection explicit straddle treatment; later field profile | `H-W01-003`, `LCM-01`, `LCM-02`, environment overlay | mechanism plus profile-sensitive sizing rules |
| `SQ-PF-01` | What are the safe boundaries for expanding squeezes by purifying existing candidates? | OPEN | Carrot preflop range construction and players-behind treatment | `H-W01-002`, `LCM-02` | candidate families, blockers and protected-flat exception |
| `SQ-PF-02` | Which dominated high-card classes should lose first versus value-heavy 3-bets under live rake and depth? | PARTIAL / ANCHOR_PENDING | Carrot preflop defence; independent range work | `H-W03-002`, `LCM-02`, `LCM-07` | directional rule closed; exact anchors separately validated |
| `SQ-PF-03` | Which folds should polar preflop bluffs target, and when does a profitable call branch make polarization inappropriate? | PARTIAL | Carrot polar/linear/mixed treatment | `H-W01-008`, `LCM-02` | target-fold explanation and context split |
| `SQ-PF-04` | How much should players-behind risk and squeeze exposure compress cold-calling ranges? | PARTIAL | Carrot blind/cold-call material | `H-W01-009`, `LCM-02`, `LCM-03` | stable range-shape explanation, no copied chart |

## B. Blind identity, filtering and single-raised pots

| Question ID | Validation question | Current state | Preferred remaining evidence | Affected objects | Closure gate |
|---|---|---|---|---|---|
| `SQ-SRP-01` | What minimum blind/cold-caller distinctions are necessary for fast board ownership decisions? | PARTIAL | Carrot pedagogical compression | `H-W01-004`, `H-W01-007`, `LCM-03`, `LCM-04` | compact range-mass anchors and boundary drill |
| `SQ-SRP-02` | How should turn ownership change after a flop exploit succeeds but Villain continues? | MECHANISM_CLOSED | Carrot/Injection may add examples only | `H-W01-005`, `H-R05-001`, `LCM-04` | no new evidence required unless scope conflict appears |
| `SQ-SRP-03` | When should top pair or medium-strength hands raise versus small/wide bets, and when should stronger hands remain calls? | PARTIAL | remaining Injection; Carrot flop defence | `H-W02-004`, `H-W02-005`, `H-R05-002`, `LCM-05` | vulnerability, value/protection and call-preservation branches |
| `SQ-SRP-04` | When is a turn lead caused by flop range composition rather than the turn card alone? | PARTIAL | Carrot donk/probe framework | `H-W02-006`, `H-R04-007`, `LCM-04`, `LCM-06` | line-based trigger and board-family boundaries |
| `SQ-SRP-05` | What is the minimum viable protected passive architecture across check-call, check-back and range-check branches? | PARTIAL | Carrot protected-check language and counterexamples | `H-W01-006`, `H-R04-010`, `H-R05-002`, `LCM-05` | calls/raises/checks assigned by future resilience and urgency |

## C. Bet shape, aggression and future streets

| Question ID | Validation question | Current state | Preferred remaining evidence | Affected objects | Closure gate |
|---|---|---|---|---|---|
| `SQ-AGG-01` | Can value-first aggression be compressed into one reliable table algorithm across flop, turn and river? | PARTIAL / STRONG | Carrot alternative explanation and exceptions | `H-W02-001`, `LCM-06` | one cue, one boundary set, contrastive drills |
| `SQ-AGG-02` | Which bluff jobs are necessary for turn-to-river planning without requiring combo memorisation? | PARTIAL / STRONG | Carrot multi-street bluff construction | `H-W02-002`, `H-W03-005`, `LCM-06`, `LCM-09` | equity/removal/future-coverage taxonomy survives variants |
| `SQ-AGG-03` | What conditions preserve polarization strongly enough for overbets, and which apparent scare cards repair Villain instead? | PARTIAL / STRONG | Carrot sizing framework; exact visuals only for disputed boundaries | `H-W02-003`, `LCM-06` | robust ownership test plus counterexamples |
| `SQ-AGG-04` | How should small-raise sizing interact with required defence and exploit elasticity? | PARTIAL / FIELD_PENDING | remaining Injection; later live observations | `H-W03-006`, `CI-PH-001`, `LCM-05`, `LCM-10` | mechanism closed; population magnitude remains field-gated |

## D. 3-bet-pot ancestry and branch modelling

| Question ID | Validation question | Current state | Preferred remaining evidence | Affected objects | Closure gate |
|---|---|---|---|---|---|
| `SQ-3B-01` | Which preflop range-shape distinctions must be carried through postflop in a compact 3-bet-pot tree? | PARTIAL / STRONG | Carrot 3-bet-pot material | `H-W03-001`, `H-W01-009`, `LCM-07` | polar/linear/value-heavy/over-wide branches with cues |
| `SQ-3B-02` | How should an over-wide preflop range compensate through postflop checking? | PARTIAL / STRONG | Carrot postflop compensation | `H-W03-003`, `LCM-07` | distinguish preflop width from flop betting width |
| `SQ-3B-03` | When can the same opponent have a strong bet branch and weak check branch? | MECHANISM_CLOSED / FIELD_PENDING | Injection/Carrot may add exploit evidence | `H-W03-004`, `H-W02-007`, `LCM-07`, `LCM-10` | branch composition and falsifier are explicit |
| `SQ-3B-04` | How much later-street bluff supply disappears when preflop suited bluffs are missing? | PARTIAL / STRONG | Carrot river ancestry examples | `H-W03-005`, `H-W03-011`, `LCM-07`, `LCM-09` | backward-tracing algorithm usable without exact chart |

## E. Multiway structure

| Question ID | Validation question | Current state | Preferred remaining evidence | Affected objects | Closure gate |
|---|---|---|---|---|---|
| `SQ-MW-01` | How should shared defence change by sandwich versus closing action? | OPEN / SMASH-PRIMARY | Carrot multiway material | `H-W03-007`, `LCM-08` | role-based direction and counterexample |
| `SQ-MW-02` | What minimum equity/removal standard should multiway bluffs meet? | OPEN / SMASH-PRIMARY | Carrot multiway bluff construction | `H-W03-008`, `LCM-08` | candidate taxonomy and misuse-resistant drill |
| `SQ-MW-03` | How should nut ownership be inferred from preflop combo ownership rather than initiative? | PARTIAL | Carrot multiway range reading; exact anchors separately | `H-W03-010`, `LCM-08` | compact high-weight combo comparison |
| `SQ-MW-04` | When does suppressed flop aggression reappear as a turn lead or delayed action? | PARTIAL | Carrot sandwich/delayed-aggression evidence | `H-R04-007`, `LCM-08` | branch trigger, not generic turn-card rule |
| `SQ-MW-05` | When should strong value be fast-played because expected aggression will not arrive? | PARTIAL / FIELD_PENDING | remaining Injection/Carrot exploit evidence; live observations | `H-W03-009`, `LCM-08`, `LCM-10` | theory trigger separated from population confidence |

## F. River audit and blockers

| Question ID | Validation question | Current state | Preferred remaining evidence | Affected objects | Closure gate |
|---|---|---|---|---|---|
| `SQ-RIV-01` | How should exact size exclude medium-value hands before bluff-catching? | PARTIAL / STRONG | Carrot river sizing and value-range examples | `H-W02-009`, `LCM-09` | size-exclusion step works across variants |
| `SQ-RIV-02` | How should airless versus air-rich ancestry change underbluff/overbluff expectations? | PARTIAL / FIELD_PENDING | remaining Injection and Carrot exploit material | `H-W02-008`, `H-W02-009`, `H-W03-005`, `LCM-09`, `LCM-10` | mechanism plus evidence-grade overlay |
| `SQ-RIV-03` | Can blocker logic be taught only after realistic value/bluff/fold regions are reconstructed? | MECHANISM_CLOSED | new sources may simplify only | `H-W03-011`, `LCM-09` | no blocker action before ancestry audit |

## G. Opponent modelling, population hypotheses and field evidence

| Question ID | Validation question | Current state | Preferred remaining evidence | Affected objects | Closure gate |
|---|---|---|---|---|---|
| `SQ-EXP-01` | What evidence grade is required before a branch-specific exploit changes action? | PARTIAL / STRONG | remaining Injection and Carrot exploit methodology | `H-W02-007`, `H-R04-008`, `LCM-10` | grade, falsifier, decay and baseline return |
| `SQ-EXP-02` | When should speculative floats be removed first versus value-heavy bets? | PARTIAL / FIELD_PENDING | remaining Injection; Carrot population evidence | `H-W02-008`, `LCM-10` | range-composition trigger separated from pool claim |
| `SQ-EXP-03` | Which passive-pool observations justify fast-playing value? | PARTIAL / FIELD_PENDING | remaining Injection and target live fieldwork | `H-W03-009`, `LCM-10`, `LCM-11` | branch observations and adaptation rule |
| `SQ-EXP-04` | How should live tells update ranges without becoming conclusions? | MECHANISM_CLOSED / FIELD_PENDING | Carrot live-read treatment if present; field examples | `H-R04-008`, `LCM-10`, `LCM-11` | tell is weighted evidence with falsifiers |
| `SQ-EXP-05` | Do target players overfold and under-three-bet versus small flop raises after small range bets? | FIELD_PENDING | remaining Injection, then Batumi observations | `CI-PH-001`, `LCM-05`, `LCM-10`, `LCM-11` | local evidence grades; no universal frequency claim |

## H. Learning, drills and anchors

| Question ID | Validation question | Current state | Preferred remaining evidence | Affected objects | Closure gate |
|---|---|---|---|---|---|
| `SQ-LRN-01` | Does a new source provide a simpler explanation without changing mechanism scope? | OPEN CONTINUOUSLY | all incoming sources | all LCM modules | `SIMPLIFIES` relation and light confirmation drill |
| `SQ-LRN-02` | Does a new source reveal a genuinely new misconception rather than an existing error in new clothing? | OPEN CONTINUOUSLY | all incoming sources and learner data | taxonomy | new MC only after existing 30 fail to classify error |
| `SQ-LRN-03` | Does a source add a counterexample or boundary needed to prevent misuse? | OPEN CONTINUOUSLY | all incoming sources | modules and drills | boundary added without duplicating module |
| `SQ-RNG-01` | What original preflop anchor configurations are required for the target live games? | ANCHOR_PENDING | Carrot source comparison plus independent range work | `ranges/`, `LCM-02`, `LCM-03`, `LCM-07` | assumptions, version, validation and original representation |
| `SQ-RNG-02` | Which exact course visuals are necessary to resolve a rule, anchor or drill? | VISUAL_PENDING / CLAIM-DRIVEN | only disputed exact claims | source ledgers and affected objects | request exact timestamp only when decision changes |

## Source-family routing priorities

### Remaining Cash Injection

Prioritise questions involving:

- exploit direction;
- response elasticity;
- hand-class winners and losers inside one exploit;
- population hypotheses;
- evidence grades;
- practical field missions;
- falsifiers and adaptation.

Do not expect it automatically to close general theory or exact range anchors.

### Carrot Grades 1–3

Prioritise questions involving:

- preflop and blind structure;
- OOP reasoning;
- range and bet-shape pedagogy;
- multiway scope;
- deep/short-stack context;
- exploit methodology;
- alternative explanations and boundaries.

Exact course content is not presumed. Routing occurs after each lesson is ingested.

## Completion rule

The remaining source phase is complete when every question is one of:

- `MECHANISM_CLOSED`;
- `CONTEXT_SPLIT`;
- `ANCHOR_PENDING` with an independent range plan;
- `FIELD_PENDING` with a defined observation mission;
- `NOT_REQUIRED`.

No source family must answer every question.

## Matrix verdict

`REMAINING_SOURCE_WORK_IS_QUESTION_ROUTED`

`FUTURE_BATCHES_SHOULD_CLOSE_OR_REFINE_EXPLICIT_GAPS_NOT_RECREATE_GLOBAL_SYNTHESIS`
