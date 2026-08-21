import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const masteryLayout = readFileSync(fileURLToPath(new URL("../app/mastery/layout.tsx", import.meta.url)), "utf8");

test("all Practical Mastery routes inherit the shared test-invite boundary and navigation", () => {
  assert.match(masteryLayout, /import PracticalMasteryNav from "\.\.\/\.\.\/components\/PracticalMasteryNav"/);
  assert.match(masteryLayout, /import TestInviteGate from "\.\.\/\.\.\/components\/TestInviteGate"/);
  assert.match(masteryLayout, /<TestInviteGate>[\s\S]*<PracticalMasteryNav\s*\/>[\s\S]*\{children\}[\s\S]*<\/TestInviteGate>/);
});
