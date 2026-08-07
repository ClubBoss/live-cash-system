"use client";

import { useEffect } from "react";

const HEADING_SELECTOR = ".session h1, .session h2, .surface h1, .surface h2, .wave5-lab-gate h2";

function ensureAccessibleNames() {
  document.querySelectorAll<HTMLTextAreaElement>("textarea.large-input:not([aria-label]):not([aria-labelledby])").forEach((textarea, index) => {
    const container = textarea.closest(".session, .surface") ?? textarea.parentElement;
    const heading = container?.querySelector<HTMLElement>("h1, h2");
    if (!heading) return;
    if (!heading.id) heading.id = `w8-textarea-heading-${index}`;
    textarea.setAttribute("aria-labelledby", heading.id);
  });

  document.querySelectorAll<HTMLElement>(".progress").forEach((progress) => {
    const fill = progress.querySelector<HTMLElement>("i");
    const value = Math.max(0, Math.min(100, Number.parseFloat(fill?.style.width ?? "0") || 0));
    progress.setAttribute("role", "progressbar");
    progress.setAttribute("aria-valuemin", "0");
    progress.setAttribute("aria-valuemax", "100");
    progress.setAttribute("aria-valuenow", String(Math.round(value)));
  });

  document.querySelectorAll<HTMLElement>(".wave5-lab-gate:not([aria-label])").forEach((gate) => {
    const heading = gate.querySelector<HTMLElement>("h2");
    gate.setAttribute("role", "region");
    if (heading?.textContent) gate.setAttribute("aria-label", heading.textContent.trim());
  });
}

function focusRenderedContext(previous: HTMLElement) {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    if (document.contains(previous) && previous.offsetParent !== null) return;
    if (document.activeElement && document.activeElement !== document.body) return;
    const heading = document.querySelector<HTMLElement>(HEADING_SELECTOR);
    if (!heading) return;
    const hadTabIndex = heading.hasAttribute("tabindex");
    heading.setAttribute("tabindex", "-1");
    heading.focus({ preventScroll: true });
    heading.scrollIntoView({ block: "nearest" });
    if (!hadTabIndex) heading.addEventListener("blur", () => heading.removeAttribute("tabindex"), { once: true });
  }));
}

export default function Wave8AccessibilityLayer() {
  useEffect(() => {
    ensureAccessibleNames();

    const observer = new MutationObserver(() => ensureAccessibleNames());
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["style"] });

    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>("button, .file-button") : null;
      if (!target) return;
      focusRenderedContext(target);
    };

    document.addEventListener("click", onClick, true);
    return () => {
      observer.disconnect();
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  return null;
}
