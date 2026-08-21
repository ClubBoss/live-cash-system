import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const route = await readFile(path.join(root, "content/practical-mastery/learning-route.ts"), "utf8");
const core = await readFile(path.join(root, "lib/practical-mastery-core.ts"), "utf8");

test("learning route separates dependency semantics from legacy topic order", () => {
  assert.match(route, /"HARD" \| "SOFT" \| "REINFORCING"/);
  assert.match(route, /legacyDeclaredDependencies/);
  assert.match(route, /kind: "SOFT" as const/);
  assert.match(route, /curatedHardDependencies/);
  assert.match(route, /canonicalFirstJourneySkillIds/);
  assert.doesNotMatch(route, /LCM-01.*LCM-02.*LCM-03/s);
});

test("route score represents learning EV rather than chapter sequence", () => {
  for (const signal of ["liveFrequency", "mistakeCost", "transferLeverage", "motivationValue", "cognitiveLoad"]) assert.match(route, new RegExp(signal));
  assert.match(route, /repairUrgency/);
  assert.match(route, /recentExposurePenalty/);
  assert.doesNotMatch(route, /waveIndex|moduleIndex|lessonNumber/);
});

test("first journey spirals from foundation into table decisions", () => {
  for (const skill of ["FND-01", "PF-01", "PF-04", "W4-BOARD-01", "IP-01", "BL-04", "W4-RUNOUT-01"]) assert.match(route, new RegExp(`"${skill}"`));
});

test("runtime gating consumes curated HARD dependencies instead of registry order", () => {
  assert.match(core, /hardDependenciesFor\(skillId\)/);
  assert.doesNotMatch(core, /skill\.prerequisiteSkillIds\.every/);
});

test("runtime scheduler can interrupt route for repair and then rank by learning EV", () => {
  assert.match(core, /recommendNextPracticalSkill/);
  assert.match(core, /urgentRepair/);
  assert.match(core, /canonicalFirstJourneySkillIds/);
  assert.match(core, /learningRouteScore/);
  assert.match(route, /whyNowForSkill/);
  assert.match(route, /Repair now:/);
  assert.match(route, /High-value next capability:/);
});
