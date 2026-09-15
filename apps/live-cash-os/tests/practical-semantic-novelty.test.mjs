import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  practicalDecisionById,
  practicalDecisions,
  practicalSkillById,
} from "../content/practical-mastery/index.ts";
import { buildAdaptiveIntegratedSession } from "../lib/practical-adaptive-session.ts";
import {
  createPracticalMasteryState,
  markPracticalConceptTaught,
  recordPracticalDecision,
} from "../lib/practical-mastery-core.ts";
import { nextFirstJourneyDecision } from "../lib/practical-first-journey.ts";
import {
  recordIntegratedDecision,
} from "../lib/practical-integrated-session.ts";
import {
  practicalScenarioFamilyId,
  practicalStimulusFamilyId,
} from "../lib/practical-stimulus-identity.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function correctInput(decision, now) {
  return {
    actionId: decision.correctActionId,
    reasonId: decision.correctReasonId,
    confidence: 70,
    now,
  };
}

test("exact same learner-facing cues collapse to one stimulus family", () => {
  const groups = new Map();
  for (const decision of practicalDecisions) {
    const key = `${decision.skillId}::${decision.cueEn.trim().toLowerCase()}`;
    const rows = groups.get(key) ?? [];
    rows.push(decision);
    groups.set(key, rows);
  }
  const duplicates = [...groups.values()].filter((rows) => rows.length > 1);
  assert.ok(duplicates.length >= 35, `expected broad same-cue corpus coverage, got ${duplicates.length}`);
  for (const rows of duplicates) {
    assert.equal(
      new Set(rows.map(practicalStimulusFamilyId)).size,
      1,
      `same cue received multiple stimulus identities: ${rows.map((row) => row.id).join(", ")}`,
    );
  }
});

test("template-heavy generated siblings expose one scenario-family authority", () => {
  const templated = practicalDecisions.filter((decision) => /-(?:A8|A9|A10|B1|B3|B4)-\d+$/u.test(decision.id));
  const byPrefix = new Map();
  for (const decision of templated) {
    const prefix = decision.id.replace(/-\d+$/u, "");
    const rows = byPrefix.get(prefix) ?? [];
    rows.push(decision);
    byPrefix.set(prefix, rows);
  }
  assert.ok(byPrefix.size >= 31, `expected at least 31 generated scenario families, got ${byPrefix.size}`);
  for (const rows of byPrefix.values()) {
    assert.equal(new Set(rows.map(practicalScenarioFamilyId)).size, 1);
  }
});

test("focused rounds do not pad with duplicate stimuli or more than two siblings of one generated scenario", () => {
  const templateSkillIds = [...new Set(
    practicalDecisions
      .filter((decision) => /-(?:A8|A9|A10|B1|B3|B4)-\d+$/u.test(decision.id))
      .map((decision) => decision.skillId),
  )];

  let tested = 0;
  for (const skillId of templateSkillIds) {
    let state = createPracticalMasteryState(new Date("2026-09-01T00:00:00Z"));
    state = markPracticalConceptTaught(state, skillId, new Date("2026-09-01T00:00:01Z"));
    const items = buildAdaptiveIntegratedSession(state, new Date("2026-09-01T00:01:00Z"), 8, [], skillId);
    if (!items.length) continue;
    tested += 1;

    const decisions = items.map((item) => practicalDecisionById.get(item.decisionId)).filter(Boolean);
    assert.equal(new Set(decisions.map(practicalStimulusFamilyId)).size, decisions.length, `${skillId}: duplicate stimulus family in one focused round`);

    const scenarioCounts = new Map();
    for (const decision of decisions) {
      const family = practicalScenarioFamilyId(decision);
      scenarioCounts.set(family, (scenarioCounts.get(family) ?? 0) + 1);
    }
    assert.ok(Math.max(...scenarioCounts.values()) <= 2, `${skillId}: focused round overfilled one scenario family`);
  }

  assert.ok(tested >= 15, `expected broad focused-family coverage, got ${tested}`);
});

