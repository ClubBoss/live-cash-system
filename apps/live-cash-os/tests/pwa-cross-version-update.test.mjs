import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import { collectPwaClientAssets, renderPwaBuildAssets } from "../scripts/generate-pwa-build-assets.mjs";

const ORIGIN = "https://live-cash.test";
const swSource = await readFile(new URL("../public/sw.js", import.meta.url), "utf8");

const v1 = {
  root: '<script src="/_next/static/chunks/app-v1.js"></script>',
  assets: ["/_next/static/chunks/app-v1.js", "/_next/static/chunks/lazy-v1.js"],
};
const v2 = {
  root: '<script src="/_next/static/chunks/app-v2.js"></script>',
  assets: ["/_next/static/chunks/app-v2.js", "/_next/static/chunks/lazy-v2.js"],
};
const v3 = {
  root: '<script src="/_next/static/chunks/app-v3.js"></script>',
  assets: ["/_next/static/chunks/app-v3.js", "/_next/static/chunks/lazy-v3.js"],
};

function referencedAssets(root) {
  return [...root.matchAll(/(?:src|href)="([^"]+)"/gu)].map((match) => match[1]);
}

function legacyMixedGenerationFixture() {
  const legacyV1Root = '<script src="/_next/static/chunks/app-v1.js"></script><link href="/_next/static/app-v1.css" rel="stylesheet">';
  const legacyV2Root = '<script src="/_next/static/chunks/app-v2.js"></script><link href="/_next/static/app-v2.css" rel="stylesheet">';
  const cache = new Map([
    ["/", legacyV1Root],
    ["/_next/static/chunks/app-v1.js", "v1-js"],
    ["/_next/static/app-v1.css", "v1-css"],
  ]);
  cache.set("/", legacyV2Root);
  cache.set("/_next/static/chunks/app-v2.js", "v2-js");
  return referencedAssets(cache.get("/")).filter((asset) => !cache.has(asset));
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

function normalizeRequest(request) {
  const value = typeof request === "string" ? request : request.url;
  return new URL(value, ORIGIN).href;
}

function createServiceWorkerHarness(build = v2, initialClients = ["prior-client"]) {
  const listeners = new Map();
  const stores = new Map();
  const network = new Map();
  let clientIds = [...initialClients];
  let offline = false;
  let claimed = false;
  let skipped = false;

  class FakeCache {
    constructor(name) {
      this.name = name;
      if (!stores.has(name)) stores.set(name, new Map());
    }

    async match(request) {
      const response = stores.get(this.name).get(normalizeRequest(request));
      return response ? response.clone() : undefined;
    }

    async put(request, response) {
      stores.get(this.name).set(normalizeRequest(request), response.clone());
    }

    async delete(request) {
      return stores.get(this.name).delete(normalizeRequest(request));
    }

    async addAll(requests) {
      const staged = [];
      for (const request of requests) {
        const key = normalizeRequest(request);
        const response = network.get(key);
        if (!response || !response.ok) throw new Error(`missing install resource: ${key}`);
        staged.push([key, response.clone()]);
      }
      for (const [key, response] of staged) stores.get(this.name).set(key, response);
    }
  }

  const caches = {
    open: async (name) => new FakeCache(name),
    keys: async () => [...stores.keys()],
    delete: async (name) => stores.delete(name),
  };

  const self = {
    __LIVE_CASH_PWA_BUILD__: { id: build === v2 ? "v2" : "v3", assets: build.assets },
    location: { origin: ORIGIN },
    clients: {
      matchAll: async () => clientIds.map((id) => ({ id })),
      claim: async () => { claimed = true; },
    },
    skipWaiting: async () => { skipped = true; },
    addEventListener: (type, handler) => listeners.set(type, handler),
  };

  const fetch = async (request) => {
    if (offline) throw new TypeError("offline");
    const response = network.get(normalizeRequest(request));
    return response ? response.clone() : new Response("not found", { status: 404 });
  };

  vm.runInNewContext(swSource, {
    self,
    caches,
    fetch,
    importScripts: () => undefined,
    URL,
    Request,
    Response,
    Set,
    Map,
    JSON,
    console,
  });

  async function dispatch(type, payload = {}) {
    const waits = [];
    let responsePromise = null;
    const event = {
      ...payload,
      waitUntil(promise) { waits.push(Promise.resolve(promise)); },
      respondWith(promise) { responsePromise = Promise.resolve(promise); },
    };
    const handler = listeners.get(type);
    assert.ok(handler, `missing ${type} listener`);
    handler(event);
    const response = responsePromise ? await responsePromise : null;
    await Promise.all(waits);
    return response;
  }

  function seedCache(name, entries) {
    const store = new Map();
    for (const [path, body] of entries) {
      store.set(normalizeRequest(path), new Response(body, { status: 200 }));
    }
    stores.set(name, store);
  }

  function seedNetwork(path, body) {
    network.set(normalizeRequest(path), new Response(body, { status: 200 }));
  }

  function seedInstallNetwork(target = build) {
    seedNetwork("/", target.root);
    seedNetwork("/mastery/journey", target.root);
    seedNetwork("/manifest.webmanifest", "{}");
    seedNetwork("/favicon.svg", "<svg/>");
    for (const asset of target.assets) seedNetwork(asset, `body:${asset}`);
  }

  return {
    dispatch,
    seedCache,
    seedNetwork,
    seedInstallNetwork,
    stores,
    setOffline(value) { offline = value; },
    setClients(ids) { clientIds = [...ids]; },
    get claimed() { return claimed; },
    get skipped() { return skipped; },
  };
}

test("ADD-006 two-build fixture reproduces the legacy V1 -> V2 mixed-root failure", () => {
  assert.deepEqual(legacyMixedGenerationFixture(), ["/_next/static/app-v2.css"]);
});

test("ADD-006 atomic install keeps complete V1 until every V2 asset is available, then switches as one generation", () => {
  let active = installAtomicBuild(new Map(), v1, new Set(v1.assets));
  assert.ok(v1.assets.every((asset) => active.has(asset)));

  active = installAtomicBuild(active, v2, new Set([v2.assets[0]]));
  assert.equal(active.get("/"), v1.root, "partial V2 install must leave the complete V1 cache active");

  active = installAtomicBuild(active, v2, new Set(v2.assets));
  assert.equal(active.get("/"), v2.root);
  assert.ok(v2.assets.every((asset) => active.has(asset)));
});

test("legacy V1 transition cannot recover a previously-unloaded lazy asset after it disappears from the network", async () => {
  const harness = createServiceWorkerHarness(v2, ["legacy-v1-client"]);
  harness.seedCache("live-cash-os-shell-v1", [
    ["/", v1.root],
    ["/mastery/journey", v1.root],
    [v1.assets[0], "app-v1"],
  ]);
  harness.seedInstallNetwork(v2);

  await harness.dispatch("install");
  await harness.dispatch("activate");
  harness.setOffline(true);

  const lazy = await harness.dispatch("fetch", {
    request: { method: "GET", url: `${ORIGIN}${v1.assets[1]}`, mode: "same-origin" },
    clientId: "legacy-v1-client",
  });
  assert.equal(lazy.type, "error", "missing legacy bytes cannot be fabricated by the new worker");
  assert.ok(harness.stores.has("live-cash-os-shell-v1"), "available legacy bytes remain protected for the open client");
  assert.ok(harness.stores.has("live-cash-os-shell-v2"), "the complete current generation remains independently available");
});

test("legacy V1 transition preserves an asset that the old worker had already runtime-cached", async () => {
  const harness = createServiceWorkerHarness(v2, ["legacy-v1-client"]);
  harness.seedCache("live-cash-os-shell-v1", [
    ["/", v1.root],
    ["/mastery/journey", v1.root],
    [v1.assets[0], "app-v1"],
    [v1.assets[1], "lazy-v1"],
  ]);
  harness.seedInstallNetwork(v2);

  await harness.dispatch("install");
  await harness.dispatch("activate");
  harness.setOffline(true);

  const lazy = await harness.dispatch("fetch", {
    request: { method: "GET", url: `${ORIGIN}${v1.assets[1]}`, mode: "same-origin" },
    clientId: "legacy-v1-client",
  });
  assert.equal(await lazy.text(), "lazy-v1");
});

test("generation-aware V2 client keeps its complete generation through V3 takeover until safe retirement", async () => {
  const harness = createServiceWorkerHarness(v3, ["v2-client"]);
  harness.seedCache("live-cash-os-shell-v2", [
    ["/", v2.root],
    ["/mastery/journey", v2.root],
    [v2.assets[0], "app-v2"],
    [v2.assets[1], "lazy-v2"],
  ]);
  harness.seedInstallNetwork(v3);

  await harness.dispatch("install");
  assert.equal(harness.skipped, true);
  await harness.dispatch("activate");
  assert.equal(harness.claimed, true);
  assert.ok(harness.stores.has("live-cash-os-shell-v2"));

  harness.setOffline(true);
  const lazy = await harness.dispatch("fetch", {
    request: { method: "GET", url: `${ORIGIN}${v2.assets[1]}`, mode: "same-origin" },
    clientId: "v2-client",
  });
  assert.equal(await lazy.text(), "lazy-v2");

  harness.setClients(["v3-client"]);
  const current = await harness.dispatch("fetch", {
    request: { method: "GET", url: `${ORIGIN}${v3.assets[0]}`, mode: "same-origin" },
    clientId: "v3-client",
  });
  assert.equal(await current.text(), `body:${v3.assets[0]}`);
  assert.equal(harness.stores.has("live-cash-os-shell-v2"), false);
});

test("no open prior client retires previous generation during activation", async () => {
  const harness = createServiceWorkerHarness(v2, []);
  harness.seedCache("live-cash-os-shell-v1", [["/", v1.root], [v1.assets[0], "app-v1"]]);
  harness.seedInstallNetwork(v2);

  await harness.dispatch("install");
  await harness.dispatch("activate");
  assert.equal(harness.stores.has("live-cash-os-shell-v1"), false);
  assert.ok(harness.stores.has("live-cash-os-shell-v2"));
});

test("API requests are never intercepted or written to CacheStorage", async () => {
  const harness = createServiceWorkerHarness(v2, ["v2-client"]);
  harness.seedInstallNetwork(v2);
  await harness.dispatch("install");
  await harness.dispatch("activate");
  const before = [...harness.stores.values()].reduce((count, store) => count + store.size, 0);

  const response = await harness.dispatch("fetch", {
    request: { method: "GET", url: `${ORIGIN}/api/state`, mode: "same-origin" },
    clientId: "v2-client",
  });
  const after = [...harness.stores.values()].reduce((count, store) => count + store.size, 0);
  assert.equal(response, null, "API traffic must bypass the service worker response path");
  assert.equal(after, before, "API traffic must not mutate CacheStorage");
});

test("failed current-generation precache never reaches skipWaiting and cannot replace the prior shell", async () => {
  const harness = createServiceWorkerHarness(v2, ["legacy-v1-client"]);
  harness.seedCache("live-cash-os-shell-v1", [["/", v1.root], [v1.assets[0], "app-v1"]]);
  harness.seedInstallNetwork(v2);
  harness.stores.clear();
  harness.seedCache("live-cash-os-shell-v1", [["/", v1.root], [v1.assets[0], "app-v1"]]);
  harness.seedNetwork("/", v2.root);
  harness.seedNetwork("/mastery/journey", v2.root);
  harness.seedNetwork("/manifest.webmanifest", "{}");
  harness.seedNetwork("/favicon.svg", "<svg/>");
  harness.seedNetwork(v2.assets[0], "app-v2");

  await assert.rejects(harness.dispatch("install"), /missing install resource/u);
  assert.equal(harness.skipped, false);
  const priorRoot = harness.stores.get("live-cash-os-shell-v1").get(`${ORIGIN}/`);
  assert.equal(await priorRoot.text(), v1.root);
});

test("current-generation offline navigation falls back only to the complete current shell", async () => {
  const harness = createServiceWorkerHarness(v2, ["v2-client"]);
  harness.seedInstallNetwork(v2);
  await harness.dispatch("install");
  await harness.dispatch("activate");
  harness.setOffline(true);

  const navigation = await harness.dispatch("fetch", {
    request: { method: "GET", url: `${ORIGIN}/mastery/session`, mode: "navigate" },
    clientId: "v2-client",
  });
  assert.equal(await navigation.text(), v2.root);
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
});

test("service worker keeps API traffic outside CacheStorage and scopes prior fallback to protected clients", () => {
  assert.match(swSource, /url\.pathname\.startsWith\("\/api\/"\)/u);
  assert.match(swSource, /protectedPriorCacheMatch\(request, clientId\)/u);
  assert.match(swSource, /protectedClientIds\.includes\(clientId\)/u);
  assert.match(swSource, /retirePreviousGenerationsWhenSafe/u);
});
