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
  const root = await mkdtemp(join(tmpdir(), "live-cash-os-wave5-"));
  const modulesPath = await compileInto(root, "content/modules.ts", "content/modules.mjs");
  await compileInto(root, "content/i18n/geometry-gold.ts", "content/i18n/geometry-gold.mjs", (compiled) => compiled.replace('from "../modules"', 'from "../modules.mjs"'));
  await compileInto(root, "content/i18n/geometry-ru-gold.ts", "content/i18n/geometry-ru-gold.mjs", (compiled) => compiled.replace('from "../modules"', 'from "../modules.mjs"'));
  const geometryPath = await compileInto(root, "content/i18n/geometry-locale.ts", "content/i18n/geometry-locale.mjs", (compiled) => compiled
    .replace('from "../modules"', 'from "../modules.mjs"')
    .replace('from "./geometry-gold"', 'from "./geometry-gold.mjs"')
    .replace('from "./geometry-ru-gold"', 'from "./geometry-ru-gold.mjs"'));
  const wave3Path = await compileInto(root, "content/i18n/wave3-priority-gold.ts", "content/i18n/wave3-priority-gold.mjs", (compiled) => compiled.replace('from "../modules"', 'from "../modules.mjs"'));
  const wave4Path = await compileInto(root, "content/i18n/wave4-curriculum-gold.ts", "content/i18n/wave4-curriculum-gold.mjs", (compiled) => compiled.replace('from "../modules"', 'from "../modules.mjs"'));
  const finalPath = await compileInto(root, "content/i18n/wave4-final-editorial.ts", "content/i18n/wave4-final-editorial.mjs", (compiled) => compiled.replace('from "../modules"', 'from "../modules.mjs"'));
  const wave5CopyPath = await compileInto(root, "content/i18n/wave5-practice-copy.ts", "content/i18n/wave5-practice-copy.mjs", (compiled) => compiled.replace('from "../modules"', 'from "../modules.mjs"'));
  const finalLanguagePath = await compileInto(root, "content/i18n/wave4r-final-language.ts", "content/i18n/wave4r-final-language.mjs", (compiled) => compiled.replace('from "../modules"', 'from "../modules.mjs"'));
  return {
    modules: await import(pathToFileURL(modulesPath).href),
    geometry: await import(pathToFileURL(geometryPath).href),
    wave3: await import(pathToFileURL(wave3Path).href),
    wave4: await import(pathToFileURL(wave4Path).href),
    finalEditorial: await import(pathToFileURL(finalPath).href),
    wave5Copy: await import(pathToFileURL(wave5CopyPath).href),
    finalLanguage: await import(pathToFileURL(finalLanguagePath).href),
  };
}

function applyLocale(value, locale) {
  value.geometry.applyGeometryLocale(locale);
  value.wave3.applyWave3PriorityLocale(locale);
  value.wave4.applyWave4CurriculumLocale(locale);
  value.finalEditorial.applyWave4FinalEditorialLocale(locale);
  value.wave5Copy.applyWave5PracticeCopy(locale);
  value.finalLanguage.applyWave4RFinalLanguage(locale);
}

function normalized(value) {
  return value.trim().toLocaleLowerCase("en-US").replace(/\s+/g, " ");
}

function auditDrills(modules, locale) {
  const drills = modules.flatMap((module) => module.drills);
  assert.equal(modules.length, 11, `${locale}: expected 11 modules`);
  assert.equal(drills.length, 55, `${locale}: expected 55 drills`);
  for (const module of modules) {
    assert.equal(module.drills.length, 5, `${locale}/${module.id}: expected five stable decisions`);
    assert.ok(module.drills.some((drill) => drill.kind === "changed"), `${locale}/${module.id}: missing changed-node practice`);
    assert.ok(module.drills.some((drill) => drill.kind === "boundary"), `${locale}/${module.id}: missing boundary practice`);
    for (const drill of module.drills) {
      assert.ok(drill.assumptions.length > 0, `${locale}/${drill.id}: missing assumptions`);
      assert.ok(drill.cue.trim().length > 0, `${locale}/${drill.id}: missing cue`);
      assert.ok(drill.question.trim().length > 0, `${locale}/${drill.id}: missing question`);
      assert.ok(drill.explanation.trim().length > 0, `${locale}/${drill.id}: missing explanation`);
      assert.ok(drill.targetSeconds > 0, `${locale}/${drill.id}: invalid target time`);
      assert.equal(drill.actionOptions.length, 3, `${locale}/${drill.id}: expected three action options`);
      assert.equal(drill.reasonOptions.length, 3, `${locale}/${drill.id}: expected three reason options`);
      const actionIds = drill.actionOptions.map((option) => option.id);
      const reasonIds = drill.reasonOptions.map((option) => option.id);
      assert.equal(new Set(actionIds).size, actionIds.length, `${locale}/${drill.id}: duplicate action ID`);
      assert.equal(new Set(reasonIds).size, reasonIds.length, `${locale}/${drill.id}: duplicate reason ID`);
      assert.equal(actionIds.filter((id) => id === drill.correctActionId).length, 1, `${locale}/${drill.id}: correct action must exist exactly once`);
      assert.equal(reasonIds.filter((id) => id === drill.correctReasonId).length, 1, `${locale}/${drill.id}: correct reason must exist exactly once`);
      assert.equal(new Set(drill.actionOptions.map((option) => normalized(option.text))).size, drill.actionOptions.length, `${locale}/${drill.id}: duplicate action wording`);
      assert.equal(new Set(drill.reasonOptions.map((option) => normalized(option.text))).size, drill.reasonOptions.length, `${locale}/${drill.id}: duplicate reason wording`);
    }
    const core = module.drills.find((drill) => drill.kind === "core") ?? module.drills[0];
    const coreSignature = normalized(`${core.assumptions.join(" ")} ${core.cue} ${core.question}`);
    const coreAssumptions = new Set(core.assumptions.map(normalized));
    for (const drill of module.drills.filter((item) => item.kind === "changed" || item.kind === "boundary")) {
      const signature = normalized(`${drill.assumptions.join(" ")} ${drill.cue} ${drill.question}`);
      assert.notEqual(signature, coreSignature, `${locale}/${drill.id}: variant repeats the core context`);
      const assumptions = new Set(drill.assumptions.map(normalized));
      const changedAssumption = [...assumptions].some((item) => !coreAssumptions.has(item)) || [...coreAssumptions].some((item) => !assumptions.has(item));
      assert.equal(changedAssumption, true, `${locale}/${drill.id}: variant does not change any stated assumption`);
    }
  }
  const boundary = drills.filter((drill) => drill.kind === "boundary");
  assert.ok(boundary.length / drills.length >= 0.20, `${locale}: boundary share ${boundary.length}/${drills.length} is below 20%`);
  const learnerText = JSON.stringify(drills).toLocaleLowerCase(locale === "ru" ? "ru-RU" : "en-US");
  assert.match(learnerText, locale === "ru" ? /(недостаточ|неизвест|неопредел)/u : /(insufficient|unknown|uncertain)/u, `${locale}: corpus needs explicit honest-uncertainty practice`);
}

