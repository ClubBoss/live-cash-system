import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { practicalDecisionById } from "../content/practical-mastery/index.ts";
import {
  createPracticalMasteryState,
  practicalRepairQueue,
  recommendNextPracticalSkill,
} from "../lib/practical-mastery-core.ts";
import { resolvePracticalImprovementFocus } from "../lib/practical-improvement-focus.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const core = await readFile(path.join(root, "lib/practical-mastery-core.ts"), "utf8");

const NOW = new Date("2026-09-01T00:00:00.000Z");

function attempt({ id, decisionId, skillId, actionId, reasonId, confidence = 55, correct = false, answeredAt = "2026-09-01T00:00:00.000Z" }) {
  return { id, decisionId, skillId, actionId, reasonId, confidence, correct, answeredAt };
}

function syntheticDecision({ id, skillId = "FND-01", actionWrongTag = "M_ACTION", reasonWrongTag = "M_REASON" }) {
  const resolvedActionWrongTag = actionWrongTag === null ? undefined : actionWrongTag;
  const resolvedReasonWrongTag = reasonWrongTag === null ? undefined : reasonWrongTag;
  return {
    id, skillId, kind: "decision", sourceRefs: [], assumptions: [],
    cueRu: "", cueEn: "", questionRu: "", questionEn: "",
    actionOptions: [
      { id: "a", textRu: "correct", textEn: "correct" },
      { id: "b", textRu: "wrong", textEn: "wrong", misconception: resolvedActionWrongTag },
    ],
    reasonOptions: [
      { id: "r1", textRu: "correct", textEn: "correct" },
      { id: "r2", textRu: "wrong", textEn: "wrong", misconception: resolvedReasonWrongTag },
    ],
    correctActionId: "a", correctReasonId: "r1", explanationRu: "", explanationEn: "", targetSeconds: 20,
  };
}

function withSyntheticDecisions(decisions, run) {
  for (const decision of decisions) practicalDecisionById.set(decision.id, decision);
  try { return run(); } finally { for (const decision of decisions) practicalDecisionById.delete(decision.id); }
}

