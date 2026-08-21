import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { assessCloudWrite } from "../lib/cloud-sync-contract.ts";
import { emptyLearnerState } from "../lib/model-core.ts";
import { isSafeSuccessor, prepareLearnerStateImport, readLocalLearnerState } from "../lib/reliability.ts";
import { markPracticalConceptTaught } from "../lib/practical-mastery-core.ts";
import {
  PRACTICAL_PROFILE_LINEAGE_CARD_PREFIX,
  createPracticalProfileState,
  practicalProfileFromLearnerState,
  withPracticalProfile,
} from "../lib/practical-profile-state.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => readFile(path.join(root, relative), "utf8");

function stateWithProfile() {
  return withPracticalProfile(emptyLearnerState(), createPracticalProfileState(new Date("2026-08-21T00:00:00Z")), new Date("2026-08-21T00:00:01Z"));
}

test("practical profile is additive to the reliable learner state and advances root revision", () => {
  const base = emptyLearnerState();
  const next = stateWithProfile();
  assert.equal(next.schemaVersion, 2);
  assert.equal(next.revision, base.revision + 1);
  assert.equal(practicalProfileFromLearnerState(next).mastery.schemaVersion, 3);
  assert.ok(Object.keys(next.cards).some((id) => id.startsWith(PRACTICAL_PROFILE_LINEAGE_CARD_PREFIX)));
});

test("local read and import preserve the practical profile inside the exported root snapshot", () => {
  const next = stateWithProfile();
  const serialized = JSON.stringify(next);
  const local = readLocalLearnerState(serialized);
  assert.ok(local.state);
  assert.equal(practicalProfileFromLearnerState(local.state).mastery.schemaVersion, 3);

  const prepared = prepareLearnerStateImport(serialized, emptyLearnerState());
  assert.equal(prepared.ok, true);
  assert.ok(prepared.state);
  assert.equal(practicalProfileFromLearnerState(prepared.state).mastery.schemaVersion, 3);
});

test("pre-Practical import cannot silently replace a current Practical profile", () => {
  const current = stateWithProfile();
  const old = emptyLearnerState();
  old.revision = current.revision + 10;
  old.updatedAt = "2026-08-21T00:10:00.000Z";
  const prepared = prepareLearnerStateImport(JSON.stringify(old), current);
  assert.equal(prepared.ok, true);
  assert.equal(prepared.requiresConfirmation, true);
});

test("lineage markers make divergent offline Practical branches fail closed", () => {
  const base = stateWithProfile();
  const profile = practicalProfileFromLearnerState(base);
  const branchA = withPracticalProfile(base, {
    ...profile,
    studyWorkspace: { ...profile.studyWorkspace, focus: "branch A", updatedAt: "2026-08-21T00:01:00.000Z" },
  }, new Date("2026-08-21T00:01:00Z"));
  const branchB = withPracticalProfile(base, {
    ...profile,
    studyWorkspace: { ...profile.studyWorkspace, focus: "branch B", updatedAt: "2026-08-21T00:02:00.000Z" },
  }, new Date("2026-08-21T00:02:00Z"));

  assert.equal(isSafeSuccessor(branchA, base), true);
  assert.equal(isSafeSuccessor(branchB, base), true);
  assert.equal(isSafeSuccessor(branchA, branchB), false);
  assert.equal(isSafeSuccessor(branchB, branchA), false);
});

test("cloud contract refuses to drop a durable practical profile even with the current CAS token", () => {
  const existing = stateWithProfile();
  const incoming = structuredClone(existing);
  delete incoming._practicalProfile;
  incoming.revision += 1;
  incoming.updatedAt = "2026-08-21T00:00:02.000Z";
  assert.deepEqual(assessCloudWrite(existing, incoming, existing.revision, "token-a", "token-a"), { kind: "conflict", reason: "divergent_history" });
});

test("exact-token practical advance is accepted and lost-ack advance needs monotonic practical ancestry", () => {
  const existing = stateWithProfile();
  const profile = practicalProfileFromLearnerState(existing);
  const taught = markPracticalConceptTaught(profile.mastery, "FND-01", new Date("2026-08-21T00:00:03Z"));
  const incoming = withPracticalProfile(existing, { ...profile, mastery: taught }, new Date("2026-08-21T00:00:04Z"));

  assert.deepEqual(assessCloudWrite(existing, incoming, existing.revision, "token-a", "token-a"), { kind: "accept" });
  assert.deepEqual(assessCloudWrite(existing, incoming, null, null, "token-a"), { kind: "accept" });

  const changedNotes = withPracticalProfile(existing, {
    ...profile,
    studyWorkspace: { ...profile.studyWorkspace, focus: "new mutable note", updatedAt: "2026-08-21T00:00:05Z" },
  }, new Date("2026-08-21T00:00:05Z"));
  assert.deepEqual(assessCloudWrite(existing, changedNotes, null, null, "token-a"), { kind: "conflict", reason: "divergent_history" });
});

test("learner-facing practical components no longer persist competing standalone mastery keys", async () => {
  const components = await Promise.all([
    "components/PracticalMasteryExperience.tsx",
    "components/PracticalFirstJourneyExperience.tsx",
    "components/PracticalIntegratedSessionExperience.tsx",
    "components/PracticalPerceptualExperience.tsx",
    "components/PracticalStudyLoopExperience.tsx",
  ].map(read));
  const hook = await read("lib/use-practical-profile-state.ts");
  const corpus = components.join("\n");
  assert.doesNotMatch(corpus, /live-cash-os:practical-mastery:v3/);
  assert.doesNotMatch(corpus, /live-cash-os:practical-performance:v1/);
  assert.doesNotMatch(corpus, /live-cash-os:study-loop:v1/);
  assert.match(corpus, /usePracticalProfileState/);
  assert.doesNotMatch(hook, /removeLegacyStandalonePracticalKeys|localStorage\.removeItem/);
});

test("locale is shared across learner-facing mastery surfaces", async () => {
  const localeHook = await read("lib/use-practical-locale.ts");
  const components = await Promise.all([
    "components/PracticalMasteryExperience.tsx",
    "components/PracticalFirstJourneyExperience.tsx",
    "components/PracticalIntegratedSessionExperience.tsx",
    "components/PracticalPerceptualExperience.tsx",
    "components/PracticalStudyLoopExperience.tsx",
    "components/PracticalReferenceExperience.tsx",
  ].map(read));
  assert.match(localeHook, /live-cash-os:locale/);
  assert.match(localeHook, /document\.documentElement\.lang/);
  for (const component of components) assert.match(component, /usePracticalLocale/);
});
