import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
// Raw authority only. Do not import the composition index or locale pipeline.
import { srpA6ExpansionDecisions } from "../content/practical-mastery/decisions-srp-a6-expansion";
import { postflopAndLiveDecisions } from "../content/practical-mastery/decisions-w4-w13";
import { recognitionAndSrpAnchors } from "../content/practical-mastery/anchors-w4-w6";
import {
  practicalRuSystemicFlopSrpOopIpDecisionPatches as decisionPatches,
  practicalRuSystemicFlopSrpOopIpAnchorPatches as anchorPatches,
  applyPracticalRuSystemicFlopSrpOopIpDecisionProjection as projectDecision,
  applyPracticalRuSystemicFlopSrpOopIpAnchorProjection as projectAnchor,
} from "../content/practical-mastery/practical-ru-systemic-flop-srp-oop-ip-publication";

// Independent frozen ownership, not inferred from the projection under test.
const a6Ids = ["OOP-01", "OOP-02", "OOP-03", "OOP-04", "OOP-05", "IP-01", "IP-02"]
  .flatMap((skill) => [101, 102, 103, 104, 105, 106, 107, 108].map((n) => `PM-${skill}-${n}`));
const legacyIds = ["PM-W4-BOARD-001", "PM-W4-REL-001", "PM-OOP-01-001", "PM-OOP-03-001", "PM-IP-01-001"];
const decisionIds = [...a6Ids, ...legacyIds];
const anchorIds = [
  "W4-BOARD-01-A01", "W4-BOARD-01-A02", "W4-HAND-01-A01", "W4-REL-01-A01",
  "OOP-01-A01", "OOP-01-A02", "OOP-02-A01", "OOP-03-A01", "OOP-03-A02",
  "IP-01-A01", "IP-01-A02", "IP-02-A01",
];
const a6Paths = ["cueRu", "questionRu", "explanationRu", "action:good", "action:bad1", "action:bad2", "reason:why", "reason:whyBad1", "reason:whyBad2"];
const legacyPaths = ["cueRu", "questionRu", "explanationRu", "action:a", "action:b", "action:c", "reason:r1", "reason:r2", "reason:r3"];
const anchorPaths = ["promptRu", "answerRu", "rationaleRu"];
const rawDecisions = [...srpA6ExpansionDecisions, ...postflopAndLiveDecisions];
const rawById = new Map(rawDecisions.map((d) => [d.id, d]));
const rawAnchorById = new Map(recognitionAndSrpAnchors.map((a) => [a.id, a]));
const sorted = (values) => [...values].sort();

function decisionFields(decision) {
  return [
    ...["cueRu", "questionRu", "explanationRu"].map((key) => [key, decision[key]]),
    ...decision.actionOptions.map((o) => [`action:${o.id}`, o.textRu]),
    ...decision.reasonOptions.map((o) => [`reason:${o.id}`, o.textRu]),
  ];
}

function patchFields(patch) {
  return [
    ...Object.entries(patch).filter(([key]) => !["actionOptions", "reasonOptions"].includes(key)),
    ...Object.entries(patch.actionOptions).map(([id, text]) => [`action:${id}`, text]),
    ...Object.entries(patch.reasonOptions).map(([id, text]) => [`reason:${id}`, text]),
  ];
}

function anchorFields(anchor) {
  return anchorPaths.map((key) => [key, anchor[key]]);
}

// Strip only inspected source-reference spellings, never arbitrary digits.
function numericTokens(text) {
  return text
    .replace(/\b(?:FTGU-E\d+|SLC-M\d+-L\d+|CP-G\d+-L\d+|LCM-\d+|E\d+)\b/gu, "")
    // Poker action names are not quantities. Keep stack/SPR/percentage digits.
    .replace(/(?<![\p{L}\p{N}])[34]-(?:bet(?:s|ting|ted)?|бет[а-яё]*)(?![\p{L}\p{N}])/giu, "")
    .match(/\d+(?:[.,]\d+)?%?/gu) ?? [];
}

function learnerResidual(text) {
  return text.replace(/\b(?:EV|IP|OOP|SPR|BB|SB|BTN)\b/gu, "").match(/[A-Za-z]+/gu) ?? [];
}

