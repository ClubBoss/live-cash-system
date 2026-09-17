// Development fallback. Production/e2e builds overwrite dist/client/pwa-build-assets.js
// from the exact generated client manifest and server BUILD_ID.
self.__LIVE_CASH_PWA_BUILD__ = Object.freeze({ id: "development", assets: [] });
