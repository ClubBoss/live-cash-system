# Wave 5 Closure Audit - Decision Practice and Learning Asset Quality

Date: 2026-08-07
Branch: `repair/w5-practice-closure`
Green base: `26b1dec72822a706f82cf485042c18e166397bdd`
Base release run: `31175320582`
Base release job: `92855941217`

## Verdict

`PRACTICE_MECHANICS_ACCEPTED / INTEGRATION_DEBT_REMAINS`

This is an independent Wave 5 closure audit against the original Master Wave Plan DoD. It does not re-approve strategic source truth, language quality, T1, routing, or Wave 4R scope.

No learner-facing strategic or bilingual module copy was changed in this branch.

## Scope boundary

Wave 5 checks whether the current practice assets are internally coherent and whether the runtime presents them as robust decision practice. Strategic source correctness remains owned by the relevant curriculum revalidation waves. In particular, LCM-02, LCM-03, and LCM-06 remain bounded by Wave 3 strategic revalidation; this audit does not replace that source review.

## Drill ledger - 55/55

Legend:

- `PASS` - the current practice item has one best response under its stated mechanism, assumptions are sufficient for the question actually asked, distractors map to a concrete misconception, and no illegal action or arithmetic defect was found.
- `N/A` - no arithmetic is required by the item.
- Numeric validation is called out where the item contains an explicit calculation.

| LCM | Drill | One best | Assumptions | Legal/action tree | Numeric | Misconception mapping | Practice role |
|---|---|---|---|---|---|---|---|
| LCM-01 | geo-01 | PASS | PASS | PASS | PASS: 1400/10=140; 1400/5=280 | PASS | core |
| LCM-01 | geo-02 | PASS | PASS | PASS | PASS: pairwise 270 and 900 | PASS | changed |
| LCM-01 | geo-03 | PASS | PASS | PASS | PASS: (158-14)/(42+28)=2.057... -> 2.06 | PASS | core |
| LCM-01 | geo-04 | PASS | PASS | PASS | N/A | PASS | boundary |
| LCM-01 | geo-05 | PASS | PASS | PASS | N/A | PASS | changed |
| LCM-02 | pre-01 | PASS | PASS | PASS | N/A | PASS | core |
| LCM-02 | pre-02 | PASS | PASS | PASS | N/A | PASS | changed |
| LCM-02 | pre-03 | PASS | PASS | PASS | N/A | PASS | boundary |
| LCM-02 | pre-04 | PASS | PASS | PASS | N/A | PASS | changed |
| LCM-02 | pre-05 | PASS | PASS | PASS | N/A | PASS | changed |
| LCM-03 | bli-01 | PASS | PASS | PASS | N/A | PASS | core |
| LCM-03 | bli-02 | PASS | PASS | PASS | N/A | PASS | changed |
| LCM-03 | bli-03 | PASS | PASS | PASS | N/A | PASS | boundary |
| LCM-03 | bli-04 | PASS | PASS | PASS | N/A | PASS | changed |
| LCM-03 | bli-05 | PASS | PASS | PASS | N/A | PASS | boundary |
| LCM-04 | fil-01 | PASS | PASS | PASS | N/A | PASS | core |
| LCM-04 | fil-02 | PASS | PASS | PASS | N/A | PASS | changed |
| LCM-04 | fil-03 | PASS | PASS | PASS | N/A | PASS | changed |
| LCM-04 | fil-04 | PASS | PASS | PASS | N/A | PASS | boundary |
| LCM-04 | fil-05 | PASS | PASS | PASS | N/A | PASS | changed |
| LCM-05 | sha-01 | PASS | PASS | PASS | N/A | PASS | core |
| LCM-05 | sha-02 | PASS | PASS | PASS | N/A | PASS | changed |
| LCM-05 | sha-03 | PASS | PASS | PASS | N/A | PASS | boundary |
| LCM-05 | sha-04 | PASS | PASS | PASS | N/A | PASS | changed |
| LCM-05 | sha-05 | PASS | PASS | PASS | N/A | PASS | boundary |
| LCM-06 | agg-01 | PASS | PASS | PASS | N/A | PASS | core |
| LCM-06 | agg-02 | PASS | PASS | PASS | N/A | PASS | boundary |
| LCM-06 | agg-03 | PASS | PASS | PASS | N/A | PASS | changed |
| LCM-06 | agg-04 | PASS | PASS | PASS | N/A | PASS | changed |
| LCM-06 | agg-05 | PASS | PASS | PASS | N/A | PASS | changed |
| LCM-07 | anc-01 | PASS | PASS | PASS | N/A | PASS | core |
| LCM-07 | anc-02 | PASS | PASS | PASS | N/A | PASS | boundary |
| LCM-07 | anc-03 | PASS | PASS | PASS | N/A | PASS | changed |
| LCM-07 | anc-04 | PASS | PASS | PASS | N/A | PASS | changed |
| LCM-07 | anc-05 | PASS | PASS | PASS | N/A | PASS | boundary/uncertainty |
| LCM-08 | mul-01 | PASS | PASS | PASS | N/A | PASS | core |
| LCM-08 | mul-02 | PASS | PASS | PASS | N/A | PASS | changed |
| LCM-08 | mul-03 | PASS | PASS | PASS | N/A | PASS | changed |
| LCM-08 | mul-04 | PASS | PASS | PASS | N/A | PASS | boundary |
| LCM-08 | mul-05 | PASS | PASS | PASS | N/A | PASS | changed/evidence |
| LCM-09 | riv-01 | PASS | PASS | PASS | N/A | PASS | core |
| LCM-09 | riv-02 | PASS | PASS | PASS | N/A | PASS | boundary |
| LCM-09 | riv-03 | PASS | PASS | PASS | N/A | PASS | changed |
| LCM-09 | riv-04 | PASS | PASS | PASS | N/A | PASS | changed |
| LCM-09 | riv-05 | PASS | PASS | PASS | N/A | PASS | boundary/uncertainty |
| LCM-10 | evi-01 | PASS | PASS | PASS | N/A | PASS | core/uncertainty |
| LCM-10 | evi-02 | PASS | PASS | PASS | N/A | PASS | changed/exploit |
| LCM-10 | evi-03 | PASS | PASS | PASS | N/A | PASS | boundary/insufficient evidence |
| LCM-10 | evi-04 | PASS | PASS | PASS | N/A | PASS | changed/exploit |
| LCM-10 | evi-05 | PASS | PASS | PASS | N/A | PASS | boundary/evidence |
| LCM-11 | tra-01 | PASS | PASS | PASS | N/A | PASS | core/transfer |
| LCM-11 | tra-02 | PASS | PASS | PASS | N/A | PASS | boundary/retention |
| LCM-11 | tra-03 | PASS | PASS | PASS | N/A | PASS | changed/field evidence |
| LCM-11 | tra-04 | PASS | PASS | PASS | N/A | PASS | changed/repair |
| LCM-11 | tra-05 | PASS | PASS | PASS | N/A | PASS | boundary/routing |

