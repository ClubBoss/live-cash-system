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
  const root = await mkdtemp(join(tmpdir(), "live-cash-os-wave4-"));
  const modulesPath = await compileInto(root, "content/modules.ts", "content/modules.mjs");
  const goldPath = await compileInto(root, "content/i18n/wave4-curriculum-gold.ts", "content/i18n/wave4-curriculum-gold.mjs", (compiled) =>
    compiled.replace('from "../modules"', 'from "../modules.mjs"'));
  const modules = await import(pathToFileURL(modulesPath).href);
  const gold = await import(pathToFileURL(goldPath).href);
  return { modules, gold };
}

const ids = ["filtering", "shape", "ancestry", "multiway", "river", "evidence", "transfer"];

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

function learnerDrill(drill) {
  return {
    assumptions: drill.assumptions,
    cue: drill.cue,
    question: drill.question,
    actionOptions: drill.actionOptions.map(({ text, misconceptionId }) => ({ text, misconceptionId })),
    reasonOptions: drill.reasonOptions.map(({ text, misconceptionId }) => ({ text, misconceptionId })),
    explanation: drill.explanation,
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
    drills: module.drills.map(learnerDrill),
    flashcards: module.flashcards.map(({ kind, front, back }) => ({ kind, front, back })),
  });
}

test("Wave 4 gold preserves every stable learner-state identity across RU and EN", async () => {
  const { modules, gold } = await fixture();
  const before = Object.fromEntries(ids.map((id) => [id, identity(modules.moduleById[id])]));
  gold.applyWave4CurriculumLocale("ru");
  for (const id of ids) assert.deepEqual(identity(modules.moduleById[id]), before[id], `${id}: RU changed stable identity`);
  gold.applyWave4CurriculumLocale("en");
  for (const id of ids) assert.deepEqual(identity(modules.moduleById[id]), before[id], `${id}: EN changed stable identity`);
  gold.applyWave4CurriculumLocale("ru");
  for (const id of ids) assert.deepEqual(identity(modules.moduleById[id]), before[id], `${id}: locale round-trip changed stable identity`);
});

test("Wave 4 English gold has no Cyrillic fallback and all modules have complete assets", async () => {
  const { modules, gold } = await fixture();
  gold.applyWave4CurriculumLocale("en");
  let drills = 0;
  let cards = 0;
  for (const id of ids) {
    const module = modules.moduleById[id];
    assert.equal(/[А-Яа-яЁё]/u.test(learnerText(module)), false, `${id}: English gold contains Cyrillic learner copy`);
    assert.equal(module.drills.length, 5, `${id}: expected five stable drills`);
    assert.equal(module.flashcards.length, 3, `${id}: expected three stable cards`);
    drills += module.drills.length;
    cards += module.flashcards.length;
  }
  assert.equal(drills, 35);
  assert.equal(cards, 21);
});

test("Wave 4 Russian gold removes the old hybrid architecture phrasing", async () => {
  const { modules, gold } = await fixture();
  gold.applyWave4CurriculumLocale("ru");
  const russian = ids.map((id) => learnerText(modules.moduleById[id])).join("\n");
  for (const pattern of [
    /Players-behind gate/iu,
    /Value squeeze core/iu,
    /node signature/iu,
    /jobless bluff/iu,
    /credible bluff supply/iu,
    /range ownership audit/iu,
    /source range/iu,
    /arrival range/iu,
    /bluff any two/iu,
  ]) assert.doesNotMatch(russian, pattern, `Russian Wave 4 gold contains hybrid jargon ${pattern}`);
});

test("LCM-04 rebuilds the range after actions rather than carrying the source range forward", async () => {
  const { modules, gold } = await fixture();
  gold.applyWave4CurriculumLocale("ru");
  const module = modules.moduleById.filtering;
  assert.equal(module.title, "Диапазон после каждого действия");
  assert.match(module.tableCue, /Откуда начал.*что сделал.*что осталось/iu);
  assert.match(module.theory.join(" "), /Чек.*не означает автоматически слабость/iu);
  assert.match(module.drills.find((item) => item.id === "fil-05").explanation, /Эксплойт привязан к конкретному решению/iu);
});

test("LCM-05 separates value-driven sizing from bet frequency and protects calls", async () => {
  const { modules, gold } = await fixture();
  gold.applyWave4CurriculumLocale("en");
  const module = modules.moduleById.shape;
  assert.equal(module.title, "Bet size and response shape");
  assert.match(module.theory.join(" "), /Low betting frequency does not automatically imply a large size/i);
  assert.match(module.theory.join(" "), /Some strong hands are needed in calls/i);
  assert.match(module.drills.find((item) => item.id === "sha-04").explanation, /worse continues and equity that can actually be denied/i);
});

