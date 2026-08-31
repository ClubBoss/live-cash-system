import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import {
  practicalAnchors,
  practicalDecisionById,
  practicalDecisions,
} from "../content/practical-mastery";
import { recognitionAndSrpAnchors } from "../content/practical-mastery/anchors-w4-w6";
import { blindDefenceExpansionDecisions } from "../content/practical-mastery/decisions-blind-defence-expansion";
import { srpA6ExpansionDecisions } from "../content/practical-mastery/decisions-srp-a6-expansion";
import { postflopAndLiveDecisions } from "../content/practical-mastery/decisions-w4-w13";
import { applyPracticalAssessmentIntegrityRepair } from "../content/practical-mastery/practical-assessment-integrity-repair";
import { applyPracticalRuSystemicBlindDefenceDecisionProjection } from "../content/practical-mastery/practical-ru-systemic-blind-defence-publication";
import {
  applyPracticalRuSystemicFlopSrpOopIpAnchorProjection,
  applyPracticalRuSystemicFlopSrpOopIpDecisionProjection,
  practicalRuSystemicFlopSrpOopIpAnchorPatches,
  practicalRuSystemicFlopSrpOopIpDecisionPatches,
} from "../content/practical-mastery/practical-ru-systemic-flop-srp-oop-ip-publication";

const expectedFinalCompositionDigest = "e8a041d6f8e66f1a8c69d8afba99e9b27aef91019f61ba09de5847a953b792b7";
const a6SkillIds = ["OOP-01", "OOP-02", "OOP-03", "OOP-04", "OOP-05", "IP-01", "IP-02"];
const expansionDecisionIds = a6SkillIds.flatMap((skill) =>
  Array.from({ length: 8 }, (_, i) => `PM-${skill}-${101 + i}`),
);
const nativeDecisionIds = ["PM-W4-BOARD-001", "PM-W4-REL-001", "PM-OOP-01-001", "PM-OOP-03-001", "PM-IP-01-001"];
const decisionIds = [...expansionDecisionIds, ...nativeDecisionIds];
const anchorIds = [
  "W4-BOARD-01-A01",
  "W4-BOARD-01-A02",
  "W4-HAND-01-A01",
  "W4-REL-01-A01",
  "OOP-01-A01",
  "OOP-01-A02",
  "OOP-02-A01",
  "OOP-03-A01",
  "OOP-03-A02",
  "IP-01-A01",
  "IP-01-A02",
  "IP-02-A01",
];
const assessmentPrecedenceIds = ["PM-BL-03-103", "PM-BL-04-104", "PM-BL-05-105"];
const deferredDecisionIds = ["PM-IP-04-001"];
const deferredAnchorIds = ["W4-RUNOUT-01-A01", "IP-04-A01"];

