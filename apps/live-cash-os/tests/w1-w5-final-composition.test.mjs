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

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), "live-cash-os-w1-w5-final-"));
  const modulesPath = await compileInto(root, "content/modules.ts", "content/modules.mjs");
  await compileInto(root, "content/diagnostic.ts", "content/diagnostic.mjs");
  await compileInto(root, "content/i18n/runtime-core.ts", "content/i18n/runtime-core.mjs");
  await compileInto(root, "content/i18n/runtime.ts", "content/i18n/runtime.mjs", (compiled) => compiled
    .replaceAll('from "./runtime-core"', 'from "./runtime-core.mjs"'));
  await compileInto(root, "content/i18n/geometry-gold.ts", "content/i18n/geometry-gold.mjs", (compiled) => compiled.replace('from "../modules"', 'from "../modules.mjs"'));
  await compileInto(root, "content/i18n/geometry-ru-gold.ts", "content/i18n/geometry-ru-gold.mjs", (compiled) => compiled.replace('from "../modules"', 'from "../modules.mjs"'));
  await compileInto(root, "content/i18n/geometry-locale.ts", "content/i18n/geometry-locale.mjs", (compiled) => compiled
    .replace('from "../modules"', 'from "../modules.mjs"')
    .replace('from "./geometry-gold"', 'from "./geometry-gold.mjs"')
    .replace('from "./geometry-ru-gold"', 'from "./geometry-ru-gold.mjs"'));
  await compileInto(root, "content/i18n/wave3-priority-gold.ts", "content/i18n/wave3-priority-gold.mjs", (compiled) => compiled.replace('from "../modules"', 'from "../modules.mjs"'));
  await compileInto(root, "content/i18n/wave4-curriculum-gold.ts", "content/i18n/wave4-curriculum-gold.mjs", (compiled) => compiled.replace('from "../modules"', 'from "../modules.mjs"'));
  await compileInto(root, "content/i18n/wave4-final-editorial.ts", "content/i18n/wave4-final-editorial.mjs", (compiled) => compiled.replace('from "../modules"', 'from "../modules.mjs"'));
  await compileInto(root, "content/i18n/wave5-practice-copy.ts", "content/i18n/wave5-practice-copy.mjs", (compiled) => compiled.replace('from "../modules"', 'from "../modules.mjs"'));
  await compileInto(root, "content/i18n/wave4r-final-language.ts", "content/i18n/wave4r-final-language.mjs", (compiled) => compiled.replace('from "../modules"', 'from "../modules.mjs"'));
  const pipelinePath = await compileInto(root, "content/i18n/locale-pipeline.ts", "content/i18n/locale-pipeline.mjs", (compiled) => compiled
    .replace('from "../diagnostic"', 'from "../diagnostic.mjs"')
    .replace('from "./runtime"', 'from "./runtime.mjs"')
    .replace('from "./geometry-locale"', 'from "./geometry-locale.mjs"')
    .replace('from "./wave3-priority-gold"', 'from "./wave3-priority-gold.mjs"')
    .replace('from "./wave4-curriculum-gold"', 'from "./wave4-curriculum-gold.mjs"')
    .replace('from "./wave4-final-editorial"', 'from "./wave4-final-editorial.mjs"')
    .replace('from "./wave5-practice-copy"', 'from "./wave5-practice-copy.mjs"')
    .replace('from "./wave4r-final-language"', 'from "./wave4r-final-language.mjs"'));

  return {
    modules: await import(pathToFileURL(modulesPath).href),
    pipeline: await import(pathToFileURL(pipelinePath).href),
  };
}

const PRIORITY_IDS = ["preflop", "blinds", "aggression"];

function identity(module) {
  return {
    moduleId: module.id,
    drillIds: module.drills.map((drill) => drill.id),
    actionIds: module.drills.map((drill) => drill.actionOptions.map((option) => option.id)),
    reasonIds: module.drills.map((drill) => drill.reasonOptions.map((option) => option.id)),
    cardIds: module.flashcards.map((card) => card.id),
  };
}

function drillText(drill) {
  return JSON.stringify({
    assumptions: drill.assumptions,
    cue: drill.cue,
    question: drill.question,
    actions: drill.actionOptions.map((option) => option.text),
    reasons: drill.reasonOptions.map((option) => option.text),
    explanation: drill.explanation,
  });
}

function assertPriorityIntegrity(modules, locale) {
  const priority = PRIORITY_IDS.map((id) => modules.moduleById[id]);
  const drills = priority.flatMap((module) => module.drills);
  assert.equal(drills.length, 15, `${locale}: expected exactly 15 W3 drills`);
  assert.equal(new Set(drills.map((drill) => drill.id)).size, 15, `${locale}: W3 drill IDs must be unique`);
  for (const drill of drills) {
    assert.equal(drill.actionOptions.filter((option) => option.id === drill.correctActionId).length, 1, `${locale}/${drill.id}: one correct action ID required`);
    assert.equal(drill.reasonOptions.filter((option) => option.id === drill.correctReasonId).length, 1, `${locale}/${drill.id}: one correct reason ID required`);
  }
}

