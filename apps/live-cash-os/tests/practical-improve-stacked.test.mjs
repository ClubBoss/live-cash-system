import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { allPracticalTableStates, practicalDecisionById } from "../content/practical-mastery/index.ts";
import { buildAdaptiveIntegratedSession } from "../lib/practical-adaptive-session.ts";
import {
  activeIntegratedRoundResume,
  recordIntegratedRoundStartContinuity,
  restoreIntegratedRound,
} from "../lib/practical-continuity-workspace.ts";
import { currentPracticalMistakes } from "../lib/practical-current-mistakes.ts";
import {
  practicalMistakeLearnerPresentation,
  reviewedRealHandRepairSkillIds,
} from "../lib/practical-improvement-context.ts";
import {
  resolvePracticalImprovementFocus,
} from "../lib/practical-improvement-focus.ts";
import {
  createPracticalMasteryState,
  markPracticalConceptTaught,
} from "../lib/practical-mastery-core.ts";
import {
  focusedPracticalTableStates,
  hasFocusedPracticalTableState,
} from "../lib/practical-perceptual-focus.ts";
import { createPracticalStudyWorkspace } from "../lib/practical-profile-state.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const improveSource = await readFile(path.join(root, "components/PracticalImproveExperience.tsx"), "utf8");
const studySource = await readFile(path.join(root, "components/PracticalStudyLoopExperience.tsx"), "utf8");
const navSource = await readFile(path.join(root, "components/PracticalMasteryNav.tsx"), "utf8");
const guardSource = await readFile(path.join(root, "components/PracticalNavigationGuard.tsx"), "utf8");
const perceptualSource = await readFile(path.join(root, "components/PracticalPerceptualExperience.tsx"), "utf8");

const NOW = new Date("2026-09-01T00:00:00.000Z");

function attempt({ id, decisionId, skillId, actionId, reasonId, confidence = 55, answeredAt }) {
  return {
    id,
    decisionId,
    skillId,
    actionId,
    reasonId,
    confidence,
    correct: false,
    answeredAt: answeredAt ?? "2026-09-01T00:00:00.000Z",
  };
}

function reviewedNote({
  id,
  skillId,
  status = "REVIEWED_REPAIR",
  reviewOutcome = "REPAIR_REQUIRED",
  reviewerKind = "HUMAN_ASSISTED",
  binding = true,
}) {
  return {
    id,
    status,
    reviewOutcome,
    reviewerKind,
    practicalBinding: binding ? {
      fieldHandId: id,
      reviewerKind,
      practicalSkillId: skillId,
      signals: { automaticCbetIssue: true },
      boundAt: "2026-09-01T00:00:00.000Z",
    } : undefined,
  };
}

