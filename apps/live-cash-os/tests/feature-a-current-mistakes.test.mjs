import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { practicalDecisionById } from "../content/practical-mastery/index.ts";
import {
  currentPracticalMistakes,
  selectedWrongPracticalMisconceptionIds,
} from "../lib/practical-current-mistakes.ts";
import {
  recordIntegratedDecision,
  unresolvedMistakeFamilies,
} from "../lib/practical-integrated-session.ts";
import {
  createPracticalMasteryState,
  latestAttemptsByDecision,
} from "../lib/practical-mastery-core.ts";
import {
  recordIntegratedAnswerContinuity,
  recordIntegratedRoundStartContinuity,
} from "../lib/practical-continuity-workspace.ts";
import { createPracticalProfileState } from "../lib/practical-profile-state.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const integratedUiSource = await readFile(path.join(root, "components/PracticalIntegratedSessionExperience.tsx"), "utf8");
const studyLoopSource = await readFile(path.join(root, "components/PracticalStudyLoopExperience.tsx"), "utf8");

function attempt({
  id,
  decisionId,
  skillId,
  actionId,
  reasonId,
  confidence = 55,
  correct = false,
  answeredAt = "2026-09-01T00:00:00.000Z",
}) {
  return { id, decisionId, skillId, actionId, reasonId, confidence, correct, answeredAt };
}

