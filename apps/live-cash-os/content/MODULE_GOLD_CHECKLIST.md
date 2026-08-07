# Live Cash OS — Module Gold Checklist

Status: `WAVE_2_GOVERNANCE_ENFORCED / STRATEGY_REPAIR_REQUIRED / LANGUAGE_REVIEW_REQUIRED`

A runtime module is not gold merely because it exists, renders, or passes automated tests. `MODULE_GOLD` requires every applicable item below and an explicit admission decision. Historical approval is evidence for the reviewed version, not an immutability rule: a confirmed P1 may reopen strategy, drills or language to repair, but old approval becomes inactive until the changed candidate is reviewed again.

## A. Source and claim integrity

- [ ] Every strategic claim has a stable claim ID.
- [ ] Every claim has exact internal source references or is labeled independent inference.
- [ ] Every current claim ID has an explicit review entry in `content/claims/source-gap-dependencies.json`.
- [ ] Source QA status is adequate for the information used.
- [ ] No admitted claim has an unresolved `MATERIAL_BLOCKING` source dependency.
- [ ] Any `NON_BLOCKING_SCOPED` gap has a written rationale narrowing the claim below missing evidence.
- [ ] Stack depth, positions, player count, sizings, rake/straddle sensitivity, and population model are explicit where material.
- [ ] Baseline, heuristic, exploit, simplification, and open question are not conflated.
- [ ] `LOW` / `UNRESOLVED` cannot be `ADMITTED` or `FIELD_VALIDATED`.
- [ ] `OPEN_QUESTION` cannot become learner prescription.
- [ ] Cross-source disagreements are assumption-normalised.
- [ ] Genuine unresolved contradictions block admission.
- [ ] Learner-facing wording is original compression and passes source-purity rules.

Evidence: claim records, source registry references, `source-gap-dependencies.json`, conflict ledger.

## B. Strategic review

- [ ] The recommendation is correct under stated assumptions.
- [ ] The mechanism remains useful for the target 1/3 and 2/5 live-cash environment.
- [ ] 100bb, 150–200bb, and deeper implications are scoped where relevant.
- [ ] Mandatory/live straddle effects are scoped where relevant.
- [ ] Heads-up advice is not silently imported into multiway play.
- [ ] Population reads include sample relevance and compensation behaviour.
- [ ] The module states when its core rule fails.
- [ ] No conditional source idea is presented as a universal law.
- [ ] Any confirmed P1 moves the affected strategy scope from `CURRICULUM_STRATEGY_GOLD` to `CURRICULUM_STRATEGY_REPAIR_REQUIRED` before the locked claim is changed.
- [ ] After repair, the affected scope moves through `CURRICULUM_STRATEGY_REVIEW_PENDING` and returns to gold only after explicit human poker review against the current corpus fingerprint.

Evidence: poker-review notes, repair scope and admission decision.

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
- [ ] A semantic change to assumptions, cue, question, option meaning, correct branch, explanation or misconception mapping reopens the affected drill/content approval.
- [ ] Reopened drill content moves `DRILLS_APPROVED -> DRILLS_REPAIR_REQUIRED -> DRILLS_REVIEW_PENDING -> DRILLS_APPROVED` only through explicit human re-review.

Evidence: drill audit ledger, variant matrix and current corpus fingerprint.

## F. Russian editorial approval

- [ ] Full learner-facing module reviewed in context after the latest locked corpus change and after relevant strategy/drill repair is complete.
- [ ] Copy conforms to `POKER_GLOSSARY_RU_EN.md`.
- [ ] No unexplained mixed architecture/research jargon.
- [ ] Grammar, cases, counters, and CTA are natural.
- [ ] Poker terms are consistent across theory, questions, cards, and labs.
- [ ] Uncertainty and boundaries are preserved.
- [ ] Explicit human reviewer identity and date recorded.
- [ ] `reviewer_kind` is `HUMAN`.
- [ ] Review evidence records the exact current corpus fingerprint.
- [ ] Review evidence records the exact current final learner-facing composition digest.

