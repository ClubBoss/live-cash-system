import assert from "node:assert/strict";
import test from "node:test";
import { blindDefenceExpansionDecisions } from "../content/practical-mastery/decisions-blind-defence-expansion";
import { foundationPreflopBlindDecisions } from "../content/practical-mastery/decisions-w1-w3";
import { preflopAndBlindAnchors } from "../content/practical-mastery/anchors-w2-w3";
import { practicalSourceGaps } from "../content/practical-mastery/source-gaps";
import { executableGateRepairDecisions } from "../content/practical-mastery/decisions-executable-gate-repair";
import { sourceClosureB1Decisions } from "../content/practical-mastery/decisions-source-closure-b1";
import {
  practicalRuSystemicBlindDefenceDecisionPatches,
  practicalRuSystemicBlindDefenceAnchorPatches,
  applyPracticalRuSystemicBlindDefenceDecisionProjection,
  applyPracticalRuSystemicBlindDefenceAnchorProjection,
} from "../content/practical-mastery/practical-ru-systemic-blind-defence-publication";

// This staging unit is prepared in isolation and never imports the final
// index.ts pipeline: it applies its own projection directly to raw source
// decisions/anchors so it can be inspected before integration.

const expansionSkillIds = ["01", "02", "03", "04", "05", "12"];
const expansionDecisionIds = expansionSkillIds.flatMap((skill) =>
  Array.from({ length: 7 }, (_, i) => `PM-BL-${skill}-${101 + i}`),
);
const nativeDecisionIds = ["PM-BL-03-001", "PM-BL-04-001", "PM-BL-05-001", "PM-BL-10-001"];
const decisionIds = [...expansionDecisionIds, ...nativeDecisionIds];
const anchorIds = ["BL-03-A01", "BL-04-A01", "BL-05-A01", "BL-10-A01", "BL-10-A02"];

const excludedDecisionIds = ["PM-BL-05-108", "PM-BL-06-B1-101"];
const excludedAnchorIds = ["PF-01-A01", "PF-04-A01", "PF-05-A01"];

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
const anchorFieldPaths = ["promptRu", "answerRu", "rationaleRu"];

const rawDecisionById = new Map([
  ...blindDefenceExpansionDecisions
    .filter((decision) => decisionIds.includes(decision.id))
    .map((decision) => [decision.id, decision]),
  ...foundationPreflopBlindDecisions
    .filter((decision) => decisionIds.includes(decision.id))
    .map((decision) => [decision.id, decision]),
]);

const rawAnchorById = new Map(
  preflopAndBlindAnchors.filter((anchor) => anchorIds.includes(anchor.id)).map((anchor) => [anchor.id, anchor]),
);

function decisionPatchPaths(patch) {
  const paths = [];
  if (patch.cueRu !== undefined) paths.push("cueRu");
  if (patch.questionRu !== undefined) paths.push("questionRu");
  if (patch.explanationRu !== undefined) paths.push("explanationRu");
  for (const id of Object.keys(patch.actionOptions ?? {})) paths.push(`action:${id}`);
  for (const id of Object.keys(patch.reasonOptions ?? {})) paths.push(`reason:${id}`);
  return paths;
}

function anchorPatchPaths(patch) {
  const paths = [];
  if (patch.promptRu !== undefined) paths.push("promptRu");
  if (patch.answerRu !== undefined) paths.push("answerRu");
  if (patch.rationaleRu !== undefined) paths.push("rationaleRu");
  return paths;
}

function decisionFieldValue(decision, path) {
  if (path === "cueRu" || path === "questionRu" || path === "explanationRu") return decision[path];
  const [group, id] = path.split(":");
  const options = group === "action" ? decision.actionOptions : decision.reasonOptions;
  return options.find((option) => option.id === id)?.textRu;
}

function learnerDecisionRuFields(decision) {
  return [
    ["cueRu", decision.cueRu],
    ["questionRu", decision.questionRu],
    ["explanationRu", decision.explanationRu],
    ...decision.actionOptions.map((option) => [`action:${option.id}`, option.textRu]),
    ...decision.reasonOptions.map((option) => [`reason:${option.id}`, option.textRu]),
  ];
}

function learnerAnchorRuFields(anchor) {
  return [
    ["promptRu", anchor.promptRu],
    ["answerRu", anchor.answerRu],
    ["rationaleRu", anchor.rationaleRu],
  ];
}

