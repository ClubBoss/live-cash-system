import assert from "node:assert/strict";
import test from "node:test";
import {
  perceptualPracticalDecisions,
  practicalTableStates,
} from "../content/practical-mastery/perceptual-table-states";
import { b3PracticalTableStates } from "../content/practical-mastery/perceptual-table-states-b3";
import { executableGateRepairDecisions } from "../content/practical-mastery/decisions-executable-gate-repair";
import {
  practicalRuPerceptualDecisionPatches,
  applyPracticalRuPerceptualDecisionProjection,
  practicalRuPerceptualPrimaryRevealCuePatches,
  applyPracticalRuPerceptualPrimaryTableStateProjection,
  practicalRuPerceptualB3RevealCuePatches,
  applyPracticalRuPerceptualB3TableStateProjection,
  practicalRuExecutableGateRepairDecisionPatches,
  applyPracticalRuExecutableGateRepairDecisionProjection,
} from "../content/practical-mastery/practical-ru-systemic-perceptual-executable-publication";

const perceptualDecisionIds = [
  "PM-PERC-FND06-1", "PM-PERC-FND06-2",
  "PM-PERC-BL03-1", "PM-PERC-BL03-2",
  "PM-PERC-BL04-1", "PM-PERC-BL04-2",
  "PM-PERC-BOARD-1", "PM-PERC-BOARD-2",
  "PM-PERC-RUNOUT-1", "PM-PERC-RUNOUT-2",
  "PM-PERC-3BP05-1", "PM-PERC-3BP05-2",
  "PM-PERC-MW01-1", "PM-PERC-MW01-2",
  "PM-PERC-DEEP03-1", "PM-PERC-DEEP03-2",
  "PM-PERC-RIV03-1", "PM-PERC-RIV03-2",
  "PM-PERC-EXP01-1", "PM-PERC-EXP01-2",
];

const b3TableStateIds = [
  "PM-B3-PF01-101", "PM-B3-PF01-103",
  "PM-B3-PF04-101", "PM-B3-PF04-103",
  "PM-B3-PF06-101", "PM-B3-PF06-103",
  "PM-B3-PF07-101", "PM-B3-PF07-103",
  "PM-B3-OOP02-101", "PM-B3-OOP02-103",
  "PM-B3-IP01-101", "PM-B3-IP01-103",
  "PM-B3-TURN02-101", "PM-B3-TURN02-103",
  "PM-B3-TURN03-101", "PM-B3-TURN03-103",
  "PM-B3-RIV01-101", "PM-B3-RIV01-103",
  "PM-B3-MW02-101", "PM-B3-MW02-103",
  "PM-B3-DEEP01-101", "PM-B3-DEEP01-103",
];

const executableDecisionIds = ["PM-BL-05-108"];

const decisionFieldPaths = [
  "cueRu", "questionRu", "explanationRu",
  "action:good", "action:bad1", "action:bad2",
  "reason:goodR", "reason:badR1", "reason:badR2",
];

const executableFieldPaths = [
  "cueRu", "questionRu", "explanationRu",
  "action:a", "action:b", "action:c",
  "reason:r1", "reason:r2", "reason:r3",
];

const rawPerceptualById = new Map(perceptualPracticalDecisions.map((d) => [d.id, d]));
const rawPrimaryStateById = new Map(practicalTableStates.map((s) => [s.decisionId, s]));
const rawB3StateById = new Map(b3PracticalTableStates.map((s) => [s.decisionId, s]));
const rawExecutableById = new Map(executableGateRepairDecisions.map((d) => [d.id, d]));

function decisionFieldValue(decision, path) {
  if (path === "cueRu" || path === "questionRu" || path === "explanationRu") return decision[path];
  const [group, id] = path.split(":");
  const options = group === "action" ? decision.actionOptions : decision.reasonOptions;
  return options.find((option) => option.id === id)?.textRu;
}

function learnerRuFields(decision, fieldPaths) {
  return fieldPaths.map((path) => [path, decisionFieldValue(decision, path)]);
}