function syntheticDecision({
  id,
  skillId = "FND-01",
  actionWrongTag = "M_ACTION",
  reasonWrongTag = "M_REASON",
  actionCorrectTag,
  learnerEligibility,
}) {
  // A destructuring default only triggers on `undefined`, so callers that want
  // no tag at all (the untagged-wrong fixture) must pass `null` explicitly;
  // `null` is normalized to `undefined` here to match the real option shape.
  const resolvedActionWrongTag = actionWrongTag === null ? undefined : actionWrongTag;
  const resolvedReasonWrongTag = reasonWrongTag === null ? undefined : reasonWrongTag;
  return {
    id,
    skillId,
    learnerEligibility,
    kind: "decision",
    sourceRefs: [],
    assumptions: [],
    cueRu: "",
    cueEn: "",
    questionRu: "",
    questionEn: "",
    actionOptions: [
      { id: "a", textRu: "correct", textEn: "correct", misconception: actionCorrectTag },
      { id: "b", textRu: "wrong", textEn: "wrong", misconception: resolvedActionWrongTag },
    ],
    reasonOptions: [
      { id: "r1", textRu: "correct", textEn: "correct" },
      { id: "r2", textRu: "wrong", textEn: "wrong", misconception: resolvedReasonWrongTag },
    ],
    correctActionId: "a",
    correctReasonId: "r1",
    explanationRu: "",
    explanationEn: "",
    targetSeconds: 20,
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

test("existing Study Loop consumes canonical rows directly and keeps generic repair separately", () => {
  assert.match(studyLoopSource, /currentPracticalMistakes\(mastery\)/);
  assert.match(studyLoopSource, /canonicalMistakeRows\.slice\(0, 3\)/);
  assert.match(studyLoopSource, /practicalRepairQueue\(mastery\)/);
  assert.doesNotMatch(studyLoopSource, /const leakRows/);
  assert.doesNotMatch(studyLoopSource, /canonicalMistakeRows[\s\S]{0,120}\.sort\(/);
});

test("Feature A uses latest attempt per decision and only actually-wrong tagged dimensions", () => {
  const decision = syntheticDecision({ id: "FEATURE-A-SYN-1", actionCorrectTag: "CORRECT_DIMENSION_TAG" });
  withSyntheticDecisions([decision], () => {
    const state = createPracticalMasteryState(new Date("2026-09-01T00:00:00.000Z"));
    state.attempts = [
      attempt({ id: "1", decisionId: decision.id, skillId: decision.skillId, actionId: "a", reasonId: "r2" }),
    ];

    assert.deepEqual(selectedWrongPracticalMisconceptionIds(state.attempts[0]), ["M_REASON"]);
    assert.deepEqual(currentPracticalMistakes(state).map((row) => row.misconceptionId), ["M_REASON"]);

    state.attempts.push(attempt({
      id: "2",
      decisionId: decision.id,
      skillId: decision.skillId,
      actionId: "a",
      reasonId: "r1",
      correct: true,
      answeredAt: "2026-09-01T00:01:00.000Z",
    }));
    assert.equal(latestAttemptsByDecision(state).get(decision.id)?.id, "2");
    assert.deepEqual(currentPracticalMistakes(state), []);
  });
});

test("current shipped PRICE_ONLY action+reason duplicate contributes exactly once", () => {
  const decision = practicalDecisionById.get("PM-BL-01-102");
  assert.ok(decision, "current BL-01 corpus fixture must exist");
  assert.equal(decision.actionOptions.find((option) => option.id === "b")?.misconception, "PRICE_ONLY");
  assert.equal(decision.reasonOptions.find((option) => option.id === "r3")?.misconception, "PRICE_ONLY");

  const state = createPracticalMasteryState(new Date("2026-09-01T00:00:00.000Z"));
  state.attempts = [attempt({
    id: "dup-1",
    decisionId: decision.id,
    skillId: decision.skillId,
    actionId: "b",
    reasonId: "r3",
    confidence: 90,
  })];

  assert.deepEqual(selectedWrongPracticalMisconceptionIds(state.attempts[0]), ["PRICE_ONLY"]);
  assert.deepEqual(currentPracticalMistakes(state), [{
    skillId: "BL-01",
    misconceptionId: "PRICE_ONLY",
    unresolvedDecisionIds: ["PM-BL-01-102"],
    evidenceCount: 1,
    highConfidenceEvidenceCount: 1,
    presentationEvidenceScore: 3,
    latestAnsweredAt: "2026-09-01T00:00:00.000Z",
    representativeDecisionId: "PM-BL-01-102",
  }]);

  const integrated = unresolvedMistakeFamilies(state).find((family) => family.key === "PRICE_ONLY");
  assert.deepEqual(integrated, {
    key: "PRICE_ONLY",
    skillId: "BL-01",
    unresolvedDecisionIds: ["PM-BL-01-102"],
    priority: 5,
  });
});

test("one wrong decision may contribute two distinct misconception families but never duplicate one family", () => {
  const decision = syntheticDecision({ id: "FEATURE-A-SYN-2", actionWrongTag: "M1", reasonWrongTag: "M2" });
  withSyntheticDecisions([decision], () => {
    const state = createPracticalMasteryState();
    state.attempts = [attempt({ id: "1", decisionId: decision.id, skillId: decision.skillId, actionId: "b", reasonId: "r2" })];
    assert.deepEqual(selectedWrongPracticalMisconceptionIds(state.attempts[0]), ["M1", "M2"]);
    assert.deepEqual(currentPracticalMistakes(state).map((row) => [row.misconceptionId, row.evidenceCount]), [["M1", 1], ["M2", 1]]);
  });
});

test("family evidence aggregates distinct decisions and latest replacement clears or moves only that decision", () => {
  const d1 = syntheticDecision({ id: "FEATURE-A-AGG-1", actionWrongTag: "SAME", reasonWrongTag: undefined });
  const d2 = syntheticDecision({ id: "FEATURE-A-AGG-2", actionWrongTag: "SAME", reasonWrongTag: undefined });
  withSyntheticDecisions([d1, d2], () => {
    const state = createPracticalMasteryState();
    state.attempts = [
      attempt({ id: "a1", decisionId: d1.id, skillId: d1.skillId, actionId: "b", reasonId: "r1", confidence: 80, answeredAt: "2026-09-01T00:00:00.000Z" }),
      attempt({ id: "a2", decisionId: d2.id, skillId: d2.skillId, actionId: "b", reasonId: "r1", confidence: 40, answeredAt: "2026-09-01T00:01:00.000Z" }),
    ];
    let row = currentPracticalMistakes(state)[0];
    assert.equal(row.evidenceCount, 2);
    assert.equal(row.highConfidenceEvidenceCount, 1);
    assert.equal(row.presentationEvidenceScore, 4);
    assert.deepEqual(row.unresolvedDecisionIds, [d1.id, d2.id]);

    state.attempts.push(attempt({ id: "a3", decisionId: d1.id, skillId: d1.skillId, actionId: "a", reasonId: "r1", correct: true, answeredAt: "2026-09-01T00:02:00.000Z" }));
    row = currentPracticalMistakes(state)[0];
    assert.equal(row.evidenceCount, 1);
    assert.deepEqual(row.unresolvedDecisionIds, [d2.id]);

    state.attempts.push(attempt({ id: "a4", decisionId: d2.id, skillId: d2.skillId, actionId: "a", reasonId: "r1", correct: true, answeredAt: "2026-09-01T00:03:00.000Z" }));
    assert.deepEqual(currentPracticalMistakes(state), []);

    state.attempts.push(attempt({ id: "a5", decisionId: d1.id, skillId: d1.skillId, actionId: "b", reasonId: "r1", answeredAt: "2026-09-01T00:04:00.000Z" }));
    assert.equal(currentPracticalMistakes(state)[0]?.misconceptionId, "SAME");
  });
});

test("latest wrong can replace M1 with M2 and the same tag stays separate across skills", () => {
  const d1 = syntheticDecision({ id: "FEATURE-A-MOVE-1", skillId: "FND-01", actionWrongTag: "M1", reasonWrongTag: "M2" });
  const d2 = syntheticDecision({ id: "FEATURE-A-MOVE-2", skillId: "FND-02", actionWrongTag: "M2", reasonWrongTag: undefined });
  withSyntheticDecisions([d1, d2], () => {
    const state = createPracticalMasteryState();
    state.attempts = [
      attempt({ id: "1", decisionId: d1.id, skillId: "FND-01", actionId: "b", reasonId: "r1" }),
      attempt({ id: "2", decisionId: d1.id, skillId: "FND-01", actionId: "a", reasonId: "r2", answeredAt: "2026-09-01T00:01:00.000Z" }),
      attempt({ id: "3", decisionId: d2.id, skillId: "FND-02", actionId: "b", reasonId: "r1", answeredAt: "2026-09-01T00:02:00.000Z" }),
    ];
    assert.deepEqual(currentPracticalMistakes(state).map((row) => [row.skillId, row.misconceptionId]), [["FND-01", "M2"], ["FND-02", "M2"]]);
  });
});

test("untagged wrong is excluded from Feature A but retained as scheduler-only SKILL fallback", () => {
  const decision = syntheticDecision({ id: "FEATURE-A-UNTAGGED", actionWrongTag: null, reasonWrongTag: null });
  withSyntheticDecisions([decision], () => {
    const state = createPracticalMasteryState();
    state.attempts = [attempt({ id: "1", decisionId: decision.id, skillId: decision.skillId, actionId: "b", reasonId: "r1", confidence: 90 })];
    assert.deepEqual(currentPracticalMistakes(state), []);
    assert.deepEqual(unresolvedMistakeFamilies(state), [{
      key: `SKILL:${decision.skillId}`,
      skillId: decision.skillId,
      unresolvedDecisionIds: [decision.id],
      priority: 5,
    }]);
  });
});

test("corrupt, mismatched, internal, bridge and integration identities fail closed for learner misconception evidence", () => {
  const internal = syntheticDecision({ id: "FEATURE-A-INTERNAL", learnerEligibility: "INTERNAL_ONLY" });
  const bridge = syntheticDecision({ id: "FEATURE-A-BRIDGE", skillId: "OOP-06" });
  const integration = syntheticDecision({ id: "FEATURE-A-INTEGRATION", skillId: "INT-01" });
  const ordinary = syntheticDecision({ id: "FEATURE-A-MISMATCH", skillId: "FND-01" });
  withSyntheticDecisions([internal, bridge, integration, ordinary], () => {
    const state = createPracticalMasteryState();
    state.attempts = [
      attempt({ id: "missing", decisionId: "FEATURE-A-MISSING", skillId: "FND-01", actionId: "b", reasonId: "r2" }),
      attempt({ id: "mismatch", decisionId: ordinary.id, skillId: "FND-02", actionId: "b", reasonId: "r2" }),
      attempt({ id: "bad-option", decisionId: ordinary.id, skillId: "FND-01", actionId: "missing", reasonId: "r1" }),
      attempt({ id: "internal", decisionId: internal.id, skillId: internal.skillId, actionId: "b", reasonId: "r2" }),
      attempt({ id: "bridge", decisionId: bridge.id, skillId: bridge.skillId, actionId: "b", reasonId: "r2" }),
      attempt({ id: "integration", decisionId: integration.id, skillId: integration.skillId, actionId: "b", reasonId: "r2" }),
    ];
    assert.deepEqual(currentPracticalMistakes(state), []);
  });
});

test("canonical order is score DESC then skillId ASC then misconceptionId ASC with no count tie-break", () => {
  const decisions = [
    syntheticDecision({ id: "FEATURE-A-ORDER-B", skillId: "FND-01", actionWrongTag: "B", reasonWrongTag: undefined }),
    syntheticDecision({ id: "FEATURE-A-ORDER-A1", skillId: "FND-01", actionWrongTag: "A", reasonWrongTag: undefined }),
    syntheticDecision({ id: "FEATURE-A-ORDER-A2", skillId: "FND-01", actionWrongTag: "A", reasonWrongTag: undefined }),
    syntheticDecision({ id: "FEATURE-A-ORDER-A3", skillId: "FND-01", actionWrongTag: "A", reasonWrongTag: undefined }),
    syntheticDecision({ id: "FEATURE-A-ORDER-Z1", skillId: "FND-02", actionWrongTag: "Z", reasonWrongTag: undefined }),
    syntheticDecision({ id: "FEATURE-A-ORDER-Z2", skillId: "FND-02", actionWrongTag: "Z", reasonWrongTag: undefined }),
  ];
  withSyntheticDecisions(decisions, () => {
    const state = createPracticalMasteryState();
    state.attempts = [
      attempt({ id: "b", decisionId: decisions[0].id, skillId: "FND-01", actionId: "b", reasonId: "r1", confidence: 90 }),
      attempt({ id: "a1", decisionId: decisions[1].id, skillId: "FND-01", actionId: "b", reasonId: "r1" }),
      attempt({ id: "a2", decisionId: decisions[2].id, skillId: "FND-01", actionId: "b", reasonId: "r1" }),
      attempt({ id: "a3", decisionId: decisions[3].id, skillId: "FND-01", actionId: "b", reasonId: "r1" }),
      attempt({ id: "z1", decisionId: decisions[4].id, skillId: "FND-02", actionId: "b", reasonId: "r1", confidence: 90 }),
      attempt({ id: "z2", decisionId: decisions[5].id, skillId: "FND-02", actionId: "b", reasonId: "r1", confidence: 90 }),
    ];
    const rows = currentPracticalMistakes(state);
    assert.deepEqual(rows.map((row) => [row.skillId, row.misconceptionId, row.presentationEvidenceScore]), [
      ["FND-02", "Z", 6],
      ["FND-01", "A", 3],
      ["FND-01", "B", 3],
    ]);
    assert.equal(rows[1].evidenceCount, 3);
    assert.equal(rows[2].evidenceCount, 1);
    assert.equal(rows[2].highConfidenceEvidenceCount, 1);
  });
});

test("selector is pure and browsing data projection cannot mutate mastery", () => {
  const decision = practicalDecisionById.get("PM-BL-01-102");
  assert.ok(decision);
  const state = createPracticalMasteryState();
  state.attempts = [attempt({ id: "pure", decisionId: decision.id, skillId: decision.skillId, actionId: "b", reasonId: "r3" })];
  const before = structuredClone(state);
  currentPracticalMistakes(state);
  assert.deepEqual(state, before);
});

test("double-submit characterization: one submit path records one attempt and continuity accepts at most one submittedAttemptId", () => {
  const decision = practicalDecisionById.get("PM-BL-01-102");
  assert.ok(decision);
  const profile = createPracticalProfileState(new Date("2026-09-01T00:00:00.000Z"));
  const item = {
    decisionId: decision.id,
    skillId: decision.skillId,
    priority: 125,
    reason: "REPAIR",
    whyAfterAnswer: "repair",
    retentionTierDays: null,
  };
  const started = recordIntegratedRoundStartContinuity(profile.studyWorkspace, profile.mastery.contentVersion, {
    focusSkillId: null,
    items: [item],
  }, new Date("2026-09-01T00:00:01.000Z"));
  assert.ok(started);

  const nextMastery = recordIntegratedDecision(profile.mastery, item, {
    actionId: "b",
    reasonId: "r3",
    confidence: 90,
    now: new Date("2026-09-01T00:00:02.000Z"),
  });
  assert.equal(nextMastery.attempts.length - profile.mastery.attempts.length, 1);
  const submittedAttemptId = nextMastery.attempts.at(-1)?.id;
  assert.ok(submittedAttemptId);

  const answered = recordIntegratedAnswerContinuity(started, nextMastery.contentVersion, {
    focusSkillId: null,
    items: [item],
    answeredIndex: 0,
    attemptId: submittedAttemptId,
  }, new Date("2026-09-01T00:00:03.000Z"));
  assert.ok(answered);
  assert.deepEqual(answered.continuity?.integrated?.submittedAttemptIds, [submittedAttemptId]);

  const duplicate = recordIntegratedAnswerContinuity(answered, nextMastery.contentVersion, {
    focusSkillId: null,
    items: [item],
    answeredIndex: 0,
    attemptId: `${submittedAttemptId}:duplicate`,
  }, new Date("2026-09-01T00:00:04.000Z"));
  assert.equal(duplicate, null);

  assert.equal((integratedUiSource.match(/recordIntegratedDecision\(state, item/g) ?? []).length, 1);
  assert.equal((integratedUiSource.match(/recordIntegratedAnswerContinuity\(studyWorkspace/g) ?? []).length, 1);
});