test("canonical locale pipeline keeps wave4r-poker-native compatibility copy inert", async () => {
  const pipeline = await readFile(new URL("../content/i18n/locale-pipeline.ts", import.meta.url), "utf8");
  const wave5 = await readFile(new URL("../content/i18n/wave5-practice-copy.ts", import.meta.url), "utf8");
  assert.doesNotMatch(pipeline, /wave4r-poker-native/u);
  assert.doesNotMatch(wave5, /wave4r-poker-native/u);
});

test("final W3 RU and EN composition preserves stable IDs and repaired semantics", async () => {
  const value = await fixture();
  const before = Object.fromEntries(PRIORITY_IDS.map((id) => [id, identity(value.modules.moduleById[id])]));

  value.pipeline.applyLocaleData("ru");
  assertPriorityIntegrity(value.modules, "ru");
  for (const id of PRIORITY_IDS) assert.deepEqual(identity(value.modules.moduleById[id]), before[id], `ru/${id}: stable identity drift`);

  const ruPre05 = value.modules.moduleById.preflop.drills.find((drill) => drill.id === "pre-05");
  const ruAgg01 = value.modules.moduleById.aggression.drills.find((drill) => drill.id === "agg-01");
  const ruAgg02 = value.modules.moduleById.aggression.drills.find((drill) => drill.id === "agg-02");
  const ruAgg04 = value.modules.moduleById.aggression.drills.find((drill) => drill.id === "agg-04");
  const ruAgg05 = value.modules.moduleById.aggression.drills.find((drill) => drill.id === "agg-05");

  assert.doesNotMatch(drillText(ruPre05), /(?:~|≈)?\s*60\s*bb/iu, "ru/pre-05: unsupported ~60bb boundary returned");
  assert.doesNotMatch(drillText(ruAgg01), /\b\d+\s*bb\b/iu, "ru/agg-01: unsupported exact stack depth returned");
  assert.equal(ruAgg01.question, "Какой вывод наиболее важен для BTN?");
  assert.equal(ruAgg01.actionOptions[0].text, "Защищаться шире против недокомпенсированной c-bet-частоты");
  assert.equal(ruAgg02.question, "Какой план является разумным кандидатом?");
  assert.match(ruAgg02.assumptions.join(" "), /обычный сильный 3-бет-диапазон.*сухая старшая или спаренная доска/iu);
  assert.equal(ruAgg04.question, "Можно ли автоматически повторить range-bet на тёрне?");
  assert.equal(ruAgg04.actionOptions[0].text, "Нет; заново отфильтровать оба диапазона и стать селективнее");
  assert.match(`${ruAgg05.question} ${ruAgg05.explanation}`, /крупн.*(?:рейз|пуш)|верхн.*вэлью/iu);

  value.pipeline.applyLocaleData("en");
  assertPriorityIntegrity(value.modules, "en");
  for (const id of PRIORITY_IDS) assert.deepEqual(identity(value.modules.moduleById[id]), before[id], `en/${id}: stable identity drift`);

  const enPre05 = value.modules.moduleById.preflop.drills.find((drill) => drill.id === "pre-05");
  const enAgg01 = value.modules.moduleById.aggression.drills.find((drill) => drill.id === "agg-01");
  const enAgg04 = value.modules.moduleById.aggression.drills.find((drill) => drill.id === "agg-04");
  const enAgg05 = value.modules.moduleById.aggression.drills.find((drill) => drill.id === "agg-05");
  const enAggression = value.modules.moduleById.aggression;

  assert.doesNotMatch(drillText(enPre05), /(?:~|≈)?\s*60\s*bb/iu, "en/pre-05: unsupported ~60bb boundary returned");
  assert.doesNotMatch(drillText(enAgg01), /\b\d+\s*bb\b/iu, "en/agg-01: unsupported exact stack depth returned");
  assert.equal(enAgg04.question, "Can the same very high betting frequency be copied automatically to the turn?");
  assert.equal(enAgg04.actionOptions[0].text, "No; rebuild both ranges and choose turn bets more selectively");
  assert.equal(enAgg05.question, "What matters most before building a large OOP raise or shove?");
  assert.match(enAgg05.explanation, /Start with enough strong value/iu);
  assert.equal(enAggression.workedExample.situation, "BB 3-bets BTN clearly wider than normal, then uses a small c-bet on a dry flop with almost the whole range.");
  assert.doesNotMatch(enAggression.workedExample.situation, /\b\d+\s*bb\b/iu);

  value.pipeline.applyLocaleData("ru");
  assertPriorityIntegrity(value.modules, "ru-return");
  for (const id of PRIORITY_IDS) assert.deepEqual(identity(value.modules.moduleById[id]), before[id], `ru-return/${id}: stable identity drift`);
});
