import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const source = readFileSync(fileURLToPath(new URL("../lib/practical-scaffold-fading.ts", import.meta.url)), "utf8");

test("RU scaffold cue keeps internal English decision vocabulary out of learner copy", () => {
  const guidedRu = source.match(/level\s*===\s*"guided"[\s\S]{0,200}?locale\s*===\s*"ru"\s*\?\s*"([^"]+)"/)?.[1] ?? "";
  assert.ok(guidedRu, "guided RU scaffold cue must remain discoverable by the editorial guard");
  assert.doesNotMatch(guidedRu, /\b(?:action history|ranges)\b/i);
  assert.match(guidedRu, /история действий/);
  assert.match(guidedRu, /диапазоны/);
});
