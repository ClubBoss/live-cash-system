import assert from "node:assert/strict";
import test from "node:test";

import { firstJourneyStepForSkill } from "../content/practical-mastery/first-journey.ts";
import { practicalSkillById } from "../content/practical-mastery/index.ts";
import { practicalRulesForSkill } from "../content/practical-mastery/mental-model.ts";
import { decisionsForPracticalSkill } from "../lib/practical-mastery-core.ts";
import { isPrimaryPracticalLearnerSkill } from "../lib/practical-learner-skill-set.ts";

test("OOP-06 is a non-learner bridge into canonical TURN-04 evidence", () => {
  const bridge = practicalSkillById.get("OOP-06");
  const target = practicalSkillById.get("TURN-04");
  assert.ok(bridge);
  assert.ok(target);

  assert.equal(isPrimaryPracticalLearnerSkill("OOP-06"), false);
  assert.equal(isPrimaryPracticalLearnerSkill("TURN-04"), true);
  assert.equal(decisionsForPracticalSkill("OOP-06").length, 0);
  assert.ok(target.prerequisiteSkillIds.includes("OOP-06"));
  assert.ok(target.prerequisiteSkillIds.includes("TURN-01"));
  assert.deepEqual(bridge.sourceRefs, ["SLC-TURN-LEADS"]);
  assert.deepEqual(target.sourceRefs, ["SLC-TURN-LEADS"]);

  const kinds = new Set(decisionsForPracticalSkill("TURN-04").map((decision) => decision.kind));
  for (const kind of ["recognition", "decision", "changed", "boundary"]) assert.ok(kinds.has(kind));
  assert.match(target.objectiveEn, /Lead after a flop call only on source-supported runouts/i);
});

test("PF-04 establishes the BB-call model; BL-04 isolates sizing transfer", () => {
  const foundation = practicalSkillById.get("PF-04");
  const transfer = practicalSkillById.get("BL-04");
  const foundationStep = firstJourneyStepForSkill("PF-04");
  const transferStep = firstJourneyStepForSkill("BL-04");
  assert.ok(foundation);
  assert.ok(transfer);
  assert.ok(foundationStep);
  assert.ok(transferStep);

  assert.deepEqual(foundation.prerequisiteSkillIds, ["FND-01", "FND-02"]);
  assert.deepEqual(transfer.prerequisiteSkillIds, ["BL-01", "BL-02", "BL-03"]);
  assert.match(foundation.objectiveEn, /price, closing action, and realization/i);
  assert.match(transfer.objectiveEn, /price.*sizings/i);
  assert.deepEqual(foundationStep.memoryRuleIds, ["RULE-BB-PRICE", "RULE-BB-ORIGIN"]);
  assert.deepEqual(transferStep.memoryRuleIds, ["RULE-BB-PRICE"]);
  assert.equal(foundationStep.requiresHiddenCue, false);
  assert.equal(transferStep.requiresHiddenCue, true);

  const sharedRule = practicalRulesForSkill("PF-04")
    .filter((rule) => practicalRulesForSkill("BL-04").some((candidate) => candidate.id === rule.id))
    .map((rule) => rule.id);
  assert.deepEqual(sharedRule, ["RULE-BB-PRICE"]);

  const transferChanged = decisionsForPracticalSkill("BL-04").filter((decision) => decision.kind === "changed");
  assert.ok(transferChanged.some((decision) => decision.changedVariables?.includes("open_size")));
  assert.match(transferStep.purposeEn, /larger open makes marginal calls more expensive/i);
});

test("TURN-01 deepens W4-RUNOUT instead of reopening the same recognition objective", () => {
  const early = practicalSkillById.get("W4-RUNOUT-01");
  const later = practicalSkillById.get("TURN-01");
  assert.ok(early);
  assert.ok(later);
  assert.ok(later.prerequisiteSkillIds.includes("W4-RUNOUT-01"));
  assert.match(early.objectiveEn, /recognize blank, scare, draw-completing,? and range-shifting/i);
  assert.match(later.objectiveEn, /deepen the familiar runout classes/i);
  assert.match(later.objectiveEn, /surviving ranges after the actual flop line/i);
  assert.notEqual(early.objectiveEn, later.objectiveEn);
});
