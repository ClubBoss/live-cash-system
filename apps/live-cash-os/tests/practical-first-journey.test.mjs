import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const journey = await readFile(path.join(root, "content/practical-mastery/first-journey.ts"), "utf8");
const engine = await readFile(path.join(root, "lib/practical-first-journey.ts"), "utf8");
const ui = await readFile(path.join(root, "components/PracticalFirstJourneyExperience.tsx"), "utf8");
const page = await readFile(path.join(root, "app/mastery/journey/page.tsx"), "utf8");

test("first journey is a spiral across multiple capability families", () => {
  for (const skill of ["FND-01", "PF-01", "PF-04", "W4-BOARD-01", "IP-01", "BL-04", "W4-RUNOUT-01"]) assert.match(journey, new RegExp(skill));
  assert.match(journey, /interleavesWaves/);
  assert.match(journey, /reachesPostflop/);
  assert.match(journey, /includesChangedBlindNode/);
});

test("first exposure advances on recognition rather than requiring transfer mastery", () => {
  assert.match(engine, /RECOGNITION_TRAINED/);
  assert.match(engine, /practicalSkillCorpusCanReach\(skill\.id, "RECOGNITION_TRAINED"\)/);
  assert.match(engine, /availablePracticalSkills/);
  assert.doesNotMatch(engine, /trainablePracticalSkills/);
  const recommendationSection = engine.slice(engine.indexOf("export function recommendFirstJourneyStep"), engine.indexOf("export function firstJourneyProgress"));
  assert.doesNotMatch(recommendationSection, /CHANGED_NODE_TRANSFER/);
});

test("repair is resolved by latest attempt rather than lifetime wrong count", () => {
  assert.match(engine, /latestAttemptForDecision/);
  assert.match(engine, /unresolvedWrongDecisionIds/);
  assert.match(engine, /latest && !latest\.correct/);
});

test("first journey predicts before revealing the mechanism and then scores a decision", () => {
  assert.match(ui, /PREDICT FIRST/);
  assert.match(ui, /Показать механизм|Reveal mechanism/);
  assert.match(ui, /recordPracticalDecision/);
  assert.match(ui, /nextFirstJourneyDecision/);
  assert.match(ui, /HIDDEN-CUE RETRIEVAL/);
});

test("journey is runnable on its own route and does not cut over default home", () => {
  assert.match(page, /PracticalFirstJourneyExperience/);
  assert.doesNotMatch(page, /LiveCashApp/);
});
