import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const core = readFileSync(new URL("../components/LiveCashAppCore.tsx", import.meta.url), "utf8");
const assist = readFileSync(new URL("../components/RealUseLessonAssist.tsx", import.meta.url), "utf8");
const scaffold = readFileSync(new URL("../content/i18n/novice-scaffold.ts", import.meta.url), "utf8");
const pipeline = readFileSync(new URL("../content/i18n/locale-pipeline.ts", import.meta.url), "utf8");
const modules = readFileSync(new URL("../content/modules.ts", import.meta.url), "utf8");

function indexOfOrFail(source, token) {
  const index = source.indexOf(token);
  assert.notEqual(index, -1, `missing token: ${token}`);
  return index;
}

test("N1 keeps Cold Check first and gates the first controlled application behind teaching", () => {
  const lessonStart = indexOfOrFail(core, "function LessonSession");
  const lessonEnd = indexOfOrFail(core, "function ConceptStep");
  const lesson = core.slice(lessonStart, lessonEnd);

  const cold = indexOfOrFail(lesson, "session.step === 0");
  const concept = indexOfOrFail(lesson, "session.step === 1 && <ConceptStep");
  const application = indexOfOrFail(lesson, "drill={firstApplication}");
  assert.ok(cold < concept && concept < application);
  assert.match(lesson, /drill=\{source\.drills\[0\]\}/);

  assert.match(assist, /snapshot\.step === 1/);
  assert.match(assist, /real-use-novice-scaffold:not\(\.real-use-novice-ready\) > \.primary/);
  assert.match(assist, /essentialTermsFor\(snapshot\.moduleId, locale\)/);
  assert.match(assist, /module\.heuristics\.map/);
  assert.match(assist, /module\.decisionTree\.map/);
  assert.match(assist, /const coldDrill = module\.drills\[0\]/);
  assert.match(assist, /data-guided-cold-example=\{coldDrill\.id\}/);
  assert.match(assist, /setRevealed\(true\)/);
  assert.match(assist, /The next graded spot is different/);
});

test("LCM-02 essential vocabulary and call price are taught before controlled use", () => {
  for (const token of [
    "Диапазон",
    "Эквити",
    "Реализация эквити",
    "Доминация",
    "Блокер",
    "Полярный сквиз",
    "Range",
    "Equity",
    "Equity realisation",
    "Domination",
    "Blocker",
    "Polar squeeze",
  ]) assert.match(scaffold, new RegExp(token));

  assert.match(scaffold, /Цена колла = колл \/ \(банк после ставки соперника \+ твой колл\)\./);
  assert.match(scaffold, /50 \/ 200 = 25%/);
  assert.equal(50 / (150 + 50), 0.25);
  assert.match(scaffold, /формула сама не выбирает действие/);
  assert.match(scaffold, /the formula does not choose an action by itself/);
});

test("SPR prerequisite stays directional and non-prescriptive", () => {
  assert.match(scaffold, /Чем ниже SPR, тем меньше стека осталось относительно банка/);
  assert.match(scaffold, /чем выше SPR, тем больше/);
  assert.match(scaffold, /Фиксированные пороги здесь не нужны/);
  assert.match(scaffold, /Low SPR/);
  assert.doesNotMatch(scaffold, /SPR\s*[<=>]\s*\d/);
  assert.doesNotMatch(scaffold, /SPR\s*\d+(?:\.\d+)?\s*=\s*(?:jam|stack|raise|call|bet)/i);
});

test("raw MDF and targeted internal RU terminology are replaced by copy-only mutations", () => {
  assert.doesNotMatch(scaffold, /\bMDF\b/);
  assert.doesNotMatch(scaffold, /Value squeeze core|Players-behind gate|source ranges|source-range|node signature/);
  assert.match(scaffold, /Сквиз на вэлью/);
  assert.match(scaffold, /Исходный диапазон/);
  assert.match(scaffold, /Игрок за спиной/);
  assert.match(scaffold, /Обязан ли Hero один нести всю heads-up-защиту/);
  assert.match(scaffold, /defence is shared across multiple ranges/);
});

test("N1 does not reorder canonical drills or alter evidence and answer identities", () => {
  assert.doesNotMatch(scaffold, /\.sort\(|\.splice\(|\.reverse\(/);
  assert.doesNotMatch(scaffold, /correctActionId\s*=(?!=)|correctReasonId\s*=(?!=)|\.id\s*=(?!=)/);
  assert.doesNotMatch(scaffold, /recordDecision|completeLesson|completeBlock|dueReviewItems|selectRetentionDrillId|selectMixed/);
  assert.doesNotMatch(assist, /recordDecision|completeLesson|completeBlock|dueReviewItems|selectRetentionDrillId|selectMixed/);
  assert.match(modules, /export const allDrills = modules\.flatMap\(\(module\) => module\.drills\)/);
  assert.match(core, /function selectMixed\(state: LearnerState\)/);
  assert.match(core, /selectRetentionDrillId\(target, SCHEDULER_CATALOG/);
});

test("bounded novice copy is applied after locale composition without creating approval", () => {
  assert.ok(indexOfOrFail(pipeline, "applyWave4RFinalLanguage(locale)") < indexOfOrFail(pipeline, "applyNoviceTerminologyCopy(locale)"));
  assert.match(scaffold, /Content Authority remains pending/);
  assert.doesNotMatch(scaffold, /APPROVED|MODULE_GOLD|humanApproved|human_approved/);
});
