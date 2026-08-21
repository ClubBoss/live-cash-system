"use client";

import { useEffect } from "react";

const FIELD_LABELS = new Set(["Руки", "Hands"]);

export default function LegacyToolDeepLink() {
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("tab") !== "field") return;

    let observer: MutationObserver | null = null;
    let cancelled = false;

    const openRequestedTool = () => {
      if (cancelled) return false;
      const nav = document.querySelector('nav[aria-label="Основная навигация"], nav[aria-label="Primary navigation"]');
      const buttons = nav ? Array.from(nav.querySelectorAll("button")) : [];
      const target = buttons.find((button) => FIELD_LABELS.has(button.textContent?.trim() ?? ""));
      if (!(target instanceof HTMLButtonElement)) return false;

      target.click();
      url.searchParams.delete("tab");
      window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
      observer?.disconnect();
      return true;
    };

    if (!openRequestedTool()) {
      observer = new MutationObserver(openRequestedTool);
      observer.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, []);

  return null;
}
