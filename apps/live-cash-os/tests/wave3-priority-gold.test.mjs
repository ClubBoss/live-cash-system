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
  const root = await mkdtemp(join(tmpdir(), "live-cash-os-wave3-"));
  const modulesPath = await compileInto(root, "content/modules.ts", "content/modules.mjs");
  const goldPath = await compileInto(root, "content/i18n/wave3-priority-gold.ts", "content/i18n/wave3-priority-gold.mjs", (compiled) =>
    compiled.replace('from "../modules"', 'from "../modules.mjs"'));
  const modules = await import(pathToFileURL(modulesPath).href);
  const gold = await import(pathToFileURL(goldPath).href);
  return { modules, gold };
}

function identity(module) {
  return {
    moduleId: module.id,
    drillIds: module.drills.map((drill) => drill.id),
    actionIds: module.drills.map((drill) => drill.actionOptions.map((option) => option.id)),
    reasonIds: module.drills.map((drill) => drill.reasonOptions.map((option) => option.id)),
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
    drills: module.drills,
    flashcards: module.flashcards,
  });
}

test("Wave 3 priority gold preserves all stable learner-state IDs across RU and EN", async () => {
  const { modules, gold } = await fixture();
  const ids = ["preflop", "blinds", "aggression"];
  const before = Object.fromEntries(ids.map((id) => [id, identity(modules.moduleById[id])]));

  gold.applyWave3PriorityLocale("ru");
  for (const id of ids) assert.deepEqual(identity(modules.moduleById[id]), before[id]);

  gold.applyWave3PriorityLocale("en");
  for (const id of ids) assert.deepEqual(identity(modules.moduleById[id]), before[id]);

  gold.applyWave3PriorityLocale("ru");
  for (const id of ids) assert.deepEqual(identity(modules.moduleById[id]), before[id]);
});

test("Wave 3 priority gold is fully bilingual rather than mixed fallback copy", async () => {
  const { modules, gold } = await fixture();
  const ids = ["preflop", "blinds", "aggression"];

  gold.applyWave3PriorityLocale("en");
  for (const id of ids) {
    const text = learnerText(modules.moduleById[id]);
    assert.equal(/[А-Яа-яЁё]/u.test(text), false, `${id}: English gold contains Cyrillic`);
  }

  gold.applyWave3PriorityLocale("ru");
  const russian = ids.map((id) => learnerText(modules.moduleById[id])).join("\n");
  for (const pattern of [
    /Players-behind gate/iu,
    /Value squeeze core/iu,
    /node signature/iu,
    /jobless bluff/iu,
    /arrival range/iu,
    /credible bluff supply/iu,
    /realisation\/implied/iu,
  ]) {
    assert.doesNotMatch(russian, pattern, `Russian Wave 3 gold contains hybrid jargon ${pattern}`);
  }
});

test("LCM-02 teaches branch construction without unsupported fixed chart cells", async () => {
  const { modules, gold } = await fixture();
  gold.applyWave3PriorityLocale("ru");
  const module = modules.moduleById.preflop;

  assert.equal(module.title, "Префлоп: структура решения");
  assert.match(module.tableCue, /Цена.*диапазоны.*игроки за спиной.*качество колла/iu);
  assert.match(module.drills.find((item) => item.id === "pre-04").explanation, /существующих миксов/iu);
  assert.match(module.drills.find((item) => item.id === "pre-05").explanation, /направленный сдвиг/iu);
  assert.doesNotMatch(learnerText(module), /A5s.*всегда|76s.*обяз/iu);
});

test("LCM-03 distinguishes BB closing action from SB squeeze exposure", async () => {
  const { modules, gold } = await fixture();
  gold.applyWave3PriorityLocale("en");
  const module = modules.moduleById.blinds;

  assert.equal(module.title, "Blind source and range identity");
  assert.match(module.theory.join(" "), /closes the preflop action/i);
  assert.match(module.theory.join(" "), /BB can squeeze/i);
  assert.match(module.drills.find((item) => item.id === "bli-02").explanation, /price and closing action/i);
});

test("LCM-06 connects preflop range width to 3-bet-pot postflop aggression", async () => {
  const { modules, gold } = await fixture();
  gold.applyWave3PriorityLocale("en");
  const module = modules.moduleById.aggression;

  assert.equal(module.title, "Aggression and defence in 3-bet pots");
  assert.match(module.theory.join(" "), /3-bets much wider than normal.*more checks/i);
  assert.match(module.drills.find((item) => item.id === "agg-04").explanation, /not a licence for an automatic second barrel/i);
  assert.match(module.drills.find((item) => item.id === "agg-05").explanation, /top-end holdings/i);
});

test("Wave 3 claim ledgers satisfy the strategic claim schema boundary", async () => {
  const schema = JSON.parse(await readFile(new URL("../content/claims/claim.schema.json", import.meta.url), "utf8"));
  for (const name of ["lcm-02.claims.json", "lcm-03.claims.json", "lcm-06.claims.json"]) {
    const claims = JSON.parse(await readFile(new URL(`../content/claims/${name}`, import.meta.url), "utf8"));
    assert.equal(claims.length, 4, `${name}: expected four admitted mechanism claims`);
    for (const claim of claims) {
      for (const field of schema.required) assert.notEqual(claim[field], undefined, `${claim.claim_id}: missing ${field}`);
      assert.ok(claim.source_refs.length > 0);
      assert.ok(claim.assumptions.length > 0);
      assert.ok(claim.exceptions.length > 0);
      assert.notEqual(claim.confidence, "LOW");
      assert.notEqual(claim.confidence, "UNRESOLVED");
    }
  }
});
