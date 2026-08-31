import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import {
  practicalAnchors,
  practicalDecisionById,
  practicalDecisions,
} from "../content/practical-mastery";
import { preflopAndBlindAnchors } from "../content/practical-mastery/anchors-w2-w3";
import { blindDefenceExpansionDecisions } from "../content/practical-mastery/decisions-blind-defence-expansion";
import { executableGateRepairDecisions } from "../content/practical-mastery/decisions-executable-gate-repair";
import { sourceClosureB1Decisions } from "../content/practical-mastery/decisions-source-closure-b1";
import { foundationPreflopBlindDecisions } from "../content/practical-mastery/decisions-w1-w3";
import { applyPracticalAssessmentIntegrityRepair } from "../content/practical-mastery/practical-assessment-integrity-repair";
import {
  applyPracticalRuSystemicBlindDefenceAnchorProjection,
  applyPracticalRuSystemicBlindDefenceDecisionProjection,
  practicalRuSystemicBlindDefenceAnchorPatches,
  practicalRuSystemicBlindDefenceDecisionPatches,
} from "../content/practical-mastery/practical-ru-systemic-blind-defence-publication";
import { practicalSourceGaps } from "../content/practical-mastery/source-gaps";

const expectedFinalCompositionDigest = "0d345b75ff4ca0f18d6b2e124b64a3816fa49701b106c7874d56107b581d4133";
const expansionSkillIds = ["01", "02", "03", "04", "05", "12"];
const expansionDecisionIds = expansionSkillIds.flatMap((skill) =>
  Array.from({ length: 7 }, (_, i) => `PM-BL-${skill}-${101 + i}`),
);
const nativeDecisionIds = ["PM-BL-03-001", "PM-BL-04-001", "PM-BL-05-001", "PM-BL-10-001"];
const decisionIds = [...expansionDecisionIds, ...nativeDecisionIds];
const anchorIds = ["BL-03-A01", "BL-04-A01", "BL-05-A01", "BL-10-A01", "BL-10-A02"];
const assessmentPrecedenceIds = new Set(["PM-BL-03-103", "PM-BL-04-104", "PM-BL-05-105"]);
const decisionFieldPaths = [
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
const rawDecisionSnapshot = JSON.stringify([...rawDecisionById.values()]);
const rawAnchorSnapshot = JSON.stringify([...rawAnchorById.values()]);

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

function stripApprovedNotation(text) {
  return text
    .replace(/\b(?:EV|IP|OOP|SPR|BB|SB|BTN|CO|HJ|UTG|EP|Hero)\b/gu, "")
    .replace(/\bbb\b/gu, "")
    .replace(/(?<=\d)bb\b/gu, "")
    .replace(/(?<=\d)x\b/gu, "");
}

function numericTokens(text) {
  const normalized = text
    .replace(/(?:FTGU-E\d+(?:\/E\d+)*|LCM-\d+|SLC-[A-Z0-9-]+|EXT-[A-Z0-9-]+)/gu, "")
    .replace(/\b3-bet(?:s|ting|-or-fold)?\b/giu, "")
    .replace(/\b4-bet(?:s|ting)?\b/giu, "")
    .replace(/3-бет(?:ы|ов|ам|ами|ах|ить)?/giu, "")
    .replace(/4-бет(?:ы|ов|ам|ами|ах|ить)?/giu, "");
  return normalized.match(/\d+(?:[.,]\d+)?%?x?/gu) ?? [];
}

function machineIdentity(decision) {
  return {
    id: decision.id,
    skillId: decision.skillId,
    learnerEligibility: decision.learnerEligibility,
    kind: decision.kind,
    sourceRefs: decision.sourceRefs,
    assumptions: decision.assumptions,
    actionOptions: decision.actionOptions.map((option) => ({
      id: option.id,
      textEn: option.textEn,
      misconception: option.misconception,
    })),
    reasonOptions: decision.reasonOptions.map((option) => ({
      id: option.id,
      textEn: option.textEn,
      misconception: option.misconception,
    })),
    cueEn: decision.cueEn,
    questionEn: decision.questionEn,
    explanationEn: decision.explanationEn,
    correctActionId: decision.correctActionId,
    correctReasonId: decision.correctReasonId,
    changedVariables: decision.changedVariables,
    targetSeconds: decision.targetSeconds,
  };
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
      actionOptions: decision.actionOptions.map((option) => ({ id: option.id, textRu: option.textRu })),
      reasonOptions: decision.reasonOptions.map((option) => ({ id: option.id, textRu: option.textRu })),
      explanationRu: decision.explanationRu,
      sourceRefs: decision.sourceRefs,
      changedVariables: decision.changedVariables,
    })),
  });
  return createHash("sha256").update(normalized, "utf8").digest("hex");
}