const rawDecisionById = new Map([
  ...srpA6ExpansionDecisions
    .filter((decision) => decisionIds.includes(decision.id))
    .map((decision) => [decision.id, decision]),
  ...postflopAndLiveDecisions
    .filter((decision) => decisionIds.includes(decision.id))
    .map((decision) => [decision.id, decision]),
]);
const rawAnchorById = new Map(
  recognitionAndSrpAnchors.filter((anchor) => anchorIds.includes(anchor.id)).map((anchor) => [anchor.id, anchor]),
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

function decisionRuSnapshot(decision) {
  return learnerDecisionRuFields(decision).map(([field, value]) => [field, value]);
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

test("FLOP/SRP final ownership is 61 decisions / 12 anchors / 585 active RU fields with REVIEW=0", () => {
  assert.equal(rawDecisionById.size, 61);
  assert.equal(rawAnchorById.size, 12);
  assert.deepEqual([...practicalRuSystemicFlopSrpOopIpDecisionPatches.keys()].sort(), [...decisionIds].sort());
  assert.deepEqual([...practicalRuSystemicFlopSrpOopIpAnchorPatches.keys()].sort(), [...anchorIds].sort());

  let activeFields = 0;
  for (const id of decisionIds) {
    const patch = practicalRuSystemicFlopSrpOopIpDecisionPatches.get(id);
    assert.ok(patch, `missing decision patch ${id}`);
    assert.equal(decisionPatchPaths(patch).length, 9, `${id} must own all nine learner-facing RU decision fields`);
    activeFields += decisionPatchPaths(patch).length;
  }
  for (const id of anchorIds) {
    const patch = practicalRuSystemicFlopSrpOopIpAnchorPatches.get(id);
    assert.ok(patch, `missing anchor patch ${id}`);
    assert.equal(anchorPatchPaths(patch).length, 3, `${id} must own all three learner-facing RU anchor fields`);
    activeFields += anchorPatchPaths(patch).length;
  }
  assert.equal(activeFields, 585);
});

test("FLOP/SRP final runtime equals the accepted A6 projection without machine, EN or numeric drift", () => {
  for (const id of decisionIds) {
    const raw = rawDecisionById.get(id);
    const finalDecision = practicalDecisionById.get(id);
    assert.ok(raw, `missing raw ${id}`);
    assert.ok(finalDecision, `missing final ${id}`);
    const expected = applyPracticalAssessmentIntegrityRepair(applyPracticalRuSystemicFlopSrpOopIpDecisionProjection(raw));
    const paths = decisionPatchPaths(practicalRuSystemicFlopSrpOopIpDecisionPatches.get(id));

    for (const path of paths) {
      assert.equal(decisionFieldValue(finalDecision, path), decisionFieldValue(expected, path), `${id} ${path}`);
      assert.deepEqual(numericTokens(decisionFieldValue(finalDecision, path)), numericTokens(decisionFieldValue(raw, path)), `${id} ${path} numeric semantics`);
    }
    assert.deepEqual(machineIdentity(finalDecision), machineIdentity(raw), `${id} machine/EN identity`);
  }

  for (const id of anchorIds) {
    const raw = rawAnchorById.get(id);
    const finalAnchor = practicalAnchors.find((anchor) => anchor.id === id);
    assert.ok(raw, `missing raw anchor ${id}`);
    assert.ok(finalAnchor, `missing final anchor ${id}`);
    const expected = applyPracticalRuSystemicFlopSrpOopIpAnchorProjection(raw);
    for (const path of ["promptRu", "answerRu", "rationaleRu"]) {
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

  assert.equal(JSON.stringify([...rawDecisionById.values()]), rawDecisionSnapshot, "raw A6 decisions mutated");
  assert.equal(JSON.stringify([...rawAnchorById.values()]), rawAnchorSnapshot, "raw A6 anchors mutated");
});

test("FLOP/SRP final RU has zero source-ID and unapproved hybrid residual", () => {
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

test("FLOP/SRP projector is ID-local and explicitly deferred A6-adjacent nodes stay outside ownership", () => {
  for (const id of deferredDecisionIds) {
    const raw = postflopAndLiveDecisions.find((decision) => decision.id === id);
    assert.ok(raw, `missing deferred decision ${id}`);
    assert.equal(applyPracticalRuSystemicFlopSrpOopIpDecisionProjection(raw), raw, `${id} must pass through by identity`);
    assert.equal(practicalRuSystemicFlopSrpOopIpDecisionPatches.has(id), false, `${id} must not be owned`);
  }
  for (const id of deferredAnchorIds) {
    const raw = recognitionAndSrpAnchors.find((anchor) => anchor.id === id);
    assert.ok(raw, `missing deferred anchor ${id}`);
    assert.equal(applyPracticalRuSystemicFlopSrpOopIpAnchorProjection(raw), raw, `${id} must pass through by identity`);
    assert.equal(practicalRuSystemicFlopSrpOopIpAnchorPatches.has(id), false, `${id} must not be owned`);
  }
});

test("FLOP/SRP composition preserves the certified Blind assessment-integrity precedence IDs", () => {
  for (const id of assessmentPrecedenceIds) {
    const raw = blindDefenceExpansionDecisions.find((decision) => decision.id === id);
    const finalDecision = practicalDecisionById.get(id);
    assert.ok(raw, `missing raw Blind precedence decision ${id}`);
    assert.ok(finalDecision, `missing final Blind precedence decision ${id}`);
    const expected = applyPracticalAssessmentIntegrityRepair(applyPracticalRuSystemicBlindDefenceDecisionProjection(raw));
    assert.deepEqual(decisionRuSnapshot(finalDecision), decisionRuSnapshot(expected), `${id} RU precedence`);
    assert.deepEqual(machineIdentity(finalDecision), machineIdentity(applyPracticalAssessmentIntegrityRepair(raw)), `${id} EN/misconception precedence`);
  }
});

test("FLOP/SRP owns the current truthful final-composition digest", () => {
  assert.equal(finalCompositionDigest(), expectedFinalCompositionDigest);
});
