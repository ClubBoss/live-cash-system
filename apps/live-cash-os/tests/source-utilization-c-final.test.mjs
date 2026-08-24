import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const decisions = await readFile(path.join(root, "content/practical-mastery/decisions-source-utilization-c0.ts"), "utf8");
const index = await readFile(path.join(root, "content/practical-mastery/index.ts"), "utf8");
const authority = await readFile(path.join(root, "content/practical-mastery/source-authority.ts"), "utf8");
const studyModel = await readFile(path.join(root, "content/practical-mastery/study-loop-c1.ts"), "utf8");
const studyUi = await readFile(path.join(root, "components/PracticalStudyLoopExperience.tsx"), "utf8");
const referenceModel = await readFile(path.join(root, "content/practical-mastery/reference-baselines-c2.ts"), "utf8");
const referenceUi = await readFile(path.join(root, "components/PracticalReferenceExperience.tsx"), "utf8");
const masteryNav = await readFile(path.join(root, "components/PracticalMasteryNav.tsx"), "utf8");
const studyPage = await readFile(path.join(root, "app/mastery/study/page.tsx"), "utf8");
const referencePage = await readFile(path.join(root, "app/mastery/reference/page.tsx"), "utf8");
const reconciliation = await readFile(path.join(root, "../../analysis/SOURCE_UTILIZATION_RECONCILIATION_C0_V1.md"), "utf8");
const gaps = await readFile(path.join(root, "content/practical-mastery/source-gaps.ts"), "utf8");
const core = await readFile(path.join(root, "lib/practical-mastery-core.ts"), "utf8");

test("C0 materializes the unique Cash Injection E05 mechanism with a full evidence ladder", () => {
  assert.match(index, /sourceUtilizationC0Decisions/);
  const ids = decisions.match(/PM-RIV-03-C0-20[1-8]/g) ?? [];
  assert.equal(new Set(ids).size, 8);
  for (const kind of ["recognition", "decision", "changed", "boundary"]) assert.match(decisions, new RegExp(`kind: \\"${kind}\\"`));
  assert.match(decisions, /CINJ-E05/);
  assert.match(decisions, /preflop_origin_width/);
  assert.match(decisions, /later_street_filtering/);
});

test("C0 keeps origin width directional and field-gated rather than inventing population truth", () => {
  assert.match(decisions, /population magnitude remains field-gated/);
  assert.match(decisions, /wide origin is only a prior/i);
  assert.match(decisions, /later filtering can override/i);
  assert.doesNotMatch(decisions, /\b\d{1,2}(?:\.\d+)?%\b/);
});

test("pedagogy and reference sources resolve without gaining strategy-answer authority", () => {
  assert.match(authority, /SUPPORTING_SOURCE/);
  assert.match(authority, /REFERENCE_SOURCE/);
  assert.match(authority, /supporting\("FTGU-E30"/);
  assert.match(authority, /supporting\("SLC-M07-L63"/);
  assert.match(authority, /reference\("SLC-PREFLOP-CHART-INDEX"/);
  assert.match(authority, /authority\.kind === "CANONICAL_SOURCE" \|\| authority\.kind === "SOURCE_GROUP_ALIAS"/);
  assert.doesNotMatch(authority, /canonical\("FTGU-E30"/);
  assert.doesNotMatch(authority, /canonical\("SLC-M07-L63"/);
  assert.doesNotMatch(authority, /canonical\("SLC-PREFLOP-CHART-INDEX"/);
});

test("C1 is a player-development loop, not a second mastery system", () => {
  for (const stage of ["FOCUS", "PLAY_CAPTURE", "CAUSAL_REVIEW", "COMPRESS", "TRANSFER_TEST", "DELAYED_RETEST"]) assert.match(studyModel, new RegExp(`\\"${stage}\\"`));
  assert.match(studyModel, /FTGU-E30/);
  assert.match(studyModel, /SLC-M07-L63/);
  assert.match(studyModel, /A written rule is a study artifact, not proof/);
  assert.match(studyUi, /usePracticalProfileState/);
  assert.match(studyUi, /practicalRepairQueue/);
  assert.match(studyUi, /recommendNextPracticalSkill/);
  assert.match(studyUi, /high-confidence wrong/i);
  assert.doesNotMatch(studyUi, /markPracticalConceptTaught|recordPracticalDecision/);
});

test("C1 performance layer stays bounded and does not claim psychological authority", () => {
  for (const token of ["AUTOPILOT", "RESULT_ORIENTATION", "OVERLOAD"]) assert.match(studyModel, new RegExp(token));
  assert.match(studyUi, /not psychological diagnosis/i);
  assert.doesNotMatch(studyModel, /stop-loss|breathing exercise|sleep prescription|tilt diagnosis/i);
});

test("C2 exposes a small reference layer and preserves exact visual authority boundary", () => {
  assert.match(referenceModel, /REF-PF-RAKE/);
  assert.match(referenceModel, /REF-PF-ANTE/);
  assert.match(referenceModel, /REF-PF-DEPTH/);
  assert.match(referenceModel, /REF-PF-STRADDLE/);
  assert.match(referenceModel, /REF-PF-PLAYERS-BEHIND/);
  assert.match(referenceModel, /REF-PF-REACH/);
  assert.match(referenceModel, /REF-PF-SQUEEZE-PACK/);
  assert.match(referenceModel, /EXACT_VISUAL_AUTHORITY_PENDING/);
  assert.match(referenceUi, /Форма диапазона подтверждена/);
  assert.match(referenceUi, /Точные частоты ещё не проверены/);
  assert.match(referenceUi, /Exact frequencies not yet verified/);
  assert.doesNotMatch(referenceUi, /item\.sourceRefs|>\s*C2\s*</i);
  assert.doesNotMatch(referenceUi, /A5s\s*=\s*\d+(?:[.,]\d+)?%/i);
});

test("C1/C2 routes are discoverable from the canonical shared mastery navigation", () => {
  assert.match(masteryNav, /href=\{item\.href\}/, "shared mastery navigation must render its declared route inventory");
  assert.match(masteryNav, /href: "\/mastery\/study"/);
  assert.match(masteryNav, /href: "\/mastery\/reference"/);
  assert.match(studyPage, /PracticalStudyLoopExperience/);
  assert.match(referencePage, /PracticalReferenceExperience/);
});

test("cross-corpus reconciliation covers all admitted source families and keeps BL-11 explicit", () => {
  for (const corpus of ["FTGU 30/30", "Carrot Poker Grades 1–3", "Cash Injection 10/10", "Smash Live Cash"]) assert.match(reconciliation, new RegExp(corpus.replace(/[–]/g, "."), "i"));
  assert.match(reconciliation, /CINJ-E05[\s\S]*repaired/i);
  assert.match(reconciliation, /BL-11[\s\S]*SOURCE_ACCESS_REQUIRED/i);
  assert.match(gaps, /skillId: "BL-11"[\s\S]*status: "PARTIAL"/);
});

test("C waves do not change mastery schema or evidence thresholds", () => {
  assert.match(core, /PRACTICAL_MASTERY_STATE_SCHEMA_VERSION = 3/);
  assert.match(core, /MIN_RECOGNITION_STIMULI = 2/);
  assert.match(core, /MIN_DIRECT_DECISION_STIMULI = 3/);
  assert.match(core, /MIN_TRANSFER_STIMULI = 2/);
  assert.match(core, /MIN_BOUNDARY_STIMULI = 1/);
});