Status: `RU_APPROVED` only after all items pass. Automated checks, model review and CI cannot create this status.

## G. English editorial approval

- [ ] Full learner-facing module independently reviewed in context after the latest locked corpus change and after relevant strategy/drill repair is complete.
- [ ] English is natural, not literal Russian syntax.
- [ ] No Cyrillic fallback remains on approved surfaces.
- [ ] Strategic meaning, assumptions, correct options, and uncertainty match RU.
- [ ] US spelling and poker vocabulary are consistent.
- [ ] Explicit human reviewer identity and date recorded.
- [ ] `reviewer_kind` is `HUMAN`.
- [ ] Review evidence records the exact current corpus fingerprint.
- [ ] Review evidence records the exact current final learner-facing composition digest.

Status: `EN_APPROVED` only after all items pass. Automated checks, model review and CI cannot create this status.

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
- [ ] Stable ID preservation is not used as proof that semantic meaning is unchanged.
- [ ] RU/EN locale switch does not mutate evidence.
- [ ] Active session survives reload.
- [ ] Existing learner state migrates without global reset.
- [ ] Content edit does not create duplicate evidence.
- [ ] One correct answer still cannot create mastery.

Evidence: unit/integration and E2E tests.

## J. Governance, technical and visual gate

- [ ] `npm run check:governance` passes as the candidate governance gate.
- [ ] `npm run check:editorial` remains a rejection tool and does not write approval truth.
- [ ] `REPAIR_REQUIRED` / `REVIEW_PENDING` candidates may pass candidate governance only when stale source paths are explicitly scoped and active approval evidence for that dimension is invalidated.
- [ ] Unscoped source-lock mutations fail candidate governance.
- [ ] `npm run check:approval` fails while any strategy, drill, locale or final-composition repair/review state remains unresolved.
- [ ] `FULLY_ACCEPTED` is impossible while the upper acceptance ledger contains strategy or language repair truth.
- [ ] Any new corpus fingerprint invalidates stale human approval evidence.
- [ ] `FULLY_ACCEPTED` requires the approved final-composition digest to equal the current digest.
- [ ] Typecheck, lint, editorial, build, unit/integration, and Playwright pass for the candidate.
- [ ] Desktop and mobile module walkthrough pass.
- [ ] No horizontal overflow.
- [ ] Keyboard focus and labels work.
- [ ] No stale fallback or unscoped source lock.
- [ ] Approved copy appears in production after publication.

Evidence: `npm run test:release`, governance regression tests, explicit `npm run check:approval` when seeking full approval, screenshots, production smoke where available.

## Admission decision

```text
Module:
Review date:
Source mapped: PASS / FAIL / BLOCKED
Source-gap dependency review: PASS / FAIL / BLOCKED
Strategy state: GOLD / REPAIR_REQUIRED / REVIEW_PENDING
Strategy human reviewer:
Strategy corpus fingerprint:
Numeric reviewed: PASS / FAIL / N/A
RU approved: PASS / FAIL / REVIEW_REQUIRED
RU human reviewer:
RU corpus fingerprint:
RU final-composition digest:
EN approved: PASS / FAIL / REVIEW_REQUIRED
EN human reviewer:
EN corpus fingerprint:
EN final-composition digest:
Drill state: APPROVED / REPAIR_REQUIRED / REVIEW_PENDING
Drill human reviewer:
Drill corpus fingerprint:
Lab approved: PASS / FAIL / N/A
Cards approved: PASS / FAIL
Identity/state integrity: PASS / FAIL
Technical candidate gate: PASS / FAIL
Full approval gate: PASS / FAIL / NOT_RUN
Known limitations:
Decision: MODULE_GOLD / TRANSITIONAL_REVIEW_REQUIRED / BLOCKED_SOURCE_GAP / REJECTED_OR_SUPERSEDED
Reviewer:
```

No script may fill `Decision: MODULE_GOLD`, strategy/drill/locale approval states, human reviewer fields, approval fingerprints, final approved composition digests, or an equivalent approval state. Automated checks may only validate or reject them. W4R remains the single owner of language-specific learner-copy enforcement while language repair is open.
