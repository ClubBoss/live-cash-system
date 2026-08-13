import assert from "node:assert/strict";
import test from "node:test";
import { diagnosticT1 } from "../content/diagnostic.ts";
import { drillById, moduleById } from "../content/modules.ts";
import { selectLessonDrillIds } from "../lib/retrieval-integrity.ts";

test("Diagnostic uses held-out governed drills rather than lesson stimuli", () => {
  const diagnosticIds = new Set(diagnosticT1.map((item) => item.drillId));
  assert.equal(diagnosticIds.size, diagnosticT1.length, "Diagnostic drill identities must be unique");

  for (const item of diagnosticT1) {
    const drill = drillById[item.drillId];
    assert.ok(drill, `${item.id}: missing governed drill ${item.drillId}`);
    const lessonIds = selectLessonDrillIds(moduleById[drill.moduleId]);
    assert.equal(lessonIds.includes(drill.id), false, `${item.id}: ${drill.id} leaks into the standard lesson stimuli`);
  }
});
