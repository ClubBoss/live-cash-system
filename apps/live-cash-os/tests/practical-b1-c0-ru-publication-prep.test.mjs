import assert from "node:assert/strict";
import test from "node:test";
import { sourceClosureB1Decisions } from "../content/practical-mastery/decisions-source-closure-b1";
import { sourceUtilizationC0Decisions } from "../content/practical-mastery/decisions-source-utilization-c0";
import {
  practicalRuSystemicB1DecisionPatches,
  practicalRuSystemicC0DecisionPatches,
  applyPracticalRuSystemicB1DecisionProjection,
  applyPracticalRuSystemicC0DecisionProjection,
} from "../content/practical-mastery/practical-ru-systemic-b1-c0-publication";

const b1SkillIds = ["FND-04", "BL-06", "BL-07", "BL-08", "BL-09", "W4-DRAW-01", "DEEP-02", "MW-05", "EXP-06"];
const b1DecisionIds = b1SkillIds.flatMap((skill) => {
  const prefix = skill === "W4-DRAW-01" ? "PM-W4-DRAW-B1" : `PM-${skill}-B1`;
  return Array.from({ length: 8 }, (_, i) => `${prefix}-${101 + i}`);
});

const c0DecisionIds = Array.from({ length: 8 }, (_, i) => `PM-RIV-03-C0-${201 + i}`);

const fieldPaths = ["cueRu", "questionRu", "explanationRu", "action:good", "action:bad1", "action:bad2", "reason:goodR", "reason:badR1", "reason:badR2"];

const rawB1ById = new Map(sourceClosureB1Decisions.map((d) => [d.id, d]));
const rawC0ById = new Map(sourceUtilizationC0Decisions.map((d) => [d.id, d]));

// Snapshot raw authority before any projection runs, so mutation can be detected
// even though Node's module cache would otherwise return the same object reference
// on a repeat import of the same raw-authority path.
const rawB1Snapshot = structuredClone(sourceClosureB1Decisions);
const rawC0Snapshot = structuredClone(sourceUtilizationC0Decisions);

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

function stripApprovedNotation(text) {
  return text
    .replace(/\b(?:EV|IP|OOP|SPR|BB|SB|BTN|CO|HJ|UTG)\b/gu, "")
    .replace(/\b\d+(?:[.,]\d+)?bb\b/giu, "")
    .replace(/\b(?:3|4)-bet\w*\b/giu, "")
    .replace(/[34]-бет[а-яёА-ЯЁ]*/gu, "")
    .replace(/овербет[а-яёА-ЯЁ]*/gu, "")
    .replace(/блеф-кетч[а-яёА-ЯЁ]*/gu, "");
}

function numericTokens(text) {
  const withoutNonQuantitativeNotation = text
    .replace(/(?:FTGU-E\d+|LCM-\d+|CINJ-E\d+|EXT-[A-Z0-9-]+)/gu, "")
    .replace(/\b(?:3|4)-bet(?:-or-fold)?\w*\b/giu, "")
    .replace(/[34]-бет[а-яёА-ЯЁ]*/gu, "");
  return withoutNonQuantitativeNotation.match(/\d+(?:[.,]\d+)?%?/gu) ?? [];
}

function optionMachineIdentity(options) {
  return options.map((option) => ({ id: option.id, misconception: option.misconception, textEn: option.textEn }));
}

test("B1+C0 raw authority yields exactly the expected owned decision IDs and counts", () => {
  assert.equal(sourceClosureB1Decisions.length, 72, "B1_OWNED_DECISIONS");
  assert.equal(sourceUtilizationC0Decisions.length, 8, "C0_OWNED_DECISIONS");
  assert.deepEqual(sourceClosureB1Decisions.map((d) => d.id), b1DecisionIds);
  assert.deepEqual(sourceUtilizationC0Decisions.map((d) => d.id), c0DecisionIds);
  for (const skill of b1SkillIds) {
    const owned = sourceClosureB1Decisions.filter((d) => d.skillId === skill);
    assert.equal(owned.length, 8, `${skill} owns exactly 8 decisions`);
  }
  for (const d of sourceUtilizationC0Decisions) assert.equal(d.skillId, "RIV-03");
});

