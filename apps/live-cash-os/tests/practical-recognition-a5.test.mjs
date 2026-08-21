import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const corpus = await readFile(path.join(root, "content/practical-mastery/decisions-recognition-expansion.ts"), "utf8");
const b1 = await readFile(path.join(root, "content/practical-mastery/decisions-source-closure-b1.ts"), "utf8");
const gaps = await readFile(path.join(root, "content/practical-mastery/source-gaps.ts"), "utf8");
const rules = await readFile(path.join(root, "content/practical-mastery/recognition-a5-memory.ts"), "utf8");

function count(skillId, kindPattern) {
  return [...corpus.matchAll(new RegExp(`q\\([^\\n]*?["']${skillId}["']\\s*,\\s*["'](${kindPattern})["']`, "g"))].length;
}

test("supported recognition families have full evidence depth", () => {
  for (const skillId of ["W4-BOARD-01", "W4-RUNOUT-01", "W4-HAND-01", "W4-REL-01"]) {
    assert.ok(count(skillId, "recognition") >= 2, `${skillId} recognition corpus`);
    assert.ok(count(skillId, "decision") >= 3, `${skillId} direct corpus`);
    assert.ok(count(skillId, "changed|mixed") >= 2, `${skillId} transfer corpus`);
    assert.ok(count(skillId, "boundary") >= 1, `${skillId} boundary corpus`);
  }
});

test("B1 closes the draw-quality source gap without fabricating exact chart logic", () => {
  assert.doesNotMatch(gaps, /skillId: "W4-DRAW-01"/);
  assert.match(b1, /skillId:"W4-DRAW-01"/);
  assert.match(b1, /EXT-PC-OUTS-GUIDE-2023/);
  assert.match(b1, /clean outs \+ nut potential \+ overlap\/double-counting \+ showdown value/i);
});

test("recognition is contextual and intentional shortcuts remain tagged distractors", () => {
  assert.match(corpus, /board.*ranges|ranges.*board/is);
  assert.match(corpus, /non-identical/i);
  assert.match(corpus, /action ancestry|flop action|check-back composition/i);
  assert.match(corpus, /High flop = always bet/i);
  assert.match(corpus, /o\("b",badRu,badEn,"CLASSIFICATION_SHORTCUT"\)/);
  assert.match(corpus, /correctActionId:"a"/);
});

test("A5 memory hooks encode board-range, family-trait and runout-ancestry transfer", () => {
  for (const rule of ["RULE-REC-BOARD-RANGES", "RULE-REC-COMBO-FAMILY-TRAITS", "RULE-REC-RUNOUT-ANCESTRY"]) assert.match(rules, new RegExp(rule));
  assert.match(rules, /transferCueRu/);
  assert.match(rules, /reversalsRu/);
});
