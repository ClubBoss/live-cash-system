import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { practicalDecisionById, practicalDecisions } from "../content/practical-mastery";
import { buildAdaptiveIntegratedSession, isIntegratedFocusAdmissible } from "../lib/practical-adaptive-session";
import { buildIntegratedSession, supportedIntegratedSkillIds } from "../lib/practical-integrated-session";
import { classifyPracticalIntegratedSessionState } from "../lib/practical-integrated-session-state";
import { createPracticalMasteryState, markPracticalConceptTaught, recordPracticalDecision } from "../lib/practical-mastery-core";
import { PRACTICAL_EXACT_REPEAT_WINDOW, recentSuccessfulDecisionIds } from "../lib/practical-repeat-window";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function correctInput(decisionId, confidence, now) {
  const decision = practicalDecisionById.get(decisionId);
  assert.ok(decision, `missing decision ${decisionId}`);
  return { decisionId, actionId: decision.correctActionId, reasonId: decision.correctReasonId, confidence, now };
}

function wrongInput(decisionId, confidence, now) {
  const decision = practicalDecisionById.get(decisionId);
  assert.ok(decision, `missing decision ${decisionId}`);
  const actionId = decision.actionOptions.find((option) => option.id !== decision.correctActionId)?.id ?? decision.correctActionId;
  const reasonId = decision.reasonOptions.find((option) => option.id !== decision.correctReasonId)?.id ?? decision.correctReasonId;
  assert.ok(actionId !== decision.correctActionId || reasonId !== decision.correctReasonId, `missing wrong option for ${decisionId}`);
  return { decisionId, actionId, reasonId, confidence, now };
}

function boundedSupportedFixture() {
  for (const skillId of [...new Set(practicalDecisions.map((decision) => decision.skillId))]) {
    const decisions = practicalDecisions.filter((decision) => decision.skillId === skillId);
    if (decisions.length < 3 || decisions.length > PRACTICAL_EXACT_REPEAT_WINDOW) continue;
    let state = createPracticalMasteryState(new Date("2026-08-26T06:00:00Z"));
    state = markPracticalConceptTaught(state, skillId, new Date("2026-08-26T06:00:01Z"));
    if (supportedIntegratedSkillIds(state).includes(skillId)) return { state, skillId, decisions };
  }
  throw new Error("No supported 3..8-decision fixture found");
}

function attemptWholeSkillCorrectly(state, decisions, startMs) {
  let next = state;
  for (const [index, decision] of decisions.entries()) {
    next = recordPracticalDecision(next, correctInput(decision.id, 70, new Date(startMs + index * 1000)));
  }
  return next;
}

test("REPAIR prefers a non-recent sibling over a recently-correct exact item", () => {
  const fixture = boundedSupportedFixture();
  const [recentA, wrongB, usableC] = fixture.decisions;
  let state = attemptWholeSkillCorrectly(fixture.state, fixture.decisions, Date.parse("2026-08-25T00:00:00Z"));

  for (let index = 0; index < PRACTICAL_EXACT_REPEAT_WINDOW; index += 1) {
    state = recordPracticalDecision(state, correctInput(recentA.id, 80, new Date(Date.parse("2026-08-26T06:10:00Z") + index * 1000)));
  }
  state = recordPracticalDecision(state, wrongInput(wrongB.id, 90, new Date("2026-08-26T06:11:00Z")));

  const recentSuccessful = recentSuccessfulDecisionIds(state);
  assert.equal(recentSuccessful.has(recentA.id), true, "A must be inside the recent-success window");
  assert.equal(recentSuccessful.has(usableC.id), false, "C must remain an eligible non-recent sibling");

  const [repair] = buildIntegratedSession(state, new Date("2026-08-26T06:12:00Z"), 1);
  assert.ok(repair, "repair fixture must schedule one item");
  assert.equal(repair.reason, "REPAIR");
  assert.equal(repair.decisionId, usableC.id, "REPAIR must use C rather than resurrect recent-correct A");
  assert.notEqual(repair.decisionId, recentA.id);
});

