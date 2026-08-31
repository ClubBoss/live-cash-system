import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { practicalDecisions, practicalSkillFamilies } from "../content/practical-mastery/index.ts";
import { practicalObjectiveEnById } from "../content/practical-mastery/objectives-en.ts";
import { applyPracticalRuFinalPolish } from "../content/practical-mastery/practical-ru-final-polish.ts";
import { sanitizeLearnerPresentationText } from "../lib/learner-presentation-firewall.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const diagnosticSource = await readFile(path.join(root, "components/DiagnosticExperience.tsx"), "utf8");
const masterySource = await readFile(path.join(root, "components/PracticalMasteryExperience.tsx"), "utf8");

const diagnosticRu = "Это рекомендации по темам, а не точный маршрут Practical. Диагностика не повышает статус освоения, не обходит предпосылки и не определяет одну точную тему для тренировки по широкой диагностической категории.";
const diagnosticEn = "These are topic recommendations, not an exact Practical route. Diagnostic does not advance learning status, bypass prerequisites, or infer one exact practice topic from a broad diagnostic category.";

function ruStrings(decision) {
  return [
    decision.cueRu,
    decision.questionRu,
    decision.explanationRu,
    ...decision.actionOptions.map((option) => option.textRu),
    ...decision.reasonOptions.map((option) => option.textRu),
  ];
}

const activeRu = practicalDecisions.flatMap(ruStrings);

const malformedRu = [
  "Предыдущие действия и новая карта вместе определяют, остаётся ли ветка ограниченный сверху.",
  "Требует знать, был ли на флопе диапазон рейза, прежде чем объявлять ветку колла ограниченный сверху.",
  "BB сталкивается с лайв-открытие 5bb вместо небольшого открытия, типичного для онлайна.",
  "Выбирает блефы по шоудаун-вэлью и эффект блокеров эффектам относительно вэлью-зоны линии.",
  "Диапазон коллера остаётся относительно ограниченный сверху",
  "Чек всегда делает диапазон ограниченный сверху.",
  "Требует заново проверить, остаётся ли прочекавший диапазон ограниченный сверху.",
];

const correctedRu = [
  "Предыдущие действия и новая карта вместе определяют, остаётся ли ветка ограниченной сверху.",
  "Требует знать, был ли на флопе диапазон рейза, прежде чем считать ветку колла ограниченной сверху.",
  "BB сталкивается с лайв-открытием 5bb вместо небольшого открытия, типичного для онлайна.",
  "Выбирает блефы по шоудаун-вэлью и эффекту блокеров с учётом вэлью-зоны линии.",
  "Диапазон коллера остаётся относительно ограниченным сверху",
  "Чек всегда делает диапазон ограниченным сверху.",
  "Требует заново проверить, остаётся ли прочекавший диапазон ограниченным сверху.",
];

