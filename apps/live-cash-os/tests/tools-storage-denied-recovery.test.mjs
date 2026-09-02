import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { safeStorageGet, safeStorageSet } from "../lib/profile-storage.ts";

function withThrowingLocalStorage(run) {
  const previous = globalThis.localStorage;
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    get() {
      throw new DOMException("The operation is insecure.", "SecurityError");
    },
  });
  try {
    return run();
  } finally {
    if (previous === undefined) {
      delete globalThis.localStorage;
    } else {
      Object.defineProperty(globalThis, "localStorage", { configurable: true, value: previous, writable: true });
    }
  }
}

function withThrowingStorageMethods(run) {
  const previous = globalThis.localStorage;
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    writable: true,
    value: {
      getItem() { throw new DOMException("The operation is insecure.", "SecurityError"); },
      setItem() { throw new DOMException("The operation is insecure.", "SecurityError"); },
    },
  });
  try {
    return run();
  } finally {
    if (previous === undefined) {
      delete globalThis.localStorage;
    } else {
      Object.defineProperty(globalThis, "localStorage", { configurable: true, value: previous, writable: true });
    }
  }
}

test("C1 safeStorageGet returns null instead of throwing when the accessor itself throws", () => {
  const result = withThrowingLocalStorage(() => safeStorageGet("live-cash-os:e2e-legacy-tools"));
  assert.equal(result, null);
});

test("C2 safeStorageGet returns null instead of throwing when getItem() throws", () => {
  const result = withThrowingStorageMethods(() => safeStorageGet("live-cash-os:locale"));
  assert.equal(result, null);
});

test("C3 safeStorageSet reports failure instead of throwing when setItem() throws", () => {
  const result = withThrowingStorageMethods(() => safeStorageSet("live-cash-os:locale", "en"));
  assert.equal(result, false);
});

test("C4 a normal, storage-available browser still round-trips through the same wrappers", () => {
  const store = new Map();
  const previous = globalThis.localStorage;
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    writable: true,
    value: {
      getItem: (key) => (store.has(key) ? store.get(key) : null),
      setItem: (key, value) => { store.set(key, value); },
    },
  });
  try {
    assert.equal(safeStorageGet("live-cash-os:locale"), null);
    assert.equal(safeStorageSet("live-cash-os:locale", "en"), true);
    assert.equal(safeStorageGet("live-cash-os:locale"), "en");
  } finally {
    if (previous === undefined) {
      delete globalThis.localStorage;
    } else {
      Object.defineProperty(globalThis, "localStorage", { configurable: true, value: previous, writable: true });
    }
  }
});

test("C5 SupportingToolsApp's three storage touchpoints route through the safe wrappers, not raw localStorage", async () => {
  const source = await readFile(new URL("../components/SupportingToolsApp.tsx", import.meta.url), "utf8");
  assert.match(source, /import \{ safeStorageGet, safeStorageSet \} from "\.\.\/lib\/profile-storage"/);
  assert.doesNotMatch(source, /[^.]localStorage\.getItem/, "requestedRuntime/locale-init must not call localStorage.getItem directly");
  assert.doesNotMatch(source, /[^.]localStorage\.setItem/, "locale persistence must not call localStorage.setItem directly");
  assert.match(source, /legacyMarker: safeStorageGet\(E2E_LEGACY_TOOLS_KEY\)/);
  assert.match(source, /const storedLocale = safeStorageGet\(LOCALE_KEY\)/);
  assert.match(source, /safeStorageSet\(LOCALE_KEY, locale\)/);
});
