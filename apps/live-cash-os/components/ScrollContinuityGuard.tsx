"use client";

import { useEffect } from "react";

function preserveAnchor(anchor: HTMLElement) {
  const top = anchor.getBoundingClientRect().top;
  anchor.tabIndex = -1;
  anchor.focus({ preventScroll: true });

  const restore = () => {
    if (!anchor.isConnected) return;
    const delta = anchor.getBoundingClientRect().top - top;
    if (Math.abs(delta) > 1) window.scrollBy({ top: delta, left: 0, behavior: "auto" });
  };

  requestAnimationFrame(() => {
    restore();
    requestAnimationFrame(restore);
  });
}

export default function ScrollContinuityGuard() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const button = event.target.closest("button");
      if (!(button instanceof HTMLButtonElement)) return;

      const coldCheck = button.closest<HTMLElement>("[data-guided-cold-example]");
      if (coldCheck) {
        preserveAnchor(coldCheck);
        return;
      }

      const lab = button.closest<HTMLElement>("[data-wave5-lab-module]");
      if (lab && button.matches(":scope, button.primary") && lab.querySelector("textarea.large-input")) {
        preserveAnchor(lab);
      }
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}