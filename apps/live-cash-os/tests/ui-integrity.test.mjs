import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const sourcePromise = readFile(new URL("../components/LiveCashApp.tsx", import.meta.url), "utf8");

test("cloud sync is driven by learner-state changes, not sync-label changes", async () => {
  const source = await sourcePromise;
  assert.match(source, /\[ready, state\]\);/u);
  assert.doesNotMatch(source, /\[ready, state, syncStatus\]\);/u);
});

test("T1 export distinguishes cold baseline from post-learning diagnosis", async () => {
  const source = await sourcePromise;
  assert.match(source, /measurement_context: baselineEligible \? "COLD_BASELINE" : "POST_LEARNING_DIAGNOSTIC"/u);
  assert.match(source, /не является исходным cold baseline/u);
});
