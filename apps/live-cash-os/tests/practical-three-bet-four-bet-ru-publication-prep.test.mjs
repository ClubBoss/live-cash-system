import assert from "node:assert/strict";
import test from "node:test";

import { threeBetFourBetA7ExpansionDecisions } from "../content/practical-mastery/decisions-3bp-4bp-a7-expansion.ts";
import { postflopAndLiveDecisions } from "../content/practical-mastery/decisions-w4-w13.ts";
import { laterWaveAnchors } from "../content/practical-mastery/anchors-w7-w13.ts";
import {
  THREE_BET_FOUR_BET_RU_ACTIVE_FIELD_PATHS,
  THREE_BET_FOUR_BET_RU_OWNED_ANCHOR_IDS,
  THREE_BET_FOUR_BET_RU_OWNED_DECISION_IDS,
  projectThreeBetFourBetSystemicRuAnchor,
  projectThreeBetFourBetSystemicRuDecision,
} from "../content/practical-mastery/practical-ru-systemic-three-bet-four-bet-publication.ts";

const EXPECTED_DECISION_IDS = [
  "PM-3BP-01-001","PM-3BP-01-A7-101","PM-3BP-01-A7-102","PM-3BP-01-A7-103","PM-3BP-01-A7-104","PM-3BP-01-A7-105","PM-3BP-01-A7-106","PM-3BP-01-A7-107","PM-3BP-01-A7-108",
  "PM-3BP-02-A7-101","PM-3BP-02-A7-102","PM-3BP-02-A7-103","PM-3BP-02-A7-104","PM-3BP-02-A7-105","PM-3BP-02-A7-106","PM-3BP-02-A7-107","PM-3BP-02-A7-108",
  "PM-3BP-03-A7-101","PM-3BP-03-A7-102","PM-3BP-03-A7-103","PM-3BP-03-A7-104","PM-3BP-03-A7-105","PM-3BP-03-A7-106","PM-3BP-03-A7-107","PM-3BP-03-A7-108",
  "PM-3BP-04-A7-101","PM-3BP-04-A7-102","PM-3BP-04-A7-103","PM-3BP-04-A7-104","PM-3BP-04-A7-105","PM-3BP-04-A7-106","PM-3BP-04-A7-107","PM-3BP-04-A7-108",
  "PM-3BP-05-001","PM-3BP-05-A7-101","PM-3BP-05-A7-102","PM-3BP-05-A7-103","PM-3BP-05-A7-104","PM-3BP-05-A7-105","PM-3BP-05-A7-106","PM-3BP-05-A7-107","PM-3BP-05-A7-108",
  "PM-4BP-01-001","PM-4BP-01-A7-101","PM-4BP-01-A7-102","PM-4BP-01-A7-103","PM-4BP-01-A7-104","PM-4BP-01-A7-105","PM-4BP-01-A7-106","PM-4BP-01-A7-107","PM-4BP-01-A7-108",
  "PM-4BP-02-A7-101","PM-4BP-02-A7-102","PM-4BP-02-A7-103","PM-4BP-02-A7-104","PM-4BP-02-A7-105","PM-4BP-02-A7-106","PM-4BP-02-A7-107","PM-4BP-02-A7-108",
  "PM-4BP-03-A7-101","PM-4BP-03-A7-102","PM-4BP-03-A7-103","PM-4BP-03-A7-104","PM-4BP-03-A7-105","PM-4BP-03-A7-106","PM-4BP-03-A7-107","PM-4BP-03-A7-108",
  "PM-4BP-04-001","PM-4BP-04-A7-101","PM-4BP-04-A7-102","PM-4BP-04-A7-103","PM-4BP-04-A7-104","PM-4BP-04-A7-105","PM-4BP-04-A7-106","PM-4BP-04-A7-107","PM-4BP-04-A7-108",
].sort();

const EXPECTED_ANCHOR_IDS = ["3BP-01-A01","3BP-01-A02","3BP-05-A01","3BP-05-A02","4BP-01-A01","4BP-03-A01","4BP-04-A01"].sort();
const NATIVE_IDS = new Set(["PM-3BP-01-001","PM-3BP-05-001","PM-4BP-01-001","PM-4BP-04-001"]);
const decisionIds = new Set(EXPECTED_DECISION_IDS);
const anchorIds = new Set(EXPECTED_ANCHOR_IDS);
const ownedDecisions = [...threeBetFourBetA7ExpansionDecisions, ...postflopAndLiveDecisions.filter((d) => NATIVE_IDS.has(d.id))];
const ownedAnchors = laterWaveAnchors.filter((a) => anchorIds.has(a.id));

