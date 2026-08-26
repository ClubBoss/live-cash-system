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
  ["Какой simplified flop plan source поддерживает при большом concentrated advantage?", "Какой упрощённый план на флопе материал поддерживает при большом концентрированном преимуществе?"],
  ["Какой practical simplification source предлагает для многих favourable/neutral low-SPR 4-bet flops?", "Какое практическое упрощение материал предлагает для многих благоприятных и нейтральных флопов в 4-бет-банках с низким SPR?"],
  ["Как source меняет OOP response против larger c-bet deep?", "Как материал меняет игру OOP против крупного c-bet при глубоких стеках?"],
  ["Какой exploit source поддерживает, если natural bluff supply почти исчез?", "Какой эксплойт материал поддерживает, если естественных блефов почти не осталось?"],
  ["Какой exploit source поддерживает против реально overbluffed air-rich branch?", "Какой эксплойт материал поддерживает против ветки, где действительно слишком много блефов?"],
  ["Можно ли превратить source claim 'люди часто overfold small river probes' в универсальный live rule?", "Можно ли превратить наблюдение «игроки часто оверфолдят против небольших river probe» в универсальное правило для live-игры?"],
  ["Нет автоматически; source сдвигается к более value-heavy/linear response и tighter stack-offs.", "Нет автоматически; материал предлагает более линейный диапазон с перевесом вэлью и более тайтовые выставления."],
  ["Нет. Range source изменился; сначала пересчитай arriving-range advantage.", "Нет. Исходный диапазон изменился; сначала пересчитай преимущество диапазона, пришедшего на эту улицу."],
  ["Нет. Source поддерживает exploitative overfold против реально underbluffed branch.", "Нет. Материал поддерживает эксплойтный оверфолд против ветки, где действительно не хватает блефов."],
  ["Нет. Source требует более tight bluff categories с equity/removal и правильной strategic shape.", "Нет. Материал требует более узких категорий блефов с equity, эффектом блокеров и подходящей стратегической структурой."],
]);

const ANCHOR_RU_PHRASE_POLISH: ReadonlyArray<readonly [RegExp, string]> = [
  [/\bsource\b/giu, "материал"],
  [/\bevidence\b/giu, "наблюдения"],
  [/\bassumptions\b/giu, "допущения"],
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
  [/\bviable\b/giu, "жизнеспособно"],
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
  [/\bmust\b/giu, "должен"],
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
