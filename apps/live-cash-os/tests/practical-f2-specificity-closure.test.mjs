import test from "node:test";
import assert from "node:assert/strict";

import { practicalDecisionById, practicalDecisions } from "../content/practical-mastery/index.ts";

const GENERIC_B3_RU = new Set([
  "Пересчитать направление; прежнюю базовую линию не переносить автоматически",
  "Вместе с изменённым фактором меняются соответствующий порог, диапазон или реализация эквити",
]);
const GENERIC_B3_EN = new Set([
  "Recompute the direction; do not copy the old default automatically",
  "The relevant threshold/range/realization changed with the variable",
]);
const GENERIC_A8_RU = "Отказаться от универсального правила и вернуться к механике, привязанной к источнику";
const GENERIC_A8_EN = "Reject the universal rule and return to the source-scoped mechanism";

function correctAction(decision, locale) {
  const option = decision.actionOptions.find((item) => item.id === decision.correctActionId);
  assert.ok(option, `missing correct action for ${decision.id}`);
  return locale === "ru" ? option.textRu : option.textEn;
}

test("all B3 changed decisions publish source-bound direction in both locales", () => {
  const changed = practicalDecisions.filter((decision) => (
    decision.kind === "changed" && decision.id.includes("-B3-")
  ));
  assert.equal(changed.length, 40);
  for (const decision of changed) {
    assert.equal(GENERIC_B3_RU.has(correctAction(decision, "ru")), false, decision.id);
    assert.equal(GENERIC_B3_EN.has(correctAction(decision, "en")), false, decision.id);
    assert.ok(decision.sourceRefs.length > 0, `missing sourceRefs for ${decision.id}`);
  }

  const btnToHj = practicalDecisionById.get("PM-B3-PF01-103");
  assert.ok(btnToHj);
  assert.match(correctAction(btnToHj, "ru"), /HJ/u);
  assert.match(correctAction(btnToHj, "en"), /HJ/u);
});

test("A8 boundary rows test the mechanism boundary rather than a source-return slogan", () => {
  const boundaries = practicalDecisions.filter((decision) => /-A8-108$/.test(decision.id));
  assert.equal(boundaries.length, 10);
  for (const decision of boundaries) {
    assert.notEqual(correctAction(decision, "ru"), GENERIC_A8_RU, decision.id);
    assert.notEqual(correctAction(decision, "en"), GENERIC_A8_EN, decision.id);
    assert.ok(decision.sourceRefs.length > 0, `missing sourceRefs for ${decision.id}`);
  }

  const turnLead = practicalDecisionById.get("PM-TURN-04-A8-108");
  assert.ok(turnLead);
  assert.match(correctAction(turnLead, "ru"), /конкретн|диапазон|владение/iu);
  assert.match(correctAction(turnLead, "en"), /exact hand|range|ownership/iu);
});
