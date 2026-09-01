import { hardDependenciesFor } from "../content/practical-mastery/learning-route.ts";
import {
  decisionsForPracticalSkill,
  deriveEvidenceStage,
  markPracticalConceptTaught,
  practicalSkillCorpusCanReach,
  recordPracticalDecision,
} from "../lib/practical-mastery-core.ts";

const KIND_ORDER = new Map([
  ["recognition", 0],
  ["decision", 1],
  ["changed", 2],
  ["mixed", 2],
  ["boundary", 3],
]);

function fixtureDate(now) {
  return now instanceof Date ? now : new Date(now ?? "2026-09-01T00:00:00.000Z");
}

function staleTestIntent(skillId, targetStage, actualStage) {
  throw new Error(`STALE_TEST_INTENT: ${skillId} cannot be canonically moved from ${actualStage} to exact ${targetStage}`);
}

export function reachSkillStage(state, skillId, targetStage, now = "2026-09-01T00:00:00.000Z") {
  const progress = state?.skills?.[skillId];
  if (!progress) throw new Error(`missing practical skill ${skillId}`);

  const initialStage = deriveEvidenceStage(progress);
  if (initialStage === targetStage) return state;
  if (targetStage === "SOURCE_SUPPORTED") staleTestIntent(skillId, targetStage, initialStage);
  if (!practicalSkillCorpusCanReach(skillId, targetStage)) staleTestIntent(skillId, targetStage, initialStage);

  const at = fixtureDate(now);
  let next = state;
  if (!next.skills[skillId].conceptTaught) {
    next = markPracticalConceptTaught(next, skillId, at);
    const taughtStage = deriveEvidenceStage(next.skills[skillId]);
    if (taughtStage === targetStage) return next;
  }

  const successful = new Set(next.skills[skillId].successfulDecisionIds);
  const ordered = decisionsForPracticalSkill(skillId)
    .filter((decision) => !successful.has(decision.id))
    .sort((left, right) => (KIND_ORDER.get(left.kind) ?? 99) - (KIND_ORDER.get(right.kind) ?? 99));

  for (const decision of ordered) {
    next = recordPracticalDecision(next, {
      decisionId: decision.id,
      actionId: decision.correctActionId,
      reasonId: decision.correctReasonId,
      confidence: 100,
      now: at,
    });
    const actualStage = deriveEvidenceStage(next.skills[skillId]);
    if (actualStage === targetStage) return next;
  }

  staleTestIntent(skillId, targetStage, deriveEvidenceStage(next.skills[skillId]));
}

function reachHardPrerequisites(state, skillId, now, visiting = new Set()) {
  if (visiting.has(skillId)) throw new Error(`cyclic practical hard dependency at ${skillId}`);
  const nextVisiting = new Set(visiting).add(skillId);
  let next = state;
  for (const dependency of hardDependenciesFor(skillId)) {
    next = reachHardPrerequisites(next, dependency.fromSkillId, now, nextVisiting);
    next = reachSkillStage(next, dependency.fromSkillId, "DECISION_TRAINED", now);
  }
  return next;
}

export function reachSkillStageWithPrerequisites(state, skillId, targetStage, now = "2026-09-01T00:00:00.000Z") {
  const ready = reachHardPrerequisites(state, skillId, now);
  return reachSkillStage(ready, skillId, targetStage, now);
}

export async function reachPersistedSkillTargets(page, learnerKey, targets, now = "2026-09-01T00:00:00.000Z") {
  const root = await page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    if (!raw) throw new Error("missing learner state");
    return JSON.parse(raw);
  }, learnerKey);
  if (!root?._practicalProfile?.mastery?.skills) throw new Error("missing practical mastery state");

  let mastery = root._practicalProfile.mastery;
  for (const target of targets) {
    mastery = target.withPrerequisites
      ? reachSkillStageWithPrerequisites(mastery, target.skillId, target.targetStage, now)
      : reachSkillStage(mastery, target.skillId, target.targetStage, now);
  }
  root._practicalProfile.mastery = mastery;

  await page.evaluate(({ key, value }) => {
    localStorage.setItem(key, JSON.stringify(value));
  }, { key: learnerKey, value: root });
  return mastery;
}
