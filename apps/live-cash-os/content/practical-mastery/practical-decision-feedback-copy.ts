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
type B3CausalGroup = { keys: readonly string[]; ru: string; en: string };

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

const B3_CAUSAL_GROUPS: readonly B3CausalGroup[] = [
  {
    keys: ["position", "relative_position", "action_order", "players_behind", "ranges_behind"],
    ru: "Позиция, порядок действий и диапазоны, которым ещё предстоит действовать, меняют реализацию equity и риск столкнуться с более сильной веткой, поэтому сдвигают EV пограничных продолжений и давления.",
    en: "Position, action order, and ranges still left to act change equity realization and the risk of running into stronger branches, moving the EV of fringe continues and pressure.",
  },
  {
    keys: ["rake", "realisation"],
    ru: "Рейк и реализация определяют, сколько сырого equity превращается в итоговый EV; их изменение в первую очередь двигает тонкие и пограничные ветки.",
    en: "Rake and realization determine how much raw equity becomes net EV; changing either one moves thin and fringe branches first.",
  },
  {
    keys: ["open_size", "threebet_size", "bet_size", "river_size", "live_size"],
    ru: "Сайзинг меняет непосредственную цену и геометрию банка со стеком, поэтому двигает безубыточный порог и требования к продолжению.",
    en: "Sizing changes the immediate price and pot-to-stack geometry, moving break-even and continuation thresholds.",
  },
  {
    keys: ["opener_origin", "called_branch", "arriving_ranges", "caller_range", "villain_calling_range", "range_strength"],
    ru: "Состав и сила диапазонов меняют доминацию, набор худших рук, которые платят, и range/nut advantage, поэтому двигают порог продолжения или давления.",
    en: "Range composition and strength change domination, worse hands that can pay, and range/nut advantage, moving the threshold for continuing or applying pressure.",
  },
  {
    keys: ["fold_equity"],
    ru: "Fold equity определяет, сколько EV блефовая часть получает от фолдов; его изменение меняет допустимую плотность блефов и степень поляризации.",
    en: "Fold equity determines how much EV the bluff region earns from folds; changing it moves viable bluff density and polarization.",
  },
  {
    keys: ["bluff_supply"],
    ru: "Количество правдоподобных блефов меняет ценность bluff-catcher и требуемый порог колла на ривере.",
    en: "Credible bluff supply changes the value of bluff-catchers and the river calling threshold.",
  },
  {
    keys: ["board_class", "runout_class", "turn_range_shift"],
    ru: "Класс доски или ранаута меняет распределение equity, nut advantage, защиту и будущий leverage, поэтому меняется набор рук для ставки и продолжения.",
    en: "Board or runout class changes equity distribution, nut advantage, protection, and future leverage, changing betting and continuing candidates.",
  },
  {
    keys: ["action_ancestry", "flop_action"],
    ru: "Предыдущая линия фильтрует сохранившиеся диапазоны и делает их более capped или uncapped, поэтому меняется число правдоподобных value- и bluff-комбинаций в текущем узле.",
    en: "Prior action filters surviving ranges and makes them more capped or uncapped, changing credible value and bluff combinations at the current node.",
  },
  {
    keys: ["hand_robustness", "hand_family"],
    ru: "Устойчивость и класс руки определяют, насколько хорошо equity переживает будущие карты и давление и к какой ветке — value, protection, bluff или continue — относится рука.",
    en: "Hand robustness and family determine how well equity survives future cards and pressure and whether the hand belongs in a value, protection, bluff, or continue branch.",
  },
  {
    keys: ["blocker_effect"],
    ru: "Блокеры меняют число доступных value- и bluff-комбинаций, поэтому одна и та же номинальная рука может перейти через порог ривер-решения.",
    en: "Blockers change available value and bluff combinations, so the same nominal hand can cross a river decision threshold.",
  },
  {
    keys: ["player_count"],
    ru: "Число игроков меняет количество сильных диапазонов, делящих банк, и реализацию equity, поэтому двигает требования к силе продолжения и value.",
    en: "Player count changes how many credible ranges share the pot and how equity realizes, moving strength requirements for continuing and value.",
  },
  {
    keys: ["effective_depth", "effective_stack", "straddle"],
    ru: "Эффективная глубина, стек и straddle меняют SPR, implied/reverse-implied odds и порог привязки к банку, поэтому та же рука может требовать другой ветки.",
    en: "Effective depth, stack, and straddle geometry change SPR, implied/reverse-implied odds, and commitment thresholds, so the same hand can require a different branch.",
  },
  {
    keys: ["evidence_strength", "evidence_reversal"],
    ru: "Сила и направление наблюдений определяют, насколько далеко можно отклоняться от базовой линии: устойчивые данные поддерживают больший exploit, а противоречащие данные возвращают отклонение к базе.",
    en: "Evidence strength and direction determine how far an exploit can move from baseline: consistent evidence supports a larger deviation, while contradictory evidence pulls it back.",
  },
];

export function b3ChangedVariableCausalEffect(variable: string, locale: "ru" | "en"): string | null {
  const group = B3_CAUSAL_GROUPS.find(({ keys }) => keys.includes(variable));
  if (!group) return null;
  return locale === "ru" ? group.ru : group.en;
}

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

function b3CausalWhy(decision: PracticalDecision, locale: "ru" | "en"): string {
  const effects = (decision.changedVariables ?? [])
    .map((variable) => b3ChangedVariableCausalEffect(variable, locale))
    .filter((effect): effect is string => Boolean(effect));
  const unique = [...new Set(effects)];
  if (unique.length) return unique.join(" ");
  return locale === "ru"
    ? "Существенный фактор меняет EV ветки, поэтому действие нужно заново оценить в новой конфигурации."
    : "The material factor changes branch EV, so the action must be evaluated again in the new configuration.";
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
      mechanismRu: `Что изменилось: ${decision.cueRu} Стратегическое следствие: ${directionalRu}. Почему это меняет или сохраняет действие: ${b3CausalWhy(decision, "ru")} Применяй этот вывод к новой конфигурации, а не копируй прежнюю ветку.`,
      mechanismEn: `What changed: ${decision.cueEn} Strategic consequence: ${directionalEn}. Why this changes or preserves the action: ${b3CausalWhy(decision, "en")} Apply that consequence to the new configuration instead of copying the previous branch.`,
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
