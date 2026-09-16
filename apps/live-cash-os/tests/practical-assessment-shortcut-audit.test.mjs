import assert from "node:assert/strict";
import test from "node:test";

import {
  isOrdinaryLearnerDecision,
  practicalDecisions,
  practicalSkillFamilies,
} from "../content/practical-mastery/index.ts";
import { isIntegrationDerivedSkill } from "../content/practical-mastery/integration-derived.ts";
import { practicalPostQuickStartTeachingAssetForSkill } from "../lib/practical-post-quick-start-learning.ts";
import { sanitizeLearnerPresentationText } from "../lib/learner-presentation-firewall.ts";
import { practicalPresentedOptions } from "../lib/practical-option-presentation.ts";
import {
  isPracticalBridgeSkill,
  practicalSkillCorpusCanReach,
} from "../lib/practical-mastery-core.ts";

function text(option, locale) {
  return option[`text${locale}`].trim();
}



const WORDING_CUE_PREFIX = {
  Ru: /^(Считать|Переносить|Игнорировать|Распространить|Выбрать)\s/u,
  En: /^(Treat|Assume|Ignore|Transfer)\s/u,
};
const EXPLICIT_WRONGNESS_META = {
  Ru: /(?:якобы|ошибочн(?:ый|ая|ое|ую)\s+(?:правил\w*|shortcut|шаблон\w*))/iu,
  En: /(?:supposedly|mistaken\s+shortcut|wrong\s+rule|erroneous\s+rule)/iu,
};
const OBVIOUS_DISTRACTOR_CUE = {
  Ru: /(?:\bвсегда\b|\bникогда\b|\bавтоматически\b|\bлюбые\s+две\b|\bне\s+имеет\s+значения\b)/iu,
  En: /(?:\balways\b|\bnever\b|\bautomatically\b|\bany\s+two\b|\birrelevant\b)/iu,
};

function learnerVisibleOptionText(option, locale) {
  const learnerLocale = locale === "Ru" ? "ru" : "en";
  return sanitizeLearnerPresentationText(text(option, locale), learnerLocale);
}

function wordingCueStats(pool, locale) {
  const stages = {};
  const authorialWrongness = [];
  for (const stage of ["action", "reason"]) {
    const optionsFor = stage === "action"
      ? (decision) => decision.actionOptions
      : (decision) => decision.reasonOptions;
    const correctFor = stage === "action"
      ? (decision) => decision.correctActionId
      : (decision) => decision.correctReasonId;
    let selected = 0;
    let correct = 0;
    const familyCounts = new Map();
    for (const decision of pool) {
      const options = optionsFor(decision);
      const correctId = correctFor(decision);
      const remaining = options.filter((option) => (
        !WORDING_CUE_PREFIX[locale].test(learnerVisibleOptionText(option, locale))
      ));
      if (remaining.length === 1) {
        selected += 1;
        correct += Number(remaining[0].id === correctId);
        familyCounts.set(decision.skillId, (familyCounts.get(decision.skillId) ?? 0) + 1);
      }
      for (const option of options) {
        if (option.id === correctId) continue;
        const rendered = learnerVisibleOptionText(option, locale);
        if (EXPLICIT_WRONGNESS_META[locale].test(rendered)) {
          authorialWrongness.push({ id: decision.id, skillId: decision.skillId, stage, optionId: option.id, rendered });
        }
      }
    }
    stages[stage] = { selected, correct, families: [...familyCounts.entries()] };
  }
  return { ...stages, authorialWrongness };
}

function visibleLength(option, locale) {
  return learnerVisibleOptionText(option, locale).length;
}

function longestFirst(options, correctId, locale) {
  if (!options.length) return false;
  return options.reduce((best, option) => (
    visibleLength(option, locale) > visibleLength(best, locale) ? option : best
  )).id === correctId;
}

function uniqueLongest(options, correctId, locale) {
  const lengths = options.map((option) => ({ id: option.id, length: visibleLength(option, locale) }));
  const max = Math.max(...lengths.map((entry) => entry.length));
  return lengths.filter((entry) => entry.length === max).length === 1
    && lengths.find((entry) => entry.id === correctId)?.length === max;
}

function uniqueShortest(options, correctId, locale) {
  const lengths = options.map((option) => ({ id: option.id, length: visibleLength(option, locale) }));
  const min = Math.min(...lengths.map((entry) => entry.length));
  return lengths.filter((entry) => entry.length === min).length === 1
    && lengths.find((entry) => entry.id === correctId)?.length === min;
}

