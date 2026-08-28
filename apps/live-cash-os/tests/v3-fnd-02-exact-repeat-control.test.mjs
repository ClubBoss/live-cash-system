import assert from "node:assert/strict";
import test from "node:test";
import { practicalDecisionById, practicalDecisions, practicalSkillFamilies } from "../content/practical-mastery";
import { isIntegrationDerivedSkill } from "../content/practical-mastery/integration-derived";
import { buildAdaptiveIntegratedSession } from "../lib/practical-adaptive-session";
import { firstJourneySteps } from "../content/practical-mastery/first-journey";
import { nextFirstJourneyDecision } from "../lib/practical-first-journey";
import { recordIntegratedDecision } from "../lib/practical-integrated-session";
import { createPracticalMasteryState, markPracticalConceptTaught, recordPracticalDecision } from "../lib/practical-mastery-core";
import { PRACTICAL_EXACT_REPEAT_WINDOW } from "../lib/practical-repeat-window";

const FOCUS = "W4-HAND-01"; // "Made-hand families"

function wrong(decision) {
  const actionId = decision.actionOptions.find((option) => option.id !== decision.correctActionId)?.id ?? decision.correctActionId;
  const reasonId = decision.reasonOptions.find((option) => option.id !== decision.correctReasonId)?.id ?? decision.correctReasonId;
  return { actionId, reasonId };
}

function correct(decision) {
  return { actionId: decision.correctActionId, reasonId: decision.correctReasonId };
}

// A learner who has been through Quick Start / concept teaching across many
// skills, so the general integrated scheduler has plenty of genuinely eligible
// non-recent content available (matching the reported external flow, not a
// bounded-corpus edge case).
function broadLearnerState() {
  let state = createPracticalMasteryState(new Date("2026-08-01T00:00:00Z"));
  let tick = Date.parse("2026-08-01T00:00:01Z");
  for (const skill of practicalSkillFamilies) {
    if (isIntegrationDerivedSkill(skill.id)) continue;
    state = markPracticalConceptTaught(state, skill.id, new Date(tick));
    tick += 1000;
  }
  return { state, tick };
}

test("V3-FND-02 A: focused-round completion does not exactly repeat into the immediately following integrated round, even with multiple unresolved mistake families on the same skill", () => {
  let { state, tick } = broadLearnerState();

  const focusedItems = buildAdaptiveIntegratedSession(state, new Date(tick), 8, [], FOCUS);
  assert.equal(focusedItems.length, 8, "focused round must be a full 8-item same-skill round");

  // Answer the first four items wrong to create several unresolved mistake
  // families on the same skill, and the rest correct, mirroring "Made-hand
  // families" in the blind report.
  for (const [index, item] of focusedItems.entries()) {
    const decision = practicalDecisionById.get(item.decisionId);
    const answer = index < 4 ? wrong(decision) : correct(decision);
    state = recordIntegratedDecision(state, item, { ...answer, confidence: 80, now: new Date(tick) });
    tick += 1000;
  }

  const integratedItems = buildAdaptiveIntegratedSession(state, new Date(tick), 8, [], null);
  const focusedIds = new Set(focusedItems.map((item) => item.decisionId));
  const overlap = integratedItems.filter((item) => focusedIds.has(item.decisionId));
  assert.deepEqual(overlap, [], "the immediately following integrated round must not exactly repeat any just-completed focused-round prompt while other eligible content exists");
});

