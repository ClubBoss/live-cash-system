import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { practicalDecisionById } from "../content/practical-mastery";
import { preflopLiveExpansionDecisions } from "../content/practical-mastery/decisions-preflop-live-expansion";
import {
  applyPracticalRuSystemicPreflopLivePf09DecisionProjection,
  practicalRuSystemicPreflopLivePf09DecisionPatches,
} from "../content/practical-mastery/practical-ru-systemic-preflop-live-pf09-publication";
import {
  applyPracticalRuSystemicPreflopLivePf10DecisionProjection,
  practicalRuSystemicPreflopLivePf10DecisionPatches,
} from "../content/practical-mastery/practical-ru-systemic-preflop-live-pf10-publication";

const pf09Ids = [
  "PM-PF-09-101",
  "PM-PF-09-102",
  "PM-PF-09-103",
  "PM-PF-09-104",
  "PM-PF-09-105",
  "PM-PF-09-106",
  "PM-PF-09-107",
  "PM-PF-09-108",
];

const pf10Ids = [
  "PM-PF-10-101",
  "PM-PF-10-102",
  "PM-PF-10-103",
  "PM-PF-10-104",
  "PM-PF-10-105",
  "PM-PF-10-106",
  "PM-PF-10-107",
  "PM-PF-10-108",
];

const ownedIds = [...pf09Ids, ...pf10Ids];
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
const expectedRawSourceBlob = "a3235dd7fad88110eb165f5848e180cca586cbf2";
const rawAuthoritySnapshot = JSON.stringify(preflopLiveExpansionDecisions);

