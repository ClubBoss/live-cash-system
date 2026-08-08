import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import ts from "typescript";

async function loadTs(relativePath) {
  const source = await readFile(new URL(`../${relativePath}`, import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove,
    },
  }).outputText;
  const directory = await mkdtemp(join(tmpdir(), "live-cash-os-test-g3-"));
  const output = join(directory, `${relativePath.replaceAll("/", "-").replace(/\.ts$/u, "")}.mjs`);
  await writeFile(output, compiled, "utf8");
  return import(`${new URL(`file://${output}`).href}?${Date.now()}-${Math.random()}`);
}

const wave7Promise = loadTs("lib/wave7.ts");
const modelPromise = loadTs("lib/model-core.ts");

function hand(overrides = {}) {
  return {
    moduleId: "geometry",
    stakes: "2/5",
    heroPosition: "BB",
    villainPositions: "BTN",
    effectiveStacks: "150bb",
    straddle: "no straddle",
    actionSequence: "BTN opens 3bb, BB calls; flop checks to BTN",
    board: "Qh 7d 4c",
    sizings: "flop 25%",
    cue: "BTN uses a small wide flop bet",
    action: "Call",
    reason: "Keep weaker hands in and protect the calling range before changing the node.",
    confidence: 72,
    ...overrides,
  };
}

