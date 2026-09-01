import assert from "node:assert/strict";
import test from "node:test";

import { practicalDecisionById } from "../content/practical-mastery/index.ts";
import {
  createPracticalMasteryState,
  isSemanticallyValidPracticalAttempt,
  recordPracticalDecision,
} from "../lib/practical-mastery-core.ts";
import { recommendedPracticalScaffold } from "../lib/practical-scaffold-fading.ts";
import { practicalSkillProgressTransparency } from "../lib/practical-skill-transparency.ts";

const NOW = new Date("2026-09-01T00:00:00.000Z");
const SKILL_ID = "FND-01";

function answeredAt(offsetSeconds) {
  return new Date(NOW.getTime() + offsetSeconds * 1000).toISOString();
}

function syntheticDecision({ id, skillId = SKILL_ID, kind = "decision" }) {
  return {
    id,
    skillId,
    kind,
    sourceRefs: [],
    assumptions: [],
    cueRu: "",
    cueEn: "",
    questionRu: "",
    questionEn: "",
    actionOptions: [
      { id: "a", textRu: "correct", textEn: "correct" },
      { id: "b", textRu: "wrong", textEn: "wrong" },
    ],
    reasonOptions: [
      { id: "r1", textRu: "correct", textEn: "correct" },
      { id: "r2", textRu: "wrong", textEn: "wrong" },
    ],
    correctActionId: "a",
    correctReasonId: "r1",
    explanationRu: "",
    explanationEn: "",
    targetSeconds: 20,
  };
}

function attempt({
  id,
  decision,
  actionId = "a",
  reasonId = "r1",
  confidence = 55,
  correct = actionId === "a" && reasonId === "r1",
  offsetSeconds = 0,
}) {
  return {
    id,
    decisionId: decision.id,
    skillId: decision.skillId,
    actionId,
    reasonId,
    confidence,
    correct,
    answeredAt: answeredAt(offsetSeconds),
  };
}

function withSyntheticDecisions(decisions, run) {
  for (const decision of decisions) practicalDecisionById.set(decision.id, decision);
  try {
    return run();
  } finally {
    for (const decision of decisions) practicalDecisionById.delete(decision.id);
  }
}

function introducedState() {
  const state = createPracticalMasteryState(NOW, true);
  state.skills[SKILL_ID].conceptTaught = true;
  state.skills[SKILL_ID].conceptTaughtAt = NOW.toISOString();
  return state;
}

test("S1: semantically invalid correct=true attempts cannot fade scaffold", () => {
  const recognition1 = syntheticDecision({ id: "RAW-READER-S1-R1", kind: "recognition" });
  const recognition2 = syntheticDecision({ id: "RAW-READER-S1-R2", kind: "recognition" });
  const transfer1 = syntheticDecision({ id: "RAW-READER-S1-T1", kind: "changed" });
  const transfer2 = syntheticDecision({ id: "RAW-READER-S1-T2", kind: "mixed" });
  const boundary = syntheticDecision({ id: "RAW-READER-S1-B1", kind: "boundary" });
  const decisions = [recognition1, recognition2, transfer1, transfer2, boundary];

  withSyntheticDecisions(decisions, () => {
    const state = introducedState();
    const forgedRecognition = attempt({
      id: "s1-forged",
      decision: recognition2,
      actionId: "GHOST",
      correct: true,
      confidence: 95,
      offsetSeconds: 2,
    });
    state.attempts = [
      attempt({ id: "s1-r1", decision: recognition1, offsetSeconds: 1 }),
      forgedRecognition,
      attempt({ id: "s1-t1", decision: transfer1, offsetSeconds: 3 }),
      attempt({ id: "s1-t2", decision: transfer2, offsetSeconds: 4 }),
      attempt({ id: "s1-b1", decision: boundary, offsetSeconds: 5 }),
    ];

    assert.equal(isSemanticallyValidPracticalAttempt(forgedRecognition), false);
    assert.equal(recommendedPracticalScaffold(state, SKILL_ID), "guided");
  });
});

