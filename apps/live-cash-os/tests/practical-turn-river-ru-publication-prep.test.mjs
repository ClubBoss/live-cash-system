import assert from "node:assert/strict";
import test from "node:test";
import {
  turnRiverA8ExpansionDecisions,
  laterStreetLegacySkillBridges,
} from "../content/practical-mastery/decisions-turn-river-a8-expansion";
import { postflopAndLiveDecisions } from "../content/practical-mastery/decisions-w4-w13";
import { advancedPracticalAnchors } from "../content/practical-mastery/anchors-w7-w13";
import { recognitionAndSrpAnchors } from "../content/practical-mastery/anchors-w4-w6";
import {
  practicalRuSystemicTurnRiverDecisionPatches,
  practicalRuSystemicTurnRiverAnchorPatches,
  applyPracticalRuSystemicTurnRiverDecisionProjection,
  applyPracticalRuSystemicTurnRiverAnchorProjection,
} from "../content/practical-mastery/practical-ru-systemic-turn-river-publication";

// Isolated A8 (turn/river) staging test. This deliberately imports raw
// authority content directly and applies only the isolated A8 projection —
// it must never import the composed content index (../content/practical-mastery).

const A8_FAMILY_SKILLS = ["TURN-01", "TURN-02", "TURN-03", "TURN-04", "TURN-05", "RIV-01", "RIV-02", "RIV-03", "RIV-04", "RIV-05"];

const A8_EXPANSION_IDS = A8_FAMILY_SKILLS.flatMap((skill) =>
  Array.from({ length: 8 }, (_, i) => `PM-${skill}-A8-${101 + i}`),
);

const NATIVE_DECISION_IDS = ["PM-TURN-01-001", "PM-TURN-02-001", "PM-RIV-02-001", "PM-RIV-03-001", "PM-RIV-04-001", "PM-RIV-05-001"];
const LEGACY_BRIDGE_DECISION_ID = "PM-IP-04-001";

const OWNED_DECISION_IDS = [...A8_EXPANSION_IDS, ...NATIVE_DECISION_IDS, LEGACY_BRIDGE_DECISION_ID];

const OWNED_ANCHOR_IDS = [
  "TURN-01-A01",
  "TURN-02-A01",
  "TURN-03-A01",
  "TURN-03-A02",
  "RIV-02-A01",
  "RIV-02-A02",
  "RIV-03-A01",
  "RIV-03-A02",
  "RIV-04-A01",
  "RIV-05-A01",
  "RIV-05-A02",
  "W4-RUNOUT-01-A01",
  "IP-04-A01",
];

const A7_FAMILY_SKILLS = ["3BP-01", "3BP-05", "4BP-01", "4BP-04"];

const rawDecisionById = new Map(
  [...turnRiverA8ExpansionDecisions, ...postflopAndLiveDecisions].map((decision) => [decision.id, decision]),
);
const rawAnchorById = new Map([...advancedPracticalAnchors, ...recognitionAndSrpAnchors].map((anchor) => [anchor.id, anchor]));

function decisionFieldPaths(decision) {
  return [
    "cueRu",
    "questionRu",
    "explanationRu",
    ...decision.actionOptions.map((o) => `action:${o.id}`),
    ...decision.reasonOptions.map((o) => `reason:${o.id}`),
  ];
}

const ANCHOR_FIELD_PATHS = ["promptRu", "answerRu", "rationaleRu"];

function decisionFieldValue(decision, path) {
  if (path === "cueRu" || path === "questionRu" || path === "explanationRu") return decision[path];
  const [group, id] = path.split(":");
  const options = group === "action" ? decision.actionOptions : decision.reasonOptions;
  return options.find((o) => o.id === id)?.textRu;
}

function decisionLearnerRuFields(decision) {
  return [
    ["cueRu", decision.cueRu],
    ["questionRu", decision.questionRu],
    ["explanationRu", decision.explanationRu],
    ...decision.actionOptions.map((o) => [`action:${o.id}`, o.textRu]),
    ...decision.reasonOptions.map((o) => [`reason:${o.id}`, o.textRu]),
  ];
}

function anchorLearnerRuFields(anchor) {
  return [
    ["promptRu", anchor.promptRu],
    ["answerRu", anchor.answerRu],
    ["rationaleRu", anchor.rationaleRu],
  ];
}

