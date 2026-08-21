"use client";

import { useLayoutEffect } from "react";

const sourceIdPattern = /\b(?:FTGU-E\d+(?:\/E\d+)?|SLC-M\d+-L\d+|LCM-\d+|CP-G\d+-L\d+)\b/giu;
const sourceLinePattern = /^(?:Источники|Sources)\s*:/iu;

const exactReplacements = new Map<string, string>([
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
  [
    "FTGU-E01 отделяет equity от EV; FTGU-E05 добавляет, что postflop execution может сделать marginal BB defend неприбыльным.",
    "Raw equity показывает долю банка при showdown, но EV дополнительно зависит от реализации equity и будущих решений. Рука может иметь достаточно raw equity и всё равно терять деньги, если Hero часто не реализует её OOP.",
  ],
  [
    "FTGU-E05 называет closing action и small open факторами, которые снижают требуемое реализуемое equity.",
    "Лучшая цена снижает требуемую equity, а закрытие action убирает риск дополнительного повышения позади. Поэтому marginal defend реализуется лучше.",
  ],
  [
    "FTGU-E01 прямо связывает implied odds с потенциальной будущей отдачей относительно текущей инвестиции.",
    "Небольшая текущая инвестиция может быть прибыльной, если сильные будущие улучшения позволяют выиграть достаточно дополнительного банка. Это и есть смысл implied odds.",
  ],
  [
    "FTGU-E05 отдельно подчёркивает top-pair domination против concentrated early-position ranges.",
    "Чем сильнее исходный диапазон соперника, тем чаще high-card hand оказывается доминирована лучшими top pairs и overpairs, поэтому реализует equity хуже.",
  ],
  ["Это прямые стандартные combo counts из FTGU-E11.", "До card removal: pocket pair = C(4,2) = 6 combos; suited hand = 4; offsuit hand = 4 × 3 = 12."],
  [
    "FTGU-E11 требует пересчитывать диапазон после board/action changes.",
    "Каждая видимая board или hole card удаляет часть сочетаний. После card removal нужно считать только оставшиеся combos, а не переносить preflop число автоматически.",
  ],
  ["Это действующий LCM-01 mechanism.", "Effective stack — парная величина: для каждой пары Hero–opponent берётся меньший из двух оставшихся стеков. В multiway одной общей effective depth может не быть."],
  [
    "LCM-01 и FTGU-E01 связывают remaining stack relative to pot с количеством будущих решений.",
    "SPR = оставшийся effective stack / размер банка. Более крупный preflop pot при том же стеке снижает SPR, уменьшает пространство будущих ставок и меняет commitment/leverage.",
  ],
  [
    "FTGU-E01 прямо выделяет all-in/river nodes как случаи, где price и equity доминируют.",
    "Когда будущих ставок почти нет, исчезают большая часть факторов реализации и leverage. Поэтому текущая цена и equity напрямую определяют решение сильнее, чем на ранних улицах.",
  ],
  [
    "FTGU-E01 separates equity from EV; FTGU-E05 adds that postflop execution can make a marginal BB defend unprofitable.",
    "Raw equity describes a share of the pot at showdown, while EV also depends on equity realization and future decisions. A hand can have enough raw equity and still lose money if Hero realizes it poorly OOP.",
  ],
  [
    "FTGU-E05 identifies closing action and a small open as factors that lower the required realizable equity.",
    "A better price lowers the equity threshold, while closing the action removes the risk of another raise behind. That makes a marginal defend easier to realize profitably.",
  ],
  [
    "FTGU-E01 explicitly frames implied odds as potential future return relative to the current investment.",
    "A small current investment can be profitable when strong future improvements win enough additional money. That future return relative to today's price is the point of implied odds.",
  ],
  [
    "FTGU-E05 explicitly highlights top-pair domination against concentrated early-position ranges.",
    "Against a stronger starting range, a high-card hand is dominated by better top pairs and overpairs more often, so it realizes its equity less effectively.",
  ],
  ["These are the standard combo counts stated directly in FTGU-E11.", "Before card removal: a pocket pair has C(4,2) = 6 combos, a suited hand has 4, and an offsuit hand has 4 × 3 = 12."],
  [
    "FTGU-E11 requires recounting as board cards and action change the surviving range.",
    "Every visible board or hole card removes combinations. After card removal, count only the surviving combos instead of carrying the preflop total forward automatically.",
  ],
  ["This is the existing LCM-01 mechanism.", "Effective stack is pairwise: for each Hero–opponent pair, use the smaller remaining stack. A multiway pot does not necessarily have one global effective depth."],
  [
    "LCM-01 and FTGU-E01 connect remaining stack relative to pot with the future decision tree.",
    "SPR is remaining effective stack divided by the pot. A larger preflop pot with the same stack lowers SPR, compresses future betting, and changes commitment and leverage.",
  ],
  [
    "FTGU-E01 explicitly identifies all-in/river nodes as cases where price and equity dominate.",
    "When almost no future betting remains, most realization and leverage effects disappear. Current price and equity therefore drive the decision more directly than on earlier streets.",
  ],
]);

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
  if (exact) return exact;
  return sourceIdPattern.test(value) ? cleanupSourceLanguage(value) : value;
}

function applyPresentation(root: ParentNode) {
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
