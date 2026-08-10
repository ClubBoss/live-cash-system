import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const app = await readFile(new URL("../components/LiveCashApp.tsx", import.meta.url), "utf8");
const core = await readFile(new URL("../components/LiveCashAppCore.tsx", import.meta.url), "utf8");
const practice = await readFile(new URL("../components/Wave5PracticeLayer.tsx", import.meta.url), "utf8");

assert.doesNotMatch(app, /MutationObserver/u, "LiveCashApp must not infer React state with MutationObserver");
for (const [name, source] of [["LiveCashApp", app], ["Wave5PracticeLayer", practice]]) {
  assert.doesNotMatch(source, /\.textContent/u, `${name} must not infer React state from textContent`);
}

const liveHostStart = practice.indexOf("function useLiveHost(");
const liveHostEnd = practice.indexOf("\nfunction ", liveHostStart + 1);
assert.ok(liveHostStart >= 0 && liveHostEnd > liveHostStart, "Wave5PracticeLayer must keep bounded useLiveHost portal discovery");
const liveHostSource = practice.slice(liveHostStart, liveHostEnd);
const practiceOutsideLiveHost = practice.slice(0, liveHostStart) + practice.slice(liveHostEnd);
assert.equal((practice.match(/new MutationObserver\s*\(/gu) ?? []).length, 1, "Wave5PracticeLayer may contain exactly one portal-host MutationObserver");
assert.equal((liveHostSource.match(/new MutationObserver\s*\(/gu) ?? []).length, 1, "Wave5PracticeLayer MutationObserver must stay inside useLiveHost");
assert.doesNotMatch(practiceOutsideLiveHost, /MutationObserver/u, "Wave5PracticeLayer must not infer React state with MutationObserver outside useLiveHost");
assert.match(liveHostSource, /document\.querySelector<HTMLElement>\(selector\)/u, "useLiveHost must discover only the requested portal selector");
assert.match(liveHostSource, /setHost\(/u, "useLiveHost must update only React portal-host state");
assert.match(liveHostSource, /new MutationObserver\(sync\)/u, "useLiveHost observer must only re-run host discovery");
assert.match(liveHostSource, /observer\.observe\(document\.body,\s*\{\s*childList:\s*true,\s*subtree:\s*true\s*\}\)/u, "useLiveHost observer must remain bounded to DOM host availability");
assert.match(liveHostSource, /return \(\) => observer\.disconnect\(\)/u, "useLiveHost observer must disconnect on cleanup");
assert.doesNotMatch(liveHostSource, /readPracticeSnapshot|applyPracticeDom|setSnapshot/u, "useLiveHost must not reconcile or infer learner state");

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

console.log("Wave 4R runtime gate passed: only bounded portal-host observation is allowed; no textContent reconciliation or raw learner statuses.");
