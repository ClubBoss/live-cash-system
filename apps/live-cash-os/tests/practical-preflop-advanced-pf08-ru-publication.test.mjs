import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  practicalAnchors,
  practicalDecisionById,
  practicalDecisions,
} from "../content/practical-mastery";
import { preflopAdvancedExpansionDecisions } from "../content/practical-mastery/decisions-preflop-advanced-expansion";
import { practicalRuSystemicPreflopAdvancedPf07DecisionPatches } from "../content/practical-mastery/practical-ru-systemic-preflop-advanced-pf07-publication";
import { practicalRuSystemicPreflopAdvancedPf08DecisionPatches } from "../content/practical-mastery/practical-ru-systemic-preflop-advanced-pf08-publication";

const decisionIds = [
  "PM-PF-08-101",
  "PM-PF-08-102",
  "PM-PF-08-103",
  "PM-PF-08-104",
  "PM-PF-08-105",
  "PM-PF-08-106",
  "PM-PF-08-107",
  "PM-PF-08-108",
];

const closedPf07Ids = [
  "PM-PF-07-101",
  "PM-PF-07-102",
  "PM-PF-07-103",
  "PM-PF-07-104",
  "PM-PF-07-105",
  "PM-PF-07-106",
  "PM-PF-07-107",
  "PM-PF-07-108",
];

const expectedSourceRefs = new Map(decisionIds.map((id) => [id, ["FTGU-E18"]]));
const expectedSourceBlob = "7562a026edd9ebdd830d08357b1dfafbe9a7fe16";
const expectedFinalCompositionDigest = "bfd8dd8569b6c07fdb782927deec996f0c209fd6d884938f37ce2ab089898403";

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
    .replace(/(?:FTGU-E\d+|LCM-\d+|EXT-[A-Z0-9-]|\bE\d+\b)/gu, "")
    .replace(/\b(?:3|4|5)-?bet(?:s|ting|-or-fold)?\b/giu, "")
    .replace(/(?:3|4|5)-?бет(?:ы|ов|ам|ами|ах|а|у|ом|е)?/giu, "");
  return withoutNonQuantitativeNotation.match(/\d+(?:[.,]\d+)?%?/gu) ?? [];
}

function optionMachineIdentity(options) {
  return options.map((option) => ({
    id: option.id,
    misconception: option.misconception,
    textEn: option.textEn,
  }));
}

function gitBlobSha(buffer) {
  const header = Buffer.from(`blob ${buffer.length}\0`, "utf8");
  return createHash("sha1").update(header).update(buffer).digest("hex");
}

function finalCompositionDigest() {
  const normalized = JSON.stringify({
    anchors: practicalAnchors.map((anchor) => ({
      id: anchor.id,
      promptRu: anchor.promptRu,
      answerRu: anchor.answerRu,
      rationaleRu: anchor.rationaleRu,
      sourceRefs: anchor.sourceRefs,
    })),
    decisions: practicalDecisions.map((decision) => ({
      id: decision.id,
      cueRu: decision.cueRu,
      questionRu: decision.questionRu,
      actionOptions: decision.actionOptions.map((option) => ({
        id: option.id,
        textRu: option.textRu,
      })),
      reasonOptions: decision.reasonOptions.map((option) => ({
        id: option.id,
        textRu: option.textRu,
      })),
      explanationRu: decision.explanationRu,
      sourceRefs: decision.sourceRefs,
      changedVariables: decision.changedVariables,
    })),
  });
  return createHash("sha256").update(normalized, "utf8").digest("hex");
}

test("PF08 source authority stays locked to the manager-verified FTGU-E18 blob", async () => {
  const source = await readFile(new URL("../../../sources/ftgu/transcripts/FTGU_E18_polar_4betting.md", import.meta.url));
  assert.equal(gitBlobSha(source), expectedSourceBlob);
});

