"use client";

import { useLayoutEffect } from "react";
import { sanitizeLearnerAccessibilityAttribute } from "../lib/learner-accessibility-attribute-firewall";
import {
  isLearnerMetadataOnlyLine,
  sanitizeLearnerPresentationText,
  type LearnerPresentationLocale,
} from "../lib/learner-presentation-firewall";

// Retained only as a bounded compatibility fallback for the already-published
// Quick Start pot-odds cards. New publication fixes belong in source fields.
const legacyExactFallbacks = new Map<string, string>([
  ["Первый круг", "Старт обучения"],
  ["First Journey", "Start learning"],
  [
    "Смешанная практика не проверяет незнакомые концепции. Сначала пройди первый круг.",
    "Практика не проверяет незнакомые концепции. Сначала пройди старт обучения.",
  ],
  [
    "Mixed practice will not test an unseen concept.",
    "Practice will not test a concept you have not learned yet.",
  ],
  [
    "Hero рискует 1 единицей, чтобы выиграть 2. Нужно ли выигрывать более 50% раздач, чтобы call был прибыльным?",
    "В банке 2 единицы. Hero должен доплатить 1 единицу, после чего будущих ставок не будет. Какую минимальную equity должен иметь call для безубыточности?",
  ],
  ["Нет. Порог безубыточности около одной трети.", "Около 33,3%."],
  [
    "FTGU-E01 прямо показывает, что pot odds задают required equity и порог не равен автоматически 50%.",
    "После call итоговый банк будет 3 единицы. Hero вкладывает 1 из этих 3, поэтому порог безубыточности: 1 / (2 + 1) = 33,3%. Сравнивай equity руки с этим порогом, а не с 50%.",
  ],
  [
    "Hero risks 1 unit to win 2. Must the call win more than 50% of the time to be profitable?",
    "The pot is 2 units. Hero must call 1 unit and there will be no future betting. What minimum equity does the call need to break even?",
  ],
  ["No. The break-even threshold is about one third.", "About 33.3%."],
  [
    "FTGU-E01 explicitly shows that pot odds determine required equity and the threshold is not automatically 50%.",
    "After the call the final pot is 3 units. Hero contributes 1 of those 3, so the break-even threshold is 1 / (2 + 1) = 33.3%. Compare the hand's equity with that threshold, not with 50%.",
  ],
  [
    "Цена call стала хуже, а диапазон соперника не изменился. Что происходит с required equity?",
    "В банке 2 единицы. Теперь call стоит 2 единицы, и будущих ставок не будет. Какой новый порог безубыточности?",
  ],
  ["Required equity растёт.", "50%."],
  [
    "Когда будущих решений нет, цена и equity доминируют; более дорогой call требует большей доли банка.",
    "После call итоговый банк будет 4 единицы. Hero вкладывает 2 из 4, поэтому required equity = 2 / (2 + 2) = 50%. Изменилась только цена — порог вырос с 33,3% до 50%.",
  ],
  [
    "The call price becomes worse while villain's range is unchanged. What happens to required equity?",
    "The pot is 2 units. The call now costs 2 units and there will be no future betting. What is the new break-even threshold?",
  ],
  ["Required equity increases.", "50%."],
  [
    "With no future decisions, price and equity dominate; a worse price requires a larger share of the pot.",
    "After the call the final pot is 4 units. Hero contributes 2 of those 4, so required equity = 2 / (2 + 2) = 50%. Only the price changed, so the threshold rose from 33.3% to 50%.",
  ],
]);

const learnerAccessibilityAttributes = ["aria-label", "aria-description", "title", "alt"] as const;

function currentLocale(): LearnerPresentationLocale {
  return document.documentElement.lang === "en" ? "en" : "ru";
}

