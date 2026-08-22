"use client";

import { useLayoutEffect } from "react";

const sourceIdPattern = /\b(?:FTGU-E\d+(?:\/E\d+)?|SLC-M\d+-L\d+|LCM-\d+|CP-G\d+-L\d+)\b/giu;
const sourceIdTestPattern = /\b(?:FTGU-E\d+(?:\/E\d+)?|SLC-M\d+-L\d+|LCM-\d+|CP-G\d+-L\d+)\b/iu;
const sourceLinePattern = /^(?:Источники|Sources)\s*:/iu;

const exactReplacements = new Map<string, string>([
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

function polishRussianLearnerText(value: string): string {
  let next = value;
  next = next.replace(/Какие две основные причины\s+FTGU\s+даёт для\s+IP cold-call\?/giu, "Какие две основные причины могут сделать cold-call в позиции прибыльным?");
  next = next.replace(/Какой simplified flop plan source поддерживает при большом concentrated advantage\?/giu, "Какой упрощённый план на флопе уместен при большом преимуществе диапазона?");
  next = next.replace(/Какой practical simplification source предлагает для многих favourable\/neutral low-SPR 4-bet flops\?/giu, "Какое практическое упрощение уместно на многих благоприятных или нейтральных флопах 4-бет-банка с низким SPR?");
  next = next.replace(/Нет автоматически; source сдвигается к более value-heavy\/linear response и tighter stack-offs\./giu, "Нет автоматически; против диапазона с недостатком блефов ответ становится более ориентированным на вэлью, а выставления — более тайтовыми.");
  next = next.replace(/Нет\. Source поддерживает exploitative overfold против реально underbluffed branch\./giu, "Нет. Против линии, в которой действительно не хватает блефов, эксплойтный оверфолд может быть правильным.");
  next = next.replace(/\bconcentrated early-position ranges?\b/giu, "узкого диапазона ранней позиции");
  next = next.replace(/\bconcentrated range advantage\b/giu, "сильного преимущества диапазона");
  next = next.replace(/\bopening range\b/giu, "диапазона открытия");
  next = next.replace(/\bunderbluffing range\b/giu, "диапазона с недостатком блефов");
  next = next.replace(/\bOOP\b/gu, "вне позиции");
  next = next.replace(/\branges?\b(?!-bet)/giu, "диапазон");
  next = next.replace(/\bbranches?\b/giu, "ветка решения");
  next = next.replace(/\bsource\b/giu, "логика");
  next = next.replace(/\bFTGU\b/gu, "материал");
  next = next.replace(/\s{2,}/gu, " ").trim();
  return next;
}

function cleanupSourceLanguage(value: string): string {
  let next = value.replace(sourceIdPattern, "");
  next = next.replace(/\s+([,.;:])/gu, "$1").replace(/\(\s+/gu, "(").replace(/\s+\)/gu, ")").replace(/\s{2,}/gu, " ").trim();
  next = next.replace(/^[/,;:\-–—\s]+/u, "").trim();
  if (/^(?:прямо\s+)?(?:показывает|описывает|подчёркивает|требует|выделяет|связывает|перечисляет|использует|называет|отделяет|добавляет|предупреждает|отвергает)\b/iu.test(next)) {
    next = `Практическая логика ${next.charAt(0).toLowerCase()}${next.slice(1)}`;
  }
  if (/^(?:explicitly\s+)?(?:shows|describes|highlights|requires|identifies|links|lists|uses|calls|separates|adds|warns|rejects)\b/iu.test(next)) {
    next = `The practical logic ${next.charAt(0).toLowerCase()}${next.slice(1)}`;
  }
  return next;
}

function transformText(value: string): string {
  const exact = exactReplacements.get(value.trim());
  const transformed = exact ?? (sourceIdTestPattern.test(value) ? cleanupSourceLanguage(value) : value);
  return /[А-Яа-яЁё]/u.test(transformed) ? polishRussianLearnerText(transformed) : transformed;
}

function applyPresentation(root: HTMLElement) {
  for (const element of Array.from(root.querySelectorAll<HTMLElement>("p, small"))) {
    const text = element.textContent?.trim() ?? "";
    if (sourceLinePattern.test(text)) {
      element.hidden = true;
      element.setAttribute("aria-hidden", "true");
    }
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  for (const node of nodes) {
    const current = node.nodeValue ?? "";
    const transformed = transformText(current);
    if (transformed !== current) node.nodeValue = transformed;
  }
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
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, []);
  return null;
}
