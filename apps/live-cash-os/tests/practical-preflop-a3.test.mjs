import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const files = [
  "content/practical-mastery/decisions-w1-w3.ts",
  "content/practical-mastery/decisions-gap-fill.ts",
  "content/practical-mastery/decisions-preflop-core-expansion.ts",
  "content/practical-mastery/decisions-preflop-advanced-expansion.ts",
  "content/practical-mastery/decisions-preflop-live-expansion.ts",
];
const corpus = (await Promise.all(files.map((file) => readFile(path.join(root, file), "utf8")))).join("\n");
const memory = await readFile(path.join(root, "content/practical-mastery/preflop-a3-memory.ts"), "utf8");

function count(skillId, kindPattern) {
  return [...corpus.matchAll(new RegExp(`skillId:\\s*[\"']${skillId}[\"']\\s*,\\s*kind:\\s*[\"'](${kindPattern})[\"']`, "g"))].length;
}

test("PF-01 through PF-10 have full practical evidence corpora", () => {
  for (let index = 1; index <= 10; index += 1) {
    const skillId = `PF-${String(index).padStart(2, "0")}`;
    assert.ok(count(skillId, "recognition") >= 2, `${skillId} recognition corpus`);
    assert.ok(count(skillId, "decision") >= 3, `${skillId} direct-decision corpus`);
    assert.ok(count(skillId, "changed|mixed") >= 2, `${skillId} transfer corpus`);
    assert.ok(count(skillId, "boundary") >= 1, `${skillId} boundary corpus`);
  }
});

test("preflop corpus avoids unsupported exact chart/frequency obligations", () => {
  assert.doesNotMatch(corpus, /open exactly \d+%/i);
  assert.doesNotMatch(corpus, /call exactly \d+%/i);
  assert.doesNotMatch(corpus, /3-bet exactly \d+%/i);
  assert.doesNotMatch(corpus, /always defend exactly 50%/i);
});

test("squeeze corpus includes called branch, fold equity, position and a boundary", () => {
  const live = await readFile(path.join(root, "content/practical-mastery/decisions-preflop-live-expansion.ts"), "utf8");
  for (const token of ["called branch", "fold equity", "position_when_called", "DEAD_MONEY_MAGIC"]) assert.match(live, new RegExp(token, "i"));
});

test("live-adjustment corpus covers straddle, rake, depth and players behind", () => {
  const live = await readFile(path.join(root, "content/practical-mastery/decisions-preflop-live-expansion.ts"), "utf8");
  for (const token of ["straddle", "rake", "depth", "players behind"]) assert.match(live, new RegExp(token, "i"));
});

test("A3 supplies causal memory hooks for squeeze and live adjustments", () => {
  assert.match(memory, /RULE-PF-SQUEEZE-BRANCH-EV/);
  assert.match(memory, /RULE-PF-LIVE-GEOMETRY/);
  assert.match(memory, /RULE-PF-RAKE-FRINGE/);
  assert.match(memory, /reversalsRu/);
  assert.match(memory, /transferCueRu/);
});
