import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("concept primer is scoped to current teaching rather than the future assessment corpus", async () => {
  const source = await readFile(path.join(root, "components/PracticalConceptPrimer.tsx"), "utf8");
  assert.match(source, /practicalSkillById/);
  assert.match(source, /\.\.\.teachingTexts/);
  assert.doesNotMatch(source, /practicalDecisions/);
  assert.doesNotMatch(source, /decisionTexts/);
  assert.doesNotMatch(source, /actionOptions|reasonOptions/);
  assert.match(source, /current teaching step|текущего разбора/);
});
