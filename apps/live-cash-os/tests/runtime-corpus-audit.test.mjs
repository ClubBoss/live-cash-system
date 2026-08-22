import assert from "node:assert/strict";
import test from "node:test";
import {
  assertRuntimeCorpusAuditInvariants,
  runtimeCorpusAuditLedger,
} from "../content/practical-mastery/audit-surface.ts";
import {
  practicalAnchors,
  practicalDecisions,
  practicalSkillFamilies,
} from "../content/practical-mastery/index.ts";

test("runtime corpus audit surface automatically covers every canonical Practical Mastery stimulus", () => {
  const ledger = runtimeCorpusAuditLedger();
  assertRuntimeCorpusAuditInvariants(ledger);

  assert.equal(ledger.schema, "LIVE_CASH_RUNTIME_CORPUS_AUDIT_V1");
  assert.equal(ledger.generatedFrom, "practicalSkillFamilies+practicalAnchors+practicalDecisions");
  assert.equal(ledger.counts.skills, practicalSkillFamilies.length);
  assert.equal(ledger.counts.anchors, practicalAnchors.length);
  assert.equal(ledger.counts.decisions, practicalDecisions.length);
  assert.equal(ledger.counts.stimuli, practicalAnchors.length + practicalDecisions.length);
  assert.equal(ledger.rows.length, ledger.counts.stimuli);
  assert.deepEqual(
    ledger.rows.map((row) => row.itemId),
    [...practicalAnchors.map((anchor) => anchor.id), ...practicalDecisions.map((decision) => decision.id)],
    "audit order must stay deterministic and derive from the runtime aggregation order",
  );
});

test("runtime corpus audit keeps source ceilings, reachability, bilingual text and answer-key structure inspectable", () => {
  const ledger = runtimeCorpusAuditLedger();
  assert.equal(ledger.invariantErrors.length, 0);
  assert.ok(ledger.skills.every((skill) => skill.reachable));
  assert.ok(ledger.rows.every((row) => row.reachable));
  assert.ok(ledger.rows.every((row) => row.sourceRefs.length > 0));
  assert.ok(ledger.rows.every((row) => row.cueRu.trim() && row.cueEn.trim()));
  assert.ok(ledger.rows.every((row) => row.explanationRu.trim() && row.explanationEn.trim()));

  const bl11Skills = ledger.skills.filter((skill) => skill.skillId === "BL-11");
  assert.equal(bl11Skills.length, 1);
  assert.equal(bl11Skills[0].sourceStatus, "PARTIAL");
  assert.ok(bl11Skills[0].sourceCeiling);

  for (const row of ledger.rows.filter((row) => row.itemKind === "DECISION")) {
    assert.ok(row.actionOptions.length >= 2, `${row.itemId}: action options are not auditable`);
    assert.ok(row.reasonOptions.length >= 2, `${row.itemId}: reason options are not auditable`);
    assert.ok(row.actionOptions.some((option) => option.correct), `${row.itemId}: correct action missing`);
    assert.ok(row.reasonOptions.some((option) => option.correct), `${row.itemId}: correct reason missing`);
  }
});

test("runtime corpus audit serialization is deterministic for identical runtime truth", () => {
  const first = JSON.stringify(runtimeCorpusAuditLedger());
  const second = JSON.stringify(runtimeCorpusAuditLedger());
  assert.equal(first, second);
});