const rawById = new Map(
  preflopLiveExpansionDecisions
    .filter((decision) => ownedIds.includes(decision.id))
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

function patchExpectedValue(patch, path) {
  if (path.startsWith("action:")) return patch.actionOptions[path.slice("action:".length)];
  if (path.startsWith("reason:")) return patch.reasonOptions[path.slice("reason:".length)];
  return patch[path];
}

function stripApprovedPokerNotation(text) {
  return text.replace(/\b(?:EV|IP|OOP|SPR|BB|BTN|SB|UTG|HJ|CO)\b/giu, "");
}

function stripNonQuantitativeLabels(text) {
  return text
    .replace(/(?:SLC-M\d+-L\d+|FTGU-E\d+|CINJ-E\d+|LCM-\d+|EXT-[A-Z0-9-]+|\bE\d+\b)/gu, "")
    .replace(/\b(?:3|4|5)-?bet(?:s|ting|-or-fold)?\b/giu, "")
    .replace(/(?:3|4|5)-?бет(?:ы|ов|ам|ами|ах|а|у|ом|е)?/giu, "");
}

function numericTokens(text) {
  return stripNonQuantitativeLabels(text).match(/\d+(?:[.,]\d+)?%?/gu) ?? [];
}

function semanticIdentity(decision) {
  return {
    id: decision.id,
    skillId: decision.skillId,
    learnerEligibility: decision.learnerEligibility,
    kind: decision.kind,
    sourceRefs: decision.sourceRefs,
    assumptions: decision.assumptions,
    cueEn: decision.cueEn,
    questionEn: decision.questionEn,
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
    correctActionId: decision.correctActionId,
    correctReasonId: decision.correctReasonId,
    explanationEn: decision.explanationEn,
    changedVariables: decision.changedVariables,
    targetSeconds: decision.targetSeconds,
  };
}

function gitBlobSha(buffer) {
  const header = Buffer.from(`blob ${buffer.length}\0`, "utf8");
  return createHash("sha1").update(header).update(buffer).digest("hex");
}

test("PF09/PF10 raw preflop-live authority remains locked", async () => {
  const source = await readFile(new URL("../content/practical-mastery/decisions-preflop-live-expansion.ts", import.meta.url));
  assert.equal(gitBlobSha(source), expectedRawSourceBlob);
  assert.equal(JSON.stringify(preflopLiveExpansionDecisions), rawAuthoritySnapshot);
});

test("PF09/PF10 exact ownership is 16 decisions / 144 active RU fields with REVIEW=0", () => {
  assert.equal(rawById.size, 16);
  assert.deepEqual([...practicalRuSystemicPreflopLivePf09DecisionPatches.keys()], pf09Ids);
  assert.deepEqual([...practicalRuSystemicPreflopLivePf10DecisionPatches.keys()], pf10Ids);

  const units = [
    ["PF09", pf09Ids, practicalRuSystemicPreflopLivePf09DecisionPatches],
    ["PF10", pf10Ids, practicalRuSystemicPreflopLivePf10DecisionPatches],
  ];
  let activeFields = 0;
  let review = 0;
  for (const [label, ids, patches] of units) {
    let unitFields = 0;
    for (const id of ids) {
      const patch = patches.get(id);
      assert.ok(patch, `${label} missing ${id}`);
      const owned = patchPaths(patch);
      unitFields += owned.length;
      review += fieldPaths.filter((path) => !owned.includes(path)).length;
      assert.deepEqual(owned, fieldPaths, `${label} ${id} owned paths`);
    }
    assert.equal(unitFields, 72, `${label} active fields`);
    activeFields += unitFields;
  }
  assert.equal(activeFields, 144);
  assert.equal(review, 0);
});

test("PF09/PF10 accepted projections are the exact final-composed learner values", () => {
  const units = [
    [pf09Ids, practicalRuSystemicPreflopLivePf09DecisionPatches],
    [pf10Ids, practicalRuSystemicPreflopLivePf10DecisionPatches],
  ];
  for (const [ids, patches] of units) {
    for (const id of ids) {
      const finalDecision = practicalDecisionById.get(id);
      const patch = patches.get(id);
      assert.ok(finalDecision, `missing final-composed ${id}`);
      assert.ok(patch, `missing accepted projection ${id}`);
      for (const path of fieldPaths) {
        assert.equal(fieldValue(finalDecision, path), patchExpectedValue(patch, path), `${id} ${path}`);
      }
    }
  }
});

test("PF09/PF10 final RU has zero learner-visible source IDs and zero unapproved hybrid residual", () => {
  const sourceId = /(?:SLC-M\d+-L\d+|FTGU-E\d+|CINJ-E\d+|LCM-\d+|EXT-[A-Z0-9-]+|\bE\d{2,}\b)/u;
  for (const id of ownedIds) {
    const finalDecision = practicalDecisionById.get(id);
    assert.ok(finalDecision, `missing final-composed ${id}`);
    for (const [field, value] of learnerRuFields(finalDecision)) {
      assert.doesNotMatch(value, sourceId, `${id} ${field}: ${value}`);
      assert.doesNotMatch(stripApprovedPokerNotation(value), /[A-Za-z]/u, `${id} ${field}: ${value}`);
    }
  }
});

test("PF09/PF10 numeric semantics and complete non-RU machine identity match raw authority", () => {
  for (const id of ownedIds) {
    const raw = rawById.get(id);
    const finalDecision = practicalDecisionById.get(id);
    assert.ok(raw, `missing raw ${id}`);
    assert.ok(finalDecision, `missing final-composed ${id}`);
    assert.deepEqual(semanticIdentity(finalDecision), semanticIdentity(raw), `${id} semantic identity`);
    for (const path of fieldPaths) {
      assert.deepEqual(
        numericTokens(fieldValue(finalDecision, path)),
        numericTokens(fieldValue(raw, path)),
        `${id} ${path} numeric semantics`,
      );
    }
  }
});

test("PF09/PF10 projectors are ID-local and pass through the sibling unit unchanged", () => {
  for (const id of pf10Ids) {
    const raw = rawById.get(id);
    assert.ok(raw);
    assert.equal(applyPracticalRuSystemicPreflopLivePf09DecisionProjection(raw), raw, `PF09 mutated PF10 ${id}`);
  }
  for (const id of pf09Ids) {
    const raw = rawById.get(id);
    assert.ok(raw);
    assert.equal(applyPracticalRuSystemicPreflopLivePf10DecisionProjection(raw), raw, `PF10 mutated PF09 ${id}`);
  }
});
