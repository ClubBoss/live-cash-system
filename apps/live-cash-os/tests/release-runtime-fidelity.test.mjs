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

test("release E2E starts the built app in the generated Cloudflare Worker runtime", () => {
  assert.match(
    packageJson.scripts.start,
    /wrangler dev --config dist\/server\/wrangler\.json/,
  );
  assert.doesNotMatch(packageJson.scripts.start, /vinext start/);

  for (const [name, config] of [
    ["primary", primaryConfig],
    ["cross-browser", crossBrowserConfig],
  ]) {
    assert.match(
      config,
      /npm run start -- --ip 127\.0\.0\.1 --port 5173/,
      `${name} Playwright config must start the generated Worker runtime`,
    );
    assert.doesNotMatch(
      config,
      /--hostname 127\.0\.0\.1/,
      `${name} Playwright config must not pass Node-only host flags`,
    );
  }
});