test("LCM-07 traces branch ancestry before blocker selection", async () => {
  const { modules, gold } = await fixture();
  gold.applyWave4CurriculumLocale("en");
  const module = modules.moduleById.ancestry;
  assert.equal(module.title, "Range ancestry");
  assert.match(module.theory.join(" "), /blocker.*cannot manufacture folds or bluffs/i);
  assert.match(module.drills.find((item) => item.id === "anc-02").explanation, /source branch changed/i);
  assert.match(module.tableCard.join(" "), /Source range.*Earlier actions.*Surviving value.*Natural weak hands/i);
});

test("LCM-08 makes action order and shared defence explicit in multiway pots", async () => {
  const { modules, gold } = await fixture();
  gold.applyWave4CurriculumLocale("en");
  const module = modules.moduleById.multiway;
  assert.equal(module.title, "Multiway action order and shared defence");
  assert.match(module.theory.join(" "), /defence is shared/i);
  assert.match(module.theory.join(" "), /closing-action player/i);
  assert.match(module.drills.find((item) => item.id === "mul-04").explanation, /initiative cannot replace source-range ownership/i);
});

test("LCM-09 audits river bluff supply before size and blockers", async () => {
  const { modules, gold } = await fixture();
  gold.applyWave4CurriculumLocale("en");
  const module = modules.moduleById.river;
  assert.equal(module.title, "River value, bluffs, and blockers");
  assert.match(module.tableCue, /Origin.*filters.*value.*bluffs.*size.*blocker.*evidence/i);
  assert.match(module.theory.join(" "), /harmful blocker.*missed draws/i);
  assert.match(module.drills.find((item) => item.id === "riv-05").explanation, /Population overrides require evidence/i);
});

test("LCM-10 treats one showdown as existence evidence, not a frequency estimate", async () => {
  const { modules, gold } = await fixture();
  gold.applyWave4CurriculumLocale("en");
  const module = modules.moduleById.evidence;
  assert.equal(module.title, "Reads: what do we actually know?");
  assert.match(module.theory.join(" "), /One showdown establishes.*can exist.*does not establish its frequency/i);
  assert.match(module.theory.join(" "), /not treated as proven for Batumi/i);
  assert.match(module.drills.find((item) => item.id === "evi-04").explanation, /Precise branch storage/i);
});

test("LCM-11 mirrors the product evidence contract without collapsing mastery states", async () => {
  const { modules, gold } = await fixture();
  gold.applyWave4CurriculumLocale("en");
  const module = modules.moduleById.transfer;
  assert.equal(module.title, "From a correct answer to table transfer");
  assert.match(module.theory.join(" "), /Completing the explanation only records exposure/i);
  assert.match(module.theory.join(" "), /explicitly declared changed-node probe/i);
  assert.match(module.theory.join(" "), /Retention evidence is recorded only when a delayed review is actually due/i);
  assert.match(module.theory.join(" "), /Field validation requires reviewed reasoning and multiple supporting events/i);
});

test("all seven Wave 4 claim ledgers satisfy the strategic admission schema boundary", async () => {
  const schema = JSON.parse(await readFile(new URL("../content/claims/claim.schema.json", import.meta.url), "utf8"));
  for (const number of ["04", "05", "07", "08", "09", "10", "11"]) {
    const name = `lcm-${number}.claims.json`;
    const claims = JSON.parse(await readFile(new URL(`../content/claims/${name}`, import.meta.url), "utf8"));
    assert.equal(claims.length, 4, `${name}: expected four admitted mechanism claims`);
    for (const claim of claims) {
      for (const field of schema.required) assert.notEqual(claim[field], undefined, `${claim.claim_id}: missing ${field}`);
      assert.ok(claim.source_refs.length > 0, `${claim.claim_id}: missing provenance`);
      assert.ok(claim.assumptions.length > 0, `${claim.claim_id}: missing assumptions`);
      assert.notEqual(claim.confidence, "LOW", `${claim.claim_id}: LOW cannot be gold`);
      assert.notEqual(claim.confidence, "UNRESOLVED", `${claim.claim_id}: UNRESOLVED cannot be gold`);
      assert.equal(claim.status, "ADMITTED", `${claim.claim_id}: claim must be admitted for candidate gold`);
    }
  }
});
