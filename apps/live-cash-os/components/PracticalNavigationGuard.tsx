"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { warmPracticalDocument } from "./PracticalDocumentLink";

const clientMasteryRoutes = new Set([
  "/mastery",
  "/mastery/journey",
  "/mastery/session",
  "/mastery/perception",
  "/mastery/study",
  "/mastery/reference",
]);

function internalDestination(anchor: HTMLAnchorElement): URL | null {
  if (anchor.target && anchor.target !== "_self") return null;
  if (anchor.hasAttribute("download")) return null;
  const raw = anchor.getAttribute("href");
  if (!raw || raw.startsWith("#")) return null;
  const url = new URL(raw, window.location.href);
  if (url.origin !== window.location.origin) return null;
  if (clientMasteryRoutes.has(url.pathname)) return url;
  if (url.pathname === "/tools" && url.searchParams.get("tab") === "field") return url;
  return null;
}

function clientHref(destination: URL) {
  return `${destination.pathname}${destination.search}${destination.hash}`;
}

export default function PracticalNavigationGuard() {
  const router = useRouter();

  useEffect(() => {
    const warm = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      const destination = internalDestination(anchor);
      if (destination) warmPracticalDocument(clientHref(destination));
    };

    const navigate = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      const destination = internalDestination(anchor);
      if (!destination || !clientMasteryRoutes.has(destination.pathname)) return;

      const nextHref = clientHref(destination);
      if (nextHref === `${window.location.pathname}${window.location.search}${window.location.hash}`) return;

      event.preventDefault();
      event.stopPropagation();
      try {
        router.push(nextHref);
      } catch (error) {
        console.error("Practical client navigation failed; falling back to document navigation.", error);
        window.location.assign(destination.href);
      }
    };

    document.addEventListener("pointerover", warm, true);
    document.addEventListener("focusin", warm, true);
    document.addEventListener("click", navigate, true);
    return () => {
      document.removeEventListener("pointerover", warm, true);
      document.removeEventListener("focusin", warm, true);
      document.removeEventListener("click", navigate, true);
    };
  }, [router]);

  return null;
}