function optionMachineIdentity(options) {
  return options.map((option) => ({ id: option.id, misconception: option.misconception, textEn: option.textEn }));
}

function withoutRevealCueRu(state) {
  const clone = { ...state };
  delete clone.revealCueRu;
  return clone;
}

const APPROVED_ACRONYMS = /\b(?:EV|IP|OOP|SPR|BB|SB|BTN|CO|HJ|UTG|EP|Hero)\b/gu;
const BB_QUANTITY = /\d+(?:[.,]\d+)?bb\b/giu;
const CARD_RANK_SUIT = /\b[2-9TJQKA][♠♥♦♣]/gu;

function stripApprovedNotation(text) {
  return text.replace(APPROVED_ACRONYMS, "").replace(BB_QUANTITY, "").replace(CARD_RANK_SUIT, "");
}

const SOURCE_ID_PATTERN = /(?:FTGU-E\d+(?:\/E\d+)*|LCM-\d+|EXT-[A-Z0-9-]+)/u;

function numericTokens(text) {
  const withoutNonQuantitativeNotation = text
    .replace(/(?:FTGU-E\d+(?:\/E\d+)*|LCM-\d+|EXT-[A-Z0-9-]+)/gu, "")
    .replace(/\b(?:3|4|5)-?bet(?:s|ting)?\b/giu, "")
    .replace(/(?:3|4|5)-бет(?:ы|ов|ам|ами|ах|а|у|ом|е)?/giu, "")
    .replace(/\b3BP\b/gu, "");
  return withoutNonQuantitativeNotation.match(/\d+(?:[.,]\d+)?%?/gu) ?? [];
}

// ---------------------------------------------------------------------------
// A. Perceptual practical decisions
// ---------------------------------------------------------------------------

test("PERCEPTUAL raw authority is exactly the 20 owned decision IDs", () => {
  assert.deepEqual(perceptualPracticalDecisions.map((d) => d.id), perceptualDecisionIds);
  assert.equal(rawPerceptualById.size, 20);
});

test("PERCEPTUAL every decision has a patch covering all 9 learner RU fields; TOTAL=180 REVIEW=0", () => {
  assert.equal(practicalRuPerceptualDecisionPatches.size, 20);
  let fixedFields = 0;
  for (const id of perceptualDecisionIds) {
    const patch = practicalRuPerceptualDecisionPatches.get(id);
    assert.ok(patch, `missing perceptual patch for ${id}`);
    for (const path of decisionFieldPaths) {
      const value = path.startsWith("action:")
        ? patch.actionOptions?.[path.slice("action:".length)]
        : path.startsWith("reason:")
          ? patch.reasonOptions?.[path.slice("reason:".length)]
          : patch[path];
      assert.notEqual(value, undefined, `${id} missing patch field ${path}`);
      fixedFields += 1;
    }
  }
  assert.equal(perceptualDecisionIds.length * decisionFieldPaths.length, 180);
  assert.equal(fixedFields, 180);
});

test("PERCEPTUAL projection is deterministic, idempotent, non-mutating, unmapped-pass-through", () => {
  for (const id of perceptualDecisionIds) {
    const raw = rawPerceptualById.get(id);
    const rawSnapshot = structuredClone(raw);
    const projected1 = applyPracticalRuPerceptualDecisionProjection(raw);
    const projected2 = applyPracticalRuPerceptualDecisionProjection(raw);
    assert.deepEqual(raw, rawSnapshot, `${id} raw mutated`);
    assert.deepEqual(projected1, projected2, `${id} projection not idempotent`);
  }
  const unmapped = { id: "PM-NOT-OWNED", cueRu: "x", questionRu: "y", explanationRu: "z", actionOptions: [{ id: "good", textRu: "a", textEn: "a" }], reasonOptions: [{ id: "goodR", textRu: "b", textEn: "b" }], skillId: "S", kind: "recognition", sourceRefs: [], assumptions: [], cueEn: "x", questionEn: "y", explanationEn: "z", correctActionId: "good", correctReasonId: "goodR", targetSeconds: 1 };
  assert.deepEqual(applyPracticalRuPerceptualDecisionProjection(unmapped), unmapped);
});

