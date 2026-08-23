import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflow = readFileSync("../../.github/workflows/live-cash-os-ci.yml", "utf8");
const productionSmoke = readFileSync("scripts/production-smoke.mjs", "utf8");
const completionSmoke = readFileSync("scripts/wave-d-completion-smoke.mjs", "utf8");

test("release deploy is pinned to the canonical Workers target and verifies the reported URL", () => {
  assert.ok(workflow.includes("LIVE_CASH_CANONICAL_WORKER_NAME: live-cash-os-mobile-test"));
  assert.ok(workflow.includes("LIVE_CASH_CANONICAL_WORKERS_URL: https://live-cash-os-mobile-test.blufferus.workers.dev"));
  assert.ok(workflow.includes('deploy --dry-run --name "$LIVE_CASH_CANONICAL_WORKER_NAME"'));
  assert.ok(workflow.includes('deploy --name "$LIVE_CASH_CANONICAL_WORKER_NAME"'));
  assert.ok(workflow.includes('test "${deploy_url%/}" = "${LIVE_CASH_CANONICAL_WORKERS_URL%/}"'));
});

test("release smoke proves canonical Practical Mastery and keeps legacy completion checks on explicit support tools", () => {
  assert.ok(productionSmoke.includes('const canonicalUrl = new URL("/", liveUrl).toString()'));
  assert.ok(productionSmoke.includes('const toolsUrl = new URL("/tools", liveUrl).toString()'));
  assert.ok(productionSmoke.includes('canonical_root_has_no_legacy_primary_navigation: true'));
  assert.ok(productionSmoke.includes('build_identity_verified_on: ["practical_mastery", "support_tools"]'));
  assert.ok(completionSmoke.includes('const toolsUrl = new URL("/tools", liveUrl).toString()'));
  assert.ok(completionSmoke.includes('support_tools_url: toolsUrl'));
});
