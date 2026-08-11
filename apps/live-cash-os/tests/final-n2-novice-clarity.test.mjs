import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import ts from "typescript";

async function loadTs(relativePath) {
  const source = await readFile(new URL(`../${relativePath}`, import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove,
    },
  }).outputText;
  const directory = await mkdtemp(join(tmpdir(), "live-cash-os-test-n2-"));
  const output = join(directory, `${relativePath.replaceAll("/", "-").replace(/\.ts$/u, "")}.mjs`);
  await writeFile(output, compiled, "utf8");
  return import(`${new URL(`file://${output}`).href}?${Date.now()}-${Math.random()}`);
}

const wave7Promise = loadTs("lib/wave7.ts");
const modelPromise = loadTs("lib/model-core.ts");

function lessonSession() {
  return {
    mode: "lesson",
    moduleId: "geometry",
    step: 7,
    drillIds: ["geo-01"],
    currentIndex: 0,
    selectedActionId: null,
    selectedReasonId: null,
    confidence: 65,
    startedAt: "2026-08-11T12:00:00.000Z",
    itemStartedAt: "2026-08-11T12:00:00.000Z",
    explainBack: "",
    sourceReviewId: undefined,
  };
}

test("Explain-back rejects empty and whitespace input", async () => {
  const wave7 = await wave7Promise;
  const model = await modelPromise;
  for (const value of ["", "   \n\t  "]) {
    const state = model.emptyLearnerState();
    state.activeSession = lessonSession();
    const next = wave7.saveExplainBack(state, "geometry", "geometry.explainBack", value);
    assert.equal(next, state);
    assert.equal(wave7.explainBackRecords(next, "geometry").length, 0);
  }
});

test("Explain-back accepts a short genuine explanation through the existing pending-review path", async () => {
  const wave7 = await wave7Promise;
  const model = await modelPromise;
  const state = model.emptyLearnerState();
  state.activeSession = lessonSession();
  const beforeEvidence = structuredClone(state.modules.geometry.evidence);
  const beforeState = state.modules.geometry.state;
  const text = "Fold из-за рейка";

  assert.equal(text.length < 30, true);
  assert.equal(wave7.isGenuineExplainBackAttempt(text), true);
  const next = wave7.saveExplainBack(state, "geometry", "geometry.explainBack", text);
  const records = wave7.explainBackRecords(next, "geometry");

  assert.equal(records.length, 1);
  assert.equal(records[0].text, text);
  assert.equal(records[0].status, "PENDING_REVIEW");
  assert.deepEqual(next.modules.geometry.evidence, beforeEvidence);
  assert.equal(next.modules.geometry.state, beforeState);
  assert.equal(next.modules.geometry.evidence.retention.exposures, 0);
  assert.equal(next.modules.geometry.evidence.field_transfer.exposures, 0);
});

test("Explain-back rejects obvious repeated-word filler", async () => {
  const wave7 = await wave7Promise;
  const model = await modelPromise;
  const state = model.emptyLearnerState();
  state.activeSession = lessonSession();

  assert.equal(wave7.isGenuineExplainBackAttempt("blah blah blah blah"), false);
  const next = wave7.saveExplainBack(state, "geometry", "geometry.explainBack", "blah blah blah blah");
  assert.equal(next, state);
  assert.equal(wave7.explainBackRecords(next).length, 0);
});

test("Explain-back gate has no character-count quota in UI or persistence", async () => {
  const core = await readFile(new URL("../components/LiveCashAppCore.tsx", import.meta.url), "utf8");
  const wave7 = await readFile(new URL("../lib/wave7.ts", import.meta.url), "utf8");
  assert.doesNotMatch(core, /trim\(\)\.length\s*[<>]=?\s*30/u);
  assert.doesNotMatch(wave7, /trimmed\.length\s*[<>]=?\s*30/u);
  assert.match(core, /isGenuineExplainBackAttempt\(value\)/u);
  assert.match(wave7, /isGenuineExplainBackAttempt\(trimmed\)/u);
});

test("SPR learner terminology names the pre-call stack while preserving the formula", async () => {
  const layer = await readFile(new URL("../components/Wave5PracticeLayer.tsx", import.meta.url), "utf8");
  const labels = await readFile(new URL("../content/i18n/learner-ui.ts", import.meta.url), "utf8");
  const recap = await readFile(new URL("../components/RealUseLessonAssist.tsx", import.meta.url), "utf8");

  assert.match(labels, /stack: "Стек до колла"/u);
  assert.match(labels, /stack: "Stack before the call"/u);
  assert.match(layer, /stack: "Стек до колла"/u);
  assert.match(layer, /stack: "Stack before the call"/u);
  assert.match(layer, /Ставка\/колл не может быть больше стека до колла\./u);
  assert.match(layer, /Bet\/call cannot exceed the stack before the call\./u);
  assert.match(recap, /стек до колла/u);
  assert.match(recap, /stack before the call/u);
  assert.match(layer, /\(lab\.stack - lab\.bet\) \/ \(lab\.initialPot \+ 2 \* lab\.bet\)/u);
  assert.match(layer, /\(stackValue - betValue\) \/ \(potValue \+ 2 \* betValue\)/u);
});
