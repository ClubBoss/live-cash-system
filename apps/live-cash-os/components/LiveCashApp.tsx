"use client";

import LiveCashAppCore from "./LiveCashAppCore";
import Wave5PracticeLayer from "./Wave5PracticeLayer";

/**
 * Runtime shell. Locale changes are rendered directly by LiveCashAppCore;
 * no DOM text replacement or post-render localisation bridge is used.
 * Wave5PracticeLayer remains isolated here only for the already-accepted
 * prediction-first lab and mixed-practice behavior.
 */
export default function LiveCashApp() {
  return <>
    <LiveCashAppCore />
    <Wave5PracticeLayer />
  </>;
}
