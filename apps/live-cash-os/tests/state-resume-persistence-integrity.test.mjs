import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";
import ts from "typescript";

import { practicalDecisionById } from "../content/practical-mastery/index.ts";
import { emptyLearnerState } from "../lib/model-core.ts";
import { markPracticalConceptTaught, recordPracticalDecision } from "../lib/practical-mastery-core.ts";
import { PRACTICAL_PROFILE_FIELD } from "../lib/practical-profile-contract.ts";
import {
  createPracticalProfileState,
  practicalProfileFromLearnerState,
  withPracticalProfile,
} from "../lib/practical-profile-state.ts";

const NOW = new Date("2026-09-02T00:00:00.000Z");
const LATER = new Date("2026-09-02T00:01:00.000Z");
const USER_ID = "route-integrity-test-user";
const TOMBSTONE = Object.freeze({
  kind: "cloud-deleted-v1",
  deletedAt: "2026-09-01T23:59:00.000Z",
});

function stateWithProfile(profile = createPracticalProfileState(NOW)) {
  return withPracticalProfile(emptyLearnerState(), profile, NOW);
}

function stateWithCanonicalAttempt() {
  const decision = [...practicalDecisionById.values()].find((candidate) => candidate.skillId === "FND-01");
  assert.ok(decision, "FND-01 must have a canonical Practical decision");
  const profile = createPracticalProfileState(NOW);
  const mastery = recordPracticalDecision(profile.mastery, {
    decisionId: decision.id,
    actionId: decision.correctActionId,
    reasonId: decision.correctReasonId,
    confidence: 70,
    now: NOW,
  });
  return {
    decision,
    state: withPracticalProfile(emptyLearnerState(), { ...profile, mastery }, LATER),
  };
}

function canonicalSuccessor(base) {
  const profile = practicalProfileFromLearnerState(base);
  const skillId = Object.keys(profile.mastery.skills)[0];
  const mastery = markPracticalConceptTaught(profile.mastery, skillId, LATER);
  return withPracticalProfile(base, { ...profile, mastery }, LATER);
}

function malformedPracticalProfile() {
  const state = stateWithProfile();
  state[PRACTICAL_PROFILE_FIELD].version = 999;
  return state;
}

function semanticInvalidAttempt() {
  const { state, decision } = stateWithCanonicalAttempt();
  state[PRACTICAL_PROFILE_FIELD].mastery.attempts[0].skillId = decision.skillId === "FND-02" ? "FND-01" : "FND-02";
  return state;
}

function missingCanonicalSkill() {
  const state = stateWithProfile();
  const skillId = Object.keys(state[PRACTICAL_PROFILE_FIELD].mastery.skills)[0];
  delete state[PRACTICAL_PROFILE_FIELD].mastery.skills[skillId];
  return state;
}

function suppressedSuccessfulDecision() {
  const { state, decision } = stateWithCanonicalAttempt();
  state[PRACTICAL_PROFILE_FIELD].mastery.skills[decision.skillId].successfulDecisionIds = [];
  return state;
}

function divergentSuccessor(existing) {
  const candidate = stateWithProfile();
  candidate.revision = existing.revision + 1;
  candidate.updatedAt = new Date(Date.parse(existing.updatedAt) + 60_000).toISOString();
  return candidate;
}

function persistedState(state, cloudToken = "cloud-token-1") {
  return { userId: USER_ID, stateJson: JSON.stringify(state), updatedAt: cloudToken };
}

function persistedTombstone(cloudToken = "tombstone-token-1") {
  return { userId: USER_ID, stateJson: JSON.stringify(TOMBSTONE), updatedAt: cloudToken };
}