test("C1 Diagnostic RU publication survives learner sanitization grammatically", () => {
  assert.match(diagnosticSource, new RegExp(diagnosticRu.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(diagnosticSource, new RegExp(diagnosticEn.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.equal(sanitizeLearnerPresentationText(diagnosticRu, "ru"), diagnosticRu);
  assert.doesNotMatch(diagnosticRu, /один точная тема/u);
  assert.doesNotMatch(diagnosticRu, /canonical skill/iu);
  assert.doesNotMatch(diagnosticRu, /mastery/iu);
  assert.match(diagnosticRu, /рекомендации по темам/u);
  assert.match(diagnosticRu, /не повышает статус освоения/u);
  assert.match(diagnosticRu, /не обходит предпосылки/u);
  assert.match(diagnosticRu, /не определяет одну точную тему для тренировки по широкой диагностической категории/u);
});

test("C2 confirmed malformed RU publication strings are replaced in the active exported corpus", () => {
  for (const malformed of malformedRu) {
    assert.equal(activeRu.includes(malformed), false, `malformed RU publication remains active: ${malformed}`);
  }
  for (const [index, corrected] of correctedRu.entries()) {
    if (index === 5) continue;
    assert.equal(activeRu.includes(corrected), true, `corrected RU publication is not active: ${corrected}`);
  }
});

test("C2 river explanation preserves showdown value, removal effect, and line value region", () => {
  const explanation = activeRu.find((text) => text === correctedRu[3]);
  assert.ok(explanation);
  assert.match(explanation, /шоудаун-вэлью/u);
  assert.match(explanation, /эффекту блокеров/u);
  assert.match(explanation, /вэлью-зоны линии/u);
});

test("C2 final publication polish cannot mutate machine decision identity", () => {
  const sentinel = {
    id: "SENTINEL",
    skillId: "RIV-02",
    kind: "decision",
    sourceRefs: ["SOURCE-A", "SOURCE-B"],
    assumptions: ["same assumptions"],
    cueRu: malformedRu[0],
    cueEn: "unchanged cue",
    questionRu: malformedRu[2],
    questionEn: "unchanged question",
    actionOptions: [
      { id: "a", textRu: malformedRu[5], textEn: "unchanged action" },
      { id: "b", textRu: "Другое действие", textEn: "other action", misconception: "SAME_MISCONCEPTION" },
    ],
    reasonOptions: [{ id: "r", textRu: malformedRu[6], textEn: "unchanged reason" }],
    correctActionId: "a",
    correctReasonId: "r",
    explanationRu: malformedRu[3],
    explanationEn: "unchanged explanation",
    changedVariables: ["same_variable"],
    targetSeconds: 27,
  };
  const polished = applyPracticalRuFinalPolish(sentinel);
  assert.equal(polished.actionOptions[0].textRu, correctedRu[5]);
  assert.equal(polished.id, sentinel.id);
  assert.equal(polished.skillId, sentinel.skillId);
  assert.equal(polished.correctActionId, sentinel.correctActionId);
  assert.equal(polished.correctReasonId, sentinel.correctReasonId);
  assert.deepEqual(polished.sourceRefs, sentinel.sourceRefs);
  assert.deepEqual(polished.assumptions, sentinel.assumptions);
  assert.deepEqual(polished.changedVariables, sentinel.changedVariables);
  assert.equal(polished.actionOptions[1].misconception, "SAME_MISCONCEPTION");
});

test("C3 every registered skill has a non-empty skill-specific English objective", () => {
  assert.deepEqual(
    Object.keys(practicalObjectiveEnById).sort(),
    practicalSkillFamilies.map((skill) => skill.id).sort(),
  );
  for (const skill of practicalSkillFamilies) {
    assert.ok(skill.objectiveEn.trim(), `missing objectiveEn for ${skill.id}`);
    assert.equal(skill.objectiveEn, practicalObjectiveEnById[skill.id]);
  }

  const ordinary = practicalSkillFamilies.filter((skill) => skill.wave !== "W14_INTEGRATED");
  for (const skill of ordinary) {
    assert.notEqual(skill.objectiveEn, `Use ${skill.titleEn} reliably in independent decisions and changed conditions.`);
  }
});

test("C3 representative EN objectives retain RU information specificity", () => {
  const expected = {
    "PF-03": "Evaluate flats through domination, implied odds, and squeeze exposure.",
    "BL-04": "Adjust defense with price and do not carry one frequency across sizings.",
    "OOP-07": "Choose block/check-call/check-fold through range ancestry and price.",
    "RIV-02": "Choose bluffs by showdown value, blockers/unblockers, and ancestry.",
    "DEEP-03": "Recalculate the forced unit, effective position, and SPR under a straddle.",
    "EXP-03": "Increase or reduce bluffing against overfold/underfold evidence.",
  };
  for (const [id, objective] of Object.entries(expected)) {
    assert.equal(practicalSkillFamilies.find((skill) => skill.id === id)?.objectiveEn, objective);
  }
});

test("C3 Skill Map renders objectiveEn and removes the generic EN objective fallback", () => {
  assert.match(masterySource, /locale === "ru" \? skill\.objectiveRu : skill\.objectiveEn/);
  assert.doesNotMatch(masterySource, /Use \$\{skill\.titleEn\} reliably in independent decisions and changed conditions/);
});
