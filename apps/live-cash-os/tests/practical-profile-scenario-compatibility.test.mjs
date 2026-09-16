import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { practicalDecisionById } from "../content/practical-mastery/index.ts";
import { assessCloudWrite } from "../lib/cloud-sync-contract.ts";
import { emptyLearnerState } from "../lib/model-core.ts";
import {
  markPracticalConceptTaught,
  recordPracticalDecision,
} from "../lib/practical-mastery-core.ts";
import {
  practicalProfileSafeSuccessor,
  validatePracticalProfileState,
} from "../lib/practical-profile-contract.ts";
import {
  createPracticalProfileState,
  practicalProfileFromLearnerState,
  withPracticalProfile,
} from "../lib/practical-profile-state.ts";
import {
  isSafeSuccessor,
  normalizeCurrentLearnerState,
  prepareLearnerStateImport,
  readLocalLearnerState,
  validateRootLearnerState,
} from "../lib/reliability.ts";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function asBaselineSchema3(root) {
  const legacy = structuredClone(root);
  const profile = legacy._practicalProfile;
  profile.mastery.schemaVersion = 3;
  delete profile.mastery.attemptArchive;
  for (const attempt of profile.mastery.attempts) delete attempt.confidenceProvenance;
  for (const event of profile.performance) delete event.confidenceProvenance;
  if (profile.studyWorkspace.continuity?.integrated) delete profile.studyWorkspace.continuity.integrated.draft;
  return legacy;
}

function answerCorrect(state, decisionId, at) {
  const decision = practicalDecisionById.get(decisionId);
  assert.ok(decision, `missing canonical decision ${decisionId}`);
  return recordPracticalDecision(state, {
    decisionId,
    actionId: decision.correctActionId,
    reasonId: decision.correctReasonId,
    confidence: 80,
    now: new Date(at),
  });
}

function previousValidFnd04Root() {
  let profile = createPracticalProfileState(new Date("2026-09-15T00:00:00Z"));
  profile.mastery = markPracticalConceptTaught(
    profile.mastery,
    "FND-04",
    new Date("2026-09-15T00:00:30Z"),
  );
  profile.mastery = answerCorrect(profile.mastery, "PM-FND-04-B1-101", "2026-09-15T00:01:00Z");
  profile.mastery = answerCorrect(profile.mastery, "PM-FND-04-B1-102", "2026-09-15T00:02:00Z");

  // Historical commit 14c9baa98c6cfbee7853339f13ec6e0c1aeade41
  // derived RECOGNITION_TRAINED from these two distinct stimulus families.
  // Commit 229e55f2 added the independent-scenario gate, under which the same
  // immutable attempts derive CONCEPT_TAUGHT. Build through the current strict
  // root writer first, then replace only the historically-derived field.
  const root = withPracticalProfile(
    emptyLearnerState(),
    profile,
    new Date("2026-09-15T00:03:00Z"),
  );
  const legacy = asBaselineSchema3(root);
  legacy._practicalProfile.mastery.skills["FND-04"].evidenceStage = "RECOGNITION_TRAINED";
  return legacy;
}

function currentValidFnd04Root() {
  let profile = createPracticalProfileState(new Date("2026-09-15T01:00:00Z"));
  profile.mastery = markPracticalConceptTaught(
    profile.mastery,
    "FND-04",
    new Date("2026-09-15T01:00:30Z"),
  );
  profile.mastery = answerCorrect(profile.mastery, "PM-FND-04-B1-101", "2026-09-15T01:01:00Z");
  profile.mastery = answerCorrect(profile.mastery, "PM-FND-04-S2-101", "2026-09-15T01:02:00Z");
  return withPracticalProfile(
    emptyLearnerState(),
    profile,
    new Date("2026-09-15T01:03:00Z"),
  );
}

test("LC-AUD-026 previous-valid local profile reconciles derived stage without touching immutable attempts", () => {
  const previous = previousValidFnd04Root();
  assert.equal(validateRootLearnerState(previous), false, "fixture must reproduce current strict rejection");
  const attemptsBefore = JSON.stringify(previous._practicalProfile.mastery.attempts);

  const local = readLocalLearnerState(JSON.stringify(previous));
  assert.equal(local.kind, "migrated");
  assert.ok(local.state);
  assert.equal(validateRootLearnerState(local.state), true);
  assert.equal(local.state._practicalProfile.mastery.skills["FND-04"].evidenceStage, "CONCEPT_TAUGHT");
  assert.equal(JSON.stringify(local.state._practicalProfile.mastery.attempts), attemptsBefore);
});

