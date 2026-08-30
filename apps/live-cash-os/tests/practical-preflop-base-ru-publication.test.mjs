import assert from "node:assert/strict";
import test from "node:test";
import {
  practicalAnchorById,
  practicalDecisionById,
} from "../content/practical-mastery";
import {
  practicalRuSystemicAnchorPatches,
  practicalRuSystemicDecisionPatches,
} from "../content/practical-mastery/practical-ru-systemic-publication";

const anchorIds = [
  "PF-01-A01", "PF-01-A02",
  "PF-02-A01", "PF-02-A02",
  "PF-03-A01", "PF-03-A02",
  "PF-04-A01", "PF-04-A02",
  "PF-05-A01", "PF-05-A02",
  "PF-06-A01", "PF-06-A02",
  "PF-07-A01", "PF-07-A02",
  "PF-08-A01", "PF-08-A02",
];

const decisionIds = [
  "PM-PF-01-001",
  "PM-PF-02-001",
  "PM-PF-03-001",
  "PM-PF-04-001",
  "PM-PF-05-001",
  "PM-PF-06-001",
  "PM-PF-07-001",
  "PM-PF-08-001",
];

const sourceRefs = new Map([
  ["PM-PF-01-001", ["FTGU-E02"]],
  ["PM-PF-02-001", ["FTGU-E03"]],
  ["PM-PF-03-001", ["FTGU-E04"]],
  ["PM-PF-04-001", ["FTGU-E05"]],
  ["PM-PF-05-001", ["FTGU-E06"]],
  ["PM-PF-06-001", ["FTGU-E15"]],
  ["PM-PF-07-001", ["FTGU-E17"]],
  ["PM-PF-08-001", ["FTGU-E18"]],
]);

function stripApprovedNotation(text) {
  return text.replace(
    /(?:FTGU-E\d+|LCM-\d+)|\b(?:Hero|EV|IP|OOP|BB|SB|BTN|HJ|UTG|CO|SPR)\b|\b(?:3|4|5)-bet\b/giu,
    "",
  );
}

function decisionText(decision) {
  return [
    decision.cueRu,
    decision.questionRu,
    decision.explanationRu,
    ...decision.actionOptions.map((option) => option.textRu),
    ...decision.reasonOptions.map((option) => option.textRu),
  ];
}

function patchFieldCount(patch) {
  return Number(patch.cueRu !== undefined)
    + Number(patch.questionRu !== undefined)
    + Number(patch.explanationRu !== undefined)
    + Object.keys(patch.actionOptions ?? {}).length
    + Object.keys(patch.reasonOptions ?? {}).length;
}

function anchorPatchFieldCount(patch) {
  return Number(patch.promptRu !== undefined)
    + Number(patch.answerRu !== undefined)
    + Number(patch.rationaleRu !== undefined);
}

test("preflop anchors/base scoped inventory stays fully classified", () => {
  const activeFields = anchorIds.length * 3 + decisionIds.length * 9;
  const anchorPatches = anchorIds.map((id) => {
    const patch = practicalRuSystemicAnchorPatches.get(id);
    assert.ok(patch, `missing closed B1 anchor patch ${id}`);
    return patch;
  });
  const decisionPatches = decisionIds.map((id) => {
    const patch = practicalRuSystemicDecisionPatches.get(id);
    assert.ok(patch, `missing closed B1 decision patch ${id}`);
    return patch;
  });
  const fixFields = anchorPatches.reduce(
    (sum, patch) => sum + anchorPatchFieldCount(patch),
    0,
  ) + decisionPatches.reduce(
    (sum, patch) => sum + patchFieldCount(patch),
    0,
  );

  assert.equal(activeFields, 120);
  assert.equal(fixFields, 109);
  assert.equal(activeFields - fixFields, 11);
  assert.equal(anchorPatches.length, anchorIds.length);
  assert.equal(decisionPatches.length, decisionIds.length);
});

test("preflop anchors/base final-composed RU has no unapproved instructional English", () => {
  for (const id of anchorIds) {
    const anchor = practicalAnchorById.get(id);
    assert.ok(anchor, `missing ${id}`);
    for (const [field, text] of [
      ["promptRu", anchor.promptRu],
      ["answerRu", anchor.answerRu],
      ["rationaleRu", anchor.rationaleRu],
    ]) {
      const prose = stripApprovedNotation(text);
      assert.doesNotMatch(prose, /[A-Za-z]/u, `${id} ${field}: ${text}`);
    }
  }

  for (const id of decisionIds) {
    const decision = practicalDecisionById.get(id);
    assert.ok(decision, `missing ${id}`);
    decisionText(decision).forEach((text, index) => {
      const prose = stripApprovedNotation(text);
      assert.doesNotMatch(prose, /[A-Za-z]/u, `${id} field#${index}: ${text}`);
    });
  }
});

test("preflop base publication preserves machine/scoring/source identities", () => {
  for (const id of decisionIds) {
    const decision = practicalDecisionById.get(id);
    assert.ok(decision, `missing ${id}`);
    assert.equal(decision.correctActionId, "a", `${id} correct action`);
    assert.equal(decision.correctReasonId, "r1", `${id} correct reason`);
    assert.deepEqual(decision.actionOptions.map((option) => option.id), ["a", "b", "c"], `${id} action ids`);
    assert.deepEqual(decision.reasonOptions.map((option) => option.id), ["r1", "r2", "r3"], `${id} reason ids`);
    assert.deepEqual(decision.sourceRefs, sourceRefs.get(id), `${id} source refs`);
  }
});