test("PERCEPTUAL HYBRID_RESIDUAL_FIELDS=0 and LEARNER_VISIBLE_SOURCE_ID_RESIDUAL=0", () => {
  for (const id of perceptualDecisionIds) {
    const projected = applyPracticalRuPerceptualDecisionProjection(rawPerceptualById.get(id));
    for (const [path, text] of learnerRuFields(projected, decisionFieldPaths)) {
      assert.doesNotMatch(stripApprovedNotation(text), /[A-Za-z]/u, `${id} ${path} hybrid residual: ${text}`);
      assert.doesNotMatch(text, SOURCE_ID_PATTERN, `${id} ${path} source id residual: ${text}`);
    }
  }
});

test("PERCEPTUAL NUMERIC_CONFLICT_FOUND=FALSE across owned fields", () => {
  for (const id of perceptualDecisionIds) {
    const raw = rawPerceptualById.get(id);
    const projected = applyPracticalRuPerceptualDecisionProjection(raw);
    for (const path of decisionFieldPaths) {
      assert.deepEqual(
        numericTokens(decisionFieldValue(projected, path)),
        numericTokens(decisionFieldValue(raw, path)),
        `${id} ${path} numeric drift`,
      );
    }
  }
});

test("PERCEPTUAL machine identity firewall: id/skill/kind/sourceRefs/assumptions/changedVariables/option-ids/correct/EN/targetSeconds frozen", () => {
  for (const id of perceptualDecisionIds) {
    const raw = rawPerceptualById.get(id);
    const projected = applyPracticalRuPerceptualDecisionProjection(raw);
    assert.equal(projected.id, raw.id);
    assert.equal(projected.skillId, raw.skillId);
    assert.equal(projected.kind, raw.kind);
    assert.deepEqual(projected.sourceRefs, raw.sourceRefs);
    assert.deepEqual(projected.assumptions, raw.assumptions);
    assert.deepEqual(projected.changedVariables, raw.changedVariables);
    assert.equal(projected.correctActionId, raw.correctActionId);
    assert.equal(projected.correctReasonId, raw.correctReasonId);
    assert.equal(projected.targetSeconds, raw.targetSeconds);
    assert.equal(projected.cueEn, raw.cueEn);
    assert.equal(projected.questionEn, raw.questionEn);
    assert.equal(projected.explanationEn, raw.explanationEn);
    assert.deepEqual(optionMachineIdentity(projected.actionOptions), optionMachineIdentity(raw.actionOptions));
    assert.deepEqual(optionMachineIdentity(projected.reasonOptions), optionMachineIdentity(raw.reasonOptions));
  }
});

// ---------------------------------------------------------------------------
// B. Primary practicalTableStates revealCueRu
// ---------------------------------------------------------------------------

test("PRIMARY table states raw authority is exactly the 20 owned decision IDs; 20 revealCueRu fields", () => {
  assert.deepEqual(practicalTableStates.map((s) => s.decisionId), perceptualDecisionIds);
  assert.equal(practicalRuPerceptualPrimaryRevealCuePatches.size, 20);
  for (const id of perceptualDecisionIds) {
    assert.ok(practicalRuPerceptualPrimaryRevealCuePatches.has(id), `missing primary revealCueRu patch for ${id}`);
  }
});

test("PRIMARY table states projection: only revealCueRu differs, all else byte/deep-equal; idempotent; non-mutating; unmapped-pass-through", () => {
  for (const id of perceptualDecisionIds) {
    const raw = rawPrimaryStateById.get(id);
    const rawSnapshot = structuredClone(raw);
    const projected1 = applyPracticalRuPerceptualPrimaryTableStateProjection(raw);
    const projected2 = applyPracticalRuPerceptualPrimaryTableStateProjection(raw);
    assert.deepEqual(raw, rawSnapshot, `${id} raw mutated`);
    assert.deepEqual(projected1, projected2, `${id} not idempotent`);
    assert.deepEqual(withoutRevealCueRu(projected1), withoutRevealCueRu(raw), `${id} non-revealCueRu fields changed`);
    assert.equal(projected1.revealCueRu, practicalRuPerceptualPrimaryRevealCuePatches.get(id));
  }
  const unmapped = { decisionId: "PM-NOT-OWNED", scaffold: "guided", stakes: "1/3", hero: "BTN", dealer: "BTN", seats: [], actions: [], revealCueRu: "x", revealCueEn: "x" };
  assert.deepEqual(applyPracticalRuPerceptualPrimaryTableStateProjection(unmapped), unmapped);
});