function normalizeLearnerSafeCopy(value: string, locale: LearnerPresentationLocale): string {
  if (locale === "en") {
    return value
      .replace(/\bOnly a separate human review\b/giu, "Only a separate review with a person")
      .replace(/\bduring human review\b/giu, "during a review with a person")
      .replace(/\bhuman review\b/giu, "review with a person")
      .replace(/\breview with a person review with explicit explicitly identified mechanism\b/giu, "review with a person that explicitly identifies the mechanism")
      .replace(/\breview with a person review with explicitly identified mechanism\b/giu, "review with a person that explicitly identifies the mechanism")
      .replace(/\bexplicit explicitly identified mechanism\b/giu, "explicitly identified mechanism")
      .replace(/\bvalid explicitly identified mechanism\b/giu, "explicitly identified mechanism")
      .replace(/\ban practice topic\b/giu, "a practice topic");
  }
  return value
    .replace(/\btransfer\b/giu, "перенос")
    .replace(/при разбор с человеком/giu, "при разборе с человеком")
    .replace(/целевая практика и перенос требуют отдельного разбор с человеком разбора с явной структурной классификацией механизма/giu, "целевая практика и перенос требуют отдельного разбора с человеком, который явно определяет механизм")
    .replace(/Нужны разбор с человеком, решение до результата, сигнал, отмеченный до решения и валидная явно установленный механизм/giu, "Нужны отдельный разбор с человеком, решение до результата, сигнал, отмеченный до решения, и явно определенный механизм")
    .replace(/разбор с человеком разбора/giu, "разбор с человеком")
    .replace(/явной явно установленный механизм/giu, "явно определенный механизм")
    .replace(/валидная явно установленный механизм/giu, "явно определенный механизм");
}

function applyLegacyExactFallbacks(root: HTMLElement) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  for (const node of nodes) {
    const current = node.nodeValue ?? "";
    const replacement = legacyExactFallbacks.get(current.trim());
    if (replacement && replacement !== current) node.nodeValue = replacement;
  }
}

function applyMetadataLineFirewall(root: HTMLElement) {
  const candidates = root.querySelectorAll<HTMLElement>("p, small, span, li, summary");
  for (const element of Array.from(candidates)) {
    const metadataOnly = isLearnerMetadataOnlyLine(element.textContent?.trim() ?? "");
    const hiddenByFirewall = element.dataset.learnerMetadataHidden === "true";
    if (metadataOnly) {
      element.hidden = true;
      element.setAttribute("aria-hidden", "true");
      element.dataset.learnerMetadataHidden = "true";
    } else if (hiddenByFirewall) {
      element.hidden = false;
      element.removeAttribute("aria-hidden");
      delete element.dataset.learnerMetadataHidden;
    }
  }
}

function applyTextFirewall(root: HTMLElement) {
  const locale = currentLocale();
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  for (const node of nodes) {
    const parent = node.parentElement;
    if (parent?.closest("[data-learner-metadata-hidden='true']")) continue;
    const current = node.nodeValue ?? "";
    const sanitized = sanitizeLearnerPresentationText(current, locale);
    const next = normalizeLearnerSafeCopy(sanitized, locale);
    if (next !== current) node.nodeValue = next;
  }
}

function applyAccessibilityAttributeFirewall(root: HTMLElement) {
  const locale = currentLocale();
  const selector = learnerAccessibilityAttributes.map((attribute) => `[${attribute}]`).join(",");
  const candidates: Element[] = [root, ...Array.from(root.querySelectorAll(selector))];
  for (const element of candidates) {
    for (const attribute of learnerAccessibilityAttributes) {
      const current = element.getAttribute(attribute);
      if (current === null) continue;
      const sanitized = sanitizeLearnerAccessibilityAttribute(current, locale);
      const next = normalizeLearnerSafeCopy(sanitized, locale);
      if (next === current) continue;
      if (!next && attribute !== "alt") element.removeAttribute(attribute);
      else element.setAttribute(attribute, next);
    }
  }
}

function applyPresentation(root: HTMLElement) {
  applyLegacyExactFallbacks(root);
  applyMetadataLineFirewall(root);
  applyTextFirewall(root);
  applyAccessibilityAttributeFirewall(root);
}

export default function PracticalLearnerPresentationGuard() {
  useLayoutEffect(() => {
    let applying = false;
    const run = () => {
      if (applying) return;
      applying = true;
      try {
        const main = document.querySelector("main");
        if (main) applyPresentation(main);
      } finally {
        applying = false;
      }
    };

    run();
    const observer = new MutationObserver(run);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...learnerAccessibilityAttributes],
    });
    return () => observer.disconnect();
  }, []);
  return null;
}
