import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const sw = await readFile(new URL("../public/sw.js", import.meta.url), "utf8");

test("service worker uses a versioned Wave 9 cache and removes older caches", () => {
  assert.match(sw, /live-cash-os-shell-w9-/);
  assert.doesNotMatch(sw, /live-cash-os-shell-v1/);
  assert.match(sw, /keys\.filter\(\(key\) => key !== CACHE\)/);
});

test("API traffic is never cached by the service worker", () => {
  assert.match(sw, /url\.pathname\.startsWith\("\/api\/"\)/);
});

test("offline root fallback is navigation-only and cannot return HTML for missing JS or CSS", () => {
  assert.match(sw, /const isNavigation = event\.request\.mode === "navigate"/);
  assert.match(sw, /if \(isNavigation\)/);
  assert.match(sw, /return Response\.error\(\)/);
});

test("successful runtime responses refresh the exact cached request", () => {
  assert.match(sw, /if \(response\.ok\)/);
  assert.match(sw, /cache\.put\(event\.request, copy\)/);
});
