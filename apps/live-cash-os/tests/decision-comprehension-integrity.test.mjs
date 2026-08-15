import assert from "node:assert/strict";
import test from "node:test";
import { diagnosticT1 } from "../content/diagnostic.ts";
import { drillById, moduleById } from "../content/modules.ts";
import { applyLocaleData } from "../content/i18n/locale-pipeline.ts";

function identities() {
  return Object.values(moduleById).map((module) => ({
    moduleId: module.id,
    drillIds: module.drills.map((drill) => drill.id),
    actionIds: module.drills.map((drill) => drill.actionOptions.map((option) => option.id)),
    reasonIds: module.drills.map((drill) => drill.reasonOptions.map((option) => option.id)),
    correctActionIds: module.drills.map((drill) => drill.correctActionId),
    correctReasonIds: module.drills.map((drill) => drill.correctReasonId),
    misconceptionIds: module.drills.map((drill) => drill.misconceptionId),
  }));
}

function allDrills() {
  return Object.values(moduleById).flatMap((module) => module.drills);
}

function decisionText(drill) {
  return [
    ...drill.assumptions,
    drill.cue,
    drill.question,
    ...drill.actionOptions.map((option) => option.text),
    ...drill.reasonOptions.map((option) => option.text),
    drill.explanation,
  ].join("\n");
}

function violations(patterns) {
  const result = [];
  for (const drill of allDrills()) {
    const text = decisionText(drill);
    for (const [label, pattern] of patterns) {
      if (pattern.test(text)) result.push(`${drill.id}: ${label}`);
    }
  }
  return result;
}

const RU_CONTAMINATION = [
  ["internal premise wording", /premise/iu],
  ["chart-cell meta wording", /chart[- ]?клет/iu],
  ["exercise-condition meta wording", /услови(?:е|я) задач/iu],
  ["solver meta wording", /solver/iu],
  ["safe-example meta wording", /безопасн\w*\s+пример/iu],
  ["stated-model meta wording", /заданн\w*\s+модел/iu],
  ["product-model wording", /текущая модель продукта/iu],
  ["malformed default", /по умолчаниюй/iu],
  ["malformed usually", /наобычно/iu],
  ["double-negative distractor", /редко не/iu],
  ["mixed paired-flop wording", /paired flop/iu],
  ["mixed bluff-catcher wording", /bluff-catchers/iu],
  ["mixed live-overcall wording", /live-overcall/iu],
];

const EN_CONTAMINATION = [
  ["exercise premise", /exercise premise/iu],
  ["chart-cell meta wording", /chart cell/iu],
  ["solver-frequency meta wording", /solver frequency/iu],
  ["safe-sibling meta wording", /safe sibling example/iu],
  ["stated-model meta wording", /stated model/iu],
  ["current-product-model wording", /current product model/iu],
];

test("decision comprehension closure preserves scoring identities and removes RU decoding contamination", () => {
  const before = identities();
  applyLocaleData("ru");
  assert.equal(allDrills().length, 55);
  assert.deepEqual(identities(), before, "wording closure must not change drill/scoring identities");
  assert.deepEqual(violations(RU_CONTAMINATION), []);

  assert.equal(drillById["pre-04"].question, "Если A5s уже иногда используется для сквиза, что меняется против подтверждённо более широких входов?");
  assert.equal(drillById["anc-03"].question, "Что нужно сравнить прежде, чем превращать 98s в 4-бет-блеф?");
  assert.equal(drillById["tra-05"].question, "Какой статус навыка теперь оправдан?");
});

test("Diagnostic has one drill-backed truth instead of stale parallel prompts", () => {
  assert.equal(diagnosticT1.length, 10);
  assert.equal(new Set(diagnosticT1.map((item) => item.drillId)).size, 10);
  for (const item of diagnosticT1) {
    assert.ok(drillById[item.drillId], `${item.id}: missing mapped drill ${item.drillId}`);
    assert.deepEqual(Object.keys(item).sort(), ["drillId", "id", "targetSeconds"]);
  }
});

test("English final decision surfaces reject the same internal meta-language class", () => {
  const before = identities();
  applyLocaleData("en");
  assert.deepEqual(identities(), before, "English wording must preserve drill/scoring identities");
  assert.deepEqual(violations(EN_CONTAMINATION), []);
  assert.equal(drillById["pre-04"].question, "If A5s is already used sometimes as a squeeze, what changes against confirmed wider entries?");
});
