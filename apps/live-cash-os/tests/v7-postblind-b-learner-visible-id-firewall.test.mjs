import assert from "node:assert/strict";
import test from "node:test";
import {
  practicalAnchors,
  practicalDecisions,
  practicalReferenceBaselines,
} from "../content/practical-mastery/index.ts";
import { practicalSourceGaps } from "../content/practical-mastery/source-gaps.ts";
import {
  learnerPresentationLeakClasses,
  sanitizeLearnerPresentationText,
} from "../lib/learner-presentation-firewall.ts";

const hasBareEvidenceId = (value) => /\bE\d{2,}\b/u.test(value);
const bareEvidenceMatches = (value) => [...value.matchAll(/\bE\d{2,}\b/gu)].map((match) => match[0]);

const EXPECTED_BEFORE = {
  // PF-01 removed five final-composed inline E02 learner-prose occurrences,
  // PF-02 removed seven final-composed inline E03 occurrences, PF-03 removed
  // six learner strings exposing E04, PF-04 removed six further learner strings /
  // seven occurrences exposing E05, PF-05 removes six learner strings / six
  // occurrences exposing E06, and PF-06 removes one learner string / occurrence
  // exposing E15. PF-07 and PF-08 preserve the truthful raw census. PF-09/PF-10
  // remove two final-composed RU learner strings / two occurrences. Blind Defense
  // removes ten further final-composed RU learner strings / eleven occurrences
  // while keeping raw authority source identities intact; the learner presentation
  // firewall must still remove every residual identifier before presentation.
  ru: { learnerStrings: 8821, leakingStrings: 149, occurrences: 159 },
  // FND-V2-03: PM-W4-REL-01-107 no longer cites "E08" inline in its EN explanation
  // / reason text (2 strings, 2 occurrences), so both counts dropped by 2.
  en: { learnerStrings: 8821, leakingStrings: 485, occurrences: 529 },
};

function canonicalLearnerStrings(locale) {
  const ru = locale === "ru";
  const values = [];
  for (const anchor of practicalAnchors) {
    values.push(
      ru ? anchor.promptRu : anchor.promptEn,
      ru ? anchor.answerRu : anchor.answerEn,
      ru ? anchor.rationaleRu : anchor.rationaleEn,
    );
  }
  for (const decision of practicalDecisions) {
    values.push(
      ru ? decision.cueRu : decision.cueEn,
      ru ? decision.questionRu : decision.questionEn,
      ru ? decision.explanationRu : decision.explanationEn,
      ...decision.assumptions,
      ...decision.actionOptions.map((option) => ru ? option.textRu : option.textEn),
      ...decision.reasonOptions.map((option) => ru ? option.textRu : option.textEn),
    );
  }
  for (const reference of practicalReferenceBaselines) {
    values.push(
      ru ? reference.titleRu : reference.titleEn,
      ru ? reference.triggerRu : reference.triggerEn,
      ru ? reference.baselineRu : reference.baselineEn,
      ru ? reference.deltaRu : reference.deltaEn,
      ru ? reference.boundaryRu : reference.boundaryEn,
    );
  }
  for (const gap of practicalSourceGaps) {
    values.push(
      ru ? gap.learnerReasonRu : gap.learnerReason,
      ru ? gap.learnerNextEvidenceNeededRu : gap.learnerNextEvidenceNeeded,
    );
  }
  return values.filter((value) => typeof value === "string" && value.trim());
}

for (const locale of ["ru", "en"]) {
  test(`${locale}: bare evidence-ID namespace is class-wide and causal prose survives sanitization`, () => {
    const sample = locale === "ru"
      ? "E99: более широкий диапазон продолжения оставляет блефу меньше фолд-эквити на ривере."
      : "E99: a wider continuing range leaves the bluff with less fold equity on the river.";
    const causalClause = locale === "ru"
      ? /более широкий диапазон продолжения оставляет блефу меньше фолд-эквити на ривере/i
      : /a wider continuing range leaves the bluff with less fold equity on the river/i;

    assert.deepEqual(learnerPresentationLeakClasses(sample), ["SOURCE_OR_MODULE_ID"]);
    const sanitized = sanitizeLearnerPresentationText(sample, locale);
    assert.doesNotMatch(sanitized, /\bE\d{2,}\b/u);
    assert.match(sanitized, causalClause);
    assert.match(sanitized, locale === "ru" ? /проверенные данные/i : /reviewed evidence/i);
  });
}

test("bare evidence-ID namespace does not consume poker-native terms or one-digit E notation", () => {
  const safe = "EV, SPR, 3-bet, 4BP, BTN vs BB, E1 and E99x remain meaningful text.";
  assert.equal(learnerPresentationLeakClasses(safe).includes("SOURCE_OR_MODULE_ID"), false);
  assert.equal(sanitizeLearnerPresentationText(safe, "en"), safe);
});

for (const locale of ["ru", "en"]) {
  test(`${locale}: raw internal evidence IDs remain intact while normal learner residual is zero`, () => {
    const values = canonicalLearnerStrings(locale);
    const leaking = values.filter(hasBareEvidenceId);
    const matches = leaking.flatMap(bareEvidenceMatches);
    const counts = Object.fromEntries([...new Set(matches)].sort().map((id) => [id, matches.filter((match) => match === id).length]));
    const expected = EXPECTED_BEFORE[locale];

    console.log(`V7_POSTBLIND_B_BEFORE locale=${locale} learner_strings=${values.length} before_leaking_strings=${leaking.length} before_occurrences=${matches.length} before_ids=${JSON.stringify(counts)}`);
    assert.equal(values.length, expected.learnerStrings);
    assert.equal(leaking.length, expected.leakingStrings);
    assert.equal(matches.length, expected.occurrences);
    assert.ok(matches.includes("E07"));
    assert.ok(matches.includes("E20"));
    assert.ok(matches.includes("E21"));

    const learnerPublished = values.map((value) => sanitizeLearnerPresentationText(value, locale));
    const residual = learnerPublished.filter(hasBareEvidenceId);
    const residualMatches = residual.flatMap(bareEvidenceMatches);

    console.log(`V7_POSTBLIND_B_AFTER locale=${locale} learner_strings=${values.length} before_leaking_strings=${leaking.length} before_occurrences=${matches.length} before_ids=${JSON.stringify(counts)} residual_strings=${residual.length} residual_occurrences=${residualMatches.length}`);
    assert.equal(residual.length, 0);
    assert.equal(residualMatches.length, 0);

    const rawAgain = canonicalLearnerStrings(locale).flatMap(bareEvidenceMatches);
    assert.deepEqual(rawAgain, values.flatMap(bareEvidenceMatches), "sanitization must not mutate canonical internal authority");
  });
}