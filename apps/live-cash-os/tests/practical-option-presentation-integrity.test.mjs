import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { isOrdinaryLearnerDecision, practicalDecisions } from "../content/practical-mastery/index.ts";
import { practicalPresentedDecisionOptions, practicalPresentedOptions } from "../lib/practical-option-presentation.ts";

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

test("all repeatable practical learner surfaces render presented options instead of authored source order", async () => {
  const [quickStart, integrated, perceptual] = await Promise.all([
    readFile(path.join(root, "components/PracticalFirstJourneyExperience.tsx"), "utf8"),
    readFile(path.join(root, "components/PracticalIntegratedSessionExperience.tsx"), "utf8"),
    readFile(path.join(root, "components/PracticalPerceptualExperience.tsx"), "utf8"),
  ]);

  for (const source of [quickStart, integrated, perceptual]) {
    assert.match(source, /practicalPresentedDecisionOptions/);
    assert.match(source, /presentedActionOptions\.map/);
    assert.match(source, /presentedReasonOptions\.map/);
    assert.doesNotMatch(source, /decision\.actionOptions\.map/);
    assert.doesNotMatch(source, /decision\.reasonOptions\.map/);
  }
});


test("length presentation repair is decision-scoped and preserves canonical option identity/source text", () => {
  const untouched = practicalDecisions.find((candidate) => candidate.id === "PM-PF-09-101");
  assert.ok(untouched, "PM-PF-09-101 missing");
  const untouchedBefore = JSON.stringify({ actionOptions: untouched.actionOptions, reasonOptions: untouched.reasonOptions });
  const untouchedCanonical = untouched.reasonOptions.find((option) => option.id === untouched.correctReasonId);
  const untouchedPresented = practicalPresentedDecisionOptions(untouched, "reason", 0).find((option) => option.id === untouched.correctReasonId);
  assert.ok(untouchedCanonical && untouchedPresented);
  assert.equal(untouchedPresented.textRu, untouchedCanonical.textRu, "unreviewed PF09 RU reason must remain canonical");
  assert.equal(untouchedPresented.textEn, untouchedCanonical.textEn, "unreviewed PF09 EN reason must remain canonical");
  assert.equal(JSON.stringify({ actionOptions: untouched.actionOptions, reasonOptions: untouched.reasonOptions }), untouchedBefore,
    "untouched presentation mutated canonical PF09 options");

  const repaired = practicalDecisions.find((candidate) => candidate.id === "PM-B4-PF06-101");
  assert.ok(repaired, "PM-B4-PF06-101 missing");
  const repairedBefore = JSON.stringify({ actionOptions: repaired.actionOptions, reasonOptions: repaired.reasonOptions });
  const canonicalReason = repaired.reasonOptions.find((option) => option.id === repaired.correctReasonId);
  const presented = practicalPresentedDecisionOptions(repaired, "reason", 0);
  const presentedReason = presented.find((option) => option.id === repaired.correctReasonId);
  assert.ok(canonicalReason && presentedReason);
  assert.equal(
    canonicalReason.textEn,
    "At depth, OOP realization and reverse-implied exposure grow; 3-bet shape cannot be copied mechanically from 100bb.",
  );
  assert.equal(presentedReason.textEn, "At 250–300bb, playing out of position makes equity harder to realize and dominated branches more expensive; marginal 100bb 3-bets therefore lose EV and the 3-bet structure must become more selective.");
  assert.deepEqual([...presented.map((option) => option.id)].sort(), [...repaired.reasonOptions.map((option) => option.id)].sort());
  for (const option of repaired.reasonOptions.filter((option) => option.id !== repaired.correctReasonId)) {
    const projected = presented.find((candidate) => candidate.id === option.id);
    assert.deepEqual(projected, option, `${repaired.id}/${option.id}: distractor identity drifted`);
  }
  assert.equal(JSON.stringify({ actionOptions: repaired.actionOptions, reasonOptions: repaired.reasonOptions }), repairedBefore,
    "presentation mutated canonical repaired options");
  assert.equal(repaired.correctReasonId, canonicalReason.id, "correct reason identity drifted");
});
