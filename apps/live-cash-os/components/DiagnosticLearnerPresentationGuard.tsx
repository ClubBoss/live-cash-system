"use client";

import { useLayoutEffect } from "react";
import { supportTabFromSearch } from "../lib/support-tools-routing";

const internalDiagnosticIdPattern = /\b(?:LD-\d+|LCM-\d+)\b(?:\s*[·:—-]\s*)?/giu;

function cleanDiagnosticPresentation(root: HTMLElement) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  for (const node of nodes) {
    const current = node.nodeValue ?? "";
    const next = current.replace(internalDiagnosticIdPattern, "").replace(/^\s*[·:—-]\s*/u, "");
    if (next !== current) node.nodeValue = next;
  }
}

export default function DiagnosticLearnerPresentationGuard() {
  useLayoutEffect(() => {
    let applying = false;
    const run = () => {
      if (applying || supportTabFromSearch(window.location.search) !== "diagnostic") return;
      applying = true;
      try {
        const main = document.querySelector("main");
        if (main) cleanDiagnosticPresentation(main);
      } finally {
        applying = false;
      }
    };
    run();
    const observer = new MutationObserver(run);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, []);
  return null;
}
