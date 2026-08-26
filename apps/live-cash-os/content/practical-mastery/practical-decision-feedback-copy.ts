import { variationB3Decisions } from "./decisions-variation-b3";
import type { PracticalDecision } from "./types";

export type PracticalDecisionFeedbackCopy = {
  mechanismRu: string;
  mechanismEn: string;
  boundaryRu?: string;
  boundaryEn?: string;
  curated: boolean;
};

type CuratedFeedback = Omit<PracticalDecisionFeedbackCopy, "curated">;

const CURATED_FEEDBACK = new Map<string, CuratedFeedback>([
  ["PM-BL-01-106", {
    mechanismRu: "Ключевой сигнал — более ранняя позиция открытия: диапазон обычно сильнее и чаще доминирует пограничные коллы из BB, поэтому защита сужается.",
    mechanismEn: "Key signal: the opener moved earlier, so the range is usually stronger and dominates more fringe BB calls; defense therefore tightens.",
    boundaryRu: "Если фактический диапазон открытия остаётся широким или сайзинг заметно меньше, позиционный ориентир нужно пересчитать.",
    boundaryEn: "If the actual opening range remains wide or the size becomes materially smaller, recompute the positional baseline instead of treating the seat label as a law.",
  }],
  ["PM-OOP-01-106", {
    mechanismRu: "Ключевой сигнал — флоп стал сухим с высокой картой: преимущество диапазона коллера ослабевает, поэтому OOP уже не обязан так часто уходить в range-check.",
    mechanismEn: "Key signal: the flop became dry and high-card, weakening the caller's range advantage; OOP therefore needs less forced range checking.",
    boundaryRu: "Если коллер всё ещё сохраняет сильное преимущество диапазона, сам high-card flop не оправдывает автоматический c-bet.",
    boundaryEn: "If the caller still retains a strong range advantage, a high-card flop by itself does not justify an automatic c-bet.",
  }],
  ["PM-TURN-02-A8-106", {
    mechanismRu: "Ключевой сигнал — тёрн усилил давление диапазона агрессора и изменил сохраняющиеся диапазоны; поэтому подходящие баррели становятся прибыльнее, но линию нужно пересобрать, а не продолжать по инерции.",
    mechanismEn: "Key signal: the turn increased the aggressor's leverage and changed the surviving ranges; suitable barrels gain EV, but the branch must be rebuilt rather than continued from momentum.",
    boundaryRu: "На бланке, который сохраняет сильный диапазон продолжения у коллера, прежнее давление не переносится автоматически.",
    boundaryEn: "On a blank that preserves a strong continuing range for the caller, the prior pressure does not transfer automatically.",
  }],
  ["PM-RIV-01-A8-106", {
    mechanismRu: "Ключевой сигнал — диапазон колла на ривере стал уже: меньше худших рук платят, поэтому тонкий value-bet теряет EV и требует более сильного порога на вэлью.",
    mechanismEn: "Key signal: the river calling range became tighter, so fewer worse hands pay; thin value loses EV and needs a stronger value threshold.",
    boundaryRu: "Если меньший сайзинг снова получает достаточно коллов от худших рук, value-ветка может вернуться.",
    boundaryEn: "If a smaller size again gets enough calls from worse hands, the value branch can reopen.",
  }],
]);

function correctActionText(decision: PracticalDecision, locale: "ru" | "en"): string {
  const correctAction = decision.actionOptions.find((option) => option.id === decision.correctActionId);
  if (!correctAction) return locale === "ru" ? "Пересчитай ветку для текущих условий" : "Recompute the branch for the current conditions";
  return locale === "ru" ? correctAction.textRu : correctAction.textEn;
}

function b3FamilyKey(id: string): string {
  return id.replace(/-\d+$/, "");
}

const b3DirectDecisionByFamily = new Map(
  variationB3Decisions
    .filter((decision) => decision.kind === "decision")
    .map((decision) => [b3FamilyKey(decision.id), decision] as const),
);

