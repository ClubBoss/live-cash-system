import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(relativePath) {
  return readFile(new URL(`../${relativePath}`, import.meta.url), "utf8");
}

test("real-use overlays avoid interval polling and do not hide core content before portals mount", async () => {
  const [wave5, gauntlet4] = await Promise.all([
    source("components/Wave5PracticeLayer.tsx"),
    source("components/Gauntlet4LearningIntegrityLayer.tsx"),
  ]);

  assert.doesNotMatch(wave5, /setInterval\s*\(/u);
  assert.doesNotMatch(gauntlet4, /setInterval\s*\(/u);
  assert.doesNotMatch(wave5, /MutationObserver/u);
  assert.match(gauntlet4, /new MutationObserver/u);
  assert.doesNotMatch(wave5, /:has\(/u);
  assert.doesNotMatch(gauntlet4, /:has\(/u);
  assert.match(wave5, /wave5-lab-active/u);
  assert.match(gauntlet4, /g4-feedback-active/u);
  assert.match(gauntlet4, /useLayoutEffect/u);
});

test("real-use practice input and prompts are bounded and canonical", async () => {
  const wave5 = await source("components/Wave5PracticeLayer.tsx");
  assert.match(wave5, /canonicalNumericInput/u);
  assert.match(wave5, /replace\(\/\^0\+\(\?=\\d\)\//u);
  assert.match(wave5, /SPR станет выше \/ ниже \/ примерно таким же/u);
  assert.match(wave5, /One sentence is enough/u);
  assert.match(wave5, /Одного предложения достаточно/u);
});

test("feedback removes correct-answer duplication and exposes one overlay continue", async () => {
  const gauntlet4 = await source("components/Gauntlet4LearningIntegrityLayer.tsx");
  assert.match(gauntlet4, /correctPair: "Действие и причина верны"/u);
  assert.match(gauntlet4, /fullyCorrect && <div className="g4-compare compact"/u);
  assert.match(gauntlet4, /\.feedback-view\.g4-feedback-active > :not\(\.g4-feedback-card\)/u);
});

test("valid local learner state renders before cloud reconciliation and writes wait for restore", async () => {
  const sync = await source("lib/use-learner-state-sync.ts");
  assert.match(sync, /Fast path: a valid local snapshot is durable learner data/u);
  assert.match(sync, /setReady\(true\)/u);
  assert.match(sync, /restoreSettled\.current/u);
  assert.match(sync, /Re-read localStorage after the network wait/u);
  assert.match(sync, /if \(!restoreSettled\.current/u);
  assert.equal((sync.match(/setSyncStatus\("syncing"\)/gu) ?? []).length, 1,
    "only explicit cloud-enable flow may surface a blocking syncing status");
});

test("previous-step access is read-only and worked example states the learner task", async () => {
  const assist = await source("components/RealUseLessonAssist.tsx");
  assert.match(assist, /← Предыдущий шаг/u);
  assert.match(assist, /только просмотр/u);
  assert.match(assist, /ничего не пересчитывает и не меняет уже сохранённые ответы/u);
  assert.doesNotMatch(assist, /setState\(patchSession/u);
  assert.match(assist, /Что нужно решить сейчас/u);
  assert.match(assist, /в каких единицах считать глубину при обязательном страддле/u);
});
