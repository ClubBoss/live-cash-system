import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const expansion = await readFile(path.join(root, "content/practical-mastery/decisions-srp-a6-expansion.ts"), "utf8");
const base = await readFile(path.join(root, "content/practical-mastery/decisions-w4-w13.ts"), "utf8");
const corpus = `${base}\n${expansion}`;
const rules = await readFile(path.join(root, "content/practical-mastery/srp-a6-memory.ts"), "utf8");
const dod = await readFile(path.join(root, "../../analysis/SRP_ENGINE_A6_DOD_V1.md"), "utf8");

function count(skillId, kindPattern) {
  return [...corpus.matchAll(new RegExp(`skillId:\\s*["']${skillId}["']\\s*,\\s*kind:\\s*["'](${kindPattern})["']`, "g"))].length;
}

test("A6 core SRP flop families have full evidence depth", () => {
  for (const skillId of ["OOP-01", "OOP-02", "OOP-03", "OOP-04", "OOP-05", "IP-01", "IP-02"]) {
    assert.ok(count(skillId, "recognition") >= 2, `${skillId} recognition corpus`);
    assert.ok(count(skillId, "decision") >= 3, `${skillId} direct corpus`);
    assert.ok(count(skillId, "changed|mixed") >= 2, `${skillId} transfer corpus`);
    assert.ok(count(skillId, "boundary") >= 1, `${skillId} boundary corpus`);
  }
});

test("new SRP corpus rotates correct answer positions instead of leaking one slot", () => {
  assert.match(expansion, /c\.slot === 0/);
  assert.match(expansion, /c\.slot === 1/);
  assert.match(expansion, /reasonSlot = \(c\.slot \+ 1\) % 3/);
});

test("SRP role engine rejects initiative, size and absolute-hand autopilots", () => {
  for (const token of ["initiative", "continuing range", "small", "large", "protected", "board-range ownership"]) assert.match(corpus + rules, new RegExp(token, "i"));
  assert.doesNotMatch(corpus, /always c-bet/i);
  assert.doesNotMatch(corpus, /always range-bet/i);
});

test("later-street SRP skills are deliberately deferred to A8 rather than duplicated", () => {
  for (const skillId of ["OOP-06", "OOP-07", "IP-03", "IP-04", "IP-05", "IP-06"]) assert.match(dod, new RegExp(`${skillId}.*A8`));
});

test("A6 memory hooks encode role, price, continuing-range and protected-check transfer", () => {
  for (const rule of ["RULE-SRP-OOP-OWNERSHIP-BEFORE-INITIATIVE", "RULE-SRP-DEFENCE-PRICE-SHAPE", "RULE-SRP-RAISE-CONTINUING-RANGE", "RULE-SRP-PROTECTED-CHECK"]) assert.match(rules, new RegExp(rule));
});
