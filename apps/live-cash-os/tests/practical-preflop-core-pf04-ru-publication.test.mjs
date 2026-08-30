import assert from "node:assert/strict";
import test from "node:test";
import { practicalDecisionById } from "../content/practical-mastery";
import { preflopCoreExpansionDecisions } from "../content/practical-mastery/decisions-preflop-core-expansion";
import {
  practicalRuSystemicPreflopCoreDecisionPatches,
  practicalRuSystemicPreflopCorePf03DecisionPatches,
  practicalRuSystemicPreflopCorePf04DecisionPatches,
} from "../content/practical-mastery/practical-ru-systemic-preflop-core-publication";

const decisionIds = [
  "PM-PF-04-101",
  "PM-PF-04-102",
  "PM-PF-04-103",
  "PM-PF-04-104",
  "PM-PF-04-105",
  "PM-PF-04-106",
  "PM-PF-04-107",
];

const fieldPaths = [
  "cueRu",
  "questionRu",
  "explanationRu",
  "action:a",
  "action:b",
  "action:c",
  "reason:r1",
  "reason:r2",
  "reason:r3",
];

const rawById = new Map(
  preflopCoreExpansionDecisions
    .filter((decision) => decisionIds.includes(decision.id))
    .map((decision) => [decision.id, decision]),
);

function patchPaths(patch) {
  const paths = [];
  if (patch.cueRu !== undefined) paths.push("cueRu");
  if (patch.questionRu !== undefined) paths.push("questionRu");
  if (patch.explanationRu !== undefined) paths.push("explanationRu");
  for (const id of Object.keys(patch.actionOptions ?? {})) paths.push(`action:${id}`);
  for (const id of Object.keys(patch.reasonOptions ?? {})) paths.push(`reason:${id}`);
  return paths;
}

function fieldValue(decision, path) {
  if (path === "cueRu" || path === "questionRu" || path === "explanationRu") return decision[path];
  const [group, id] = path.split(":");
  const options = group === "action" ? decision.actionOptions : decision.reasonOptions;
  return options.find((option) => option.id === id)?.textRu;
}

function learnerRuFields(decision) {
  return [
    ["cueRu", decision.cueRu],
    ["questionRu", decision.questionRu],
    ["explanationRu", decision.explanationRu],
    ...decision.actionOptions.map((option) => [`action:${option.id}`, option.textRu]),
    ...decision.reasonOptions.map((option) => [`reason:${option.id}`, option.textRu]),
  ];
}

function stripApprovedNotation(text) {
  return text.replace(/\b(?:EV|IP|OOP)\b/giu, "");
}

function numericTokens(text) {
  return text.match(/\d+(?:[.,]\d+)?%?/gu) ?? [];
}

function optionMachineIdentity(options) {
  return options.map((option) => ({
    id: option.id,
    misconception: option.misconception,
    textEn: option.textEn,
  }));
}

test("PF04 UNIT_ALL_ACTIVE_FIELDS_CLASSIFIED=TRUE and UNIT_REVIEW_COUNT=0", () => {
  assert.equal(rawById.size, 7);
  assert.equal(practicalRuSystemicPreflopCorePf04DecisionPatches.size, 7);

  const patches = decisionIds.map((id) => {
    const patch = practicalRuSystemicPreflopCorePf04DecisionPatches.get(id);
    assert.ok(patch, `missing PF-04 systemic preflop-core patch for ${id}`);
    return [id, patch];
  });

  const fixFields = patches.reduce((sum, [, patch]) => sum + patchPaths(patch).length, 0);
  const activeFields = decisionIds.length * fieldPaths.length;
  const unpatched = patches.flatMap(([id, patch]) => {
    const fixed = new Set(patchPaths(patch));
    return fieldPaths.filter((path) => !fixed.has(path)).map((path) => `${id}:${path}`);
  });

  assert.equal(activeFields, 63);
  assert.equal(fixFields, 63);
  assert.deepEqual(unpatched, []);
});

test("PF04 closed-unit maps remain frozen and PF-04 owns only its seven IDs", () => {
  assert.equal(practicalRuSystemicPreflopCoreDecisionPatches.size, 7);
  assert.equal(practicalRuSystemicPreflopCorePf03DecisionPatches.size, 7);
  assert.deepEqual([...practicalRuSystemicPreflopCorePf04DecisionPatches.keys()], decisionIds);
});