test("recent semantic family is not resurfaced through a sibling decision id", () => {
  const pair = (() => {
    const grouped = new Map();
    for (const decision of practicalDecisions) {
      const key = practicalStimulusFamilyId(decision);
      const rows = grouped.get(key) ?? [];
      rows.push(decision);
      grouped.set(key, rows);
    }
    return [...grouped.values()].find((rows) => rows.length >= 2 && rows.some((row) => row.kind === "recognition") && rows.some((row) => row.kind === "decision"));
  })();
  assert.ok(pair, "need a same-stimulus recognition/decision fixture");
  const first = pair[0];

  let state = createPracticalMasteryState(new Date("2026-09-01T00:00:00Z"));
  state = markPracticalConceptTaught(state, first.skillId, new Date("2026-09-01T00:00:01Z"));
  state = recordPracticalDecision(state, { decisionId: first.id, ...correctInput(first, new Date("2026-09-01T00:01:00Z")) });

  const round = buildAdaptiveIntegratedSession(state, new Date("2026-09-01T00:02:00Z"), 8, [], first.skillId);
  assert.ok(round.every((item) => {
    const decision = practicalDecisionById.get(item.decisionId);
    return decision && practicalStimulusFamilyId(decision) !== practicalStimulusFamilyId(first);
  }), "a recently seen cue must not return under a sibling id");
});

test("retention credit requires semantic novelty, not only a different decision id", () => {
  const grouped = new Map();
  for (const decision of practicalDecisions) {
    const key = practicalStimulusFamilyId(decision);
    const rows = grouped.get(key) ?? [];
    rows.push(decision);
    grouped.set(key, rows);
  }
  const pair = [...grouped.values()].find((rows) => rows.length >= 2);
  assert.ok(pair, "need same-family decisions");
  const [first, sibling] = pair;
  assert.equal(first.skillId, sibling.skillId);

  let state = createPracticalMasteryState(new Date("2026-08-01T00:00:00Z"));
  state = markPracticalConceptTaught(state, first.skillId, new Date("2026-08-01T00:00:01Z"));
  state = recordPracticalDecision(state, { decisionId: first.id, ...correctInput(first, new Date("2026-08-01T00:01:00Z")) });
  state.skills[first.skillId].evidenceStage = "BOUNDARY_TESTED";

  const next = recordIntegratedDecision(state, {
    decisionId: sibling.id,
    skillId: sibling.skillId,
    priority: 100,
    reason: "RETENTION",
    whyAfterAnswer: "semantic-novelty test",
    retentionTierDays: 1,
  }, correctInput(sibling, new Date("2026-08-03T00:01:00Z")));

  assert.deepEqual(next.skills[first.skillId].retentionDaysPassed, [], "same stimulus family must not earn delayed-retention credit");
});

test("Quick Start excludes the leaked FND-01 copy and stays in practice between same-skill reps", async () => {
  let state = createPracticalMasteryState(new Date("2026-09-01T00:00:00Z"));
  state = markPracticalConceptTaught(state, "FND-01", new Date("2026-09-01T00:00:01Z"));
  const next = nextFirstJourneyDecision(state, "FND-01");
  assert.ok(next);
  assert.notEqual(next.id, "PM-FND-01-001");

  const ui = await readFile(path.join(root, "components/PracticalFirstJourneyExperience.tsx"), "utf8");
  const advanceStart = ui.indexOf("const advanceDecision");
  const advanceEnd = ui.indexOf("if (!ready)", advanceStart);
  const advance = ui.slice(advanceStart, advanceEnd);
  assert.doesNotMatch(advance, /setPracticeStarted\(false\)/);
  assert.match(ui, /ЗНАКОМЫЙ МЕХАНИЗМ · НОВОЕ ПРИМЕНЕНИЕ/);
});

test("overlapping child skills are explicitly transfer-scoped rather than duplicate baseline lessons", () => {
  const pf05 = practicalSkillById.get("PF-05");
  const bl05 = practicalSkillById.get("BL-05");
  const pf02 = practicalSkillById.get("PF-02");
  const mw04 = practicalSkillById.get("MW-04");
  assert.ok(pf05 && bl05 && pf02 && mw04);

  assert.notEqual(bl05.titleEn, pf05.titleEn);
  assert.match(bl05.titleEn, /exceptions/i);
  assert.equal(bl05.targetEvidenceStage, "CHANGED_NODE_TRANSFER");
  assert.match(bl05.objectiveEn, /After PF-05/i);

  assert.notEqual(mw04.titleEn, pf02.titleEn);
  assert.match(mw04.titleEn, /transfer/i);
  assert.equal(mw04.targetEvidenceStage, "CHANGED_NODE_TRANSFER");
  assert.match(mw04.objectiveEn, /Transfer PF-02/i);

  const blTransfer = practicalDecisionById.get("PM-BL-05-101");
  const mwTransfer = practicalDecisionById.get("PM-MW-04-001");
  assert.match(blTransfer?.explanationEn ?? "", /not a repeat of baseline PF-05/i);
  assert.match(mwTransfer?.explanationEn ?? "", /no longer reteaches the baseline PF-02/i);
});
