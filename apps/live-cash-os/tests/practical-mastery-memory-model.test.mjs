import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const memory = await readFile(path.join(root, "content/practical-mastery/mental-model.ts"), "utf8");
const audit = await readFile(path.join(root, "../../analysis/SEQUENCE_DECOMPOSITION_AUDIT_A1_V1.md"), "utf8");

test("memory model distinguishes procedural order from trigger-bound learning", () => {
  assert.match(memory, /"TRUE_SEQUENCE" \| "TRIGGER_RULE" \| "ENVIRONMENTAL_HABIT"/);
  assert.match(audit, /SCAFFOLD_ONLY/);
  assert.match(audit, /ENVIRONMENTAL_HABIT/);
  assert.match(audit, /TRIGGER_RULE/);
});

test("every practical rule carries causal and boundary fields", () => {
  for (const field of ["triggerRu", "defaultRu", "whyRu", "amplifiersRu", "reversalsRu", "transferCueRu", "sourceRefs", "skillIds"]) {
    assert.match(memory, new RegExp(field));
  }
});

test("high-EV contrast triggers are represented", () => {
  for (const token of ["OPEN_SIZE", "ORIGIN_RANGE", "PLAYERS_BEHIND", "BOARD_OWNERSHIP", "RUNOUT_SHIFT", "BLOCKER_ROLE"]) {
    assert.match(memory, new RegExp(token));
  }
});

test("rule library avoids universal chart-frequency memory obligations", () => {
  assert.doesNotMatch(memory, /open exactly \d+%/i);
  assert.doesNotMatch(memory, /call exactly \d+%/i);
  assert.doesNotMatch(memory, /3-bet exactly \d+%/i);
  assert.doesNotMatch(memory, /always defend exactly/i);
});

test("runtime can retrieve rules by skill and trigger", () => {
  assert.match(memory, /practicalRulesForSkill/);
  assert.match(memory, /practicalRulesForTrigger/);
  assert.match(memory, /practicalEnvironmentalHabits/);
});
