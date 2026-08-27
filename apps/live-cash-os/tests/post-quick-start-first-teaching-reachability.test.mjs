import assert from "node:assert/strict";
import test from "node:test";

import {
  practicalDecisions,
  practicalSkillFamilies,
} from "../content/practical-mastery/index.ts";
import { firstJourneySteps } from "../content/practical-mastery/first-journey.ts";
import { hardDependenciesFor } from "../content/practical-mastery/learning-route.ts";
import { practicalSourceGapBySkillId } from "../content/practical-mastery/source-gaps.ts";
import { isIntegratedFocusAdmissible } from "../lib/practical-adaptive-session.ts";
import {
  firstJourneyProgress,
  recommendFirstJourneyStep,
} from "../lib/practical-first-journey.ts";
import {
  createPracticalMasteryState,
  isPracticalBridgeSkill,
  nextPracticalDecision,
  practicalPrerequisitesMet,
  practicalSkillCorpusCanReach,
  recommendNextPracticalSkill,
  recordPracticalDecision,
  stageAtLeast,
  markPracticalConceptTaught,
} from "../lib/practical-mastery-core.ts";
import {
  beginPostQuickStartApplication,
  isPostQuickStartTeachingAdmissible,
  practicalPostQuickStartTeachingAssetForSkill,
  resolvePostQuickStartLearningTarget,
} from "../lib/practical-post-quick-start-learning.ts";

const QUICK_START_SKILLS = [
  "FND-01",
  "FND-02",
  "PF-01",
  "PF-04",
  "W4-BOARD-01",
  "IP-01",
  "BL-04",
  "W4-RUNOUT-01",
];

function correctDecision(state, decision, now) {
  return recordPracticalDecision(state, {
    decisionId: decision.id,
    actionId: decision.correctActionId,
    reasonId: decision.correctReasonId,
    confidence: 65,
    now,
  });
}

function completeQuickStart(state, clockStart = Date.parse("2026-08-27T00:00:00.000Z")) {
  let next = state;
  for (const [index, expectedSkillId] of QUICK_START_SKILLS.entries()) {
    const recommendation = recommendFirstJourneyStep(next);
    assert.ok(recommendation, `Quick Start step ${index + 1} must be reachable`);
    assert.equal(recommendation.skillId, expectedSkillId);
    next = markPracticalConceptTaught(next, expectedSkillId, new Date(clockStart + index * 10_000));
    const recognition = practicalDecisions.filter(
      (decision) => decision.skillId === expectedSkillId && decision.kind === "recognition",
    );
    assert.ok(recognition.length >= 2, `${expectedSkillId} must retain two recognition stimuli`);
    for (const [decisionIndex, decision] of recognition.slice(0, 2).entries()) {
      next = correctDecision(next, decision, new Date(clockStart + index * 10_000 + 1000 + decisionIndex));
    }
  }
  return next;
}

function canEventuallyReachDecision(skillId, visiting = new Set()) {
  if (visiting.has(skillId)) return false;
  if (isPracticalBridgeSkill(skillId)) return false;
  if (!practicalSkillCorpusCanReach(skillId, "DECISION_TRAINED")) return false;
  const sourceGap = practicalSourceGapBySkillId.get(skillId);
  if (sourceGap?.status === "SOURCE_BLOCKED" || sourceGap?.status === "PARTIAL") return false;
  const nextVisiting = new Set(visiting);
  nextVisiting.add(skillId);
  return hardDependenciesFor(skillId).every(
    (dependency) => canEventuallyReachDecision(dependency.fromSkillId, nextVisiting),
  );
}

function graphTeachingTargets() {
  return practicalSkillFamilies.filter((skill) => (
    skill.sourceRefs.length > 0
    && !isPracticalBridgeSkill(skill.id)
    && practicalSkillCorpusCanReach(skill.id, "DECISION_TRAINED")
    && practicalPostQuickStartTeachingAssetForSkill(skill.id) !== null
    && canEventuallyReachDecision(skill.id)
  ));
}

function wrongOptionId(options, correctId) {
  return options.find((option) => option.id !== correctId)?.id ?? null;
}

