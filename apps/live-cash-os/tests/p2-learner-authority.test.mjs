import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { practicalSkillById } from "../content/practical-mastery/index.ts";
import {
  PRACTICAL_EVIDENCE_STAGE_LABELS,
  effectivePracticalLearnerTarget,
  practicalEvidenceLabel,
} from "../lib/practical-learner-labels.ts";

const expected = {
  SOURCE_SUPPORTED: { ru: "ещё не начато", en: "not started" },
  CONCEPT_TAUGHT: { ru: "механизм показан", en: "mechanism introduced" },
  RECOGNITION_TRAINED: { ru: "распознавание подтверждено на разных ситуациях", en: "recognition confirmed across distinct situations" },
  DECISION_TRAINED: { ru: "самостоятельные решения подтверждены", en: "independent decisions confirmed" },
  CHANGED_NODE_TRANSFER: { ru: "перенос подтвержден на изменённых условиях", en: "transfer confirmed in changed conditions" },
  BOUNDARY_TESTED: { ru: "границы правила проверены", en: "rule boundaries checked" },
  DELAYED_RETRIEVAL: { ru: "воспроизведено после паузы", en: "recalled after a delay" },
  REAL_HAND_TRANSFER: { ru: "подтверждено в разобранной реальной руке", en: "supported by a reviewed real hand" },
};

test("ADD-003 stage to RU/EN learner labels state only the evidence actually established", () => {
  assert.deepEqual(PRACTICAL_EVIDENCE_STAGE_LABELS, {
    ru: Object.fromEntries(Object.entries(expected).map(([stage, copy]) => [stage, copy.ru])),
    en: Object.fromEntries(Object.entries(expected).map(([stage, copy]) => [stage, copy.en])),
  });
  for (const [stage, copy] of Object.entries(expected)) {
    assert.equal(practicalEvidenceLabel("ru", stage), copy.ru);
    assert.equal(practicalEvidenceLabel("en", stage), copy.en);
  }
  assert.doesNotMatch(practicalEvidenceLabel("ru", "CONCEPT_TAUGHT"), /понят|освоен/iu);
  assert.doesNotMatch(practicalEvidenceLabel("en", "CONCEPT_TAUGHT"), /understand|master/iu);
  assert.match(practicalEvidenceLabel("ru", "REAL_HAND_TRANSFER"), /разобран/iu);
  assert.match(practicalEvidenceLabel("en", "REAL_HAND_TRANSFER"), /reviewed/iu);
});

test("ADD-004 BL-11 learner target is capped by the existing PARTIAL source ceiling", () => {
  const skill = practicalSkillById.get("BL-11");
  assert.ok(skill);
  const target = effectivePracticalLearnerTarget(skill.id, skill.targetEvidenceStage, "SOURCE_SUPPORTED");
  assert.deepEqual(target, {
    stage: "SOURCE_SUPPORTED",
    sourceLimited: true,
    sourceStatus: "PARTIAL",
  });
});

test("ADD-008 learner copy uses Quick Start as the sole primary journey name", async () => {
  const guard = await readFile(new URL("../components/PracticalLearnerPresentationGuard.tsx", import.meta.url), "utf8");
  const perception = await readFile(new URL("../components/PracticalPerceptualExperience.tsx", import.meta.url), "utf8");
  const integrated = await readFile(new URL("../components/PracticalIntegratedSessionExperience.tsx", import.meta.url), "utf8");
  const journey = await readFile(new URL("../components/PracticalFirstJourneyExperience.tsx", import.meta.url), "utf8");

  assert.match(guard, /\["Первый круг", "Быстрый старт"\]/u);
  assert.match(guard, /\["First Journey", "Quick Start"\]/u);
  assert.doesNotMatch(perception, /Первый круг|First Journey/u);
  assert.match(perception, /Быстрый старт/u);
  assert.match(perception, /Quick Start/u);
  assert.match(integrated, /Быстрый старт/u);
  assert.match(integrated, /Quick Start/u);
  assert.match(journey, /БЫСТРЫЙ СТАРТ/u);
  assert.match(journey, /QUICK START/u);
});
