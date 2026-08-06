import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import ts from "typescript";

async function loadContent() {
  const source = await readFile(new URL("../content/modules.ts", import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove,
    },
  }).outputText;
  const directory = await mkdtemp(join(tmpdir(), "live-cash-os-taxonomy-"));
  const output = join(directory, "modules.mjs");
  await writeFile(output, compiled, "utf8");
  return import(`${new URL(`file://${output}`).href}?${Date.now()}`);
}

test("canonical T1 taxonomy stays isolated from runtime distractor tags", async () => {
  const authority = await readFile(new URL("../../../learning/MISCONCEPTION_TAXONOMY_v0_1.md", import.meta.url), "utf8");
  const scope = await readFile(new URL("../../../learning/TAXONOMY_SCOPE_v1.md", import.meta.url), "utf8");
  const canonical = new Set([...authority.matchAll(/`(MC-\d{3})`\s*\|/gu)].map((match) => match[1]));
  assert.equal(canonical.size, 30);
  assert.deepEqual([...canonical].sort(), Array.from({ length: 30 }, (_, index) => `MC-${String(index + 1).padStart(3, "0")}`));
  assert.match(scope, /No numeric or name-based automatic mapping is allowed/u);

  const { allDrills } = await loadContent();
  const runtimeTags = new Set();
  for (const drill of allDrills) {
    for (const option of [...drill.actionOptions, ...drill.reasonOptions]) {
      if (option.id === drill.correctActionId || option.id === drill.correctReasonId) continue;
      assert.match(option.misconceptionId ?? "", /^MC-\d{3}$/u, `${drill.id}/${option.id}: malformed runtime tag`);
      runtimeTags.add(option.misconceptionId);
    }
  }
  assert.ok(runtimeTags.size >= 30, "Runtime corpus unexpectedly lost distractor coverage");

  const parser = await readFile(new URL("../lib/diagnostic-import.ts", import.meta.url), "utf8");
  assert.match(parser, /Array\.from\(\{ length: 30 \}/u, "T1 parser canonical boundary changed");
  assert.doesNotMatch(parser, /content\/modules|allDrills|misconceptionId/u, "T1 parser must not import runtime distractor tags");

  const schema = JSON.parse(await readFile(new URL("../../../learning/diagnostics/DIAGNOSTIC_RESPONSE_SCHEMA_v0_2.json", import.meta.url), "utf8"));
  const pattern = schema.properties.responses.items.properties.evaluation.properties.misconceptions.items.pattern;
  const matcher = new RegExp(pattern, "u");
  assert.equal(matcher.test("MC-001"), true);
  assert.equal(matcher.test("MC-030"), true);
  assert.equal(matcher.test("MC-031"), false);
});