test("BLIND final ownership is 46 decisions / 5 anchors / 431 active fields with REVIEW=0", () => {
  assert.equal(rawDecisionById.size, 46);
  assert.equal(rawAnchorById.size, 5);
  assert.deepEqual([...practicalRuSystemicBlindDefenceDecisionPatches.keys()], decisionIds);
  assert.deepEqual([...practicalRuSystemicBlindDefenceAnchorPatches.keys()], anchorIds);

  const decisionFixFields = decisionIds.reduce((sum, id) => {
    const patch = practicalRuSystemicBlindDefenceDecisionPatches.get(id);
    assert.ok(patch, `missing decision patch ${id}`);
    assert.deepEqual(decisionPatchPaths(patch), decisionFieldPaths, `${id} owned fields`);
    return sum + decisionPatchPaths(patch).length;
  }, 0);
  const anchorFixFields = anchorIds.reduce((sum, id) => {
    const patch = practicalRuSystemicBlindDefenceAnchorPatches.get(id);
    assert.ok(patch, `missing anchor patch ${id}`);
    assert.deepEqual(anchorPatchPaths(patch), anchorFieldPaths, `${id} owned fields`);
    return sum + anchorPatchPaths(patch).length;
  }, 0);
  assert.equal(decisionFixFields + anchorFixFields, 429);

  const bl11 = practicalSourceGaps.find((gap) => gap.skillId === "BL-11");
  assert.ok(bl11, "expected BL-11 source gap");
  assert.equal(bl11.status, "PARTIAL");
  assert.equal(typeof bl11.learnerReasonRu, "string");
  assert.equal(typeof bl11.learnerNextEvidenceNeededRu, "string");
  assert.equal(429 + 2, 431);
});

test("BLIND final runtime equals accepted projection with current assessment-integrity precedence", () => {
  for (const id of decisionIds) {
    const raw = rawDecisionById.get(id);
    const finalDecision = practicalDecisionById.get(id);
    assert.ok(raw, `missing raw ${id}`);
    assert.ok(finalDecision, `missing final ${id}`);
    const projected = applyPracticalRuSystemicBlindDefenceDecisionProjection(raw);
    const expected = applyPracticalAssessmentIntegrityRepair(projected);

    for (const path of decisionFieldPaths) {
      assert.equal(decisionFieldValue(finalDecision, path), decisionFieldValue(expected, path), `${id} ${path}`);
      assert.deepEqual(numericTokens(decisionFieldValue(finalDecision, path)), numericTokens(decisionFieldValue(raw, path)), `${id} ${path} numeric semantics`);
    }
    assert.deepEqual(machineIdentity(finalDecision), machineIdentity(applyPracticalAssessmentIntegrityRepair(raw)), `${id} machine/current-main identity`);

    if (!assessmentPrecedenceIds.has(id)) {
      assert.deepEqual(machineIdentity(finalDecision), machineIdentity(raw), `${id} raw machine identity`);
    }
  }

  for (const id of anchorIds) {
    const raw = rawAnchorById.get(id);
    const finalAnchor = practicalAnchors.find((anchor) => anchor.id === id);
    assert.ok(raw, `missing raw anchor ${id}`);
    assert.ok(finalAnchor, `missing final anchor ${id}`);
    const expected = applyPracticalRuSystemicBlindDefenceAnchorProjection(raw);
    for (const path of anchorFieldPaths) {
      assert.equal(finalAnchor[path], expected[path], `${id} ${path}`);
      assert.deepEqual(numericTokens(finalAnchor[path]), numericTokens(raw[path]), `${id} ${path} numeric semantics`);
    }
    assert.deepEqual(finalAnchor.sourceRefs, raw.sourceRefs, `${id} source refs`);
    assert.deepEqual(finalAnchor.assumptions, raw.assumptions, `${id} assumptions`);
    assert.deepEqual(finalAnchor.changedVariables, raw.changedVariables, `${id} changed variables`);
    assert.equal(finalAnchor.promptEn, raw.promptEn, `${id} prompt EN`);
    assert.equal(finalAnchor.answerEn, raw.answerEn, `${id} answer EN`);
    assert.equal(finalAnchor.rationaleEn, raw.rationaleEn, `${id} rationale EN`);
  }

  assert.equal(JSON.stringify([...rawDecisionById.values()]), rawDecisionSnapshot, "raw decisions mutated");
  assert.equal(JSON.stringify([...rawAnchorById.values()]), rawAnchorSnapshot, "raw anchors mutated");
});

