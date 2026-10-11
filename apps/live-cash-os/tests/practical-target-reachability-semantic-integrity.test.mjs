import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import { practicalDecisions, practicalDecisionById } from "../content/practical-mastery/index.ts";
import { targetReachabilityClosureDecisions } from "../content/practical-mastery/decisions-target-reachability-closure.ts";
import { trcScenarioDistractors } from "../content/practical-mastery/target-reachability-distractors.ts";
import { practicalPresentedDecisionOptions } from "../lib/practical-option-presentation.ts";
import { selectedWrongPracticalMisconceptionIds } from "../lib/practical-current-mistakes.ts";
import { createPracticalProfileState } from "../lib/practical-profile-state.ts";
import { normalizePracticalProfileState, validatePracticalProfileState } from "../lib/practical-profile-contract.ts";
import {
  PRACTICAL_TRC_DISTRACTOR_SEMANTIC_REVISION,
  createPracticalMasteryState,
  isCurrentPracticalEvidenceAttempt,
  isSemanticallyValidPracticalAttempt,
  recordPracticalDecision,
} from "../lib/practical-mastery-core.ts";

const FROZEN_CORE_SHA256 = "9f0420b405a9e2c8c685b0bb414f5b45bf477c8ef2b76eaea7a3dbdb0dbeba04";
const targets = practicalDecisions.filter((d) => d.id.includes("-TRC-"));
const fingerprint = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const normalize = (value) => value.normalize("NFC").toLowerCase().replace(/\s+/g, " ").trim();

function priorAttempt(decision, actionId, reasonId, semanticRevision) {
  return {
    id: `${decision.id}:prior:2026-09-01T00:00:00.000Z`,
    decisionId: decision.id,
    skillId: decision.skillId,
    actionId,
    reasonId,
    confidence: 75,
    correct: actionId === decision.correctActionId && reasonId === decision.correctReasonId,
    answeredAt: "2026-09-01T00:00:00.000Z",
    ...(semanticRevision ? { semanticRevision } : {}),
  };
}

test("all 19 closure scenarios carry independently authored wrong options and immutable canonical teaching", () => {
  assert.equal(targets.length, 19);
  assert.equal(targetReachabilityClosureDecisions.length, 19);
  assert.deepEqual(new Set(Object.keys(trcScenarioDistractors)), new Set(targets.map((d) => d.id)));
  const protectedCore = targets.map((d) => [
    d.id, d.skillId, d.kind, d.sourceRefs, d.assumptions, d.cueRu, d.cueEn,
    d.questionRu, d.questionEn,
    d.actionOptions.find((o) => o.id === d.correctActionId),
    d.actionOptions.find((o) => o.id === "b"),
    d.reasonOptions.find((o) => o.id === d.correctReasonId),
    d.correctActionId, d.correctReasonId, d.explanationRu, d.explanationEn,
    d.changedVariables, d.targetSeconds,
  ]);
  assert.equal(fingerprint(protectedCore), FROZEN_CORE_SHA256);
  for (const decision of targets) {
    assert.deepEqual(decision.actionOptions.map((o) => o.id), ["a", "b", "c"]);
    assert.deepEqual(decision.reasonOptions.map((o) => o.id), ["r1", "r2", "r3"]);
    for (const locale of ["Ru", "En"]) {
      const options = [decision.actionOptions[2], ...decision.reasonOptions.slice(1)];
      assert.ok(options.every((o) => o[`text${locale}`].length >= 40), `${decision.id} ${locale} must have meaningful, contextual alternative text`);
      assert.ok(options.every((o) => o.misconception && o.misconception !== "TARGET_REACHABILITY_DISTRACTOR"));
    }
  }
});

test("no final TRC wrong option is a repeated authorial template in EN/RU across the full 890 corpus", () => {
  for (const locale of ["Ru", "En"]) {
    const seen = new Map();
    for (const decision of practicalDecisions) {
      for (const kind of ["action", "reason"]) {
        for (const option of practicalPresentedDecisionOptions(decision, kind, 0)) {
          const value = normalize(option[`text${locale}`]);
          seen.set(value, (seen.get(value) ?? 0) + 1);
        }
      }
    }
    for (const decision of targets) {
      for (const kind of ["action", "reason"]) {
        const displayed = practicalPresentedDecisionOptions(decision, kind, 0);
        const wrongIds = kind === "action" ? new Set(["c"]) : new Set(["r2", "r3"]);
        for (const option of displayed.filter((o) => wrongIds.has(o.id))) {
          assert.equal(seen.get(normalize(option[`text${locale}`])), 1, `${decision.id} ${locale} ${kind}/${option.id} repeats a corpus template`);
        }
      }
    }
  }
});