// Approved poker-native Latin notation that is allowed to remain inside
// otherwise-Russian learner copy (positions, EV/IP/OOP/SPR, and the bb unit).
function stripApprovedNotation(text) {
  return text
    .replace(/\b(?:EV|IP|OOP|SPR|BB|SB|BTN|CO|HJ|UTG|EP|Hero)\b/gu, "")
    .replace(/\bbb\b/gu, "")
    .replace(/(?<=\d)bb\b/gu, "")
    .replace(/(?<=\d)x\b/gu, "");
}

// The numeric firewall must ignore poker-action notation (3-bet/4-bet in
// either script) so that genuine quantitative tokens like "2.2x", "4x", or
// "100bb" are the only things compared for numeric-semantics preservation.
function numericTokens(text) {
  const withoutNonQuantitativeNotation = text
    .replace(/(?:FTGU-E\d+(?:\/E\d+)*|LCM-\d+|SLC-[A-Z0-9-]+|EXT-[A-Z0-9-]+)/gu, "")
    .replace(/\b3-bet(?:s|ting|-or-fold)?\b/giu, "")
    .replace(/\b4-bet(?:s|ting)?\b/giu, "")
    .replace(/3-бет(?:ы|ов|ам|ами|ах|ить)?/giu, "")
    .replace(/4-бет(?:ы|ов|ам|ами|ах|ить)?/giu, "");
  return withoutNonQuantitativeNotation.match(/\d+(?:[.,]\d+)?%?x?/gu) ?? [];
}

function optionMachineIdentity(options) {
  return options.map((option) => ({ id: option.id, misconception: option.misconception, textEn: option.textEn }));
}

test("BLIND_DEFENSE numeric firewall helper excludes action notation but keeps genuine numerics", () => {
  assert.deepEqual(numericTokens("3-bet 4-bet 3-бет 4-бет"), []);
  assert.deepEqual(numericTokens("CO open size 2.2x -> 4x"), ["2.2x", "4x"]);
  assert.deepEqual(numericTokens("одинаковые '100bb' labels"), ["100"]);
});

test("BLIND_DEFENSE inventory: 46 decisions, 5 anchors, 429 active FIX fields, REVIEW=0", () => {
  assert.equal(rawDecisionById.size, 46);
  assert.equal(decisionIds.length, 46);
  assert.equal(practicalRuSystemicBlindDefenceDecisionPatches.size, 46);

  assert.equal(rawAnchorById.size, 5);
  assert.equal(practicalRuSystemicBlindDefenceAnchorPatches.size, 5);

  const decisionPatches = decisionIds.map((id) => {
    const patch = practicalRuSystemicBlindDefenceDecisionPatches.get(id);
    assert.ok(patch, `missing decision patch for ${id}`);
    return [id, patch];
  });
  const anchorPatches = anchorIds.map((id) => {
    const patch = practicalRuSystemicBlindDefenceAnchorPatches.get(id);
    assert.ok(patch, `missing anchor patch for ${id}`);
    return [id, patch];
  });

  const decisionFixFields = decisionPatches.reduce((sum, [, patch]) => sum + decisionPatchPaths(patch).length, 0);
  const anchorFixFields = anchorPatches.reduce((sum, [, patch]) => sum + anchorPatchPaths(patch).length, 0);
  const activeFields = decisionIds.length * fieldPaths.length + anchorIds.length * anchorFieldPaths.length;

  assert.equal(activeFields, 429);
  assert.equal(decisionFixFields + anchorFixFields, 429);

  const unpatchedDecisionFields = decisionPatches.flatMap(([id, patch]) => {
    const fixed = new Set(decisionPatchPaths(patch));
    return fieldPaths.filter((path) => !fixed.has(path)).map((path) => `${id}:${path}`);
  });
  const unpatchedAnchorFields = anchorPatches.flatMap(([id, patch]) => {
    const fixed = new Set(anchorPatchPaths(patch));
    return anchorFieldPaths.filter((path) => !fixed.has(path)).map((path) => `${id}:${path}`);
  });
  assert.deepEqual(unpatchedDecisionFields, []);
  assert.deepEqual(unpatchedAnchorFields, []);
});

test("BLIND_DEFENSE owns exactly its listed IDs and no more", () => {
  assert.deepEqual([...practicalRuSystemicBlindDefenceDecisionPatches.keys()], decisionIds);
  assert.deepEqual([...practicalRuSystemicBlindDefenceAnchorPatches.keys()], anchorIds);
  for (const id of excludedDecisionIds) {
    assert.equal(practicalRuSystemicBlindDefenceDecisionPatches.has(id), false, `must not own ${id}`);
  }
  for (const id of excludedAnchorIds) {
    assert.equal(practicalRuSystemicBlindDefenceAnchorPatches.has(id), false, `must not own ${id}`);
  }
});