function machineDecision(decision) {
  const { cueRu, questionRu, explanationRu, actionOptions, reasonOptions, ...rest } = decision;
  void cueRu; void questionRu; void explanationRu;
  const machineOptions = (options) => options.map(({ textRu, ...option }) => {
    void textRu;
    return option;
  });
  return { ...rest, actionOptions: machineOptions(actionOptions), reasonOptions: machineOptions(reasonOptions) };
}

function machineAnchor(anchor) {
  const { promptRu, answerRu, rationaleRu, ...rest } = anchor;
  void promptRu; void answerRu; void rationaleRu;
  return rest;
}

function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
  }
  return value;
}

test("raw baseline is frozen; integration must explicitly reconcile owned source drift", () => {
  const byId = (a, b) => a.id.localeCompare(b.id);
  const snapshot = {
    decisions: decisionIds.map((id) => rawById.get(id)).sort(byId),
    anchors: anchorIds.map((id) => rawAnchorById.get(id)).sort(byId),
  };
  // Exact owned raw objects at main edde16e676b06f0c924178f68a62f6a7e13cd84e.
  // This is a staging regression fixture, not a governance/source-lock update.
  assert.equal(createHash("sha256").update(JSON.stringify(snapshot)).digest("hex"),
    "73e192ee76df2b4d68108b39d8c93e184823d76a85778cf546e7328c05fb1d2e");
});

test("exact 61 decision and 12 anchor keys, not only cardinalities", () => {
  assert.deepEqual(sorted(decisionPatches.keys()), sorted(decisionIds));
  assert.deepEqual(sorted(anchorPatches.keys()), sorted(anchorIds));
  assert.equal(decisionPatches.size, 61);
  assert.equal(anchorPatches.size, 12);
  assert.deepEqual(sorted(srpA6ExpansionDecisions.map((d) => d.id)), sorted(a6Ids));
  assert.equal(rawById.size, rawDecisions.length, "raw decision IDs must be unique");
  assert.equal(rawAnchorById.size, recognitionAndSrpAnchors.length, "raw anchor IDs must be unique");
  for (const id of decisionIds) assert.ok(rawById.has(id), id);
  for (const id of anchorIds) assert.ok(rawAnchorById.has(id), id);
});

test("exact owned field paths: ACTIVE_FIELDS=585, UNCLASSIFIED=0, REVIEW=0", () => {
  const expected = [];
  const actual = [];
  for (const id of decisionIds) {
    const paths = a6Ids.includes(id) ? a6Paths : legacyPaths;
    const raw = rawById.get(id);
    assert.deepEqual(sorted(decisionFields(raw).map(([path]) => path)), sorted(paths), id);
    assert.deepEqual(sorted(Object.keys(decisionPatches.get(id))),
      sorted(["cueRu", "questionRu", "explanationRu", "actionOptions", "reasonOptions"]), id);
    expected.push(...paths.map((path) => `${id}.${path}`));
    for (const [path, text] of patchFields(decisionPatches.get(id))) {
      assert.ok(typeof text === "string" && text.trim().length > 0, `${id}.${path}`);
      assert.doesNotMatch(text, /\b(?:TODO|REVIEW|TBD)\b/u);
      actual.push(`${id}.${path}`);
    }
  }
  for (const id of anchorIds) {
    expected.push(...anchorPaths.map((path) => `${id}.${path}`));
    for (const [path, text] of Object.entries(anchorPatches.get(id))) {
      assert.ok(typeof text === "string" && text.trim().length > 0, `${id}.${path}`);
      assert.doesNotMatch(text, /\b(?:TODO|REVIEW|TBD)\b/u);
      actual.push(`${id}.${path}`);
    }
  }
  assert.equal(new Set(actual).size, 585);
  assert.equal(actual.length, 585);
  assert.deepEqual(sorted(actual), sorted(expected));
  assert.equal(expected.filter((path) => !actual.includes(path)).length, 0);
});

test("all 585 published RU fields have no hybrid English or source-ID residual", () => {
  const fields = [
    ...decisionIds.flatMap((id) => decisionFields(projectDecision(rawById.get(id))).map(([p, t]) => [`${id}.${p}`, t])),
    ...anchorIds.flatMap((id) => anchorFields(projectAnchor(rawAnchorById.get(id))).map(([p, t]) => [`${id}.${p}`, t])),
  ];
  assert.equal(fields.length, 585);
  for (const [path, text] of fields) {
    assert.deepEqual(learnerResidual(text), [], `${path}: ${text}`);
    assert.doesNotMatch(text, /(?:FTGU|SLC|CP-G|LCM-|FINAL_LEARNING_INTEGRITY|\bE\d+\b)/u, path);
  }
});

