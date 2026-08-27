import assert from "node:assert/strict";
import test from "node:test";
import { syncDiagnosticCompatibility } from "../content/diagnostic.ts";
import { drillById } from "../content/modules.ts";

const expectedIds = ["mul-04-a0", "mul-04-a1", "mul-04-a2"];

function assertCategoryParity(locale, expectedQuestion, expectedOptions) {
  syncDiagnosticCompatibility(locale);
  const drill = drillById["mul-04"];
  assert.ok(drill, "Diagnostic item 9 source drill must exist");
  assert.equal(drill.question, expectedQuestion);
  assert.equal(drill.correctActionId, "mul-04-a0", "scoring identity must stay stable");
  assert.deepEqual(drill.actionOptions.map((option) => option.id), expectedIds, "option identities must stay stable");
  assert.deepEqual(drill.actionOptions.map((option) => option.text), expectedOptions);
  assert.ok(
    drill.actionOptions.every((option) => !/^(?:range-bet|check|bet|fold|raise)\b/i.test(option.text)),
    "all alternatives must be comparable analytical factors, not a mix of factors and policies",
  );
}

test("V3-09 Diagnostic item 9 keeps one analytical abstraction level in RU", () => {
  assertCategoryParity(
    "ru",
    "Какой фактор проверить первым перед решением о частой ставке HJ?",
    ["Преимущество диапазона BB на низкой доске", "Префлоп-инициатива HJ", "Сам факт игры втроём"],
  );
});

test("V3-09 Diagnostic item 9 keeps one analytical abstraction level in EN", () => {
  assertCategoryParity(
    "en",
    "Which factor should be checked first before deciding on an HJ range-bet?",
    ["BB low-board ownership", "HJ preflop initiative", "Multiway status by itself"],
  );
});
