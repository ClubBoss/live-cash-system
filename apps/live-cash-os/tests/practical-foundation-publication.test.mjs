import test from "node:test";
import assert from "node:assert/strict";

import {
  practicalAnchorById,
  practicalDecisionById,
  practicalSkillById,
} from "../content/practical-mastery/index.ts";
import { firstJourneyStepForSkill } from "../content/practical-mastery/first-journey.ts";

test("foundation labels use natural Russian while preserving standard poker terms", () => {
  assert.equal(practicalSkillById.get("FND-01")?.titleRu, "Цена колла: pot odds и требуемая equity");
  assert.equal(practicalSkillById.get("FND-02")?.titleRu, "Номинальная и реализуемая equity");
  assert.equal(practicalSkillById.get("FND-05")?.titleRu, "Подсчёт комбо и блокеры");
  assert.equal(practicalSkillById.get("FND-06")?.titleRu, "Эффективный стек и SPR");
  assert.match(practicalSkillById.get("FND-01")?.objectiveRu ?? "", /требуемой equity/u);
});

test("pot odds starts with a concrete pot before stating the normalized ratio", () => {
  const anchor = practicalAnchorById.get("FND-01-A01");
  const decision = practicalDecisionById.get("PM-FND-01-001");
  const firstStep = firstJourneyStepForSkill("FND-01");

  assert.match(anchor?.promptRu ?? "", /В банке 1bb, соперник ставит 1bb/u);
  assert.match(anchor?.answerRu ?? "", /pot odds 1:2/u);
  assert.match(anchor?.rationaleRu ?? "", /Сначала определи цену колла и банк/u);
  assert.match(decision?.cueRu ?? "", /В банке 1bb, соперник ставит 1bb/u);
  assert.match(decision?.explanationRu ?? "", /pot odds 1:2/u);
  assert.match(firstStep?.purposeRu ?? "", /цену колла в банке/u);
});

test("foundation publication repair keeps stable decision identities and scoring", () => {
  const decision = practicalDecisionById.get("PM-FND-01-001");
  assert.equal(decision?.correctActionId, "a");
  assert.equal(decision?.correctReasonId, "r1");
  assert.equal(decision?.targetSeconds, 25);
});