test("PRIMARY table states HYBRID_RESIDUAL_FIELDS=0 and LEARNER_VISIBLE_SOURCE_ID_RESIDUAL=0", () => {
  for (const id of perceptualDecisionIds) {
    const cue = practicalRuPerceptualPrimaryRevealCuePatches.get(id);
    assert.doesNotMatch(stripApprovedNotation(cue), /[A-Za-z]/u, `${id} revealCueRu hybrid residual: ${cue}`);
    assert.doesNotMatch(cue, SOURCE_ID_PATTERN, `${id} revealCueRu source id residual: ${cue}`);
  }
});

// ---------------------------------------------------------------------------
// C. B3 companion table states revealCueRu
// ---------------------------------------------------------------------------

test("B3 table states raw authority is exactly the 22 owned decision IDs; 22 revealCueRu fields", () => {
  assert.deepEqual(b3PracticalTableStates.map((s) => s.decisionId), b3TableStateIds);
  assert.equal(practicalRuPerceptualB3RevealCuePatches.size, 22);
  for (const id of b3TableStateIds) {
    assert.ok(practicalRuPerceptualB3RevealCuePatches.has(id), `missing B3 revealCueRu patch for ${id}`);
  }
});

test("B3 table states projection: only revealCueRu differs, all else byte/deep-equal; idempotent; non-mutating; unmapped-pass-through", () => {
  for (const id of b3TableStateIds) {
    const raw = rawB3StateById.get(id);
    const rawSnapshot = structuredClone(raw);
    const projected1 = applyPracticalRuPerceptualB3TableStateProjection(raw);
    const projected2 = applyPracticalRuPerceptualB3TableStateProjection(raw);
    assert.deepEqual(raw, rawSnapshot, `${id} raw mutated`);
    assert.deepEqual(projected1, projected2, `${id} not idempotent`);
    assert.deepEqual(withoutRevealCueRu(projected1), withoutRevealCueRu(raw), `${id} non-revealCueRu fields changed`);
    assert.equal(projected1.revealCueRu, practicalRuPerceptualB3RevealCuePatches.get(id));
  }
  const unmapped = { decisionId: "PM-NOT-OWNED", scaffold: "hidden", stakes: "1/3", hero: "BTN", dealer: "BTN", seats: [], actions: [], revealCueRu: "x", revealCueEn: "x" };
  assert.deepEqual(applyPracticalRuPerceptualB3TableStateProjection(unmapped), unmapped);
});

test("B3 table states HYBRID_RESIDUAL_FIELDS=0 and LEARNER_VISIBLE_SOURCE_ID_RESIDUAL=0", () => {
  for (const id of b3TableStateIds) {
    const cue = practicalRuPerceptualB3RevealCuePatches.get(id);
    assert.doesNotMatch(stripApprovedNotation(cue), /[A-Za-z]/u, `${id} revealCueRu hybrid residual: ${cue}`);
    assert.doesNotMatch(cue, SOURCE_ID_PATTERN, `${id} revealCueRu source id residual: ${cue}`);
  }
});

// ---------------------------------------------------------------------------
// D. PM-BL-05-108
// ---------------------------------------------------------------------------

