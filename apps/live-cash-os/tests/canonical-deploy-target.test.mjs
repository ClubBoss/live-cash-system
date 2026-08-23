import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflow = readFileSync("../../.github/workflows/live-cash-os-ci.yml", "utf8");

test("release deploy is pinned to the canonical Workers target and verifies the reported URL", () => {
  assert.match(workflow, /LIVE_CASH_CANONICAL_WORKER_NAME:\s*live-cash-os-mobile-test/);
  assert.match(workflow, /LIVE_CASH_CANONICAL_WORKERS_URL:\s*https:\/\/live-cash-os-mobile-test\.blufferus\.workers\.dev/);
  assert.match(workflow, /deploy --dry-run --name \"\$LIVE_CASH_CANONICAL_WORKER_NAME\"/);
  assert.match(workflow, /deploy --name \"\$LIVE_CASH_CANONICAL_WORKER_NAME\"/);
  assert.match(workflow, /test \"\$\{deploy_url%\/\}\" = \"\$\{LIVE_CASH_CANONICAL_WORKERS_URL%\/\}\"/);
});