test("BLIND final RU has zero source-ID and unapproved hybrid residual", () => {
  const sourceId = /(?:FTGU-E\d+|LCM-\d+|SLC-[A-Z0-9-]+|EXT-[A-Z0-9-]+)/u;
  for (const id of decisionIds) {
    const finalDecision = practicalDecisionById.get(id);
    assert.ok(finalDecision);
    for (const [field, text] of learnerDecisionRuFields(finalDecision)) {
      assert.doesNotMatch(text, sourceId, `${id} ${field}: ${text}`);
      assert.doesNotMatch(stripApprovedNotation(text), /[A-Za-z]/u, `${id} ${field}: ${text}`);
    }
  }
  for (const id of anchorIds) {
    const finalAnchor = practicalAnchors.find((anchor) => anchor.id === id);
    assert.ok(finalAnchor);
    for (const [field, text] of learnerAnchorRuFields(finalAnchor)) {
      assert.doesNotMatch(text, sourceId, `${id} ${field}: ${text}`);
      assert.doesNotMatch(stripApprovedNotation(text), /[A-Za-z]/u, `${id} ${field}: ${text}`);
    }
  }
});

test("BLIND projector remains ID-local and BL11 source ceiling remains preserved", () => {
  const untouchedDecision = executableGateRepairDecisions.find((decision) => decision.id === "PM-BL-05-108");
  const bl06Decision = sourceClosureB1Decisions.find((decision) => decision.id === "PM-BL-06-B1-101");
  const untouchedAnchor = preflopAndBlindAnchors.find((anchor) => anchor.id === "PF-01-A01");
  assert.ok(untouchedDecision);
  assert.ok(bl06Decision);
  assert.ok(untouchedAnchor);
  assert.equal(applyPracticalRuSystemicBlindDefenceDecisionProjection(untouchedDecision), untouchedDecision);
  assert.equal(applyPracticalRuSystemicBlindDefenceDecisionProjection(bl06Decision), bl06Decision);
  assert.equal(applyPracticalRuSystemicBlindDefenceAnchorProjection(untouchedAnchor), untouchedAnchor);

  const bl11 = practicalSourceGaps.find((gap) => gap.skillId === "BL-11");
  assert.ok(bl11);
  assert.equal(
    bl11.learnerReasonRu,
    "Для отдельной игры SB против BB в 3-бет-банке нужен более подробный источник. Общие принципы игры из блайндов и 3-бет-банков подтверждены, но доступных материалов пока недостаточно, чтобы честно задавать точные частоты и границы рук именно для этого спота.",
  );
  assert.equal(
    bl11.learnerNextEvidenceNeededRu,
    "Пока используй общие принципы 3-бет-банков и учитывай особенности диапазонов SB и BB. Отдельные точные решения для этого спота появятся только после проверки подходящего solver- или course-источника.",
  );
});

test("BLIND owns the current truthful final-composition digest", () => {
  assert.equal(finalCompositionDigest(), expectedFinalCompositionDigest);
});