function hasUniqueExtreme(options, locale, kind) {
  if (!options.length) return false;
  const lengths = options.map((option) => visibleLength(option, locale));
  const extreme = kind === "longest" ? Math.max(...lengths) : Math.min(...lengths);
  return lengths.filter((length) => length === extreme).length === 1;
}

function shortestFirst(options, correctId, locale) {
  if (!options.length) return false;
  return options.reduce((best, option) => (
    visibleLength(option, locale) < visibleLength(best, locale) ? option : best
  )).id === correctId;
}

function decisionCluster(decision) {
  return decision.id.replace(/-\d+$/, "");
}

function statsFromEligible(eligible, successPredicate, chanceForDecision) {
  const n = eligible.length;
  const chance = n
    ? eligible.reduce((sum, decision) => sum + chanceForDecision(decision), 0) / n
    : 0;
  const successes = eligible.filter(successPredicate);
  const count = successes.length;
  const rate = n ? count / n : 0;
  const standardError = n ? Math.sqrt(chance * (1 - chance) / n) : 0;
  const z = standardError > 0 ? (rate - chance) / standardError : 0;
  return {
    n,
    chance,
    count,
    rate,
    z,
    clusters: new Set(successes.map(decisionCluster)).size,
  };
}

function positionStats(pool, stage, index) {
  const optionsFor = stage === "action"
    ? (decision) => decision.actionOptions
    : (decision) => decision.reasonOptions;
  const correctFor = stage === "action"
    ? (decision) => decision.correctActionId
    : (decision) => decision.correctReasonId;
  const eligible = pool.filter((decision) => optionsFor(decision).length > index);
  return statsFromEligible(
    eligible,
    (decision) => optionsFor(decision)[index]?.id === correctFor(decision),
    (decision) => 1 / optionsFor(decision).length,
  );
}

function pairPositionStats(pool, actionIndex, reasonIndex) {
  const eligible = pool.filter((decision) => (
    decision.actionOptions.length > actionIndex && decision.reasonOptions.length > reasonIndex
  ));
  return statsFromEligible(
    eligible,
    (decision) => (
      decision.actionOptions[actionIndex]?.id === decision.correctActionId
      && decision.reasonOptions[reasonIndex]?.id === decision.correctReasonId
    ),
    (decision) => 1 / (decision.actionOptions.length * decision.reasonOptions.length),
  );
}

function learnerVisiblePositionStats(pool, stage, index, presentationOrdinal = 0) {
  const optionsFor = stage === "action"
    ? (decision) => decision.actionOptions
    : (decision) => decision.reasonOptions;
  const correctFor = stage === "action"
    ? (decision) => decision.correctActionId
    : (decision) => decision.correctReasonId;
  const eligible = pool.filter((decision) => optionsFor(decision).length > index);
  return statsFromEligible(
    eligible,
    (decision) => practicalPresentedOptions(
      optionsFor(decision),
      decision.id,
      stage,
      presentationOrdinal,
    )[index]?.id === correctFor(decision),
    (decision) => 1 / optionsFor(decision).length,
  );
}

function familyLengthContributors(pool, locale, stage, kind) {
  const optionsFor = stage === "action"
    ? (decision) => decision.actionOptions
    : (decision) => decision.reasonOptions;
  const correctFor = stage === "action"
    ? (decision) => decision.correctActionId
    : (decision) => decision.correctReasonId;
  const success = kind === "longest" ? uniqueLongest : uniqueShortest;
  return practicalSkillFamilies
    .map((skill) => {
      const rows = pool.filter((decision) => decision.skillId === skill.id);
      const eligible = rows.filter((decision) => hasUniqueExtreme(optionsFor(decision), locale, kind));
      const count = eligible.filter((decision) => success(
        optionsFor(decision),
        correctFor(decision),
        locale,
      )).length;
      return {
        skillId: skill.id,
        wave: skill.wave,
        n: rows.length,
        eligible: eligible.length,
        count,
        rate: eligible.length ? count / eligible.length : 0,
      };
    })
    .filter((entry) => entry.count > 0)
    .sort((left, right) => right.count - left.count || right.rate - left.rate);
}