function b3DirectionalActionText(decision: PracticalDecision, locale: "ru" | "en"): string {
  const directDecision = b3DirectDecisionByFamily.get(b3FamilyKey(decision.id));
  return directDecision ? correctActionText(directDecision, locale) : correctActionText(decision, locale);
}

function b3Feedback(decision: PracticalDecision): PracticalDecisionFeedbackCopy | null {
  if (!decision.id.startsWith("PM-B3-")) return null;

  const actionRu = correctActionText(decision, "ru");
  const actionEn = correctActionText(decision, "en");

  if (decision.kind === "recognition") {
    return {
      mechanismRu: `Ключевой сигнал: ${actionRu}. Сначала выдели этот фактор, а уже потом переноси базовую линию на конкретный контекст.`,
      mechanismEn: `Key signal: ${actionEn}. Extract that factor first, then transfer the baseline only to a matching context.`,
      boundaryRu: "Если ключевой сигнал меняется, прежний ориентир нужно пересчитать, а не переносить как универсальное правило.",
      boundaryEn: "If the key signal changes, recompute the baseline instead of transferring it as a universal rule.",
      curated: true,
    };
  }

  if (decision.kind === "changed" && decision.changedVariables?.length) {
    const directionalRu = b3DirectionalActionText(decision, "ru");
    const directionalEn = b3DirectionalActionText(decision, "en");
    return {
      mechanismRu: `Что изменилось: ${decision.cueRu} Стратегическое следствие: ${directionalRu}. Почему действие меняется или сохраняется: ${decision.explanationRu} Применяй этот вывод к новой конфигурации, а не копируй прежнюю ветку.`,
      mechanismEn: `What changed: ${decision.cueEn} Strategic consequence: ${directionalEn}. Why the action changes or stays: ${decision.explanationEn} Apply that consequence to the new configuration instead of copying the previous branch.`,
      boundaryRu: "Если указанный сдвиг не меняет EV-драйвер этой ветки, направление может сохраниться; если меняет — пересчитай действие для новой конфигурации.",
      boundaryEn: "If the stated shift leaves this branch's EV driver unchanged, the direction may stay; if it changes that driver, recompute the action for the new configuration.",
      curated: true,
    };
  }

  if (decision.kind === "changed") {
    return {
      mechanismRu: `Ключевой сигнал — условия уже изменились. ${decision.cueRu} Поэтому прежнюю ветку нельзя копировать: пересчитай порог, диапазон или реализацию equity для нового контекста.`,
      mechanismEn: `Key signal: the conditions have changed. ${decision.cueEn} Do not copy the old branch; recompute the threshold, range, or realization for the new context.`,
      boundaryRu: "Если новое условие не меняет цену, силу диапазонов или реализацию, прежнее направление может сохраниться; иначе нужен новый расчёт.",
      boundaryEn: "If the changed condition does not alter price, range strength, or realization, the old direction may survive; otherwise the branch needs a fresh calculation.",
      curated: true,
    };
  }

  return {
    mechanismRu: `Ключевой сигнал — контекст должен менять EV ветки, а не только ярлык руки. Практический вывод: ${actionRu}. Сравни эту ветку с альтернативой в текущих условиях.`,
    mechanismEn: `Key signal: context must change branch EV, not merely the hand label. Practical conclusion: ${actionEn}. Compare that branch with the alternative under the current conditions.`,
    boundaryRu: "Если цена, позиция, диапазоны или реализация меняются, прежний практический ориентир нужно пересчитать.",
    boundaryEn: "If price, position, ranges, or realization change, recompute the practical baseline.",
    curated: true,
  };
}

export function practicalDecisionFeedbackCopy(decision: PracticalDecision): PracticalDecisionFeedbackCopy {
  const curated = CURATED_FEEDBACK.get(decision.id);
  if (curated) return { ...curated, curated: true };

  const generatedB3 = b3Feedback(decision);
  if (generatedB3) return generatedB3;

  return {
    mechanismRu: decision.explanationRu,
    mechanismEn: decision.explanationEn,
    curated: false,
  };
}
