import assert from "node:assert/strict";
import test from "node:test";
import { variationB3Decisions } from "../content/practical-mastery/decisions-variation-b3.ts";
import { liveEdgeB4Decisions } from "../content/practical-mastery/decisions-live-edge-b4.ts";
import { balanceB3AssessmentOptions } from "../content/practical-mastery/b3-assessment-integrity.ts";
import {
  practicalRuSystemicB3DecisionPatches,
  practicalRuSystemicB4DecisionPatches,
  applyPracticalRuSystemicB3DecisionProjection,
  applyPracticalRuSystemicB4DecisionProjection,
} from "../content/practical-mastery/practical-ru-systemic-b3-b4-publication.ts";

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

const b3Ids = variationB3Decisions.map((d) => d.id);
const b4Ids = liveEdgeB4Decisions.map((d) => d.id);

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

const APPROVED_NOTATION = /\b(?:EV|IP|OOP|SPR|BB|SB|BTN|CO|HJ|UTG|EP)\b/gu;
const BET_NOTATION = /\b(?:3|4|5)-?bet(?:s|ting|-or-fold)?\b/giu;
const BB_UNIT_NOTATION = /\d+(?:\.\d+)?bb\b/giu;

function stripApprovedNotation(text) {
  return text.replace(BB_UNIT_NOTATION, "").replace(APPROVED_NOTATION, "").replace(BET_NOTATION, "");
}

function sourceIdResidual(text) {
  return /(?:FTGU-E\d+|LCM-\d+|CP-G3-L\d+|CINJ-E\d+|SLC-[A-Z0-9-]+|EXT-[A-Z0-9-]+)/u.test(text);
}

function numericTokens(text) {
  const withoutNonQuantitativeNotation = text
    .replace(/(?:FTGU-E\d+|LCM-\d+|CP-G3-L\d+|CINJ-E\d+|SLC-[A-Z0-9-]+|EXT-[A-Z0-9-]+)/gu, "")
    .replace(/\b(?:3|4|5)-?bet(?:s|ting|-or-fold)?\b/giu, "")
    .replace(/\b(?:3|4|5)BP\b/giu, "")
    .replace(/(?:3|4|5)-?бет(?:ы|ов|ам|ами|ах|а|у|ом|е)?(?:-банк(?:е|а|у|ом)?)?/giu, "");
  return withoutNonQuantitativeNotation.match(/\d+(?:[.,]\d+)?%?/gu) ?? [];
}

function optionMachineIdentity(options) {
  return options.map((option) => ({ id: option.id, misconception: option.misconception, textEn: option.textEn }));
}