test("Quick Start remains the exact canonical eight and 8/8 is not full mastery", () => {
  assert.equal(firstJourneySteps.length, 8);
  assert.deepEqual(firstJourneySteps.map((step) => step.skillId), QUICK_START_SKILLS);

  const blank = createPracticalMasteryState(new Date("2026-08-27T00:00:00.000Z"));
  assert.equal(recommendFirstJourneyStep(blank)?.skillId, "FND-01");

  const state = completeQuickStart(blank);
  assert.deepEqual(firstJourneyProgress(state), { reached: 8, total: 8, completed: true });
  assert.equal(recommendFirstJourneyStep(state), null);
  assert.ok(
    practicalSkillFamilies.some((skill) => !stageAtLeast(state.skills[skill.id].evidenceStage, skill.targetEvidenceStage)),
    "Quick Start completion must not imply whole-curriculum mastery",
  );
});

test("unseen post-QS teaching is explicit, pure while viewed, and opens focused practice only after CONCEPT_TAUGHT", () => {
  const blank = createPracticalMasteryState(new Date("2026-08-27T00:00:00.000Z"));
  const beforeQuickStart = resolvePostQuickStartLearningTarget(blank);
  assert.equal(beforeQuickStart.kind, "BLOCKED");
  assert.equal(beforeQuickStart.reason, "QUICK_START_INCOMPLETE");

  let state = completeQuickStart(blank);
  let target = resolvePostQuickStartLearningTarget(state);
  let guard = 0;
  while (target.kind !== "TEACH" && guard < 200) {
    assert.equal(target.kind, "PRACTICE", `expected actionable practice before first unseen skill, got ${target.kind}`);
    const decision = nextPracticalDecision(state, target.skillId);
    assert.ok(decision, `${target.skillId} must have a canonical decision while progressing to the next capability`);
    state = correctDecision(state, decision, new Date(Date.parse("2026-08-28T00:00:00.000Z") + guard * 1000));
    target = resolvePostQuickStartLearningTarget(state);
    guard += 1;
  }

  assert.equal(target.kind, "TEACH", "canonical post-QS route must eventually expose an unseen teachable skill");
  const skillId = target.skillId;
  assert.equal(state.skills[skillId].conceptTaught, false);
  assert.equal(isIntegratedFocusAdmissible(state, skillId), false);

  const beforeView = JSON.stringify(state);
  const repeatedResolution = resolvePostQuickStartLearningTarget(state, skillId);
  const asset = practicalPostQuickStartTeachingAssetForSkill(skillId);
  assert.equal(repeatedResolution.kind, "TEACH");
  assert.ok(asset);
  assert.equal(JSON.stringify(state), beforeView, "viewing/resolving the explanation must not mutate mastery state");

  const skillBefore = structuredClone(state.skills[skillId]);
  const attemptsBefore = state.attempts.length;
  const next = beginPostQuickStartApplication(state, skillId, new Date("2026-08-29T00:00:00.000Z"));
  assert.equal(next.skills[skillId].conceptTaught, true);
  assert.equal(next.skills[skillId].evidenceStage, "CONCEPT_TAUGHT");
  assert.equal(next.attempts.length, attemptsBefore);
  assert.equal(next.skills[skillId].recognitionCorrect, skillBefore.recognitionCorrect);
  assert.equal(next.skills[skillId].directDecisionCorrect, skillBefore.directDecisionCorrect);
  assert.equal(next.skills[skillId].changedCorrect, skillBefore.changedCorrect);
  assert.equal(next.skills[skillId].boundaryCorrect, skillBefore.boundaryCorrect);
  assert.equal(next.skills[skillId].mixedCorrect, skillBefore.mixedCorrect);
  assert.equal(isIntegratedFocusAdmissible(next, skillId), true);
  assert.deepEqual(resolvePostQuickStartLearningTarget(next, skillId), {
    kind: "PRACTICE",
    skillId,
    href: `/mastery/session?focus=${encodeURIComponent(skillId)}`,
  });
});

test("post-QS focus fails closed for unmet prerequisites and source ceilings", () => {
  const state = completeQuickStart(createPracticalMasteryState(new Date("2026-08-27T00:00:00.000Z")));
  const locked = graphTeachingTargets().find(
    (skill) => hardDependenciesFor(skill.id).length > 0 && !practicalPrerequisitesMet(state, skill.id) && !state.skills[skill.id].conceptTaught,
  );
  assert.ok(locked, "fixture must contain a later teachable skill with unmet hard prerequisites");
  assert.equal(isPostQuickStartTeachingAdmissible(state, locked.id), false);
  const lockedTarget = resolvePostQuickStartLearningTarget(state, locked.id);
  assert.equal(lockedTarget.kind, "BLOCKED");
  assert.equal(lockedTarget.reason, "FOCUS_UNAVAILABLE");

  for (const [skillId, gap] of practicalSourceGapBySkillId.entries()) {
    if (gap.status !== "SOURCE_BLOCKED" && gap.status !== "PARTIAL") continue;
    assert.equal(isPostQuickStartTeachingAdmissible(state, skillId), false, `${skillId} ${gap.status} must remain non-teachable here`);
    assert.equal(resolvePostQuickStartLearningTarget(state, skillId).kind, "BLOCKED");
  }
});

