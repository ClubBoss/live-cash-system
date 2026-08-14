import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
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

function finalCorpusStrings() {
  return moduleIds.flatMap((moduleId) => learnerStrings(moduleById[moduleId]));
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

function matchingCorpusStrings(strings, patterns) {
  const failures = [];
  for (const text of strings) {
    for (const pattern of patterns) {
      if (pattern.test(text)) failures.push(`${pattern} :: ${text}`);
    }
  }
  return failures;
}

function quotedStrings(source) {
  const values = [];
  for (const pattern of [/"((?:\\.|[^"\\])*)"/gu, /'((?:\\.|[^'\\])*)'/gu, /`((?:\\.|[^`\\])*)`/gu]) {
    for (const match of source.matchAll(pattern)) values.push(match[1]);
  }
  return values;
}

const componentHybridPatterns = [
  /\bself-check\b/iu,
  /\bfree-text\b/iu,
  /\bskill state\b/iu,
  /\bevidence\b/iu,
  /\bsource ranges?\b/iu,
  /\branges?\b/iu,
  /\bbranches?\b/iu,
  /\bnode\b/iu,
  /\b(?:gate|probe)\b/iu,
  /\bheads-up\b/iu,
  /\bownership\b/iu,
  /\bbluff supply\b/iu,
  /\bpopulation prior\b/iu,
  /\bfield evidence\b/iu,
  /\brealisation\b/iu,
  /\bplayability\b/iu,
  /\bOOP\b/u,
  /\bMDF\b/u,
];

test("final RU learner corpus is free of known technical-Frankenstein language", () => {
  applyLocaleData("ru");
  assert.equal(moduleIds.length, 11);
  assert.equal(moduleIds.reduce((sum, moduleId) => sum + moduleById[moduleId].drills.length, 0), 55);
  const failures = matchingCorpusStrings(finalCorpusStrings(), ruHybridPatterns);
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
  const failures = matchingCorpusStrings(finalCorpusStrings(), enResearchPatterns);
  assert.deepEqual(failures, [], `Research/editorial language remains in English learner copy:\n${failures.join("\n")}`);
  assert.deepEqual(identitySnapshot(), originalIdentities, "English language polish changed scoring or misconception identities");
});

test("all RU component string literals are free of internal architecture jargon", async () => {
  const componentDir = path.join(root, "components");
  const names = (await readdir(componentDir)).filter((name) => name.endsWith(".tsx"));
  const failures = [];
  for (const name of names) {
    const source = await readFile(path.join(componentDir, name), "utf8");
    const russianStrings = quotedStrings(source).filter((text) => /[А-Яа-яЁё]/u.test(text));
    for (const text of russianStrings) {
      for (const pattern of componentHybridPatterns) {
        if (pattern.test(text)) failures.push(`${name}: ${pattern} :: ${text}`);
      }
    }
  }
  assert.deepEqual(failures, [], `Internal jargon remains in RU component copy:\n${failures.join("\n")}`);
});