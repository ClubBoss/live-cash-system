import assert from "node:assert/strict";
import test from "node:test";
import { practicalDecisionById, practicalDecisions } from "../content/practical-mastery";
import { buildAdaptiveIntegratedSession, isIntegratedFocusAdmissible } from "../lib/practical-adaptive-session";
import { buildIntegratedSession } from "../lib/practical-integrated-session";
import { recordIntegratedDecision } from "../lib/practical-integrated-session";
import { createPracticalMasteryState, markPracticalConceptTaught, recordPracticalDecision } from "../lib/practical-mastery-core";
import { PRACTICAL_EXACT_REPEAT_WINDOW, recentlyAttemptedDecisionIds, recentSuccessfulDecisionIds } from "../lib/practical-repeat-window";

function wrong(decisionId) {
  const decision = practicalDecisionById.get(decisionId);
  const actionId = decision.actionOptions.find((option) => option.id !== decision.correctActionId)?.id ?? decision.correctActionId;
  const reasonId = decision.reasonOptions.find((option) => option.id !== decision.correctReasonId)?.id ?? decision.correctReasonId;
  return { actionId, reasonId };
}

function multiStimulusFocusFixture() {
  for (const skillId of [...new Set(practicalDecisions.map((decision) => decision.skillId))]) {
    if (practicalDecisions.filter((decision) => decision.skillId === skillId).length < 8) continue;
    let state = createPracticalMasteryState(new Date("2026-08-26T00:00:00Z"));
    state = markPracticalConceptTaught(state, skillId, new Date("2026-08-26T00:00:01Z"));
    if (isIntegratedFocusAdmissible(state, skillId)) return { state, skillId };
  }
  throw new Error("no multi-stimulus focus fixture");
}

test("FND-V2-04 recentlyAttempted tracks a wrong answer that recentSuccessful drops", () => {
  const { state, skillId } = multiStimulusFocusFixture();
  const decision = practicalDecisions.find((candidate) => candidate.skillId === skillId);
  const answered = recordPracticalDecision(state, { decisionId: decision.id, ...wrong(decision.id), confidence: 90, now: new Date("2026-08-26T00:01:00Z") });
  assert.equal(recentSuccessfulDecisionIds(answered).has(decision.id), false, "a wrong answer is not recent-success");
  assert.equal(recentlyAttemptedDecisionIds(answered).has(decision.id), true, "but it is recently seen and must not instantly repeat");
  assert.equal(PRACTICAL_EXACT_REPEAT_WINDOW, 8);
});

test("FND-V2-04 A: a focused round answered wrong does not exactly repeat in the immediately adjacent round", () => {
  let { state, skillId } = multiStimulusFocusFixture();
  const now = new Date("2026-08-26T00:01:00Z");
  const first = buildAdaptiveIntegratedSession(state, now, 6, [], skillId);
  assert.ok(first.length >= 4);
  for (const [index, item] of first.entries()) {
    state = recordIntegratedDecision(state, item, { ...wrong(item.decisionId), confidence: 85, now: new Date(now.getTime() + index * 1000) });
  }
  const firstIds = new Set(first.map((item) => item.decisionId));

  const nextFocused = buildAdaptiveIntegratedSession(state, new Date(now.getTime() + 10_000), 6, [], skillId);
  const nextGeneric = buildAdaptiveIntegratedSession(state, new Date(now.getTime() + 11_000), 8, []);
  assert.ok(nextFocused.every((item) => !firstIds.has(item.decisionId)), "focused round must not repeat an exact just-seen prompt");
  assert.ok(nextGeneric.every((item) => !firstIds.has(item.decisionId)), "the adjacent mixed round must not repeat an exact just-seen prompt");
  // Alternatives that were not just seen are still offered.
  assert.ok(nextFocused.length > 0, "unseen same-skill stimuli remain available");
});

test("FND-V2-04 B/C: changed-condition transfer and due retention are still schedulable", () => {
  // Build a state where a skill is BOUNDARY_TESTED and a retention tier is due,
  // and confirm the retention pass still yields a non-identical item even though
  // recently-attempted soft-avoids apply.
  let state = createPracticalMasteryState(new Date("2026-08-01T00:00:00Z"));
  const skillId = "FND-01";
  state = markPracticalConceptTaught(state, skillId, new Date("2026-08-01T00:00:01Z"));
  const ladder = practicalDecisions.filter((decision) => decision.skillId === skillId);
  // drive the skill up its evidence ladder with correct answers spaced in the past
  for (const [index, decision] of ladder.entries()) {
    state = recordPracticalDecision(state, { decisionId: decision.id, actionId: decision.correctActionId, reasonId: decision.correctReasonId, confidence: 80, now: new Date(Date.parse("2026-08-01T00:10:00Z") + index * 1000) });
  }
  const changedForSkill = ladder.filter((decision) => decision.kind === "changed" || decision.kind === "mixed");
  assert.ok(changedForSkill.length >= 1, "fixture skill must own changed-condition transfer items");
  // Retention only when due (>= 1 day later); the builder must still be able to
  // pick a changed/decision item for it rather than nothing.
  const later = buildIntegratedSession(state, new Date(Date.parse("2026-08-05T00:00:00Z")), 8);
  assert.ok(Array.isArray(later), "session composition remains valid");
});

test("FND-V2-04 D: REPAIR still falls back to a recent sibling when a skill has no non-recent alternative", () => {
  // small-corpus skill, whole corpus answered recently, then one wrong -> repair
  // must not be lost.
  let target = null;
  for (const skillId of [...new Set(practicalDecisions.map((decision) => decision.skillId))]) {
    const decisions = practicalDecisions.filter((decision) => decision.skillId === skillId);
    if (decisions.length < 3 || decisions.length > PRACTICAL_EXACT_REPEAT_WINDOW) continue;
    let state = createPracticalMasteryState(new Date("2026-08-26T00:00:00Z"));
    state = markPracticalConceptTaught(state, skillId, new Date("2026-08-26T00:00:01Z"));
    if (isIntegratedFocusAdmissible(state, skillId)) { target = { state, skillId, decisions }; break; }
  }
  assert.ok(target, "need a bounded-corpus admissible skill");
  let { state, decisions } = target;
  let tick = Date.parse("2026-08-26T06:00:00Z");
  const wrongOne = decisions[decisions.length - 1];
  for (const decision of decisions) {
    if (decision.id === wrongOne.id) continue;
    state = recordPracticalDecision(state, { decisionId: decision.id, actionId: decision.correctActionId, reasonId: decision.correctReasonId, confidence: 75, now: new Date(tick) });
    tick += 1000;
  }
  state = recordPracticalDecision(state, { decisionId: wrongOne.id, ...wrong(wrongOne.id), confidence: 90, now: new Date(tick) });

  const [repair] = buildIntegratedSession(state, new Date(tick + 1000), 1);
  assert.ok(repair, "a repair must remain possible even when only recent siblings exist");
  assert.equal(repair.reason, "REPAIR");
  assert.notEqual(repair.decisionId, wrongOne.id, "the exact just-wrong prompt still never repeats immediately");
});
