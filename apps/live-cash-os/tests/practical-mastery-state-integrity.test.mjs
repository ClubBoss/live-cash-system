import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const core = await readFile(path.join(root, "lib/practical-mastery-core.ts"), "utf8");
const mapExperience = await readFile(path.join(root, "components/PracticalMasteryExperience.tsx"), "utf8");
const journeyExperience = await readFile(path.join(root, "components/PracticalFirstJourneyExperience.tsx"), "utf8");
const anchors = await readFile(path.join(root, "content/practical-mastery/index.ts"), "utf8");

test("practical mastery requires multiple distinct stimuli before higher evidence stages", () => {
  for (const token of ["successfulDecisionIds", "MIN_RECOGNITION_STIMULI = 2", "MIN_DIRECT_DECISION_STIMULI = 3", "MIN_TRANSFER_STIMULI = 2", "MIN_BOUNDARY_STIMULI = 1"]) assert.match(core, new RegExp(token));
  assert.match(core, /distinctSuccessfulByKind/);
  assert.match(core, /if \(recognition < MIN_RECOGNITION_STIMULI\) stage = "CONCEPT_TAUGHT"/);
  assert.match(core, /else if \(direct < MIN_DIRECT_DECISION_STIMULI\) stage = "RECOGNITION_TRAINED"/);
  assert.match(core, /else if \(transfer < MIN_TRANSFER_STIMULI\) stage = "DECISION_TRAINED"/);
  assert.match(core, /else if \(boundary < MIN_BOUNDARY_STIMULI\) stage = "CHANGED_NODE_TRANSFER"/);
});

test("repeat-grinding one decision cannot inflate distinct evidence", () => {
  assert.match(core, /!nextProgress\.successfulDecisionIds\.includes\(decision\.id\)/);
  assert.match(core, /new Set\(/);
});

test("corrected mistakes stop being unresolved repairs", () => {
  assert.match(core, /if \(nextProgress\.lastIncorrectDecisionId === decision\.id\) nextProgress\.lastIncorrectDecisionId = null/);
  assert.match(core, /latestAttemptsByDecision/);
  const repairSection = core.slice(core.indexOf("export function practicalRepairQueue"), core.indexOf("export function markDelayedPracticalRetrieval"));
  assert.match(repairSection, /attempt\.correct/);
  assert.match(repairSection, /isIntegrationDerivedSkill\(attempt\.skillId\)/);
  assert.match(repairSection, /isPracticalBridgeSkill\(attempt\.skillId\)/);
});

test("immediate answers cannot grant delayed or real-hand evidence", () => {
  const recordSection = core.slice(core.indexOf("export function recordPracticalDecision"), core.indexOf("export function decisionsForPracticalSkill"));
  assert.doesNotMatch(recordSection, /delayedRetrievalPassed\s*=\s*true/);
  assert.doesNotMatch(recordSection, /realHandTransferReviewed\s*=\s*true/);
  assert.match(core, /if \(reviewed && nextProgress\.delayedRetrievalPassed\) nextProgress\.realHandTransferReviewed = true/);
});

test("concept completion is preceded by learner-facing source-backed anchors in Quick Start", () => {
  assert.match(journeyExperience, /practicalAnchors/);
  assert.match(journeyExperience, /skillAnchors/);
  assert.match(journeyExperience, /anchor\.promptRu|anchor\.promptEn/);
  assert.match(journeyExperience, /markPracticalConceptTaught/);
  assert.match(journeyExperience, /МЕХАНИЗМ|MECHANISM/);
  assert.match(anchors, /practicalAnchors/);
  assert.doesNotMatch(mapExperience, /recordPracticalDecision/, "the progress map must not become a second scored-practice owner");
});

test("v3 practical evidence remains first-class while persistence moves into the reliable learner profile", () => {
  assert.match(core, /PRACTICAL_MASTERY_STATE_SCHEMA_VERSION = 3/);
  assert.match(core, /practical-mastery-v3/);
  assert.match(core, /retentionDaysPassed: number\[\]/);
  assert.match(core, /retentionDaysPassed: \[\]/);
  assert.match(core, /resetFromLegacyAt/);
  assert.match(mapExperience, /usePracticalProfileState/);
  assert.doesNotMatch(mapExperience, /live-cash-os:practical-mastery:v3/);
  assert.doesNotMatch(core, /contentCompleted/);
  assert.doesNotMatch(core, /FIELD_VALIDATED/);
});
