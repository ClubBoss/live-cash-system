"use client";

import { useEffect } from "react";
import { warmPracticalDocument } from "./PracticalDocumentLink";

function internalDestination(anchor: HTMLAnchorElement): URL | null {
  if (anchor.target && anchor.target !== "_self") return null;
  if (anchor.hasAttribute("download")) return null;
  const raw = anchor.getAttribute("href");
  if (!raw || raw.startsWith("#")) return null;
  const url = new URL(raw, window.location.href);
  if (url.origin !== window.location.origin) return null;
  if (url.pathname.startsWith("/mastery")) return url;
  if (url.pathname === "/" && url.searchParams.get("tab") === "field") return url;
  return null;
}

export default function PracticalNavigationGuard() {
  useEffect(() => {
    const warm = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      const destination = internalDestination(anchor);
      if (destination) warmPracticalDocument(`${destination.pathname}${destination.search}${destination.hash}`);
    };

    const navigate = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      const destination = internalDestination(anchor);
      if (!destination) return;
      if (`${destination.pathname}${destination.search}${destination.hash}` === `${window.location.pathname}${window.location.search}${window.location.hash}`) return;
      event.preventDefault();
      event.stopPropagation();
      window.location.assign(destination.href);
    };

    document.addEventListener("pointerover", warm, true);
    document.addEventListener("focusin", warm, true);
    document.addEventListener("click", navigate, true);
    return () => {
      document.removeEventListener("pointerover", warm, true);
      document.removeEventListener("focusin", warm, true);
      document.removeEventListener("click", navigate, true);
    };
  }, []);

  return null;
}
