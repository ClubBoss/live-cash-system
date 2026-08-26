import assert from "node:assert/strict";
import test from "node:test";
import { practicalDecisionById } from "../content/practical-mastery/index.ts";
import { variationB3Decisions } from "../content/practical-mastery/decisions-variation-b3.ts";
import { balanceB3AssessmentOptions } from "../content/practical-mastery/b3-assessment-integrity.ts";
import { createPracticalMasteryState, recordPracticalDecision } from "../lib/practical-mastery-core.ts";

const balanced = balanceB3AssessmentOptions(variationB3Decisions);

function optionProjection(options) {
  return Object.fromEntries(options.map((option) => [option.id, {
    textRu: option.textRu,
    textEn: option.textEn,
    misconception: option.misconception ?? null,
  }]));
}

function correctSlot(decision, kind) {
  const options = kind === "action" ? decision.actionOptions : decision.reasonOptions;
  const correctId = kind === "action" ? decision.correctActionId : decision.correctReasonId;
  return options.findIndex((option) => option.id === correctId);
}

function rungGroups(decisions) {
  const seenBySkill = new Map();
  const groups = [[], [], [], []];
  for (const decision of decisions) {
    const rung = seenBySkill.get(decision.skillId) ?? 0;
    assert.ok(rung < 4, `${decision.skillId}: unexpected fifth B3 rung`);
    groups[rung].push(decision);
    seenBySkill.set(decision.skillId, rung + 1);
  }
  return groups;
}

function bestTemplateOnlyAccuracy(decisions, kind) {
  let correct = 0;
  for (const group of rungGroups(decisions)) {
    const counts = [0, 0, 0];
    for (const decision of group) counts[correctSlot(decision, kind)] += 1;
    correct += Math.max(...counts);
  }
  return correct / decisions.length;
}

test("B3 canonical set remains exactly 20 families x 4 reachable scored decisions", () => {
  assert.equal(variationB3Decisions.length, 80);
  assert.equal(new Set(variationB3Decisions.map((decision) => decision.skillId)).size, 20);
  for (const decision of variationB3Decisions) {
    const canonical = practicalDecisionById.get(decision.id);
    assert.ok(canonical, `${decision.id}: missing from canonical runtime`);
  }
});

test("B3 balancing preserves identities, poker semantics, and changed-node identity", () => {
  assert.equal(balanced.length, variationB3Decisions.length);
  for (let index = 0; index < variationB3Decisions.length; index += 1) {
    const before = variationB3Decisions[index];
    const after = balanced[index];
    assert.equal(after.id, before.id);
    assert.equal(after.skillId, before.skillId);
    assert.equal(after.kind, before.kind);
    assert.equal(after.correctActionId, before.correctActionId);
    assert.equal(after.correctReasonId, before.correctReasonId);
    assert.deepEqual(after.changedVariables, before.changedVariables);
    assert.deepEqual(after.sourceRefs, before.sourceRefs);
    assert.equal(after.cueRu, before.cueRu);
    assert.equal(after.cueEn, before.cueEn);
    assert.equal(after.questionRu, before.questionRu);
    assert.equal(after.questionEn, before.questionEn);
    assert.equal(after.explanationRu, before.explanationRu);
    assert.equal(after.explanationEn, before.explanationEn);
    assert.deepEqual(optionProjection(after.actionOptions), optionProjection(before.actionOptions));
    assert.deepEqual(optionProjection(after.reasonOptions), optionProjection(before.reasonOptions));
    assert.deepEqual(new Set(after.actionOptions.map((option) => option.id)), new Set(before.actionOptions.map((option) => option.id)));
    assert.deepEqual(new Set(after.reasonOptions.map((option) => option.id)), new Set(before.reasonOptions.map((option) => option.id)));
  }
});

test("template/rung identity no longer deterministically predicts action or reason slot", () => {
  const groups = rungGroups(balanced);
  for (const [rung, group] of groups.entries()) {
    assert.equal(group.length, 20, `rung ${rung}: expected one item per intensive family`);
    for (const kind of ["action", "reason"]) {
      const counts = [0, 0, 0];
      for (const decision of group) counts[correctSlot(decision, kind)] += 1;
      assert.ok(Math.max(...counts) <= 7, `rung ${rung} ${kind}: slot distribution ${counts.join("/")}`);
      assert.ok(Math.min(...counts) >= 6, `rung ${rung} ${kind}: slot distribution ${counts.join("/")}`);
    }
  }
  assert.ok(bestTemplateOnlyAccuracy(balanced, "action") <= 0.35);
  assert.ok(bestTemplateOnlyAccuracy(balanced, "reason") <= 0.35);
});

test("canonical B3 presentation uses the balanced deterministic option order", () => {
  for (const decision of balanced) {
    const canonical = practicalDecisionById.get(decision.id);
    assert.ok(canonical);
    assert.deepEqual(canonical.actionOptions.map((option) => option.id), decision.actionOptions.map((option) => option.id));
    assert.deepEqual(canonical.reasonOptions.map((option) => option.id), decision.reasonOptions.map((option) => option.id));
  }
});

test("genuinely correct B3 answers keep normal evidence semantics independent of option position", () => {
  const decision = balanced.find((candidate) => candidate.kind === "changed") ?? balanced[0];
  let state = createPracticalMasteryState(new Date("2026-08-27T00:00:00Z"));
  state = recordPracticalDecision(state, {
    decisionId: decision.id,
    actionId: decision.correctActionId,
    reasonId: decision.correctReasonId,
    confidence: 70,
    now: new Date("2026-08-27T00:01:00Z"),
  });
  assert.equal(state.attempts.length, 1);
  assert.equal(state.attempts[0].correct, true);
  assert.deepEqual(state.skills[decision.skillId].successfulDecisionIds, [decision.id]);
  assert.equal(state.skills[decision.skillId].changedCorrect, decision.kind === "changed" ? 1 : 0);

  state = recordPracticalDecision(state, {
    decisionId: decision.id,
    actionId: decision.correctActionId,
    reasonId: decision.correctReasonId,
    confidence: 70,
    now: new Date("2026-08-27T00:02:00Z"),
  });
  assert.equal(state.attempts.length, 2);
  assert.deepEqual(state.skills[decision.skillId].successfulDecisionIds, [decision.id], "repeat must not create distinct-stimulus inflation");
});