function postRequest(payload) {
  return new Request("https://live-cash.test/api/state", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
}

function getRequest() {
  return new Request("https://live-cash.test/api/state", { method: "GET" });
}

async function responseJson(response) {
  return { status: response.status, body: await response.json() };
}

function mockDbSource(initialRecord) {
  return `
let record = ${JSON.stringify(initialRecord)};
let writeCount = 0;

function projectedRecord() {
  return record ? { stateJson: record.stateJson, cloudToken: record.updatedAt } : null;
}

export function getDb() {
  return {
    select() {
      return {
        from() {
          return {
            where() {
              return {
                async limit() {
                  const projected = projectedRecord();
                  return projected ? [projected] : [];
                },
              };
            },
          };
        },
      };
    },
    insert() {
      return {
        values(values) {
          return {
            onConflictDoNothing() {
              return {
                async run() {
                  if (record) return { meta: { changes: 0 } };
                  record = structuredClone(values);
                  writeCount += 1;
                  return { meta: { changes: 1 } };
                },
              };
            },
            async onConflictDoUpdate({ set }) {
              record = { ...(record ?? values), ...structuredClone(set) };
              writeCount += 1;
              return { meta: { changes: 1 } };
            },
          };
        },
      };
    },
    update() {
      return {
        set(values) {
          return {
            where() {
              return {
                async run() {
                  if (!record) return { meta: { changes: 0 } };
                  record = { ...record, ...structuredClone(values) };
                  writeCount += 1;
                  return { meta: { changes: 1 } };
                },
              };
            },
          };
        },
      };
    },
  };
}

export function snapshot() {
  return record ? structuredClone(record) : null;
}

export function writes() {
  return writeCount;
}
`;
}

async function buildRouteHarness(t, initialRecord = null) {
  const directory = await mkdtemp(join(tmpdir(), "live-cash-os-route-harness-"));
  t.after(async () => { await rm(directory, { recursive: true, force: true }); });

  const drizzleUrl = pathToFileURL(join(directory, "drizzle.mjs")).href;
  const envUrl = pathToFileURL(join(directory, "env.mjs")).href;
  const authUrl = pathToFileURL(join(directory, "auth.mjs")).href;
  const dbUrl = pathToFileURL(join(directory, "db.mjs")).href;
  const schemaUrl = pathToFileURL(join(directory, "schema.mjs")).href;
  const routeUrl = pathToFileURL(join(directory, "route.mjs")).href;

  await Promise.all([
    writeFile(join(directory, "drizzle.mjs"), "export const eq = (left, right) => ({ op: 'eq', left, right });\nexport const and = (...clauses) => ({ op: 'and', clauses });\n"),
    writeFile(join(directory, "env.mjs"), "export const env = {};\n"),
    writeFile(join(directory, "auth.mjs"), `export async function getChatGPTUser() { return { userId: ${JSON.stringify(USER_ID)} }; }\n`),
    writeFile(join(directory, "db.mjs"), mockDbSource(initialRecord)),
    writeFile(join(directory, "schema.mjs"), `
export const learnerStates = { userId: "userId", stateJson: "stateJson", updatedAt: "updatedAt" };
export const testInvites = { id: "id", codeHash: "codeHash", active: "active", firstUsedAt: "firstUsedAt", lastUsedAt: "lastUsedAt" };
`),
  ]);

  const appImports = new Map([
    ["drizzle-orm", drizzleUrl],
    ["cloudflare:workers", envUrl],
    ["../../chatgpt-auth", authUrl],
    ["../../../db", dbUrl],
    ["../../../db/schema", schemaUrl],
    ["../../../lib/cloud-sync-contract", new URL("../lib/cloud-sync-contract.ts", import.meta.url).href],
    ["../../../lib/model", new URL("../lib/model.ts", import.meta.url).href],
    ["../../../lib/reliability", new URL("../lib/reliability.ts", import.meta.url).href],
  ]);

  let source = await readFile(new URL("../app/api/state/route.ts", import.meta.url), "utf8");
  for (const [specifier, replacement] of appImports) {
    source = source.replaceAll(JSON.stringify(specifier), JSON.stringify(replacement));
  }
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove,
    },
  }).outputText;
  await writeFile(join(directory, "route.mjs"), compiled);

  const [route, db] = await Promise.all([import(routeUrl), import(dbUrl)]);
  return { route, db };
}

async function assertRejectedWithoutWrite(t, candidate, label) {
  const harness = await buildRouteHarness(t, persistedTombstone());
  const before = harness.db.snapshot();
  const result = await responseJson(await harness.route.POST(postRequest({ state: candidate, resumeCloudSync: true })));
  assert.equal(result.status, 400, `${label} must be rejected before persistence`);
  assert.equal(result.body.code, "INVALID_STATE", `${label} must fail at the root state trust boundary`);
  assert.equal(harness.db.writes(), 0, `${label} must perform no state_json write`);
  assert.deepEqual(harness.db.snapshot(), before, `${label} must leave the tombstone intact`);
}

test("T1, T2, T7, T8 tombstone resume is explicit, fail-closed, and readable after success", async (t) => {
  const validState = stateWithProfile();

  const noResume = await buildRouteHarness(t, persistedTombstone("tombstone-no-resume"));
  const denied = await responseJson(await noResume.route.POST(postRequest({ state: validState, resumeCloudSync: false })));
  assert.equal(denied.status, 410, "T2 tombstone without explicit resume must retain existing 410 behavior");
  assert.equal(denied.body.code, "CLOUD_STATE_DELETED");
  assert.equal(noResume.db.writes(), 0);
  assert.equal(JSON.parse(noResume.db.snapshot().stateJson).kind, TOMBSTONE.kind);

  const resumed = await buildRouteHarness(t, persistedTombstone("tombstone-resume"));
  const accepted = await responseJson(await resumed.route.POST(postRequest({ state: validState, resumeCloudSync: true })));
  assert.equal(accepted.status, 200, "T1 tombstone + resume=true + canonical state must be accepted");
  assert.equal(accepted.body.ok, true);
  assert.equal(accepted.body.resumed, true);
  assert.equal(resumed.db.writes(), 1);
  assert.deepEqual(JSON.parse(resumed.db.snapshot().stateJson), validState);

  const readBack = await responseJson(await resumed.route.GET(getRequest()));
  assert.equal(readBack.status, 200, "T8 resumed state must remain readable");
  assert.equal(readBack.body.cloudDeleted, false);
  assert.deepEqual(readBack.body.state, validState);

  const rejected = await buildRouteHarness(t, persistedTombstone("tombstone-rejected"));
  const before = rejected.db.snapshot();
  const invalid = await responseJson(await rejected.route.POST(postRequest({ state: malformedPracticalProfile(), resumeCloudSync: true })));
  assert.equal(invalid.status, 400, "T7 rejected resume must fail closed");
  assert.equal(rejected.db.writes(), 0);
  assert.deepEqual(rejected.db.snapshot(), before, "T7 rejected resume must leave tombstone intact");
});

