import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  allPracticalTableStates,
  practicalDecisionById,
} from "../content/practical-mastery/index.ts";
import { runtimeCorpusAuditLedger } from "../content/practical-mastery/audit-surface.ts";
import {
  auditTableBackedVisibleChangeCoverage,
  authoritativeComparisonBaselineDecisionId,
  decisionHasAuthoritativeVisibleChange,
  visibleComparisonForDecision,
} from "../lib/practical-visible-scenario.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ledger = runtimeCorpusAuditLedger();
const reachableRows = ledger.rows.filter(
  (row) => row.itemKind === "DECISION" && row.reachable,
);
const reachableDecisionIds = reachableRows.map((row) => row.itemId);
const rowByDecisionId = new Map(reachableRows.map((row) => [row.itemId, row]));
const tableIds = new Set(allPracticalTableStates.map((table) => table.decisionId));

function hasExplicitComparisonLanguage(decision) {
  const text = `${decision.questionRu} ${decision.questionEn}`;
  return /(?:how should the marginal branch change|what changed causally|как должен измениться marginal branch|что изменилось причинно|\bsame\b[^?.]{0,120}\bbut\b|(?:тот же|та же|те же)[^?.]{0,120}\bно\b)/iu.test(text);
}

function comparisonSignals(decisionId) {
  const decision = practicalDecisionById.get(decisionId);
  const row = rowByDecisionId.get(decisionId);
  if (!decision || !row || !tableIds.has(decisionId)) return [];
  const signals = [];
  if (decision.kind === "changed") signals.push("kind=changed");
  if (decision.changedVariables?.length) signals.push("changedVariables");
  if (hasExplicitComparisonLanguage(decision)) signals.push("comparison-language");
  if (row.transferMarker) signals.push("table-transfer/change");
  return signals;
}

const signaledTableDecisionIds = reachableDecisionIds.filter(
  (decisionId) => comparisonSignals(decisionId).length > 0,
);
const coverage = auditTableBackedVisibleChangeCoverage(reachableDecisionIds);

test("corpus-wide reachable scored table changes all have authoritative visible Before/Now", () => {
  assert.equal(ledger.invariantErrors.length, 0);
  assert.equal(signaledTableDecisionIds.length, 21);
  assert.deepEqual(
    coverage.auditedDecisionIds,
    signaledTableDecisionIds,
    "structured changed/transfer census must match the visible-comparison audit corpus",
  );
  assert.deepEqual(
    coverage.unsupportedDecisionIds,
    [],
    `unsupported reachable changed-table assessments: ${coverage.unsupportedDecisionIds.join(", ")}`,
  );
});

test("comparison wording is diagnostic only and never substitutes for structured change metadata", () => {
  const languageOnly = signaledTableDecisionIds.filter((decisionId) => {
    const decision = practicalDecisionById.get(decisionId);
    return decision && hasExplicitComparisonLanguage(decision) &&
      decision.kind !== "changed" && !(decision.changedVariables?.length);
  });
  assert.deepEqual(languageOnly, []);
});

test("PF-01 changed table renders the intended BTN -> HJ and players-behind delta", () => {
  const decisionId = "PM-B3-PF01-103";
  const decision = practicalDecisionById.get(decisionId);
  assert.ok(decision);
  assert.deepEqual(decision.changedVariables, ["position", "players_behind"]);
  assert.equal(
    authoritativeComparisonBaselineDecisionId(decisionId),
    "PM-B3-PF01-101",
  );

  const comparison = visibleComparisonForDecision(decisionId);
  assert.ok(comparison);
  assert.equal(comparison.before.hero, "BTN");
  assert.equal(comparison.current.hero, "HJ");
  assert.deepEqual(comparison.before.actions, ["Folds to BTN"]);
  assert.deepEqual(comparison.current.actions, ["Folds to HJ"]);
  assert.deepEqual(
    comparison.before.seats
      .filter((seat) => seat.status === "active")
      .map((seat) => seat.position),
    ["SB", "BB"],
  );
  assert.deepEqual(
    comparison.current.seats
      .filter((seat) => seat.status === "active")
      .map((seat) => seat.position),
    ["CO", "BTN", "SB", "BB"],
  );
});

test("authoritative baseline identity survives isolation and presentation reordering", () => {
  const decisionId = "PM-B3-PF01-103";
  const pair = allPracticalTableStates
    .filter((table) =>
      ["PM-B3-PF01-101", "PM-B3-PF01-103"].includes(table.decisionId),
    )
    .reverse();

  const isolated = visibleComparisonForDecision(decisionId, pair);
  assert.ok(isolated);
  assert.equal(isolated.before.decisionId, "PM-B3-PF01-101");
  assert.equal(isolated.current.decisionId, "PM-B3-PF01-103");

  const currentOnly = pair.filter((table) => table.decisionId === decisionId);
  assert.equal(visibleComparisonForDecision(decisionId, currentOnly), null);
  assert.equal(decisionHasAuthoritativeVisibleChange(decisionId, currentOnly), false);
});

test("representative PM-PERC comparison and its anti-leakage baseline override remain intact", () => {
  assert.equal(
    authoritativeComparisonBaselineDecisionId("PM-PERC-RIV03-2"),
    "PM-PERC-RIV03-1",
  );
  const river = visibleComparisonForDecision("PM-PERC-RIV03-2");
  assert.ok(river);
  assert.equal(river.before.decisionId, "PM-PERC-RIV03-1");
  assert.equal(river.current.decisionId, "PM-PERC-RIV03-2");

  const blind = visibleComparisonForDecision("PM-PERC-BL04-2");
  assert.ok(blind);
  assert.equal(blind.before.potBb, 3.5);
  assert.deepEqual(blind.before.actions, ["CO opens 2.5bb"]);
  assert.deepEqual(blind.current.actions, ["CO opens 4bb"]);
});

test("table renderer keeps reveal/answer cues outside the pre-commitment snapshots", async () => {
  const source = await readFile(
    path.join(root, "components/PracticalTableStateStimulus.tsx"),
    "utf8",
  );
  const snapshot = source.slice(
    source.indexOf("function TableSnapshot"),
    source.indexOf("function Seat"),
  );
  assert.match(source, /visibleComparisonForDecision\(state\.decisionId\)/);
  assert.doesNotMatch(snapshot, /revealCueRu|revealCueEn/);
});