test("LC-AUD-026 previous-valid import and cloud normalization share the bounded reconciliation", () => {
  const previous = previousValidFnd04Root();
  const normalized = normalizeCurrentLearnerState(previous);
  assert.ok(normalized);
  assert.equal(normalized.practicalProfileReconciled, true);
  assert.equal(normalized.state._practicalProfile.mastery.skills["FND-04"].evidenceStage, "CONCEPT_TAUGHT");

  const prepared = prepareLearnerStateImport(JSON.stringify(previous), emptyLearnerState());
  assert.equal(prepared.ok, true);
  assert.equal(prepared.migrated, true);
  assert.ok(prepared.state);
  assert.equal(prepared.state._practicalProfile.mastery.skills["FND-04"].evidenceStage, "CONCEPT_TAUGHT");

  // Server GET/existing-cloud and POST/incoming-cloud both use the same normalizer.
  assert.deepEqual(
    assessCloudWrite(
      normalized.state,
      structuredClone(normalized.state),
      normalized.state.revision,
      "token-a",
      "token-a",
    ),
    { kind: "idempotent" },
  );
});

test("LC-AUD-026 current-valid profiles are byte-stable and normalization is idempotent", () => {
  const current = currentValidFnd04Root();
  assert.equal(validateRootLearnerState(current), true);
  const once = normalizeCurrentLearnerState(current);
  assert.ok(once);
  assert.equal(once.practicalProfileReconciled, false);
  assert.equal(JSON.stringify(once.state), JSON.stringify(current));

  const previous = previousValidFnd04Root();
  const migratedOnce = normalizeCurrentLearnerState(previous);
  assert.ok(migratedOnce);
  const migratedTwice = normalizeCurrentLearnerState(migratedOnce.state);
  assert.ok(migratedTwice);
  assert.equal(migratedTwice.practicalProfileReconciled, false);
  assert.equal(JSON.stringify(migratedTwice.state), JSON.stringify(migratedOnce.state));
});

test("LC-AUD-026 compatibility rejects insufficient evidence and arbitrary stage inconsistency", () => {
  let profile = createPracticalProfileState(new Date("2026-09-15T02:00:00Z"));
  profile.mastery = markPracticalConceptTaught(profile.mastery, "FND-04", new Date("2026-09-15T02:00:30Z"));
  profile.mastery = answerCorrect(profile.mastery, "PM-FND-04-B1-101", "2026-09-15T02:01:00Z");
  profile.mastery.skills["FND-04"].evidenceStage = "RECOGNITION_TRAINED";
  // withPracticalProfile is intentionally strict; construct the root only after
  // the valid writer output and then inject the historical-field candidate.
  const validRoot = withPracticalProfile(
    emptyLearnerState(),
    { ...profile, mastery: { ...profile.mastery, skills: {
      ...profile.mastery.skills,
      "FND-04": { ...profile.mastery.skills["FND-04"], evidenceStage: "CONCEPT_TAUGHT" },
    } } },
    new Date("2026-09-15T02:02:00Z"),
  );
  const forged = structuredClone(validRoot);
  forged._practicalProfile.mastery.skills["FND-04"].evidenceStage = "RECOGNITION_TRAINED";

  assert.equal(validatePracticalProfileState(forged._practicalProfile), false);
  assert.equal(normalizeCurrentLearnerState(forged), null);
  assert.equal(readLocalLearnerState(JSON.stringify(forged)).kind, "corrupt");
  assert.equal(prepareLearnerStateImport(JSON.stringify(forged), emptyLearnerState()).ok, false);
});

test("LC-AUD-026 reconciliation does not weaken safe-successor or no-resurrection ancestry", () => {
  const normalized = normalizeCurrentLearnerState(previousValidFnd04Root());
  assert.ok(normalized);
  const base = normalized.state;
  const baseProfile = practicalProfileFromLearnerState(base);

  const emptyProfile = createPracticalProfileState(new Date("2026-09-15T03:00:00Z"));
  const regressed = withPracticalProfile(
    base,
    emptyProfile,
    new Date("2026-09-15T03:01:00Z"),
  );
  assert.equal(validateRootLearnerState(regressed), true);
  assert.equal(practicalProfileSafeSuccessor(regressed, base), false);
  assert.equal(isSafeSuccessor(regressed, base), false);

  const retained = withPracticalProfile(
    base,
    baseProfile,
    new Date("2026-09-15T03:02:00Z"),
  );
  assert.equal(practicalProfileSafeSuccessor(retained, base), true);
  assert.equal(isSafeSuccessor(retained, base), true);
});

test("LC-AUD-026 cloud route normalizes stored and incoming current-schema profiles before CAS", async () => {
  const route = await readFile(path.join(rootDir, "app/api/state/route.ts"), "utf8");
  assert.match(route, /version === STATE_SCHEMA_VERSION\) return normalizeCurrentLearnerState\(value\)\?\.state \?\? null/);
  assert.match(route, /const normalizedIncoming = normalizeCurrentLearnerState\(rawState\)/);
  assert.ok(route.indexOf("const normalizedIncoming = normalizeCurrentLearnerState(rawState)") < route.indexOf("assessCloudWrite(existing, incoming"));
});
