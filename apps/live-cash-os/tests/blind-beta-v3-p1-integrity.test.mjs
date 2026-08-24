import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { buildAdaptiveIntegratedSession, isIntegratedFocusAdmissible } from "../lib/practical-adaptive-session.ts";
import { firstJourneyPresentationState } from "../lib/practical-first-journey-authority.ts";
import { createPracticalMasteryState, markPracticalConceptTaught } from "../lib/practical-mastery-core.ts";
import { decisionHasAuthoritativeVisibleChange, visibleComparisonForDecision } from "../lib/practical-visible-scenario.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const nextLink = await readFile(path.join(root, "components/PracticalNextLearningLink.tsx"), "utf8");
const tableStimulus = await readFile(path.join(root, "components/PracticalTableStateStimulus.tsx"), "utf8");
const diagnosticGuard = await readFile(path.join(root, "components/DiagnosticLearnerPresentationGuard.tsx"), "utf8");
const toolsPage = await readFile(path.join(root, "app/tools/page.tsx"), "utf8");
const journeyPage = await readFile(path.join(root, "app/mastery/journey/page.tsx"), "utf8");

test("V3-01 focused session is a full same-skill round and invalid/PARTIAL focus fails closed", () => {
  let state = createPracticalMasteryState(new Date("2026-08-24T12:00:00Z"));
  state = markPracticalConceptTaught(state, "FND-01", new Date("2026-08-24T12:00:01Z"));
  assert.equal(isIntegratedFocusAdmissible(state, "FND-01"), true);
  const focused = buildAdaptiveIntegratedSession(state, new Date("2026-08-24T12:00:02Z"), 8, [], "FND-01");
  assert.equal(focused.length, 8);
  assert.ok(focused.every((item) => item.skillId === "FND-01"), "focused round must never admit an unrelated skill");
  assert.equal(isIntegratedFocusAdmissible(state, "BL-11"), false, "PARTIAL source skill must fail closed");
  assert.deepEqual(buildAdaptiveIntegratedSession(state, new Date("2026-08-24T12:00:03Z"), 8, [], "NOT-A-SKILL"), []);
});

test("V3-07 named focus links consume the same canonical admissibility predicate", () => {
  assert.match(nextLink, /isIntegratedFocusAdmissible/);
  assert.match(nextLink, /aria-disabled="true"/);
  assert.match(nextLink, /mastery\/session\?focus=/);
});

test("V3-03/V3-02 changed perceptual items carry explicit before/now stimulus and truthful change authority", () => {
  const changedIds = [
    "PM-PERC-FND06-2", "PM-PERC-BL03-2", "PM-PERC-BL04-2", "PM-PERC-BOARD-2", "PM-PERC-RUNOUT-2",
    "PM-PERC-3BP05-2", "PM-PERC-MW01-2", "PM-PERC-DEEP03-2", "PM-PERC-RIV03-2", "PM-PERC-EXP01-2",
  ];
  for (const decisionId of changedIds) {
    const comparison = visibleComparisonForDecision(decisionId);
    assert.ok(comparison, `${decisionId} must have an explicit comparison baseline`);
    assert.equal(decisionHasAuthoritativeVisibleChange(decisionId), true);
  }
  const bl04 = visibleComparisonForDecision("PM-PERC-BL04-2");
  assert.ok(bl04?.before.actions.includes("CO opens 2.5bb"));
  assert.ok(bl04?.current.actions.includes("CO opens 4bb"));
  assert.equal(decisionHasAuthoritativeVisibleChange("PM-PERC-BL04-1"), false, "recognition/retrieval must not receive changed-condition authority");
  assert.match(tableStimulus, /BEFORE/);
  assert.match(tableStimulus, /NOW/);
  assert.match(tableStimulus, /visibleComparisonForDecision/);
});

test("V3-05 Quick Start presentation has one canonical completion authority", () => {
  assert.equal(firstJourneyPresentationState({ reached: 0, total: 8, completed: false }, true), "ACTIVE");
  assert.equal(firstJourneyPresentationState({ reached: 3, total: 8, completed: false }, false), "BLOCKED");
  assert.equal(firstJourneyPresentationState({ reached: 7, total: 8, completed: false }, false), "BLOCKED");
  assert.equal(firstJourneyPresentationState({ reached: 8, total: 8, completed: true }, false), "COMPLETE");
  assert.match(journeyPage, /PracticalFirstJourneyAuthority/);
  assert.doesNotMatch(journeyPage, /PracticalFirstJourneyExperience/);
});

test("V3-04 Diagnostic learner presentation strips internal provenance IDs only on Diagnostic surface", () => {
  assert.match(diagnosticGuard, /LD-\\d\+/);
  assert.match(diagnosticGuard, /LCM-\\d\+/);
  assert.match(diagnosticGuard, /supportTabFromSearch\(window\.location\.search\) !== "diagnostic"/);
  assert.match(toolsPage, /DiagnosticLearnerPresentationGuard/);
});
