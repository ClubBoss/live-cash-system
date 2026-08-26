import assert from "node:assert/strict";
import test from "node:test";
import {
  practicalAnchors,
  practicalDecisions,
  practicalReferenceBaselines,
} from "../content/practical-mastery/index.ts";
import { practicalSourceGaps } from "../content/practical-mastery/source-gaps.ts";

const hasBareEvidenceId = (value) => /\bE\d{2,}\b/u.test(value);
const bareEvidenceMatches = (value) => [...value.matchAll(/\bE\d{2,}\b/gu)].map((match) => match[0]);

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
  test(`${locale}: BEFORE census for bare evidence-ID namespace on canonical learner strings`, () => {
    const values = canonicalLearnerStrings(locale);
    const leaking = values.filter(hasBareEvidenceId);
    const matches = leaking.flatMap(bareEvidenceMatches);
    const counts = Object.fromEntries([...new Set(matches)].sort().map((id) => [id, matches.filter((match) => match === id).length]));

    console.log(`V7_POSTBLIND_B_BEFORE locale=${locale} learner_strings=${values.length} leaking_strings=${leaking.length} occurrences=${matches.length} ids=${JSON.stringify(counts)}`);
    assert.ok(leaking.length > 0, "baseline must reproduce learner-visible bare evidence-ID leakage");
  });
}
