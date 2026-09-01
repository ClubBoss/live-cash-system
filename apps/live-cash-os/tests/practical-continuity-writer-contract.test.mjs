import assert from "node:assert/strict";
import test from "node:test";

import { isOrdinaryLearnerDecision, practicalDecisionById } from "../content/practical-mastery/index.ts";
import { isIntegrationDerivedSkill } from "../content/practical-mastery/integration-derived.ts";
import { buildAdaptiveIntegratedSession } from "../lib/practical-adaptive-session.ts";
import {
  recordIntegratedRoundStartContinuity,
  restoreIntegratedRound,
} from "../lib/practical-continuity-workspace.ts";
import {
  createPracticalMasteryState,
  decisionsForPracticalSkill,
  isPracticalBridgeSkill,
  markPracticalConceptTaught,
  recordPracticalDecision,
} from "../lib/practical-mastery-core.ts";
import { validatePracticalProfileState } from "../lib/practical-profile-contract.ts";
import {
  createPracticalProfileState,
  createPracticalStudyWorkspace,
} from "../lib/practical-profile-state.ts";

const NOW = new Date("2026-09-01T00:00:00.000Z");
const FOCUS_SKILL_ID = "FND-01";

function profileWithRound(mastery, focusSkillId, items) {
  const studyWorkspace = recordIntegratedRoundStartContinuity(
    createPracticalStudyWorkspace(),
    mastery.contentVersion,
    { focusSkillId, items },
    NOW,
  );
  assert.ok(studyWorkspace, "canonical continuity writer must persist the round");
  return { ...createPracticalProfileState(NOW), mastery, studyWorkspace };
}

function wrongInputFor(decision) {
  for (const action of decision.actionOptions) {
    for (const reason of decision.reasonOptions) {
      if (action.id !== decision.correctActionId || reason.id !== decision.correctReasonId) {
        return { actionId: action.id, reasonId: reason.id };
      }
    }
  }
  return null;
}

function perSkillCounts(items) {
  const counts = new Map();
  for (const item of items) counts.set(item.skillId, (counts.get(item.skillId) ?? 0) + 1);
  return counts;
}

test("C7/F1 real focused writer round with more than two same-skill items validates", () => {
  let mastery = createPracticalMasteryState(NOW, true);
  mastery = markPracticalConceptTaught(mastery, FOCUS_SKILL_ID, NOW);

  const items = buildAdaptiveIntegratedSession(mastery, NOW, 8, [], FOCUS_SKILL_ID);
  assert.ok(items.length > 2, `expected real focused corpus >2, got ${items.length}`);
  assert.ok(items.length <= 8);
  assert.ok(items.every((item) => item.skillId === FOCUS_SKILL_ID));
  assert.equal(new Set(items.map((item) => item.decisionId)).size, items.length);

  const profile = profileWithRound(mastery, FOCUS_SKILL_ID, items);
  assert.equal(validatePracticalProfileState(profile), true, "canonical focused writer output must validate");
  const restored = restoreIntegratedRound(profile.studyWorkspace, mastery, FOCUS_SKILL_ID);
  assert.equal(restored.status, "VALID");
  assert.deepEqual(restored.items, items);
});

test("G1 real generic adaptive writer can reproduce and validate three items from one skill", () => {
  let reproduced = null;
  const base = markPracticalConceptTaught(createPracticalMasteryState(NOW, true), FOCUS_SKILL_ID, NOW);

  for (const decision of decisionsForPracticalSkill(FOCUS_SKILL_ID)) {
    const wrong = wrongInputFor(decision);
    if (!wrong) continue;
    const mastery = recordPracticalDecision(base, {
      decisionId: decision.id,
      actionId: wrong.actionId,
      reasonId: wrong.reasonId,
      confidence: 90,
      now: NOW,
    });
    const items = buildAdaptiveIntegratedSession(mastery, NOW, 8, [], null);
    const counts = perSkillCounts(items);
    const max = Math.max(0, ...counts.values());
    if (max > 2) {
      reproduced = { mastery, items, max, skillId: [...counts.entries()].find(([, count]) => count === max)?.[0] ?? null };
      break;
    }
  }

  assert.ok(reproduced, "expected the full generic adaptive producer to reproduce >2 same-skill items");
  assert.equal(reproduced.max, 3, "generic writer architecture allows exactly one adaptive overlay plus the base writer's two-item cap");
  assert.equal(new Set(reproduced.items.map((item) => item.decisionId)).size, reproduced.items.length);

  const profile = profileWithRound(reproduced.mastery, null, reproduced.items);
  assert.equal(validatePracticalProfileState(profile), true, "canonical generic adaptive writer output with three same-skill items must validate");
});

test("F2 focused persistence cannot claim one focus while containing another canonical skill", () => {
  let mastery = createPracticalMasteryState(NOW, true);
  mastery = markPracticalConceptTaught(mastery, FOCUS_SKILL_ID, NOW);
  const focusedItems = buildAdaptiveIntegratedSession(mastery, NOW, 8, [], FOCUS_SKILL_ID);
  assert.ok(focusedItems.length > 0);

  const foreignDecision = [...practicalDecisionById.values()].find((decision) =>
    decision.skillId !== FOCUS_SKILL_ID
    && isOrdinaryLearnerDecision(decision)
    && !isIntegrationDerivedSkill(decision.skillId)
    && !isPracticalBridgeSkill(decision.skillId));
  assert.ok(foreignDecision, "expected another canonical ordinary skill for focus-scope probe");

  const mixed = [
    focusedItems[0],
    {
      decisionId: foreignDecision.id,
      skillId: foreignDecision.skillId,
      priority: 1,
      reason: "REINFORCE",
      whyAfterAnswer: "focus-scope negative probe",
      retentionTierDays: null,
    },
  ];
  const profile = profileWithRound(mastery, FOCUS_SKILL_ID, mixed);
  assert.equal(validatePracticalProfileState(profile), false, "focused persisted round must contain only its exact focus skill");
});

test("D1 real focused writer keeps decision identities unique and duplicates remain rejected", () => {
  let mastery = createPracticalMasteryState(NOW, true);
  mastery = markPracticalConceptTaught(mastery, FOCUS_SKILL_ID, NOW);
  const items = buildAdaptiveIntegratedSession(mastery, NOW, 8, [], FOCUS_SKILL_ID);
  assert.ok(items.length > 2);
  assert.equal(new Set(items.map((item) => item.decisionId)).size, items.length);

  const duplicateItems = [...items.slice(0, 2), { ...items[0] }];
  const workspace = recordIntegratedRoundStartContinuity(
    createPracticalStudyWorkspace(),
    mastery.contentVersion,
    { focusSkillId: FOCUS_SKILL_ID, items: duplicateItems },
    NOW,
  );
  assert.ok(workspace);
  const restore = restoreIntegratedRound(workspace, mastery, FOCUS_SKILL_ID);
  assert.equal(restore.status, "VALID", "continuity restore itself does not own duplicate semantic validation");
  const profile = { ...createPracticalProfileState(NOW), mastery, studyWorkspace: workspace };
  assert.equal(validatePracticalProfileState(profile), false, "profile ingest remains the duplicate-decision fail-closed authority");
});