test("TRC changed wrong options fail closed for old evidence while old correct and unchanged mistakes survive", () => {
  for (const decision of targets) {
    const oldCorrect = priorAttempt(decision, "a", "r1");
    const oldUnchangedWrong = priorAttempt(decision, "b", "r1");
    const oldChangedAction = priorAttempt(decision, "c", "r1");
    const oldChangedReason = priorAttempt(decision, "a", "r2");
    const oldOtherReason = priorAttempt(decision, "b", "r3");
    for (const attempt of [oldCorrect, oldUnchangedWrong, oldChangedAction, oldChangedReason, oldOtherReason]) {
      assert.equal(isSemanticallyValidPracticalAttempt(attempt), true, `${decision.id}: old row remains raw-valid`);
    }
    assert.equal(isCurrentPracticalEvidenceAttempt(oldCorrect), true);
    assert.equal(isCurrentPracticalEvidenceAttempt(oldUnchangedWrong), true);
    for (const legacy of [oldChangedAction, oldChangedReason, oldOtherReason]) {
      assert.equal(isCurrentPracticalEvidenceAttempt(legacy), false, `${decision.id}: revised misconception must not inherit old proof`);
      assert.deepEqual(selectedWrongPracticalMisconceptionIds(legacy), []);
    }
  }
});

test("new TRC attempts are tagged and can prove the reviewed misconceptions", () => {
  for (const decision of targets) {
    for (const changed of [{ actionId: "c", reasonId: "r1" }, { actionId: "a", reasonId: "r2" }, { actionId: "a", reasonId: "r3" }]) {
      const recorded = recordPracticalDecision(createPracticalMasteryState(new Date("2026-10-11T12:00:00.000Z"), true), {
        decisionId: decision.id, ...changed, confidence: 60, now: new Date("2026-10-11T12:05:00.000Z"),
      });
      const newAttempt = recorded.attempts.at(-1);
      assert.equal(newAttempt.semanticRevision, PRACTICAL_TRC_DISTRACTOR_SEMANTIC_REVISION);
      assert.equal(isCurrentPracticalEvidenceAttempt(newAttempt), true);
      assert.ok(selectedWrongPracticalMisconceptionIds(newAttempt).length >= 1);
    }
  }
});

test("the semantic revision is narrowly scoped to TRC and does not rewrite unrelated skills", () => {
  const unrelated = practicalDecisions.find((decision) => !decision.id.includes("-TRC-") && decision.skillId === "FND-05");
  assert.ok(unrelated);
  const state = recordPracticalDecision(createPracticalMasteryState(new Date("2026-10-11T12:00:00.000Z"), true), {
    decisionId: unrelated.id, actionId: unrelated.correctActionId, reasonId: unrelated.correctReasonId, confidence: 60,
  });
  assert.equal(state.attempts.at(-1).semanticRevision, undefined);
  assert.equal(practicalDecisionById.get(targets[0].id).correctReasonId, "r1");
});

test("persisted pre-repair TRC misconception is reconciled out of repair evidence without deleting attempts", () => {
  const now = new Date("2026-09-01T00:00:00.000Z");
  const profile = createPracticalProfileState(now);
  profile.mastery = recordPracticalDecision(profile.mastery, {
    decisionId: "PM-FND-05-TRC-101", actionId: "a", reasonId: "r2", confidence: 75,
    now: new Date("2026-09-02T00:00:00.000Z"),
  });
  const stale = profile.mastery.attempts.at(-1);
  delete stale.semanticRevision;
  const oldRaw = structuredClone(profile.mastery.attempts);
  const normalized = normalizePracticalProfileState(profile);
  assert.ok(normalized);
  assert.equal(validatePracticalProfileState(normalized.state), true);
  assert.deepEqual(normalized.state.mastery.attempts, oldRaw);
  assert.equal(isCurrentPracticalEvidenceAttempt(normalized.state.mastery.attempts.at(-1)), false);
  assert.deepEqual(selectedWrongPracticalMisconceptionIds(normalized.state.mastery.attempts.at(-1)), []);
});
