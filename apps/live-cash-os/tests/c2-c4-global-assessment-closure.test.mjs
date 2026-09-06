import assert from "node:assert/strict";
import test from "node:test";
import { practicalDecisions } from "../content/practical-mastery/index.ts";
import { runtimeCorpusAuditLedger } from "../content/practical-mastery/audit-surface.ts";

const byId = new Map(practicalDecisions.map((decision) => [decision.id, decision]));

const expected = new Map([
  ["PM-BL-03-103", { action: "b", reason: "r1" }],
  ["PM-BL-04-104", { action: "a", reason: "r1" }],
  ["PM-BL-05-105", { action: "a", reason: "r1" }],
]);

test("C2-C4 closure preserves scoring identity while repairing polarity and misconception parity", () => {
  for (const [id, keys] of expected) {
    const decision = byId.get(id);
    assert.ok(decision, `${id}: missing decision`);
    assert.equal(decision.correctActionId, keys.action, `${id}: action identity drift`);
    assert.equal(decision.correctReasonId, keys.reason, `${id}: reason identity drift`);

    const wrongActions = decision.actionOptions.filter((option) => option.id !== decision.correctActionId);
    const wrongReasons = decision.reasonOptions.filter((option) => option.id !== decision.correctReasonId);
    for (const option of [...wrongActions, ...wrongReasons]) {
      assert.ok(option.misconception, `${id}/${option.id}: missing plausible misconception identity`);
    }
  }

  assert.doesNotMatch(byId.get("PM-BL-03-103").questionRu, /ошибк/iu);
  assert.doesNotMatch(byId.get("PM-BL-03-103").questionEn, /error/iu);
  assert.match(byId.get("PM-BL-04-104").actionOptions.find((option) => option.id === "a").textRu, /цену колла/iu);
  assert.match(byId.get("PM-BL-05-105").actionOptions.find((option) => option.id === "a").textEn, /called-branch EV/iu);
});

test("generated runtime audit is clean after classifying boundary/mixed rows separately from changed-node metadata", () => {
  const ledger = runtimeCorpusAuditLedger();
  assert.equal(ledger.counts.skills, 86);
  assert.equal(ledger.counts.stimuli, 926);
  assert.equal(ledger.counts.partialSourceSkills, 1);
  assert.equal(ledger.counts.errorItems, 0);
  assert.equal(ledger.counts.reviewItems, 0);
  assert.equal(ledger.invariantErrors.length, 0);

  for (const row of ledger.rows) {
    if (row.decisionKind === "changed") {
      assert.equal(row.reviewSignals.missingChangedVariables, false, `${row.itemId}: changed-node metadata missing`);
    }
  }
});
