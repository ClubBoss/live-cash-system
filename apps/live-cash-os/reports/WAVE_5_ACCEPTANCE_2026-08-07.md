# Wave 5 Acceptance — Decision Practice and Learning Asset Quality

**Date:** 2026-08-07  
**Accepted implementation SHA:** `e54ae03627398eff09c10b87971c15d5858b3ceb`  
**GitHub Actions run:** `31171850884`  
**Validation job:** `92845201804`

## Verdict

`WAVE_5_ACCEPTED / WAVE_4_LANGUAGE_TRUTH_REOPENED`

Wave 5 is accepted for decision-practice mechanics, final learner-facing drill/card corpus integrity and desktop/mobile browser behavior. This acceptance does not override the independent language audit that reopens Wave 4 editorial/localization truth as Wave 4R.

## Closed practice defects

- Mixed practice now requires at least three completed topics before it unlocks.
- Mixed practice no longer exposes the module/topic eyebrow before the learner decides.
- Existing deterministic action/reason option shuffling was verified and retained; no unnecessary rebuild was added.
- Existing mixed-pool selection was verified to draw from up to the last five completed modules with revision-dependent drill selection rather than a fixed first block.
- Labs now require an explicit prediction before interaction/reveal.
- SPR lab requires a material input change, rejects invalid numeric states and keeps continuation disabled until the state is valid.
- Compare labs require inspecting both sides before continuation.
- Lab boundary/counterexample remains visible before the learner locks the conclusion.
- One real duplicate flashcard prompt was found and repaired while preserving card ID and answer/history semantics.

## Corpus QA

Wave 5 audits the **final learner-facing RU and EN corpus after all accepted locale overlays**, not stale base `modules.ts` text.

Verified in both locales:

- 11 modules;
- 55 drills, exactly five per module;
- every module contains changed-node and boundary practice;
- every drill contains explicit assumptions, cue, question and explanation;
- exactly three action options and three reason options per drill;
- unique action/reason IDs and unique option wording;
- exactly one correct action and one correct reason;
- changed/boundary variants materially change stated context/assumptions rather than repeating the core prompt;
- boundary practice is at least 20% of the corpus;
- honest uncertainty / insufficient-information reasoning is represented;
- 33 flashcards, exactly three per module;
- stable unique card IDs;
- unique learner-facing card prompts;
- concise card fronts/backs and supported card kinds.

## Browser proof

Final release run:

- TypeScript: `PASS`
- ESLint: `PASS`
- editorial/source-lock gate: `PASS`
- production build: `PASS`
- unit/integration: `58/58 PASS`
- Playwright: `25 passed / 1 intentionally skipped`

New Wave 5 browser cases passed on both desktop Chromium and mobile fixture:

- three-topic mixed-practice unlock;
- topic concealment before the decision;
- prediction-first lab flow;
- invalid SPR-input feedback;
- disabled continuation on invalid/unmodified state;
- valid material change;
- boundary visibility;
- continuation into changed-node lesson stage.

No failure-evidence artifact was required on the accepted run.

## Important findings resolved during the wave

### False corpus boundary

An early QA version scanned raw `modules.ts` and produced false findings against text already replaced by gold locale overlays. The gate was corrected to audit the actual final learner-facing locale pipeline.

### Real card duplication

After the gate was corrected, EN still contained one genuine duplicate front:

`What comes before a blocker?`

LCM-04 now asks:

`What should be rebuilt before judging a blocker on a new street?`

LCM-07 retains the ancestry question. Stable card IDs and backs remain unchanged.

### Hidden lab validation

The validation logic correctly rejected `bet > remaining stack`, but a generic gold-surface CSS rule hid the alert because it reused `.assumption-strip`. Wave 5 restores the message visibly; Wave 4R must consolidate this temporary override into the normal React/locale contract.

## Deliberately not claimed

Wave 5 does **not** claim:

- real learner transfer or retention effectiveness;
- validated scheduling thresholds;
- final accessibility/cross-browser closure;
- final language/editorial quality;
- production deployment of the accepted Wave 5 SHA.

The independent language audit found P1 locale/editorial truth defects. Therefore the next work block is Wave 4R, not Wave 6.
