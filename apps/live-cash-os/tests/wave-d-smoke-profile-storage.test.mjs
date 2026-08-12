import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const smoke = await readFile(new URL("../scripts/wave-d-completion-smoke.mjs", import.meta.url), "utf8");

test("Wave D completion smoke resolves learner state from the active profile namespace", () => {
  assert.match(smoke, /const PROFILE_KEY = "live-cash-os:portable-profile-code"/u);
  assert.match(smoke, /candidate\.startsWith\(`\$\{learnerKey\}:profile:`\)/u);
  assert.match(smoke, /localStorage\.getItem\(profileKey\)/u);
  assert.doesNotMatch(smoke, /JSON\.parse\(localStorage\.getItem\("live-cash-os:learner-state"/u);
  assert.doesNotMatch(smoke, /localStorage\.setItem\("live-cash-os:learner-state"/u);
});

test("Wave D completion smoke preserves anonymous learner-state fallback", () => {
  const fallbackMatches = smoke.match(/\n\s*: learnerKey;/gu) ?? [];
  assert.ok(fallbackMatches.length >= 5, `expected repeated anonymous learner fallback, found ${fallbackMatches.length}`);
});
