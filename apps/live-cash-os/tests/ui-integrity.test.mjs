import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const sourcePromise = readFile(new URL("../components/LiveCashApp.tsx", import.meta.url), "utf8");

test("cloud sync is driven by learner-state changes, not sync-label changes", async () => {
  const source = await sourcePromise;
  assert.match(source, /\[ready, state\]\);/u);
  assert.doesNotMatch(source, /\[ready, state, syncStatus\]\);/u);
});

test("T1 starts through the context-locking model helper", async () => {
  const source = await sourcePromise;
  assert.match(source, /startDiagnosticRun\(state, locale\)/u);
  assert.match(source, /measurement_context: diagnostic\.measurementContext/u);
  assert.match(source, /locale_at_start: diagnostic\.localeAtStart/u);
  assert.doesNotMatch(source, /baselineEligible \? "COLD_BASELINE"/u);
});

test("T1 scorer import is schema-validated before routing", async () => {
  const source = await sourcePromise;
  assert.match(source, /parseDiagnosticScore/u);
  assert.match(source, /deriveDiagnosticPriorityModules/u);
  assert.doesNotMatch(source, /payload\.priority_modules/u);
});

test("variant transfer requires an explicit changed-node probe", async () => {
  const source = await sourcePromise;
  assert.match(source, /transferProbe: drill\.kind === "changed"/u);
});
