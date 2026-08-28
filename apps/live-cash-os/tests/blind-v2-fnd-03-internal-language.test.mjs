import assert from "node:assert/strict";
import test from "node:test";
import { practicalDecisionById, practicalDecisions, isOrdinaryLearnerDecision } from "../content/practical-mastery";
import { sanitizeLearnerPresentationText } from "../lib/learner-presentation-firewall";

// FND-V2-03: the W4-HAND-01 "exact combo -> hand family" set taught its concept
// in curriculum-design vocabulary ("the integrity closure", "the transfer
// layer", "the new curriculum ... reusable family bridge"). Learners cannot
// parse that machinery. The explanations and the correct reason text now state
// the poker mechanism directly, in both locales.

const REWRITTEN = ["PM-W4-HAND-01-101", "PM-W4-HAND-01-102", "PM-W4-HAND-01-103", "PM-W4-HAND-01-104", "PM-W4-HAND-01-105"];
const INTERNAL_JARGON = [
  /integrity closure/i,
  /transfer layer/i,
  /the new curriculum/i,
  /reusable family bridge/i,
  /concrete-hand transfer/i,
  /Целостность закрытие/i,
  /Слой перенос/i,
  /учебная программа/i,
];

function learnerText(decision, locale) {
  const pick = (ru, en) => sanitizeLearnerPresentationText(locale === "ru" ? ru : en, locale);
  return [
    pick(decision.cueRu, decision.cueEn),
    pick(decision.questionRu, decision.questionEn),
    pick(decision.explanationRu, decision.explanationEn),
    ...decision.actionOptions.map((option) => pick(option.textRu, option.textEn)),
    ...decision.reasonOptions.map((option) => pick(option.textRu, option.textEn)),
  ].join("\n");
}

test("FND-V2-03 the rewritten W4-HAND-01 set carries no curriculum/evaluation vocabulary", () => {
  for (const id of REWRITTEN) {
    const decision = practicalDecisionById.get(id);
    assert.ok(decision, `missing ${id}`);
    assert.equal(decision.learnerEligibility ?? "ORDINARY", "ORDINARY");
    for (const locale of ["ru", "en"]) {
      const text = learnerText(decision, locale);
      for (const pattern of INTERNAL_JARGON) assert.doesNotMatch(text, pattern, `${id} ${locale} still leaks ${pattern}`);
    }
    // No uncontrolled English inside the Russian learner strings.
    const ruText = [decision.questionRu, decision.explanationRu, decision.reasonOptions[0].textRu].join(" ");
    assert.doesNotMatch(ruText, /\b(the|transfer layer|curriculum|closure|learner)\b/i, `${id} RU keeps an English token`);
  }
});

test("FND-V2-03 rewrite preserves answer identity, misconceptions and source refs", () => {
  const expected = {
    "PM-W4-HAND-01-101": { refs: ["FINAL_LEARNING_INTEGRITY", "LCM-02"], kind: "recognition" },
    "PM-W4-HAND-01-102": { refs: ["FINAL_LEARNING_INTEGRITY"], kind: "recognition" },
    "PM-W4-HAND-01-103": { refs: ["FINAL_LEARNING_INTEGRITY", "LCM-02"], kind: "decision" },
    "PM-W4-HAND-01-104": { refs: ["FINAL_LEARNING_INTEGRITY"], kind: "decision" },
    "PM-W4-HAND-01-105": { refs: ["LCM-02", "FINAL_LEARNING_INTEGRITY"], kind: "decision" },
  };
  for (const [id, want] of Object.entries(expected)) {
    const decision = practicalDecisionById.get(id);
    assert.equal(decision.correctActionId, "a");
    assert.equal(decision.correctReasonId, "r1");
    assert.equal(decision.kind, want.kind);
    assert.deepEqual(decision.sourceRefs, want.refs);
    assert.deepEqual(decision.actionOptions.map((option) => option.misconception), [undefined, "CLASSIFICATION_SHORTCUT", "CONTEXT_IGNORED"]);
    assert.deepEqual(decision.reasonOptions.map((option) => option.misconception), [undefined, "LABEL_AS_STRATEGY", "INITIATIVE_ONLY"]);
  }
});

test("FND-V2-03 the internal transfer-validation fixture is untouched and still not learner-reachable", () => {
  const fixture = practicalDecisionById.get("PM-W4-HAND-01-108");
  assert.equal(fixture.learnerEligibility, "INTERNAL_ONLY");
  assert.equal(isOrdinaryLearnerDecision(fixture), false);
  assert.match(fixture.explanationEn, /integrity closure/i, "the internal fixture keeps its closure-evidence wording");
  assert.equal(practicalDecisions.filter((d) => isOrdinaryLearnerDecision(d) && d.id === "PM-W4-HAND-01-108").length, 0);
});
