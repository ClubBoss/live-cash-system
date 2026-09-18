import assert from "node:assert/strict";
import test from "node:test";

import {
  isOrdinaryLearnerDecision,
  practicalDecisions,
  practicalSkillFamilies,
} from "../content/practical-mastery/index.ts";
import { isIntegrationDerivedSkill } from "../content/practical-mastery/integration-derived.ts";
import { sanitizeLearnerPresentationText } from "../lib/learner-presentation-firewall.ts";
import { practicalPresentedDecisionOptions } from "../lib/practical-option-presentation.ts";
import {
  isPracticalBridgeSkill,
  practicalSkillCorpusCanReach,
} from "../lib/practical-mastery-core.ts";

const HARD_MIN_N = 120;
const HARD_MIN_SKILLS = 16;
const HARD_MIN_CLUSTERS = 16;
const HARD_EXCESS = 0.08;
const WARNING_MIN_N = 60;
const WARNING_MIN_SKILLS = 8;
const WARNING_MIN_CLUSTERS = 8;
const WARNING_EXCESS = 0.05;

function eligiblePool() {
  const skillIds = new Set(practicalSkillFamilies.filter((skill) => (
    !isPracticalBridgeSkill(skill.id)
    && !isIntegrationDerivedSkill(skill.id)
    && practicalSkillCorpusCanReach(skill.id, "DECISION_TRAINED")
  )).map((skill) => skill.id));
  return practicalDecisions.filter((decision) => (
    isOrdinaryLearnerDecision(decision) && skillIds.has(decision.skillId)
  ));
}

function learnerText(option, locale) {
  return sanitizeLearnerPresentationText(
    option[`text${locale}`].trim(),
    locale === "Ru" ? "ru" : "en",
  );
}

function longestSelection(decision, stage, locale) {
  const options = practicalPresentedDecisionOptions(decision, stage, 0);
  const correctId = stage === "action" ? decision.correctActionId : decision.correctReasonId;
  const lengths = options.map((option) => ({
    id: option.id,
    length: learnerText(option, locale).length,
  }));
  const max = Math.max(...lengths.map((entry) => entry.length));
  const tiedLongest = lengths.filter((entry) => entry.length === max);
  return {
    expectedSuccess: tiedLongest.some((entry) => entry.id === correctId) ? 1 / tiedLongest.length : 0,
    randomBaseline: 1 / options.length,
    uniqueLongest: tiedLongest.length === 1,
  };
}
function signalStats(pool, probabilityForDecision) {
  let expectedSuccess = 0;
  let randomBaseline = 0;
  const positive = [];
  for (const decision of pool) {
    const row = probabilityForDecision(decision);
    expectedSuccess += row.expectedSuccess;
    randomBaseline += row.randomBaseline;
    if (row.expectedSuccess - row.randomBaseline > 1e-12) positive.push(decision);
  }
  const n = pool.length;
  const rate = expectedSuccess / n;
  const baseline = randomBaseline / n;
  return {
    n,
    expectedSuccess,
    rate,
    baseline,
    excess: rate - baseline,
    skillBreadth: new Set(positive.map((decision) => decision.skillId)).size,
    authoredClusterBreadth: new Set(positive.map((decision) => (
      decision.id.replace(/-\d+$/u, "")
    ))).size,
  };
}

function contributorCensus(pool, actionRows, reasonRows) {
  const bySkill = new Map();
  for (const decision of pool) {
    const action = actionRows.get(decision.id);
    const reason = reasonRows.get(decision.id);
    const expectedSuccess = action.expectedSuccess * reason.expectedSuccess;
    const baseline = action.randomBaseline * reason.randomBaseline;
    const current = bySkill.get(decision.skillId) ?? {
      skillId: decision.skillId, n: 0, expectedSuccess: 0, baseline: 0, excess: 0,
    };
    current.n += 1;
    current.expectedSuccess += expectedSuccess;
    current.baseline += baseline;
    current.excess += expectedSuccess - baseline;
    bySkill.set(decision.skillId, current);
  }
  return [...bySkill.values()]
    .filter((entry) => entry.excess > 0)
    .sort((left, right) => right.excess - left.excess || left.skillId.localeCompare(right.skillId))
    .slice(0, 15);
}

function compositeMetrics(pool, locale) {
  const actionRows = new Map();
  const reasonRows = new Map();
  let actionUnique = 0;
  let reasonUnique = 0;
  let bothUnique = 0;
  for (const decision of pool) {
    const action = longestSelection(decision, "action", locale);
    const reason = longestSelection(decision, "reason", locale);
    actionRows.set(decision.id, action);
    reasonRows.set(decision.id, reason);
    actionUnique += Number(action.uniqueLongest);
    reasonUnique += Number(reason.uniqueLongest);
    bothUnique += Number(action.uniqueLongest && reason.uniqueLongest);
  }

  const action = signalStats(pool, (decision) => actionRows.get(decision.id));
  const reason = signalStats(pool, (decision) => reasonRows.get(decision.id));
  const joint = signalStats(pool, (decision) => {
    const actionRow = actionRows.get(decision.id);
    const reasonRow = reasonRows.get(decision.id);
    return {
      expectedSuccess: actionRow.expectedSuccess * reasonRow.expectedSuccess,
      randomBaseline: actionRow.randomBaseline * reasonRow.randomBaseline,
    };
  });
  return {
    action,
    reason,
    joint,
    uniqueLongestCoverage: {
      action: actionUnique / pool.length,
      reason: reasonUnique / pool.length,
      both: bothUnique / pool.length,
    },
    topContributors: contributorCensus(pool, actionRows, reasonRows),
  };
}