function cueEliminationStats(pool, locale, cuePattern) {
  const result = {};
  for (const stage of ["action", "reason"]) {
    const optionsFor = stage === "action"
      ? (decision) => decision.actionOptions
      : (decision) => decision.reasonOptions;
    const correctFor = stage === "action"
      ? (decision) => decision.correctActionId
      : (decision) => decision.correctReasonId;
    const selected = [];
    for (const decision of pool) {
      const remaining = optionsFor(decision).filter((option) => (
        !cuePattern.test(learnerVisibleOptionText(option, locale))
      ));
      if (remaining.length === 1) {
        selected.push({ decision, option: remaining[0], correctId: correctFor(decision) });
      }
    }
    result[stage] = {
      selected: selected.length,
      correct: selected.filter(({ option, correctId }) => option.id === correctId).length,
      clusters: new Set(selected.map(({ decision }) => decisionCluster(decision))).size,
    };
  }
  return result;
}

function uniqueLengthStats(pool, stage, locale, kind) {
  const optionsFor = stage === "action"
    ? (decision) => decision.actionOptions
    : (decision) => decision.reasonOptions;
  const correctFor = stage === "action"
    ? (decision) => decision.correctActionId
    : (decision) => decision.correctReasonId;
  const eligible = pool.filter((decision) => hasUniqueExtreme(optionsFor(decision), locale, kind));
  const success = kind === "longest" ? uniqueLongest : uniqueShortest;
  return statsFromEligible(
    eligible,
    (decision) => success(optionsFor(decision), correctFor(decision), locale),
    (decision) => 1 / optionsFor(decision).length,
  );
}