function extractFunction(source, name) {
  const sourceFile = ts.createSourceFile(
    "LiveCashAppCore.tsx",
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const declaration = sourceFile.statements.find(
    (statement) => ts.isFunctionDeclaration(statement) && statement.name?.text === name,
  );
  assert.ok(declaration, `${name} must remain exported for contract testing`);
  return source.slice(declaration.getStart(sourceFile), declaration.end);
}

async function loadReviewSelectors() {
  const source = await readFile(new URL("../components/LiveCashAppCore.tsx", import.meta.url), "utf8");
  const selectRepair = extractFunction(source, "selectRepair");
  const selectReview = extractFunction(source, "selectReview");
  const harness = `
let TEST_DUE = [];
export function setDue(items) { TEST_DUE = items; }
const dueReviewItems = () => TEST_DUE;
const moduleById = { geometry: { drills: [
  { id: "geo-source", moduleId: "geometry", nodeKey: "source", variantGroup: "family", kind: "standard" },
  { id: "geo-changed", moduleId: "geometry", nodeKey: "changed", variantGroup: "family", kind: "changed" },
] } };
const drillById = { "geo-changed": moduleById.geometry.drills[1] };
const getRuntimeRepairRule = () => null;
const SCHEDULER_CATALOG = {};
const selectRetentionDrillId = () => "geo-changed";
${selectRepair}
${selectReview}
`;
  const compiled = ts.transpileModule(harness, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const directory = await mkdtemp(join(tmpdir(), "live-cash-os-test-g3-selectors-"));
  const output = join(directory, "selectors.mjs");
  await writeFile(output, compiled, "utf8");
  return import(`${new URL(`file://${output}`).href}?${Date.now()}-${Math.random()}`);
}

test("HUMAN_ASSISTED review can record one legitimate field support and persists reviewer kind", async () => {
  const wave7 = await wave7Promise;
  const model = await modelPromise;
  let state = wave7.captureFieldHand(model.emptyLearnerState(), hand());
  const noteId = state.fieldNotes[0].id;

  state = wave7.reviewFieldHand(
    state,
    noteId,
    "SUPPORTS_TRANSFER",
    "A separate human-assisted review confirmed the locked cue, action, and reason fit the mechanism.",
    "HUMAN_ASSISTED",
  );

  assert.equal(state.fieldNotes[0].reviewerKind, "HUMAN_ASSISTED");
  assert.equal(state.fieldNotes[0].reviewOutcome, "SUPPORTS_TRANSFER");
  assert.equal(state.modules.geometry.evidence.field_transfer.exposures, 1);
  assert.equal(state.modules.geometry.evidence.field_transfer.successes, 1);
  assert.deepEqual(state.modules.geometry.evidence.field_transfer.distinctNodes, [`field:${noteId}`]);
  assert.notEqual(state.modules.geometry.state, "FIELD_VALIDATED");

  const repeated = wave7.reviewFieldHand(
    state,
    noteId,
    "SUPPORTS_TRANSFER",
    "A duplicate submission must not add evidence again.",
    "HUMAN_ASSISTED",
  );
  assert.equal(repeated.modules.geometry.evidence.field_transfer.exposures, 1);
  assert.equal(repeated.modules.geometry.evidence.field_transfer.successes, 1);
});

test("SUPPORTS_TRANSFER fails closed without a locked pre-result decision even for HUMAN_ASSISTED", async () => {
  const wave7 = await wave7Promise;
  const model = await modelPromise;
  const captured = wave7.captureFieldHand(model.emptyLearnerState(), hand());
  const legacy = structuredClone(captured);
  delete legacy.fieldNotes[0].decisionLockedAt;
  const noteId = legacy.fieldNotes[0].id;

  const reviewed = wave7.reviewFieldHand(
    legacy,
    noteId,
    "SUPPORTS_TRANSFER",
    "A human-assisted review occurred, but this legacy record has no pre-result lock.",
    "HUMAN_ASSISTED",
  );

  assert.equal(reviewed.fieldNotes[0].reviewerKind, "HUMAN_ASSISTED");
  assert.equal(reviewed.fieldNotes[0].reviewOutcome, "REVIEWED_OK");
  assert.equal(reviewed.modules.geometry.evidence.field_transfer.exposures, 0);
  assert.equal(reviewed.modules.geometry.evidence.field_transfer.successes, 0);
});

test("SELF remains unable to award SUPPORTS_TRANSFER", async () => {
  const wave7 = await wave7Promise;
  const model = await modelPromise;
  const captured = wave7.captureFieldHand(model.emptyLearnerState(), hand());
  const noteId = captured.fieldNotes[0].id;
  const reviewed = wave7.reviewFieldHand(captured, noteId, "SUPPORTS_TRANSFER", "Self review only.", "SELF");

  assert.equal(reviewed.fieldNotes[0].reviewerKind, "SELF");
  assert.equal(reviewed.fieldNotes[0].reviewOutcome, "REVIEWED_OK");
  assert.equal(reviewed.modules.geometry.evidence.field_transfer.exposures, 0);
  assert.notEqual(reviewed.modules.geometry.state, "FIELD_VALIDATED");
});

test("field validation still requires the existing retention and variant contract", async () => {
  const wave7 = await wave7Promise;
  const model = await modelPromise;
  let state = model.emptyLearnerState();
  state.modules.geometry.contentCompleted = true;
  state = wave7.captureFieldHand(state, hand({ cue: "first independent support" }));
  state = wave7.reviewFieldHand(state, state.fieldNotes[0].id, "SUPPORTS_TRANSFER", "First separate review.", "HUMAN");
  state = wave7.captureFieldHand(state, hand({ cue: "second independent support", board: "8s 7s 6d" }));
  state = wave7.reviewFieldHand(state, state.fieldNotes[1].id, "SUPPORTS_TRANSFER", "Second separate assisted review.", "HUMAN_ASSISTED");

  assert.equal(state.modules.geometry.evidence.field_transfer.successes, 2);
  assert.equal(state.modules.geometry.evidence.retention.successes, 0);
  assert.equal(state.modules.geometry.evidence.variant_transfer.successes, 0);
  assert.notEqual(state.modules.geometry.state, "FIELD_VALIDATED");
});

test("stale explicit retention id fails closed while no-id selection may use first due retention", async () => {
  const selectors = await loadReviewSelectors();
  selectors.setDue([{
    id: "ret-live",
    moduleId: "geometry",
    sourceDrillId: "geo-source",
    variantGroup: "family",
    kind: "retention",
    dueAt: "2026-08-08T00:00:00.000Z",
    attempts: 0,
  }]);
  const state = { revision: 10 };

  assert.deepEqual(selectors.selectReview(state, "ret-stale"), { drills: [] });
  const fallback = selectors.selectReview(state);
  assert.equal(fallback.sourceReviewId, "ret-live");
  assert.equal(fallback.drills[0].id, "geo-changed");
});

test("stale explicit repair id fails closed while no-id selection may use first due repair", async () => {
  const selectors = await loadReviewSelectors();
  selectors.setDue([{
    id: "repair-live",
    moduleId: "geometry",
    sourceDrillId: "geo-source",
    variantGroup: "family",
    kind: "repair",
    dueAt: "2026-08-08T00:00:00.000Z",
    attempts: 0,
  }]);
  const state = { revision: 10 };

  assert.deepEqual(selectors.selectRepair(state, "geometry", "repair-stale"), { drills: [] });
  const fallback = selectors.selectRepair(state, "geometry");
  assert.equal(fallback.sourceReviewId, "repair-live");
  assert.equal(fallback.drills.length, 1);
});
