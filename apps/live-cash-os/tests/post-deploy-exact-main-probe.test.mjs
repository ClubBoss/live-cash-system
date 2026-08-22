import assert from "node:assert/strict";
import test from "node:test";

const LIVE_URL = "https://live-cash-os-mobile-test.blufferus.workers.dev/";
const EXPECTED_SHA = "d5e4583414d88e05d014d352fdafd63790203a59";

async function fetchText(url) {
  const response = await fetch(url, { redirect: "follow", cache: "no-store" });
  const text = await response.text();
  return { response, text };
}

function assetUrls(html) {
  const urls = new Set();
  for (const match of html.matchAll(/(?:src|href)=["']([^"']+)["']/g)) {
    const value = match[1];
    if (!value || value.startsWith("data:")) continue;
    try {
      const url = new URL(value, LIVE_URL);
      if (url.origin === new URL(LIVE_URL).origin && /\.(?:js|mjs)(?:\?|$)/.test(url.pathname + url.search)) urls.add(url.href);
    } catch { /* ignore malformed asset URLs */ }
  }
  return [...urls];
}

test("canonical Workers release serves the exact merged-main build", async () => {
  let lastError;
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      const { response, text: html } = await fetchText(LIVE_URL);
      assert.equal(response.status, 200, `root HTTP status on attempt ${attempt}`);

      let found = html.includes(EXPECTED_SHA);
      const checkedAssets = [];
      if (!found) {
        for (const url of assetUrls(html).slice(0, 80)) {
          const asset = await fetchText(url);
          if (!asset.response.ok) continue;
          checkedAssets.push(url);
          if (asset.text.includes(EXPECTED_SHA)) {
            found = true;
            break;
          }
        }
      }

      assert.ok(found, `exact build SHA ${EXPECTED_SHA} not found in root or ${checkedAssets.length} JS assets`);

      const unknown = await fetch(new URL("/api/state", LIVE_URL), {
        headers: { "x-live-cash-profile-code": "LCO-AAAAAAAAAAAAAAAAAAAA" },
        cache: "no-store",
      });
      assert.equal(unknown.status, 401, "test-mirror unknown invite must be rejected");
      const body = await unknown.json();
      assert.equal(body.code, "AUTH_REQUIRED");

      console.log(`POST_DEPLOY_EXACT_MAIN_GREEN sha=${EXPECTED_SHA} url=${LIVE_URL} attempt=${attempt}`);
      return;
    } catch (error) {
      lastError = error;
      if (attempt < 5) await new Promise((resolve) => setTimeout(resolve, 10_000));
    }
  }
  throw lastError;
});