function mixedLengthPositionStats(pool, locale, lengthStage, kind, positionStage, index) {
  const lengthOptionsFor = lengthStage === "action"
    ? (decision) => decision.actionOptions
    : (decision) => decision.reasonOptions;
  const lengthCorrectFor = lengthStage === "action"
    ? (decision) => decision.correctActionId
    : (decision) => decision.correctReasonId;
  const positionOptionsFor = positionStage === "action"
    ? (decision) => decision.actionOptions
    : (decision) => decision.reasonOptions;
  const positionCorrectFor = positionStage === "action"
    ? (decision) => decision.correctActionId
    : (decision) => decision.correctReasonId;
  const lengthSuccess = kind === "longest" ? uniqueLongest : uniqueShortest;
  const eligible = pool.filter((decision) => (
    hasUniqueExtreme(lengthOptionsFor(decision), locale, kind)
    && positionOptionsFor(decision).length > index
  ));
  return statsFromEligible(
    eligible,
    (decision) => (
      lengthSuccess(lengthOptionsFor(decision), lengthCorrectFor(decision), locale)
      && positionOptionsFor(decision)[index]?.id === positionCorrectFor(decision)
    ),
    (decision) => 1 / (lengthOptionsFor(decision).length * positionOptionsFor(decision).length),
  );
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
  const lastAction = pool.filter((decision) => decision.actionOptions[decision.actionOptions.length - 1]?.id === decision.correctActionId).length;
  const lastReason = pool.filter((decision) => decision.reasonOptions[decision.reasonOptions.length - 1]?.id === decision.correctReasonId).length;
  const lastJoint = pool.filter((decision) => (
    decision.actionOptions[decision.actionOptions.length - 1]?.id === decision.correctActionId
    && decision.reasonOptions[decision.reasonOptions.length - 1]?.id === decision.correctReasonId
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
    lastAction,
    lastReason,
    lastJoint,
    lastJointRate: n ? lastJoint / n : 0,
    z,
  };
}

// Historical gate retained verbatim: substantial joint shortcuts only.
export function materialRateShortcutAlert(result, rateKey) {
  const rate = result[rateKey];
  const standardError = result.n ? Math.sqrt(result.chance * (1 - result.chance) / result.n) : 0;
  const z = standardError > 0 ? (rate - result.chance) / standardError : 0;
  return result.n >= 12
    && rate - result.chance >= 0.20
    && z >= 3;
}

export function materialLengthShortcutAlert(result) {
  return materialRateShortcutAlert(result, "jointLongestRate");
}

function materialLengthMarginalAlert(stat) {
  return stat.n >= 30
    && stat.clusters >= 8
    && stat.rate - stat.chance >= 0.15
    && stat.z >= 3;
}

function lengthMarginalWarning(stat) {
  return stat.n >= 30
    && stat.clusters >= 8
    && stat.rate - stat.chance >= 0.06
    && stat.z >= 3;
}

// New positional gate, declared before any follow-up content edits.
// - actual per-stage random baseline (1/k), and 1/(kA*kR) for fixed pairs;
// - n<12 is manual-review territory;
// - at least four distinct authored clusters must contribute successes so one
//   repeated template cannot manufacture a corpus-level signal;
// - a >=20pp effect-size floor is retained;
// - one-sided normal p is Bonferroni-adjusted across the 15 positional tests
//   in a locale/scope (3 action + 3 reason + 9 fixed pairs).
// Length marginals are diagnostic only: prose length can carry legitimate
// semantic content, so we do not pad/trim text merely to satisfy a metric.
const POSITIONAL_COMPARISONS = 15;
const POSITIONAL_FAMILY_ALPHA = 0.01 / POSITIONAL_COMPARISONS;

function erfc(value) {
  const z = Math.abs(value);
  const t = 1 / (1 + z / 2);
  const r = t * Math.exp(
    -z * z - 1.26551223
    + t * (1.00002368
    + t * (0.37409196
    + t * (0.09678418
    + t * (-0.18628806
    + t * (0.27886807
    + t * (-1.13520398
    + t * (1.48851587
    + t * (-0.82215223
    + t * 0.17087277)))))))));
  return value >= 0 ? r : 2 - r;
}

function oneSidedNormalP(z) {
  return 0.5 * erfc(z / Math.SQRT2);
}

function materialExpandedPositionAlert(stat) {
  return stat.n >= 12
    && stat.clusters >= 4
    && stat.rate - stat.chance >= 0.20
    && oneSidedNormalP(stat.z) <= POSITIONAL_FAMILY_ALPHA;
}

const LEARNER_POSITION_COMPARISONS = 18;
const LEARNER_POSITION_ALPHA = 0.01 / LEARNER_POSITION_COMPARISONS;

function materialLearnerVisiblePositionAlert(stat) {
  return stat.n >= 30
    && stat.clusters >= 8
    && stat.rate - stat.chance >= 0.08
    && oneSidedNormalP(stat.z) <= LEARNER_POSITION_ALPHA;
}

function expandedSignals(pool, locale) {
  const actionPositions = {};
  const reasonPositions = {};
  const pairs = {};
  const mixed = {};
  for (const index of [0, 1, 2]) {
    actionPositions[index] = positionStats(pool, "action", index);
    reasonPositions[index] = positionStats(pool, "reason", index);
  }
  for (const actionIndex of [0, 1, 2]) {
    for (const reasonIndex of [0, 1, 2]) {
      pairs[`${actionIndex}:${reasonIndex}`] = pairPositionStats(pool, actionIndex, reasonIndex);
    }
  }
  for (const kind of ["longest", "shortest"]) {
    for (const index of [0, 1, 2]) {
      mixed[`reason-${kind}+action-${index}`] = mixedLengthPositionStats(pool, locale, "reason", kind, "action", index);
      mixed[`action-${kind}+reason-${index}`] = mixedLengthPositionStats(pool, locale, "action", kind, "reason", index);
    }
  }
  return {
    lengthMarginals: {
      actionLongestUnique: uniqueLengthStats(pool, "action", locale, "longest"),
      actionShortestUnique: uniqueLengthStats(pool, "action", locale, "shortest"),
      reasonLongestUnique: uniqueLengthStats(pool, "reason", locale, "longest"),
      reasonShortestUnique: uniqueLengthStats(pool, "reason", locale, "shortest"),
    },
    actionPositions,
    reasonPositions,
    pairs,
    mixed,
  };
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
  const report = {
    pools: {},
    expandedPools: {},
    learnerVisiblePositions: {},
    lengthContributors: {},
    lengthHardAlerts: [],
    lengthWarnings: [],
    learnerVisiblePositionAlerts: [],
    familyAlerts: [],
    shortcutAlerts: [],
    expandedPositionAlerts: [],
    expandedFamilyPositionAlerts: [],
    decisionAlerts: [],
    wordingCue: {},
    obviousCue: {},
  };

  for (const locale of ["Ru", "En"]) {
    report.wordingCue[locale] = wordingCueStats(eligible, locale);
    report.obviousCue[locale] = cueEliminationStats(eligible, locale, OBVIOUS_DISTRACTOR_CUE[locale]);
    report.lengthContributors[locale] = {
      actionLongestUnique: familyLengthContributors(eligible, locale, "action", "longest"),
      actionShortestUnique: familyLengthContributors(eligible, locale, "action", "shortest"),
      reasonLongestUnique: familyLengthContributors(eligible, locale, "reason", "longest"),
      reasonShortestUnique: familyLengthContributors(eligible, locale, "reason", "shortest"),
    };
  }

  for (const presentationOrdinal of [0, 1, 2]) {
    report.learnerVisiblePositions[presentationOrdinal] = {};
    for (const stage of ["action", "reason"]) {
      report.learnerVisiblePositions[presentationOrdinal][stage] = {};
      for (const position of [0, 1, 2]) {
        const stat = learnerVisiblePositionStats(eligible, stage, position, presentationOrdinal);
        report.learnerVisiblePositions[presentationOrdinal][stage][position] = stat;
        if (materialLearnerVisiblePositionAlert(stat)) {
          report.learnerVisiblePositionAlerts.push({ presentationOrdinal, stage, position, ...stat });
        }
      }
    }
  }

  for (const [name, pool] of Object.entries(pools)) {
    report.pools[name] = {};
    report.expandedPools[name] = {};
    for (const locale of ["Ru", "En"]) {
      report.pools[name][locale] = metrics(pool, locale);
      report.expandedPools[name][locale] = expandedSignals(pool, locale);
      const expanded = report.expandedPools[name][locale];
      if (name === "eligible") {
        for (const [kind, stat] of Object.entries(expanded.lengthMarginals)) {
          if (materialLengthMarginalAlert(stat)) {
            report.lengthHardAlerts.push({ locale, kind, ...stat });
          } else if (lengthMarginalWarning(stat)) {
            report.lengthWarnings.push({ locale, kind, ...stat });
          }
        }
      }
      for (const [stage, byPosition] of [
        ["action", expanded.actionPositions],
        ["reason", expanded.reasonPositions],
      ]) {
        for (const [position, stat] of Object.entries(byPosition)) {
          if (materialExpandedPositionAlert(stat)) {
            report.expandedPositionAlerts.push({ pool: name, locale, kind: `${stage}-position-${position}`, ...stat });
          }
        }
      }
      for (const [pair, stat] of Object.entries(expanded.pairs)) {
        if (materialExpandedPositionAlert(stat)) {
          report.expandedPositionAlerts.push({ pool: name, locale, kind: `pair-${pair}`, ...stat });
        }
      }
    }
  }

  for (const decision of practicalDecisions) {
    for (const locale of ["Ru", "En"]) {
      const actionLongest = longestFirst(decision.actionOptions, decision.correctActionId, locale);
      const reasonLongest = longestFirst(decision.reasonOptions, decision.correctReasonId, locale);
      const actionShortest = shortestFirst(decision.actionOptions, decision.correctActionId, locale);
      const reasonShortest = shortestFirst(decision.reasonOptions, decision.correctReasonId, locale);
      const jointFirst = decision.actionOptions[0]?.id === decision.correctActionId
        && decision.reasonOptions[0]?.id === decision.correctReasonId;
      const jointLast = decision.actionOptions[decision.actionOptions.length - 1]?.id === decision.correctActionId
        && decision.reasonOptions[decision.reasonOptions.length - 1]?.id === decision.correctReasonId;
      if ((actionLongest && reasonLongest) || (actionShortest && reasonShortest) || jointFirst || jointLast) {
        report.decisionAlerts.push({
          id: decision.id,
          skillId: decision.skillId,
          locale,
          jointLongest: actionLongest && reasonLongest,
          jointShortest: actionShortest && reasonShortest,
          jointFirst,
          jointLast,
        });
      }
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
      for (const [kind, rateKey] of [
        ["longest", "jointLongestRate"],
        ["shortest", "jointShortestRate"],
        ["first", "firstJointRate"],
        ["last", "lastJointRate"],
      ]) {
        if (materialRateShortcutAlert(result, rateKey)) {
          report.shortcutAlerts.push({ skillId: skill.id, locale, kind, rate: result[rateKey], chance: result.chance });
        }
      }

      const expanded = expandedSignals(pool, locale);
      for (const [stage, byPosition] of [
        ["action", expanded.actionPositions],
        ["reason", expanded.reasonPositions],
      ]) {
        for (const [position, stat] of Object.entries(byPosition)) {
          if (materialExpandedPositionAlert(stat)) {
            report.expandedFamilyPositionAlerts.push({ skillId: skill.id, locale, kind: `${stage}-position-${position}`, ...stat });
          }
        }
      }
      for (const [pair, stat] of Object.entries(expanded.pairs)) {
        if (materialExpandedPositionAlert(stat)) {
          report.expandedFamilyPositionAlerts.push({ skillId: skill.id, locale, kind: `pair-${pair}`, ...stat });
        }
      }
    }
  }

  assert.equal(report.pools.all.Ru.n, practicalDecisions.length);
  assert.equal(report.pools.eligible.Ru.n, eligible.length);
  assert.equal(report.pools.teachable.Ru.n, teachable.length);
  console.log("ASSESSMENT_SHORTCUT_AUDIT " + JSON.stringify(report));
  console.log("ASSESSMENT_SHORTCUT_SUMMARY " + JSON.stringify({
    eligibleN: eligible.length,
    lengthHardAlerts: report.lengthHardAlerts,
    lengthWarnings: report.lengthWarnings,
    topReasonContributors: Object.fromEntries(["Ru", "En"].map((locale) => [
      locale,
      report.lengthContributors[locale].reasonLongestUnique.slice(0, 12),
    ])),
    learnerVisiblePositionAlerts: report.learnerVisiblePositionAlerts,
    obviousCue: report.obviousCue,
  }));

  for (const [poolName, byLocale] of Object.entries(report.pools)) {
    for (const [locale, result] of Object.entries(byLocale)) {
      for (const [kind, rateKey, countKey] of [
        ["longest", "jointLongestRate", "jointLongest"],
        ["shortest", "jointShortestRate", "jointShortest"],
        ["first", "firstJointRate", "firstJoint"],
        ["last", "lastJointRate", "lastJoint"],
      ]) {
        assert.equal(materialRateShortcutAlert(result, rateKey), false,
          `${poolName}/${locale}: material joint-${kind} shortcut remains at ${result[countKey]}/${result.n}`);
      }
    }
  }
  assert.deepEqual(report.familyAlerts.map(({ skillId, locale }) => `${skillId}:${locale}`), [],
    `material family-level joint-longest shortcuts remain: ${report.familyAlerts.map(({ skillId, locale }) => `${skillId}:${locale}`).join(", ")}`);
  assert.deepEqual(report.shortcutAlerts.map(({ skillId, locale, kind }) => `${skillId}:${locale}:${kind}`), [],
    `material family-level shortcut signals remain: ${report.shortcutAlerts.map(({ skillId, locale, kind }) => `${skillId}:${locale}:${kind}`).join(", ")}`);
  assert.deepEqual(report.expandedPositionAlerts.map(({ pool, locale, kind }) => `${pool}:${locale}:${kind}`), [],
    `material expanded pool-level position shortcuts remain: ${report.expandedPositionAlerts.map(({ pool, locale, kind }) => `${pool}:${locale}:${kind}`).join(", ")}`);
  assert.deepEqual(report.expandedFamilyPositionAlerts.map(({ skillId, locale, kind }) => `${skillId}:${locale}:${kind}`), [],
    `material expanded family-level position shortcuts remain: ${report.expandedFamilyPositionAlerts.map(({ skillId, locale, kind }) => `${skillId}:${locale}:${kind}`).join(", ")}`);
  assert.deepEqual(report.lengthHardAlerts.map(({ locale, kind }) => `${locale}:${kind}`), [],
    `material learner-visible length shortcuts remain: ${report.lengthHardAlerts.map(({ locale, kind, count, n }) => `${locale}:${kind}=${count}/${n}`).join(", ")}`);
  assert.deepEqual(report.learnerVisiblePositionAlerts.map(({ presentationOrdinal, stage, position }) => `${presentationOrdinal}:${stage}:${position}`), [],
    `material learner-visible position shortcuts remain after presentation permutation: ${report.learnerVisiblePositionAlerts.map(({ presentationOrdinal, stage, position }) => `${presentationOrdinal}:${stage}:${position}`).join(", ")}`);

  for (const locale of ["Ru", "En"]) {
    const cue = report.wordingCue[locale];
    assert.equal(cue.action.correct, 0,
      `${locale}: visible wording-prefix rule still selects ${cue.action.correct} correct actions`);
    assert.equal(cue.reason.correct, 0,
      `${locale}: visible wording-prefix rule still selects ${cue.reason.correct} correct reasons`);
    assert.deepEqual(cue.authorialWrongness, [],
      `${locale}: learner-visible distractors still contain explicit authorial wrongness cues`);
  }
});
