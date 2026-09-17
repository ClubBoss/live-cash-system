# PWA legacy transition contract

## Scope

The generation-aware service worker atomically precaches the current build shell and complete generated client-asset manifest. It retains older `live-cash-os-shell-*` caches while clients that were open during takeover still exist, and retires those caches once the protected clients are gone. `/api/*` is never handled by the service worker cache path.

## One-time legacy boundary

The service worker that existed before generation-aware precaching did not possess a complete manifest for its build. It precached only its base shell and acquired additional JS/CSS only after runtime fetches. Therefore a lazy asset that an already-open legacy client has never requested may be absent from both the legacy CacheStorage and the post-deploy network.

The new worker cannot safely reconstruct or fabricate those missing bytes. If that legacy client first requests such an unavailable asset while offline after takeover, the request fails with `Response.error()`. This is an explicit one-time migration limitation, not a guarantee supplied by the generation-aware lifecycle.

The transition preserves every legacy asset that actually exists in the prior cache for protected open clients. A missing legacy asset is not substituted with a current-generation asset, so the failure is bounded rather than creating a mixed-generation runtime.

## Guarantee after the first generation-aware install

After a successful clean generation-aware install, the current shell and all generated build assets are precached atomically before `skipWaiting()`. A partial/failed install does not advance activation. During the next generation-aware update, a complete prior generation remains available to clients that were open at takeover, including lazy assets from that generated manifest. When no protected prior client remains, the previous cache generation is retired.

Current-generation offline navigation falls back to the complete current root shell. API traffic remains network-owned and outside CacheStorage.

## Executable evidence

`tests/pwa-cross-version-update.test.mjs` covers:

1. incomplete real-legacy cache -> generation-aware update -> offline first request for a missing legacy lazy asset fails without mixed-generation substitution;
2. a legacy runtime-cached asset remains usable by the protected old client;
3. complete generation-aware V2 -> V3 preserves V2 for an open V2 client;
4. no open prior client permits immediate prior-generation retirement;
5. `/api/*` bypasses the service worker cache path;
6. failed/partial current-generation precache never reaches `skipWaiting()` and leaves the prior shell untouched;
7. current-generation offline navigation uses the complete current shell.
