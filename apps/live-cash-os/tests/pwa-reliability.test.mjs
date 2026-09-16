import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const sw = await readFile(new URL("../public/sw.js", import.meta.url), "utf8");

test("service worker uses a generated build-scoped cache and protects previous complete generations for open clients", () => {
  assert.match(sw, /CACHE_PREFIX = "live-cash-os-shell-"/u);
  assert.match(sw, /CACHE = `\$\{CACHE_PREFIX\}\$\{BUILD\.id\}`/u);
  assert.match(sw, /preservePreviousGenerationsForOpenClients/u);
  assert.match(sw, /protectedClientIds/u);
  assert.match(sw, /retirePreviousGenerationsWhenSafe/u);
});

test("API traffic is never cached by the service worker", () => {
  assert.match(sw, /url\.pathname\.startsWith\("\/api\/"\)/u);
});

test("offline root fallback is navigation-only and cannot return HTML for a missing unprotected asset", () => {
  assert.match(sw, /const isNavigation = event\.request\.mode === "navigate"/u);
  assert.match(sw, /if \(isNavigation\)/u);
  assert.match(sw, /return Response\.error\(\)/u);
});

test("new build activates only after root and generated client assets are fully cached", () => {
  assert.match(sw, /const SHELL = \["\/", "\/mastery\/journey", "\/manifest\.webmanifest", "\/favicon\.svg", \.\.\.BUILD\.assets\]/u);
  assert.match(sw, /cache\.addAll\(SHELL\)/u);
  assert.match(sw, /\.then\(\(\) => self\.skipWaiting\(\)\)/u);
});

test("prior-generation exact fallback is restricted to clients present at takeover", () => {
  assert.match(sw, /protectedPriorCacheMatch\(request, clientId\)/u);
  assert.match(sw, /!plan \|\| !plan\.protectedClientIds\.includes\(clientId\)/u);
  assert.match(sw, /previousCacheNames/u);
});