function stripApprovedNotation(text) {
  // "c-bet" is kept untranslated across the whole published RU corpus
  // (practical-ru-corpus-publication.ts), alongside Hero/Villain and the
  // task-approved EV/IP/OOP/SPR/BB/SB/BTN notation.
  return text.replace(/\b(?:EV|IP|OOP|SPR|BB|SB|BTN|Hero|Villain|c-bet)\b/gu, "");
}

function numericTokens(text) {
  const withoutNonQuantitativeNotation = text
    .replace(/(?:FTGU-E\d+|LCM-\d+|CINJ-E\d+|CP-G3-L\d+|SLC-[A-Z0-9-]+|EXT-[A-Z0-9-]+|\bE\d+\b)/gu, "")
    .replace(/\b3-bet(?:s|-or-fold)?\b/giu, "")
    .replace(/\b4-bet(?:s|-or-fold)?\b/giu, "")
    .replace(/3-бет(?:ы|ов|ам|ами|ах)?/giu, "")
    .replace(/4-бет(?:ы|ов|ам|ами|ах)?/giu, "");
  return withoutNonQuantitativeNotation.match(/\d+(?:[.,]\d+)?%?/gu) ?? [];
}

const SOURCE_ID_PATTERN = /(?:FTGU-E\d+|LCM-\d+|CINJ-E\d+|CP-G3-L\d+|SLC-[A-Z0-9-]+|EXT-[A-Z0-9-]+)/u;

function optionMachineIdentity(options) {
  return options.map((o) => ({ id: o.id, misconception: o.misconception, textEn: o.textEn }));
}

test("A8 owned decision and anchor ID sets match current raw authority truth", () => {
  assert.equal(turnRiverA8ExpansionDecisions.length, 80);
  assert.equal(A8_EXPANSION_IDS.length, 80);
  for (const id of A8_EXPANSION_IDS) assert.ok(rawDecisionById.has(id), `missing raw A8 expansion decision ${id}`);
  for (const decision of turnRiverA8ExpansionDecisions) assert.ok(A8_EXPANSION_IDS.includes(decision.id), `unexpected A8 expansion id ${decision.id}`);

  for (const id of NATIVE_DECISION_IDS) assert.ok(rawDecisionById.has(id), `missing native decision ${id}`);
  assert.ok(rawDecisionById.has(LEGACY_BRIDGE_DECISION_ID));

  const nativeTurnRiverInW4W13 = postflopAndLiveDecisions.filter((d) => /^(TURN|RIV)-\d+$/.test(d.skillId));
  assert.equal(nativeTurnRiverInW4W13.length, 6, "prepared planner snapshot expects exactly 6 native TURN/RIV decisions");
  assert.deepEqual(nativeTurnRiverInW4W13.map((d) => d.id).sort(), [...NATIVE_DECISION_IDS].sort());

  assert.equal(OWNED_DECISION_IDS.length, 87, "A8 owns 87 decisions total");
  assert.deepEqual([...new Set(OWNED_DECISION_IDS)], OWNED_DECISION_IDS, "no duplicate owned decision ids");

  for (const id of OWNED_ANCHOR_IDS) assert.ok(rawAnchorById.has(id), `missing raw anchor ${id}`);
  assert.equal(OWNED_ANCHOR_IDS.length, 13, "A8 owns 13 anchors");
  assert.deepEqual([...new Set(OWNED_ANCHOR_IDS)], OWNED_ANCHOR_IDS, "no duplicate owned anchor ids");

  assert.deepEqual(laterStreetLegacySkillBridges["IP-04"], ["TURN-03"]);
});

