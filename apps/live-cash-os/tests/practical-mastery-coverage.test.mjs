import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => readFile(path.join(root, relative), "utf8");
const decisionFiles = [
  "decisions-w1-w3",
  "decisions-w4-w13",
  "decisions-gap-fill",
  "decisions-foundation-expansion",
  "decisions-preflop-core-expansion",
  "decisions-preflop-advanced-expansion",
  "decisions-blind-defence-expansion",
  "decisions-w14",
];

test("practical mastery has a scored decision contract and all decision corpora", async () => {
  const types = await read("content/practical-mastery/types.ts");
  const index = await read("content/practical-mastery/index.ts");
  assert.match(types, /export type PracticalDecision/);
  for (const file of decisionFiles) assert.match(index, new RegExp(file));
  assert.match(index, /practicalDecisions/);
});

test("source aliases are explicitly resolved to canonical Smash source IDs", async () => {
  const authority = await read("content/practical-mastery/source-authority.ts");
  for (const canonical of ["SLC-M01-L02", "SLC-M02-L05", "SLC-M02-L21", "SLC-M03-L27", "SLC-M03-L32", "SLC-M04-L36"]) assert.match(authority, new RegExp(canonical));
  assert.match(authority, /SOURCE_GROUP_ALIAS/);
  assert.match(authority, /INTERNAL_AUTHORITY/);
});

test("scored decisions preserve source-purity boundaries", async () => {
  const corpus = (await Promise.all(decisionFiles.map((file) => read(`content/practical-mastery/${file}.ts`)))).join("\n");
  assert.doesNotMatch(corpus, /exact solver frequency is/i);
  assert.doesNotMatch(corpus, /always defend exactly 50%/i);
  assert.doesNotMatch(corpus, /unknown live players always/i);
  assert.match(corpus, /ballpark baseline|not a law|не закон|default with exceptions|table-specific branch/);
  assert.match(corpus, /pool hypothesis|field-dependent|requiring validation|table-specific branch/);
});

test("foundation expansion teaches math and realization without evidence inflation", async () => {
  const corpus = await read("content/practical-mastery/decisions-foundation-expansion.ts");
  for (const skill of ["FND-01", "FND-02", "FND-03", "FND-06"]) assert.match(corpus, new RegExp(skill));
  assert.match(corpus, /risk 1 to win 3/i);
  assert.match(corpus, /Equity realisation|Equity realization/);
  assert.match(corpus, /Implied odds/);
  assert.match(corpus, /SPR/);
  assert.doesNotMatch(corpus, /solver frequency/i);
});

test("preflop expansion trains mechanisms without importing visual chart cells", async () => {
  const core = await read("content/practical-mastery/decisions-preflop-core-expansion.ts");
  const advanced = await read("content/practical-mastery/decisions-preflop-advanced-expansion.ts");
  for (const source of ["FTGU-E02", "FTGU-E03", "FTGU-E04", "FTGU-E05", "FTGU-E06"]) assert.match(core, new RegExp(source));
  for (const source of ["FTGU-E15", "FTGU-E16", "FTGU-E17", "FTGU-E18"]) assert.match(advanced, new RegExp(source));
  for (const skill of ["PF-01", "PF-02", "PF-03", "PF-04", "PF-05"]) assert.match(core, new RegExp(skill));
  for (const skill of ["PF-06", "PF-07", "PF-08"]) assert.match(advanced, new RegExp(skill));
  const corpus = `${core}\n${advanced}`;
  assert.doesNotMatch(corpus, /open exactly \d+%/i);
  assert.doesNotMatch(corpus, /call exactly \d+%/i);
  assert.doesNotMatch(corpus, /3-bet exactly \d+%/i);
  assert.match(corpus, /Invent exact 37% frequency[\s\S]{0,100}UNSUPPORTED_FREQUENCY/i);
});

test("blind defence expansion stays directional and source-backed", async () => {
  const corpus = await read("content/practical-mastery/decisions-blind-defence-expansion.ts");
  for (const skill of ["BL-01", "BL-02", "BL-03", "BL-04", "BL-05", "BL-12"]) assert.match(corpus, new RegExp(skill));
  assert.match(corpus, /FTGU-E05/);
  assert.match(corpus, /FTGU-E06/);
  assert.doesNotMatch(corpus, /SB first-in.*correctActionId/is);
  assert.doesNotMatch(corpus, /BB vs SB limp.*correctActionId/is);
});

test("integrated decisions are topic-hidden and route mistakes by skill family", async () => {
  const integrated = await read("content/practical-mastery/decisions-w14.ts");
  assert.match(integrated, /topic hidden/);
  assert.match(integrated, /Mistake-family repair|skill family/);
  assert.match(integrated, /Real-hand routing|real hand/i);
  assert.match(integrated, /non-identical stimulus/);
});
