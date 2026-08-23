import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const packageJson = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
);
const primaryConfig = readFileSync(
  new URL("../playwright.config.mjs", import.meta.url),
  "utf8",
);
const crossBrowserConfig = readFileSync(
  new URL("../playwright.cross-browser.config.mjs", import.meta.url),
  "utf8",
);
const viteConfig = readFileSync(
  new URL("../vite.config.ts", import.meta.url),
  "utf8",
);
const e2eServer = readFileSync(
  new URL("../scripts/e2e-server.mjs", import.meta.url),
  "utf8",
);

test("release E2E starts the built app in a current generated Cloudflare Worker runtime", () => {
  assert.match(
    packageJson.scripts.start,
    /wrangler@4\.125\.0 dev --config dist\/server\/wrangler\.json/,
  );
  assert.doesNotMatch(packageJson.scripts.start, /vinext start/);
  assert.equal(packageJson.scripts["start:e2e"], "node scripts/e2e-server.mjs");
  assert.match(e2eServer, /const E2E_WRANGLER = "wrangler@4\.125\.0"/);

  for (const [name, config] of [
    ["primary", primaryConfig],
    ["cross-browser", crossBrowserConfig],
  ]) {
    assert.match(
      config,
      /npm run start:e2e -- --ip 127\.0\.0\.1 --port 5173/,
      `${name} Playwright config must start the generated Worker runtime`,
    );
    assert.match(
      config,
      /globalSetup: "\.\/e2e\/global-setup\.mjs"/,
      `${name} Playwright config must bootstrap the isolated test mirror when requested`,
    );
    assert.match(
      config,
      /workers: process\.env\.CI \? 1 : undefined/,
      `${name} CI must serialize browser projects against the shared local Workerd runtime`,
    );
    assert.doesNotMatch(
      config,
      /--hostname 127\.0\.0\.1/,
      `${name} Playwright config must not pass Node-only host flags`,
    );
  }
});

test("normal release E2E uses canonical app D1 schema without Sites access-control state", () => {
  assert.match(viteConfig, /deployTarget === "e2e-local"/);
  assert.match(viteConfig, /binding: "DB"/);
  assert.match(viteConfig, /database_name: "live-cash-os-e2e-state"/);
  assert.match(
    viteConfig,
    /isTestMirrorDeploy \|\| isLocalE2ERuntime \? \[\] : \[sites\(\)\]/,
  );
  assert.match(e2eServer, /LIVE_CASH_DEPLOY_TARGET = "e2e-local"/);
  assert.match(e2eServer, /drizzle\/0000_last_morph\.sql/);
  assert.match(e2eServer, /"live-cash-os-e2e-state"/);
  assert.doesNotMatch(e2eServer, /CREATE TABLE/i);
});

test("all locally served release E2E targets only remove obsolete generated legacy_env when semantics are preserved", () => {
  assert.match(
    e2eServer,
    /Object\.hasOwn\(config, "legacy_env"\)/,
  );
  assert.match(
    e2eServer,
    /config\.legacy_env !== true/,
    "unexpected legacy_env values must fail closed rather than be silently rewritten",
  );
  assert.match(e2eServer, /delete config\.legacy_env/);
  assert.match(
    e2eServer,
    /run\("npm", \["run", "build"\]\);[\s\S]*?normalizeGeneratedWranglerConfigForCurrentE2E\(\);[\s\S]*?if \(!testMirror\)/,
    "generated config normalization must run before either E2E target starts consuming the config",
  );
  assert.match(
    e2eServer,
    /normalizeGeneratedWranglerConfigForCurrentE2E\(\);[\s\S]*?"d1",\s*"execute"/,
    "ordinary local E2E must normalize before local D1 bootstrap",
  );
});
