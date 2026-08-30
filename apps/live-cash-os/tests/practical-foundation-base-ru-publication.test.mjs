import assert from "node:assert/strict";
import test from "node:test";

import { practicalAnchorById, practicalDecisionById } from "../content/practical-mastery/index.ts";

const decisionIds = ["PM-FND-01-001", "PM-FND-02-001", "PM-FND-05-001"];
const anchorIds = [
  "FND-01-A01",
  "FND-01-A02",
  "FND-02-A01",
  "FND-02-A02",
  "FND-03-A01",
  "FND-03-A02",
  "FND-05-A01",
  "FND-05-A02",
  "FND-06-A01",
  "FND-06-A02",
  "FND-07-A01",
];

function decisionRu(decision) {
  return [
    decision.cueRu,
    decision.questionRu,
    decision.explanationRu,
    ...decision.actionOptions.map((option) => option.textRu),
    ...decision.reasonOptions.map((option) => option.textRu),
  ].join("\n");
}

function anchorRu(anchor) {
  return [anchor.promptRu, anchor.answerRu, anchor.rationaleRu].join("\n");
}

test("Foundation anchors/base publish as complete natural RU sentences", () => {
  const decisions = decisionIds.map((id) => {
    const decision = practicalDecisionById.get(id);
    assert.ok(decision, `missing governed decision ${id}`);
    return decision;
  });
  const anchors = anchorIds.map((id) => {
    const anchor = practicalAnchorById.get(id);
    assert.ok(anchor, `missing governed anchor ${id}`);
    return anchor;
  });
  const ru = [...decisions.map(decisionRu), ...anchors.map(anchorRu)].join("\n");

  for (const defect of [
    "required equity",
    "raw equity",
    "future action",
    "postflop execution",
    "marginal defends",
    "preflop combo counts",
    "pocket pair",
    "suited hand",
    "offsuit hand",
    "exact suit combinations",
    "board/hole cards",
    "nominally playable",
    "high-card hand",
    "tight EP range",
    "late-position range",
    "combo counts",
    "board card",
    "effective depth",
    "pairwise",
    "preflop pot",
    "postflop decision tree",
    "action tree",
    "all-in/river nodes",
  ]) assert.equal(ru.toLocaleLowerCase("ru-RU").includes(defect.toLocaleLowerCase("ru-RU")), false, `hybrid RU survived: ${defect}`);

  for (const required of [
    "Пот-оддсы 1:2 задают порог безубыточности около 33%",
    "Оценить реализацию эквити и будущие ветки EV",
    "Стандартное число префлоп-комбинаций",
    "Пот-оддсы — это отношение, а не абсолютное число фишек",
    "пограничный колл становится прибыльнее",
    "риск доминации топ-пары",
    "Эффективный стек считается отдельно для каждой пары Hero–соперник",
    "решения на ривере и в олл-ине",
  ]) assert.match(ru, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&"), "iu"));
});

test("Foundation anchors/base RU repair preserves strategy and scoring identities", () => {
  assert.deepEqual(
    Object.fromEntries(decisionIds.map((id) => {
      const decision = practicalDecisionById.get(id);
      return [id, [decision.correctActionId, decision.correctReasonId, decision.sourceRefs]];
    })),
    {
      "PM-FND-01-001": ["a", "r1", ["FTGU-E01"]],
      "PM-FND-02-001": ["a", "r1", ["FTGU-E01", "FTGU-E05"]],
      "PM-FND-05-001": ["a", "r1", ["FTGU-E11"]],
    },
  );
  assert.deepEqual(
    Object.fromEntries(anchorIds.map((id) => [id, practicalAnchorById.get(id).sourceRefs])),
    {
      "FND-01-A01": ["FTGU-E01"],
      "FND-01-A02": ["FTGU-E01"],
      "FND-02-A01": ["FTGU-E01", "FTGU-E05"],
      "FND-02-A02": ["FTGU-E05"],
      "FND-03-A01": ["FTGU-E01"],
      "FND-03-A02": ["FTGU-E05"],
      "FND-05-A01": ["FTGU-E11"],
      "FND-05-A02": ["FTGU-E11"],
      "FND-06-A01": ["LCM-01"],
      "FND-06-A02": ["LCM-01", "FTGU-E01"],
      "FND-07-A01": ["FTGU-E01"],
    },
  );
});
