import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import ts from "typescript";

async function loadModel() {
  const source = await readFile(new URL("../lib/model.ts", import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove,
    },
  }).outputText;
  const directory = await mkdtemp(join(tmpdir(), "live-cash-os-test-"));
  const output = join(directory, "lib-model.mjs");
  await writeFile(output, compiled, "utf8");
  return import(`${new URL(`file://${output}`).href}?${Date.now()}-${Math.random()}`);
}

function session() {
  return {
    mode: "repair",
    moduleId: "geometry",
    step: 0,
    drillIds: ["geo-04"],
    currentIndex: 0,
    selectedActionId: null,
    selectedReasonId: null,
    confidence: 65,
    startedAt: "2026-08-07T00:00:00.000Z",
    itemStartedAt: "2026-08-07T00:00:00.000Z",
    explainBack: "",
  };
}

function decision() {
  return {
    moduleId: "geometry",
    drillId: "geo-04",
    nodeKey: "nominal-100bb",
    variantGroup: "future-spr",
    mode: "repair",
    actionOk: true,
    reasonOk: true,
    confidence: 80,
    elapsedSeconds: 12,
    targetSeconds: 25,
    isBoundary: true,
  };
}

test("a later field repair cannot bypass an earlier regular repair", async () => {
  const model = await loadModel();
  const state = model.emptyLearnerState();
  state.reviewQueue.push(
    {
      id: "regular-first",
      moduleId: "geometry",
      sourceDrillId: "geo-03",
      variantGroup: "future-spr",
      kind: "repair",
      dueAt: "2020-01-01T00:00:00.000Z",
      attempts: 0,
      sourceInteractionId: "regular-source",
    },
    {
      id: "field-second",
      moduleId: "geometry",
      sourceDrillId: "field:hand-1",
      variantGroup: "field-geometry",
      kind: "repair",
      dueAt: "2020-01-02T00:00:00.000Z",
      attempts: 0,
      sourceInteractionId: "hand-1",
    },
  );
  state.activeSession = session();

  const next = model.recordDecision(state, decision());
  assert.equal(next.reviewQueue.some((item) => item.id === "regular-first"), false);
  assert.equal(next.reviewQueue.some((item) => item.id === "field-second"), true);
});
