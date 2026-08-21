import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const corpus = await readFile(path.join(root, "content/practical-mastery/decisions-recognition-expansion.ts"), "utf8");
const gaps = await readFile(path.join(root, "content/practical-mastery/source-gaps.ts"), "utf8");
const rules = await readFile(path.join(root, "content/practical-mastery/recognition-a5-memory.ts"), "utf8");

function count(skillId, kindPattern) {
  return [...corpus.matchAll(new RegExp(`skillId:[\\s]*["']${skillId}["'][\\s]*,[\\s]*kind:[\\s]*["'](${kindPattern})["']`, "g"))].length;
}

test("supported recognition families have full evidence depth", () => {
  for (const skillId of ["W4-BOARD-01", "W4-RUNOUT-01", "W4-HAND-01", "W4-REL-01"]) {
    assert.ok(count(skillId, "recognition") >= 2, `${skillId} recognition corpus`);
    assert.ok(count(skillId, "decision") >= 3, `${skillId} direct corpus`);
    assert.ok(count(skillId, "changed|mixed") >= 2, `${skillId} transfer corpus`);
    assert.ok(count(skillId, "boundary") >= 1, `${skillId} boundary corpus`);
  }
});

test("draw taxonomy stays explicitly partial rather than fabricated", () => {
  assert.match(gaps, /skillId: "W4-DRAW-01"[\s\S]{0,220}status: "PARTIAL"/);
  assert.match(gaps, /full nut\/weak\/combo\/pair\+draw taxonomy is broader/i);
});

test("recognition is contextual instead of label-to-action memorisation", () => {
  assert.match(corpus, /board.*ranges|ranges.*board/is);
  assert.match(corpus, /non-identical/i);
  assert.match(corpus, /action ancestry|flop action|check-back composition/i);
  assert.doesNotMatch(corpus, /high flop = always bet/i);
});

test("A5 memory hooks encode board-range, family-trait and runout-ancestry transfer", () => {
  for (const rule of ["RULE-REC-BOARD-RANGES", "RULE-REC-COMBO-FAMILY-TRAITS", "RULE-REC-RUNOUT-ANCESTRY"]) assert.match(rules, new RegExp(rule));
  assert.match(rules, /transferCueRu/);
  assert.match(rules, /reversalsRu/);
});
