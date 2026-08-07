"use client";

import LiveCashAppCore from "./LiveCashAppCore";

/**
 * Runtime shell. Locale changes are rendered directly by LiveCashAppCore;
 * no DOM text replacement or post-render localisation bridge is used.
 * The accepted Wave 5 practice layer is composed once by app/page.tsx.
 */
export default function LiveCashApp() {
  return <LiveCashAppCore />;
}
