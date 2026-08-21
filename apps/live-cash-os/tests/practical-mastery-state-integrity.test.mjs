import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const core = await readFile(path.join(root, "lib/practical-mastery-core.ts"), "utf8");
const experience = await readFile(path.join(root, "components/PracticalMasteryExperience.tsx"), "utf8");

test("practical mastery requires multiple distinct stimuli before higher evidence stages", () => {
  for (const token of [
    "successfulDecisionIds",
    "MIN_RECOGNITION_STIMULI = 2",
    "MIN_DIRECT_DECISION_STIMULI = 3",
    "MIN_TRANSFER_STIMULI = 2",
    "MIN_BOUNDARY_STIMULI = 1",
  ]) assert.match(core, new RegExp(token));

  assert.match(core, /distinctSuccessfulByKind/);
  assert.match(core, /if \(recognition < MIN_RECOGNITION_STIMULI\) return "CONCEPT_TAUGHT"/);
  assert.match(core, /if \(direct < MIN_DIRECT_DECISION_STIMULI\) return "RECOGNITION_TRAINED"/);
  assert.match(core, /if \(transfer < MIN_TRANSFER_STIMULI\) return "DECISION_TRAINED"/);
  assert.match(core, /if \(boundary < MIN_BOUNDARY_STIMULI\) return "CHANGED_NODE_TRANSFER"/);
});

test("repeat-grinding one decision cannot inflate distinct evidence", () => {
  assert.match(core, /!nextProgress\.successfulDecisionIds\.includes\(decision\.id\)/);
  assert.match(core, /new Set\(/);
});

test("immediate answers cannot grant delayed or real-hand evidence", () => {
  const recordSection = core.slice(core.indexOf("export function recordPracticalDecision"), core.indexOf("export function decisionsForPracticalSkill"));
  assert.doesNotMatch(recordSection, /delayedRetrievalPassed\s*=\s*true/);
  assert.doesNotMatch(recordSection, /realHandTransferReviewed\s*=\s*true/);
  assert.match(core, /if \(reviewed && nextProgress\.delayedRetrievalPassed\) nextProgress\.realHandTransferReviewed = true/);
});

test("concept completion is preceded by learner-facing source-backed anchors", () => {
  assert.match(experience, /practicalAnchors/);
  assert.match(experience, /lessonAnchors\.map/);
  assert.match(experience, /UNDERSTAND THE MECHANISM FIRST/);
  assert.match(experience, /lessonAnchors\.length > 0/);
});

test("legacy reset is explicit and practical schema is independently versioned", () => {
  assert.match(core, /PRACTICAL_MASTERY_STATE_SCHEMA_VERSION = 2/);
  assert.match(core, /resetFromLegacyAt/);
  assert.doesNotMatch(core, /contentCompleted/);
  assert.doesNotMatch(core, /FIELD_VALIDATED/);
});
