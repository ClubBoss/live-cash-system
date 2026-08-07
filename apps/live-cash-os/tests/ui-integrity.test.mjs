import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const sourcePromise = readFile(new URL("../components/LiveCashAppCore.tsx", import.meta.url), "utf8");
const syncHookPromise = readFile(new URL("../lib/use-learner-state-sync.ts", import.meta.url), "utf8");

test("cloud sync is driven by learner-state changes, not sync-label changes", async () => {
  const source = await sourcePromise;
  const hook = await syncHookPromise;
  assert.match(source, /useReliableLearnerState\(\)/u);
  assert.match(hook, /\[postState, ready, recoveryBlocked, retryNonce, state\]\);/u);
  assert.doesNotMatch(hook, /\[[^\]]*syncStatus[^\]]*\]\);/u);
});

test("T1 export distinguishes cold baseline from post-learning diagnosis", async () => {
  const source = await sourcePromise;
  const model = await readFile(new URL("../lib/model-core.ts", import.meta.url), "utf8");
  assert.match(model, /measurementContext:\s*exposed \? "POST_LEARNING_DIAGNOSTIC" : "COLD_BASELINE"/u);
  assert.match(source, /measurement_context: diagnostic\.measurementContext/u);
});
