import test from "node:test";
import assert from "node:assert/strict";

import {
  isOrdinaryLearnerDecision,
  practicalDecisions,
  practicalSkillFamilies,
} from "../content/practical-mastery/index.ts";
import { isIntegrationDerivedSkill } from "../content/practical-mastery/integration-derived.ts";
import { sanitizeLearnerPresentationText } from "../lib/learner-presentation-firewall.ts";
import { isPracticalBridgeSkill, practicalSkillCorpusCanReach } from "../lib/practical-mastery-core.ts";

const SOURCE_ID = /\b(?:FTGU(?:[- ]?E)?\d+(?:\/E\d+)?|SLC-[A-Z0-9-]+|CINJ-E\d+|CP-G\d+-L\d+|E\d{2,})\b/iu;
const AUTHORITY_PREFIX_EN = /^(?:reviewed\b|audited\b|verified\b|authoritative\b|the source\b|source\s+(?:logic|material|evidence)\b)/iu;
const AUTHORITY_PREFIX_RU = /^(?:проверенн\p{L}*\s+(?:данн\p{L}*|материал\p{L}*|источник\p{L}*)|аудирован\p{L}*|проверен\p{L}*\s+источник\p{L}*|источник\s+(?:подтверждает|показывает)|доступные\s+данные\s+подтверждают)/iu;

function eligibleDecisions() {
  const eligibleSkillIds = new Set(practicalSkillFamilies
    .filter((skill) => (
      !isPracticalBridgeSkill(skill.id)
      && !isIntegrationDerivedSkill(skill.id)
      && practicalSkillCorpusCanReach(skill.id, "DECISION_TRAINED")
    ))
    .map((skill) => skill.id));

  return practicalDecisions.filter((decision) => (
    isOrdinaryLearnerDecision(decision) && eligibleSkillIds.has(decision.skillId)
  ));
}

test("eligible scored options do not expose source IDs or positive authority answer markers", () => {
  const failures = [];
  for (const decision of eligibleDecisions()) {
    for (const [stage, options, correctId] of [
      ["action", decision.actionOptions, decision.correctActionId],
      ["reason", decision.reasonOptions, decision.correctReasonId],
    ]) {
      for (const option of options) {
        for (const locale of ["ru", "en"]) {
          const raw = locale === "ru" ? option.textRu : option.textEn;
          const visible = sanitizeLearnerPresentationText(raw, locale);
          const authority = locale === "ru" ? AUTHORITY_PREFIX_RU : AUTHORITY_PREFIX_EN;
          if (SOURCE_ID.test(raw) || authority.test(visible)) {
            failures.push({
              decisionId: decision.id,
              skillId: decision.skillId,
              stage,
              optionId: option.id,
              locale,
              isCorrect: option.id === correctId,
              raw,
              visible,
            });
          }
        }
      }
    }
  }
  assert.deepEqual(failures, []);
});

test("authority guard does not ban ordinary poker use of source as a noun", () => {
  assert.equal(AUTHORITY_PREFIX_EN.test("The EV source is fold equity from future folds."), false);
  assert.equal(AUTHORITY_PREFIX_RU.test("Источник EV здесь — фолд-эквити будущих улиц."), false);
});
