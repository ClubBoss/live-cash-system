# Wave 5 -> Wave 4R Handoff - Learner-Facing Practice Wording

Date: 2026-08-07
Branch: `repair/w5-practice-closure`

## Scope

This file records wording/localisation findings encountered while tracing Wave 5 practice runtime.

Wave 5 does not repair these strings because Wave 4R owns learner-facing language, localisation architecture and final copy truth. No T1 copy, module RU/EN copy, editorial manifest, editorial checker, or LiveCashApp localisation file is changed in this branch.

This handoff is descriptive only. Wave 4R should decide the final approved wording and normal locale contract.

## Findings

### W4R-W5-01 - Raw practice mode enum in session header

Current Core practice header renders:

`session.mode.toUpperCase()`

Examples can surface implementation values such as `PRACTICE`, `REPAIR`, `REVIEW`, or `MIXED` instead of an approved learner-facing localized label.

Ownership recommendation: Wave 4R runtime localisation.

### W4R-W5-02 - Internal response-class marker in feedback

Current decision feedback eyebrow contains:

`DECISION REVIEW - CLASS {responseClass}`

The A/B/C/D response class is an internal learning-state concept unless deliberately admitted as learner language.

Ownership recommendation: Wave 4R decides whether the class should be hidden, translated, or explained.

### W4R-W5-03 - Raw module ID and drill kind before ordinary decisions

Current Core decision eyebrow renders:

`{drill.moduleId.toUpperCase()} - {drill.kind}`

This exposes internal module identifiers such as `GEOMETRY` and raw kinds such as `core`, `changed`, or `boundary`.

Wave 5 currently hides the topic eyebrow only for mixed practice. Ordinary practice remains a language/localisation ownership issue.

Ownership recommendation: Wave 4R runtime localisation.

### W4R-W5-04 - Flashcard surface contains hardcoded implementation labels

Current Cards surface contains hardcoded labels including:

- `ACTIVE RECALL`;
- raw `card.kind`;
- `90 sec`;
- `Due`;
- `All`.

These bypass the normal RU/EN copy contract or expose raw enum/category values.

Ownership recommendation: Wave 4R learner-facing runtime copy.

### W4R-W5-05 - Field-note labels remain hardcoded English

Current Field rendering uses hardcoded:

- `Cue:`;
- `Action:`;
- `Reason:`.

These appear inside the learner-facing field-note list in both locale paths unless replaced elsewhere by a later overlay.

Ownership recommendation: Wave 4R runtime localisation.

### W4R-W5-06 - Original Core lab contains hardcoded labels

The underlying Core lab includes hardcoded learner-facing strings such as:

- `6 - LAB`;
- `Pot`;
- `Stack`;
- `Bet / call`.

The current Wave 5 bridge visually hides that Core lab and renders its own RU/EN prediction-first lab while the gate is active. These strings still matter to the post-W4R integration because the final architecture should have one normal localized lab component rather than relying on a hidden duplicate implementation.

Ownership recommendation: resolve copy when consolidating the normal lab contract after Wave 4R.

### W4R-W5-07 - Wave5PracticeLayer has a private copy dictionary

The temporary practice layer contains its own RU/EN strings for:

- mixed-practice availability title;
- prediction step;
- SPR interaction labels/errors;
- compare interaction labels;
- boundary/finish controls.

The wording is functionally localized today, but the copy lives outside the normal runtime copy authority. During post-W4R integration, move accepted strings into the established locale contract or pass them through the normal localized component interface rather than preserving a second copy authority.

Ownership recommendation: Wave 4R decides copy; post-W4R practice integration removes the duplicate authority.

## Non-actions in Wave 5

Wave 5 deliberately does not:

- rewrite any of the strings above;
- modify runtime localisation files;
- modify T1 or module copy;
- modify the editorial manifest/checker;
- use language cleanup as a reason to refactor Core in parallel.

## Handoff status

`W4R_HANDOFF_RECORDED / NO_PARALLEL_LANGUAGE_MUTATION`
