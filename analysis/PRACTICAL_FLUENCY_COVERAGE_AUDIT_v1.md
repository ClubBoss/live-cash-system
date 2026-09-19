# Live Cash OS — Practical Fluency Coverage Audit v1

Status: `P1_LEARNING_DEFECT_CONFIRMED / IMPLEMENTATION_NOT_YET_ADMITTED`

Date: 2026-08-21

Base: `10b910eadece6b3790397cdf7e1bbd3ed1f1099c`

## Trigger

Real-use evidence after completion of the first three learner modules identified a material gap between conceptual understanding and table-execution fluency, especially for blind play. An independent repository/source audit confirmed that the finding is broader than one lesson: the current 11-module curriculum preserves strong mechanism coverage but compresses a much larger practical source corpus into 55 governed drills.

This artifact does not create human strategy/drill approval and does not claim W10 completion.

## Scope

Live cash NLHE only. Primary target remains 1/3 and 2/5, usually 100–200bb, sometimes deeper, with straddles and short effective stacks possible.

Explicitly out of scope for this audit: MTT/ICM, SNG, PKO, PLO, HUD/online operations, bankroll/career curriculum, visual redesign, scheduler/mastery threshold changes, production deployment.

## Evidence used

Canonical source families already present in the repository:

- FTGU: 30/30 canonical episodes;
- Carrot Poker: Grades 1–3, exams and feedback mapped;
- Smash Live Cash: preflop, SRP, 3-bet-pot, multiway and hand-review corpus;
- Cash Injection: 10/10 canonical exploit episodes;
- current Live Cash OS module/drill corpus and current feature-freeze authorities.

External checklist supplied by the owner was used only as an audit taxonomy. It is not a strategy authority and does not override repository source hierarchy.

## Defect statement

`MODULE_GOLD != SKILL_FAMILY_FLUENT`

The product currently over-represents mechanism explanation, range/source reasoning, evidence discipline and transfer/retention governance relative to repeated execution across position pairs, hand families, board classes, stack depths, bet sizes and changed-node variants.

This is not a claim that the existing strategy is wrong. It is a learner-transfer defect: source-supported skills are insufficiently materialized as repeated decisions.

## Highest-EV gap families

1. Blind practical fluency: BB defence + SB/BB blind-versus-blind.
2. SRP OOP, especially BB versus late-position opener.
3. Practical preflop position tree: RFI, call, 3-bet, facing 3-bet, limp/isolation.
4. Board-class recognition across common SRP/3BP textures.
5. Hand-family execution across those nodes.
6. 3-bet-pot role matrix: aggressor/caller × IP/OOP.
7. Multiway practical decisions.
8. Deep-stack practical decisions.
9. Turn barrel/probe/lead families.
10. River pattern library.

## First bounded implementation admission candidate

`BLIND_PRACTICAL_FLUENCY_PILOT_V1`

Why first:

- direct real-use learner evidence exists;
- source support is strong and already admitted directionally through LCM-02/03;
- blind decisions are frequent and high-transfer;
- append-only practice can preserve original drill IDs and learner-state schema;
- it tests the practical-fluency architecture before broad curriculum expansion.

### Required pilot coverage

The pilot should add source-governed original decision variants for:

- BB vs late-position open;
- BB closing-action call versus open+caller;
- SB versus late-position open with BB behind;
- SB first-in versus BB;
- BB versus SB open;
- BB versus SB limp;
- blind-versus-blind postflop source/range realization.

Variants should change one strategically meaningful variable at a time where possible: hand family, open size, stack depth, player behind/action closing, opponent tendency only when evidence permits, and board class for postflop nodes.

### Learning loop

`recognize -> decide action -> give reason -> changed node -> mixed retrieval -> repair -> delayed retrieval -> real-hand transfer`

No new theory chapter is required for the pilot.

## Integrity constraints

- preserve all original LCM IDs;
- preserve all original drill/action/reason/misconception IDs;
- new drill IDs must be append-only and collision-free;
- do not copy proprietary chart cells, exact solver matrices or source exam spots;
- do not manufacture exact frequencies where source assumptions are unresolved;
- keep directional claims scoped by size, depth, rake, source range and players behind;
- preserve learner-state schema v2;
- preserve mastery, retention 1/3/7 and field-evidence semantics;
- old completed scope must not be globally reset;
- new practical branches must start as untested evidence, not retroactive mastery;
- machine checks cannot create human content approval.

## Acceptance gates for pilot

1. Source provenance for every new decision family.
2. No exact-chart leakage or unsupported frequency claims.
3. Action/reason distractor parity and prompt anti-leak audit.
4. At least one changed-node transfer pair per admitted family.
5. RU and EN semantic parity.
6. Existing learner state loads unchanged.
7. Existing completed modules remain completed; new practice is represented as new/untested work rather than reset.
8. Scheduler does not silently inflate mastery from extra exposure.
9. Full `npm run test:release` GREEN before merge.
10. Human strategy/drill/RU/EN approvals remain pending unless separately supplied.

## Next bounded action

Implement `BLIND_PRACTICAL_FLUENCY_PILOT_V1` on an isolated repair branch, beginning with state/completion-safe practice representation and source-locked BB/SB decision variants. Do not broaden into SRP OOP or the full preflop tree until the pilot architecture and gates are green.

## Verdict

`P1_PRACTICAL_FLUENCY_DEFECT_CONFIRMED`

`BLIND_PRACTICAL_FLUENCY_PILOT_V1 = HIGHEST_EV_NEXT`

`BROAD_CURRICULUM_REWRITE = NOT_ADMITTED`
