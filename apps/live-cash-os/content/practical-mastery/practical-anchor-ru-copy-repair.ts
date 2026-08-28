import type { PracticalAnchor } from "./types";

const RU_ANCHOR_OVERRIDES = new Map<string, string>([
  [
    "Нет. Line, size, ranges, blockers и реальное evidence должны нести решение; uncertainty можно оставить uncertainty.",
    "Нет. Решение должны определять линия, сайзинг, диапазоны, блокеры и реальные наблюдения; неопределённость можно оставить неопределённостью.",
  ],
  [
    "FTGU-E22 прямо предупреждает против invented narratives.",
    "FTGU-E22 прямо предупреждает против выдуманных ридов, которыми пытаются оправдать близкое решение.",
  ],
  [
    "В сторону более широких calls, если evidence действительно относится к этой branch.",
    "В сторону более широких коллов, если наблюдения действительно относятся именно к этой ветке.",
  ],
  [
    "FTGU-E25 описывает exploitative overcalling именно так.",
    "FTGU-E25 именно так описывает эксплойтное расширение коллов.",
  ],
  [
    "Нет. Нужны exact line, available air и evidence, что именно эта branch overbluffed.",
    "Нет. Нужны конкретная линия, реальные блеф-кандидаты и подтверждение, что именно в этой ветке слишком много блефов.",
  ],
  [
    "FTGU-E25 и LCM-10 требуют branch-specific evidence.",
    "FTGU-E25 и LCM-10 требуют наблюдений, относящихся именно к этой ветке.",
  ],
  ["Какой simplified flop plan source поддерживает при большом concentrated advantage?", "Какой упрощённый план на флопе подходит при большом концентрированном преимуществе?"],
  ["Какой practical simplification source предлагает для многих favourable/neutral low-SPR 4-bet flops?", "Какое практическое упрощение подходит для многих благоприятных и нейтральных флопов в 4-бет-банках с низким SPR?"],
  ["Как source меняет OOP response против larger c-bet deep?", "Как меняется игра OOP против крупного c-bet при глубоких стеках?"],
  ["Какой exploit source поддерживает, если natural bluff supply почти исчез?", "Какой эксплойт оправдан, если естественных блефов почти не осталось?"],
  ["Какой exploit source поддерживает против реально overbluffed air-rich branch?", "Какой эксплойт оправдан против ветки, где действительно слишком много блефов?"],
  ["Можно ли превратить source claim 'люди часто overfold small river probes' в универсальный live rule?", "Можно ли превратить наблюдение «игроки часто оверфолдят против небольших проб-бетов на ривере» в универсальное правило для лайва?"],
  ["Нет автоматически; source сдвигается к более value-heavy/linear response и tighter stack-offs.", "Нет автоматически; лучше перейти к более линейному диапазону с перевесом вэлью и более тайтовым выставлениям."],
  ["Нет. Range source изменился; сначала пересчитай arriving-range advantage.", "Нет. Исходный диапазон изменился; сначала пересчитай преимущество диапазона, пришедшего в этот узел."],
  ["Нет. Source поддерживает exploitative overfold против реально underbluffed branch.", "Нет. Здесь оправдан эксплойтный оверфолд против ветки, где действительно не хватает блефов."],
  ["Нет. Source требует более tight bluff categories с equity/removal и правильной strategic shape.", "Нет. Нужны более узкие категории блефов с equity, эффектом блокеров и подходящей стратегической структурой."],
  // Same feminine-agreement/case gap as the decisions-side "raw equity" fix in
  // practical-ru-copy-repair.ts: a preceding neuter adjective and an accusative
  // object position both need "исходная"/"raw" resolved before any generic polish.
  ["У руки заметное raw equity, но Hero OOP и может часто выбрасывать на будущих улицах. Можно ли raw equity приравнять к EV решения?", "У руки заметная исходная equity, но Hero OOP и может часто выбрасывать на будущих улицах. Можно ли приравнять исходную equity к EV решения?"],
]);

