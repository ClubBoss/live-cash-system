import assert from "node:assert/strict";
import test from "node:test";
import { practicalDecisionById, practicalDecisions } from "../content/practical-mastery";
import { applyPracticalRuFinalPolish } from "../content/practical-mastery/practical-ru-final-polish.ts";
import { sanitizeLearnerPresentationText } from "../lib/learner-presentation-firewall";

function ruDecisionText() {
  return practicalDecisions.flatMap((decision) => [
    decision.cueRu,
    decision.questionRu,
    decision.explanationRu,
    ...decision.actionOptions.map((option) => option.textRu),
    ...decision.reasonOptions.map((option) => option.textRu),
  ]).join("\n");
}

const fnd03Sentinel = {
  id: "FND-03-SENTINEL",
  skillId: "FND-03",
  kind: "decision",
  sourceRefs: ["FND-03"],
  assumptions: ["same assumptions"],
  cueRu: "Можно ли только по label доски решить, кому она принадлежит?",
  cueEn: "unchanged cue",
  questionRu: "Какой bridge нужен до action?",
  questionEn: "unchanged question",
  actionOptions: [
    { id: "a", textRu: "Какой signal нужно назвать до action?", textEn: "unchanged action" },
  ],
  reasonOptions: [
    { id: "r1", textRu: "Какой family plausible?", textEn: "unchanged reason" },
  ],
  correctActionId: "a",
  correctReasonId: "r1",
  explanationRu: "Целостность закрытие требует неидентичных стимулов до заявления перенос.",
  explanationEn: "unchanged explanation",
  changedVariables: ["same_variable"],
  targetSeconds: 27,
};

test("FND-03 closes the observed RU publication defects and their bounded malformed-template siblings", () => {
  const text = ruDecisionText();
  for (const defect of [
    "Можно ли только по ярлык",
    "Новый учебная программа",
    "Какой family plausible?",
    "Целостность закрытие",
    "до действие",
    "заявления перенос",
  ]) assert.doesNotMatch(text, new RegExp(defect, "iu"));
});

test("FND-03 predecessor RU polish owns the positive terminology corrections", () => {
  const polished = applyPracticalRuFinalPolish(fnd03Sentinel);
  assert.equal(
    polished.cueRu,
    "Можно ли определить, кому принадлежит преимущество на доске, только по её ярлыку?",
  );
  assert.equal(polished.questionRu, "Какой переход нужен до действия?");
  assert.equal(polished.actionOptions[0].textRu, "Какой сигнал нужно назвать до действия?");
  assert.equal(polished.reasonOptions[0].textRu, "Какая стратегия здесь выглядит правдоподобной?");
  assert.equal(polished.explanationRu, "Перенос проверяется на неидентичных примерах.");
});

test("FND-03 preserves decision and answer identities while the learner firewall repairs the source-label agreement", () => {
  const expectedIdentities = {
    "PM-W4-BOARD-001": ["a", "r1"],
    "PM-W4-HAND-01-103": ["a", "r1"],
    "PM-W4-HAND-01-105": ["a", "r1"],
    "PM-IP-01-101": ["good", "why"],
    "PM-TURN-01-A8-101": ["good", "goodR"],
  };
  for (const [id, [actionId, reasonId]] of Object.entries(expectedIdentities)) {
    const decision = practicalDecisionById.get(id);
    assert.ok(decision, `missing governed decision ${id}`);
    assert.equal(decision.correctActionId, actionId);
    assert.equal(decision.correctReasonId, reasonId);
  }
  assert.equal(
    sanitizeLearnerPresentationText("FTGU-E01 прямо показывает, почему цена колла важна.", "ru"),
    "Проверенные данные прямо показывают, почему цена колла важна.",
  );
});