test("UNIT_ALL_ACTIVE_FIELDS_CLASSIFIED=TRUE and UNIT_REVIEW_COUNT=0 across the full B1+C0 packet", () => {
  assert.equal(practicalRuSystemicB1DecisionPatches.size, 72);
  assert.equal(practicalRuSystemicC0DecisionPatches.size, 8);

  const allIds = [...b1DecisionIds, ...c0DecisionIds];
  const patchesById = new Map([...practicalRuSystemicB1DecisionPatches, ...practicalRuSystemicC0DecisionPatches]);
  assert.equal(patchesById.size, 80);

  let fixFields = 0;
  const unpatched = [];
  for (const id of allIds) {
    const patch = patchesById.get(id);
    assert.ok(patch, `missing patch for ${id}`);
    const owned = new Set(patchPaths(patch));
    fixFields += owned.size;
    for (const path of fieldPaths) if (!owned.has(path)) unpatched.push(`${id}:${path}`);
  }

  const activeFields = allIds.length * fieldPaths.length;
  assert.equal(activeFields, 720, "TOTAL_ACTIVE_FIELDS");
  assert.equal(fixFields, 720, "TOTAL_ACTIVE_FIELDS all classified");
  assert.deepEqual(unpatched, [], "REVIEW=0");
});

test("B1 and C0 projections apply cleanly onto raw authority (raw imports only, no composition index)", () => {
  for (const id of b1DecisionIds) {
    const raw = rawB1ById.get(id);
    assert.ok(raw, `missing raw B1 ${id}`);
    const patch = practicalRuSystemicB1DecisionPatches.get(id);
    const projected = applyPracticalRuSystemicB1DecisionProjection(raw);
    for (const path of patchPaths(patch)) {
      const expected = path.startsWith("action:")
        ? patch.actionOptions[path.slice("action:".length)]
        : path.startsWith("reason:")
          ? patch.reasonOptions[path.slice("reason:".length)]
          : patch[path];
      assert.equal(fieldValue(projected, path), expected, `${id} ${path}`);
    }
  }
  for (const id of c0DecisionIds) {
    const raw = rawC0ById.get(id);
    assert.ok(raw, `missing raw C0 ${id}`);
    const patch = practicalRuSystemicC0DecisionPatches.get(id);
    const projected = applyPracticalRuSystemicC0DecisionProjection(raw);
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

test("HYBRID_RESIDUAL_FIELDS=0: zero ordinary-English learner residual outside approved notation", () => {
  for (const id of b1DecisionIds) {
    const decision = applyPracticalRuSystemicB1DecisionProjection(rawB1ById.get(id));
    for (const [field, text] of learnerRuFields(decision)) {
      assert.doesNotMatch(stripApprovedNotation(text), /[A-Za-z]/u, `${id} ${field}: ${text}`);
    }
  }
  for (const id of c0DecisionIds) {
    const decision = applyPracticalRuSystemicC0DecisionProjection(rawC0ById.get(id));
    for (const [field, text] of learnerRuFields(decision)) {
      assert.doesNotMatch(stripApprovedNotation(text), /[A-Za-z]/u, `${id} ${field}: ${text}`);
    }
  }
});

test("LEARNER_VISIBLE_SOURCE_ID_RESIDUAL=0", () => {
  const sourceId = /(?:FTGU-E\d+|LCM-\d+|CINJ-E\d+|EXT-[A-Z0-9-]+)/u;
  for (const id of [...b1DecisionIds, ...c0DecisionIds]) {
    const raw = rawB1ById.get(id) ?? rawC0ById.get(id);
    const decision = rawB1ById.has(id) ? applyPracticalRuSystemicB1DecisionProjection(raw) : applyPracticalRuSystemicC0DecisionProjection(raw);
    for (const [field, text] of learnerRuFields(decision)) {
      assert.doesNotMatch(text, sourceId, `${id} ${field}: ${text}`);
    }
  }
});

test("NUMERIC_SEMANTICS_CHANGED=FALSE across all owned fields", () => {
  for (const id of b1DecisionIds) {
    const raw = rawB1ById.get(id);
    const projected = applyPracticalRuSystemicB1DecisionProjection(raw);
    for (const path of fieldPaths) {
      assert.deepEqual(numericTokens(fieldValue(projected, path)), numericTokens(fieldValue(raw, path)), `${id} ${path}`);
    }
  }
  for (const id of c0DecisionIds) {
    const raw = rawC0ById.get(id);
    const projected = applyPracticalRuSystemicC0DecisionProjection(raw);
    for (const path of fieldPaths) {
      assert.deepEqual(numericTokens(fieldValue(projected, path)), numericTokens(fieldValue(raw, path)), `${id} ${path}`);
    }
  }
});

test("raw non-mutation and machine/scoring identity firewall (IDs, kind, sources, assumptions, EN, options, targetSeconds, changedVariables)", () => {
  assert.deepEqual(sourceClosureB1Decisions, rawB1Snapshot, "B1 raw authority unmutated after projections ran");
  assert.deepEqual(sourceUtilizationC0Decisions, rawC0Snapshot, "C0 raw authority unmutated after projections ran");

  for (const id of b1DecisionIds) {
    const raw = rawB1ById.get(id);
    const projected = applyPracticalRuSystemicB1DecisionProjection(raw);
    assert.notEqual(projected, raw, `${id} projection returns a new object rather than mutating raw`);
    assert.equal(projected.id, raw.id);
    assert.equal(projected.skillId, raw.skillId);
    assert.equal(projected.kind, raw.kind);
    assert.equal(projected.correctActionId, raw.correctActionId);
    assert.equal(projected.correctReasonId, raw.correctReasonId);
    assert.equal(projected.targetSeconds, raw.targetSeconds);
    assert.deepEqual(projected.sourceRefs, raw.sourceRefs);
    assert.deepEqual(projected.assumptions, raw.assumptions);
    assert.deepEqual(projected.changedVariables, raw.changedVariables);
    assert.equal(projected.cueEn, raw.cueEn);
    assert.equal(projected.questionEn, raw.questionEn);
    assert.equal(projected.explanationEn, raw.explanationEn);
    assert.deepEqual(optionMachineIdentity(projected.actionOptions), optionMachineIdentity(raw.actionOptions));
    assert.deepEqual(optionMachineIdentity(projected.reasonOptions), optionMachineIdentity(raw.reasonOptions));
  }

  for (const id of c0DecisionIds) {
    const raw = rawC0ById.get(id);
    const projected = applyPracticalRuSystemicC0DecisionProjection(raw);
    assert.notEqual(projected, raw, `${id} projection returns a new object rather than mutating raw`);
    assert.equal(projected.id, raw.id);
    assert.equal(projected.skillId, raw.skillId);
    assert.equal(projected.kind, raw.kind);
    assert.equal(projected.correctActionId, raw.correctActionId);
    assert.equal(projected.correctReasonId, raw.correctReasonId);
    assert.equal(projected.targetSeconds, raw.targetSeconds);
    assert.deepEqual(projected.sourceRefs, raw.sourceRefs);
    assert.deepEqual(projected.assumptions, raw.assumptions);
    assert.deepEqual(projected.changedVariables, raw.changedVariables);
    assert.equal(projected.cueEn, raw.cueEn);
    assert.equal(projected.questionEn, raw.questionEn);
    assert.equal(projected.explanationEn, raw.explanationEn);
    assert.deepEqual(optionMachineIdentity(projected.actionOptions), optionMachineIdentity(raw.actionOptions));
    assert.deepEqual(optionMachineIdentity(projected.reasonOptions), optionMachineIdentity(raw.reasonOptions));
  }
});

test("projection is idempotent (unmapped pass-through, re-application does not drift)", () => {
  for (const id of b1DecisionIds) {
    const raw = rawB1ById.get(id);
    const once = applyPracticalRuSystemicB1DecisionProjection(raw);
    const twice = applyPracticalRuSystemicB1DecisionProjection(once);
    assert.deepEqual(twice, once, `${id} idempotent projection`);
  }
  for (const id of c0DecisionIds) {
    const raw = rawC0ById.get(id);
    const once = applyPracticalRuSystemicC0DecisionProjection(raw);
    const twice = applyPracticalRuSystemicC0DecisionProjection(once);
    assert.deepEqual(twice, once, `${id} idempotent projection`);
  }
});

test("B1 semantic firewall: source-backed ceilings preserved (dirty-out discounting, SB limp/raise structure, BB-vs-SB structure, draw quality, deep-stack and multiway ceilings)", () => {
  const fnd04 = practicalRuSystemicB1DecisionPatches.get("PM-FND-04-B1-101");
  assert.match(fnd04.explanationRu, /грязн(ые|ых)\s+ауты/u);
  assert.match(fnd04.actionOptions.good, /чист(ые|ых)/u);
  assert.match(fnd04.actionOptions.good, /грязн/u);

  const bl06 = practicalRuSystemicB1DecisionPatches.get("PM-BL-06-B1-103");
  assert.match(bl06.actionOptions.good, /лимп/u);
  assert.match(bl06.actionOptions.good, /рейз/u);

  const bl07 = practicalRuSystemicB1DecisionPatches.get("PM-BL-07-B1-103");
  assert.match(bl07.actionOptions.good, /цен[ауы]|позици/u);

  const bl08 = practicalRuSystemicB1DecisionPatches.get("PM-BL-08-B1-103");
  assert.match(bl08.reasonOptions.goodR, /сравнени/u);
  assert.doesNotMatch(bl08.reasonOptions.goodR, /слабость.{0,20}значит.{0,20}рейз/u);

  const bl09 = practicalRuSystemicB1DecisionPatches.get("PM-BL-09-B1-103");
  assert.match(bl09.actionOptions.good, /надёжн|сильн/u);

  const draw = practicalRuSystemicB1DecisionPatches.get("PM-W4-DRAW-B1-103");
  assert.match(draw.actionOptions.good, /качеств/u);

  const deep = practicalRuSystemicB1DecisionPatches.get("PM-DEEP-02-B1-101");
  assert.match(deep.actionOptions.good, /позици/u);
  assert.match(deep.actionOptions.good, /100bb/u);

  const mw = practicalRuSystemicB1DecisionPatches.get("PM-MW-05-B1-101");
  assert.match(mw.actionOptions.good, /вэлью/u);
  assert.match(mw.actionOptions.good, /блеф/u);

  const exp = practicalRuSystemicB1DecisionPatches.get("PM-EXP-06-B1-101");
  assert.match(exp.actionOptions.good, /соперник/u);
});

test("C0 causal firewall: origin width is a prior not proof, price does not create bluffs, blockers remain relevant, population claims field-gated", () => {
  const c201 = practicalRuSystemicC0DecisionPatches.get("PM-RIV-03-C0-201");
  assert.match(c201.actionOptions.good, /стартов(ого|ый)\s+диапазон/u);
  assert.match(c201.actionOptions.good, /фильтр/u);
  assert.match(c201.actionOptions.bad2, /переблеф/u);
  assert.match(c201.reasonOptions.goodR, /предположени/u);

  const c203 = practicalRuSystemicC0DecisionPatches.get("PM-RIV-03-C0-203");
  assert.match(c203.actionOptions.good, /цен[ауы]/u);
  assert.match(c203.actionOptions.good, /предположени/u);
  assert.match(c203.actionOptions.good, /не\s+как\s+доказательство/u);

  const c204 = practicalRuSystemicC0DecisionPatches.get("PM-RIV-03-C0-204");
  assert.match(c204.actionOptions.bad2, /сбрасывать|фолд/iu);
  assert.match(c204.reasonOptions.goodR, /конкретн/u);

  const c205 = practicalRuSystemicC0DecisionPatches.get("PM-RIV-03-C0-205");
  assert.match(c205.reasonOptions.goodR, /предположени/u);
  assert.match(c205.reasonOptions.goodR, /метк/u);

  const c206 = practicalRuSystemicC0DecisionPatches.get("PM-RIV-03-C0-206");
  assert.match(c206.actionOptions.good, /фильтрац/u);
  assert.match(c206.reasonOptions.goodR, /предположени/u);

  const c207 = practicalRuSystemicC0DecisionPatches.get("PM-RIV-03-C0-207");
  assert.match(c207.actionOptions.good, /предположени/u);
  assert.match(c207.reasonOptions.goodR, /популяц/u);
  assert.match(c207.reasonOptions.goodR, /полевог/u);

  const c208 = practicalRuSystemicC0DecisionPatches.get("PM-RIV-03-C0-208");
  assert.match(c208.actionOptions.good, /не заменяет/u);
  assert.match(c208.reasonOptions.goodR, /блокер/u);
});

test("no raw-authority mutation: raw files on disk are unmodified by this staging packet", () => {
  assert.equal(sourceClosureB1Decisions.length, 72);
  assert.equal(sourceUtilizationC0Decisions.length, 8);
  for (const d of sourceClosureB1Decisions) assert.ok(d.assumptions.some((a) => a.includes("no copied exact chart cell")));
  for (const d of sourceUtilizationC0Decisions) assert.ok(d.assumptions.some((a) => a.includes("population magnitude remains field-gated")));
});
