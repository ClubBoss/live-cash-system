import assert from "node:assert/strict";
import test from "node:test";
import { preflopLiveExpansionDecisions } from "../content/practical-mastery/decisions-preflop-live-expansion";
import {
  practicalRuSystemicPreflopLivePf09DecisionPatches,
  applyPracticalRuSystemicPreflopLivePf09DecisionProjection,
} from "../content/practical-mastery/practical-ru-systemic-preflop-live-pf09-publication";

// PARALLEL STAGING PREPARATION TEST — validates the isolated PF-09 projection
// against cloned raw decisions only. It does NOT import the shared
// final-composition index (../content/practical-mastery) because this unit is
// not wired into it yet; that step belongs to the sole integration writer.

const decisionIds = [
  "PM-PF-09-101",
  "PM-PF-09-102",
  "PM-PF-09-103",
  "PM-PF-09-104",
  "PM-PF-09-105",
  "PM-PF-09-106",
  "PM-PF-09-107",
  "PM-PF-09-108",
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
  preflopLiveExpansionDecisions
    .filter((decision) => decisionIds.includes(decision.id))
    .map((decision) => [decision.id, decision]),
);

// Cloned raw decisions with the isolated projection applied directly — this is
// the "staged learner surface" this unit owns, independent of index.ts.
const stagedById = new Map(
  [...rawById.entries()].map(([id, decision]) => [
    id,
    applyPracticalRuSystemicPreflopLivePf09DecisionProjection(structuredClone(decision)),
  ]),
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

// Approved poker-native Latin notation carried over from the raw source and
// kept intentionally (position/stat shorthand already standard across the
// closed PF-01..PF-08 corpus): EV, IP, OOP, SPR, BB, SB, BTN.
function stripApprovedNotation(text) {
  return text.replace(/\b(?:EV|IP|OOP|SPR|BB|SB|BTN)\b/giu, "");
}

const sourceIdPattern = /(?:FTGU-E\d+|LCM-\d+|SLC-M\d+-L\d+|EXT-[A-Z0-9-]+|\bSLC\b|\bFTGU\b)/u;

// "3-bet"/"4-bet" (and their Cyrillic "3-бет"/"4-бет" forms) contain digits
// that are part of poker action terminology, not quantitative semantics
// (percentages, stack depths, bet sizes, thresholds). They must be excluded
// before extracting numeric tokens so this false-positive class cannot mask
// a real numeric-semantics regression. See task instructions section 6.
function numericTokens(text) {
  const withoutNonQuantitativeNotation = text
    .replace(/(?:FTGU-E\d+|LCM-\d+|SLC-M\d+-L\d+|EXT-[A-Z0-9-]+)/gu, "")
    .replace(/\b[34]-bet(?:-or-fold)?\b/giu, "")
    .replace(/\b[34]-бет\w*/giu, "");
  return withoutNonQuantitativeNotation.match(/\d+(?:[.,]\d+)?%?/gu) ?? [];
}

function optionMachineIdentity(options) {
  return options.map((option) => ({
    id: option.id,
    misconception: option.misconception,
    textEn: option.textEn,
  }));
}

test("PF09 ALL_ACTIVE_FIELDS_CLASSIFIED=TRUE and REVIEW_COUNT=0", () => {
  assert.equal(rawById.size, 8);
  assert.equal(practicalRuSystemicPreflopLivePf09DecisionPatches.size, 8);

  const patches = decisionIds.map((id) => {
    const patch = practicalRuSystemicPreflopLivePf09DecisionPatches.get(id);
    assert.ok(patch, `missing PF-09 systemic preflop-live patch for ${id}`);
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

test("PF09 owns only its eight IDs and does not touch PF-06/07/08 territory", () => {
  assert.deepEqual([...practicalRuSystemicPreflopLivePf09DecisionPatches.keys()], decisionIds);
  for (const id of decisionIds) {
    assert.match(id, /^PM-PF-09-\d{3}$/, `${id} must stay within the PF-09 family`);
  }
});

test("PF09 ALL_FIX_ITEMS_REPAIRED=TRUE", () => {
  for (const id of decisionIds) {
    const staged = stagedById.get(id);
    const patch = practicalRuSystemicPreflopLivePf09DecisionPatches.get(id);
    assert.ok(staged, `missing staged ${id}`);
    assert.ok(patch, `missing PF-09 systemic preflop-live patch ${id}`);

    for (const path of patchPaths(patch)) {
      const expected = path.startsWith("action:")
        ? patch.actionOptions[path.slice("action:".length)]
        : path.startsWith("reason:")
          ? patch.reasonOptions[path.slice("reason:".length)]
          : patch[path];
      assert.equal(fieldValue(staged, path), expected, `${id} ${path}`);
    }
  }
});

test("PF09 CONFIRMED_RU_HYBRID_DEFECTS_REMAINING=0", () => {
  for (const id of decisionIds) {
    const staged = stagedById.get(id);
    assert.ok(staged, `missing staged ${id}`);
    for (const [field, text] of learnerRuFields(staged)) {
      assert.doesNotMatch(stripApprovedNotation(text), /[A-Za-z]/u, `${id} ${field}: ${text}`);
    }
  }
});

test("PF09 LEARNER_VISIBLE_SOURCE_ID_RESIDUAL=0", () => {
  for (const id of decisionIds) {
    const staged = stagedById.get(id);
    assert.ok(staged, `missing staged ${id}`);
    for (const [field, text] of learnerRuFields(staged)) {
      assert.doesNotMatch(text, sourceIdPattern, `${id} ${field}: ${text}`);
    }
  }
});

test("PF09 NUMERIC_SEMANTICS_CHANGED=FALSE", () => {
  for (const id of decisionIds) {
    const raw = rawById.get(id);
    const staged = stagedById.get(id);
    assert.ok(raw && staged);
    for (const path of fieldPaths) {
      assert.deepEqual(numericTokens(fieldValue(staged, path)), numericTokens(fieldValue(raw, path)), `${id} ${path}`);
    }
  }
});

test("PF09 semantic firewall preserves scoring, source, option, EN, misconception, changed-variable and curriculum identity", () => {
  for (const id of decisionIds) {
    const raw = rawById.get(id);
    const staged = stagedById.get(id);
    assert.ok(raw, `missing raw ${id}`);
    assert.ok(staged, `missing staged ${id}`);

    assert.equal(staged.id, raw.id, `${id} decision id`);
    assert.equal(staged.correctActionId, raw.correctActionId, `${id} correct action`);
    assert.equal(staged.correctReasonId, raw.correctReasonId, `${id} correct reason`);
    assert.deepEqual(staged.sourceRefs, raw.sourceRefs, `${id} source refs`);
    assert.deepEqual(staged.changedVariables, raw.changedVariables, `${id} changed variables`);
    assert.deepEqual(optionMachineIdentity(staged.actionOptions), optionMachineIdentity(raw.actionOptions), `${id} action identity`);
    assert.deepEqual(optionMachineIdentity(staged.reasonOptions), optionMachineIdentity(raw.reasonOptions), `${id} reason identity`);
    assert.equal(staged.cueEn, raw.cueEn, `${id} cue EN`);
    assert.equal(staged.questionEn, raw.questionEn, `${id} question EN`);
    assert.equal(staged.explanationEn, raw.explanationEn, `${id} explanation EN`);
    assert.equal(staged.skillId, raw.skillId, `${id} skill id`);
    assert.equal(staged.kind, raw.kind, `${id} decision kind`);
    assert.equal(staged.targetSeconds, raw.targetSeconds, `${id} target seconds`);
    assert.deepEqual(staged.assumptions, raw.assumptions, `${id} assumptions`);
  }
});

test("PF09 projection is a pure per-decision patch: unmapped IDs pass through unchanged", () => {
  const untouched = preflopLiveExpansionDecisions.find((decision) => decision.id === "PM-PF-10-101");
  assert.ok(untouched, "expected a PF-10 decision to exist in the shared raw source");
  const projected = applyPracticalRuSystemicPreflopLivePf09DecisionProjection(structuredClone(untouched));
  assert.deepEqual(projected, untouched, "PF-09 projection must not alter PF-10 decisions");
});
