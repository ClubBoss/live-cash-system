import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const corpusFiles = [
  "content/practical-mastery/decisions-w1-w3.ts",
  "content/practical-mastery/decisions-gap-fill.ts",
  "content/practical-mastery/decisions-blind-defence-expansion.ts",
  "content/practical-mastery/decisions-executable-gate-repair.ts",
];
const corpus = (await Promise.all(corpusFiles.map((file) => readFile(path.join(root, file), "utf8")))).join("\n");
const b1 = await readFile(path.join(root, "content/practical-mastery/decisions-source-closure-b1.ts"), "utf8");
const gaps = await readFile(path.join(root, "content/practical-mastery/source-gaps.ts"), "utf8");
const rules = await readFile(path.join(root, "content/practical-mastery/blind-a4-memory.ts"), "utf8");

function count(skillId, kindPattern) {
  return [...corpus.matchAll(new RegExp(`skillId:\\s*["']${skillId}["']\\s*,\\s*kind:\\s*["'](${kindPattern})["']`, "g"))].length;
}

test("source-supported core blind families have practical evidence depth", () => {
  for (const skillId of ["BL-01", "BL-02", "BL-03", "BL-04", "BL-05", "BL-12"]) {
    assert.ok(count(skillId, "recognition") >= 2, `${skillId} recognition corpus`);
    assert.ok(count(skillId, "decision") >= 3, `${skillId} direct corpus`);
    assert.ok(count(skillId, "changed|mixed") >= 2 || skillId === "BL-03", `${skillId} transfer corpus`);
    assert.ok(count(skillId, "boundary") >= 1, `${skillId} boundary corpus`);
  }
});

test("B1 reopens supported BvB preflop nodes while keeping BL-11 partial", () => {
  for (const skillId of ["BL-06", "BL-07", "BL-08", "BL-09"]) assert.match(b1, new RegExp(`skillId:\\"${skillId}\\"`));
  assert.match(gaps, /skillId: "BL-11"[\s\S]*status: "PARTIAL"/);
  for (const skillId of ["BL-06", "BL-07", "BL-08", "BL-09"]) assert.doesNotMatch(gaps, new RegExp(`skillId: "${skillId}"`));
});

test("blind memory hooks train contrasts rather than a permanent checklist", () => {
  for (const rule of ["RULE-BLIND-BB-VS-SB-CONTRAST", "RULE-BLIND-ORIGIN-STRENGTH", "RULE-BLIND-SIZE-PRICE", "RULE-BLIND-POSTFLOP-IDENTITY"]) assert.match(rules, new RegExp(rule));
  assert.match(rules, /transferCueRu/);
  assert.match(rules, /reversalsRu/);
});

test("legacy postflop blind identity still does not masquerade as the new preflop authority", () => {
  assert.match(rules, /does not define preflop SB limp\/raise\/fold strategy/);
  assert.match(rules, /SLC-M02-L05/);
  assert.match(b1, /EXT-GTOW-SB-SRP-2024/);
  assert.match(b1, /EXT-UP-BVB-LIMP-2019/);
});
