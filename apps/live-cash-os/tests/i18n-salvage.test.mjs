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

async function loadI18nFixture() {
  const root = await mkdtemp(join(tmpdir(), "live-cash-os-i18n-"));
  const modulesPath = await compileInto(root, "content/modules.ts", "content/modules.mjs");
  await compileInto(root, "content/i18n/geometry-gold.ts", "content/i18n/geometry-gold.mjs", (compiled) =>
    compiled.replace('from "../modules"', 'from "../modules.mjs"'));
  await compileInto(root, "content/i18n/geometry-ru-gold.ts", "content/i18n/geometry-ru-gold.mjs", (compiled) =>
    compiled.replace('from "../modules"', 'from "../modules.mjs"'));
  const localePath = await compileInto(root, "content/i18n/geometry-locale.ts", "content/i18n/geometry-locale.mjs", (compiled) =>
    compiled
      .replace('from "../modules"', 'from "../modules.mjs"')
      .replace('from "./geometry-gold"', 'from "./geometry-gold.mjs"')
      .replace('from "./geometry-ru-gold"', 'from "./geometry-ru-gold.mjs"'));
  const routePath = await compileInto(root, "content/i18n/learning-route.ts", "content/i18n/learning-route.mjs");
  const modules = await import(pathToFileURL(modulesPath).href);
  const locale = await import(pathToFileURL(localePath).href);
  const route = await import(pathToFileURL(routePath).href);
  return { modules, locale, route };
}

test("LCM-01 switches approved RU/EN copy while preserving stable IDs", async () => {
  const { modules, locale } = await loadI18nFixture();
  const geometry = modules.moduleById.geometry;
  const drillIds = geometry.drills.map((item) => item.id);
  const cardIds = geometry.flashcards.map((item) => item.id);

  locale.applyGeometryLocale("ru");
  assert.equal(geometry.title, "Эффективный стек и размер банка");
  assert.equal(geometry.drills[0].question, "В каких единицах сначала оценить глубину?");
  assert.equal(geometry.flashcards[0].front, "Что проверить первым при обязательном страддле?");
  assert.deepEqual(geometry.drills.map((item) => item.id), drillIds);
  assert.deepEqual(geometry.flashcards.map((item) => item.id), cardIds);

  locale.applyGeometryLocale("en");
  assert.equal(geometry.title, "Effective stack and pot geometry");
  assert.equal(geometry.drills[0].question, "Which unit should describe the depth first?");
  assert.equal(geometry.drills[1].question, "How should effective stack be described?");
  assert.equal(geometry.flashcards[0].front, "What is the first check when a live straddle is mandatory?");
  assert.deepEqual(geometry.drills.map((item) => item.id), drillIds);
  assert.deepEqual(geometry.flashcards.map((item) => item.id), cardIds);
  assert.equal(modules.allDrills.find((item) => item.id === "geo-01").question, "Which unit should describe the depth first?");

  locale.applyGeometryLocale("ru");
  assert.equal(geometry.drills[0].question, "В каких единицах сначала оценить глубину?");
  assert.deepEqual(geometry.drills.map((item) => item.id), drillIds);
  assert.deepEqual(geometry.flashcards.map((item) => item.id), cardIds);
});

test("the bilingual route contains nine locale-appropriate evidence stages", async () => {
  const { route } = await loadI18nFixture();
  const russian = route.getLearningRoute("ru");
  const english = route.getLearningRoute("en");
  for (const stages of [russian, english]) {
    assert.equal(stages.length, 9);
    assert.deepEqual(stages.map((item) => item.percent), [0, 10, 20, 35, 50, 65, 80, 90, 100]);
    assert.ok(stages.every((item) => item.evidenceGate.trim().length > 0));
  }
  assert.match(russian[4].evidenceGate, /новой ситуации/i);
  assert.match(russian[8].evidenceGate, /подтверждён/i);
  assert.doesNotMatch(russian.map((item) => `${item.description} ${item.evidenceGate}`).join(" "), /evidence|probe|repair|retention|field validated/i);
  assert.match(english[4].evidenceGate, /transfer/i);
  assert.match(english[8].evidenceGate, /validated/i);
});
