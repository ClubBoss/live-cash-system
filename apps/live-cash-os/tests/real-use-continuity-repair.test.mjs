import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(relativePath) {
  return readFile(new URL(`../${relativePath}`, import.meta.url), "utf8");
}

test("real-use overlays avoid interval polling and use live hosts for late portal mounts", async () => {
  const [wave5, gauntlet4, assist] = await Promise.all([
    source("components/Wave5PracticeLayer.tsx"),
    source("components/Gauntlet4LearningIntegrityLayer.tsx"),
    source("components/RealUseLessonAssist.tsx"),
  ]);

  assert.doesNotMatch(wave5, /setInterval\s*\(/u);
  assert.doesNotMatch(gauntlet4, /setInterval\s*\(/u);
  assert.doesNotMatch(assist, /setInterval\s*\(/u);
  assert.match(wave5, /new MutationObserver/u);
  assert.match(gauntlet4, /new MutationObserver/u);
  assert.match(assist, /new MutationObserver/u);
  assert.doesNotMatch(wave5, /:has\(/u);
  assert.doesNotMatch(gauntlet4, /:has\(/u);
  assert.doesNotMatch(assist, /:has\(/u);
  assert.match(wave5, /wave5-lab-active/u);
  assert.match(gauntlet4, /g4-feedback-active/u);
  assert.match(gauntlet4, /useLayoutEffect/u);
});

test("real-use practice input and prompts are bounded and canonical", async () => {
  const wave5 = await source("components/Wave5PracticeLayer.tsx");
  assert.match(wave5, /canonicalNumericInput/u);
  assert.match(wave5, /replace\(\/\^0\+\(\?=\\d\)\//u);
  assert.match(wave5, /Сначала выбери одно изменение и предскажи SPR/u);
  assert.match(wave5, /Выбери только одно значение/u);
  assert.match(wave5, /что изменится с SPR и почему/u);
  assert.match(wave5, /Нужна короткая мысль из двух частей/u);
  assert.match(wave5, /Give a short two-part answer/u);
  assert.match(wave5, /Сначала сравни «\$\{lab\.leftTitle\}» и «\$\{lab\.rightTitle\}»/u);
  assert.doesNotMatch(wave5, /Сначала спрогнозируй результат/u);
  assert.doesNotMatch(wave5, /измени важную переменную/u);
});

test("feedback removes correct-answer duplication and exposes one overlay continue", async () => {
  const gauntlet4 = await source("components/Gauntlet4LearningIntegrityLayer.tsx");
  assert.match(gauntlet4, /correctPair: "Действие и причина верны"/u);
  assert.match(gauntlet4, /fullyCorrect && <div className="g4-compare compact"/u);
  assert.match(gauntlet4, /\.feedback-view\.g4-feedback-active > :not\(\.g4-feedback-card\)/u);
});

test("valid local learner state renders before cloud reconciliation and writes wait for restore", async () => {
  const sync = await source("lib/use-learner-state-sync.ts");

  const localHydrationGate = sync.indexOf("const canHydrateLocally = Boolean(localRead.state) || cloudDisabled.current;");
  const localHydration = sync.indexOf("setLearnerState(localDecision.state);", localHydrationGate);
  const localReady = sync.indexOf("setReady(true);", localHydrationGate);
  const remoteFetch = sync.indexOf('fetch("/api/state"', localHydrationGate);
  assert.ok(localHydrationGate >= 0 && localHydration > localHydrationGate,
    "valid local learner state must remain an explicit hydration path");
  assert.ok(localReady > localHydration && remoteFetch > localReady,
    "local hydration must make the app ready before remote reconciliation fetches state");

  const durableReread = sync.indexOf("const durableLocalRead = readLocalLearnerState(safeGet(LEARNER_STORAGE_KEY));");
  assert.ok(durableReread > remoteFetch,
    "late reconciliation must re-read durable local learner state after the network wait");
  assert.match(sync, /Boolean\(localRead\.state\)\s*&&\s*latestState\.current\.revision > durableRevision/u,
    "only a genuinely hydrated local snapshot may promote a newer in-memory mutation over the durable re-read");
  assert.match(sync, /chooseRestoreState\(currentLocalRead, remote\)/u);

  const persistenceEffect = sync.indexOf("const serialized = JSON.stringify(state);");
  const restoreGate = sync.indexOf("if (!restoreSettled.current", persistenceEffect);
  const cloudSaveTimer = sync.indexOf("saveTimer.current = setTimeout", restoreGate);
  assert.ok(restoreGate > persistenceEffect && cloudSaveTimer > restoreGate,
    "cloud writes must stay gated until restore reconciliation has settled");

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