function expectedDecisionPaths(id) {
  const expansion = id.includes("-A7-");
  const actions = expansion ? ["good","bad1","bad2"] : ["a","b","c"];
  const reasons = expansion ? ["goodR","badR1","badR2"] : ["r1","r2","r3"];
  return [
    `${id}.cueRu`, `${id}.questionRu`,
    ...actions.map((optionId) => `${id}.actionOptions.${optionId}.textRu`),
    ...reasons.map((optionId) => `${id}.reasonOptions.${optionId}.textRu`),
    `${id}.explanationRu`,
  ];
}
const EXPECTED_ACTIVE_FIELD_PATHS = [
  ...EXPECTED_DECISION_IDS.flatMap(expectedDecisionPaths),
  ...EXPECTED_ANCHOR_IDS.flatMap((id) => [`${id}.promptRu`,`${id}.answerRu`,`${id}.rationaleRu`]),
].sort();

function clone(value) { return structuredClone(value); }
function machineDecision(value) {
  const copy = clone(value);
  delete copy.cueRu; delete copy.questionRu; delete copy.explanationRu;
  for (const option of [...copy.actionOptions, ...copy.reasonOptions]) delete option.textRu;
  return copy;
}
function machineAnchor(value) {
  const copy = clone(value);
  delete copy.promptRu; delete copy.answerRu; delete copy.rationaleRu;
  return copy;
}
function enDecision(value) {
  return {
    cueEn:value.cueEn, questionEn:value.questionEn, explanationEn:value.explanationEn,
    action:value.actionOptions.map(({id,textEn}) => [id,textEn]),
    reason:value.reasonOptions.map(({id,textEn}) => [id,textEn]),
  };
}
function decisionRuEntries(value) {
  return [
    [ `${value.id}.cueRu`, value.cueRu ], [ `${value.id}.questionRu`, value.questionRu ],
    ...value.actionOptions.map((o) => [`${value.id}.actionOptions.${o.id}.textRu`,o.textRu]),
    ...value.reasonOptions.map((o) => [`${value.id}.reasonOptions.${o.id}.textRu`,o.textRu]),
    [ `${value.id}.explanationRu`, value.explanationRu ],
  ];
}
function anchorRuEntries(value) {
  return [[`${value.id}.promptRu`,value.promptRu],[`${value.id}.answerRu`,value.answerRu],[`${value.id}.rationaleRu`,value.rationaleRu]];
}
function quantitativeTokens(value) {
  const sanitized = value.replace(/[34][\-‑]?(?:bet|бет)[A-Za-zА-Яа-яЁё]*/giu, "");
  return sanitized.match(/\d+(?:[.,]\d+)?(?:%|bb)?/giu) ?? [];
}
function residuals(entries) {
  const approved = new Set(["EV","IP","OOP","SPR","BB","SB","BTN","CO","HJ","UTG"]);
  const sourceId = /\b(?:FTGU|SLC|CINJ|CP)-[A-Z0-9-]+\b/giu;
  const latin = /[A-Za-z]+/g;
  const hybrid = /(?:[A-Za-z][А-Яа-яЁё]|[А-Яа-яЁё][A-Za-z])/g;
  const out = [];
  for (const [path,text] of entries) {
    if (!text.trim()) out.push(`${path}:EMPTY`);
    if (sourceId.test(text)) out.push(`${path}:SOURCE_ID`); sourceId.lastIndex = 0;
    if (hybrid.test(text)) out.push(`${path}:HYBRID`); hybrid.lastIndex = 0;
    for (const token of text.match(latin) ?? []) if (!approved.has(token)) out.push(`${path}:${token}`);
  }
  return out;
}

assert.equal(EXPECTED_DECISION_IDS.length,76);
assert.equal(EXPECTED_ANCHOR_IDS.length,7);
assert.equal(EXPECTED_ACTIVE_FIELD_PATHS.length,705);

test("A7 3BP/4BP RU ownership is exact and fully classified", () => {
  assert.deepEqual([...THREE_BET_FOUR_BET_RU_OWNED_DECISION_IDS].sort(), EXPECTED_DECISION_IDS);
  assert.deepEqual([...THREE_BET_FOUR_BET_RU_OWNED_ANCHOR_IDS].sort(), EXPECTED_ANCHOR_IDS);
  assert.deepEqual([...THREE_BET_FOUR_BET_RU_ACTIVE_FIELD_PATHS].sort(), EXPECTED_ACTIVE_FIELD_PATHS);
  assert.deepEqual(ownedDecisions.map((d) => d.id).sort(), EXPECTED_DECISION_IDS);
  assert.deepEqual(ownedAnchors.map((a) => a.id).sort(), EXPECTED_ANCHOR_IDS);
  assert.equal(new Set(EXPECTED_ACTIVE_FIELD_PATHS).size,705);
  assert.equal(EXPECTED_DECISION_IDS.filter((id) => !decisionIds.has(id)).length,0); // UNCLASSIFIED=0
});

