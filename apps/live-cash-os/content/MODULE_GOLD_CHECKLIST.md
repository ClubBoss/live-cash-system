# Live Cash OS — Module Gold Checklist

Status: `WAVE_2_GOVERNANCE_ACTIVE`

A runtime module is not gold merely because it exists, renders, or passes automated tests. `MODULE_GOLD` requires every applicable item below and an explicit admission decision.

## A. Source and claim integrity

- [ ] Every strategic claim has a stable claim ID.
- [ ] Every claim has exact internal source references or is labeled independent inference.
- [ ] Source QA status is adequate for the information used.
- [ ] No claim depends on a known missing lecture, visual, chart, or transcript segment.
- [ ] Stack depth, positions, player count, sizings, rake/straddle sensitivity, and population model are explicit where material.
- [ ] Baseline, heuristic, exploit, simplification, and open question are not conflated.
- [ ] Cross-source disagreements are assumption-normalised.
- [ ] Genuine unresolved contradictions block admission.
- [ ] Learner-facing wording is original compression and passes source-purity rules.

Evidence: claim records, source registry references, conflict ledger.

## B. Strategic review

- [ ] The recommendation is correct under stated assumptions.
- [ ] The mechanism remains useful for the target 1/3 and 2/5 live-cash environment.
- [ ] 100bb, 150–200bb, and deeper implications are scoped where relevant.
- [ ] Mandatory/live straddle effects are scoped where relevant.
- [ ] Heads-up advice is not silently imported into multiway play.
- [ ] Population reads include sample relevance and compensation behaviour.
- [ ] The module states when its core rule fails.
- [ ] No conditional source idea is presented as a universal law.

Evidence: poker-review notes and admission decision.

## C. Numerical and action-tree review

- [ ] Stack amounts and effective stacks are correct.
- [ ] Pot sizes and remaining stacks are independently recalculated.
- [ ] SPR calculations use the correct street and denominator.
- [ ] Action order and positions are legal.
- [ ] Bet, raise, call, and all-in sizes are internally consistent.
- [ ] Players left to act are represented.
- [ ] No hidden rake or game-structure dependency changes the best answer.

Evidence: numerical audit sheet.

## D. Learning sequence

- [ ] Cold decision captures the learner’s current model without hints.
- [ ] Plain explanation teaches one coherent mechanism.
- [ ] Three cues are observable and executable.
- [ ] Decision tree is short enough to use at the table.
- [ ] Worked example demonstrates the mechanism rather than decorating it.
- [ ] Lab or contrast materially changes understanding.
- [ ] Changed-node tasks alter important variables.
- [ ] Explain-back asks for mechanism, not copied wording.
- [ ] Table card is concise and table-usable.
- [ ] Delayed review tests retrieval after a real pause.

Evidence: module walkthrough and learning-design review.

## E. Drills and misconceptions

- [ ] Every question has one best answer under stated assumptions.
- [ ] Action options are legal and plausible.
- [ ] Reason options represent plausible reasoning errors.
- [ ] Correct option is not signalled by length, tone, or position.
- [ ] Misconception ID matches the actual reasoning error.
- [ ] Repair uses a new decision rather than repeating the original.
- [ ] At least three changed-node variants exist for core mechanisms.
- [ ] At least two real boundary cases exist.
- [ ] Honest uncertainty is included where strategically appropriate.
- [ ] Explanations teach why and what would change the answer.

Evidence: drill audit ledger and variant matrix.

## F. Russian editorial approval

- [ ] Full learner-facing module reviewed in context.
- [ ] Copy conforms to `POKER_GLOSSARY_RU_EN.md`.
- [ ] No unexplained mixed architecture jargon.
- [ ] Grammar, cases, counters, and CTA are natural.
- [ ] Poker terms are consistent across theory, questions, cards, and labs.
- [ ] Uncertainty and boundaries are preserved.
- [ ] Explicit reviewer and date recorded.

Status: `RU_APPROVED` only after all items pass.

## G. English editorial approval

- [ ] Full learner-facing module independently reviewed in context.
- [ ] English is natural, not literal Russian syntax.
- [ ] No Cyrillic fallback remains on approved surfaces.
- [ ] Strategic meaning, assumptions, correct options, and uncertainty match RU.
- [ ] US spelling and poker vocabulary are consistent.
- [ ] Explicit reviewer and date recorded.

Status: `EN_APPROVED` only after all items pass.

## H. Labs and cards

- [ ] Lab requests a prediction before reveal or manipulation.
- [ ] Lab controls a material variable.
- [ ] Lab explains the result and boundary.
- [ ] Invalid input, keyboard, and mobile behavior are safe.
- [ ] Cards are concise and answerable in under 20 seconds.
- [ ] Cards do not teach a slogan without context.
- [ ] Cards connect to a mechanism, boundary, or known misconception.
- [ ] Duplicate cards are removed.

Statuses: `LAB_APPROVED`, `CARDS_APPROVED`.

## I. Identity and state integrity

- [ ] Stable module, drill, option, card, claim, and misconception IDs preserved.
- [ ] RU/EN locale switch does not mutate evidence.
- [ ] Active session survives reload.
- [ ] Existing learner state migrates without global reset.
- [ ] Content edit does not create duplicate evidence.
- [ ] One correct answer still cannot create mastery.

Evidence: unit/integration and E2E tests.

## J. Technical and visual gate

- [ ] Typecheck, lint, editorial, build, unit/integration, and Playwright pass.
- [ ] Desktop and mobile module walkthrough pass.
- [ ] No horizontal overflow.
- [ ] Keyboard focus and labels work.
- [ ] No stale fallback or source lock.
- [ ] Approved copy appears in production after publication.

Evidence: `npm run test:release`, screenshots, production smoke where available.

## Admission decision

```text
Module:
Review date:
Source mapped: PASS / FAIL / BLOCKED
Strategy reviewed: PASS / FAIL / BLOCKED
Numeric reviewed: PASS / FAIL / N/A
RU approved: PASS / FAIL
EN approved: PASS / FAIL
Drills approved: PASS / FAIL
Lab approved: PASS / FAIL / N/A
Cards approved: PASS / FAIL
Identity/state integrity: PASS / FAIL
Technical gate: PASS / FAIL
Known limitations:
Decision: MODULE_GOLD / BLOCKED_SOURCE_GAP / REJECTED_OR_SUPERSEDED
Reviewer:
```

No script may fill `Decision: MODULE_GOLD` without an explicit poker-aware and bilingual review record.