test("B+-A-01 Study and Improve consume the same Feature-A selector and Improve preserves the full returned order", () => {
  assert.match(studySource, /currentPracticalMistakes\(mastery\)/);
  assert.match(studySource, /canonicalMistakeRows\.slice\(0, 3\)/);
  assert.match(improveSource, /currentPracticalMistakes\(mastery\)/);
  assert.match(improveSource, /currentMistakes\.map\(/);
  assert.doesNotMatch(improveSource, /currentMistakes\.(?:sort|filter|slice)\(/);
  assert.doesNotMatch(improveSource, /mastery\.attempts/);
  assert.doesNotMatch(improveSource, /latestAttempts|SKILL:/);
});

test("B+-A-02 exact A order and identity survive learner presentation without locale-dependent identity changes", () => {
  const d1 = practicalDecisionById.get("PM-BL-01-102");
  const d2 = practicalDecisionById.get("PM-BL-02-101");
  assert.ok(d1 && d2, "accepted A fixtures must exist");

  const wrongAction1 = d1.actionOptions.find((option) => option.misconception)?.id;
  const wrongReason1 = d1.reasonOptions.find((option) => option.misconception)?.id ?? d1.correctReasonId;
  const wrongAction2 = d2.actionOptions.find((option) => option.misconception)?.id;
  const wrongReason2 = d2.reasonOptions.find((option) => option.misconception)?.id ?? d2.correctReasonId;
  assert.ok(wrongAction1 && wrongAction2);

  const state = createPracticalMasteryState(NOW, true);
  state.attempts = [
    attempt({ id: "a1", decisionId: d1.id, skillId: d1.skillId, actionId: wrongAction1, reasonId: wrongReason1, confidence: 90, answeredAt: "2026-09-01T00:00:00.000Z" }),
    attempt({ id: "a2", decisionId: d2.id, skillId: d2.skillId, actionId: wrongAction2, reasonId: wrongReason2, confidence: 40, answeredAt: "2026-09-01T00:01:00.000Z" }),
  ];

  const rows = currentPracticalMistakes(state);
  assert.ok(rows.length >= 2);
  const identity = rows.map((row) => [row.skillId, row.misconceptionId]);
  const before = JSON.stringify(state);
  for (const row of rows) {
    practicalMistakeLearnerPresentation(row, "ru");
    practicalMistakeLearnerPresentation(row, "en");
  }
  assert.deepEqual(currentPracticalMistakes(state).map((row) => [row.skillId, row.misconceptionId]), identity);
  assert.equal(JSON.stringify(state), before);
});

test("B+-A-03 blocked exact mistake eligibility cannot reorder or remove Feature-A evidence", () => {
  const decision = practicalDecisionById.get("PM-BL-01-102");
  assert.ok(decision);
  const wrongAction = decision.actionOptions.find((option) => option.misconception === "PRICE_ONLY")?.id;
  const wrongReason = decision.reasonOptions.find((option) => option.misconception === "PRICE_ONLY")?.id;
  assert.ok(wrongAction && wrongReason);

  const state = createPracticalMasteryState(NOW, true);
  state.attempts = [attempt({ id: "blocked", decisionId: decision.id, skillId: decision.skillId, actionId: wrongAction, reasonId: wrongReason, confidence: 90 })];
  const before = currentPracticalMistakes(state).map((row) => [row.skillId, row.misconceptionId]);
  assert.deepEqual(before, [["BL-01", "PRICE_ONLY"]]);

  const manual = resolvePracticalImprovementFocus(state, "blinds");
  assert.ok(manual.kind === "NO_ELIGIBLE" || !manual.eligibleSkillIds.includes("BL-01"));
  assert.deepEqual(currentPracticalMistakes(state).map((row) => [row.skillId, row.misconceptionId]), before);
});

test("B+-A-04 manual topic browsing contract contains no durable preference write or Feature-A derivation", () => {
  assert.match(improveSource, /useState<PracticalImprovementTopicKey \| null>\(null\)/);
  assert.doesNotMatch(improveSource, /manualTopicId|preferredSkillId|topicCursor/);
  assert.doesNotMatch(improveSource, /setStudyWorkspace\([^)]*manualTopic|setStudyWorkspace\([^)]*topic/i);
  assert.doesNotMatch(improveSource, /recordPracticalDecision\(/);
  assert.doesNotMatch(improveSource, /selectedWrongPracticalMisconceptionIds|unresolvedMistakeFamilies/);
});

test("B+-A-05 explicit exact start persists only a valid non-empty focused round through existing continuity", () => {
  let state = createPracticalMasteryState(NOW, true);
  state = markPracticalConceptTaught(state, "FND-01", NOW);
  const stateBefore = JSON.stringify(state);
  const items = buildAdaptiveIntegratedSession(state, NOW, 8, [], "FND-01");
  assert.ok(items.length > 0);
  assert.ok(items.every((item) => item.skillId === "FND-01"));

  const workspace = createPracticalStudyWorkspace();
  const started = recordIntegratedRoundStartContinuity(workspace, state.contentVersion, { focusSkillId: "FND-01", items }, NOW);
  assert.ok(started);
  assert.equal(started.continuity?.integrated?.focusSkillId, "FND-01");
  assert.deepEqual(started.continuity?.integrated?.items.map((item) => item.decisionId), items.map((item) => item.decisionId));
  assert.equal(started.continuity?.integrated?.nextIndex, 0);
  assert.deepEqual(started.continuity?.integrated?.submittedAttemptIds, []);
  assert.equal(JSON.stringify(state), stateBefore, "starting continuity must not create mastery/evidence");
  assert.equal(restoreIntegratedRound(started, state, "FND-01").status, "VALID");
  assert.equal(activeIntegratedRoundResume(started, state)?.focusSkillId, "FND-01");
});

test("B+-A-06 empty or unavailable exact start writes no continuity and cannot cross-topic fallback", () => {
  const state = createPracticalMasteryState(NOW, true);
  const workspace = createPracticalStudyWorkspace();
  assert.equal(recordIntegratedRoundStartContinuity(workspace, state.contentVersion, { focusSkillId: "FND-01", items: [] }, NOW), null);
  assert.equal(workspace.continuity ?? null, null);

  const resolution = resolvePracticalImprovementFocus(state, "foundations", {
    focusAuthorities: {
      recommendedSkillId: () => "PF-01",
      isFocusAdmissible: () => false,
      hasUsableFocusedItem: () => false,
    },
  });
  assert.equal(resolution.kind, "NO_ELIGIBLE");
  assert.equal(resolution.focusSkillId, null);
  assert.equal(resolution.systemRecommendedSkillId, "PF-01");
});

test("B+-A-07 reviewed Real Hands exact focus accepts only validated repair bindings", () => {
  const valid = reviewedNote({ id: "hand-valid", skillId: "W4-BOARD-01" });
  const pending = reviewedNote({ id: "hand-pending", skillId: "W4-BOARD-01", status: "PENDING_REVIEW" });
  const reviewedOk = reviewedNote({ id: "hand-ok", skillId: "W4-BOARD-01", status: "REVIEWED_VALID", reviewOutcome: "SUPPORTS_TRANSFER" });
  const noBinding = reviewedNote({ id: "hand-none", skillId: "W4-BOARD-01", binding: false });
  const wrongReviewer = reviewedNote({ id: "hand-self", skillId: "W4-BOARD-01", reviewerKind: "SELF" });
  const invalidBinding = reviewedNote({ id: "hand-invalid", skillId: "W4-BOARD-01" });
  invalidBinding.practicalBinding.fieldHandId = "different-hand";

  assert.deepEqual(reviewedRealHandRepairSkillIds([valid, pending, reviewedOk, noBinding, wrongReviewer, invalidBinding]), ["W4-BOARD-01"]);
});

test("B+-A-08 Table Reading exact focus is same-skill only, fail-closed, and read-only before answer", () => {
  const firstTable = allPracticalTableStates.find((table) => practicalDecisionById.has(table.decisionId));
  assert.ok(firstTable);
  const decision = practicalDecisionById.get(firstTable.decisionId);
  assert.ok(decision);

  let state = createPracticalMasteryState(NOW, true);
  assert.deepEqual(focusedPracticalTableStates(state, decision.skillId), []);
  assert.equal(hasFocusedPracticalTableState(state, decision.skillId), false);
  state = markPracticalConceptTaught(state, decision.skillId, NOW);
  const before = JSON.stringify(state);
  const focused = focusedPracticalTableStates(state, decision.skillId);
  assert.ok(focused.length > 0);
  assert.ok(focused.every((table) => practicalDecisionById.get(table.decisionId)?.skillId === decision.skillId));
  assert.equal(JSON.stringify(state), before);
  assert.deepEqual(focusedPracticalTableStates(state, "NOT-A-SKILL"), []);
});

test("B+-A-09 active round precedence is explicit in Improve actions and route discoverability is wired", () => {
  assert.match(improveSource, /activeIntegratedRoundResume\(studyWorkspace, mastery\)/);
  assert.match(improveSource, /if \(activeResume\)/);
  assert.match(improveSource, /Finish the current round first/);
  assert.match(navSource, /\/mastery\/improve/);
  assert.match(guardSource, /\/mastery\/improve/);
});

test("B+-A-10 system recommendation stays separate from Current Mistakes/manual topic authority", () => {
  assert.match(improveSource, /recommendNextPracticalSkill\(mastery\)/);
  assert.match(improveSource, /data-improve-section="recommendation"/);
  assert.match(improveSource, /data-improve-section="current-mistakes"/);
  assert.match(improveSource, /data-improve-section="manual-topics"/);
  assert.doesNotMatch(improveSource, /currentPracticalMistakes\([^)]*recommend/i);
});

test("B+-A-11 exact Table Reading route never silently falls back to generic focus", () => {
  assert.match(perceptualSource, /focusedPracticalTableStates\(state, requestedFocus\)/);
  assert.match(perceptualSource, /data-perceptual-focus-state="unavailable"/);
  assert.match(perceptualSource, /will not be replaced by generic table reading or another topic/);
});

test("B+-A-12 Improve learner copy does not render Feature-A/internal IDs", () => {
  assert.doesNotMatch(improveSource, />\s*\{?row\.skillId\}?\s*</);
  assert.doesNotMatch(improveSource, />\s*\{?row\.misconceptionId\}?\s*</);
  assert.doesNotMatch(improveSource, /unresolvedDecisionIds\.map/);
  assert.doesNotMatch(improveSource, /SKILL:/);
});
