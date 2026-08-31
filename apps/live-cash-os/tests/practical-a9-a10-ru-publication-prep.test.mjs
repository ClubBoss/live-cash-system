import assert from "node:assert/strict";
import test from "node:test";
import { liveA9ExpansionDecisions } from "../content/practical-mastery/decisions-live-a9-expansion";
import { exploitA10ExpansionDecisions } from "../content/practical-mastery/decisions-exploit-a10-expansion";
import { postflopAndLiveDecisions } from "../content/practical-mastery/decisions-w4-w13";
import { advancedPracticalAnchors } from "../content/practical-mastery/anchors-w7-w13";
import {
  practicalRuSystemicLiveA9DecisionPatches,
  practicalRuSystemicExploitA10DecisionPatches,
  practicalRuSystemicLiveA9NativeDecisionPatches,
  practicalRuSystemicExploitA10NativeDecisionPatches,
  practicalRuSystemicLiveA9AnchorPatches,
  practicalRuSystemicExploitA10AnchorPatches,
  applyPracticalRuSystemicLiveA9DecisionProjection,
  applyPracticalRuSystemicExploitA10DecisionProjection,
  applyPracticalRuSystemicLiveA9NativeDecisionProjection,
  applyPracticalRuSystemicExploitA10NativeDecisionProjection,
  applyPracticalRuSystemicLiveA9AnchorProjection,
  applyPracticalRuSystemicExploitA10AnchorProjection,
} from "../content/practical-mastery/practical-ru-systemic-a9-a10-publication";

// Raw-authority-only staging test: never imports the composed index/practicalDecisionById.
// Covers the complete A9/A10 FAMILY-owned packet: the dedicated -A9-/-A10-
// expansion corpora, the family's native W7-W13 decisions, and the family's
// W7-W13 anchors. B1/B3/perceptual/other-family content sharing these skill
// IDs is deliberately NOT absorbed here.

const A9_SKILL_IDS = ["MW-01", "MW-02", "MW-03", "MW-04", "DEEP-01", "DEEP-03", "DEEP-04"];
const A10_SKILL_IDS = ["EXP-01", "EXP-02", "EXP-03", "EXP-04", "EXP-05"];
const EXCLUDED_SKILL_IDS = ["MW-05", "DEEP-02", "EXP-06"];

const A9_PREFIXES = [
  "PM-MW-01-A9",
  "PM-MW-02-A9",
  "PM-MW-03-A9",
  "PM-MW-04-A9",
  "PM-DEEP-01-A9",
  "PM-DEEP-03-A9",
  "PM-DEEP-04-A9",
];
const A10_PREFIXES = ["PM-EXP-01-A10", "PM-EXP-02-A10", "PM-EXP-03-A10", "PM-EXP-04-A10", "PM-EXP-05-A10"];

function expectedIds(prefixes) {
  return prefixes.flatMap((prefix) => Array.from({ length: 8 }, (_, i) => `${prefix}-${101 + i}`));
}

const a9DecisionIds = expectedIds(A9_PREFIXES);
const a10DecisionIds = expectedIds(A10_PREFIXES);

const NATIVE_A9_DECISION_IDS = ["PM-MW-01-001", "PM-MW-03-001", "PM-DEEP-01-001", "PM-DEEP-01-002"];
const NATIVE_A10_DECISION_IDS = ["PM-EXP-01-001", "PM-EXP-05-001"];

const ANCHOR_A9_IDS = ["MW-01-A01", "MW-03-A01", "MW-02-A01", "DEEP-01-A01", "DEEP-01-A02", "DEEP-03-A01"];
const ANCHOR_A10_IDS = ["EXP-01-A01", "EXP-03-A01", "EXP-04-A01", "EXP-05-A01"];

const fieldPaths = [
  "cueRu",
  "questionRu",
  "explanationRu",
  "action:good",
  "action:b1",
  "action:b2",
  "reason:goodR",
  "reason:br1",
  "reason:br2",
];