function buildSuite(name, rawDecisions, ids, patches, applyProjection, expectedDecisionCount, expectedFieldCount) {
  const rawById = new Map(rawDecisions.map((d) => [d.id, d]));
  const rawSnapshot = JSON.stringify(rawDecisions);

  test(`${name} canonical raw authority is exactly ${expectedDecisionCount} decisions`, () => {
    assert.equal(rawDecisions.length, expectedDecisionCount);
    assert.equal(new Set(ids).size, expectedDecisionCount, `${name}: duplicate raw ids`);
  });

  test(`${name} UNCLASSIFIED=0: every raw decision owns a patch covering all 9 field paths`, () => {
    assert.equal(patches.size, expectedDecisionCount);
    let fixFields = 0;
    const unpatched = [];
    for (const id of ids) {
      const patch = patches.get(id);
      assert.ok(patch, `${name}: missing patch for ${id}`);
      const owned = new Set(patchPaths(patch));
      fixFields += owned.size;
      for (const path of fieldPaths) {
        if (!owned.has(path)) unpatched.push(`${id}:${path}`);
      }
    }
    assert.equal(expectedDecisionCount * fieldPaths.length, expectedFieldCount);
    assert.equal(fixFields, expectedFieldCount);
    assert.deepEqual(unpatched, []);
  });

  test(`${name} exact owned ID set matches raw authority IDs`, () => {
    assert.deepEqual([...patches.keys()], ids);
  });

  test(`${name} projection applies every owned field exactly as authored`, () => {
    for (const id of ids) {
      const raw = rawById.get(id);
      const projected = applyProjection(raw);
      const patch = patches.get(id);
      for (const path of patchPaths(patch)) {
        const expected = path.startsWith("action:")
          ? patch.actionOptions[path.slice("action:".length)]
          : path.startsWith("reason:")
            ? patch.reasonOptions[path.slice("reason:".length)]
            : patch[path];
        assert.equal(fieldValue(projected, path), expected, `${id} ${path}`);
      }
    }
  });

  test(`${name} HYBRID_RESIDUAL_FIELDS=0: zero ordinary-English residue outside approved poker notation`, () => {
    for (const id of ids) {
      const projected = applyProjection(rawById.get(id));
      for (const [field, text] of learnerRuFields(projected)) {
        assert.doesNotMatch(stripApprovedNotation(text), /[A-Za-z]/u, `${id} ${field}: ${text}`);
      }
    }
  });

  test(`${name} LEARNER_VISIBLE_SOURCE_ID_RESIDUAL=0`, () => {
    for (const id of ids) {
      const projected = applyProjection(rawById.get(id));
      for (const [field, text] of learnerRuFields(projected)) {
        assert.ok(!sourceIdResidual(text), `${id} ${field}: ${text}`);
      }
    }
  });

  test(`${name} NUMERIC_SEMANTICS_CHANGED=FALSE`, () => {
    for (const id of ids) {
      const raw = rawById.get(id);
      const projected = applyProjection(raw);
      for (const path of fieldPaths) {
        assert.deepEqual(numericTokens(fieldValue(projected, path) ?? ""), numericTokens(fieldValue(raw, path) ?? ""), `${id} ${path}`);
      }
    }
  });

  test(`${name} semantic firewall preserves scoring, sources, option, EN, misconception and changed-variable identity`, () => {
    for (const id of ids) {
      const raw = rawById.get(id);
      const projected = applyProjection(raw);
      assert.equal(projected.id, raw.id);
      assert.equal(projected.skillId, raw.skillId);
      assert.equal(projected.kind, raw.kind);
      assert.equal(projected.correctActionId, raw.correctActionId);
      assert.equal(projected.correctReasonId, raw.correctReasonId);
      assert.deepEqual(projected.sourceRefs, raw.sourceRefs);
      assert.deepEqual(projected.changedVariables, raw.changedVariables);
      assert.deepEqual(optionMachineIdentity(projected.actionOptions), optionMachineIdentity(raw.actionOptions));
      assert.deepEqual(optionMachineIdentity(projected.reasonOptions), optionMachineIdentity(raw.reasonOptions));
      assert.equal(projected.cueEn, raw.cueEn);
      assert.equal(projected.questionEn, raw.questionEn);
      assert.equal(projected.explanationEn, raw.explanationEn);
      assert.equal(projected.targetSeconds, raw.targetSeconds);
      assert.deepEqual(projected.assumptions, raw.assumptions);
      assert.deepEqual(new Set(projected.actionOptions.map((o) => o.id)), new Set(raw.actionOptions.map((o) => o.id)));
      assert.deepEqual(new Set(projected.reasonOptions.map((o) => o.id)), new Set(raw.reasonOptions.map((o) => o.id)));
    }
  });

  test(`${name} RAW_NON_MUTATION=TRUE: raw authority array is untouched by projection`, () => {
    for (const id of ids) applyProjection(rawById.get(id));
    assert.equal(JSON.stringify(rawDecisions), rawSnapshot);
  });

  test(`${name} PROJECTION_IDEMPOTENCE=TRUE`, () => {
    for (const id of ids) {
      const raw = rawById.get(id);
      const once = applyProjection(raw);
      const twice = applyProjection(once);
      assert.deepEqual(twice, once, `${id}: projection is not idempotent`);
    }
  });

  test(`${name} UNMAPPED_PASS_THROUGH=TRUE: a decision id outside the owned set is returned unchanged`, () => {
    const foreign = {
      id: "PM-FOREIGN-999",
      cueRu: "не наш узел",
      questionRu: "не наш вопрос",
      explanationRu: "не наше объяснение",
      actionOptions: [{ id: "good", textRu: "x", textEn: "x" }],
      reasonOptions: [{ id: "goodR", textRu: "y", textEn: "y" }],
    };
    assert.deepEqual(applyProjection(foreign), foreign);
  });
}

buildSuite(
  "B3",
  variationB3Decisions,
  b3Ids,
  practicalRuSystemicB3DecisionPatches,
  applyPracticalRuSystemicB3DecisionProjection,
  80,
  720,
);

buildSuite(
  "B4",
  liveEdgeB4Decisions,
  b4Ids,
  practicalRuSystemicB4DecisionPatches,
  applyPracticalRuSystemicB4DecisionProjection,
  44,
  396,
);

