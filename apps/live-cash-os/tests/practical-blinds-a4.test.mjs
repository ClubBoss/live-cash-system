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
];
const corpus = (await Promise.all(corpusFiles.map((file) => readFile(path.join(root, file), "utf8")))).join("\n");
const gaps = await readFile(path.join(root, "content/practical-mastery/source-gaps.ts"), "utf8");
const rules = await readFile(path.join(root, "content/practical-mastery/blind-a4-memory.ts"), "utf8");

function count(skillId, kindPattern) {
  return [...corpus.matchAll(new RegExp(`skillId:\\s*["']${skillId}["']\\s*,\\s*kind:\\s*["'](${kindPattern})["']`, "g"))].length;
}

test("source-supported core blind families have practical evidence depth", () => {
  for (const skillId of ["BL-01", "BL-02", "BL-03", "BL-04", "BL-05", "BL-12"]) {
    assert.ok(count(skillId, "recognition") >= 2, `${skillId} recognition corpus`);
    assert.ok(count(skillId, "decision") >= 3, `${skillId} direct corpus`);
    assert.ok(count(skillId, "changed|mixed") >= 2, `${skillId} transfer corpus`);
    assert.ok(count(skillId, "boundary") >= 1, `${skillId} boundary corpus`);
  }
});

test("unsupported BvB preflop nodes are explicitly fail-closed", () => {
  for (const skillId of ["BL-06", "BL-08", "BL-09"]) {
    assert.match(gaps, new RegExp(`skillId: ["']${skillId}["'][\\s\\S]{0,180}status: ["']SOURCE_BLOCKED["']`));
  }
  assert.match(gaps, /skillId: "BL-07"[\s\S]{0,180}status: "PARTIAL"/);
  assert.match(gaps, /skillId: "BL-11"[\s\S]{0,180}status: "PARTIAL"/);
});

test("blind memory hooks train contrasts rather than a permanent checklist", () => {
  for (const rule of ["RULE-BLIND-BB-VS-SB-CONTRAST", "RULE-BLIND-ORIGIN-STRENGTH", "RULE-BLIND-SIZE-PRICE", "RULE-BLIND-POSTFLOP-IDENTITY"]) assert.match(rules, new RegExp(rule));
  assert.match(rules, /transferCueRu/);
  assert.match(rules, /reversalsRu/);
});

test("postflop blind identity explicitly refuses to become a preflop BvB authority", () => {
  assert.match(rules, /does not define preflop SB limp\/raise\/fold strategy/);
  assert.match(rules, /SLC-M02-L05/);
});