function auditCards(modules, locale) {
  const cards = modules.flatMap((module) => module.flashcards);
  assert.equal(cards.length, 33, `${locale}: expected 33 cards`);
  const ids = new Set();
  const fronts = new Set();
  for (const module of modules) assert.equal(module.flashcards.length, 3, `${locale}/${module.id}: expected three cards`);
  for (const card of cards) {
    assert.equal(ids.has(card.id), false, `${locale}: duplicate card ID ${card.id}`);
    ids.add(card.id);
    const front = normalized(card.front);
    assert.equal(fronts.has(front), false, `${locale}: duplicate card prompt: ${card.front}`);
    fronts.add(front);
    assert.ok(card.front.trim().length >= 8 && card.front.trim().length <= 180, `${locale}/${card.id}: front is not concise`);
    assert.ok(card.back.trim().length >= 5 && card.back.trim().length <= 320, `${locale}/${card.id}: back is not concise`);
    assert.ok(["heuristic", "boundary", "procedure"].includes(card.kind), `${locale}/${card.id}: unsupported card kind`);
  }
}

test("Wave 5 audits the canonical final learner-facing RU and EN corpus", async () => {
  const value = await fixture();
  for (const locale of ["ru", "en"]) {
    applyLocale(value, locale);
    auditDrills(value.modules.modules, locale);
    auditCards(value.modules.modules, locale);
  }
});

test("Wave 5 practice copy keeps blocker cards distinct without changing stable card IDs", async () => {
  const value = await fixture();
  const before = value.modules.modules.flatMap((module) => module.flashcards.map((card) => card.id));
  applyLocale(value, "en");
  assert.equal(value.modules.moduleById.filtering.flashcards.find((card) => card.id === "fil-card-blocker").front, "What should be rebuilt before judging a blocker on a new street?");
  assert.equal(value.modules.moduleById.ancestry.flashcards.find((card) => card.id === "anc-card-before").front, "What comes before blocker analysis?");
  applyLocale(value, "ru");
  assert.equal(value.modules.moduleById.filtering.flashcards.find((card) => card.id === "fil-card-blocker").front, "Что восстановить перед оценкой блокера на новой улице?");
  const after = value.modules.modules.flatMap((module) => module.flashcards.map((card) => card.id));
  assert.deepEqual(after, before);
});

test("Wave 5 UI layer enforces three-topic mixed practice, topic concealment and explicit prediction-first labs", async () => {
  const source = await readFile(new URL("../components/Wave5PracticeLayer.tsx", import.meta.url), "utf8");
  assert.match(source, /completedModules < 3/u);
  assert.match(source, /data-wave5-mixed/u);
  assert.match(source, /aria-label/u);
  assert.match(source, /Choose one change and predict the SPR first/u);
  assert.match(source, /Сначала выбери одно изменение и предскажи SPR/u);
  assert.match(source, /prediction\.trim\(\)\.length >= 24/u);
  assert.match(source, /disabled=\{!predictionReady\}/u);
  assert.match(source, /State whether SPR will rise, fall, or stay about the same, and why/u);
  assert.match(source, /станет SPR выше, ниже или примерно тем же и почему/u);
  assert.match(source, /betValue > stackValue/u);
  assert.match(source, /changedCount === 1/u);
  assert.match(source, /Change only the pot, remaining stack, or bet\/call/u);
  assert.match(source, /Измени только банк, оставшийся стек или ставку\/колл/u);
  assert.match(source, /What you are comparing/u);
  assert.match(source, /Что сравниваем/u);
  assert.match(source, /seen\.length === 2/u);
  assert.match(source, /counterexample/u);
  assert.doesNotMatch(source, /Predict the result first/u);
  assert.doesNotMatch(source, /Сначала спрогнозируй результат/u);
  assert.doesNotMatch(source, /Change at least one material variable/u);
});
