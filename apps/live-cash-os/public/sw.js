importScripts("/pwa-build-assets.js");

const BUILD = self.__LIVE_CASH_PWA_BUILD__;
if (!BUILD || typeof BUILD.id !== "string" || !Array.isArray(BUILD.assets)) {
  throw new Error("Live Cash OS PWA build manifest is unavailable");
}

const CACHE_PREFIX = "live-cash-os-shell-";
const CACHE = `${CACHE_PREFIX}${BUILD.id}`;
const BUILD_ASSETS = new Set(BUILD.assets);
const SHELL = ["/", "/mastery/journey", "/manifest.webmanifest", "/favicon.svg", ...BUILD.assets];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE)
        .map((key) => caches.delete(key))))
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

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  const isNavigation = event.request.mode === "navigate";
  const networkResponse = fetch(event.request);
  if (isNavigation) {
    // Register the cache side effect synchronously with the FetchEvent. The
    // active worker must never overwrite its atomic shell with HTML from a
    // newer deployment, so only same-build navigation HTML is admitted.
    event.waitUntil(networkResponse
      .then((response) => response.ok ? cacheCurrentBuildNavigation(event.request, response.clone()) : undefined)
      .catch(() => undefined));
  }
  event.respondWith(
    networkResponse.catch(async () => {
      const cache = await caches.open(CACHE);
      const exact = await cache.match(event.request);
      if (exact) return exact;
      if (isNavigation) {
        const shell = await cache.match("/");
        if (shell) return shell;
      }
      return Response.error();
    }),
  );
});
