# Live Cash OS — Pre-Learning Human Review Packet

**Date:** 2026-08-08  
**Locked implementation base:** `88fc77ca303ac023cd843791e7294f56ba54bf27`  
**Exact-base CI:** run `31221747649` — `SUCCESS`  
**Canonical curriculum RU/EN composition digest:** `7b44741c3032d0c3f084f60aab5513a40445e32394c36954496ba83e53127b0a`  
**Current locked review-corpus fingerprint:** `c623a7669ed85e47e411b8b268dee682b2254b934a165330f74647b29dfa9b81`

## Purpose and non-approval boundary

This packet is the final focused human review input before real learning starts. It is intentionally small: verify repaired poker strategy/drills and verify the final RU/EN learner-facing language, including the W6–W9 surfaces that did not exist when the earlier curriculum composition was reviewed.

This document is **not** approval evidence. The source-assisted/model-assisted checks recorded below are rejection/pre-review work only. They cannot set `CURRICULUM_STRATEGY_GOLD`, `DRILLS_APPROVED`, locale `APPROVED`, or `FULLY_ACCEPTED`.

A valid approval must come from an actual human reviewer, name the exact locked corpus, include a review date, and record either `PASS` or exact repair items.

## 1. Locked review corpus

The editorial manifest now source-locks the current repaired W3 files rather than their pre-repair blobs, and also locks the principal W7–W9 learner-facing files.

Newly current/added review locks include:

- `content/claims/lcm-02.claims.json` — `675a2f46174e0f89b53492a6fb14a78f1ff77c05`
- `content/claims/lcm-03.claims.json` — `f844ab1a22cf338e5a10667b4f8e04b111cc105f`
- `content/claims/lcm-06.claims.json` — `d9cbbf324ba62f6a6ac212335e694f45f70c7fba`
- `content/i18n/wave3-priority-gold.ts` — `5c22681a219ba3a35fa2dee8f6afc280a033e934`
- `components/LiveCashAppCore.tsx` — `cf7e46f50fad27df946071ccb5ac0c496a19bbe4`
- `components/Wave7Experience.tsx` — `49c098d0d1ce16f896a107225f8fb524fa1222e1`
- `components/Wave8AccessibilityLayer.tsx` — `157baa03d0824dfbabd8efad2f1119bce47e74d2`
- `components/DataSafetyPanel.tsx` — `a984637b34547027b805f542c560e9d1d6f16ce3`

The review-corpus fingerprint is the existing governance `corpusFingerprint(source_blobs)` over the full manifest lock inventory. Any later mutation changes the fingerprint and invalidates review evidence bound to this packet.

The curriculum composition digest remains separately recorded because it represents the canonical rendered RU/EN curriculum composition. W6–W9 shell/field/recovery surfaces are additionally bound through the expanded source-lock fingerprint and exact implementation SHA.

## 2. Human poker review — repaired claims

### `LCM-02-CL-004` — depth changes preflop branch structure

**Current bounded claim:** deeper stacks increase the value of position, suited playability and protected flats; shorter stacks shift directionally toward more direct linear aggression/earlier commitment. No exact transition threshold is claimed.

**Direct source support:** Smash Live Cash preflop squeezing/adjustments explicitly compare 100bb, 200bb and 400bb structures, deeper protected flats/playability and shallower 3-bet/get-in behavior. Exact ranges, frequencies and chart boundaries remain visual-dependent.

**Human check:** confirm the current claim remains directional and does not smuggle in a fixed depth boundary or universal chart prescription.

### `LCM-03-CL-003` — SB and BB source ranges change postflop strategy

**Current bounded claim:** the same flop can require materially different c-bet plans versus SB and BB because the calling ranges are formed under different price/action-order constraints. The direct reviewed source example is HJ versus SB/BB at 200bb; other depths are mechanism-level generalization only.

**Direct source support:** Smash Live Cash explicitly contrasts the same boards versus BB and SB and warns against copying a versus-BB c-bet default to SB. Exact suits/ranges/frequencies remain visual-dependent.