test("A8 ACTIVE_FIELDS recomputed truthfully; UNCLASSIFIED=0; REVIEW=0", () => {
  let activeFields = 0;
  for (const id of OWNED_DECISION_IDS) {
    const raw = rawDecisionById.get(id);
    assert.ok(raw, `missing raw decision ${id}`);
    activeFields += decisionFieldPaths(raw).length;
  }
  activeFields += OWNED_ANCHOR_IDS.length * ANCHOR_FIELD_PATHS.length;

  assert.equal(activeFields, 822, "ACTIVE_FIELDS must recompute to the prepared planner snapshot value");

  // UNCLASSIFIED=0: every owned field path resolves to a defined string both
  // before and after projection (nothing silently dropped).
  for (const id of OWNED_DECISION_IDS) {
    const raw = rawDecisionById.get(id);
    const projected = applyPracticalRuSystemicTurnRiverDecisionProjection(raw);
    for (const path of decisionFieldPaths(raw)) {
      assert.equal(typeof decisionFieldValue(raw, path), "string", `${id} ${path} raw UNCLASSIFIED`);
      assert.equal(typeof decisionFieldValue(projected, path), "string", `${id} ${path} projected UNCLASSIFIED`);
    }
  }
  for (const id of OWNED_ANCHOR_IDS) {
    const raw = rawAnchorById.get(id);
    const projected = applyPracticalRuSystemicTurnRiverAnchorProjection(raw);
    for (const path of ANCHOR_FIELD_PATHS) {
      assert.equal(typeof raw[path], "string", `${id} ${path} raw UNCLASSIFIED`);
      assert.equal(typeof projected[path], "string", `${id} ${path} projected UNCLASSIFIED`);
    }
  }
  // REVIEW=0: no owned id is missing a resolvable raw source, so nothing is
  // left in an unresolved review state.
  assert.equal(OWNED_DECISION_IDS.filter((id) => !rawDecisionById.has(id)).length, 0);
  assert.equal(OWNED_ANCHOR_IDS.filter((id) => !rawAnchorById.has(id)).length, 0);
});

test("A8 zero learner RU hybrid residual and zero learner-visible source-ID residual after projection", () => {
  for (const id of OWNED_DECISION_IDS) {
    const raw = rawDecisionById.get(id);
    const projected = applyPracticalRuSystemicTurnRiverDecisionProjection(raw);
    for (const [field, text] of decisionLearnerRuFields(projected)) {
      assert.doesNotMatch(stripApprovedNotation(text), /[A-Za-z]/u, `${id} ${field} hybrid residual: ${text}`);
      assert.doesNotMatch(text, SOURCE_ID_PATTERN, `${id} ${field} source-id residual: ${text}`);
    }
  }
  for (const id of OWNED_ANCHOR_IDS) {
    const raw = rawAnchorById.get(id);
    const projected = applyPracticalRuSystemicTurnRiverAnchorProjection(raw);
    for (const [field, text] of anchorLearnerRuFields(projected)) {
      assert.doesNotMatch(stripApprovedNotation(text), /[A-Za-z]/u, `${id} ${field} hybrid residual: ${text}`);
      assert.doesNotMatch(text, SOURCE_ID_PATTERN, `${id} ${field} source-id residual: ${text}`);
    }
  }
});

test("A8 numeric semantics unchanged by projection", () => {
  for (const id of OWNED_DECISION_IDS) {
    const raw = rawDecisionById.get(id);
    const projected = applyPracticalRuSystemicTurnRiverDecisionProjection(raw);
    for (const path of decisionFieldPaths(raw)) {
      assert.deepEqual(
        numericTokens(decisionFieldValue(projected, path)),
        numericTokens(decisionFieldValue(raw, path)),
        `${id} ${path} numeric drift`,
      );
    }
  }
  for (const id of OWNED_ANCHOR_IDS) {
    const raw = rawAnchorById.get(id);
    const projected = applyPracticalRuSystemicTurnRiverAnchorProjection(raw);
    for (const path of ANCHOR_FIELD_PATHS) {
      assert.deepEqual(numericTokens(projected[path]), numericTokens(raw[path]), `${id} ${path} numeric drift`);
    }
  }
  // 3-bet/4-bet notation must not be treated as quantitative just because it contains digits.
  assert.deepEqual(numericTokens("3-бет и 4-бет не меняют исход"), []);
});