test("A7 3BP/4BP RU projection preserves machine, EN and quantitative identity", () => {
  const rawDecisionSnapshot = clone(ownedDecisions);
  const rawAnchorSnapshot = clone(ownedAnchors);
  for (const raw of ownedDecisions) {
    const projected = projectThreeBetFourBetSystemicRuDecision(raw);
    assert.deepEqual(machineDecision(projected), machineDecision(raw), `${raw.id}: machine/scoring identity`);
    assert.deepEqual(enDecision(projected), enDecision(raw), `${raw.id}: EN identity`);
    assert.equal(projected.correctActionId,raw.correctActionId); assert.equal(projected.correctReasonId,raw.correctReasonId);
    assert.deepEqual(projected.sourceRefs,raw.sourceRefs); assert.deepEqual(projected.assumptions,raw.assumptions);
    assert.deepEqual(projected.changedVariables,raw.changedVariables); assert.equal(projected.targetSeconds,raw.targetSeconds);
    assert.deepEqual(projected.actionOptions.map((o) => [o.id,o.misconception]),raw.actionOptions.map((o) => [o.id,o.misconception]));
    assert.deepEqual(projected.reasonOptions.map((o) => [o.id,o.misconception]),raw.reasonOptions.map((o) => [o.id,o.misconception]));
    const before = new Map(decisionRuEntries(raw));
    for (const [path,text] of decisionRuEntries(projected)) assert.deepEqual(quantitativeTokens(text),quantitativeTokens(before.get(path) ?? ""),`${path}: numeric identity`);
    assert.strictEqual(projectThreeBetFourBetSystemicRuDecision(projected),projected,`${raw.id}: idempotence`);
  }
  for (const raw of ownedAnchors) {
    const projected = projectThreeBetFourBetSystemicRuAnchor(raw);
    assert.deepEqual(machineAnchor(projected),machineAnchor(raw),`${raw.id}: machine identity`);
    const before = new Map(anchorRuEntries(raw));
    for (const [path,text] of anchorRuEntries(projected)) assert.deepEqual(quantitativeTokens(text),quantitativeTokens(before.get(path) ?? ""),`${path}: numeric identity`);
    assert.strictEqual(projectThreeBetFourBetSystemicRuAnchor(projected),projected,`${raw.id}: idempotence`);
  }
  assert.deepEqual(ownedDecisions,rawDecisionSnapshot,"raw decisions mutated");
  assert.deepEqual(ownedAnchors,rawAnchorSnapshot,"raw anchors mutated");
});

test("A7 3BP/4BP learner RU has zero English, hybrid and source-ID residuals", () => {
  const entries = [
    ...ownedDecisions.flatMap((d) => decisionRuEntries(projectThreeBetFourBetSystemicRuDecision(d))),
    ...ownedAnchors.flatMap((a) => anchorRuEntries(projectThreeBetFourBetSystemicRuAnchor(a))),
  ];
  assert.equal(entries.length,705);
  assert.deepEqual(entries.map(([path]) => path).sort(),EXPECTED_ACTIVE_FIELD_PATHS);
  assert.deepEqual(residuals(entries),[]); // REVIEW=0 and HYBRID_RESIDUAL_FIELDS=0
});

test("A7 3BP/4BP projection is pass-through outside ownership and owns no A8", () => {
  const unmapped = postflopAndLiveDecisions.find((d) => !decisionIds.has(d.id));
  const unmappedAnchor = laterWaveAnchors.find((a) => !anchorIds.has(a.id));
  assert.ok(unmapped); assert.ok(unmappedAnchor);
  assert.strictEqual(projectThreeBetFourBetSystemicRuDecision(unmapped),unmapped);
  assert.strictEqual(projectThreeBetFourBetSystemicRuAnchor(unmappedAnchor),unmappedAnchor);
  const syntheticBase = ownedDecisions.find((d) => d.id.includes("-A7-"));
  assert.ok(syntheticBase);
  const syntheticA8 = {...syntheticBase,id:syntheticBase.id.replace("-A7-","-A8-")};
  assert.strictEqual(projectThreeBetFourBetSystemicRuDecision(syntheticA8),syntheticA8);
  assert.equal(THREE_BET_FOUR_BET_RU_OWNED_DECISION_IDS.some((id) => id.includes("-A8-")),false);
});