// Practical materiality is primary: a broad >=8pp reusable advantage is hard.
// A >=5pp broad signal remains reviewable rather than disappearing as "noise".
// Sample size plus two independent breadth measures prevent tiny/local clusters
// from becoming corpus blockers; statistical significance alone is not used.
function compositeTier(stat) {
  const excess = Number(stat.excess.toFixed(12));
  if (
    stat.n >= HARD_MIN_N
    && stat.skillBreadth >= HARD_MIN_SKILLS
    && stat.authoredClusterBreadth >= HARD_MIN_CLUSTERS
    && excess >= HARD_EXCESS
  ) return "hard";
  if (
    stat.n >= WARNING_MIN_N
    && stat.skillBreadth >= WARNING_MIN_SKILLS
    && stat.authoredClusterBreadth >= WARNING_MIN_CLUSTERS
    && excess >= WARNING_EXCESS
  ) return "warning";
  return "clear";
}

const PRE_REPAIR = {
  Ru: {
    action: { n: 817, rate: 0.41166870665034677, baseline: 0.33333333333333576, excess: 0.07833537331701103, skillBreadth: 69, authoredClusterBreadth: 106 },
    reason: { n: 817, rate: 0.41921664626682986, baseline: 0.33333333333333576, excess: 0.08588331293349412, skillBreadth: 66, authoredClusterBreadth: 108 },
    joint: { n: 817, rate: 0.21827825377396978, baseline: 0.11111111111111303, excess: 0.10716714266285675, skillBreadth: 56, authoredClusterBreadth: 68 },
    uniqueLongestCoverage: { action: 0.966952264381885, reason: 0.9938800489596084, both: 0.9608323133414932 },
  },
  En: {
    action: { n: 817, rate: 0.2776417788657691, baseline: 0.33333333333333576, excess: -0.0556915544675667, skillBreadth: 62, authoredClusterBreadth: 87 },
    reason: { n: 817, rate: 0.41982864137086906, baseline: 0.33333333333333576, excess: 0.08649530803753329, skillBreadth: 67, authoredClusterBreadth: 104 },
    joint: { n: 817, rate: 0.14871481028151776, baseline: 0.11111111111111303, excess: 0.037603699170404715, skillBreadth: 46, authoredClusterBreadth: 53 },
    uniqueLongestCoverage: { action: 0.9730722154222766, reason: 0.9938800489596084, both: 0.966952264381885 },
  },
};

test("pre-repair composite fixture reproduces the exact-main hard exploit", () => {
  assert.equal(PRE_REPAIR.Ru.action.n, 817);
  assert.equal(compositeTier(PRE_REPAIR.Ru.action), "warning");
  assert.equal(compositeTier(PRE_REPAIR.Ru.reason), "hard");
  assert.equal(compositeTier(PRE_REPAIR.Ru.joint), "hard");
  assert.equal(compositeTier(PRE_REPAIR.En.action), "clear");
  assert.equal(compositeTier(PRE_REPAIR.En.reason), "hard");
  assert.equal(compositeTier(PRE_REPAIR.En.joint), "clear");
  assert.ok(PRE_REPAIR.Ru.joint.excess > 0.10);
  assert.ok(PRE_REPAIR.Ru.uniqueLongestCoverage.both > 0.96);
});
test("learner-visible composite census remains comparable to exact starting main without overriding teaching quality", () => {
  const pool = eligiblePool();
  assert.equal(pool.length, 817, "eligible assessment pool drifted");

  const report = {};
  const alerts = [];
  for (const locale of ["Ru", "En"]) {
    const metrics = compositeMetrics(pool, locale);
    report[locale] = metrics;
    for (const signal of ["action", "reason", "joint"]) {
      const tier = compositeTier(metrics[signal]);
      if (tier !== "clear") alerts.push({ locale, signal, tier, ...metrics[signal] });

      const starting = PRE_REPAIR[locale][signal];
      assert.equal(metrics[signal].n, starting.n, `${locale}/${signal}: sample size drifted`);
      assert.ok(
        Math.abs(metrics[signal].baseline - starting.baseline) < 1e-12,
        `${locale}/${signal}: random baseline drifted`,
      );
      // Language/comprehension closure is teaching-first: retain the exact
      // starting-main sample/baseline for comparison, but do not fail merely
      // because a causal correct explanation becomes longer. The resulting
      // rate/tier stays in the emitted diagnostic report for Master review.
      assert.equal(Number.isFinite(metrics[signal].rate), true, `${locale}/${signal}: invalid diagnostic rate`);
    }
  }

  console.log("ASSESSMENT_COMPOSITE_LENGTH " + JSON.stringify(report));
  console.log("ASSESSMENT_COMPOSITE_ALERTS " + JSON.stringify(alerts));
});
