import assert from "node:assert/strict";
import test from "node:test";
import { practicalDecisionById } from "../content/practical-mastery";

const ids = [
  "PM-FND-01-101",
  "PM-FND-01-102",
  "PM-FND-01-103",
  "PM-FND-01-104",
  "PM-FND-01-105",
  "PM-FND-01-106",
  "PM-FND-01-107",
];

function ruText(decision) {
  return [
    decision.cueRu,
    decision.questionRu,
    decision.explanationRu,
    ...decision.actionOptions.map((option) => option.textRu),
    ...decision.reasonOptions.map((option) => option.textRu),
  ].join("\n");
}

test("FND-01 RU learner projection removes the observed hybrid publication class without changing identities", () => {
  const decisions = ids.map((id) => {
    const decision = practicalDecisionById.get(id);
    assert.ok(decision, `missing governed decision ${id}`);
    return decision;
  });
  const text = decisions.map(ruText).join("\n");

  for (const defect of [
    "Cheaper call требует больше equity",
    "Price тот же, но после range update",
    "Hand name важнее range",
    "At tree end price/equity comparison",
    "Risk / (risk + reward)",
  ]) assert.doesNotMatch(text, new RegExp(defect.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&"), "u"));

  for (const correction of [
    "Более дешёвый колл требует больше эквити",
    "Цена та же, но после уточнения диапазона эквити падает ниже порога безубыточности.",
    "Название руки важнее диапазона",
    "Hero рискует 1bb, чтобы выиграть 3bb: 1 / (1 + 3) = 25%",
  ]) assert.match(text, new RegExp(correction.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&"), "u"));

  assert.deepEqual(
    Object.fromEntries(decisions.map((decision) => [decision.id, [decision.correctActionId, decision.correctReasonId, decision.sourceRefs]])),
    {
      "PM-FND-01-101": ["a", "r1", ["FTGU-E01"]],
      "PM-FND-01-102": ["a", "r1", ["FTGU-E01"]],
      "PM-FND-01-103": ["b", "r1", ["FTGU-E01"]],
      "PM-FND-01-104": ["a", "r1", ["FTGU-E01"]],
      "PM-FND-01-105": ["a", "r1", ["FTGU-E01"]],
      "PM-FND-01-106": ["a", "r1", ["FTGU-E01"]],
      "PM-FND-01-107": ["a", "r1", ["FTGU-E01"]],
    },
  );
});
