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
]);

function ru(text: string): string {
  return RU_ANCHOR_OVERRIDES.get(text) ?? text;
}

export function applyPracticalAnchorRuCopyRepair(anchor: PracticalAnchor): PracticalAnchor {
  return {
    ...anchor,
    promptRu: ru(anchor.promptRu),
    answerRu: ru(anchor.answerRu),
    rationaleRu: ru(anchor.rationaleRu),
  };
}
