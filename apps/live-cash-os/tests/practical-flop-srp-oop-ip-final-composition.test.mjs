import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import { practicalAnchors, practicalDecisionById, practicalDecisions } from "../content/practical-mastery";
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

const expectedDigest = "e8a041d6f8e66f1a8c69d8afba99e9b27aef91019f61ba09de5847a953b792b7";
const expansionIds = ["OOP-01", "OOP-02", "OOP-03", "OOP-04", "OOP-05", "IP-01", "IP-02"]
  .flatMap((skill) => Array.from({ length: 8 }, (_, i) => `PM-${skill}-${101 + i}`));
const nativeIds = ["PM-W4-BOARD-001", "PM-W4-REL-001", "PM-OOP-01-001", "PM-OOP-03-001", "PM-IP-01-001"];
const decisionIds = [...expansionIds, ...nativeIds];
const anchorIds = ["W4-BOARD-01-A01", "W4-BOARD-01-A02", "W4-HAND-01-A01", "W4-REL-01-A01", "OOP-01-A01", "OOP-01-A02", "OOP-02-A01", "OOP-03-A01", "OOP-03-A02", "IP-01-A01", "IP-01-A02", "IP-02-A01"];
const blindPrecedenceIds = ["PM-BL-03-103", "PM-BL-04-104", "PM-BL-05-105"];
const rawDecisionById = new Map([...srpA6ExpansionDecisions, ...postflopAndLiveDecisions].map((d) => [d.id, d]));
const rawAnchorById = new Map(recognitionAndSrpAnchors.map((a) => [a.id, a]));

function fields(d) {
  return [
    ["cueRu", d.cueRu], ["questionRu", d.questionRu], ["explanationRu", d.explanationRu],
    ...d.actionOptions.map((o) => [`action:${o.id}`, o.textRu]),
    ...d.reasonOptions.map((o) => [`reason:${o.id}`, o.textRu]),
  ];
}
function anchorFields(a) { return [["promptRu", a.promptRu], ["answerRu", a.answerRu], ["rationaleRu", a.rationaleRu]]; }
function numericTokens(text) {
  return text
    .replace(/\b(?:FTGU-E\d+|SLC-M\d+-L\d+|CP-G\d+-L\d+|LCM-\d+|E\d+)\b/gu, "")
    .replace(/(?<![\p{L}\p{N}])[34]-(?:bet(?:s|ting|ted)?|бет[а-яё]*)(?![\p{L}\p{N}])/giu, "")
    .match(/\d+(?:[.,]\d+)?%?/gu) ?? [];
}
function machineIdentity(d) {
  const stripOptions = (xs) => xs.map(({ textRu, ...rest }) => rest);
  const { cueRu, questionRu, explanationRu, actionOptions, reasonOptions, ...rest } = d;
  void cueRu; void questionRu; void explanationRu;
  return { ...rest, actionOptions: stripOptions(actionOptions), reasonOptions: stripOptions(reasonOptions) };
}
function stripApproved(text) {
  return text.replace(/\b(?:EV|IP|OOP|SPR|BB|SB|BTN|CO|HJ|UTG|EP|Hero)\b/gu, "").replace(/\bbb\b/gu, "").replace(/(?<=\d)bb\b/gu, "").replace(/(?<=\d)x\b/gu, "");
}
function digest() {
  return createHash("sha256").update(JSON.stringify({
    anchors: practicalAnchors.map((a) => ({ id: a.id, promptRu: a.promptRu, answerRu: a.answerRu, rationaleRu: a.rationaleRu, sourceRefs: a.sourceRefs })),
    decisions: practicalDecisions.map((d) => ({ id: d.id, cueRu: d.cueRu, questionRu: d.questionRu, actionOptions: d.actionOptions.map((o) => ({ id: o.id, textRu: o.textRu })), reasonOptions: d.reasonOptions.map((o) => ({ id: o.id, textRu: o.textRu })), explanationRu: d.explanationRu, sourceRefs: d.sourceRefs, changedVariables: d.changedVariables })),
  }), "utf8").digest("hex");
}

test("FLOP/SRP final ownership is exactly 61 decisions / 12 anchors / 585 RU fields", () => {
  assert.equal(decisionIds.length, 61);
  assert.equal(anchorIds.length, 12);
  assert.deepEqual([...practicalRuSystemicFlopSrpOopIpDecisionPatches.keys()].sort(), [...decisionIds].sort());
  assert.deepEqual([...practicalRuSystemicFlopSrpOopIpAnchorPatches.keys()].sort(), [...anchorIds].sort());
  assert.equal([...practicalRuSystemicFlopSrpOopIpDecisionPatches.values()].reduce((n, p) => n + 3 + Object.keys(p.actionOptions).length + Object.keys(p.reasonOptions).length, 0) + [...practicalRuSystemicFlopSrpOopIpAnchorPatches.values()].reduce((n, p) => n + Object.keys(p).length, 0), 585);
});

