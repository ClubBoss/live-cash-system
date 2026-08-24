import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflow = readFileSync("../../.github/workflows/live-cash-os-ci.yml", "utf8");
const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const productionSmoke = readFileSync("scripts/production-smoke.mjs", "utf8");

test("release deploy is pinned to the canonical Workers target and verifies the reported URL", () => {
  assert.ok(workflow.includes("LIVE_CASH_CANONICAL_WORKER_NAME: live-cash-os-mobile-test"));
  assert.ok(workflow.includes("LIVE_CASH_CANONICAL_WORKERS_URL: https://live-cash-os-mobile-test.blufferus.workers.dev"));
  assert.ok(workflow.includes('deploy --dry-run --name "$LIVE_CASH_CANONICAL_WORKER_NAME"'));
  assert.ok(workflow.includes('deploy --name "$LIVE_CASH_CANONICAL_WORKER_NAME"'));
  assert.ok(workflow.includes('test "${deploy_url%/}" = "${LIVE_CASH_CANONICAL_WORKERS_URL%/}"'));
});

test("release smoke proves canonical Practical Mastery plus authenticated Data & Recovery", () => {
  assert.equal(packageJson.scripts["smoke:production"], "node scripts/production-smoke.mjs");
  assert.ok(!packageJson.scripts["smoke:production"].includes("wave-d-completion-smoke.mjs"));
  assert.ok(productionSmoke.includes('const canonicalUrl = new URL("/mastery/journey", liveUrl).toString()'));
  assert.ok(productionSmoke.includes('const dataUrl = new URL("/tools?tab=data", liveUrl).toString()'));
  assert.ok(productionSmoke.includes('canonical_root_has_no_legacy_primary_navigation: true'));
  assert.ok(productionSmoke.includes('generic_continue_target: "/mastery/journey"'));
  assert.ok(productionSmoke.includes('support_data_recovery_verified: true'));
  assert.ok(productionSmoke.includes('mobile_viewport: "390x844"'));
});
