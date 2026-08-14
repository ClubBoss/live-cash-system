import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { moduleById } from "../content/modules.ts";
import { applyLocaleData } from "../content/i18n/locale-pipeline.ts";

const moduleIds = ["geometry", "preflop", "blinds", "filtering", "shape", "aggression", "ancestry", "multiway", "river", "evidence", "transfer"];
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function identitySnapshot() {
  return moduleIds.flatMap((moduleId) => moduleById[moduleId].drills.map((drill) => ({
    moduleId,
    drillId: drill.id,
    correctActionId: drill.correctActionId,
    correctReasonId: drill.correctReasonId,
    actionIds: drill.actionOptions.map((option) => option.id),
    reasonIds: drill.reasonOptions.map((option) => option.id),
    actionMisconceptions: drill.actionOptions.map((option) => option.misconceptionId ?? null),
    reasonMisconceptions: drill.reasonOptions.map((option) => option.misconceptionId ?? null),
  })));
}

const originalIdentities = identitySnapshot();

function learnerStrings(module) {
  const strings = [
    module.title,
    module.shortTitle,
    module.description,
    module.scope,
    module.plainGoal,
    module.tableCue,
    module.technicalTerm,
    ...module.theory,
    ...module.heuristics,
    ...module.decisionTree,
    module.workedExample.situation,
    ...module.workedExample.steps,
    module.workedExample.answer,
    module.counterexample,
    module.lab.title,
    module.lab.description,
    module.explainBackPrompt,
    ...module.tableCard,
    ...module.glossary.flatMap((entry) => [entry.term, entry.meaning]),
    ...module.flashcards.flatMap((card) => [card.front, card.back]),
  ];
  if (module.lab.type === "compare") strings.push(module.lab.leftTitle, module.lab.leftText, module.lab.rightTitle, module.lab.rightText);
  for (const drill of module.drills) {
    strings.push(
      ...drill.assumptions,
      drill.cue,
      drill.question,
      ...drill.actionOptions.map((option) => option.text),
      ...drill.reasonOptions.map((option) => option.text),
      drill.explanation,
    );
  }
  return strings.filter(Boolean);
}

function finalCorpus() {
  return moduleIds.flatMap((moduleId) => learnerStrings(moduleById[moduleId])).join("\n");
}

const ruHybridPatterns = [
  /\bsource ranges?\b/iu,
  /\barrival ranges?\b/iu,
  /\barriving ranges?\b/iu,
  /\bcontinuing range\b/iu,
  /\bbetting range\b/iu,
  /\brange shape\b/iu,
  /\brange construction\b/iu,
  /\branges?\b/iu,
  /\bbranches?\b/iu,
  /\bplayers? behind\b/iu,
  /\bclosing action\b/iu,
  /\bshared defence\b/iu,
  /\bsandwich(?: pressure)?\b/iu,
  /\b(?:nut|board) ownership\b/iu,
  /\bownership\b/iu,
  /\bbluff[- ]supply\b/iu,
  /\bfold supply\b/iu,
  /\bfold targets?\b/iu,
  /\bpopulation (?:prior|evidence)\b/iu,
  /\bfield (?:evidence|validation)\b/iu,
  /\bsolver-like\b/iu,
  /\bsize exclusion\b/iu,
  /\bnode(?:-specific| signature)?\b/iu,
  /\b(?:gate|probe)\b/iu,
  /\bMDF\b/u,
  /\bOOP\b/u,
  /\bheads-up\b/iu,
  /\brealisation\b/iu,
  /\bplayability\b/iu,
  /\bsmall-wide\b/iu,
  /\blarge-(?:selective|polar)\b/iu,
  /\bnear-range\b/iu,
  /\bstructural prior\b/iu,
  /\bdirectional shift\b/iu,
  /\bcredible bluff supply\b/iu,
  /Натс и сильное покрытие BB плюс сэндвич-структуру/iu,
];

const enResearchPatterns = [
  /\barrival ranges?\b/iu,
  /\barriving ranges?\b/iu,
  /\bsource ranges?\b/iu,
  /\bbluff supply\b/iu,
  /\bsize exclusion\b/iu,
  /\bnode-specific\b/iu,
  /\bstructural prior\b/iu,
];

test("final RU learner corpus is free of known technical-Frankenstein language", () => {
  applyLocaleData("ru");
  assert.equal(moduleIds.length, 11);
  assert.equal(moduleIds.reduce((sum, moduleId) => sum + moduleById[moduleId].drills.length, 0), 55);
  const corpus = finalCorpus();
  const failures = ruHybridPatterns.filter((pattern) => pattern.test(corpus)).map(String);
  assert.deepEqual(failures, [], `Hybrid learner language remains:\n${failures.join("\n")}`);

  const mul04 = moduleById.multiway.drills.find((item) => item.id === "mul-04");
  assert.ok(mul04);
  assert.equal(mul04.question, "Что HJ нужно проверить перед контбетом?");
  assert.equal(mul04.actionOptions.find((option) => option.id === mul04.correctActionId)?.text, "У кого больше сильнейших рук на этой доске и как влияет игрок за спиной");
  assert.match(mul04.explanation, /одной префлоп-инициативы недостаточно/u);

  assert.deepEqual(identitySnapshot(), originalIdentities, "Language polish changed scoring or misconception identities");
});

test("final EN learner corpus is free of residual research-language fragments", () => {
  applyLocaleData("en");
  const corpus = finalCorpus();
  const failures = enResearchPatterns.filter((pattern) => pattern.test(corpus)).map(String);
  assert.deepEqual(failures, [], `Research/editorial language remains in English learner copy:\n${failures.join("\n")}`);
  assert.deepEqual(identitySnapshot(), originalIdentities, "English language polish changed scoring or misconception identities");
});

test("high-use RU UI does not expose known internal language fragments", async () => {
  const files = [
    "components/ExplainBackSelfCheck.tsx",
    "components/RealUseLessonAssist.tsx",
    "components/LiveCashAppCore.tsx",
    "components/DiagnosticExperience.tsx",
    "components/Wave7Experience.tsx",
  ];
  const sources = await Promise.all(files.map(async (relativePath) => [relativePath, await readFile(path.join(root, relativePath), "utf8")]));
  const forbidden = [
    /Explain-back и self-check/iu,
    /Evidence здесь создаёт/iu,
    /не меняет skill state/iu,
    /поняла твой free-text/iu,
    /ПРОВЕРЬ НА НОВОМ СПОТЕ/iu,
    /Новый спот показал/iu,
    /новом, не использованном в Диагностике споте/iu,
  ];
  const failures = [];
  for (const [relativePath, source] of sources) {
    for (const pattern of forbidden) if (pattern.test(source)) failures.push(`${relativePath}: ${pattern}`);
  }
  assert.deepEqual(failures, [], `Internal learner UI language remains:\n${failures.join("\n")}`);
});