test("C2 the scheduler never reads currentPracticalMistakes' presentation-sorted array or its order", () => {
  assert.doesNotMatch(core, /currentPracticalMistakes\(/);
  assert.match(core, /practicalMisconceptionEvidenceFamilies\(/);
});

test("C7 base case (no high-confidence evidence) preserves the pre-C raw wrong-attempt-count ordering exactly", () => {
  const decisionA = syntheticDecision({ id: "FEATURE-C-SYN-A", skillId: "FND-01" });
  const decisionB1 = syntheticDecision({ id: "FEATURE-C-SYN-B1", skillId: "FND-02" });
  const decisionB2 = syntheticDecision({ id: "FEATURE-C-SYN-B2", skillId: "FND-02" });
  withSyntheticDecisions([decisionA, decisionB1, decisionB2], () => {
    const state = createPracticalMasteryState(NOW, true);
    state.attempts = [
      attempt({ id: "1", decisionId: decisionA.id, skillId: "FND-01", actionId: "b", reasonId: "r1", confidence: 40 }),
      attempt({ id: "2", decisionId: decisionB1.id, skillId: "FND-02", actionId: "b", reasonId: "r1", confidence: 40, answeredAt: "2026-09-01T00:01:00.000Z" }),
      attempt({ id: "3", decisionId: decisionB2.id, skillId: "FND-02", actionId: "b", reasonId: "r1", confidence: 40, answeredAt: "2026-09-01T00:02:00.000Z" }),
    ];
    // FND-02 has strictly more wrong attempts and no high-confidence evidence
    // anywhere: queue order must be wrong-count DESC, skillId ASC, matching
    // pre-C behavior exactly.
    const queue = practicalRepairQueue(state);
    assert.deepEqual(queue.slice(0, 2), ["FND-02", "FND-01"]);
  });
});

test("C7 high-confidence weighting can promote a skill with fewer raw wrong attempts ahead of one with more", () => {
  const decisionA = syntheticDecision({ id: "FEATURE-C-SYN-C", skillId: "FND-01" });
  const decisionB1 = syntheticDecision({ id: "FEATURE-C-SYN-D1", skillId: "FND-02" });
  const decisionB2 = syntheticDecision({ id: "FEATURE-C-SYN-D2", skillId: "FND-02" });
  withSyntheticDecisions([decisionA, decisionB1, decisionB2], () => {
    const state = createPracticalMasteryState(NOW, true);
    state.attempts = [
      // FND-01: a single high-confidence wrong attempt -> weight 1 + 2 = 3.
      attempt({ id: "1", decisionId: decisionA.id, skillId: "FND-01", actionId: "b", reasonId: "r1", confidence: 90 }),
      // FND-02: two low-confidence wrong attempts -> weight 2 + 0 = 2.
      attempt({ id: "2", decisionId: decisionB1.id, skillId: "FND-02", actionId: "b", reasonId: "r1", confidence: 40, answeredAt: "2026-09-01T00:01:00.000Z" }),
      attempt({ id: "3", decisionId: decisionB2.id, skillId: "FND-02", actionId: "b", reasonId: "r1", confidence: 40, answeredAt: "2026-09-01T00:02:00.000Z" }),
    ];
    const queue = practicalRepairQueue(state);
    assert.deepEqual(queue.slice(0, 2), ["FND-01", "FND-02"]);
  });
});

test("C1/C7 the global recommendation score strictly rises when the same wrong evidence becomes high-confidence", () => {
  const decision = syntheticDecision({ id: "FEATURE-C-SYN-F", skillId: "FND-01" });
  withSyntheticDecisions([decision], () => {
    const stateLow = createPracticalMasteryState(NOW, true);
    stateLow.attempts = [attempt({ id: "1", decisionId: decision.id, skillId: "FND-01", actionId: "b", reasonId: "r1", confidence: 40 })];
    const stateHigh = createPracticalMasteryState(NOW, true);
    stateHigh.attempts = [attempt({ id: "1", decisionId: decision.id, skillId: "FND-01", actionId: "b", reasonId: "r1", confidence: 90 })];

    const lowRec = recommendNextPracticalSkill(stateLow);
    const highRec = recommendNextPracticalSkill(stateHigh);
    assert.equal(lowRec?.skillId, "FND-01");
    assert.equal(highRec?.skillId, "FND-01");
    // Same skill/stage/base signals, only the wrong attempt's confidence
    // differs: the high-confidence attempt must score strictly higher.
    assert.ok(highRec.score > lowRec.score, "high-confidence wrong evidence must elevate the recommendation score");
    assert.match(highRec.whyNow, /Repair now:/);
  });
});

test("C5 a single decision wrong on two distinct misconceptions elevates the recommendation score above a same-count single-misconception case", () => {
  const singleMisconception = syntheticDecision({ id: "FEATURE-C-SYN-G1", skillId: "FND-01", actionWrongTag: "M_ONLY_G1", reasonWrongTag: null });
  const dualMisconception = syntheticDecision({ id: "FEATURE-C-SYN-G2", skillId: "FND-01", actionWrongTag: "M_ACTION_G2", reasonWrongTag: "M_REASON_G2" });

  const singleScore = withSyntheticDecisions([singleMisconception], () => {
    const state = createPracticalMasteryState(NOW, true);
    state.attempts = [attempt({ id: "1", decisionId: singleMisconception.id, skillId: "FND-01", actionId: "b", reasonId: "r1", confidence: 40 })];
    const recommendation = recommendNextPracticalSkill(state);
    assert.equal(recommendation?.skillId, "FND-01");
    return recommendation.score;
  });

  const dualScore = withSyntheticDecisions([dualMisconception], () => {
    const state = createPracticalMasteryState(NOW, true);
    state.attempts = [attempt({ id: "1", decisionId: dualMisconception.id, skillId: "FND-01", actionId: "b", reasonId: "r2", confidence: 40 })];
    const recommendation = recommendNextPracticalSkill(state);
    assert.equal(recommendation?.skillId, "FND-01");
    return recommendation.score;
  });

  assert.ok(dualScore > singleScore, "two distinct misconceptions from one decision must outrank a single misconception at the same wrong-attempt count");
});

test("C1 the untagged scheduler-only fallback still contributes repair urgency even though it is invisible to Current Mistakes presentation", () => {
  const decision = syntheticDecision({ id: "FEATURE-C-SYN-H", skillId: "FND-01", actionWrongTag: null, reasonWrongTag: null });
  withSyntheticDecisions([decision], () => {
    const state = createPracticalMasteryState(NOW, true);
    state.attempts = [attempt({ id: "1", decisionId: decision.id, skillId: "FND-01", actionId: "b", reasonId: "r1", confidence: 90 })];
    const recommendation = recommendNextPracticalSkill(state);
    assert.equal(recommendation?.skillId, "FND-01");
    assert.match(recommendation.whyNow, /Repair now:/);
    assert.deepEqual(practicalRepairQueue(state), ["FND-01"]);
  });
});

test("C8 a malformed attempt (stored correct flag inconsistent with the decision) fails closed and contributes no repair urgency", () => {
  const decision = syntheticDecision({ id: "FEATURE-C-SYN-I", skillId: "FND-01" });
  withSyntheticDecisions([decision], () => {
    const state = createPracticalMasteryState(NOW, true);
    // actionId "b" is objectively wrong, but the stored `correct: true` flag is
    // inconsistent with that; both the tagged and untagged paths must fail
    // closed and exclude it rather than counting it as repair evidence.
    state.attempts = [attempt({ id: "1", decisionId: decision.id, skillId: "FND-01", actionId: "b", reasonId: "r1", confidence: 90, correct: true })];
    assert.deepEqual(practicalRepairQueue(state), []);
    // FND-01 may still be recommended for an unrelated reason (first-journey
    // step), but never with a repair rationale from this malformed attempt.
    assert.doesNotMatch(recommendNextPracticalSkill(state)?.whyNow ?? "", /Repair now:/);
  });
});

test("C9 repair urgency computation never mutates learner state", () => {
  const decision = syntheticDecision({ id: "FEATURE-C-SYN-J", skillId: "FND-01" });
  withSyntheticDecisions([decision], () => {
    const state = createPracticalMasteryState(NOW, true);
    state.attempts = [attempt({ id: "1", decisionId: decision.id, skillId: "FND-01", actionId: "b", reasonId: "r1", confidence: 90 })];
    const before = JSON.stringify(state);
    practicalRepairQueue(state);
    recommendNextPracticalSkill(state);
    assert.equal(JSON.stringify(state), before);
  });
});

test("C3 the global recommendation is independent of manual B+ topic selection", () => {
  const decision = syntheticDecision({ id: "FEATURE-C-SYN-K", skillId: "FND-01" });
  withSyntheticDecisions([decision], () => {
    const state = createPracticalMasteryState(NOW, true);
    state.attempts = [attempt({ id: "1", decisionId: decision.id, skillId: "FND-01", actionId: "b", reasonId: "r1", confidence: 90 })];
    const withoutBrowsing = recommendNextPracticalSkill(state);
    resolvePracticalImprovementFocus(state, "blinds");
    resolvePracticalImprovementFocus(state, "reraised_pots");
    const afterBrowsing = recommendNextPracticalSkill(state);
    assert.deepEqual(afterBrowsing, withoutBrowsing);
  });
});
