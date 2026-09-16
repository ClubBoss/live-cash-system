import assert from "node:assert/strict";
import test from "node:test";

import { practicalAnchors, practicalRuleById, practicalSkillById } from "../content/practical-mastery/index.ts";
import { firstJourneySteps } from "../content/practical-mastery/first-journey.ts";
import { createPracticalMasteryState, markPracticalConceptTaught } from "../lib/practical-mastery-core.ts";
import { nextFirstJourneyDecision } from "../lib/practical-first-journey.ts";

function normalize(value) {
  return value
    .toLocaleLowerCase("en-US")
    .normalize("NFKC")
    .replace(/[\\p{P}\\p{S}]+/gu, " ")
    .replace(/\\s+/gu, " ")
    .trim();
}

function numericTokens(value) {
  return [...value.replaceAll(",", ".").matchAll(/\\d+(?:\\.\\d+)?%?/gu)].map((match) => match[0]);
}

function teachingTexts(step, locale) {
  const suffix = locale === "ru" ? "Ru" : "En";
  const rule = step.memoryRuleIds.map((id) => practicalRuleById.get(id)).find(Boolean) ?? null;
  const anchor = practicalAnchors.find((candidate) => candidate.skillId === step.skillId) ?? null;
  const skill = practicalSkillById.get(step.skillId);
  if (rule) return [rule[`trigger${suffix}`], rule[`default${suffix}`], rule[`why${suffix}`], ...rule[`reversals${suffix}`], rule[`transferCue${suffix}`]];
  if (anchor) return [anchor[`prompt${suffix}`], anchor[`answer${suffix}`], anchor[`rationale${suffix}`]];
  return skill ? [skill[`objective${suffix}`]] : [];
}

function correctOptionTexts(decision, locale) {
  const suffix = locale === "ru" ? "Ru" : "En";
  return [
    decision.actionOptions.find((option) => option.id === decision.correctActionId)?.[`text${suffix}`] ?? "",
    decision.reasonOptions.find((option) => option.id === decision.correctReasonId)?.[`text${suffix}`] ?? "",
  ];
}

test("all eight Quick Start steps avoid direct teaching-to-first-answer leakage", () => {
  assert.equal(firstJourneySteps.length, 8);

  for (const step of firstJourneySteps) {
    let state = createPracticalMasteryState(new Date("2026-09-01T00:00:00Z"));
    state = markPracticalConceptTaught(state, step.skillId, new Date("2026-09-01T00:00:01Z"));
    const first = nextFirstJourneyDecision(state, step.skillId);
    assert.ok(first, `${step.skillId}: missing first Quick Start decision`);
    assert.equal(first.kind, "recognition", `${step.skillId}: first Quick Start item must be recognition`);

    for (const locale of ["ru", "en"]) {
      const taught = teachingTexts(step, locale).filter(Boolean);
      const taughtNormalized = taught.map(normalize).filter(Boolean);
      const taughtNumbers = new Set(taught.flatMap(numericTokens));

      for (const correct of correctOptionTexts(first, locale)) {
        const correctNormalized = normalize(correct);
        if (correctNormalized.length >= 16) {
          assert.equal(
            taughtNormalized.some((text) => text.includes(correctNormalized)),
            false,
            `${step.skillId}/${locale}: first scored correct option is copied directly from teaching: "${correct}"`,
          );
        }

        const compact = correct.trim().replace(/\\s+/gu, "");
        if (/^\\d+(?:[.,]\\d+)?%?$/u.test(compact)) {
          const numeric = compact.replace(",", ".");
          assert.equal(
            taughtNumbers.has(numeric),
            false,
            `${step.skillId}/${locale}: first scored numeric answer "${correct}" was already shown in teaching`,
          );
        }
      }
    }
  }
});