test("EXECUTABLE raw authority is exactly PM-BL-05-108 with 9 learner RU fields", () => {
  assert.deepEqual(executableGateRepairDecisions.map((d) => d.id), executableDecisionIds);
  assert.equal(practicalRuExecutableGateRepairDecisionPatches.size, 1);
  const patch = practicalRuExecutableGateRepairDecisionPatches.get("PM-BL-05-108");
  assert.ok(patch);
  for (const path of executableFieldPaths) {
    const value = path.startsWith("action:")
      ? patch.actionOptions?.[path.slice("action:".length)]
      : path.startsWith("reason:")
        ? patch.reasonOptions?.[path.slice("reason:".length)]
        : patch[path];
    assert.notEqual(value, undefined, `missing executable patch field ${path}`);
  }
  assert.equal(executableFieldPaths.length, 9);
});

test("EXECUTABLE projection deterministic, idempotent, non-mutating, unmapped-pass-through", () => {
  const raw = rawExecutableById.get("PM-BL-05-108");
  const rawSnapshot = structuredClone(raw);
  const projected1 = applyPracticalRuExecutableGateRepairDecisionProjection(raw);
  const projected2 = applyPracticalRuExecutableGateRepairDecisionProjection(raw);
  assert.deepEqual(raw, rawSnapshot);
  assert.deepEqual(projected1, projected2);
  const unmapped = { id: "PM-NOT-OWNED", cueRu: "x", questionRu: "y", explanationRu: "z", actionOptions: [{ id: "a", textRu: "a", textEn: "a" }], reasonOptions: [{ id: "r1", textRu: "b", textEn: "b" }], skillId: "S", kind: "changed", sourceRefs: [], assumptions: [], cueEn: "x", questionEn: "y", explanationEn: "z", correctActionId: "a", correctReasonId: "r1", targetSeconds: 1 };
  assert.deepEqual(applyPracticalRuExecutableGateRepairDecisionProjection(unmapped), unmapped);
});

test("EXECUTABLE HYBRID_RESIDUAL_FIELDS=0 and LEARNER_VISIBLE_SOURCE_ID_RESIDUAL=0", () => {
  const projected = applyPracticalRuExecutableGateRepairDecisionProjection(rawExecutableById.get("PM-BL-05-108"));
  for (const [path, text] of learnerRuFields(projected, executableFieldPaths)) {
    assert.doesNotMatch(stripApprovedNotation(text), /[A-Za-z]/u, `PM-BL-05-108 ${path} hybrid residual: ${text}`);
    assert.doesNotMatch(text, SOURCE_ID_PATTERN, `PM-BL-05-108 ${path} source id residual: ${text}`);
  }
});

test("EXECUTABLE machine identity and numeric identity frozen", () => {
  const raw = rawExecutableById.get("PM-BL-05-108");
  const projected = applyPracticalRuExecutableGateRepairDecisionProjection(raw);
  assert.equal(projected.id, raw.id);
  assert.equal(projected.skillId, raw.skillId);
  assert.equal(projected.kind, raw.kind);
  assert.deepEqual(projected.sourceRefs, raw.sourceRefs);
  assert.deepEqual(projected.assumptions, raw.assumptions);
  assert.deepEqual(projected.changedVariables, raw.changedVariables);
  assert.equal(projected.correctActionId, raw.correctActionId);
  assert.equal(projected.correctReasonId, raw.correctReasonId);
  assert.equal(projected.targetSeconds, raw.targetSeconds);
  assert.deepEqual(optionMachineIdentity(projected.actionOptions), optionMachineIdentity(raw.actionOptions));
  assert.deepEqual(optionMachineIdentity(projected.reasonOptions), optionMachineIdentity(raw.reasonOptions));
  for (const path of executableFieldPaths) {
    assert.deepEqual(
      numericTokens(decisionFieldValue(projected, path)),
      numericTokens(decisionFieldValue(raw, path)),
    );
  }
});

test("EXECUTABLE BL-05-108 causal transfer: opener origin strength lowers fold equity / strengthens called branch, no backwards EP rule", () => {
  const patch = practicalRuExecutableGateRepairDecisionPatches.get("PM-BL-05-108");
  assert.match(patch.reasonOptions.r1, /фолд-эквити/u);
  assert.match(patch.reasonOptions.r1, /ветк[уи]/u);
  assert.match(patch.actionOptions.a, /избирательн|уй[дт]и из блеф/u);
  assert.doesNotMatch(patch.actionOptions.a, /автоматич/iu);
  // action "b" (widen automatically) must remain the wrong, backwards option
  assert.match(patch.actionOptions.b, /автоматич/iu);
  const raw = rawExecutableById.get("PM-BL-05-108");
  assert.equal(raw.correctActionId, "a");
  assert.equal(raw.correctReasonId, "r1");
});