test("TOTAL_OWNED_DECISIONS=124 and TOTAL_ACTIVE_FIELDS=1116 across B3+B4 staging", () => {
  assert.equal(practicalRuSystemicB3DecisionPatches.size + practicalRuSystemicB4DecisionPatches.size, 124);
  const total = [...practicalRuSystemicB3DecisionPatches.values(), ...practicalRuSystemicB4DecisionPatches.values()]
    .reduce((sum, patch) => sum + patchPaths(patch).length, 0);
  assert.equal(total, 1116);
});

test("B3 and B4 staging maps do not collide on any decision ID", () => {
  const overlap = [...practicalRuSystemicB3DecisionPatches.keys()].filter((id) => practicalRuSystemicB4DecisionPatches.has(id));
  assert.deepEqual(overlap, []);
});

test("B3_ASSESSMENT_BALANCING_UNTOUCHED=TRUE: projected B3 corpus still balances cleanly through the existing firewall", () => {
  const projected = variationB3Decisions.map((d) => applyPracticalRuSystemicB3DecisionProjection(d));
  const balanced = balanceB3AssessmentOptions(projected);
  assert.equal(balanced.length, projected.length);
  for (let i = 0; i < projected.length; i += 1) {
    assert.equal(balanced[i].correctActionId, projected[i].correctActionId);
    assert.equal(balanced[i].correctReasonId, projected[i].correctReasonId);
    assert.deepEqual(new Set(balanced[i].actionOptions.map((o) => o.id)), new Set(projected[i].actionOptions.map((o) => o.id)));
    assert.deepEqual(new Set(balanced[i].reasonOptions.map((o) => o.id)), new Set(projected[i].reasonOptions.map((o) => o.id)));
  }
});

test("B3 guard: source default remains a baseline, not a universal rule (no unqualified 'always/never' phrasing in the good direction)", () => {
  for (const id of b3Ids) {
    const projected = applyPracticalRuSystemicB3DecisionProjection(variationB3Decisions.find((d) => d.id === id));
    const good = projected.actionOptions.find((o) => o.id === projected.correctActionId)?.textRu ?? "";
    assert.doesNotMatch(good, /\bвсегда\b|\bникогда\b/iu, `${id}: good action reads as a universal rule`);
  }
});

test("B3 guard: 'changed' kind decisions carry explicit non-empty changedVariables (material variable drives the node)", () => {
  for (const raw of variationB3Decisions) {
    if (raw.kind === "changed") {
      assert.ok(Array.isArray(raw.changedVariables) && raw.changedVariables.length > 0, `${raw.id}: changed decision missing changedVariables`);
    }
  }
});

test("B4 guard: no universal live-player stereotype phrasing in projected learner copy", () => {
  const stereotypes = /живые игроки всегда|лайв-игроки всегда|любой лайв-стол|каждый лайв-игрок/iu;
  for (const id of b4Ids) {
    const projected = applyPracticalRuSystemicB4DecisionProjection(liveEdgeB4Decisions.find((d) => d.id === id));
    for (const [field, text] of learnerRuFields(projected)) {
      assert.doesNotMatch(text, stereotypes, `${id} ${field}: reads as a universal live-player stereotype`);
    }
  }
});

test("B4 guard: RIV-03 (price does not create bluffs) keeps price and bluff-supply as distinct causal terms", () => {
  const projected = applyPracticalRuSystemicB4DecisionProjection(liveEdgeB4Decisions.find((d) => d.id === "PM-B4-RIV03-101"));
  assert.match(projected.explanationRu, /цена/iu);
  assert.match(projected.explanationRu, /блеф/iu);
  assert.doesNotMatch(projected.explanationRu, /цена\s+создаёт\s+блеф/iu);
});

test("B4 guard: RIV-01 (value sizing targets worse continues, not a generic label) avoids a blanket 'always pays' claim", () => {
  const projected = applyPracticalRuSystemicB4DecisionProjection(liveEdgeB4Decisions.find((d) => d.id === "PM-B4-RIV01-101"));
  const good = projected.actionOptions.find((o) => o.id === projected.correctActionId)?.textRu ?? "";
  assert.doesNotMatch(good, /любой размер|всегда платит/iu);
});

test("B4 guard: deep-stack numeric ceilings (100bb/200bb/250bb/300bb) are preserved verbatim from raw authority", () => {
  const deepIds = ["PM-B4-PF01-101", "PM-B4-PF06-101", "PM-B4-OOP02-101", "PM-B4-3BP05-101"];
  for (const id of deepIds) {
    const raw = liveEdgeB4Decisions.find((d) => d.id === id);
    const projected = applyPracticalRuSystemicB4DecisionProjection(raw);
    assert.deepEqual(numericTokens(projected.cueRu), numericTokens(raw.cueEn), `${id}: deep-stack numbers drifted from source`);
  }
});