### Drill conclusions

- Total drills: `55/55` reviewed.
- Stable shape: exactly five drills per module.
- Every module has changed-node practice.
- Every module has boundary practice.
- Explicit boundary items: `17/55 = 30.9%`, above the `>=20%` DoD threshold even before counting close/uncertainty changed-node items.
- Honest insufficient-information / uncertainty behavior is explicit in at least `anc-05`, `riv-05`, `evi-01`, and `evi-03`.
- The only explicit drill arithmetic is in LCM-01; it recalculates correctly.
- No answer is admitted merely because it occupies a particular source-array index at runtime; option order is shuffled before rendering.

## Option-order and answer-position integrity

The source corpus stores the correct action/reason as `a0/r0`, but the learner does not receive source order. `LiveCashAppCore.tsx` shuffles action and reason options independently with a deterministic seed containing `session.startedAt`, drill ID, and option family.

Result:

- scoring remains ID-based;
- stable IDs are preserved;
- locale switching does not change scoring identity;
- correct answer is not fixed to first position across learner sessions;
- native button DOM order follows the shuffled visual order, so keyboard order matches presentation order.

The previous Wave 5 unit gate verifies unique option IDs/wording and exactly one keyed correct action/reason. The current runtime release gate is green.

## Variant matrix

| Required variable family | Current evidence |
|---|---|
| stack depth | geo-04/05, pre-02/05, anc-03 |
| position | pre-01/02/03/04/05, blinds family, anc-01/02/03, multiway family |
| sizing | geo-03, fil-02, sha-01/02/04, riv-03, evi-04 |
| straddle | geo-01 plus transfer-node straddle variation |
| player type / observed tendency | bli-05, agg-04, anc-04, mul-05, evi-01..05 |
| heads-up vs multiway | geo-02, preflop open+call nodes, multiway family |
| IP vs OOP | pre-01/02/04, bli-03/04, anc-03, multiway action order |
| passive vs aggressive branch | blinds, shape, aggression, ancestry and river families |
| baseline vs exploit | fil-05, anc-04, mul-05, riv-05, evi-02/03/04 |

Changed-node review found material changes in decision-relevant assumptions rather than cosmetic card/name changes. The current automated test additionally rejects a changed/boundary item whose stated context is identical to the module core context.

## Flashcard audit - 33/33

Automated final-locale QA verifies:

- exactly `33` cards, three per module;
- unique stable IDs;
- unique final learner-facing prompts;
- concise fronts and backs;
- supported kinds only: `heuristic`, `boundary`, `procedure`.

Manual asset review found no context-free duplicate slogan and no kind mismatch. LCM-11 cards are learning-loop/field-review utility rather than in-hand tactical cues, but they directly prevent decision-process errors such as false mastery and result-oriented field validation; they remain useful to the trainer's table-transfer loop and are accepted as Wave 5 learning assets.

Card IDs by module:

- LCM-01: `geo-card-unit`, `geo-card-pair`, `geo-card-spr`
- LCM-02: `pre-card-seq`, `pre-card-flat`, `pre-card-polar`
- LCM-03: `bli-card-source`, `bli-card-close`, `bli-card-sb`
- LCM-04: `fil-card-source`, `fil-card-call`, `fil-card-blocker`
- LCM-05: `sha-card-shape`, `sha-card-raise`, `sha-card-robust`
- LCM-06: `agg-card-value`, `agg-card-job`, `agg-card-scary`
- LCM-07: `anc-card-before`, `anc-card-target`, `anc-card-model`
- LCM-08: `mul-card-sand`, `mul-card-mdf`, `mul-card-own`
- LCM-09: `riv-card-order`, `riv-card-bad`, `riv-card-unknown`
- LCM-10: `evi-card-one`, `evi-card-store`, `evi-card-base`
- LCM-11: `tra-card-levels`, `tra-card-delay`, `tra-card-field`

## Mixed-practice audit

Current behavior satisfies the mechanics requirement:

- the Wave 5 layer disables mixed practice until `>=3` completed topics;
- pre-decision topic identity is concealed by the Wave 5 layer;
- the pool comes from up to the last five completed modules;
- one drill is selected per eligible module using `state.revision`, so repeated sessions are not a permanently fixed first set;
- scoring still uses stable drill IDs.

Architecture caveat: the `>=3` gate and topic concealment are currently post-render DOM adaptations rather than native Core state/props. That is why the final verdict retains integration debt.

## Lab audit - 11/11

Current corpus contains one SPR lab and ten compare labs. `Wave5PracticeLayer` applies the same prediction-first gate to every module lab.

| Requirement | Result |
|---|---|
| prediction before interaction | PASS - minimum non-empty reasoning gate before interaction |
| material variable | PASS - SPR requires a changed numeric input; compare requires both sides |
| invalid input | PASS where applicable - SPR rejects non-finite/negative state and bet/call greater than remaining stack |
| explanation after interaction | PASS - module lab description / side explanation remains available |
| boundary | PASS - module counterexample is shown before conclusion can be locked |
| desktop | PASS in Playwright Chromium |
| mobile | PASS in Playwright Pixel 5 project |
| keyboard semantics | PASS at control level - native textarea/input/button controls; final Wave 8 remains owner of exhaustive keyboard/accessibility closure |

Numeric lab check:

`SPR = (remaining stack - call) / (pot + 2 * call)`

For the retained example: `(158 - 14) / (42 + 28) = 144 / 70 = 2.057...`, displayed as `2.06`.

## Browser evidence

Latest GREEN `origin/main` before branch creation:

- SHA: `26b1dec72822a706f82cf485042c18e166397bdd`
- Actions run: `31175320582`
- validation job: `92855941217`
- canonical command: `npm run test:release`
- TypeScript: PASS
- ESLint: PASS
- editorial gate: PASS
- production build: PASS
- unit/integration: `62/62 PASS`
- Playwright: `25 passed / 1 intentionally skipped`

Wave 5 browser cases passed in both configured projects:

- Desktop Chrome: mixed >=3 unlock + topic concealment PASS; prediction-first/invalid-input/material-change/boundary lab PASS.
- Pixel 5: same two Wave 5 cases PASS.

The branch itself changes evidence reports only. No learner runtime, content, test, workflow, state schema, or stable ID is changed by this closure commit.

## W4R handoff boundary

Learner-facing hardcoded/raw labels found while tracing practice runtime are recorded separately in `WAVE_5_W4R_HANDOFF_2026-08-07.md`. They are not repaired here.

## Integration decision

A Core refactor is deliberately not performed in parallel with Wave 4R. The exact post-W4R migration plan is recorded in `WAVE_5_INTEGRATION_DEBT_2026-08-07.md`.

## Final acceptance statement

Practice semantics are strong enough to accept the Wave 5 mechanics on the current green baseline. The temporary host-integration approach is not acceptable as final architecture because it depends on DOM observation/mutation, direct localStorage reads, hidden duplicate Core lab UI, and a programmatic click bridge.

Final verdict:

`PRACTICE_MECHANICS_ACCEPTED / INTEGRATION_DEBT_REMAINS`