test("S2: an invalid high-confidence true-latest attempt cannot drive scaffold logic", () => {
  const recognition1 = syntheticDecision({ id: "RAW-READER-S2-R1", kind: "recognition" });
  const recognition2 = syntheticDecision({ id: "RAW-READER-S2-R2", kind: "recognition" });
  const poison = syntheticDecision({ id: "RAW-READER-S2-POISON" });

  withSyntheticDecisions([recognition1, recognition2, poison], () => {
    const state = introducedState();
    const invalidLatest = attempt({
      id: "s2-invalid-latest",
      decision: poison,
      actionId: "GHOST",
      correct: false,
      confidence: 95,
      offsetSeconds: 3,
    });
    state.attempts = [
      attempt({ id: "s2-r1", decision: recognition1, offsetSeconds: 1 }),
      attempt({ id: "s2-r2", decision: recognition2, offsetSeconds: 2 }),
      invalidLatest,
    ];

    assert.equal(isSemanticallyValidPracticalAttempt(invalidLatest), false);
    assert.equal(recommendedPracticalScaffold(state, SKILL_ID), "reduced");
  });
});

test("S3: an invalid true-latest row shadows rather than resurrecting an older valid latest attempt", () => {
  const recognition1 = syntheticDecision({ id: "RAW-READER-S3-R1", kind: "recognition" });
  const recognition2 = syntheticDecision({ id: "RAW-READER-S3-R2", kind: "recognition" });
  const older = syntheticDecision({ id: "RAW-READER-S3-OLDER" });
  const latest = syntheticDecision({ id: "RAW-READER-S3-LATEST" });

  withSyntheticDecisions([recognition1, recognition2, older, latest], () => {
    const state = introducedState();
    const olderValid = attempt({
      id: "s3-older-valid",
      decision: older,
      actionId: "b",
      correct: false,
      confidence: 95,
      offsetSeconds: 3,
    });
    const invalidLatest = attempt({
      id: "s3-invalid-latest",
      decision: latest,
      actionId: "GHOST",
      correct: false,
      confidence: 40,
      offsetSeconds: 4,
    });
    state.attempts = [
      attempt({ id: "s3-r1", decision: recognition1, offsetSeconds: 1 }),
      attempt({ id: "s3-r2", decision: recognition2, offsetSeconds: 2 }),
      olderValid,
      invalidLatest,
    ];

    assert.equal(isSemanticallyValidPracticalAttempt(olderValid), true);
    assert.equal(isSemanticallyValidPracticalAttempt(invalidLatest), false);
    assert.equal(
      recommendedPracticalScaffold(state, SKILL_ID),
      "reduced",
      "filtering invalid rows before selecting latest would resurrect the older high-confidence miss and incorrectly return guided",
    );
  });
});

test("S4: all-invalid history is no attempt-derived scaffold signal while conceptTaught remains primary", () => {
  const recognition1 = syntheticDecision({ id: "RAW-READER-S4-R1", kind: "recognition" });
  const recognition2 = syntheticDecision({ id: "RAW-READER-S4-R2", kind: "recognition" });

  withSyntheticDecisions([recognition1, recognition2], () => {
    const noHistory = introducedState();
    const allInvalid = introducedState();
    allInvalid.attempts = [
      attempt({ id: "s4-invalid-1", decision: recognition1, actionId: "GHOST", correct: true, offsetSeconds: 1 }),
      attempt({ id: "s4-invalid-2", decision: recognition2, actionId: "GHOST", correct: true, offsetSeconds: 2 }),
    ];

    assert.equal(recommendedPracticalScaffold(allInvalid, SKILL_ID), recommendedPracticalScaffold(noHistory, SKILL_ID));
    assert.equal(recommendedPracticalScaffold(allInvalid, SKILL_ID), "guided");

    const validHistory = [
      attempt({ id: "s4-valid-1", decision: recognition1, offsetSeconds: 1 }),
      attempt({ id: "s4-valid-2", decision: recognition2, offsetSeconds: 2 }),
    ];
    const taught = introducedState();
    taught.attempts = validHistory;
    const untaught = createPracticalMasteryState(NOW, true);
    untaught.attempts = validHistory;

    assert.equal(recommendedPracticalScaffold(taught, SKILL_ID), "reduced");
    assert.equal(recommendedPracticalScaffold(untaught, SKILL_ID), "guided");
  });
});