test("field-by-field numeric identity, including flop percentage bounds", () => {
  for (const id of decisionIds) {
    const before = new Map(decisionFields(rawById.get(id)));
    for (const [path, text] of decisionFields(projectDecision(rawById.get(id)))) {
      assert.deepEqual(numericTokens(text), numericTokens(before.get(path)), `${id}.${path}`);
    }
  }
  for (const id of anchorIds) {
    const before = new Map(anchorFields(rawAnchorById.get(id)));
    for (const [path, text] of anchorFields(projectAnchor(rawAnchorById.get(id)))) {
      assert.deepEqual(numericTokens(text), numericTokens(before.get(path)), `${id}.${path}`);
    }
  }
  assert.match(projectDecision(rawById.get("PM-OOP-04-106")).cueRu, /с 25–33% банка на крупную/u);
});

test("numeric guard ignores action terminology but retains sizes, stack depth and SPR", () => {
  assert.deepEqual(numericTokens("3-bet 4-bets 3-бет 4-бета 3-бетом 4-бетов"), []);
  assert.deepEqual(numericTokens("3-bet 25–33% 100 BB SPR 4 4-бет 150%"), ["25", "33%", "100", "4", "150%"]);
  assert.notDeepEqual(numericTokens("25–33% 100 BB SPR 4"), numericTokens("25–50% 100 BB SPR 4"));
  assert.notDeepEqual(numericTokens("100 BB SPR 4"), numericTokens("200 BB SPR 3"));
  assert.deepEqual(numericTokens("FTGU-E07/E09 SLC-M02-L05"), []);
  assert.deepEqual(learnerResidual("EV IP OOP SPR BB SB BTN 3-бет 4-бет"), []);
  assert.notDeepEqual(learnerResidual("range check board"), []);
});

test("decisions preserve every non-RU property, EN, correct answers, options and misconceptions", () => {
  for (const id of decisionIds) {
    const raw = rawById.get(id);
    const before = structuredClone(raw);
    const next = projectDecision(deepFreeze(raw));
    assert.deepEqual(machineDecision(next), machineDecision(before), id);
    assert.deepEqual(raw, before, `${id}: input mutation`);
    assert.deepEqual(decisionFields(next), decisionFields(projectDecision(next)), `${id}: idempotence`);
    const actual = new Map(decisionFields(next));
    for (const [path, text] of patchFields(decisionPatches.get(id))) assert.equal(actual.get(path), text, `${id}.${path}`);
    for (const key of ["id", "skillId", "kind", "correctActionId", "correctReasonId", "targetSeconds", "sourceRefs", "assumptions", "changedVariables"]) {
      assert.deepEqual(next[key], before[key], `${id}.${key}`);
    }
  }
});

test("anchors preserve identity, EN, sourceRefs, assumptions and changedVariables", () => {
  for (const id of anchorIds) {
    const raw = rawAnchorById.get(id);
    const before = structuredClone(raw);
    const next = projectAnchor(deepFreeze(raw));
    assert.deepEqual(machineAnchor(next), machineAnchor(before), id);
    assert.deepEqual(raw, before, `${id}: input mutation`);
    assert.deepEqual(projectAnchor(next), next, `${id}: idempotence`);
    for (const path of anchorPaths) assert.equal(next[path], anchorPatches.get(id)[path], `${id}.${path}`);
  }
});