test("BLIND_DEFENSE UNIT_ALL_FIX_ITEMS_REPAIRED=TRUE for decisions and anchors", () => {
  for (const id of decisionIds) {
    const raw = rawDecisionById.get(id);
    assert.ok(raw, `missing raw decision ${id}`);
    const projected = applyPracticalRuSystemicBlindDefenceDecisionProjection(raw);
    const patch = practicalRuSystemicBlindDefenceDecisionPatches.get(id);
    for (const path of decisionPatchPaths(patch)) {
      const expected = path.startsWith("action:")
        ? patch.actionOptions[path.slice("action:".length)]
        : path.startsWith("reason:")
          ? patch.reasonOptions[path.slice("reason:".length)]
          : patch[path];
      assert.equal(decisionFieldValue(projected, path), expected, `${id} ${path}`);
    }
  }

  for (const id of anchorIds) {
    const raw = rawAnchorById.get(id);
    assert.ok(raw, `missing raw anchor ${id}`);
    const projected = applyPracticalRuSystemicBlindDefenceAnchorProjection(raw);
    const patch = practicalRuSystemicBlindDefenceAnchorPatches.get(id);
    for (const path of anchorPatchPaths(patch)) {
      assert.equal(projected[path], patch[path], `${id} ${path}`);
    }
  }
});

test("BLIND_DEFENSE UNIT_CONFIRMED_RU_HYBRID_DEFECTS_REMAINING=0", () => {
  for (const id of decisionIds) {
    const projected = applyPracticalRuSystemicBlindDefenceDecisionProjection(rawDecisionById.get(id));
    for (const [field, text] of learnerDecisionRuFields(projected)) {
      assert.doesNotMatch(stripApprovedNotation(text), /[A-Za-z]/u, `${id} ${field}: ${text}`);
    }
  }
  for (const id of anchorIds) {
    const projected = applyPracticalRuSystemicBlindDefenceAnchorProjection(rawAnchorById.get(id));
    for (const [field, text] of learnerAnchorRuFields(projected)) {
      assert.doesNotMatch(stripApprovedNotation(text), /[A-Za-z]/u, `${id} ${field}: ${text}`);
    }
  }
});

test("BLIND_DEFENSE LEARNER_VISIBLE_SOURCE_ID_RESIDUAL=0", () => {
  const sourceId = /(?:FTGU-E\d+|LCM-\d+|SLC-[A-Z0-9-]+|EXT-[A-Z0-9-]+)/u;
  for (const id of decisionIds) {
    const projected = applyPracticalRuSystemicBlindDefenceDecisionProjection(rawDecisionById.get(id));
    for (const [field, text] of learnerDecisionRuFields(projected)) {
      assert.doesNotMatch(text, sourceId, `${id} ${field}: ${text}`);
    }
  }
  for (const id of anchorIds) {
    const projected = applyPracticalRuSystemicBlindDefenceAnchorProjection(rawAnchorById.get(id));
    for (const [field, text] of learnerAnchorRuFields(projected)) {
      assert.doesNotMatch(text, sourceId, `${id} ${field}: ${text}`);
    }
  }
});

test("BLIND_DEFENSE NUMERIC_SEMANTICS_CHANGED=FALSE", () => {
  for (const id of decisionIds) {
    const raw = rawDecisionById.get(id);
    const projected = applyPracticalRuSystemicBlindDefenceDecisionProjection(raw);
    for (const path of fieldPaths) {
      assert.deepEqual(
        numericTokens(decisionFieldValue(projected, path)),
        numericTokens(decisionFieldValue(raw, path)),
        `${id} ${path}`,
      );
    }
  }
  for (const id of anchorIds) {
    const raw = rawAnchorById.get(id);
    const projected = applyPracticalRuSystemicBlindDefenceAnchorProjection(raw);
    for (const path of anchorFieldPaths) {
      assert.deepEqual(numericTokens(projected[path]), numericTokens(raw[path]), `${id} ${path}`);
    }
  }
});

