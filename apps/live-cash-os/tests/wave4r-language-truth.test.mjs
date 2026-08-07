import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

function quoted(source) {
  return [...source.matchAll(/"((?:\\.|[^"\\])*)"/gu)].map((match) => match[1]).join("\n");
}

test("Wave 4R keeps T1 IDs stable while removing hybrid research language from Russian learner copy", async () => {
  const source = await read("content/diagnostic.ts");
  const ids = [...source.matchAll(/id:\s*"(LD-\d{3})"/gu)].map((match) => match[1]);
  assert.deepEqual(ids, Array.from({ length: 10 }, (_, index) => `LD-${String(index + 1).padStart(3, "0")}`));
  assert.equal((source.match(/targetSeconds:/gu) ?? []).length, 10);

  const learnerCopy = quoted(source);
  for (const pattern of [
    /Straddle denominator/iu,
    /Pairwise multiway depth/iu,
    /Blind source identity/iu,
    /compensation-test/iu,
    /OOP defence/iu,
    /preflop air/iu,
    /directional raise incentive/iu,
    /selective\/polar range/iu,
    /thin\/protection raise branch/iu,
    /near-range node/iu,
    /uncapped continuing range/iu,
    /\bMDF\b/u,
    /главный gate/iu,
    /population evidence/iu,
    /bluff supply/iu,
  ]) assert.doesNotMatch(learnerCopy, pattern, `T1 contains hybrid learner phrase ${pattern}`);
});

test("Wave 4R English 0-to-100 route uses learner language instead of state-machine vocabulary", async () => {
  const source = await read("content/i18n/learning-route.ts");
  const en = source.slice(source.indexOf("en: ["), source.indexOf("};\n\nexport function"));
  assert.equal((en.match(/percent:/gu) ?? []).length, 9);
  for (const pattern of [
    /skill evidence/iu,
    /current model/iu,
    /admitted probe/iu,
    /transfer probe/iu,
    /repair resolved/iu,
    /retention/iu,
    /field validated/iu,
    /learner-state/iu,
    /evidence map/iu,
  ]) assert.doesNotMatch(quoted(en), pattern, `English route contains internal learner phrase ${pattern}`);
  assert.match(en, /See your starting point/u);
  assert.match(en, /Recall it later/u);
  assert.match(en, /Real hand reviewed/u);
});

test("Wave 4R makes legacy module headings a non-semantic compatibility export", async () => {
  const source = await read("content/i18n/runtime.ts");
  assert.match(source, /export const moduleHeadings = Object\.fromEntries/u);
  assert.match(source, /\[id, \{ en: \{\} \}\]/u);
  assert.doesNotMatch(source, /Exploit filters before adjustment/u);
  assert.doesNotMatch(source, /Aggression with a clear job/u);
  assert.doesNotMatch(source, /River evidence before blockers/u);
});

test("Wave 4R runtime no longer claims approved English copy is pending", async () => {
  const source = await read("content/i18n/runtime.ts");
  const overrides = source.slice(source.indexOf("Object.assign(runtimeCopy.ru"));
  assert.doesNotMatch(overrides, /EN REVIEW REQUIRED/u);
  assert.doesNotMatch(overrides, /still under poker-aware editorial review/iu);
  assert.match(overrides, /contentFallback:\s*""/u);
  assert.match(overrides, /translationPending:\s*""/u);
});
