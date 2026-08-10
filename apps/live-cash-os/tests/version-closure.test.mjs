import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { APP_VERSION, CONTENT_VERSION, STATE_SCHEMA_VERSION, emptyLearnerState, migrateLearnerState, validateLearnerState } from "../lib/model-core.ts";

const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
const packageLock = JSON.parse(await readFile(new URL("../package-lock.json", import.meta.url), "utf8"));
const shell = await readFile(new URL("../components/LiveCashApp.tsx", import.meta.url), "utf8");

test("v1.2.0 version sources and visible identity stay synchronized", () => {
  assert.equal(packageJson.version, "1.2.0");
  assert.equal(packageLock.version, packageJson.version);
  assert.equal(packageLock.packages[""].version, packageJson.version);
  assert.equal(APP_VERSION, packageJson.version);
  assert.equal(STATE_SCHEMA_VERSION, 2);
  assert.equal(CONTENT_VERSION, "2026.08-wave7-integrity");
  assert.match(shell, /import \{ APP_VERSION \} from "\.\.\/lib\/model"/u);
  assert.match(shell, /data-app-version=\{APP_VERSION\}/u);
  assert.match(shell, /Live Cash OS v\{APP_VERSION\} · Build \{buildLabel\}/u);
  assert.match(shell, /VITE_BUILD_SHA/u);
  assert.match(shell, /data-build-sha=\{rawBuildSha\}/u);
});

test("schema-v2 state from app 1.1.0 remains valid without evidence mutation", () => {
  const prior = emptyLearnerState();
  prior.appVersion = "1.1.0";
  prior.revision = 7;
  const before = structuredClone(prior);
  assert.equal(validateLearnerState(prior), true);
  const migrated = migrateLearnerState(prior);
  assert.equal(validateLearnerState(migrated), true);
  assert.equal(migrated.schemaVersion, 2);
  assert.equal(migrated.appVersion, "1.2.0");
  assert.equal(migrated.contentVersion, before.contentVersion);
  assert.equal(migrated.revision, before.revision);
  assert.deepEqual(migrated.modules, before.modules);
  assert.deepEqual(migrated.interactions, before.interactions);
  assert.deepEqual(migrated.reviewQueue, before.reviewQueue);
  assert.deepEqual(migrated.cards, before.cards);
  assert.deepEqual(migrated.fieldNotes, before.fieldNotes);
  assert.deepEqual(migrated.diagnostic, before.diagnostic);
  assert.deepEqual(migrated.activeSession, before.activeSession);
});
