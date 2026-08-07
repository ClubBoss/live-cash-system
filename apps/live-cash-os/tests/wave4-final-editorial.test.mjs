import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";
import ts from "typescript";

async function compileInto(root, relativePath, outputPath, transform = (value) => value) {
  const source = await readFile(new URL(`../${relativePath}`, import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove,
    },
  }).outputText;
  const output = join(root, outputPath);
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, transform(compiled), "utf8");
  return output;
}

function identity(module) {
  return {
    moduleId: module.id,
    drillIds: module.drills.map((drill) => drill.id),
    actionIds: module.drills.map((drill) => drill.actionOptions.map((option) => option.id)),
    reasonIds: module.drills.map((drill) => drill.reasonOptions.map((option) => option.id)),
    misconceptionIds: module.drills.map((drill) => [
      ...drill.actionOptions.map((option) => option.misconceptionId ?? null),
      ...drill.reasonOptions.map((option) => option.misconceptionId ?? null),
    ]),
    cardIds: module.flashcards.map((card) => card.id),
  };
}

function learnerText(module) {
  return JSON.stringify({
    title: module.title,
    shortTitle: module.shortTitle,
    description: module.description,
    scope: module.scope,
    plainGoal: module.plainGoal,
    tableCue: module.tableCue,
    technicalTerm: module.technicalTerm,
    theory: module.theory,
    heuristics: module.heuristics,
    decisionTree: module.decisionTree,
    workedExample: module.workedExample,
    counterexample: module.counterexample,
    lab: module.lab,
    explainBackPrompt: module.explainBackPrompt,
    tableCard: module.tableCard,
    glossary: module.glossary,
    drills: module.drills.map((drill) => ({
      assumptions: drill.assumptions,
      cue: drill.cue,
      question: drill.question,
      actions: drill.actionOptions.map((option) => option.text),
      reasons: drill.reasonOptions.map((option) => option.text),
      explanation: drill.explanation,
    })),
    flashcards: module.flashcards.map(({ front, back }) => ({ front, back })),
  });
}

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), "live-cash-os-wave4-final-"));
  const modulesPath = await compileInto(root, "content/modules.ts", "content/modules.mjs");
  const wave4Path = await compileInto(root, "content/i18n/wave4-curriculum-gold.ts", "content/i18n/wave4-curriculum-gold.mjs", (compiled) =>
    compiled.replace('from "../modules"', 'from "../modules.mjs"'));
  const finalPath = await compileInto(root, "content/i18n/wave4-final-editorial.ts", "content/i18n/wave4-final-editorial.mjs", (compiled) =>
    compiled.replace('from "../modules"', 'from "../modules.mjs"'));
  return {
    modules: await import(pathToFileURL(modulesPath).href),
    wave4: await import(pathToFileURL(wave4Path).href),
    finalEditorial: await import(pathToFileURL(finalPath).href),
  };
}

function applyLocale(fixtureValue, locale) {
  fixtureValue.wave4.applyWave4CurriculumLocale(locale);
  fixtureValue.finalEditorial.applyWave4FinalEditorialLocale(locale);
}

const moduleIds = ["filtering", "shape", "ancestry", "multiway", "river", "evidence", "transfer"];

test("final Wave 4 editorial layer preserves all stable identities across locale round-trips", async () => {
  const value = await fixture();
  const before = Object.fromEntries(moduleIds.map((id) => [id, identity(value.modules.moduleById[id])]));
  for (const locale of ["ru", "en", "ru"]) {
    applyLocale(value, locale);
    for (const id of moduleIds) assert.deepEqual(identity(value.modules.moduleById[id]), before[id], `${id}: ${locale} changed stable identity`);
  }
});

test("final Russian LCM-10 and LCM-11 contain learner language instead of raw system status vocabulary", async () => {
  const value = await fixture();
  applyLocale(value, "ru");
  const text = `${learnerText(value.modules.moduleById.evidence)}\n${learnerText(value.modules.moduleById.transfer)}`;
  for (const pattern of [
    /learner state/iu,
    /WORKING evidence/iu,
    /transfer probe/iu,
    /PENDING_REVIEW/iu,
    /REVIEWED_VALID/iu,
    /REVIEWED_REPAIR/iu,
    /RETAINED/iu,
    /FIELD_VALIDATED/iu,
    /CONTENT_COMPLETED/iu,
    /product contract/iu,
    /field evidence/iu,
    /retention evidence/iu,
  ]) assert.doesNotMatch(text, pattern, `Final Russian learner copy leaks ${pattern}`);
  assert.match(value.modules.moduleById.evidence.title, /Риды/iu);
  assert.match(value.modules.moduleById.transfer.title, /правильного ответа.*применению/iu);
  assert.match(text, /Подтверждено в реальной игре/iu);
});

test("final Wave 4 editorial cleanup is Russian-only and leaves approved English text unchanged", async () => {
  const value = await fixture();
  value.wave4.applyWave4CurriculumLocale("en");
  const before = Object.fromEntries(["evidence", "transfer"].map((id) => [id, learnerText(value.modules.moduleById[id])]));
  value.finalEditorial.applyWave4FinalEditorialLocale("en");
  for (const id of ["evidence", "transfer"]) {
    assert.equal(learnerText(value.modules.moduleById[id]), before[id], `${id}: final RU cleanup mutated English`);
    assert.equal(/[А-Яа-яЁё]/u.test(before[id]), false, `${id}: English gold contains Cyrillic`);
  }
});