**Human check:** confirm the copy does not imply that every SB range is always tighter than every BB range after population reads are incorporated.

### `LCM-06-CL-001` — over-wide 3-bet ranges require postflop compensation

**Current bounded claim:** when a player adds weak material to the preflop 3-bet range, that range normally needs more postflop checking; preserving the c-bet architecture of a stronger range can create an over-bluffed branch. No exact stack depth is source-locked in the claim.

**Direct source support:** Smash Live Cash Part 2/3 explicitly describes the double error of 3-betting too wide and then maintaining normal aggressive c-bet frequency. Exact board, sizing, frequencies, EV and stack depth remain visual-dependent.

**Human check:** confirm this remains an opponent/range-shape mechanism rather than a blanket instruction to over-defend against every aggressive 3-bettor.

## 3. Human poker review — all 15 W3 drills

Review the answer identity, assumptions, reason identity and explanation for each stable drill ID. Stable IDs and correct-answer identities must not be changed without an explicit strategy repair.

- Preflop: `pre-01`, `pre-02`, `pre-03`, `pre-04`, `pre-05`
- Blinds: `bli-01`, `bli-02`, `bli-03`, `bli-04`, `bli-05`
- Aggression: `agg-01`, `agg-02`, `agg-03`, `agg-04`, `agg-05`

### Spotlight items

**`pre-05`** — must stay a directional shorter-vs-deeper shift, not recreate the removed approximately-60bb versus 200bb threshold.

**`agg-01`** — must derive wider defence from the conjunction of an over-wide preflop range and insufficient postflop compensation, not from aggression alone.

**`agg-02`** — frequent small betting is only a reasonable candidate on boards/range structures retaining premium advantage; it is not an exact solver frequency.

**`agg-04`** — flop range/high-frequency betting does not automatically license a turn range-bet after the defender has filtered through a call.

**`agg-05`** — Carrot Grade 3 supports a top-end-value gate for OOP raising/jamming; equity denial strengthens a valid candidate but does not independently justify jamming the middle of the range.

## 4. Model-assisted/source-assisted pre-review result

Pre-review was run against the current repaired claims/drills and the cited source records before asking for human sign-off.

Current result:

`NO_NEW_P0_P1_STRATEGY_DEFECT_FOUND / NOT_HUMAN_APPROVAL`

Specifically:

- the previously unsupported depth precision is absent from `pre-05` and the repaired LCM-02 claim;
- the SB/BB example is correctly bounded to the reviewed 200bb source where direct depth evidence is asserted;
- the over-wide 3-bet compensation claim no longer asserts an unsupported exact stack depth;
- `agg-05` matches the source ordering: top-end value gate first, denial second;
- no new correct-answer identity conflict was found across the 15 W3 drills;
- no random chart-cell prescription was introduced.

Known source boundaries remain active. Visual-dependent exact combo weights, exact solver frequencies, exact boards/suits where not spoken, and exact stack/sizing details are not admitted merely because the mechanism is supported.

## 5. Final RU/EN human language review scope

Review the final rendered/canonical language rather than isolated historical source layers.

### Curriculum and navigation

- T1 purpose, optionality and result language;
- 0→100 learning route;
- all LCM-01…LCM-11 module titles/goals/theory/heuristics/trees/examples/boundaries;
- all drill assumptions/questions/actions/reasons/explanations;
- labs, table cards, glossary and flashcards;
- Review/Cards/Map status labels and empty states;
- Wave 5 prediction-first/mixed-practice copy.

### W6 learner-facing additions

In `LiveCashAppCore.tsx`:

- Today 5/15/30 minute choices;
- pre-session/post-session language;
- `why now` reasons for resume, delayed recall, repair, priority, weakness, stale skill, changed node, boundary, mixed practice and new material;
- return-after-break/resume language;
- learner-facing recovery notices.

Particular truth boundary: reviewed T1 priority wording must continue to say that routing priority does **not** grant learning credit.

### W7 learner-facing additions

In `Wave7Experience.tsx`:

