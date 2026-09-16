import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  practicalEvidenceRequirements,
} from "../lib/practical-mastery-core.ts";
import {
  practicalRepDepthTargetForSkill,
} from "../content/practical-mastery/rep-depth-policy.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("mastery floor and intensive rep-depth target are intentionally separate authorities", async () => {
  assert.deepEqual(practicalEvidenceRequirements(), {
    recognitionStimuli: 2,
    directDecisionStimuli: 3,
    transferStimuli: 2,
    boundaryStimuli: 1,
  });

  const intensive = practicalRepDepthTargetForSkill("PF-01");
  assert.equal(intensive.tier, "INTENSIVE");
  assert.deepEqual(
    {
      recognition: intensive.targetRecognition,
      direct: intensive.targetDirect,
      transfer: intensive.targetTransfer,
      boundary: intensive.targetBoundary,
    },
    { recognition: 3, direct: 4, transfer: 4, boundary: 1 },
  );

  const [core, adaptive] = await Promise.all([
    readFile(path.join(root, "lib/practical-mastery-core.ts"), "utf8"),
    readFile(path.join(root, "lib/practical-adaptive-repair.ts"), "utf8"),
  ]);

  assert.doesNotMatch(core, /practicalRepDepthTargetForSkill|rep-depth-policy/);
  assert.match(adaptive, /practicalRepDepthTargetForSkill/);
  assert.match(adaptive, /target\.tier==="INTENSIVE"/);
  assert.match(adaptive, /need:"UNDEREXPOSED"/);
});