test("BLIND_DEFENSE semantic firewall preserves scoring, sources, option, EN and changed-variable identity", () => {
  for (const id of decisionIds) {
    const raw = rawDecisionById.get(id);
    const projected = applyPracticalRuSystemicBlindDefenceDecisionProjection(raw);

    assert.equal(projected.id, raw.id, `${id} decision id`);
    assert.equal(projected.correctActionId, raw.correctActionId, `${id} correct action`);
    assert.equal(projected.correctReasonId, raw.correctReasonId, `${id} correct reason`);
    assert.deepEqual(projected.sourceRefs, raw.sourceRefs, `${id} source refs`);
    assert.deepEqual(projected.changedVariables, raw.changedVariables, `${id} changed variables`);
    assert.deepEqual(optionMachineIdentity(projected.actionOptions), optionMachineIdentity(raw.actionOptions), `${id} action identity`);
    assert.deepEqual(optionMachineIdentity(projected.reasonOptions), optionMachineIdentity(raw.reasonOptions), `${id} reason identity`);
    assert.equal(projected.cueEn, raw.cueEn, `${id} cue EN`);
    assert.equal(projected.questionEn, raw.questionEn, `${id} question EN`);
    assert.equal(projected.explanationEn, raw.explanationEn, `${id} explanation EN`);
    assert.equal(projected.skillId, raw.skillId, `${id} skill id`);
    assert.equal(projected.kind, raw.kind, `${id} decision kind`);
    assert.equal(projected.targetSeconds, raw.targetSeconds, `${id} target seconds`);
    assert.deepEqual(projected.assumptions, raw.assumptions, `${id} assumptions`);
  }

  for (const id of anchorIds) {
    const raw = rawAnchorById.get(id);
    const projected = applyPracticalRuSystemicBlindDefenceAnchorProjection(raw);

    assert.equal(projected.id, raw.id, `${id} anchor id`);
    assert.equal(projected.skillId, raw.skillId, `${id} skill id`);
    assert.equal(projected.kind, raw.kind, `${id} anchor kind`);
    assert.deepEqual(projected.sourceRefs, raw.sourceRefs, `${id} source refs`);
    assert.deepEqual(projected.assumptions, raw.assumptions, `${id} assumptions`);
    assert.deepEqual(projected.changedVariables, raw.changedVariables, `${id} changed variables`);
    assert.equal(projected.promptEn, raw.promptEn, `${id} prompt EN`);
    assert.equal(projected.answerEn, raw.answerEn, `${id} answer EN`);
    assert.equal(projected.rationaleEn, raw.rationaleEn, `${id} rationale EN`);
  }
});

test("BLIND_DEFENSE unmapped decisions and anchors pass through the projection unchanged", () => {
  const untouchedDecision = executableGateRepairDecisions.find((decision) => decision.id === "PM-BL-05-108");
  assert.ok(untouchedDecision, "expected PM-BL-05-108 fixture to exist in decisions-executable-gate-repair.ts");
  assert.deepEqual(applyPracticalRuSystemicBlindDefenceDecisionProjection(untouchedDecision), untouchedDecision);

  const bl06Decision = sourceClosureB1Decisions.find((decision) => decision.id === "PM-BL-06-B1-101");
  assert.ok(bl06Decision, "expected PM-BL-06-B1-101 fixture to exist in decisions-source-closure-b1.ts");
  assert.deepEqual(applyPracticalRuSystemicBlindDefenceDecisionProjection(bl06Decision), bl06Decision);

  const untouchedAnchor = preflopAndBlindAnchors.find((anchor) => anchor.id === "PF-01-A01");
  assert.ok(untouchedAnchor, "expected PF-01-A01 fixture to exist in anchors-w2-w3.ts");
  assert.deepEqual(applyPracticalRuSystemicBlindDefenceAnchorProjection(untouchedAnchor), untouchedAnchor);
});

test("BLIND_DEFENSE BL11_SOURCE_CEILING_PRESERVED=TRUE (PRESERVE/ALLOW, not owned)", () => {
  const bl11 = practicalSourceGaps.find((gap) => gap.skillId === "BL-11");
  assert.ok(bl11, "expected BL-11 source gap entry");
  assert.equal(bl11.status, "PARTIAL");
  assert.equal(
    bl11.learnerReasonRu,
    "Для отдельной игры SB против BB в 3-бет-банке нужен более подробный источник. Общие принципы игры из блайндов и 3-бет-банков подтверждены, но доступных материалов пока недостаточно, чтобы честно задавать точные частоты и границы рук именно для этого спота.",
  );
  assert.equal(
    bl11.learnerNextEvidenceNeededRu,
    "Пока используй общие принципы 3-бет-банков и учитывай особенности диапазонов SB и BB. Отдельные точные решения для этого спота появятся только после проверки подходящего solver- или course-источника.",
  );
  // BL-11 is PRESERVE/ALLOW, not FIX-owned: these fields are asserted
  // byte-identical to the current source, never rewritten by this unit.
});