test("A8 river ancestry/bluff-supply causal proposition preserved (price sets threshold; ancestry controls supply)", () => {
  const bannedCollapse = /цен[а-я]*[^.]{0,40}(создаёт|обеспечивает|гарантирует)[^.]{0,40}блеф/iu;

  const riv03Family = practicalRuSystemicTurnRiverDecisionPatches.get("PM-RIV-03-A8-101");
  assert.ok(riv03Family);
  const riv03SignalText = riv03Family.actionOptions.good;
  assert.match(riv03SignalText, /цена/iu);
  assert.match(riv03SignalText, /запас блефов/iu);
  assert.doesNotMatch(riv03SignalText, bannedCollapse);

  const riv03Explanation = riv03Family.explanationRu;
  assert.match(riv03Explanation, /эквити/iu);
  assert.match(riv03Explanation, /блеф/iu);
  assert.doesNotMatch(riv03Explanation, bannedCollapse);

  const pmRiv03001 = practicalRuSystemicTurnRiverDecisionPatches.get("PM-RIV-03-001");
  assert.ok(pmRiv03001);
  assert.match(pmRiv03001.reasonOptions.r1, /блок/iu);
  assert.doesNotMatch(pmRiv03001.reasonOptions.r1, bannedCollapse);

  const riv03A02 = practicalRuSystemicTurnRiverAnchorPatches.get("RIV-03-A02");
  assert.ok(riv03A02);
  assert.match(riv03A02.answerRu, /линия|блокер/iu);
  assert.doesNotMatch(riv03A02.answerRu, bannedCollapse);

  for (const id of OWNED_DECISION_IDS) {
    const raw = rawDecisionById.get(id);
    const projected = applyPracticalRuSystemicTurnRiverDecisionProjection(raw);
    for (const path of decisionFieldPaths(raw)) {
      assert.doesNotMatch(decisionFieldValue(projected, path), bannedCollapse, `${id} ${path} collapses price into bluff supply`);
    }
  }
});

test("A8 UNIT_ALL_FIX_ITEMS_REPAIRED=TRUE (every patched field lands on the composed decision)", () => {
  for (const id of OWNED_DECISION_IDS) {
    const raw = rawDecisionById.get(id);
    const patch = practicalRuSystemicTurnRiverDecisionPatches.get(id);
    assert.ok(patch, `missing A8 patch for ${id}`);
    const projected = applyPracticalRuSystemicTurnRiverDecisionProjection(raw);

    if (patch.cueRu !== undefined) assert.equal(projected.cueRu, patch.cueRu, `${id} cueRu`);
    if (patch.questionRu !== undefined) assert.equal(projected.questionRu, patch.questionRu, `${id} questionRu`);
    if (patch.explanationRu !== undefined) assert.equal(projected.explanationRu, patch.explanationRu, `${id} explanationRu`);
    for (const [optId, textRu] of Object.entries(patch.actionOptions ?? {})) {
      assert.equal(projected.actionOptions.find((o) => o.id === optId)?.textRu, textRu, `${id} action:${optId}`);
    }
    for (const [optId, textRu] of Object.entries(patch.reasonOptions ?? {})) {
      assert.equal(projected.reasonOptions.find((o) => o.id === optId)?.textRu, textRu, `${id} reason:${optId}`);
    }
  }
  for (const id of OWNED_ANCHOR_IDS) {
    const raw = rawAnchorById.get(id);
    const patch = practicalRuSystemicTurnRiverAnchorPatches.get(id);
    assert.ok(patch, `missing A8 anchor patch for ${id}`);
    const projected = applyPracticalRuSystemicTurnRiverAnchorProjection(raw);
    if (patch.promptRu !== undefined) assert.equal(projected.promptRu, patch.promptRu, `${id} promptRu`);
    if (patch.answerRu !== undefined) assert.equal(projected.answerRu, patch.answerRu, `${id} answerRu`);
    if (patch.rationaleRu !== undefined) assert.equal(projected.rationaleRu, patch.rationaleRu, `${id} rationaleRu`);
  }
});