const ANCHOR_RU_PHRASE_POLISH: ReadonlyArray<readonly [RegExp, string]> = [
  [/\bboard\/action changes\b/giu, "изменений доски и линии"],
  [/\bBoard и hole cards удаляют combos\b/gu, "Доска и карманные карты исключают комбинации"],
  [/\bremaining stack relative to pot\b/giu, "отношение оставшегося стека к банку"],
  [/\bcommitment\/leverage\b/giu, "порог готовности вкладываться и давление будущих ставок"],
  [/\bequity before flop must enter EV\b/giu, "риск потерять всю equity до флопа нужно учитывать в EV"],
  [/\bsqueeze risk\b/giu, "риск сквиза"],
  [/\bSB flats\b/giu, "коллов SB"],
  [/\bbluff-to-value ratio\b/giu, "соотношение блефов и вэлью"],
  [/\buncontrolled air\b/giu, "лишних пустых рук"],
  [/\bbluff-catch threshold\b/giu, "порог блафкетча"],
  [/\bOverfold relative to balanced baseline\b/gu, "Оверфолд относительно сбалансированной базы"],
  [/\blarge size\b/giu, "крупного сайзинга"],
  [/\bstructurally airless runouts\b/giu, "ран-ауты, где структурно почти нет блефов"],
  [/\bunderbluff\b/giu, "недоблефа"],
  [/\bsource\b/giu, "разбор"],
  [/\bevidence\b/giu, "наблюдения"],
  [/\bassumptions\b/giu, "исходные условия"],
  [/\blearner\b/giu, "игрок"],
  [/\bsupported\b/giu, "обосновано"],
  [/\bbranch\b/giu, "ветка"],
  [/\bbranches\b/giu, "ветки"],
  [/\bmechanism\b/giu, "механизм"],
  [/\bsimplification\b/giu, "упрощение"],
  [/\bpractical\b/giu, "практическое"],
  [/\bsimplified\b/giu, "упрощённый"],
  [/\bconcentrated advantage\b/giu, "концентрированное преимущество"],
  [/\blarger\b/giu, "крупного"],
  [/\buncertainty\b/giu, "неопределённость"],
  [/\bfuture action\b/giu, "будущие решения"],
  [/\bmarginal hand\b/giu, "пограничная рука"],
  [/\bviable\b/giu, "допустимо"],
  [/\bthe\b\s*/giu, ""],
  [/\ban?\b\s*/giu, ""],
  [/\band\b/giu, "и"],
  [/\bor\b/giu, "или"],
  [/\bwith\b/giu, "с"],
  [/\bwithout\b/giu, "без"],
  [/\bagainst\b/giu, "против"],
  [/\bfrom\b/giu, "из"],
  [/\bif\b/giu, "если"],
  [/\bwhen\b/giu, "когда"],
  [/\bbut\b/giu, "но"],
  [/\bmore\b/giu, "больше"],
  [/\bless\b/giu, "меньше"],
  [/\bonly\b/giu, "только"],
  [/\bcan\b/giu, "может"],
  [/\bmust\b/giu, "нужно"],
  [/\bshould\b/giu, "следует"],
];

function ru(text: string): string {
  let result = RU_ANCHOR_OVERRIDES.get(text) ?? text;
  for (const [pattern, replacement] of ANCHOR_RU_PHRASE_POLISH) result = result.replace(pattern, replacement);
  return result.replace(/\s{2,}/gu, " ").replace(/\s+([,.;!?])/gu, "$1").trim();
}

export function applyPracticalAnchorRuCopyRepair(anchor: PracticalAnchor): PracticalAnchor {
  const extended = anchor as PracticalAnchor & { titleRu?: string; bodyRu?: string };
  return {
    ...anchor,
    ...(typeof extended.titleRu === "string" ? { titleRu: ru(extended.titleRu) } : {}),
    ...(typeof extended.bodyRu === "string" ? { bodyRu: ru(extended.bodyRu) } : {}),
    promptRu: ru(anchor.promptRu),
    answerRu: ru(anchor.answerRu),
    rationaleRu: ru(anchor.rationaleRu),
  } as PracticalAnchor;
}