// ---------------------------------------------------------------------------
// Overall totals
// ---------------------------------------------------------------------------

test("TOTAL_ACTIVE_FIELDS=231 REVIEW=0 across all four owned units", () => {
  const perceptualFields = perceptualDecisionIds.length * decisionFieldPaths.length;
  const primaryFields = practicalRuPerceptualPrimaryRevealCuePatches.size;
  const b3Fields = practicalRuPerceptualB3RevealCuePatches.size;
  const executableFields = executableFieldPaths.length;
  assert.equal(perceptualFields, 180);
  assert.equal(primaryFields, 20);
  assert.equal(b3Fields, 22);
  assert.equal(executableFields, 9);
  assert.equal(perceptualFields + primaryFields + b3Fields + executableFields, 231);
});

// ---------------------------------------------------------------------------
// Targeted semantic assertions (representative high-risk mechanisms)
// ---------------------------------------------------------------------------

test("SEMANTIC: effective-stack cue names the relevant opponent, not the biggest physical stack", () => {
  const cue = practicalRuPerceptualPrimaryRevealCuePatches.get("PM-PERC-FND06-1");
  assert.match(cue, /42bb/u);
  assert.doesNotMatch(cue, /самый большой стек/iu);
});

test("SEMANTIC: BB price cue ties a larger open to worsened price / fringe defense reaction", () => {
  const patch = practicalRuPerceptualDecisionPatches.get("PM-PERC-BL03-2");
  assert.match(patch.actionOptions.good, /сужа/iu);
  assert.match(patch.explanationRu, /порог/iu);
});

test("SEMANTIC: board cue ties texture meaning to arriving/preflop ranges, not the label alone", () => {
  const patch = practicalRuPerceptualDecisionPatches.get("PM-PERC-BOARD-2");
  assert.match(patch.explanationRu, /диапазон/iu);
  assert.doesNotMatch(patch.explanationRu, /борд.*полностью определяет/iu);
});

test("SEMANTIC: runout cue ties the same turn card to different meaning via prior street action", () => {
  const patch = practicalRuPerceptualDecisionPatches.get("PM-PERC-RUNOUT-2");
  assert.match(patch.explanationRu, /вне линии|история розыгрыша/iu);
});

test("SEMANTIC: 3BP cue ties strategy to role/position, not board alone", () => {
  const patch = practicalRuPerceptualDecisionPatches.get("PM-PERC-3BP05-2");
  assert.match(patch.explanationRu, /позици/iu);
});

test("SEMANTIC: multiway cue ties strategy to closing action / players behind, not absolute IP/OOP label", () => {
  const cue = practicalRuPerceptualPrimaryRevealCuePatches.get("PM-PERC-MW01-1");
  assert.match(cue, /после его решения/iu);
});

test("SEMANTIC: deep/straddle cue ties working depth to the straddle unit, not nominal chip count", () => {
  const cue = practicalRuPerceptualPrimaryRevealCuePatches.get("PM-PERC-DEEP03-1");
  assert.match(cue, /300/u);
  assert.match(cue, /страддл/iu);
});

test("SEMANTIC: river cue states price does not manufacture bluffs", () => {
  const patch = practicalRuPerceptualDecisionPatches.get("PM-PERC-RIV03-1");
  assert.match(patch.explanationRu, /цена сама по себе не создаёт блеф/iu);
});

test("SEMANTIC: exploit cue keeps evidence branch-specific and updateable, not a permanent read", () => {
  const patch = practicalRuPerceptualDecisionPatches.get("PM-PERC-EXP01-1");
  assert.match(patch.explanationRu, /не превращает/iu);
});