test("A8 semantic firewall preserves scoring, sources, option, EN, misconception, changed-variable and assumption identity", () => {
  for (const id of OWNED_DECISION_IDS) {
    const raw = rawDecisionById.get(id);
    const projected = applyPracticalRuSystemicTurnRiverDecisionProjection(raw);
    assert.equal(projected.id, raw.id, `${id} id`);
    assert.equal(projected.skillId, raw.skillId, `${id} skillId`);
    assert.equal(projected.kind, raw.kind, `${id} kind`);
    assert.equal(projected.correctActionId, raw.correctActionId, `${id} correctActionId`);
    assert.equal(projected.correctReasonId, raw.correctReasonId, `${id} correctReasonId`);
    assert.equal(projected.targetSeconds, raw.targetSeconds, `${id} targetSeconds`);
    assert.deepEqual(projected.sourceRefs, raw.sourceRefs, `${id} sourceRefs`);
    assert.deepEqual(projected.assumptions, raw.assumptions, `${id} assumptions`);
    assert.deepEqual(projected.changedVariables, raw.changedVariables, `${id} changedVariables`);
    assert.equal(projected.cueEn, raw.cueEn, `${id} cueEn`);
    assert.equal(projected.questionEn, raw.questionEn, `${id} questionEn`);
    assert.equal(projected.explanationEn, raw.explanationEn, `${id} explanationEn`);
    assert.deepEqual(optionMachineIdentity(projected.actionOptions), optionMachineIdentity(raw.actionOptions), `${id} action identity`);
    assert.deepEqual(optionMachineIdentity(projected.reasonOptions), optionMachineIdentity(raw.reasonOptions), `${id} reason identity`);
  }
  for (const id of OWNED_ANCHOR_IDS) {
    const raw = rawAnchorById.get(id);
    const projected = applyPracticalRuSystemicTurnRiverAnchorProjection(raw);
    assert.equal(projected.id, raw.id, `${id} id`);
    assert.equal(projected.skillId, raw.skillId, `${id} skillId`);
    assert.equal(projected.kind, raw.kind, `${id} kind`);
    assert.deepEqual(projected.sourceRefs, raw.sourceRefs, `${id} sourceRefs`);
    assert.deepEqual(projected.assumptions, raw.assumptions, `${id} assumptions`);
    assert.deepEqual(projected.changedVariables, raw.changedVariables, `${id} changedVariables`);
    assert.equal(projected.promptEn, raw.promptEn, `${id} promptEn`);
    assert.equal(projected.answerEn, raw.answerEn, `${id} answerEn`);
    assert.equal(projected.rationaleEn, raw.rationaleEn, `${id} rationaleEn`);
  }
});

test("A8 unmapped pass-through: ids outside the owned set are returned unchanged", () => {
  const unmapped = postflopAndLiveDecisions.find((d) => d.id === "PM-OOP-01-001");
  assert.ok(unmapped);
  const projected = applyPracticalRuSystemicTurnRiverDecisionProjection(unmapped);
  assert.deepEqual(projected, unmapped);

  const unmappedAnchor = recognitionAndSrpAnchors.find((a) => a.id === "OOP-01-A01");
  assert.ok(unmappedAnchor);
  const projectedAnchor = applyPracticalRuSystemicTurnRiverAnchorProjection(unmappedAnchor);
  assert.deepEqual(projectedAnchor, unmappedAnchor);
});

test("A8 does not own A7 (3-bet/4-bet pot) material", () => {
  for (const skill of A7_FAMILY_SKILLS) {
    for (const id of practicalRuSystemicTurnRiverDecisionPatches.keys()) {
      assert.ok(!id.includes(skill), `A8 patch map must not own A7 id ${id}`);
    }
  }
  const a7Decision = postflopAndLiveDecisions.find((d) => d.skillId === "3BP-01");
  assert.ok(a7Decision);
  assert.ok(!practicalRuSystemicTurnRiverDecisionPatches.has(a7Decision.id));
});

test("A8 projection is idempotent and does not mutate raw input", () => {
  for (const id of OWNED_DECISION_IDS.slice(0, 10)) {
    const raw = rawDecisionById.get(id);
    const rawSnapshot = structuredClone(raw);
    const once = applyPracticalRuSystemicTurnRiverDecisionProjection(raw);
    const twice = applyPracticalRuSystemicTurnRiverDecisionProjection(once);
    assert.deepEqual(twice, once, `${id} not idempotent`);
    assert.deepEqual(raw, rawSnapshot, `${id} raw input mutated`);
  }
  for (const id of OWNED_ANCHOR_IDS) {
    const raw = rawAnchorById.get(id);
    const rawSnapshot = structuredClone(raw);
    const once = applyPracticalRuSystemicTurnRiverAnchorProjection(raw);
    const twice = applyPracticalRuSystemicTurnRiverAnchorProjection(once);
    assert.deepEqual(twice, once, `${id} not idempotent`);
    assert.deepEqual(raw, rawSnapshot, `${id} raw input mutated`);
  }
});
