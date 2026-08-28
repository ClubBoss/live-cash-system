import assert from "node:assert/strict";
import test from "node:test";
import { practicalDecisionById, practicalDecisions } from "../content/practical-mastery";
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

  for (const correction of [
    "Можно ли определить, кому принадлежит преимущество на доске, только по её ярлыку?",
    "Какая стратегия здесь выглядит правдоподобной?",
    "Какой переход нужен до действия?",
    "Какой сигнал нужно назвать до действия?",
    "Перенос проверяется на неидентичных примерах.",
  ]) assert.match(text, new RegExp(correction.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&"), "u"));
  // The W4-HAND-01 combo->family explanations were rewritten to direct poker at
  // source (FND-V2-03); the earlier polish-map corrections for -103 / -105 are
  // superseded — see blind-v2-fnd-03-internal-language for that contract.
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