const nativeFieldPaths = [
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

const a9RawById = new Map(liveA9ExpansionDecisions.map((d) => [d.id, d]));
const a10RawById = new Map(exploitA10ExpansionDecisions.map((d) => [d.id, d]));
const nativeA9RawById = new Map(
  postflopAndLiveDecisions.filter((d) => NATIVE_A9_DECISION_IDS.includes(d.id)).map((d) => [d.id, d]),
);
const nativeA10RawById = new Map(
  postflopAndLiveDecisions.filter((d) => NATIVE_A10_DECISION_IDS.includes(d.id)).map((d) => [d.id, d]),
);
const anchorA9RawById = new Map(
  advancedPracticalAnchors.filter((a) => ANCHOR_A9_IDS.includes(a.id)).map((a) => [a.id, a]),
);
const anchorA10RawById = new Map(
  advancedPracticalAnchors.filter((a) => ANCHOR_A10_IDS.includes(a.id)).map((a) => [a.id, a]),
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

function anchorPatchPaths(patch) {
  const paths = [];
  if (patch.promptRu !== undefined) paths.push("promptRu");
  if (patch.answerRu !== undefined) paths.push("answerRu");
  if (patch.rationaleRu !== undefined) paths.push("rationaleRu");
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

function anchorLearnerRuFields(anchor) {
  return [
    ["promptRu", anchor.promptRu],
    ["answerRu", anchor.answerRu],
    ["rationaleRu", anchor.rationaleRu],
  ];
}

// Approved live-poker notation per the task's semantic firewall: EV/IP/OOP/SPR,
// seat abbreviations, and numeric bb-depth units (e.g. 100bb, 150-200bb).
function stripApprovedNotation(text) {
  return text
    .replace(/\d+(?:[.,]\d+)?(?:\s*[–—-]\s*\d+(?:[.,]\d+)?)?\s*bb\b/giu, "")
    .replace(/\b(?:EV|IP|OOP|SPR|BB|SB|BTN|CO|HJ|UTG)\b/giu, "");
}

function numericTokens(text) {
  const withoutNonQuantitativeNotation = text
    .replace(/(?:FTGU-E\d+|LCM-\d+|CINJ-E\d+|SLC-[A-Z0-9-]+|EXT-[A-Z0-9-]+|\bE\d+\b)/gu, "")
    .replace(/\b(?:3|4|5)-bet(?:s|-or-fold)?\b/giu, "")
    .replace(/[345]-бет(?:ы|ов|ам|ами|ах|а|у|ом|е)?/giu, "");
  return withoutNonQuantitativeNotation.match(/\d+(?:[.,]\d+)?%?/gu) ?? [];
}

function optionMachineIdentity(options) {
  return options.map((option) => ({ id: option.id, misconception: option.misconception, textEn: option.textEn }));
}

const sourceIdPattern = /(?:FTGU-E\d+|LCM-\d+|CINJ-E\d+|SLC-[A-Z0-9-]+|EXT-[A-Z0-9-]+)/u;

for (const [label, rawDecisions, rawById, decisionIds, patches, applyProjection, skillIds] of [
  [
    "A9",
    liveA9ExpansionDecisions,
    a9RawById,
    a9DecisionIds,
    practicalRuSystemicLiveA9DecisionPatches,
    applyPracticalRuSystemicLiveA9DecisionProjection,
    A9_SKILL_IDS,
  ],
  [
    "A10",
    exploitA10ExpansionDecisions,
    a10RawById,
    a10DecisionIds,
    practicalRuSystemicExploitA10DecisionPatches,
    applyPracticalRuSystemicExploitA10DecisionProjection,
    A10_SKILL_IDS,
  ],
]) {
  test(`${label} raw authority exposes exactly the frozen owned decision IDs`, () => {
    assert.deepEqual(
      rawDecisions.map((d) => d.id).sort(),
      [...decisionIds].sort(),
    );
    for (const skillId of skillIds) {
      assert.ok(rawDecisions.some((d) => d.skillId === skillId), `missing owned skill ${skillId}`);
    }
    for (const excluded of EXCLUDED_SKILL_IDS) {
      assert.ok(!rawDecisions.some((d) => d.skillId === excluded), `${label} must not own excluded ${excluded}`);
    }
  });

  test(`${label} UNIT_ALL_ACTIVE_FIELDS_CLASSIFIED=TRUE and UNIT_REVIEW_COUNT=0`, () => {
    assert.equal(rawById.size, decisionIds.length);
    assert.equal(patches.size, decisionIds.length);

    const entries = decisionIds.map((id) => {
      const patch = patches.get(id);
      assert.ok(patch, `missing ${label} patch for ${id}`);
      return [id, patch];
    });

    const fixFields = entries.reduce((sum, [, patch]) => sum + patchPaths(patch).length, 0);
    const activeFields = decisionIds.length * fieldPaths.length;
    const unpatched = entries.flatMap(([id, patch]) => {
      const fixed = new Set(patchPaths(patch));
      return fieldPaths.filter((path) => !fixed.has(path)).map((path) => `${id}:${path}`);
    });

    assert.equal(activeFields, decisionIds.length * 9);
    assert.equal(fixFields, activeFields);
    assert.deepEqual(unpatched, []);
  });

  test(`${label} projection is idempotent and leaves raw untouched`, () => {
    for (const id of decisionIds) {
      const raw = rawById.get(id);
      const rawSnapshotBefore = JSON.stringify(raw);
      const once = applyProjection(raw);
      const twice = applyProjection(once);
      assert.deepEqual(once, twice, `${id} projection not idempotent`);
      assert.equal(JSON.stringify(raw), rawSnapshotBefore, `${id} raw mutated`);
    }
  });

  test(`${label} unmapped decisions pass through unchanged`, () => {
    const foreignDecision = rawDecisions[0];
    const fakeId = { ...foreignDecision, id: "PM-DOES-NOT-EXIST-999" };
    assert.deepEqual(applyProjection(fakeId), fakeId);
  });

  test(`${label} UNIT_CONFIRMED_RU_HYBRID_DEFECTS_REMAINING=0`, () => {
    for (const id of decisionIds) {
      const finalDecision = applyProjection(rawById.get(id));
      for (const [field, text] of learnerRuFields(finalDecision)) {
        assert.doesNotMatch(stripApprovedNotation(text), /[A-Za-z]/u, `${id} ${field}: ${text}`);
      }
    }
  });

  test(`${label} LEARNER_VISIBLE_SOURCE_ID_RESIDUAL=0`, () => {
    for (const id of decisionIds) {
      const finalDecision = applyProjection(rawById.get(id));
      for (const [field, text] of learnerRuFields(finalDecision)) {
        assert.doesNotMatch(text, sourceIdPattern, `${id} ${field}: ${text}`);
      }
    }
  });

  test(`${label} NUMERIC_SEMANTICS_CHANGED=FALSE`, () => {
    for (const id of decisionIds) {
      const raw = rawById.get(id);
      const finalDecision = applyProjection(raw);
      for (const path of fieldPaths) {
        assert.deepEqual(
          numericTokens(fieldValue(finalDecision, path) ?? ""),
          numericTokens(fieldValue(raw, path) ?? ""),
          `${id} ${path}`,
        );
      }
    }
  });

  test(`${label} semantic firewall preserves scoring, sources, option, EN, misconception and changed-variable identity`, () => {
    for (const id of decisionIds) {
      const raw = rawById.get(id);
      const finalDecision = applyProjection(raw);
      assert.ok(raw, `missing raw ${id}`);

      assert.equal(finalDecision.id, raw.id, `${id} decision id`);
      assert.equal(finalDecision.correctActionId, raw.correctActionId, `${id} correct action`);
      assert.equal(finalDecision.correctReasonId, raw.correctReasonId, `${id} correct reason`);
      assert.deepEqual(finalDecision.sourceRefs, raw.sourceRefs, `${id} source refs`);
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

  test(`${label} does not fabricate exact solver/chart frequencies`, () => {
    for (const id of decisionIds) {
      const finalDecision = applyProjection(rawById.get(id));
      for (const [, text] of learnerRuFields(finalDecision)) {
        assert.doesNotMatch(text, /\b(?:37|63|71|82)\s?%/u, `${id} invented exact frequency: ${text}`);
      }
    }
  });
}

// Gap-fill: the family's native W7-W13 decisions (a/b/c, r1/r2/r3 option IDs).
for (const [label, rawById, decisionIds, patches, applyProjection] of [
  [
    "A9-native",
    nativeA9RawById,
    NATIVE_A9_DECISION_IDS,
    practicalRuSystemicLiveA9NativeDecisionPatches,
    applyPracticalRuSystemicLiveA9NativeDecisionProjection,
  ],
  [
    "A10-native",
    nativeA10RawById,
    NATIVE_A10_DECISION_IDS,
    practicalRuSystemicExploitA10NativeDecisionPatches,
    applyPracticalRuSystemicExploitA10NativeDecisionProjection,
  ],
]) {
  test(`${label} raw authority exposes exactly the frozen owned native decision IDs`, () => {
    assert.deepEqual([...rawById.keys()].sort(), [...decisionIds].sort());
  });

  test(`${label} UNIT_ALL_ACTIVE_FIELDS_CLASSIFIED=TRUE and UNIT_REVIEW_COUNT=0`, () => {
    assert.equal(rawById.size, decisionIds.length);
    assert.equal(patches.size, decisionIds.length);

    const entries = decisionIds.map((id) => {
      const patch = patches.get(id);
      assert.ok(patch, `missing ${label} patch for ${id}`);
      return [id, patch];
    });

    const fixFields = entries.reduce((sum, [, patch]) => sum + patchPaths(patch).length, 0);
    const activeFields = decisionIds.length * nativeFieldPaths.length;
    const unpatched = entries.flatMap(([id, patch]) => {
      const fixed = new Set(patchPaths(patch));
      return nativeFieldPaths.filter((path) => !fixed.has(path)).map((path) => `${id}:${path}`);
    });

    assert.equal(activeFields, decisionIds.length * 9);
    assert.equal(fixFields, activeFields);
    assert.deepEqual(unpatched, []);
  });

  test(`${label} projection is idempotent and leaves raw untouched`, () => {
    for (const id of decisionIds) {
      const raw = rawById.get(id);
      const rawSnapshotBefore = JSON.stringify(raw);
      const once = applyProjection(raw);
      const twice = applyProjection(once);
      assert.deepEqual(once, twice, `${id} projection not idempotent`);
      assert.equal(JSON.stringify(raw), rawSnapshotBefore, `${id} raw mutated`);
    }
  });

  test(`${label} unmapped decisions pass through unchanged`, () => {
    const [firstRaw] = rawById.values();
    const fakeId = { ...firstRaw, id: "PM-DOES-NOT-EXIST-999" };
    assert.deepEqual(applyProjection(fakeId), fakeId);
  });

  test(`${label} UNIT_CONFIRMED_RU_HYBRID_DEFECTS_REMAINING=0`, () => {
    for (const id of decisionIds) {
      const finalDecision = applyProjection(rawById.get(id));
      for (const [field, text] of learnerRuFields(finalDecision)) {
        assert.doesNotMatch(stripApprovedNotation(text), /[A-Za-z]/u, `${id} ${field}: ${text}`);
      }
    }
  });

  test(`${label} LEARNER_VISIBLE_SOURCE_ID_RESIDUAL=0`, () => {
    for (const id of decisionIds) {
      const finalDecision = applyProjection(rawById.get(id));
      for (const [field, text] of learnerRuFields(finalDecision)) {
        assert.doesNotMatch(text, sourceIdPattern, `${id} ${field}: ${text}`);
      }
    }
  });

  test(`${label} NUMERIC_SEMANTICS_CHANGED=FALSE`, () => {
    for (const id of decisionIds) {
      const raw = rawById.get(id);
      const finalDecision = applyProjection(raw);
      for (const path of nativeFieldPaths) {
        assert.deepEqual(
          numericTokens(fieldValue(finalDecision, path) ?? ""),
          numericTokens(fieldValue(raw, path) ?? ""),
          `${id} ${path}`,
        );
      }
    }
  });

  test(`${label} semantic firewall preserves scoring, sources, option, EN, misconception and changed-variable identity`, () => {
    for (const id of decisionIds) {
      const raw = rawById.get(id);
      const finalDecision = applyProjection(raw);
      assert.ok(raw, `missing raw ${id}`);

      assert.equal(finalDecision.id, raw.id, `${id} decision id`);
      assert.equal(finalDecision.correctActionId, raw.correctActionId, `${id} correct action`);
      assert.equal(finalDecision.correctReasonId, raw.correctReasonId, `${id} correct reason`);
      assert.deepEqual(finalDecision.sourceRefs, raw.sourceRefs, `${id} source refs`);
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
}

// Gap-fill: the family's native W7-W13 anchors (promptRu/answerRu/rationaleRu).
for (const [label, rawById, anchorIds, patches, applyProjection] of [
  ["A9-anchor", anchorA9RawById, ANCHOR_A9_IDS, practicalRuSystemicLiveA9AnchorPatches, applyPracticalRuSystemicLiveA9AnchorProjection],
  ["A10-anchor", anchorA10RawById, ANCHOR_A10_IDS, practicalRuSystemicExploitA10AnchorPatches, applyPracticalRuSystemicExploitA10AnchorProjection],
]) {
  test(`${label} raw authority exposes exactly the frozen owned anchor IDs`, () => {
    assert.deepEqual([...rawById.keys()].sort(), [...anchorIds].sort());
  });

  test(`${label} UNIT_ALL_ACTIVE_FIELDS_CLASSIFIED=TRUE and UNIT_REVIEW_COUNT=0`, () => {
    assert.equal(rawById.size, anchorIds.length);
    assert.equal(patches.size, anchorIds.length);

    const entries = anchorIds.map((id) => {
      const patch = patches.get(id);
      assert.ok(patch, `missing ${label} patch for ${id}`);
      return [id, patch];
    });

    const fixFields = entries.reduce((sum, [, patch]) => sum + anchorPatchPaths(patch).length, 0);
    const activeFields = anchorIds.length * anchorFieldPaths.length;
    const unpatched = entries.flatMap(([id, patch]) => {
      const fixed = new Set(anchorPatchPaths(patch));
      return anchorFieldPaths.filter((path) => !fixed.has(path)).map((path) => `${id}:${path}`);
    });

    assert.equal(activeFields, anchorIds.length * 3);
    assert.equal(fixFields, activeFields);
    assert.deepEqual(unpatched, []);
  });

  test(`${label} projection is idempotent and leaves raw untouched`, () => {
    for (const id of anchorIds) {
      const raw = rawById.get(id);
      const rawSnapshotBefore = JSON.stringify(raw);
      const once = applyProjection(raw);
      const twice = applyProjection(once);
      assert.deepEqual(once, twice, `${id} projection not idempotent`);
      assert.equal(JSON.stringify(raw), rawSnapshotBefore, `${id} raw mutated`);
    }
  });

  test(`${label} unmapped anchors pass through unchanged`, () => {
    const [firstRaw] = rawById.values();
    const fakeId = { ...firstRaw, id: "DOES-NOT-EXIST-A01" };
    assert.deepEqual(applyProjection(fakeId), fakeId);
  });

  test(`${label} UNIT_CONFIRMED_RU_HYBRID_DEFECTS_REMAINING=0`, () => {
    for (const id of anchorIds) {
      const finalAnchor = applyProjection(rawById.get(id));
      for (const [field, text] of anchorLearnerRuFields(finalAnchor)) {
        assert.doesNotMatch(stripApprovedNotation(text), /[A-Za-z]/u, `${id} ${field}: ${text}`);
      }
    }
  });

  test(`${label} LEARNER_VISIBLE_SOURCE_ID_RESIDUAL=0`, () => {
    for (const id of anchorIds) {
      const finalAnchor = applyProjection(rawById.get(id));
      for (const [field, text] of anchorLearnerRuFields(finalAnchor)) {
        assert.doesNotMatch(text, sourceIdPattern, `${id} ${field}: ${text}`);
      }
    }
  });

  test(`${label} NUMERIC_SEMANTICS_CHANGED=FALSE`, () => {
    for (const id of anchorIds) {
      const raw = rawById.get(id);
      const finalAnchor = applyProjection(raw);
      for (const path of anchorFieldPaths) {
        assert.deepEqual(numericTokens(finalAnchor[path] ?? ""), numericTokens(raw[path] ?? ""), `${id} ${path}`);
      }
    }
  });

  test(`${label} semantic firewall preserves sources, EN, kind, assumptions and changed-variable identity`, () => {
    for (const id of anchorIds) {
      const raw = rawById.get(id);
      const finalAnchor = applyProjection(raw);
      assert.ok(raw, `missing raw ${id}`);

      assert.equal(finalAnchor.id, raw.id, `${id} anchor id`);
      assert.equal(finalAnchor.skillId, raw.skillId, `${id} skill id`);
      assert.equal(finalAnchor.kind, raw.kind, `${id} kind`);
      assert.deepEqual(finalAnchor.sourceRefs, raw.sourceRefs, `${id} source refs`);
      assert.deepEqual(finalAnchor.assumptions, raw.assumptions, `${id} assumptions`);
      assert.deepEqual(finalAnchor.changedVariables, raw.changedVariables, `${id} changed variables`);
      assert.equal(finalAnchor.promptEn, raw.promptEn, `${id} prompt EN`);
      assert.equal(finalAnchor.answerEn, raw.answerEn, `${id} answer EN`);
      assert.equal(finalAnchor.rationaleEn, raw.rationaleEn, `${id} rationale EN`);
    }
  });
}

test("A9/A10 owned field totals reconcile against the prepared planner snapshot", () => {
  const a9ExpansionFields = a9DecisionIds.length * fieldPaths.length; // 56 * 9 = 504
  const a9NativeFields = NATIVE_A9_DECISION_IDS.length * nativeFieldPaths.length; // 4 * 9 = 36
  const a9AnchorFields = ANCHOR_A9_IDS.length * anchorFieldPaths.length; // 6 * 3 = 18
  const a9ActiveFields = a9ExpansionFields + a9NativeFields + a9AnchorFields;

  const a10ExpansionFields = a10DecisionIds.length * fieldPaths.length; // 40 * 9 = 360
  const a10NativeFields = NATIVE_A10_DECISION_IDS.length * nativeFieldPaths.length; // 2 * 9 = 18
  const a10AnchorFields = ANCHOR_A10_IDS.length * anchorFieldPaths.length; // 4 * 3 = 12
  const a10ActiveFields = a10ExpansionFields + a10NativeFields + a10AnchorFields;

  const totalDecisions =
    a9DecisionIds.length + NATIVE_A9_DECISION_IDS.length + a10DecisionIds.length + NATIVE_A10_DECISION_IDS.length;
  const totalAnchors = ANCHOR_A9_IDS.length + ANCHOR_A10_IDS.length;
  const total = a9ActiveFields + a10ActiveFields;

  assert.equal(a9ActiveFields, 558);
  assert.equal(a10ActiveFields, 390);
  assert.equal(totalDecisions, 102);
  assert.equal(totalAnchors, 10);
  assert.equal(total, 948);

  // Reconciled with the manager's family-ownership scope: matches the
  // prepared planner snapshot exactly once native decisions + anchors are
  // included alongside the -A9-/-A10- expansion corpora.
  const plannerSnapshot = { a9: 558, a10: 390, total: 948 };
  assert.equal(a9ActiveFields, plannerSnapshot.a9);
  assert.equal(a10ActiveFields, plannerSnapshot.a10);
  assert.equal(total, plannerSnapshot.total);
});