test("PF08 UNIT_ALL_ACTIVE_FIELDS_CLASSIFIED=TRUE and UNIT_REVIEW_COUNT=0", () => {
  assert.equal(rawById.size, 8);
  assert.equal(practicalRuSystemicPreflopAdvancedPf08DecisionPatches.size, 8);

  const patches = decisionIds.map((id) => {
    const patch = practicalRuSystemicPreflopAdvancedPf08DecisionPatches.get(id);
    assert.ok(patch, `missing PF-08 patch for ${id}`);
    return [id, patch];
  });
  const fixFields = patches.reduce((sum, [, patch]) => sum + patchPaths(patch).length, 0);
  const unpatched = patches.flatMap(([id, patch]) => {
    const fixed = new Set(patchPaths(patch));
    return fieldPaths.filter((path) => !fixed.has(path)).map((path) => `${id}:${path}`);
  });

  assert.equal(decisionIds.length * fieldPaths.length, 72);
  assert.equal(fixFields, 72);
  assert.deepEqual(unpatched, []);
});

test("PF08 closed PF-07 map remains frozen by exact IDs and owned paths", () => {
  assert.deepEqual([...practicalRuSystemicPreflopAdvancedPf07DecisionPatches.keys()], closedPf07Ids);
  for (const id of closedPf07Ids) {
    const patch = practicalRuSystemicPreflopAdvancedPf07DecisionPatches.get(id);
    assert.ok(patch, `missing closed PF-07 patch ${id}`);
    assert.deepEqual(patchPaths(patch), fieldPaths, `${id} closed owned paths changed`);
  }
  assert.deepEqual([...practicalRuSystemicPreflopAdvancedPf08DecisionPatches.keys()], decisionIds);
});

test("PF08 UNIT_ALL_FIX_ITEMS_REPAIRED=TRUE", () => {
  for (const id of decisionIds) {
    const finalDecision = practicalDecisionById.get(id);
    const patch = practicalRuSystemicPreflopAdvancedPf08DecisionPatches.get(id);
    assert.ok(finalDecision, `missing final-composed ${id}`);
    assert.ok(patch, `missing PF-08 patch ${id}`);
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

test("PF08 UNIT_CONFIRMED_RU_HYBRID_DEFECTS_REMAINING=0", () => {
  for (const id of decisionIds) {
    const decision = practicalDecisionById.get(id);
    assert.ok(decision, `missing final-composed ${id}`);
    for (const [field, text] of learnerRuFields(decision)) {
      assert.doesNotMatch(stripApprovedNotation(text), /[A-Za-z]/u, `${id} ${field}: ${text}`);
    }
  }
});

test("PF08 LEARNER_VISIBLE_SOURCE_ID_RESIDUAL=0", () => {
  const sourceId = /(?:FTGU-E\d+|LCM-\d+|EXT-[A-Z0-9-]+)/u;
  for (const id of decisionIds) {
    const decision = practicalDecisionById.get(id);
    assert.ok(decision, `missing final-composed ${id}`);
    for (const [field, text] of learnerRuFields(decision)) {
      assert.doesNotMatch(text, sourceId, `${id} ${field}: ${text}`);
    }
  }
});

test("PF08 NUMERIC_SEMANTICS_CHANGED=FALSE", () => {
  for (const id of decisionIds) {
    const raw = rawById.get(id);
    const finalDecision = practicalDecisionById.get(id);
    assert.ok(raw && finalDecision);
    for (const path of fieldPaths) {
      assert.deepEqual(numericTokens(fieldValue(finalDecision, path)), numericTokens(fieldValue(raw, path)), `${id} ${path}`);
    }
  }
});

test("PF08 semantic firewall preserves scoring, sources, option, EN, misconception and changed-variable identity", () => {
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

test("PF08 final composition digest is frozen to the authored corpus", () => {
  assert.equal(finalCompositionDigest(), expectedFinalCompositionDigest);
});
