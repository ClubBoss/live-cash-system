import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { diagnosticT1 } from "../content/diagnostic.ts";
import { drillById, moduleById } from "../content/modules.ts";
import { selectLessonDrillIds } from "../lib/retrieval-integrity.ts";

const explainBackSource = readFileSync(new URL("../components/ExplainBackSelfCheck.tsx", import.meta.url), "utf8");

test("Diagnostic uses held-out governed drills rather than lesson stimuli", () => {
  const diagnosticIds = new Set(diagnosticT1.map((item) => item.drillId));
  assert.equal(diagnosticIds.size, diagnosticT1.length, "Diagnostic drill identities must be unique");

  for (const item of diagnosticT1) {
    const drill = drillById[item.drillId];
    assert.ok(drill, `${item.id}: missing governed drill ${item.drillId}`);
    const module = moduleById[drill.moduleId];
    const lessonIds = new Set(selectLessonDrillIds(module));
    assert.equal(lessonIds.has(drill.id), false, `${item.id}: ${drill.id} leaks into the standard lesson stimuli`);

    const independentTransfer = module.drills.filter((candidate) => !lessonIds.has(candidate.id) && !diagnosticIds.has(candidate.id));
    assert.ok(independentTransfer.length >= 1, `${item.id}: no independent drill remains for explain-back transfer`);
  }
});

test("Explain-back verification explicitly reserves Diagnostic stimuli", () => {
  assert.match(explainBackSource, /DIAGNOSTIC_DRILL_IDS/u);
  assert.match(explainBackSource, /diagnosticT1\.map\(\(item\) => item\.drillId\)/u);
  assert.match(explainBackSource, /!used\.has\(candidate\.id\)/u);
  assert.doesNotMatch(explainBackSource, /\?\? module\.drills\[module\.drills\.length - 1\]/u);
});
