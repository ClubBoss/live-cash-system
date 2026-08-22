import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const engine = await readFile(path.join(root, "lib/practical-integrated-session.ts"), "utf8");
const core = await readFile(path.join(root, "lib/practical-mastery-core.ts"), "utf8");
const ui = await readFile(path.join(root, "components/PracticalIntegratedSessionExperience.tsx"), "utf8");
const journey = await readFile(path.join(root, "components/PracticalFirstJourneyExperience.tsx"), "utf8");
const integratedCorpus = await readFile(path.join(root, "content/practical-mastery/decisions-integrated-a11-expansion.ts"), "utf8");
const gaps = await readFile(path.join(root, "content/practical-mastery/source-gaps.ts"), "utf8");
const dod = await readFile(path.join(root, "../../analysis/INTEGRATED_ADAPTIVE_MASTERY_A11_DOD_V1.md"), "utf8");

test("A11 supplies non-identical corpus for every integrated meta family", () => {
  for (const skill of ["INT-01", "INT-02", "INT-03", "INT-04", "INT-05"]) {
    const matches = integratedCorpus.match(new RegExp(`skillId:\\"${skill}\\"`, "g")) ?? [];
    assert.ok(matches.length >= 8, `${skill} should have at least 8 A11 stimuli`);
  }
});

test("integrated session is bounded, topic-hidden, and reveals scheduling reason only after commitment", () => {
  assert.match(engine, /INTEGRATED_SESSION_SIZE = 8/);
  assert.match(ui, /Тема скрыта до ответа|topic stays hidden/i);
  assert.match(ui, /ЧТО ПРОВЕРЯЛОСЬ|WHAT THIS TESTED/);
  assert.match(ui, /whyAfterAnswer/);
  const preReveal = ui.slice(ui.indexOf("Прими решение до подсказки"), ui.indexOf("ЧТО ПРОВЕРЯЛОСЬ"));
  assert.doesNotMatch(preReveal, /skill\.titleRu|skill\.titleEn|item\.whyAfterAnswer/);
});

test("scheduler never blind-tests unseen concepts or source-blocked skills", () => {
  assert.match(engine, /if \(!progress\?\.conceptTaught\) return false/);
  assert.match(engine, /status === "SOURCE_BLOCKED"/);
  assert.match(engine, /BRIDGE_SKILL_IDS/);
  assert.match(engine, /supportedIntegratedSkillIds/);
});

test("repair priority uses latest unresolved misconceptions and high-confidence wrongs", () => {
  assert.match(engine, /HIGH_CONFIDENCE_WRONG = 75/);
  assert.match(engine, /selectedMisconceptions/);
  assert.match(engine, /attempt\.confidence >= HIGH_CONFIDENCE_WRONG \? 5 : 2/);
  assert.match(core, /latestAttemptsByDecision/);
  assert.match(core, /lastIncorrectDecisionId = null/);
});

test("delayed retrieval requires real spacing and a non-identical item", () => {
  assert.match(engine, /RETENTION_INTERVAL_DAYS = \[1, 3, 7\]/);
  assert.match(engine, /item\.decisionId !== latestCorrectBefore\.decisionId/);
  assert.match(engine, /actualGap >= item\.retentionTierDays/);
  assert.match(core, /retentionDaysPassed: number\[\]/);
  assert.match(dod, /immediate repeats cannot grant delayed retrieval/i);
});

test("real-hand routing classifies causal mechanisms rather than results", () => {
  assert.match(engine, /routeRealHandToRepairs/);
  for (const token of ["PF-04", "BL-04", "W4-BOARD-01", "OOP-01", "3BP-05", "TURN-03", "RIV-03", "MW-02", "DEEP-03", "EXP-01"]) assert.match(engine, new RegExp(token));
  assert.match(integratedCorpus, /Outcome size is not a skill-family label/);
});

test("First Journey hands off to mixed practice on the same nested v3 mastery state", () => {
  assert.match(journey, /usePracticalProfileState/);
  assert.match(journey, /href="\/mastery\/session"/);
  assert.match(core, /PRACTICAL_MASTERY_STATE_SCHEMA_VERSION = 3/);
});

test("post-B1 source ceiling remains explicit in the whole system", () => {
  assert.match(gaps, /skillId: "BL-11"[\s\S]*?status: "PARTIAL"/);
  assert.match(gaps, /POSITIVE_EV_SOURCE_ACCESS_REQUIRED/);
  for (const closed of ["FND-04","BL-06","BL-07","BL-08","BL-09","W4-DRAW-01","DEEP-02","MW-05","EXP-06"]) {
    assert.doesNotMatch(gaps, new RegExp(`skillId: "${closed}"`));
  }
});

test("A11 does not authorize main cutover or production deployment", () => {
  assert.match(dod, /Main\/default-route cutover is not allowed until executable validation is actually run/i);
  assert.match(dod, /Production deploy remains separately authorized/i);
});
