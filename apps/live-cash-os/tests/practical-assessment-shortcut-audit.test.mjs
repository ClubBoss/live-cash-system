import assert from "node:assert/strict";
import test from "node:test";

import {
  isOrdinaryLearnerDecision,
  practicalDecisions,
  practicalSkillFamilies,
} from "../content/practical-mastery/index.ts";
import { isIntegrationDerivedSkill } from "../content/practical-mastery/integration-derived.ts";
import { practicalPostQuickStartTeachingAssetForSkill } from "../lib/practical-post-quick-start-learning.ts";
import {
  isPracticalBridgeSkill,
  practicalSkillCorpusCanReach,
} from "../lib/practical-mastery-core.ts";

function text(option, locale) {
  return option[`text${locale}`].trim();
}

function longestFirst(options, correctId, locale) {
  if (!options.length) return false;
  return options.reduce((best, option) => (
    text(option, locale).length > text(best, locale).length ? option : best
  )).id === correctId;
}

function uniqueLongest(options, correctId, locale) {
  const lengths = options.map((option) => ({ id: option.id, length: text(option, locale).length }));
  const max = Math.max(...lengths.map((entry) => entry.length));
  return lengths.filter((entry) => entry.length === max).length === 1
    && lengths.find((entry) => entry.id === correctId)?.length === max;
}

function shortestFirst(options, correctId, locale) {
  if (!options.length) return false;
  return options.reduce((best, option) => (
    text(option, locale).length < text(best, locale).length ? option : best
  )).id === correctId;
}

function metrics(pool, locale) {
  const n = pool.length;
  const chance = n
    ? pool.reduce((sum, decision) => sum + 1 / (decision.actionOptions.length * decision.reasonOptions.length), 0) / n
    : 0;
  const actionLongest = pool.filter((decision) => longestFirst(decision.actionOptions, decision.correctActionId, locale)).length;
  const reasonLongest = pool.filter((decision) => longestFirst(decision.reasonOptions, decision.correctReasonId, locale)).length;
  const actionShortest = pool.filter((decision) => shortestFirst(decision.actionOptions, decision.correctActionId, locale)).length;
  const reasonShortest = pool.filter((decision) => shortestFirst(decision.reasonOptions, decision.correctReasonId, locale)).length;
  const jointLongest = pool.filter((decision) => (
    longestFirst(decision.actionOptions, decision.correctActionId, locale)
    && longestFirst(decision.reasonOptions, decision.correctReasonId, locale)
  )).length;
  const jointUniqueLongest = pool.filter((decision) => (
    uniqueLongest(decision.actionOptions, decision.correctActionId, locale)
    && uniqueLongest(decision.reasonOptions, decision.correctReasonId, locale)
  )).length;
  const jointShortest = pool.filter((decision) => (
    shortestFirst(decision.actionOptions, decision.correctActionId, locale)
    && shortestFirst(decision.reasonOptions, decision.correctReasonId, locale)
  )).length;
  const firstAction = pool.filter((decision) => decision.actionOptions[0]?.id === decision.correctActionId).length;
  const firstReason = pool.filter((decision) => decision.reasonOptions[0]?.id === decision.correctReasonId).length;
  const firstJoint = pool.filter((decision) => (
    decision.actionOptions[0]?.id === decision.correctActionId
    && decision.reasonOptions[0]?.id === decision.correctReasonId
  )).length;
  const rate = n ? jointLongest / n : 0;
  const standardError = n ? Math.sqrt(chance * (1 - chance) / n) : 0;
  const z = standardError > 0 ? (rate - chance) / standardError : 0;
  return {
    n,
    chance,
    actionLongest,
    actionLongestRate: n ? actionLongest / n : 0,
    reasonLongest,
    reasonLongestRate: n ? reasonLongest / n : 0,
    actionShortest,
    actionShortestRate: n ? actionShortest / n : 0,
    reasonShortest,
    reasonShortestRate: n ? reasonShortest / n : 0,
    jointLongest,
    jointLongestRate: rate,
    jointUniqueLongest,
    jointUniqueLongestRate: n ? jointUniqueLongest / n : 0,
    jointShortest,
    jointShortestRate: n ? jointShortest / n : 0,
    firstAction,
    firstReason,
    firstJoint,
    firstJointRate: n ? firstJoint / n : 0,
    z,
  };
}

// Predeclared regression alert, intentionally independent of the observed result.
// For substantial pools, flag only a material shortcut: >=20 percentage points
// above the pool's actual random-choice baseline and at least 3 standard errors.
// Family packs smaller than 12 remain manual-review territory rather than being
// given a noisy pass/fail statistic.
export function materialLengthShortcutAlert(result) {
  return result.n >= 12
    && result.jointLongestRate - result.chance >= 0.20
    && result.z >= 3;
}

function eligibleSkillIds() {
  return new Set(practicalSkillFamilies
    .filter((skill) => (
      !isPracticalBridgeSkill(skill.id)
      && !isIntegrationDerivedSkill(skill.id)
      && practicalSkillCorpusCanReach(skill.id, "DECISION_TRAINED")
    ))
    .map((skill) => skill.id));
}

test("assessment shortcut audit inventories final runtime by pool, family, and locale", () => {
  const eligibleIds = eligibleSkillIds();
  const eligible = practicalDecisions.filter((decision) => (
    isOrdinaryLearnerDecision(decision) && eligibleIds.has(decision.skillId)
  ));
  const teachable = eligible.filter((decision) => (
    practicalPostQuickStartTeachingAssetForSkill(decision.skillId) !== null
  ));

  const pools = { all: practicalDecisions, eligible, teachable };
  const report = { pools: {}, familyAlerts: [] };

  for (const [name, pool] of Object.entries(pools)) {
    report.pools[name] = {};
    for (const locale of ["Ru", "En"]) {
      report.pools[name][locale] = metrics(pool, locale);
    }
  }

  for (const skill of practicalSkillFamilies) {
    const pool = practicalDecisions.filter((decision) => decision.skillId === skill.id && isOrdinaryLearnerDecision(decision));
    if (!pool.length) continue;
    for (const locale of ["Ru", "En"]) {
      const result = metrics(pool, locale);
      if (materialLengthShortcutAlert(result)) {
        report.familyAlerts.push({ skillId: skill.id, locale, ...result });
      }
    }
  }

  assert.equal(report.pools.all.Ru.n, practicalDecisions.length);
  assert.equal(report.pools.eligible.Ru.n, eligible.length);
  assert.equal(report.pools.teachable.Ru.n, teachable.length);
  console.log("ASSESSMENT_SHORTCUT_AUDIT " + JSON.stringify(report));
  for (const [poolName, byLocale] of Object.entries(report.pools)) {
    for (const [locale, result] of Object.entries(byLocale)) {
      assert.equal(materialLengthShortcutAlert(result), false,
        `${poolName}/${locale}: material joint-longest shortcut remains at ${result.jointLongest}/${result.n}`);
    }
  }
  assert.deepEqual(report.familyAlerts.map(({ skillId, locale }) => `${skillId}:${locale}`), [],
    `material family-level joint-longest shortcuts remain: ${report.familyAlerts.map(({ skillId, locale }) => `${skillId}:${locale}`).join(", ")}`);
});