test("FLOP/SRP final runtime equals accepted projection and preserves machine, EN and numeric identity", () => {
  for (const id of decisionIds) {
    const raw = rawDecisionById.get(id);
    const final = practicalDecisionById.get(id);
    assert.ok(raw, `missing raw ${id}`); assert.ok(final, `missing final ${id}`);
    const expected = applyPracticalAssessmentIntegrityRepair(applyPracticalRuSystemicFlopSrpOopIpDecisionProjection(raw));
    assert.deepEqual(fields(final), fields(expected), `${id} RU projection`);
    assert.deepEqual(machineIdentity(final), machineIdentity(raw), `${id} machine/EN identity`);
    const before = new Map(fields(raw));
    for (const [path, text] of fields(final)) assert.deepEqual(numericTokens(text), numericTokens(before.get(path)), `${id} ${path} numeric semantics`);
  }
  for (const id of anchorIds) {
    const raw = rawAnchorById.get(id);
    const final = practicalAnchors.find((a) => a.id === id);
    assert.ok(raw, `missing raw ${id}`); assert.ok(final, `missing final ${id}`);
    const expected = applyPracticalRuSystemicFlopSrpOopIpAnchorProjection(raw);
    assert.deepEqual(anchorFields(final), anchorFields(expected), `${id} RU projection`);
    for (const [path, text] of anchorFields(final)) assert.deepEqual(numericTokens(text), numericTokens(new Map(anchorFields(raw)).get(path)), `${id} ${path} numeric semantics`);
    assert.deepEqual({ sourceRefs: final.sourceRefs, assumptions: final.assumptions, changedVariables: final.changedVariables, promptEn: final.promptEn, answerEn: final.answerEn, rationaleEn: final.rationaleEn }, { sourceRefs: raw.sourceRefs, assumptions: raw.assumptions, changedVariables: raw.changedVariables, promptEn: raw.promptEn, answerEn: raw.answerEn, rationaleEn: raw.rationaleEn }, `${id} machine/EN identity`);
  }
});

test("FLOP/SRP final RU has zero source-ID and unapproved hybrid residual", () => {
  const sourceId = /(?:FTGU-E\d+|LCM-\d+|SLC-[A-Z0-9-]+|EXT-[A-Z0-9-]+)/u;
  for (const id of decisionIds) for (const [path, text] of fields(practicalDecisionById.get(id))) { assert.doesNotMatch(text, sourceId, `${id}.${path}`); assert.doesNotMatch(stripApproved(text), /[A-Za-z]/u, `${id}.${path}`); }
  for (const id of anchorIds) for (const [path, text] of anchorFields(practicalAnchors.find((a) => a.id === id))) { assert.doesNotMatch(text, sourceId, `${id}.${path}`); assert.doesNotMatch(stripApproved(text), /[A-Za-z]/u, `${id}.${path}`); }
});

test("FLOP/SRP leaves explicitly deferred A6-adjacent nodes outside ownership", () => {
  const deferredDecision = rawDecisionById.get("PM-IP-04-001");
  assert.ok(deferredDecision); assert.equal(applyPracticalRuSystemicFlopSrpOopIpDecisionProjection(deferredDecision), deferredDecision); assert.equal(practicalRuSystemicFlopSrpOopIpDecisionPatches.has("PM-IP-04-001"), false);
  for (const id of ["W4-RUNOUT-01-A01", "IP-04-A01"]) { const raw = rawAnchorById.get(id); assert.ok(raw); assert.equal(applyPracticalRuSystemicFlopSrpOopIpAnchorProjection(raw), raw); assert.equal(practicalRuSystemicFlopSrpOopIpAnchorPatches.has(id), false); }
});

test("FLOP/SRP preserves certified Blind assessment-integrity precedence", () => {
  for (const id of blindPrecedenceIds) {
    const raw = blindDefenceExpansionDecisions.find((d) => d.id === id);
    const final = practicalDecisionById.get(id);
    assert.ok(raw); assert.ok(final);
    const expected = applyPracticalAssessmentIntegrityRepair(applyPracticalRuSystemicBlindDefenceDecisionProjection(raw));
    assert.deepEqual(fields(final), fields(expected), `${id} RU precedence`);
    assert.deepEqual(machineIdentity(final), machineIdentity(applyPracticalAssessmentIntegrityRepair(raw)), `${id} machine/EN precedence`);
  }
});

test("FLOP/SRP owns the current truthful final-composition digest", () => assert.equal(digest(), expectedDigest));
