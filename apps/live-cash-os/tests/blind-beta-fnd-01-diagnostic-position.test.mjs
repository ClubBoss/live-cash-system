import assert from "node:assert/strict";
import test from "node:test";
import { applyLocaleData } from "../content/i18n/locale-pipeline.ts";
import { drillById } from "../content/modules.ts";

const expectedActionIds = ["mul-04-a0", "mul-04-a1", "mul-04-a2"];
const expectedReasonIds = ["mul-04-r0", "mul-04-r1", "mul-04-r2"];

function assertPositionallyCoherentDiagnostic(locale, expected) {
  applyLocaleData(locale);
  const drill = drillById["mul-04"];
  assert.ok(drill, "LD-009 must keep the canonical mul-04 decision");

  assert.deepEqual(drill.assumptions, expected.assumptions, "setup must retain HJ/BTN/BB");
  assert.equal(drill.cue, expected.cue, "setup copy must identify HJ as the aggressor");
  assert.equal(drill.question, expected.question, "question must address that same aggressor");
  assert.deepEqual(drill.actionOptions.map((option) => option.text), expected.actions);
  assert.deepEqual(drill.reasonOptions.map((option) => option.text), expected.reasons);
  assert.equal(drill.explanation, expected.explanation, "explanation must retain the same positions");
  assert.equal(drill.correctActionId, "mul-04-a0", "correct action identity must not change");
  assert.equal(drill.correctReasonId, "mul-04-r0", "correct reason identity must not change");
  assert.deepEqual(drill.actionOptions.map((option) => option.id), expectedActionIds);
  assert.deepEqual(drill.reasonOptions.map((option) => option.id), expectedReasonIds);
}

test("FND-01 LD-009 keeps HJ positional identity through final RU Diagnostic composition", () => {
  assertPositionallyCoherentDiagnostic("ru", {
    assumptions: ["HJ/BTN/BB", "флоп 6-5-4 rainbow", "BB защищал широко"],
    cue: "Мультивей: HJ, BTN и BB смотрят флоп 6-5-4 радугой; HJ был префлоп-агрессором.",
    question: "Какой фактор проверить первым перед решением о частой ставке HJ?",
    actions: ["Преимущество диапазона BB на низкой доске", "Префлоп-инициатива HJ", "Сам факт игры втроём"],
    reasons: ["У BB больше низких сильных рук, а HJ против двоих", "Префлоп-агрессор обычно сохраняет преимущество и после флопа", "Сам факт мультивея делает контбет невыгодным"],
    explanation: "На низкой связанной доске одной префлоп-инициативы недостаточно. Сначала сравни натсы и другие сильные комбинации в диапазонах и учти, что HJ играет сразу против BTN и BB.",
  });
});

test("FND-01 LD-009 keeps HJ positional identity through final EN Diagnostic composition", () => {
  assertPositionallyCoherentDiagnostic("en", {
    assumptions: ["HJ/BTN/BB", "flop 6-5-4 rainbow", "BB defended wide"],
    cue: "A low connected flop follows multiple preflop calls.",
    question: "Which factor should be checked first before deciding on an HJ range-bet?",
    actions: ["BB low-board ownership", "HJ preflop initiative", "Multiway status by itself"],
    reasons: ["BB covers more low-board nut combinations", "The preflop raiser usually keeps range advantage", "Three players make betting intrinsically invalid"],
    explanation: "On low connected boards, initiative cannot replace source-range ownership; the source example requires very disciplined opener play.",
  });
});
