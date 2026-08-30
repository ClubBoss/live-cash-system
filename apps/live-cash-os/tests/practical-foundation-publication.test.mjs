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
  assert.match(anchor?.answerRu ?? "", /пот-оддсы 1:2/u);
  assert.match(anchor?.rationaleRu ?? "", /Сначала определи цену колла и банк/u);
  assert.match(decision?.cueRu ?? "", /В банке 1bb, соперник ставит 1bb/u);
  assert.match(decision?.explanationRu ?? "", /пот-оддсы 1:2/u);
  assert.match(firstStep?.purposeRu ?? "", /цену колла в банке/u);
});

test("foundation publication repair keeps stable decision identities and scoring", () => {
  const decision = practicalDecisionById.get("PM-FND-01-001");
  assert.equal(decision?.correctActionId, "a");
  assert.equal(decision?.correctReasonId, "r1");
  assert.equal(decision?.targetSeconds, 25);
});

test("BB-call first exposure is composed as natural Russian while keeping its learning identities", () => {
  const skill = practicalSkillById.get("PF-04");
  const decisions = ["101", "102", "103", "104", "105", "106", "107"].map((suffix) =>
    practicalDecisionById.get(`PM-PF-04-${suffix}`),
  );
  const learnerCopy = [
    skill?.titleRu,
    skill?.objectiveRu,
    firstJourneyStepForSkill("PF-04")?.purposeRu,
    firstJourneyStepForSkill("PF-04")?.tableUseRu,
    ...decisions.flatMap((decision) => [
      decision?.cueRu,
      decision?.questionRu,
      decision?.explanationRu,
      ...((decision?.actionOptions ?? []).map((option) => option.textRu)),
      ...((decision?.reasonOptions ?? []).map((option) => option.textRu)),
    ]),
  ].filter(Boolean).join("\n");

  assert.match(learnerCopy, /Коллы из BB/u);
  assert.match(learnerCopy, /Небольшой опен с поздней позиции/u);
  assert.doesNotMatch(learnerCopy, /Calling from BB|required realisable equity|marginal defend|Open size/u);
  assert.deepEqual(decisions.map((decision) => [decision?.correctActionId, decision?.correctReasonId]), Array(7).fill(["a", "r1"]));
  assert.ok(decisions.every((decision) => decision?.sourceRefs.length === 1));
});

test("33, 33 (scaled) and 25 percent pot-odds teaching remains concrete before the ratio and threshold", () => {
  const oneThird = practicalAnchorById.get("FND-01-A01");
  const scaledOneThird = practicalAnchorById.get("FND-01-A02");
  const quarter = practicalDecisionById.get("PM-FND-01-101");

  assert.match(`${oneThird?.promptRu}\n${oneThird?.rationaleRu}`, /В банке 1bb, соперник ставит 1bb[\s\S]*1:2[\s\S]*33%/u);
  assert.match(`${scaledOneThird?.promptRu}\n${scaledOneThird?.rationaleRu}`, /В банке 2bb, соперник ставит 2bb[\s\S]*2 \/ \(4 \+ 2\) = 2 \/ 6[\s\S]*33%/u);
  assert.match(`${quarter?.cueRu}\n${quarter?.explanationRu}`, /В банке 2bb, соперник ставит 1bb[\s\S]*1:3[\s\S]*25%/u);
});

test("scaled pot-odds transfer example teaches scale invariance instead of a false 50% threshold", () => {
  const scaled = practicalAnchorById.get("FND-01-A02");

  assert.match(scaled?.assumptions.join(" ") ?? "", /call 2bb to win 4bb/u);
  assert.doesNotMatch(scaled?.answerRu ?? "", /50%/u);
  assert.doesNotMatch(scaled?.rationaleRu ?? "", /2 \/ 4 = 50%/u);
  assert.match(scaled?.answerRu ?? "", /33%/u);
});
