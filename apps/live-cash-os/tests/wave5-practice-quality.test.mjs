import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import ts from "typescript";

async function loadTypeScriptModule(relativePath) {
  const source = await readFile(new URL(`../${relativePath}`, import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove,
    },
  }).outputText;
  const directory = await mkdtemp(join(tmpdir(), "live-cash-os-wave5-"));
  const output = join(directory, `${relativePath.replaceAll("/", "-").replace(/\.ts$/, "")}.mjs`);
  await writeFile(output, compiled, "utf8");
  return import(`${new URL(`file://${output}`).href}?${Date.now()}-${Math.random()}`);
}

const contentPromise = loadTypeScriptModule("content/modules.ts");

function normalized(value) {
  return value.trim().toLocaleLowerCase("en-US").replace(/\s+/g, " ");
}

test("Wave 5 corpus keeps one unambiguous answer contract for every drill", async () => {
  const { modules } = await contentPromise;
  const drills = modules.flatMap((module) => module.drills);
  assert.equal(modules.length, 11);
  assert.equal(drills.length, 55);

  for (const module of modules) {
    assert.ok(module.drills.length >= 5, `${module.id}: needs at least five core practice decisions`);
    assert.ok(module.drills.some((drill) => drill.kind === "changed"), `${module.id}: missing changed-node practice`);
    assert.ok(module.drills.some((drill) => drill.kind === "boundary"), `${module.id}: missing boundary practice`);

    for (const drill of module.drills) {
      assert.ok(drill.assumptions.length > 0, `${drill.id}: missing assumptions`);
      assert.ok(drill.cue.trim().length > 0, `${drill.id}: missing cue`);
      assert.ok(drill.question.trim().length > 0, `${drill.id}: missing question`);
      assert.ok(drill.explanation.trim().length > 0, `${drill.id}: missing explanation`);
      assert.ok(drill.targetSeconds > 0, `${drill.id}: invalid target time`);
      assert.ok(drill.actionOptions.length >= 3, `${drill.id}: action distractor set is too small`);
      assert.ok(drill.reasonOptions.length >= 3, `${drill.id}: reason distractor set is too small`);

      const actionIds = drill.actionOptions.map((option) => option.id);
      const reasonIds = drill.reasonOptions.map((option) => option.id);
      assert.equal(new Set(actionIds).size, actionIds.length, `${drill.id}: duplicate action ID`);
      assert.equal(new Set(reasonIds).size, reasonIds.length, `${drill.id}: duplicate reason ID`);
      assert.equal(actionIds.filter((id) => id === drill.correctActionId).length, 1, `${drill.id}: correct action must exist exactly once`);
      assert.equal(reasonIds.filter((id) => id === drill.correctReasonId).length, 1, `${drill.id}: correct reason must exist exactly once`);

      const actionText = drill.actionOptions.map((option) => normalized(option.text));
      const reasonText = drill.reasonOptions.map((option) => normalized(option.text));
      assert.equal(new Set(actionText).size, actionText.length, `${drill.id}: duplicate action wording`);
      assert.equal(new Set(reasonText).size, reasonText.length, `${drill.id}: duplicate reason wording`);
    }
  }
});

test("changed-node practice changes material context instead of repeating the core prompt", async () => {
  const { modules } = await contentPromise;
  for (const module of modules) {
    const core = module.drills.find((drill) => drill.kind === "core") ?? module.drills[0];
    const coreSignature = normalized(`${core.assumptions.join(" ")} ${core.cue} ${core.question}`);
    for (const drill of module.drills.filter((item) => item.kind === "changed" || item.kind === "boundary")) {
      const signature = normalized(`${drill.assumptions.join(" ")} ${drill.cue} ${drill.question}`);
      assert.notEqual(signature, coreSignature, `${drill.id}: variant repeats the core context`);
      assert.ok(drill.transferProbe?.changedVariables?.length || drill.kind === "boundary" || drill.variantGroup !== core.variantGroup,
        `${drill.id}: variant lacks an explicit changed-variable signal`);
    }
  }
});

test("at least one fifth of the current corpus is explicit boundary practice and uncertainty is represented", async () => {
  const { modules } = await contentPromise;
  const drills = modules.flatMap((module) => module.drills);
  const boundary = drills.filter((drill) => drill.kind === "boundary");
  assert.ok(boundary.length / drills.length >= 0.20, `Boundary share ${boundary.length}/${drills.length} is below 20%`);

  const allLearnerText = JSON.stringify(drills).toLocaleLowerCase("en-US");
  assert.match(allLearnerText, /(insufficient|unknown|uncertain|недостаточ|неизвест|неопредел)/u,
    "Corpus needs at least one explicit honest-uncertainty decision");
});

test("flashcards are unique, concise and tied to table-usable recall", async () => {
  const { modules } = await contentPromise;
  const cards = modules.flatMap((module) => module.flashcards);
  assert.equal(cards.length, 33);
  const ids = new Set();
  const fronts = new Set();

  for (const module of modules) {
    assert.ok(module.flashcards.length >= 3, `${module.id}: needs at least three cards`);
  }

  for (const card of cards) {
    assert.equal(ids.has(card.id), false, `Duplicate card ID: ${card.id}`);
    ids.add(card.id);
    const front = normalized(card.front);
    assert.equal(fronts.has(front), false, `Duplicate card prompt: ${card.front}`);
    fronts.add(front);
    assert.ok(card.front.trim().length >= 8 && card.front.trim().length <= 180, `${card.id}: front is not concise`);
    assert.ok(card.back.trim().length >= 5 && card.back.trim().length <= 320, `${card.id}: back is not concise`);
    assert.ok(["heuristic", "boundary", "procedure"].includes(card.kind), `${card.id}: unsupported card kind`);
  }
});

test("Wave 5 UI layer enforces three-topic mixed practice, topic concealment and prediction-first labs", async () => {
  const source = await readFile(new URL("../components/Wave5PracticeLayer.tsx", import.meta.url), "utf8");
  assert.match(source, /completedModules < 3/u);
  assert.match(source, /data-wave5-mixed/u);
  assert.match(source, /aria-label/u);
  assert.match(source, /Predict the result first/u);
  assert.match(source, /Сначала спрогнозируй результат/u);
  assert.match(source, /prediction\.trim\(\)\.length < 20/u);
  assert.match(source, /betValue > stackValue/u);
  assert.match(source, /Change at least one material variable/u);
  assert.match(source, /seen\.length === 2/u);
  assert.match(source, /counterexample/u);
});