test("T3-T6 malformed Practical resume candidates are rejected with no write", async (t) => {
  const cases = [
    ["T3 malformed Practical profile", malformedPracticalProfile()],
    ["T4 semantic-invalid PracticalAttempt", semanticInvalidAttempt()],
    ["T5 missing canonical mastery skill", missingCanonicalSkill()],
    ["T6 suppressed successfulDecisionId", suppressedSuccessfulDecision()],
  ];
  for (const [label, candidate] of cases) {
    await assertRejectedWithoutWrite(t, candidate, label);
  }
});

test("T9-T12 normal first-write, exact-token CAS, lost-token successor, and divergent conflict semantics remain intact", async (t) => {
  const initial = stateWithProfile();

  const firstWrite = await buildRouteHarness(t);
  const first = await responseJson(await firstWrite.route.POST(postRequest({ state: initial })));
  assert.equal(first.status, 200, "T9 normal first write must remain valid");
  assert.equal(first.body.ok, true);
  assert.equal(firstWrite.db.writes(), 1);
  assert.deepEqual(JSON.parse(firstWrite.db.snapshot().stateJson), initial);

  const casBase = stateWithProfile();
  const casSuccessor = canonicalSuccessor(casBase);
  const exactToken = await buildRouteHarness(t, persistedState(casBase, "exact-token"));
  const exact = await responseJson(await exactToken.route.POST(postRequest({
    state: casSuccessor,
    baseRevision: casBase.revision,
    baseCloudToken: "exact-token",
  })));
  assert.equal(exact.status, 200, "T10 live exact-token CAS must remain valid");
  assert.equal(exact.body.ok, true);
  assert.equal(exactToken.db.writes(), 1);

  const lostBase = stateWithProfile();
  const lostSuccessor = canonicalSuccessor(lostBase);
  const lostToken = await buildRouteHarness(t, persistedState(lostBase, "unacknowledged-token"));
  const lost = await responseJson(await lostToken.route.POST(postRequest({ state: lostSuccessor })));
  assert.equal(lost.status, 200, "T11 lost-token safe successor must remain valid");
  assert.equal(lost.body.ok, true);
  assert.equal(lostToken.db.writes(), 1);

  const attempted = stateWithCanonicalAttempt().state;
  const divergent = divergentSuccessor(attempted);
  const conflictHarness = await buildRouteHarness(t, persistedState(attempted, "divergent-token"));
  const conflict = await responseJson(await conflictHarness.route.POST(postRequest({ state: divergent })));
  assert.equal(conflict.status, 409, "T12 lost-token divergent successor must remain a conflict");
  assert.equal(conflict.body.code, "STATE_CONFLICT");
  assert.equal(conflictHarness.db.writes(), 0);
  assert.deepEqual(JSON.parse(conflictHarness.db.snapshot().stateJson), attempted);
});

test("T13 root validation executes before every state_json persistence branch", async (t) => {
  const invalid = malformedPracticalProfile();
  const liveBase = stateWithProfile();
  const branches = [
    ["first-write insert", null, { state: invalid }],
    ["tombstone resume update", persistedTombstone("t13-tombstone"), { state: invalid, resumeCloudSync: true }],
    ["live CAS update", persistedState(liveBase, "t13-live-token"), {
      state: invalid,
      baseRevision: liveBase.revision,
      baseCloudToken: "t13-live-token",
    }],
  ];

  for (const [label, seed, payload] of branches) {
    const harness = await buildRouteHarness(t, seed);
    const before = harness.db.snapshot();
    const result = await responseJson(await harness.route.POST(postRequest(payload)));
    assert.equal(result.status, 400, `${label}: root-invalid state must be rejected`);
    assert.equal(result.body.code, "INVALID_STATE", `${label}: rejection must occur at state validation`);
    assert.equal(harness.db.writes(), 0, `${label}: root validation must execute before state_json persistence`);
    assert.deepEqual(harness.db.snapshot(), before, `${label}: rejected state must not mutate persistence`);
  }
});
