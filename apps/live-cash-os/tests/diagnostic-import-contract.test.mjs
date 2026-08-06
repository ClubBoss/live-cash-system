import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import ts from "typescript";

async function loadParser() {
  const source = await readFile(new URL("../lib/diagnostic-import.ts", import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove,
    },
  }).outputText;
  const directory = await mkdtemp(join(tmpdir(), "live-cash-diagnostic-import-"));
  const output = join(directory, "diagnostic-import.mjs");
  await writeFile(output, compiled, "utf8");
  return import(`${new URL(`file://${output}`).href}?${Date.now()}-${Math.random()}`);
}

function validScore() {
  return {
    schema_version: "score-0.2",
    scorer_version: "0.2.0",
    learner_id: "current_learner",
    tranche_id: "T1",
    run_id: "t1-contract-test",
    measurement_context: "COLD_BASELINE",
    locale_at_start: "ru",
    submitted_at: "2026-08-07T00:00:00.000Z",
    responses_scored: 10,
    rerank_ready: true,
    module_summary: Object.fromEntries(Array.from({ length: 10 }, (_, index) => {
      const number = index + 1;
      return [
        `LCM-${String(number).padStart(2, "0")}`,
        {
          observed_error_rate: number === 10 ? 0.8 : 0.1,
          exposures: 1,
          items: [`LD-${String(number).padStart(3, "0")}`],
        },
      ];
    })),
    misconception_evidence: {},
    tentative_priority_order: ["H-GEOMETRY"],
  };
}

test("rejects module exposure counts that do not match listed items", async () => {
  const parser = await loadParser();
  const score = validScore();
  score.module_summary["LCM-01"].exposures = 2;
  assert.throws(() => parser.parseDiagnosticScore(score), /Exposure count does not match item count/u);
});

test("rejects duplicate candidate priorities", async () => {
  const parser = await loadParser();
  const score = validScore();
  score.tentative_priority_order = ["H-GEOMETRY", "H-GEOMETRY"];
  assert.throws(() => parser.parseDiagnosticScore(score), /contains duplicates/u);
});
