import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { isOrdinaryLearnerDecision, practicalDecisions } from "../content/practical-mastery/index.ts";
import { practicalPresentedOptions } from "../lib/practical-option-presentation.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function materialPositionAlert(count, n, chance) {
  if (n < 12) return false;
  const rate = count / n;
  const standardError = Math.sqrt(chance * (1 - chance) / n);
  const z = standardError > 0 ? (rate - chance) / standardError : 0;
  return rate - chance >= 0.20 && z >= 3;
}

test("learner-visible option order preserves IDs and rotates on repeat presentation", () => {
  const ordinary = practicalDecisions.filter(isOrdinaryLearnerDecision);
  let exercised = 0;

  for (const decision of ordinary) {
    for (const [stage, options, correctId] of [
      ["action", decision.actionOptions, decision.correctActionId],
      ["reason", decision.reasonOptions, decision.correctReasonId],
    ]) {
      const sourceIds = options.map((option) => option.id);
      const first = practicalPresentedOptions(options, decision.id, stage, 0).map((option) => option.id);
      const repeat = practicalPresentedOptions(options, decision.id, stage, 1).map((option) => option.id);

      assert.deepEqual([...first].sort(), [...sourceIds].sort(), `${decision.id}/${stage}: option identity changed`);
      assert.deepEqual(options.map((option) => option.id), sourceIds, `${decision.id}/${stage}: source order was mutated`);
      assert.ok(first.includes(correctId), `${decision.id}/${stage}: correct option disappeared`);

      if (options.length > 1) {
        exercised += 1;
        assert.notDeepEqual(repeat, first, `${decision.id}/${stage}: repeat presentation kept the same positional cue`);
        assert.notEqual(repeat.indexOf(correctId), first.indexOf(correctId), `${decision.id}/${stage}: correct answer stayed in the same position on repeat`);
      }
    }
  }

  assert.ok(exercised >= 100, `expected broad option-order coverage, got ${exercised}`);
});

test("first learner-visible presentation has no material first-position shortcut", () => {
  const ordinary = practicalDecisions.filter(isOrdinaryLearnerDecision);
  let actionFirst = 0;
  let reasonFirst = 0;
  let jointFirst = 0;
  let actionChance = 0;
  let reasonChance = 0;
  let jointChance = 0;

  for (const decision of ordinary) {
    const action = practicalPresentedOptions(decision.actionOptions, decision.id, "action", 0);
    const reason = practicalPresentedOptions(decision.reasonOptions, decision.id, "reason", 0);
    actionFirst += Number(action[0]?.id === decision.correctActionId);
    reasonFirst += Number(reason[0]?.id === decision.correctReasonId);
    jointFirst += Number(action[0]?.id === decision.correctActionId && reason[0]?.id === decision.correctReasonId);
    actionChance += 1 / action.length;
    reasonChance += 1 / reason.length;
    jointChance += 1 / (action.length * reason.length);
  }

  const n = ordinary.length;
  assert.equal(materialPositionAlert(actionFirst, n, actionChance / n), false, "learner-visible action order exposes a material first-position shortcut");
  assert.equal(materialPositionAlert(reasonFirst, n, reasonChance / n), false, "learner-visible reason order exposes a material first-position shortcut");
  assert.equal(materialPositionAlert(jointFirst, n, jointChance / n), false, "learner-visible action+reason order exposes a material joint first-position shortcut");
});

test("both practical learner surfaces render presented options instead of authored source order", async () => {
  const [quickStart, integrated] = await Promise.all([
    readFile(path.join(root, "components/PracticalFirstJourneyExperience.tsx"), "utf8"),
    readFile(path.join(root, "components/PracticalIntegratedSessionExperience.tsx"), "utf8"),
  ]);

  for (const source of [quickStart, integrated]) {
    assert.match(source, /practicalPresentedOptions/);
    assert.match(source, /presentedActionOptions\.map/);
    assert.match(source, /presentedReasonOptions\.map/);
    assert.doesNotMatch(source, /decision\.actionOptions\.map/);
    assert.doesNotMatch(source, /decision\.reasonOptions\.map/);
  }
});