- explain-back history/review;
- real-hand capture labels;
- decision-before-result wording;
- separate result/showdown step;
- field-review outcome labels;
- progress/evidence explanation;
- confidence/calibration wording.

Truth boundary: a reviewed hand is evidence input, not automatic mastery or field validation.

### W8/W9 learner-facing additions

In `Wave8AccessibilityLayer.tsx` and `DataSafetyPanel.tsx`:

- accessible labels for session progress/learner inputs;
- local/cloud/sync wording;
- conflict and recovery explanations;
- import/export/delete/reset confirmations;
- privacy explanation for T1, explain-back and real-hand prose;
- safe diagnostics language.

Two small Russian-language items deserve explicit human judgment but are not classified as strategy blockers by pre-review:

- `recovery-копия` in recovery copy may be more natural as `резервная копия для восстановления`;
- `explain-back` inside the technical diagnostics explanation may be more natural as `объяснения своими словами`.

Do not change these merely to remove English poker/technical vocabulary if a human reviewer judges the current phrasing clearer in context.

## 6. Human reviewer acceptance criteria

### Poker/strategy reviewer

Record `PASS` only if all are true:

1. repaired claims are strategically sound for the stated live-cash scope;
2. assumptions/exceptions are sufficient to stop the heuristic becoming universal advice;
3. none of the 15 drills has a wrong or materially ambiguous one-best answer;
4. no unsupported exact depth/frequency/size/combination has re-entered the learner copy;
5. no source-dependent uncertainty is presented as settled fact.

Otherwise record `REPAIR_REQUIRED` with exact claim/drill ID and replacement or correction rationale.

### Russian reviewer

Record `PASS` only if the complete scoped RU learner-facing copy is natural, poker-native, understandable without internal architecture vocabulary and semantically faithful to the strategy.

### English reviewer

Record `PASS` only if the complete scoped EN learner-facing copy is natural poker English, contains no Russian fallback and remains semantically equivalent to the approved strategy boundaries.

Independent reviewer identities are required by governance for formal approval. One person may perform more than one role only if that is an explicit owner decision and is recorded rather than implied.

## 7. Evidence record template

Use this structure in the follow-up evidence commit or review report. Do not prefill `PASS`.

```text
review_base_sha: 88fc77ca303ac023cd843791e7294f56ba54bf27
review_corpus_fingerprint: c623a7669ed85e47e411b8b268dee682b2254b934a165330f74647b29dfa9b81
curriculum_composition_digest: 7b44741c3032d0c3f084f60aab5513a40445e32394c36954496ba83e53127b0a

poker_review:
  reviewer_kind: HUMAN
  reviewer: <name>
  reviewed_at: <YYYY-MM-DD>
  verdict: <PASS | REPAIR_REQUIRED>
  exact_issues: <none or IDs + notes>

ru_review:
  reviewer_kind: HUMAN
  reviewer: <name>
  reviewed_at: <YYYY-MM-DD>
  verdict: <PASS | REPAIR_REQUIRED>
  exact_issues: <none or paths/strings + notes>

en_review:
  reviewer_kind: HUMAN
  reviewer: <name>
  reviewed_at: <YYYY-MM-DD>
  verdict: <PASS | REPAIR_REQUIRED>
  exact_issues: <none or paths/strings + notes>
```

## 8. After genuine PASS evidence

Only after genuine human evidence exists:

1. apply any required content/language fixes and re-lock the resulting blobs;
2. if no fixes are required, record the human evidence against this exact fingerprint;
3. advance strategy/drill/locale governance states only where the evidence actually supports it;
4. run the full exact-head release gate;
5. perform final production candidate smoke/identity check;
6. declare `W1_W9_PRE_LEARNING_READY` only if no new P0/P1 is found.

W1/W7 empirical usability thresholds remain real-use/W10 evidence and are not to be invented inside this review.

## Verdict of this preparation step

`HUMAN_REVIEW_CORPUS_LOCKED / MODEL_PRE_REVIEW_NO_NEW_P0_P1 / HUMAN_APPROVAL_PENDING`
