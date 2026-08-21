import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const corpus = await readFile(path.join(root, "content/practical-mastery/decisions-3bp-4bp-a7-expansion.ts"), "utf8");
const memory = await readFile(path.join(root, "content/practical-mastery/threebet-fourbet-a7-memory.ts"), "utf8");
const dod = await readFile(path.join(root, "../../analysis/3BP_4BP_ENGINE_A7_DOD_V1.md"), "utf8");

test("A7 covers all four 3BP roles plus matrix and four 4BP families", () => {
  for (const skill of ["3BP-01","3BP-02","3BP-03","3BP-04","3BP-05","4BP-01","4BP-02","4BP-03","4BP-04"]) {
    assert.match(corpus, new RegExp(`\\"${skill}\\"`));
  }
});

test("each generated family receives recognition, direct, changed and boundary stimuli", () => {
  for (const kind of ["recognition","decision","changed","boundary"]) assert.match(corpus, new RegExp(`kind:\\"${kind}\\"`));
  assert.match(corpus, /index % 3/);
  assert.match(corpus, /correctActionId: "good"/);
  assert.match(corpus, /correctReasonId: "goodR"/);
});

test("A7 explicitly rejects universal 3BP and low-SPR shortcuts", () => {
  assert.match(memory, /ROLE-FIRST|ROLE_FIRST|ROLE-FIRST/i);
  assert.match(memory, /Low SPR reduces future branches|Low SPR сокращает/);
  assert.match(memory, /automatic stack-off/i);
  assert.match(dod, /not a universal 3BP rule/i);
});

test("no fabricated exact-frequency objective is introduced", () => {
  assert.doesNotMatch(corpus, /correct.*\b(?:37|63|71|82)%/i);
  assert.match(dod, /Exact solver frequencies are not invented/);
});
