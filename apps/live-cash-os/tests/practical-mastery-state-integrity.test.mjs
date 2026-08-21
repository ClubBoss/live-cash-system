import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const core = await readFile(path.join(root, "lib/practical-mastery-core.ts"), "utf8");

test("practical mastery keeps evidence stages sequential and explicit", () => {
  for (const token of [
    "conceptTaught",
    "recognitionCorrect",
    "directDecisionCorrect",
    "changedCorrect",
    "boundaryCorrect",
    "delayedRetrievalPassed",
    "realHandTransferReviewed",
  ]) assert.match(core, new RegExp(token));

  assert.match(core, /if \(!progress\.conceptTaught\) return "SOURCE_SUPPORTED"/);
  assert.match(core, /if \(progress\.recognitionCorrect < 1\) return "CONCEPT_TAUGHT"/);
  assert.match(core, /if \(progress\.directDecisionCorrect < 1\) return "RECOGNITION_TRAINED"/);
  assert.match(core, /if \(progress\.changedCorrect \+ progress\.mixedCorrect < 1\) return "DECISION_TRAINED"/);
  assert.match(core, /if \(progress\.boundaryCorrect < 1\) return "CHANGED_NODE_TRANSFER"/);
});

test("immediate answers cannot grant delayed or real-hand evidence", () => {
  const recordSection = core.slice(core.indexOf("export function recordPracticalDecision"), core.indexOf("export function decisionsForPracticalSkill"));
  assert.doesNotMatch(recordSection, /delayedRetrievalPassed\s*=\s*true/);
  assert.doesNotMatch(recordSection, /realHandTransferReviewed\s*=\s*true/);
  assert.match(core, /if \(reviewed && nextProgress\.delayedRetrievalPassed\) nextProgress\.realHandTransferReviewed = true/);
});

test("legacy reset is explicit metadata rather than silent mastery migration", () => {
  assert.match(core, /resetFromLegacyAt/);
  assert.doesNotMatch(core, /contentCompleted/);
  assert.doesNotMatch(core, /FIELD_VALIDATED/);
});
