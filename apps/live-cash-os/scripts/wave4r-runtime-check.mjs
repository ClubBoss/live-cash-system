import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const app = await readFile(new URL("../components/LiveCashApp.tsx", import.meta.url), "utf8");
const core = await readFile(new URL("../components/LiveCashAppCore.tsx", import.meta.url), "utf8");
const practice = await readFile(new URL("../components/Wave5PracticeLayer.tsx", import.meta.url), "utf8");

for (const [name, source] of [["LiveCashApp", app], ["Wave5PracticeLayer", practice]]) {
  assert.doesNotMatch(source, /MutationObserver/u, `${name} must not infer React state with MutationObserver`);
  assert.doesNotMatch(source, /\.textContent/u, `${name} must not infer React state from textContent`);
}

for (const pattern of [/data-wave4r-label/u, /annotateLegacyUi/u, /wave4rEmptyFallback/u, /\.textContent\s*=/u]) {
  assert.doesNotMatch(app, pattern, `Locale wrapper still contains removed Wave 4R bridge ${pattern}`);
  assert.doesNotMatch(core, pattern, `Core still contains removed Wave 4R bridge ${pattern}`);
}

for (const raw of [
  /session\.mode\.toUpperCase/u,
  /\{drill\.kind\}<\/p>/u,
  /\{card\.kind\}<\/p>/u,
  />\{note\.status\}<\/span>/u,
  /T1 · \{diagnostic\.status\}/u,
  />ACTIVE RECALL/u,
  />Cue:<\/b>/u,
  />Action:<\/b>/u,
  />Reason:<\/b>/u,
]) assert.doesNotMatch(core, raw, `Core renders raw learner-facing implementation label ${raw}`);

console.log("Wave 4R runtime gate passed: no MutationObserver/textContent reconciliation and no raw learner statuses.");
