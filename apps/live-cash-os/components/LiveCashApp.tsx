"use client";

import LiveCashAppCore from "./LiveCashAppCore";

/**
 * Runtime shell. Locale changes are rendered directly by LiveCashAppCore;
 * no DOM text replacement or post-render localisation bridge is used.
 */
export default function LiveCashApp() {
  return <LiveCashAppCore />;
}
