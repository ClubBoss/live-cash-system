import type { PracticalDecision, PracticalDecisionOption } from "../content/practical-mastery/types";

type LocalizedReason = Pick<PracticalDecisionOption, "textRu" | "textEn">;

export type PracticalAssessmentReasonRepairGroup = {
  label: string;
  decisionIds: readonly string[];
  canonical: LocalizedReason;
  presented: LocalizedReason;
};

export const practicalAssessmentReasonRepairGroups: readonly PracticalAssessmentReasonRepairGroup[] = [
  {
    label: "B3_PF01",
    decisionIds: [
      "PM-B3-PF01-101",
      "PM-B3-PF01-102",
      "PM-B3-PF01-103",
      "PM-B3-PF01-104",
    ],
    canonical: {
      textRu: "Материал по открытию рассматривает чарты как отправную точку: пограничные руки меняются из-за позиции, игроков позади, рейка и реализации эквити.",
      textEn: "Opening charts are defaults; fringe opens change with position, players behind, rake, and realization.",
    },
    presented: {
      textRu: "Чарт — база; позиция, игроки позади, рейк и реализация сдвигают границу.",
      textEn: "Chart is a baseline; position, players behind, rake, and realization move fringe opens.",
    },
  },
  {
    label: "B3_BL03",
    decisionIds: [
      "PM-B3-BL03-101",
      "PM-B3-BL03-102",
      "PM-B3-BL03-103",
      "PM-B3-BL03-104",
    ],
    canonical: {
      textRu: "BB против BTN защищается широко из-за цены и широкого открытия, но пограничные коллы исчезают, когда ухудшаются цена, рейк или реализация.",
      textEn: "BB-versus-BTN is structurally wide because of price and opener origin, but marginal calls disappear as price, rake, or execution worsen.",
    },
    presented: {
      textRu: "BB vs BTN шире из-за цены и диапазона открытия; хуже цена, рейк или реализация — уже граница колла.",
      textEn: "BB vs BTN is wide from price/origin; worse price/rake/execution removes fringe calls.",
    },
  },
  {
    label: "B3_TURN03",
    decisionIds: [
      "PM-B3-TURN03-101",
      "PM-B3-TURN03-102",
      "PM-B3-TURN03-103",
      "PM-B3-TURN03-104",
    ],
    canonical: {
      textRu: "Пробная ставка зависит от точного состава диапазона после чек-бэка и от того, какие сильные руки возвращает карта тёрна.",
      textEn: "Probing is conditional on exact check-back composition and whether the turn restores strong regions.",
    },
    presented: {
      textRu: "Проб зависит от состава check-back range и того, возвращает ли тёрн сильные регионы.",
      textEn: "Probe depends on check-back composition and whether the turn restores strong regions.",
    },
  },
  {
    label: "B3_MW02",
    decisionIds: [
      "PM-B3-MW02-101",
      "PM-B3-MW02-102",
      "PM-B3-MW02-103",
      "PM-B3-MW02-104",
    ],
    canonical: {
      textRu: "Дополнительные диапазоны повышают вероятность сильных или натсовых комбинаций у кого-то из игроков и обесценивают пограничную силу одной пары.",
      textEn: "Additional ranges increase the chance somebody owns robust/nutted regions and devalue marginal one-pair strength.",
    },
    presented: {
      textRu: "Дополнительные диапазоны чаще содержат натсы и обесценивают пограничную одну пару.",
      textEn: "Extra ranges raise nutted ownership and devalue marginal one-pair strength.",
    },
  },
  {
    label: "B3_DEEP03",
    decisionIds: [
      "PM-B3-DEEP03-101",
      "PM-B3-DEEP03-102",
      "PM-B3-DEEP03-103",
      "PM-B3-DEEP03-104",
    ],
    canonical: {
      textRu: "Одинаковое число фишек не означает одинаковую стратегическую глубину, если меняются обязательная ставка и порядок действий.",
      textEn: "Nominal chips do not preserve strategic depth once the forced unit and action order change.",
    },
    presented: {
      textRu: "Номинальные фишки не задают глубину: straddle и порядок действий меняют рабочую единицу.",
      textEn: "Nominal chips do not fix depth when the forced unit or action order changes.",
    },
  },
  {
    label: "B4_PF01",
    decisionIds: [
      "PM-B4-PF01-101",
      "PM-B4-PF01-102",
      "PM-B4-PF01-103",
      "PM-B4-PF01-104",
    ],
    canonical: {
      textRu: "Чарты открытия — это лишь стартовая точка: более глубокое будущее дерево улиц и вязкие игроки позади меняют EV пограничных рук и цену позиции.",
      textEn: "Opening charts are defaults; deeper future trees and sticky players behind alter fringe EV and positional costs.",
    },
    presented: {
      textRu: "Глубина и липкие игроки позади меняют EV границы и цену позиции.",
      textEn: "Depth + sticky players behind move fringe EV and positional cost.",
    },
  },
  {
    label: "B4_PF02",
    decisionIds: [
      "PM-B4-PF02-101",
      "PM-B4-PF02-102",
      "PM-B4-PF02-103",
      "PM-B4-PF02-104",
    ],
    canonical: {
      textRu: "Материал рассматривает лимп через полное дерево веток фолд/колл/мультивей, а не через автоматическую изоляцию любой руки.",
      textEn: "Limp decisions must compare fold, called, and multiway branches rather than defaulting to automatic isolation.",
    },
    presented: {
      textRu: "Лимп требует сравнить fold/call/multiway ветки, а не автоизолейт.",
      textEn: "Limp EV compares fold/call/multiway branches, not auto-isolation.",
    },
  },
  {
    label: "B4_PF04",
    decisionIds: [
      "PM-B4-PF04-101",
      "PM-B4-PF04-102",
      "PM-B4-PF04-103",
      "PM-B4-PF04-104",
    ],
    canonical: {
      textRu: "Крупный лайв-сайзинг быстро убирает маргинальные коллы BB; уже вложенный блайнд не даёт права защищать фиксированный диапазон.",
      textEn: "Large live sizing removes marginal BB calls quickly; the posted blind is not a reason to defend a fixed range.",
    },
    presented: {
      textRu: "Крупный live size убирает fringe-коллы BB; blind не фиксирует защиту.",
      textEn: "Large live size removes fringe BB calls; blind does not fix range.",
    },
  },
  {
    label: "B4_PF06",
    decisionIds: [
      "PM-B4-PF06-101",
      "PM-B4-PF06-102",
      "PM-B4-PF06-103",
      "PM-B4-PF06-104",
    ],
    canonical: {
      textRu: "На глубине хуже реализуется эквити без позиции и растёт риск обратных потенциальных потерь; структуру 3-бета нельзя механически копировать со 100bb.",
      textEn: "At depth, OOP realization and reverse-implied exposure grow; 3-bet shape cannot be copied mechanically from 100bb.",
    },
    presented: {
      textRu: "На глубине OOP и reverse implied дороже; 3-bet shape не копирует 100bb.",
      textEn: "Depth raises OOP/reverse-implied cost; 3-bets cannot copy 100bb.",
    },
  },
  {
    label: "B4_PF07",
    decisionIds: [
      "PM-B4-PF07-101",
      "PM-B4-PF07-102",
      "PM-B4-PF07-103",
      "PM-B4-PF07-104",
    ],
    canonical: {
      textRu: "Игра против 3-бета — задача EV по веткам: крупный лайв-сайзинг и глубокое будущее дерево вместе сдвигают пороги колла, 4-бета и фолда.",
      textEn: "Facing 3-bets is a branch-EV problem; large live sizes and deep future trees jointly move call/4-bet/fold thresholds.",
    },
    presented: {
      textRu: "Large 3-bet и depth сдвигают EV-пороги call/4-bet/fold.",
      textEn: "Large 3-bets plus depth move call/4-bet/fold EV thresholds.",
    },
  },
  {
    label: "B4_BL03",
    decisionIds: [
      "PM-B4-BL03-101",
      "PM-B4-BL03-102",
      "PM-B4-BL03-103",
      "PM-B4-BL03-104",
    ],
    canonical: {
      textRu: "Широта диапазона BTN — не право защищать одну и ту же пограничную руку против крупных сайзингов и при слабой реализации эквити.",
      textEn: "BTN width is not a license to defend the same fringe across large sizes and poor-realization environments.",
    },
    presented: {
      textRu: "Широкий BTN не спасает fringe против big size и плохой реализации.",
      textEn: "BTN width cannot save fringe calls vs big size/poor realization.",
    },
  },
  {
    label: "B4_OOP02",
    decisionIds: [
      "PM-B4-OOP02-101",
      "PM-B4-OOP02-102",
      "PM-B4-OOP02-103",
      "PM-B4-OOP02-104",
    ],
    canonical: {
      textRu: "На глубине слабая реализация эквити без позиции делает слабые доминируемые продолжения дороже на следующих улицах даже при привлекательной цене флопа.",
      textEn: "Deep OOP realization makes weak dominated continues more expensive over later streets even at a seemingly attractive flop price.",
    },
    presented: {
      textRu: "Deep OOP делает dominated continues дороже даже при хорошей flop price.",
      textEn: "Deep OOP makes dominated continues costly despite good flop price.",
    },
  },
  {
    label: "B4_3BP05",
    decisionIds: [
      "PM-B4-3BP05-101",
      "PM-B4-3BP05-102",
      "PM-B4-3BP05-103",
      "PM-B4-3BP05-104",
    ],
    canonical: {
      textRu: "Глубокие решения в 3-бет-банке сохраняют больше будущих веток: упрощённые правила и автоматическая игра на стек при низком SPR переносятся хуже.",
      textEn: "Deep 3BP solutions retain more future branches; low-SPR shortcuts and automatic commitment become less transferable.",
    },
    presented: {
      textRu: "Deep 3BP сохраняет future branches; low-SPR auto-commit переносится хуже.",
      textEn: "Deep 3BP keeps more branches; low-SPR auto-commit transfers poorly.",
    },
  },
  {
    label: "B4_RIV01",
    decisionIds: [
      "PM-B4-RIV01-101",
      "PM-B4-RIV01-102",
      "PM-B4-RIV01-103",
      "PM-B4-RIV01-104",
    ],
    canonical: {
      textRu: "Вэлью-сайзинг должен целиться в реальные худшие продолжения; общий ярлык «отдающий игрок» не оправдывает любой размер ставки.",
      textEn: "Value sizing must target actual worse continues; a generic 'station' label cannot justify every size.",
    },
    presented: {
      textRu: "Value size целится в реальные worse calls; ярлык station не оправдывает size.",
      textEn: "Value size needs real worse calls; station cannot justify any size.",
    },
  },
  {
    label: "B1_BL06",
    decisionIds: [
      "PM-BL-06-B1-101",
      "PM-BL-06-B1-102",
      "PM-BL-06-B1-103",
      "PM-BL-06-B1-104",
      "PM-BL-06-B1-105",
      "PM-BL-06-B1-106",
      "PM-BL-06-B1-107",
      "PM-BL-06-B1-108",
    ],
    canonical: {
      textRu: "Разобранная статья о кэш-игре в блайнд-войне прямо объясняет, что колл необычно привлекателен для SB и что миксы открытия SB против BB сильно зависят от того, как отвечает BB.",
      textEn: "GTO Wizard's reviewed cash article explicitly explains that calling is unusually attractive for SB and that BvB opening mixes are highly sensitive to BB responses.",
    },
    presented: {
      textRu: "Колл SB ценен; opening mix зависит от ответа BB",
      textEn: "SB calling is unusually attractive, and the opening mix changes with BB responses.",
    },
  },
  {
    label: "B1_BL07",
    decisionIds: [
      "PM-BL-07-B1-101",
      "PM-BL-07-B1-102",
      "PM-BL-07-B1-103",
      "PM-BL-07-B1-104",
      "PM-BL-07-B1-105",
      "PM-BL-07-B1-106",
      "PM-BL-07-B1-107",
      "PM-BL-07-B1-108",
    ],
    canonical: {
      textRu: "Разобранная статья про игру BB против SB называет структурными причинами широкой защиты именно цену BB, закрытие торгов и позицию постфлоп.",
      textEn: "Upswing's reviewed BvB caller article identifies the BB's price, closing action and postflop position as the structural reasons this node defends widely.",
    },
    presented: {
      textRu: "Цена+closing+IP дают BB широкую защиту в BvB",
      textEn: "BB defends widely versus SB because price, closing action, and postflop position all help.",
    },
  },
  {
    label: "B1_BL08",
    decisionIds: [
      "PM-BL-08-B1-101",
      "PM-BL-08-B1-102",
      "PM-BL-08-B1-103",
      "PM-BL-08-B1-104",
      "PM-BL-08-B1-105",
      "PM-BL-08-B1-106",
      "PM-BL-08-B1-107",
      "PM-BL-08-B1-108",
    ],
    canonical: {
      textRu: "Разобранные источники по блайнд-войне описывают ответ BB как сравнение EV рейза и EV чека, а не как правило «лимп SB значит слабость, поэтому рейзить».",
      textEn: "Upswing and GTO Wizard both frame the BB response as a raise-vs-check EV comparison, not 'raise because SB showed weakness'.",
    },
    presented: {
      textRu: "Рейз BB vs чек — по EV, не по слабости лимпа",
      textEn: "BB must compare raise EV with check EV, not assume an SB limp signals weakness.",
    },
  },
  {
    label: "B1_BL09",
    decisionIds: [
      "PM-BL-09-B1-101",
      "PM-BL-09-B1-102",
      "PM-BL-09-B1-103",
      "PM-BL-09-B1-104",
      "PM-BL-09-B1-105",
      "PM-BL-09-B1-106",
      "PM-BL-09-B1-107",
      "PM-BL-09-B1-108",
    ],
    canonical: {
      textRu: "Разобранные источники по блайнд-войне прямо показывают, что грамотный лимп-диапазон SB содержит ловушки и сильные руки, и обсуждают ответы SB после изолирующего рейза BB.",
      textEn: "A sound SB limping range contains traps and strong hands, so it needs a response branch after a BB isolation raise.",
    },
    presented: {
      textRu: "Лимп SB с сильными руками требует ответа BB",
      textEn: "A sound SB limp includes strong hands and traps, so it needs a response branch versus a BB raise.",
    },
  },
];