test("V3-FND-02 B: a wrong Quick Start item does not resurface after only one intervening item while a non-recent alternative exists", () => {
  const step = firstJourneySteps.find((candidate) => {
    const decisions = practicalDecisions.filter((decision) => decision.skillId === candidate.skillId);
    const recognitionCount = decisions.filter((decision) => decision.kind === "recognition").length;
    return decisions.length >= 4 && recognitionCount >= 2;
  });
  assert.ok(step, "need a Quick Start step with a sibling recognition item plus further untried content");
  const skillId = step.skillId;
  const target = practicalDecisions.find((decision) => decision.skillId === skillId && decision.kind === "recognition");

  let state = createPracticalMasteryState(new Date("2026-08-26T00:00:00Z"));
  state = markPracticalConceptTaught(state, skillId, new Date("2026-08-26T00:00:01Z"));
  state = recordPracticalDecision(state, { decisionId: target.id, ...wrong(target), confidence: 85, now: new Date("2026-08-26T00:01:00Z") });

  const sibling = nextFirstJourneyDecision(state, skillId);
  assert.ok(sibling);
  assert.notEqual(sibling.id, target.id, "the wrong item must not repeat on the very next turn");

  state = recordPracticalDecision(state, { decisionId: sibling.id, ...correct(practicalDecisionById.get(sibling.id)), confidence: 70, now: new Date("2026-08-26T00:02:00Z") });

  // Exactly one intervening item has now been answered since the wrong prompt.
  const afterOneIntervening = nextFirstJourneyDecision(state, skillId);
  if (afterOneIntervening) {
    assert.notEqual(afterOneIntervening.id, target.id, "the wrong item must not resurface after only one intervening item while a non-recent alternative is available");
  }
});

test("V3-FND-02 recently correct decisions are still held back from the immediately adjacent round", () => {
  let { state, tick } = broadLearnerState();
  const items = buildAdaptiveIntegratedSession(state, new Date(tick), 4, [], FOCUS);
  assert.ok(items.length > 0);
  for (const item of items) {
    const decision = practicalDecisionById.get(item.decisionId);
    state = recordIntegratedDecision(state, item, { ...correct(decision), confidence: 80, now: new Date(tick) });
    tick += 1000;
  }
  const next = buildAdaptiveIntegratedSession(state, new Date(tick), 8, [], null);
  const seenIds = new Set(items.map((item) => item.decisionId));
  assert.ok(next.every((item) => !seenIds.has(item.decisionId)), "recently correct items remain held back from the adjacent round");
});

test("V3-FND-02 recently wrong decisions are still held back from the immediately adjacent round", () => {
  let { state, tick } = broadLearnerState();
  const items = buildAdaptiveIntegratedSession(state, new Date(tick), 4, [], FOCUS);
  assert.ok(items.length > 0);
  for (const item of items) {
    const decision = practicalDecisionById.get(item.decisionId);
    state = recordIntegratedDecision(state, item, { ...wrong(decision), confidence: 80, now: new Date(tick) });
    tick += 1000;
  }
  const next = buildAdaptiveIntegratedSession(state, new Date(tick), 8, [], null);
  const seenIds = new Set(items.map((item) => item.decisionId));
  assert.ok(next.every((item) => !seenIds.has(item.decisionId)), "recently wrong items remain held back from the adjacent round");
});

test("V3-FND-02 small/exhausted corpus fallback still yields a repair rather than a forced empty round", () => {
  // A bounded-corpus skill with no other eligible skills: once the entire
  // corpus is within the recent window, the REPAIR pass must still be able to
  // fall back to an exact repeat rather than silently dropping the repair.
  let target = null;
  for (const skillId of [...new Set(practicalDecisions.map((decision) => decision.skillId))]) {
    const decisions = practicalDecisions.filter((decision) => decision.skillId === skillId);
    if (decisions.length < 3 || decisions.length > PRACTICAL_EXACT_REPEAT_WINDOW) continue;
    let state = createPracticalMasteryState(new Date("2026-08-26T00:00:00Z"));
    state = markPracticalConceptTaught(state, skillId, new Date("2026-08-26T00:00:01Z"));
    target = { state, skillId, decisions };
    break;
  }
  assert.ok(target, "need a bounded-corpus fixture");
  let { state, decisions } = target;
  let tick = Date.parse("2026-08-26T06:00:00Z");
  const wrongOne = decisions[decisions.length - 1];
  for (const decision of decisions) {
    if (decision.id === wrongOne.id) continue;
    state = recordPracticalDecision(state, { decisionId: decision.id, ...correct(decision), confidence: 75, now: new Date(tick) });
    tick += 1000;
  }
  state = recordPracticalDecision(state, { decisionId: wrongOne.id, ...wrong(wrongOne), confidence: 90, now: new Date(tick) });

  const [repair] = buildAdaptiveIntegratedSession(state, new Date(tick + 1000), 1, []);
  assert.ok(repair, "a repair must remain possible even when the entire corpus is recently attempted");
});