test("PF04 UNIT_ALL_FIX_ITEMS_REPAIRED=TRUE", () => {
  for (const id of decisionIds) {
    const finalDecision = practicalDecisionById.get(id);
    const patch = practicalRuSystemicPreflopCorePf04DecisionPatches.get(id);
    assert.ok(finalDecision, `missing final-composed ${id}`);
    assert.ok(patch, `missing PF-04 systemic preflop-core patch ${id}`);

    for (const path of patchPaths(patch)) {
      const expected = path.startsWith("action:")
        ? patch.actionOptions[path.slice("action:".length)]
        : path.startsWith("reason:")
          ? patch.reasonOptions[path.slice("reason:".length)]
          : patch[path];
      assert.equal(fieldValue(finalDecision, path), expected, `${id} ${path}`);
    }
  }
});

test("PF04 UNIT_CONFIRMED_RU_HYBRID_DEFECTS_REMAINING=0", () => {
  for (const id of decisionIds) {
    const decision = practicalDecisionById.get(id);
    assert.ok(decision, `missing final-composed ${id}`);
    for (const [field, text] of learnerRuFields(decision)) {
      assert.doesNotMatch(stripApprovedNotation(text), /[A-Za-z]/u, `${id} ${field}: ${text}`);
    }
  }
});

test("PF04 LEARNER_VISIBLE_SOURCE_ID_RESIDUAL=0", () => {
  const sourceId = /(?:FTGU-E\d+|LCM-\d+|EXT-[A-Z0-9-]+)/u;
  for (const id of decisionIds) {
    const decision = practicalDecisionById.get(id);
    assert.ok(decision, `missing final-composed ${id}`);
    for (const [field, text] of learnerRuFields(decision)) {
      assert.doesNotMatch(text, sourceId, `${id} ${field}: ${text}`);
    }
  }
});

test("PF04 NUMERIC_SEMANTICS_CHANGED=FALSE", () => {
  for (const id of decisionIds) {
    const raw = rawById.get(id);
    const finalDecision = practicalDecisionById.get(id);
    assert.ok(raw && finalDecision);
    for (const path of fieldPaths) {
      assert.deepEqual(numericTokens(fieldValue(finalDecision, path)), numericTokens(fieldValue(raw, path)), `${id} ${path}`);
    }
  }
});

test("PF04 semantic firewall preserves scoring, source, option, EN, misconception and changed-variable identity", () => {
  for (const id of decisionIds) {
    const raw = rawById.get(id);
    const finalDecision = practicalDecisionById.get(id);
    assert.ok(raw, `missing raw ${id}`);
    assert.ok(finalDecision, `missing final-composed ${id}`);

    assert.equal(finalDecision.id, raw.id, `${id} decision id`);
    assert.equal(finalDecision.correctActionId, raw.correctActionId, `${id} correct action`);
    assert.equal(finalDecision.correctReasonId, raw.correctReasonId, `${id} correct reason`);
    assert.deepEqual(finalDecision.sourceRefs, raw.sourceRefs, `${id} source refs`);
    assert.deepEqual(finalDecision.sourceRefs, ["FTGU-E05"], `${id} frozen source family`);
    assert.deepEqual(finalDecision.changedVariables, raw.changedVariables, `${id} changed variables`);
    assert.deepEqual(optionMachineIdentity(finalDecision.actionOptions), optionMachineIdentity(raw.actionOptions), `${id} action identity`);
    assert.deepEqual(optionMachineIdentity(finalDecision.reasonOptions), optionMachineIdentity(raw.reasonOptions), `${id} reason identity`);
    assert.equal(finalDecision.cueEn, raw.cueEn, `${id} cue EN`);
    assert.equal(finalDecision.questionEn, raw.questionEn, `${id} question EN`);
    assert.equal(finalDecision.explanationEn, raw.explanationEn, `${id} explanation EN`);
    assert.equal(finalDecision.skillId, raw.skillId, `${id} skill id`);
    assert.equal(finalDecision.kind, raw.kind, `${id} decision kind`);
    assert.equal(finalDecision.targetSeconds, raw.targetSeconds, `${id} target seconds`);
    assert.deepEqual(finalDecision.assumptions, raw.assumptions, `${id} assumptions`);
  }
});