test("T1: transparency counts only semantically valid contributors inside the physical window", () => {
  const correctDecision = syntheticDecision({ id: "RAW-READER-T1-CORRECT" });
  const wrongDecision = syntheticDecision({ id: "RAW-READER-T1-WRONG" });
  const forgedDecision = syntheticDecision({ id: "RAW-READER-T1-FORGED" });

  withSyntheticDecisions([correctDecision, wrongDecision, forgedDecision], () => {
    const state = createPracticalMasteryState(NOW, true);
    state.attempts = [
      attempt({ id: "t1-correct", decision: correctDecision, confidence: 61, offsetSeconds: 1 }),
      attempt({ id: "t1-wrong", decision: wrongDecision, actionId: "b", correct: false, confidence: 52, offsetSeconds: 2 }),
      attempt({ id: "t1-forged", decision: forgedDecision, actionId: "GHOST", correct: true, confidence: 99, offsetSeconds: 3 }),
    ];

    const transparency = practicalSkillProgressTransparency(state, SKILL_ID, "BOUNDARY_TESTED");
    assert.equal(transparency.recentAttemptCount, 2);
    assert.equal(transparency.recentCorrectCount, 1);
    assert.equal(transparency.recentDistinctCorrectCount, 1);
  });
});

test("T2: transparency selects the last eight physical slots before semantic filtering", () => {
  const oldValidDecision = syntheticDecision({ id: "RAW-READER-T2-OLD" });
  const malformedDecision = syntheticDecision({ id: "RAW-READER-T2-MALFORMED" });

  withSyntheticDecisions([oldValidDecision, malformedDecision], () => {
    const state = createPracticalMasteryState(NOW, true);
    state.attempts = [
      attempt({ id: "t2-old-valid", decision: oldValidDecision, confidence: 31, offsetSeconds: 0 }),
      ...Array.from({ length: 8 }, (_, index) => attempt({
        id: `t2-malformed-${index}`,
        decision: malformedDecision,
        actionId: "GHOST",
        correct: false,
        confidence: 90,
        offsetSeconds: index + 1,
      })),
    ];

    const transparency = practicalSkillProgressTransparency(state, SKILL_ID, "BOUNDARY_TESTED");
    assert.equal(transparency.recentAttemptCount, 0, "the older valid row is physically outside the last-eight window and must not be backfilled");
    assert.equal(transparency.recentCorrectCount, 0);
    assert.equal(transparency.recentDistinctCorrectCount, 0);
  });
});

test("T3: invalid true-latest row yields null latestConfidence without older-confidence fallback", () => {
  const olderDecision = syntheticDecision({ id: "RAW-READER-T3-OLDER" });
  const latestDecision = syntheticDecision({ id: "RAW-READER-T3-LATEST" });

  withSyntheticDecisions([olderDecision, latestDecision], () => {
    const state = createPracticalMasteryState(NOW, true);
    state.attempts = [
      attempt({ id: "t3-older-valid", decision: olderDecision, confidence: 33, offsetSeconds: 1 }),
      attempt({ id: "t3-invalid-latest", decision: latestDecision, actionId: "GHOST", correct: false, confidence: 97, offsetSeconds: 2 }),
    ];

    const transparency = practicalSkillProgressTransparency(state, SKILL_ID, "BOUNDARY_TESTED");
    assert.equal(transparency.recentAttemptCount, 1);
    assert.equal(transparency.latestConfidence, null);
  });
});

test("T4: legitimate recordPracticalDecision history keeps existing scaffold and transparency behavior", () => {
  const recognition1 = syntheticDecision({ id: "RAW-READER-T4-R1", kind: "recognition" });
  const recognition2 = syntheticDecision({ id: "RAW-READER-T4-R2", kind: "recognition" });
  const transfer1 = syntheticDecision({ id: "RAW-READER-T4-T1", kind: "changed" });
  const transfer2 = syntheticDecision({ id: "RAW-READER-T4-T2", kind: "mixed" });
  const boundary = syntheticDecision({ id: "RAW-READER-T4-B1", kind: "boundary" });
  const decisions = [recognition1, recognition2, transfer1, transfer2, boundary];

  withSyntheticDecisions(decisions, () => {
    let state = introducedState();
    decisions.forEach((decision, index) => {
      state = recordPracticalDecision(state, {
        decisionId: decision.id,
        actionId: "a",
        reasonId: "r1",
        confidence: 70 + index,
        now: new Date(NOW.getTime() + (index + 1) * 1000),
      });
    });

    assert.equal(state.attempts.every(isSemanticallyValidPracticalAttempt), true);
    assert.equal(recommendedPracticalScaffold(state, SKILL_ID), "hidden");

    const transparency = practicalSkillProgressTransparency(state, SKILL_ID, "BOUNDARY_TESTED");
    assert.equal(transparency.recentAttemptCount, 5);
    assert.equal(transparency.recentCorrectCount, 5);
    assert.equal(transparency.recentDistinctCorrectCount, 5);
    assert.equal(transparency.latestConfidence, 74);
  });
});
