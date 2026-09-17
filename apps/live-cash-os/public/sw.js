importScripts("/pwa-build-assets.js");

const BUILD = self.__LIVE_CASH_PWA_BUILD__;
if (!BUILD || typeof BUILD.id !== "string" || !Array.isArray(BUILD.assets)) {
  throw new Error("Live Cash OS PWA build manifest is unavailable");
}

const CACHE_PREFIX = "live-cash-os-shell-";
const CACHE = `${CACHE_PREFIX}${BUILD.id}`;
const BUILD_ASSETS = new Set(BUILD.assets);
const SHELL = ["/", "/mastery/journey", "/manifest.webmanifest", "/favicon.svg", ...BUILD.assets];
const RETIREMENT_META_URL = `${self.location.origin}/__live_cash_pwa_retirement__`;

function shellCacheNames(keys) {
  return keys.filter((key) => key.startsWith(CACHE_PREFIX));
}

async function writeRetirementPlan(previousCacheNames, clientIds) {
  const cache = await caches.open(CACHE);
  if (previousCacheNames.length === 0 || clientIds.length === 0) {
    await cache.delete(RETIREMENT_META_URL);
    return;
  }
  await cache.put(RETIREMENT_META_URL, new Response(JSON.stringify({
    previousCacheNames,
    protectedClientIds: clientIds,
  }), { headers: { "content-type": "application/json" } }));
}

async function readRetirementPlan() {
  const cache = await caches.open(CACHE);
  const response = await cache.match(RETIREMENT_META_URL);
  if (!response) return null;
  try {
    const parsed = await response.json();
    if (!Array.isArray(parsed?.previousCacheNames) || !Array.isArray(parsed?.protectedClientIds)) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function preservePreviousGenerationsForOpenClients() {
  const names = shellCacheNames(await caches.keys()).filter((key) => key !== CACHE);
  if (names.length === 0) return;

  const openClients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  const clientIds = openClients.map((client) => client.id).filter(Boolean);
  if (clientIds.length === 0) {
    await Promise.all(names.map((name) => caches.delete(name)));
    return;
  }

  await writeRetirementPlan(names, clientIds);
}

async function retirePreviousGenerationsWhenSafe() {
  const plan = await readRetirementPlan();
  if (!plan) return;

  const liveClients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  const liveIds = new Set(liveClients.map((client) => client.id));
  if (plan.protectedClientIds.some((id) => liveIds.has(id))) return;

  await Promise.all(plan.previousCacheNames.map((name) => caches.delete(name)));
  const cache = await caches.open(CACHE);
  await cache.delete(RETIREMENT_META_URL);
}

async function protectedPriorCacheMatch(request, clientId) {
  if (!clientId) return null;
  const plan = await readRetirementPlan();
  if (!plan || !plan.protectedClientIds.includes(clientId)) return null;

  for (const cacheName of plan.previousCacheNames) {
    const cache = await caches.open(cacheName);
    const hit = await cache.match(request);
    if (hit) return hit;
  }
  return null;
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    preservePreviousGenerationsForOpenClients()
      .then(() => self.clients.claim()),
  );
});

async function navigationBelongsToCurrentBuild(response) {
  if (!response.ok) return false;
  const html = await response.text();
  const references = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/giu)]
    .map((match) => {
      try { return new URL(match[1], self.location.origin); } catch { return null; }
    })
    .filter((url) => url && url.origin === self.location.origin && url.pathname.startsWith("/_next/"));
  return references.length > 0 && references.every((url) => BUILD_ASSETS.has(url.pathname));
}

async function cacheCurrentBuildNavigation(request, response) {
  if (!(await navigationBelongsToCurrentBuild(response.clone()))) return;
  const cache = await caches.open(CACHE);
  await cache.put(request, response);
}

async function offlineFallback(request, clientId, isNavigation) {
  const current = await caches.open(CACHE);
  const exact = await current.match(request);
  if (exact) return exact;

  const prior = await protectedPriorCacheMatch(request, clientId);
  if (prior) return prior;

  if (isNavigation) {
    const shell = await current.match("/");
    if (shell) return shell;
  }
  return Response.error();
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  const isNavigation = event.request.mode === "navigate";
  const clientId = event.clientId || "";
  const networkResponse = fetch(event.request);

  event.waitUntil(retirePreviousGenerationsWhenSafe().catch(() => undefined));

  if (isNavigation) {
    event.waitUntil(networkResponse
      .then((response) => response.ok ? cacheCurrentBuildNavigation(event.request, response.clone()) : undefined)
      .catch(() => undefined));
  }

  event.respondWith(
    networkResponse
      .then(async (response) => {
        if (response.ok) return response;
        if (url.pathname.startsWith("/_next/")) {
          const cached = await offlineFallback(event.request, clientId, false);
          if (cached.type !== "error") return cached;
        }
        return response;
      })
      .catch(() => offlineFallback(event.request, clientId, isNavigation)),
  );
});