const reasonLengthRepairByDecisionId = new Map<string, PracticalAssessmentReasonRepairGroup>();
for (const group of practicalAssessmentReasonRepairGroups) {
  for (const decisionId of group.decisionIds) {
    if (reasonLengthRepairByDecisionId.has(decisionId)) throw new Error(`Duplicate length-repair decision: ${decisionId}`);
    reasonLengthRepairByDecisionId.set(decisionId, group);
  }
}

type RuActionLengthRepair = Pick<PracticalDecisionOption, "textRu">;

// EN action length was not a material contributor on the starting corpus. Keep
// its canonical learner wording unchanged instead of manufacturing a shortest cue.
const actionLengthRepairs: Record<string, RuActionLengthRepair> = {
  "PM-3BP-05-001": { textRu: "Ослабевают: нужен более выборочный план" },
  "PM-3BP-05-A7-103": { textRu: "Широкая ставка агрессора + широкая защита" },
  "PM-3BP-05-A7-104": { textRu: "Уже диапазон ставки, плотнее защита" },
  "PM-3BP-05-A7-108": { textRu: "Сохрани роль, доску и размер ставки" },
  "PM-TURN-02-A8-202": { textRu: "Рука × ран-аут × сохранившийся диапазон" },
  "PM-TURN-02-A8-205": { textRu: "Баррель, если карта и диапазоны поддерживают" },
  "PM-TURN-02-A8-207": { textRu: "Баррель, если карта и диапазоны поддерживают давление" },
  "PM-TURN-02-A8-108": { textRu: "Нет автобарреля: рука и тёрн должны поддерживать давление" },
  "PM-TURN-02-FINAL-101": { textRu: "С диапазона, который пережил колл флопа" },
  "PM-TURN-02-FINAL-102": { textRu: "Сузиться: естественных блефов стало меньше" },
  "PM-TURN-02-FINAL-103": { textRu: "Усиливающий тёрн делает рейз правдоподобнее" },
  "PM-TURN-02-FINAL-104": { textRu: "Нет — текущий диапазон и цена важнее прошлых фишек" },
  "PM-TURN-02-ETC-101": { textRu: "Нет — пересобери диапазон, владение, SPR и задачу ставки" },
  "PM-TURN-02-ETC-102": { textRu: "Нет — бланк требует отдельной вэлью- или фолд-эквити цели" },
  "PM-RIV-03-A8-202": { textRu: "Цена × реальный запас блефов × блокеры × предыдущая линия" },
  "PM-RIV-03-A8-205": { textRu: "Колл, если блефов хватает для этой цены" },
  "PM-RIV-03-A8-207": { textRu: "Колл хуже: блефов меньше при той же цене" },
  "PM-RIV-03-A8-108": { textRu: "Хорошая цена не требует колла без достаточных блефов после линии" },
  "PM-RIV-03-C0-201": { textRu: "Широкий старт даёт больше блефов; линия их фильтрует" },
  "PM-RIV-03-C0-202": { textRu: "Разномастные классы дают больше комбо и могут оставить больше слабых рук к риверу" },
  "PM-RIV-03-C0-203": { textRu: "Цена × дожившие блефы; широкий старт — лишь исходная оценка" },
  "PM-RIV-03-C0-204": { textRu: "Колл хуже без конкретных блефов после линии" },
  "PM-RIV-03-C0-205": { textRu: "Нет — пересчитай от более узкого старта через те же фильтры" },
  "PM-RIV-03-C0-206": { textRu: "Нет — последующая фильтрация может перевесить широкий старт" },
  "PM-RIV-03-C0-207": { textRu: "Широкий старт — лишь исходная оценка; решают линия и полевые данные" },
  "PM-RIV-03-C0-208": { textRu: "Тайтовый старт снижает возможные блефы" },
};

export function practicalAssessmentLengthPresentedOptions(
  decision: Pick<PracticalDecision, "id" | "learnerEligibility" | "correctActionId" | "correctReasonId">,
  stage: "action" | "reason",
  options: readonly PracticalDecisionOption[],
): PracticalDecisionOption[] {
  if (decision.learnerEligibility === "INTERNAL_ONLY") return [...options];
  if (stage === "action") {
    const repair = actionLengthRepairs[decision.id];
    if (!repair) return [...options];
    return options.map((option) => option.id === decision.correctActionId ? { ...option, ...repair } : option);
  }
  const group = reasonLengthRepairByDecisionId.get(decision.id);
  if (!group) return [...options];
  const correct = options.find((option) => option.id === decision.correctReasonId);
  if (!correct || correct.textRu !== group.canonical.textRu || correct.textEn !== group.canonical.textEn) return [...options];
  return options.map((option) => option.id === decision.correctReasonId ? { ...option, ...group.presented } : option);
}
