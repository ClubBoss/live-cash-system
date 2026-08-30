import assert from "node:assert/strict";
import test from "node:test";
import { practicalDecisionById } from "../content/practical-mastery";
import { preflopAdvancedExpansionDecisions } from "../content/practical-mastery/decisions-preflop-advanced-expansion";
import { practicalRuSystemicPreflopCorePf05DecisionPatches } from "../content/practical-mastery/practical-ru-systemic-preflop-core-pf05-publication";
import { practicalRuSystemicPreflopAdvancedPf06DecisionPatches } from "../content/practical-mastery/practical-ru-systemic-preflop-advanced-pf06-publication";

const decisionIds = [
  "PM-PF-06-101",
  "PM-PF-06-102",
  "PM-PF-06-103",
  "PM-PF-06-104",
  "PM-PF-06-105",
  "PM-PF-06-106",
  "PM-PF-06-107",
  "PM-PF-06-108",
];

const expectedSourceRefs = new Map([
  ["PM-PF-06-101", ["FTGU-E15"]],
  ["PM-PF-06-102", ["FTGU-E15"]],
  ["PM-PF-06-103", ["FTGU-E16"]],
  ["PM-PF-06-104", ["FTGU-E15"]],
  ["PM-PF-06-105", ["FTGU-E16"]],
  ["PM-PF-06-106", ["FTGU-E15"]],
  ["PM-PF-06-107", ["FTGU-E15"]],
  ["PM-PF-06-108", ["FTGU-E16"]],
]);

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
  preflopAdvancedExpansionDecisions
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
  return text.replace(/\b(?:EV|IP|OOP|SPR)\b/giu, "");
}

function numericTokens(text) {
  const withoutNonQuantitativeNotation = text
    .replace(/(?:FTGU-E\d+|LCM-\d+|EXT-[A-Z0-9-]+)/gu, "")
    .replace(/\b3-bet(?:-or-fold)?\b/giu, "")
    .replace(/3-бет/giu, "");
  return withoutNonQuantitativeNotation.match(/\d+(?:[.,]\d+)?%?/gu) ?? [];
}

function optionMachineIdentity(options) {
  return options.map((option) => ({
    id: option.id,
    misconception: option.misconception,
    textEn: option.textEn,
  }));
}

test("PF06 UNIT_ALL_ACTIVE_FIELDS_CLASSIFIED=TRUE and UNIT_REVIEW_COUNT=0", () => {
  assert.equal(rawById.size, 8);
  assert.equal(practicalRuSystemicPreflopAdvancedPf06DecisionPatches.size, 8);

  const patches = decisionIds.map((id) => {
    const patch = practicalRuSystemicPreflopAdvancedPf06DecisionPatches.get(id);
    assert.ok(patch, `missing PF-06 patch for ${id}`);
    return [id, patch];
  });

  const fixFields = patches.reduce((sum, [, patch]) => sum + patchPaths(patch).length, 0);
  const activeFields = decisionIds.length * fieldPaths.length;
  const unpatched = patches.flatMap(([id, patch]) => {
    const fixed = new Set(patchPaths(patch));
    return fieldPaths.filter((path) => !fixed.has(path)).map((path) => `${id}:${path}`);
  });

  assert.equal(activeFields, 72);
  assert.equal(fixFields, 72);
  assert.deepEqual(unpatched, []);
});

test("PF06 closed PF-05 map remains frozen and PF-06 owns only its eight IDs", () => {
  assert.equal(practicalRuSystemicPreflopCorePf05DecisionPatches.size, 7);
  assert.deepEqual([...practicalRuSystemicPreflopAdvancedPf06DecisionPatches.keys()], decisionIds);
});

test("PF06 UNIT_ALL_FIX_ITEMS_REPAIRED=TRUE", () => {
  for (const id of decisionIds) {
    const finalDecision = practicalDecisionById.get(id);
    const patch = practicalRuSystemicPreflopAdvancedPf06DecisionPatches.get(id);
    assert.ok(finalDecision, `missing final-composed ${id}`);
    assert.ok(patch, `missing PF-06 patch ${id}`);

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

test("PF06 UNIT_CONFIRMED_RU_HYBRID_DEFECTS_REMAINING=0", () => {
  for (const id of decisionIds) {
    const decision = practicalDecisionById.get(id);
    assert.ok(decision, `missing final-composed ${id}`);
    for (const [field, text] of learnerRuFields(decision)) {
      assert.doesNotMatch(stripApprovedNotation(text), /[A-Za-z]/u, `${id} ${field}: ${text}`);
    }
  }
});

test("PF06 LEARNER_VISIBLE_SOURCE_ID_RESIDUAL=0", () => {
  const sourceId = /(?:FTGU-E\d+|LCM-\d+|EXT-[A-Z0-9-]+)/u;
  for (const id of decisionIds) {
    const decision = practicalDecisionById.get(id);
    assert.ok(decision, `missing final-composed ${id}`);
    for (const [field, text] of learnerRuFields(decision)) {
      assert.doesNotMatch(text, sourceId, `${id} ${field}: ${text}`);
    }
  }
});

test("PF06 NUMERIC_SEMANTICS_CHANGED=FALSE", () => {
  for (const id of decisionIds) {
    const raw = rawById.get(id);
    const finalDecision = practicalDecisionById.get(id);
    assert.ok(raw && finalDecision);
    for (const path of fieldPaths) {
      assert.deepEqual(numericTokens(fieldValue(finalDecision, path)), numericTokens(fieldValue(raw, path)), `${id} ${path}`);
    }
  }
});

test("PF06 semantic firewall preserves scoring, sources, option, EN, misconception and changed-variable identity", () => {
  for (const id of decisionIds) {
    const raw = rawById.get(id);
    const finalDecision = practicalDecisionById.get(id);
    assert.ok(raw, `missing raw ${id}`);
    assert.ok(finalDecision, `missing final-composed ${id}`);

    assert.equal(finalDecision.id, raw.id, `${id} decision id`);
    assert.equal(finalDecision.correctActionId, raw.correctActionId, `${id} correct action`);
    assert.equal(finalDecision.correctReasonId, raw.correctReasonId, `${id} correct reason`);
    assert.deepEqual(finalDecision.sourceRefs, raw.sourceRefs, `${id} source refs`);
    assert.deepEqual(finalDecision.sourceRefs, expectedSourceRefs.get(id), `${id} frozen source family`);
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
