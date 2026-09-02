import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";
import ts from "typescript";

import { emptyLearnerState, validateLearnerState } from "../lib/model-core.ts";

const USER_ID = "tombstone-disjointness-test-user";
const TOMBSTONE_KIND = "cloud-deleted-v1";

function ordinaryState() {
  const state = emptyLearnerState();
  state.revision = 1;
  return state;
}

function withReservedKeys(state, extra) {
  return { ...state, ...extra };
}

function persistedState(state, cloudToken = "cloud-token-1") {
  return { userId: USER_ID, stateJson: JSON.stringify(state), updatedAt: cloudToken };
}

function persistedTombstone(cloudToken = "tombstone-token-1", deletedAt = "2026-09-01T00:00:00.000Z") {
  return { userId: USER_ID, stateJson: JSON.stringify({ kind: TOMBSTONE_KIND, deletedAt }), updatedAt: cloudToken };
}

function persistedRaw(rawJsonString, cloudToken = "raw-token-1") {
  return { userId: USER_ID, stateJson: rawJsonString, updatedAt: cloudToken };
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

function deleteRequest() {
  return new Request("https://live-cash.test/api/state", { method: "DELETE" });
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
  const directory = await mkdtemp(join(tmpdir(), "live-cash-os-tombstone-harness-"));
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

test("A1 an ordinary valid LearnerState remains valid", () => {
  assert.equal(validateLearnerState(ordinaryState()), true);
});

test("A3 a LearnerState carrying the tombstone `kind` key alone is no longer a valid LearnerState", () => {
  const candidate = withReservedKeys(ordinaryState(), { kind: TOMBSTONE_KIND });
  assert.equal(validateLearnerState(candidate), false);
});

test("A4 a LearnerState carrying `deletedAt` alone is no longer a valid LearnerState", () => {
  const candidate = withReservedKeys(ordinaryState(), { deletedAt: "2026-09-01T00:00:00.000Z" });
  assert.equal(validateLearnerState(candidate), false);
});

test("A5 a LearnerState carrying both tombstone discriminator fields is rejected, even though it would otherwise satisfy parseTombstone's shape", () => {
  const candidate = withReservedKeys(ordinaryState(), { kind: TOMBSTONE_KIND, deletedAt: "2026-09-01T00:00:00.000Z" });
  assert.equal(validateLearnerState(candidate), false);
  // Demonstrates the shape really would have duck-typed as a tombstone absent the fix.
  assert.equal(candidate.kind === TOMBSTONE_KIND && typeof candidate.deletedAt === "string", true);
});

test("A6 first write cannot persist an ambiguous live/tombstone state", async (t) => {
  const harness = await buildRouteHarness(t, null);
  const ambiguous = withReservedKeys(ordinaryState(), { kind: TOMBSTONE_KIND, deletedAt: "2026-09-01T00:00:00.000Z" });
  const result = await responseJson(await harness.route.POST(postRequest({ state: ambiguous })));
  assert.equal(result.status, 400, "ambiguous first write must be rejected");
  assert.equal(result.body.code, "INVALID_STATE");
  assert.equal(harness.db.writes(), 0);
  assert.equal(harness.db.snapshot(), null);
});

test("A7 normal live CAS cannot persist an ambiguous live/tombstone state", async (t) => {
  const base = ordinaryState();
  const harness = await buildRouteHarness(t, persistedState(base, "live-token-a7"));
  const before = harness.db.snapshot();
  const ambiguous = withReservedKeys({ ...base, revision: base.revision + 1 }, { kind: TOMBSTONE_KIND, deletedAt: "2026-09-01T00:00:00.000Z" });
  const result = await responseJson(await harness.route.POST(postRequest({
    state: ambiguous,
    baseRevision: base.revision,
    baseCloudToken: "live-token-a7",
  })));
  assert.equal(result.status, 400, "ambiguous live-CAS write must be rejected");
  assert.equal(result.body.code, "INVALID_STATE");
  assert.equal(harness.db.writes(), 0);
  assert.deepEqual(harness.db.snapshot(), before, "existing live state must be untouched");
});

test("A8 real tombstone resume still works for a genuine, unambiguous successor state", async (t) => {
  const harness = await buildRouteHarness(t, persistedTombstone());
  const validState = ordinaryState();
  const result = await responseJson(await harness.route.POST(postRequest({ state: validState, resumeCloudSync: true })));
  assert.equal(result.status, 200);
  assert.equal(result.body.ok, true);
  assert.equal(result.body.resumed, true);
  assert.equal(harness.db.writes(), 1);
  assert.deepEqual(JSON.parse(harness.db.snapshot().stateJson), validState);
});

test("A9 DELETE still creates a correctly shaped tombstone, and it cannot be mistaken for a LearnerState", async (t) => {
  const harness = await buildRouteHarness(t, persistedState(ordinaryState(), "live-token-a9"));
  const result = await responseJson(await harness.route.DELETE(deleteRequest()));
  assert.equal(result.status, 200);
  assert.equal(result.body.cloudDeleted, true);
  const stored = JSON.parse(harness.db.snapshot().stateJson);
  assert.equal(stored.kind, TOMBSTONE_KIND);
  assert.equal(typeof stored.deletedAt, "string");
  assert.equal(validateLearnerState(stored), false, "a genuine tombstone must never validate as a LearnerState");

  const readBack = await responseJson(await harness.route.GET(getRequest()));
  assert.equal(readBack.body.cloudDeleted, true);
});

test("A10 GET of genuine, unambiguous learner state remains live", async (t) => {
  const validState = ordinaryState();
  const harness = await buildRouteHarness(t, persistedState(validState, "live-token-a10"));
  const result = await responseJson(await harness.route.GET(getRequest()));
  assert.equal(result.status, 200);
  assert.equal(result.body.cloudDeleted, false);
  assert.deepEqual(result.body.state, validState);
});

test("A11 malformed/unreadable stored state remains fail-closed on read", async (t) => {
  const harness = await buildRouteHarness(t, persistedRaw(JSON.stringify({ schemaVersion: 2, garbage: true })));
  const result = await responseJson(await harness.route.GET(getRequest()));
  assert.equal(result.status, 200);
  assert.equal(result.body.cloudDeleted, false);
  assert.equal(result.body.state, null);
  assert.equal(result.body.code, "CLOUD_STATE_UNREADABLE");
});