test("REPAIR falls back to a recent sibling when no non-recent repair alternative exists", () => {
  const fixture = boundedSupportedFixture();
  const [, wrongB] = fixture.decisions;
  let state = attemptWholeSkillCorrectly(fixture.state, fixture.decisions, Date.parse("2026-08-25T00:00:00Z"));
  let tick = Date.parse("2026-08-26T06:20:00Z");

  for (const decision of fixture.decisions) {
    if (decision.id === wrongB.id) continue;
    state = recordPracticalDecision(state, correctInput(decision.id, 75, new Date(tick)));
    tick += 1000;
  }
  state = recordPracticalDecision(state, wrongInput(wrongB.id, 90, new Date(tick)));

  const recentSuccessful = recentSuccessfulDecisionIds(state);
  const nonWrongIds = fixture.decisions.filter((decision) => decision.id !== wrongB.id).map((decision) => decision.id);
  assert.ok(nonWrongIds.every((decisionId) => recentSuccessful.has(decisionId)), "all usable siblings must be recent for the fallback fixture");

  const [repair] = buildIntegratedSession(state, new Date(tick + 1000), 1);
  assert.ok(repair, "repair must remain possible when only recent siblings exist");
  assert.equal(repair.reason, "REPAIR");
  assert.equal(recentSuccessful.has(repair.decisionId), true, "fallback is allowed to reuse a recent sibling rather than lose repair entirely");
  assert.notEqual(repair.decisionId, wrongB.id, "existing non-identical-to-latest repair rule remains intact");
});

test("fresh generic zero-item session is EMPTY, never COMPLETE", () => {
  const state = createPracticalMasteryState(new Date("2026-08-26T06:30:00Z"));
  const items = buildAdaptiveIntegratedSession(state, new Date("2026-08-26T06:30:01Z"), 8, []);
  assert.equal(items.length, 0, "fresh state should have no eligible independent generic practice");
  assert.equal(classifyPracticalIntegratedSessionState({
    workspaceRecovery: false,
    requestedFocus: null,
    focusAdmissible: true,
    itemCount: items.length,
    index: 0,
  }), "GENERIC_EMPTY");
  assert.equal(classifyPracticalIntegratedSessionState({
    workspaceRecovery: false,
    requestedFocus: null,
    focusAdmissible: true,
    itemCount: 2,
    index: 2,
  }), "COMPLETE", "only a consumed non-empty round may be complete");
});

test("admissible but exhausted focused session is FOCUSED_EMPTY, not unavailable or complete", () => {
  const fixture = boundedSupportedFixture();
  let state = fixture.state;
  const start = Date.parse("2026-08-26T06:40:00Z");
  for (const [index, decision] of fixture.decisions.entries()) {
    state = recordPracticalDecision(state, correctInput(decision.id, 80, new Date(start + index * 1000)));
  }

  assert.equal(isIntegratedFocusAdmissible(state, fixture.skillId), true, "focus must remain canonically admissible");
  const items = buildAdaptiveIntegratedSession(state, new Date(start + 60_000), 8, [], fixture.skillId);
  assert.equal(items.length, 0, "all focused items should be suppressed as recently correct in this fixture");
  assert.equal(classifyPracticalIntegratedSessionState({
    workspaceRecovery: false,
    requestedFocus: fixture.skillId,
    focusAdmissible: true,
    itemCount: items.length,
    index: 0,
  }), "FOCUSED_EMPTY");
});

test("zero-item UI has truthful routes and cannot render 0/0 as Round complete", async () => {
  const source = await readFile(path.join(root, "components/PracticalIntegratedSessionExperience.tsx"), "utf8");
  assert.match(source, /GENERIC_EMPTY/);
  assert.match(source, /FOCUSED_EMPTY/);
  assert.match(source, /This is not a completed round/);
  assert.match(source, /Continue the primary route/);
  assert.doesNotMatch(source, /items\.length === 0 \|\| index >= items\.length/);
});
