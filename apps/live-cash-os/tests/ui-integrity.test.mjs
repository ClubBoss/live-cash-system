import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const sourcePromise = readFile(new URL("../components/LiveCashAppCore.tsx", import.meta.url), "utf8");
const syncHookPromise = readFile(new URL("../lib/use-learner-state-sync.ts", import.meta.url), "utf8");
const dataSafetyPromise = readFile(new URL("../components/DataSafetyPanel.tsx", import.meta.url), "utf8");

test("cloud sync is driven by learner-state changes, not sync-label changes", async () => {
  const source = await sourcePromise;
  const hook = await syncHookPromise;
  assert.match(source, /useReliableLearnerState\(\)/u);
  assert.match(hook, /const serialized = JSON\.stringify\(state\)/u);
  assert.match(hook, /serialized === lastAckedSerialized\.current/u);
  assert.match(hook, /void flushCloudState\(latestState\.current\)/u);
  // setLearnerState was added (P1-5 local-write-arbitration repair) so the
  // conflict branch can adopt the durable snapshot; it is a stable ([] deps)
  // callback, so this still does not reintroduce a syncStatus-driven effect.
  assert.match(hook, /\[accountKey, flushCloudState, ready, recoveryBlocked, retryNonce, state, setLearnerState\]\);/u);
  assert.doesNotMatch(hook, /\[[^\]]*syncStatus[^\]]*\]\);/u);
});

test("T1 export distinguishes cold baseline from post-learning diagnosis", async () => {
  const source = await sourcePromise;
  const model = await readFile(new URL("../lib/model-core.ts", import.meta.url), "utf8");
  assert.match(model, /measurementContext:\s*exposed \? "POST_LEARNING_DIAGNOSTIC" : "COLD_BASELINE"/u);
  assert.match(source, /measurement_context: diagnostic\.measurementContext/u);
});

test("data recovery surface translates internal sync and recovery codes for learners", async () => {
  const panel = await dataSafetyPromise;
  assert.match(panel, /function syncStatusLabel/u);
  assert.match(panel, /function recoveryMessage/u);
  assert.match(panel, /syncStatusLabel\(locale, syncStatus\)/u);
  assert.match(panel, /recoveryMessage\(locale, recoveryCode\)/u);
  assert.doesNotMatch(panel, /<b>\{syncStatus\}<\/b>/u);
  assert.doesNotMatch(panel, /\$\{recoveryCode\}/u);
  assert.match(panel, /role="status" aria-live="polite"/u);
});
