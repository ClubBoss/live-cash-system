import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { collectPwaClientAssets, renderPwaBuildAssets } from "../scripts/generate-pwa-build-assets.mjs";

const v1 = {
  root: '<script src="/_next/static/chunks/app-v1.js"></script><link href="/_next/static/app-v1.css" rel="stylesheet">',
  assets: ["/_next/static/chunks/app-v1.js", "/_next/static/app-v1.css"],
};
const v2 = {
  root: '<script src="/_next/static/chunks/app-v2.js"></script><link href="/_next/static/app-v2.css" rel="stylesheet">',
  assets: ["/_next/static/chunks/app-v2.js", "/_next/static/app-v2.css"],
};

function referencedAssets(root) {
  return [...root.matchAll(/(?:src|href)="([^"]+)"/gu)].map((match) => match[1]);
}

function legacyMixedGenerationFixture() {
  const cache = new Map([["/", v1.root], ...v1.assets.map((asset) => [asset, `body:${asset}`])]);
  // V2 is deployed. The legacy network-first worker immediately replaces root,
  // but only the first V2 chunk has happened to be requested before network loss.
  cache.set("/", v2.root);
  cache.set(v2.assets[0], `body:${v2.assets[0]}`);
  const root = cache.get("/");
  return referencedAssets(root).filter((asset) => !cache.has(asset));
}

function installAtomicBuild(active, build, availableAssets) {
  const staging = new Map();
  const required = ["/", ...build.assets];
  for (const request of required) {
    if (request === "/") staging.set(request, build.root);
    else if (availableAssets.has(request)) staging.set(request, `body:${request}`);
    else return active;
  }
  return staging;
}

test("ADD-006 two-build fixture reproduces the legacy V1 -> V2 mixed-root failure", () => {
  assert.deepEqual(legacyMixedGenerationFixture(), ["/_next/static/app-v2.css"]);
});

test("ADD-006 atomic install keeps complete V1 until every V2 asset is available, then switches as one generation", () => {
  let active = installAtomicBuild(new Map(), v1, new Set(v1.assets));
  assert.deepEqual(referencedAssets(active.get("/")).every((asset) => active.has(asset)), true);

  active = installAtomicBuild(active, v2, new Set([v2.assets[0]]));
  assert.equal(active.get("/"), v1.root, "partial V2 install must leave the complete V1 cache active");

  active = installAtomicBuild(active, v2, new Set(v2.assets));
  assert.equal(active.get("/"), v2.root);
  assert.deepEqual(referencedAssets(active.get("/")).every((asset) => active.has(asset)), true);
});

test("generated PWA build manifest is deterministic per build and changes across two builds", () => {
  const manifest1 = {
    app: { file: "_next/static/chunks/app-v1.js", css: ["_next/static/app-v1.css"] },
    shared: { file: "_next/static/chunks/shared-v1.js" },
  };
  const manifest2 = {
    app: { file: "_next/static/chunks/app-v2.js", css: ["_next/static/app-v2.css"] },
    shared: { file: "_next/static/chunks/shared-v2.js" },
  };
  assert.deepEqual(collectPwaClientAssets(manifest1), [
    "/_next/static/app-v1.css",
    "/_next/static/chunks/app-v1.js",
    "/_next/static/chunks/shared-v1.js",
  ]);
  const first = renderPwaBuildAssets("build-v1", manifest1);
  assert.equal(first, renderPwaBuildAssets("build-v1", manifest1));
  assert.notEqual(first, renderPwaBuildAssets("build-v2", manifest2));
  assert.match(first, /_next\/static\/chunks\/app-v1\.js/u);
});

test("service worker uses build-scoped atomic cache and never caches API traffic", async () => {
  const sw = await readFile(new URL("../public/sw.js", import.meta.url), "utf8");
  assert.match(sw, /importScripts\("\/pwa-build-assets\.js"\)/u);
  assert.match(sw, /const CACHE = `\$\{CACHE_PREFIX\}\$\{BUILD\.id\}`/u);
  assert.match(sw, /cache\.addAll\(SHELL\)/u);
  assert.match(sw, /\.then\(\(\) => self\.skipWaiting\(\)\)/u);
  assert.match(sw, /BUILD_ASSETS\.has\(url\.pathname\)/u);
  assert.match(sw, /url\.pathname\.startsWith\("\/api\/"\)/u);
  assert.doesNotMatch(sw, /cache\.put\(event\.request, copy\)/u);
});
