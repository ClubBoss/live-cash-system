import assert from "node:assert/strict";
import test from "node:test";
import { practicalDecisions, isOrdinaryLearnerDecision } from "../content/practical-mastery";
import { applyPracticalRuFinalPolish } from "../content/practical-mastery/practical-ru-final-polish";
import { sanitizeLearnerPresentationText } from "../lib/learner-presentation-firewall";

// FND-V2-02: RU learner questions rendered "Какой базовая линия / ветка ..."
// because the corpus polish swaps an English noun for a feminine Russian one
// without touching the interrogative it modifies.

test("FND-V2-02 the polish pass repairs interrogative gender agreement", () => {
  const cases = [
    ["Какой базовая линия лучше?", "Какая базовая линия лучше?"],
    ["Какой ветка может выиграть EV?", "Какая ветка может выиграть EV?"],
    ["Какой структура предпочтительнее?", "Какая структура предпочтительнее?"],
    ["какой ветка получает вес?", "какая ветка получает вес?"],
    ["этот ветка важна", "эта ветка важна"],
    ["Какой default лучше?", "Какая базовая линия лучше?"],
  ];
  for (const [input, expected] of cases) {
    const polished = applyPracticalRuFinalPolish({
      id: "x", questionRu: input, cueRu: "", explanationRu: "", actionOptions: [], reasonOptions: [],
    });
    assert.equal(polished.questionRu, expected);
  }
});

test("FND-V2-02 no active learner RU question keeps 'Какой/этот' before a feminine head", () => {
  const offenders = [];
  const broken = /(^|[^\p{L}])(какой|этот)\s+(?:базовая(?: защитн\p{L}+)? лини\p{L}+|ветк\p{L}+|структур\p{L}+|стратеги\p{L}+|корректировк\p{L}+)/iu;
  for (const decision of practicalDecisions) {
    if (!isOrdinaryLearnerDecision(decision)) continue;
    for (const field of [decision.questionRu, decision.cueRu, decision.explanationRu,
      ...decision.actionOptions.map((o) => o.textRu), ...decision.reasonOptions.map((o) => o.textRu)]) {
      if (typeof field !== "string" || !field) continue;
      const rendered = sanitizeLearnerPresentationText(field, "ru");
      if (broken.test(rendered)) offenders.push(`${decision.id}: ${rendered.slice(0, 80)}`);
    }
  }
  assert.deepEqual(offenders, [], `RU gender-agreement break: ${offenders.join(" | ")}`);
});

test("FND-V2-02 the demonstrated machine-composed RU strings are gone from the active corpus", () => {
  const bad = [
    /Ancestry является частью state/i,
    /material change между двумя snapshots/i,
    /Логика слоуплей в частично/i,
    /Position постепенно меняет steal EV/i,
    /slow-play appeal/i,
    /Какой family signal/i,
  ];
  for (const decision of practicalDecisions) {
    for (const field of [decision.questionRu, decision.cueRu, decision.explanationRu,
      ...decision.actionOptions.map((o) => o.textRu), ...decision.reasonOptions.map((o) => o.textRu)]) {
      if (typeof field !== "string") continue;
      for (const pattern of bad) assert.doesNotMatch(field, pattern, `${decision.id} keeps ${pattern}`);
    }
  }
});