test("unmapped pass-through includes every A8 bridge and excludes later-street independent units", () => {
  for (const raw of rawDecisions.filter((d) => !decisionIds.includes(d.id))) assert.equal(projectDecision(raw), raw, raw.id);
  for (const raw of recognitionAndSrpAnchors.filter((a) => !anchorIds.includes(a.id))) assert.equal(projectAnchor(raw), raw, raw.id);
  assert.equal(projectDecision(rawById.get("PM-IP-04-001")), rawById.get("PM-IP-04-001"));
  for (const id of ["W4-RUNOUT-01-A01", "IP-04-A01"]) {
    assert.ok(rawAnchorById.has(id));
    assert.equal(projectAnchor(rawAnchorById.get(id)), rawAnchorById.get(id));
    assert.equal(anchorPatches.has(id), false);
  }
  for (const skillId of ["OOP-06", "OOP-07", "IP-03", "IP-04", "IP-05", "IP-06"]) {
    assert.ok(decisionIds.every((id) => rawById.get(id).skillId !== skillId));
    const unknown = { ...rawById.get(a6Ids[0]), id: `PM-${skillId}-101`, skillId };
    assert.equal(projectDecision(unknown), unknown);
  }
  const unknownAnchor = { ...rawAnchorById.get(anchorIds[0]), id: "UNMAPPED-ANCHOR" };
  assert.equal(projectAnchor(unknownAnchor), unknownAnchor);
});

test("projection is keyed by option ID and preserves reordered and unknown options", () => {
  for (const id of decisionIds) {
    const raw = rawById.get(id);
    const unknown = { id: "future-option", textRu: "Неизвестный вариант", textEn: "Unknown", misconception: "UNCHANGED" };
    const input = {
      ...raw,
      actionOptions: [...raw.actionOptions].reverse().concat(unknown),
      reasonOptions: [...raw.reasonOptions].reverse().concat(unknown),
    };
    const next = projectDecision(input);
    assert.deepEqual(machineDecision(next), machineDecision(input));
    for (const group of ["actionOptions", "reasonOptions"]) {
      for (const option of next[group]) {
        if (option.id === unknown.id) assert.equal(option, unknown);
        else assert.equal(option.textRu, decisionPatches.get(id)[group][option.id]);
      }
    }
  }
});

test("directional size/board/continuation relations and source ceilings stay explicit", () => {
  // Semantic tripwires complement, but do not replace, a complete poker-aware
  // reread against raw copy and sources. They are not human approval evidence.
  const good = (id) => {
    const d = projectDecision(rawById.get(id));
    return d.actionOptions.find((o) => o.id === d.correctActionId).textRu;
  };
  for (const id of ["PM-OOP-02-106", "PM-OOP-04-106"]) assert.equal(good(id), "К фолду");
  assert.equal(good("PM-OOP-05-106"), "Сужается");
  assert.equal(good("PM-OOP-05-107"), "Может расшириться");
  assert.equal(good("PM-OOP-03-106"), "Усиливается");
  assert.equal(good("PM-IP-02-106"), "Может снизиться");
  assert.equal(good("PM-IP-02-107"), "Становится привлекательнее");
  assert.equal(good("PM-W4-REL-001"), "Да, снизилась");
  assert.match(good("PM-IP-01-107"), /расшириться.*уменьшиться/u);
  assert.match(good("PM-IP-01-106"), /небольших.*широким.*строгому.*чекам/u);
  assert.match(good("PM-OOP-01-105"), /^Нет.*позиции.*ставки/u);
  assert.match(good("PM-OOP-02-108"), /убирает рейзы, но сохраняет коллы и фолды/u);
  assert.match(good("PM-OOP-04-105"), /^Нет.*рейз/u);
  assert.match(good("PM-OOP-05-108"), /требует наблюдений/u);
  assert.equal(good("PM-OOP-03-108"), "Нет");
  assert.match(projectDecision(rawById.get("PM-OOP-03-108")).explanationRu, /диапазона, который продолжает после рейза/u);
  assert.match(projectDecision(rawById.get("PM-OOP-05-104")).explanationRu, /повышает требования.*не создаёт безусловный запрет/u);
  assert.match(projectDecision(rawById.get("PM-OOP-01-108")).explanationRu, /не заменяет всю стратегию/u);
});

test("isolated publication module has no runtime composition dependency", () => {
  const source = readFileSync(new URL("../content/practical-mastery/practical-ru-systemic-flop-srp-oop-ip-publication.ts", import.meta.url), "utf8");
  const imports = [...source.matchAll(/^import[^;]+;/gmu)].map(([value]) => value);
  assert.equal(imports.length, 1);
  assert.match(imports[0], /^import type .*from "\.\/types";$/u);
  assert.doesNotMatch(source, /\b(?:require\s*\(|import\s*\()/u);
});
