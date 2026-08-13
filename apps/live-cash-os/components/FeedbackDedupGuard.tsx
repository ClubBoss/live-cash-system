"use client";

import { useEffect } from "react";

const YOUR_LABELS = new Set(["Твой выбор", "Your choice"]);
const WORKING_LABELS = new Set(["Рабочий выбор", "Working choice"]);

function normalized(value: string | null | undefined): string {
  return (value ?? "").replace(/\s+/gu, " ").trim();
}

function setHidden(node: HTMLElement, hidden: boolean) {
  node.hidden = hidden;
  if (hidden) node.setAttribute("aria-hidden", "true");
  else node.removeAttribute("aria-hidden");
}

export function collapseExactDuplicateFeedback(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>(".feedback-view .answer-panel").forEach((panel) => {
    const children = Array.from(panel.children).filter((child): child is HTMLElement => child instanceof HTMLElement);
    const yoursIndex = children.findIndex((node) => node.tagName === "B" && YOUR_LABELS.has(normalized(node.textContent)));
    const workingIndex = children.findIndex((node) => node.tagName === "B" && WORKING_LABELS.has(normalized(node.textContent)));

    if (yoursIndex < 0 || workingIndex < 0) return;

    const yours = children.slice(yoursIndex + 1, workingIndex).filter((node) => node.tagName === "P");
    const working = children.slice(workingIndex + 1).filter((node) => node.tagName === "P");
    const exactDuplicate = yours.length >= 2
      && working.length >= 2
      && normalized(yours[0].textContent) === normalized(working[0].textContent)
      && normalized(yours[1].textContent) === normalized(working[1].textContent);

    const workingLabel = children[workingIndex];
    const workingRows = working.slice(0, 2);
    setHidden(workingLabel, exactDuplicate);
    for (const row of workingRows) setHidden(row, exactDuplicate);

    if (exactDuplicate) panel.dataset.feedbackDedup = "true";
    else delete panel.dataset.feedbackDedup;
  });
}

export default function FeedbackDedupGuard() {
  useEffect(() => {
    let frame = 0;
    const sync = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => collapseExactDuplicateFeedback());
    };

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return null;
}
