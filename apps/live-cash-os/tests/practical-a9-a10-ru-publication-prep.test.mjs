import assert from "node:assert/strict";
import test from "node:test";
import { liveA9ExpansionDecisions } from "../content/practical-mastery/decisions-live-a9-expansion";
import { exploitA10ExpansionDecisions } from "../content/practical-mastery/decisions-exploit-a10-expansion";
import {
  practicalRuSystemicLiveA9DecisionPatches,
  practicalRuSystemicExploitA10DecisionPatches,
  applyPracticalRuSystemicLiveA9DecisionProjection,
  applyPracticalRuSystemicExploitA10DecisionProjection,
} from "../content/practical-mastery/practical-ru-systemic-a9-a10-publication";

// Raw-authority-only staging test: never imports the composed index/practicalDecisionById.

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

const a9RawById = new Map(liveA9ExpansionDecisions.map((d) => [d.id, d]));
const a10RawById = new Map(exploitA10ExpansionDecisions.map((d) => [d.id, d]));

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
    const sourceId = /(?:FTGU-E\d+|LCM-\d+|CINJ-E\d+|SLC-[A-Z0-9-]+|EXT-[A-Z0-9-]+)/u;
    for (const id of decisionIds) {
      const finalDecision = applyProjection(rawById.get(id));
      for (const [field, text] of learnerRuFields(finalDecision)) {
        assert.doesNotMatch(text, sourceId, `${id} ${field}: ${text}`);
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

test("A9/A10 owned field totals against the prepared planner snapshot", () => {
  const a9ActiveFields = a9DecisionIds.length * fieldPaths.length;
  const a10ActiveFields = a10DecisionIds.length * fieldPaths.length;
  const total = a9ActiveFields + a10ActiveFields;

  // Real repository truth for the two dedicated -A9-/-A10- expansion corpora:
  // A9 = 7 families x 8 rows x 9 RU fields = 504; A10 = 5 families x 8 rows x 9 RU fields = 360.
  assert.equal(a9ActiveFields, 504);
  assert.equal(a10ActiveFields, 360);
  assert.equal(total, 864);

  // Prepared planner snapshot claimed A9=558 / A10=390 / TOTAL=948. Real
  // authority for the dedicated -A9-/-A10- ID-form corpora differs; report
  // the delta instead of forcing the stale snapshot values.
  const plannerSnapshot = { a9: 558, a10: 390, total: 948 };
  assert.notEqual(a9ActiveFields, plannerSnapshot.a9);
  assert.notEqual(a10ActiveFields, plannerSnapshot.a10);
  assert.notEqual(total, plannerSnapshot.total);
});