test("already-taught urgent repair recommendations still resolve to focused practice", () => {
  let state = completeQuickStart(createPracticalMasteryState(new Date("2026-08-27T00:00:00.000Z")));
  const skillId = "FND-01";
  assert.equal(isIntegratedFocusAdmissible(state, skillId), true);
  const decisions = practicalDecisions.filter((decision) => decision.skillId === skillId).slice(0, 2);
  assert.equal(decisions.length, 2);

  for (const [index, decision] of decisions.entries()) {
    const wrongActionId = wrongOptionId(decision.actionOptions, decision.correctActionId);
    assert.ok(wrongActionId, `${decision.id} must expose a wrong action for repair fixture`);
    state = recordPracticalDecision(state, {
      decisionId: decision.id,
      actionId: wrongActionId,
      reasonId: decision.correctReasonId,
      confidence: 90,
      now: new Date(Date.parse("2026-08-30T00:00:00.000Z") + index * 1000),
    });
  }

  const recommendation = recommendNextPracticalSkill(state);
  assert.equal(recommendation?.skillId, skillId);
  const target = resolvePostQuickStartLearningTarget(state);
  assert.equal(target.kind, "PRACTICE");
  assert.equal(target.skillId, skillId);
  assert.equal(target.href, `/mastery/session?focus=${skillId}`);
});

test("whole graph: fresh learner can reach every eligible teaching edge and supported practice through public transitions", () => {
  const targets = graphTeachingTargets();
  assert.ok(targets.length > QUICK_START_SKILLS.length, "reachability proof must cover skills beyond Quick Start");
  const targetIds = new Set(targets.map((skill) => skill.id));

  let state = createPracticalMasteryState(new Date("2026-08-27T00:00:00.000Z"));
  state = completeQuickStart(state);
  let tick = 0;
  const maxTransitions = Math.max(2000, targets.length * 40);

  const unreached = () => targets.filter(
    (skill) => !state.skills[skill.id].conceptTaught || !isIntegratedFocusAdmissible(state, skill.id),
  );

  while (unreached().length > 0 && tick < maxTransitions) {
    const target = resolvePostQuickStartLearningTarget(state);
    assert.notEqual(
      target.kind,
      "BLOCKED",
      `canonical route blocked with eligible targets remaining: ${unreached().map((skill) => skill.id).join(", ")}`,
    );

    if (target.kind === "TEACH") {
      assert.ok(targetIds.has(target.skillId), `${target.skillId} must be part of the eligible teaching graph`);
      assert.equal(state.skills[target.skillId].conceptTaught, false);
      const attemptsBefore = state.attempts.length;
      state = beginPostQuickStartApplication(
        state,
        target.skillId,
        new Date(Date.parse("2026-09-01T00:00:00.000Z") + tick * 1000),
      );
      assert.equal(state.attempts.length, attemptsBefore, "teaching transition must not manufacture a practice attempt");
      assert.equal(state.skills[target.skillId].evidenceStage, "CONCEPT_TAUGHT");
      assert.equal(isIntegratedFocusAdmissible(state, target.skillId), true);
    } else if (target.kind === "PRACTICE") {
      const decision = nextPracticalDecision(state, target.skillId);
      assert.ok(decision, `${target.skillId} must expose a real canonical decision while the graph is still advancing`);
      state = correctDecision(
        state,
        decision,
        new Date(Date.parse("2026-09-01T00:00:00.000Z") + tick * 1000),
      );
    }
    tick += 1;
  }

  assert.ok(tick < maxTransitions, `whole-graph reachability exceeded ${maxTransitions} public transitions`);
  assert.deepEqual(unreached().map((skill) => skill.id), []);
  for (const skill of targets) {
    assert.equal(state.skills[skill.id].conceptTaught, true, `${skill.id} must be learner-teachable`);
    assert.equal(isIntegratedFocusAdmissible(state, skill.id), true, `${skill.id} must expose supported focused practice`);
  }
});
