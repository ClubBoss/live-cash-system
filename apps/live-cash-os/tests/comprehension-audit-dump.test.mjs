import test from "node:test";
import { diagnosticT1 } from "../content/diagnostic.ts";
import { drillById, moduleById } from "../content/modules.ts";
import { applyLocaleData } from "../content/i18n/locale-pipeline.ts";

function drillSurface(drill) {
  return {
    id: drill.id,
    moduleId: drill.moduleId,
    assumptions: drill.assumptions,
    cue: drill.cue,
    question: drill.question,
    actions: drill.actionOptions.map((option) => ({ id: option.id, text: option.text, correct: option.id === drill.correctActionId })),
    reasons: drill.reasonOptions.map((option) => ({ id: option.id, text: option.text, correct: option.id === drill.correctReasonId })),
    explanation: drill.explanation,
  };
}

test("AUDIT_ONLY dumps the final assembled RU diagnostic and drill corpus", () => {
  applyLocaleData("ru");
  console.log("AUDIT_CORPUS_V1_START");

  for (const module of Object.values(moduleById)) {
    for (const drill of module.drills) {
      console.log(JSON.stringify({ kind: "drill", ...drillSurface(drill) }));
    }
  }

  for (const item of diagnosticT1) {
    const drill = drillById[item.drillId];
    console.log(JSON.stringify({
      kind: "diagnostic",
      diagnosticId: item.id,
      diagnosticPrompt: item.prompt,
      ...drillSurface(drill),
    }));
  }

  console.log("AUDIT_CORPUS_V1_END");
});
