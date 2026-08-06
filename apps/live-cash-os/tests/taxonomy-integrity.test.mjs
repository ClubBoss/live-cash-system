import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import ts from "typescript";

async function loadContent() {
  const source = await readFile(new URL("../content/modules.ts", import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove },
  }).outputText;
  const directory = await mkdtemp(join(tmpdir(), "lcos-taxonomy-"));
  const output = join(directory, "modules.mjs");
  await writeFile(output, compiled, "utf8");
  return import(`${new URL(`file://${output}`).href}?${Date.now()}`);
}

test("all mapped distractors use the 30 canonical misconception IDs", async () => {
  const taxonomy = await readFile(new URL("../../../learning/MISCONCEPTION_TAXONOMY_v0_1.md", import.meta.url), "utf8");
  const canonical = new Set([...taxonomy.matchAll(/`(MC-\d{3})`\s*\|/gu)].map((match) => match[1]));
  assert.equal(canonical.size, 30, "The active taxonomy authority must expose exactly MC-001 through MC-030");
  const { allDrills } = await loadContent();
  for (const drill of allDrills) {
    for (const option of [...drill.actionOptions, ...drill.reasonOptions]) {
      if (option.id === drill.correctActionId || option.id === drill.correctReasonId) continue;
      assert.ok(canonical.has(option.misconceptionId), `${drill.id}/${option.id}: non-canonical misconception ${option.misconceptionId}`);
    }
  }
});
