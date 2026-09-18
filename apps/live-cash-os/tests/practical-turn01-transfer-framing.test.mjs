import assert from "node:assert/strict";
import test from "node:test";

import { practicalSkillById } from "../content/practical-mastery/index.ts";
import { practicalPostQuickStartTeachingAssetForSkill } from "../lib/practical-post-quick-start-learning.ts";

test("TURN-01 deepens W4-RUNOUT rather than reteaching runout labels from scratch", () => {
  const skill = practicalSkillById.get("TURN-01");
  assert.ok(skill);
  assert.ok(skill.prerequisiteSkillIds.includes("W4-RUNOUT-01"));
  assert.match(skill.objectiveRu, /Углублять знакомые runout classes/u);
  assert.match(skill.objectiveEn, /Deepen the familiar runout classes/i);

  const asset = practicalPostQuickStartTeachingAssetForSkill("TURN-01");
  assert.ok(asset);
  assert.equal(asset.kind, "SOURCE_BOUND");
  assert.deepEqual(asset.teaching.sourceRefs, ["FTGU-E21"]);
  assert.match(asset.teaching.situationRu, /W4-RUNOUT-01 уже научил/u);
  assert.match(asset.teaching.situationEn, /already taught the basic/i);
  assert.match(asset.teaching.mechanismRu, /диапазоны, сохранившиеся после флоп-экшена/u);
  assert.match(asset.teaching.mechanismEn, /survived the flop action/i);
  assert.match(asset.teaching.boundaryRu, /автоматические ставки или чеки/u);
  assert.match(asset.teaching.boundaryEn, /automatic bets or checks/i);
});
