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
      textRu: "На 250–300bb без позиции труднее реализовать эквити, а ошибки в доминируемых банках стоят дороже; поэтому пограничные 3-беты со 100bb теряют EV и структура 3-бета должна стать более избирательной.",
      textEn: "At 250–300bb, playing out of position makes equity harder to realize and dominated branches more expensive; marginal 100bb 3-bets therefore lose EV and the 3-bet structure must become more selective.",
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
      textRu: "Крупный 3-бет ухудшает текущую цену, а глубокий стек оставляет больше дорогих решений впереди; вместе это меняет реализацию эквити и сдвигает EV-пороги колла, 4-бета и фолда.",
      textEn: "A large 3-bet worsens the current price while deep stacks leave more costly future decisions; together they change equity realization and move the EV thresholds for calling, 4-betting, and folding.",
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
      textRu: "Даже при привлекательной цене на флопе глубокий стек без позиции ухудшает реализацию эквити: доминируемые продолжения чаще платят на следующих улицах и несут больший риск обратных имплайд-оддсов, поэтому их EV падает.",
      textEn: "Even at an attractive flop price, deep stacks out of position reduce equity realization: dominated continues pay more often on later streets and carry greater reverse-implied-odds risk, so their EV falls.",
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
  {
    label: "COMPOSITE_FND04_B1",
    decisionIds: [
      "PM-FND-04-B1-101", "PM-FND-04-B1-102", "PM-FND-04-B1-103", "PM-FND-04-B1-104",
      "PM-FND-04-B1-105", "PM-FND-04-B1-106", "PM-FND-04-B1-107", "PM-FND-04-B1-108",
    ],
    canonical: {
      textRu: "Разобранные материалы про ауты описывают грязные ауты как карты, которые внешне улучшают руку, но не гарантируют лучшую руку на шоудауне, и предупреждают, что полный учёт таких карт завышает эквити.",
      textEn: "Dirty outs are apparent improvements that do not reliably make the best hand; counting them fully overstates equity.",
    },
    presented: {
      textRu: "Грязный аут может улучшить нашу комбинацию, но не сделать её лучшей; если считать такие ауты полностью, мы завысим эквити против диапазона соперника.",
      textEn: "A dirty out can improve our hand without making it best; counting dirty outs in full can overstate our equity against the opponent's range.",
    },
  },
  {
    label: "COMPOSITE_W4_DRAW_B1",
    decisionIds: [
      "PM-W4-DRAW-B1-101", "PM-W4-DRAW-B1-102", "PM-W4-DRAW-B1-103", "PM-W4-DRAW-B1-104",
      "PM-W4-DRAW-B1-105", "PM-W4-DRAW-B1-106", "PM-W4-DRAW-B1-107", "PM-W4-DRAW-B1-108",
    ],
    canonical: {
      textRu: "Разобранные материалы про ауты описывают грязные ауты и пересечение комбо-дро, а связанный источник про рейзы с дро объединяет устойчивость дро, фолд-эквити и срочность рейза в единое решение.",
      textEn: "Dirty-outs and combo-draw overlap change draw robustness; raising urgency also depends on fold equity and how cleanly the draw improves.",
    },
    presented: {
      textRu: "Качество дро зависит не только от числа аутов: нужно учитывать грязные и пересекающиеся ауты, натсовый потенциал и фолд-эквити, если рассматриваем рейз.",
      textEn: "Draw quality depends on more than the raw number of outs: dirty or overlapping outs, nut potential, and fold equity all matter when considering a raise.",
    },
  },
  {
    label: "COMPOSITE_DEEP02_B1",
    decisionIds: [
      "PM-DEEP-02-B1-101", "PM-DEEP-02-B1-102", "PM-DEEP-02-B1-103", "PM-DEEP-02-B1-104",
      "PM-DEEP-02-B1-105", "PM-DEEP-02-B1-106", "PM-DEEP-02-B1-107", "PM-DEEP-02-B1-108",
    ],
    canonical: {
      textRu: "Разобранные материалы по глубокому стеку прямо сравнивают ответы на 300bb в кэш-игре и показывают, что блайнды без позиции 3-бетят реже, поскольку глубина усиливает проблемы реализации эквити; сравнение сет-майнинга на 300bb показывает и больший потенциальный выигрыш, и больший риск реверсивных имплайд-оддсов.",
      textEn: "At 300bb, OOP blinds can 3-bet less because depth magnifies realization problems; at 300bb, implied-odds upside is also paired with larger reverse-implied losses.",
    },
    presented: {
      textRu: "На глубоких стеках сложнее реализовать эквити без позиции, поэтому часть 3-бетов становится менее привлекательной, а риск обратных имплайд-оддсов растёт.",
      textEn: "Deep stacks make equity realization harder out of position, so some 3-bets become less attractive while reverse-implied-odds risk increases.",
    },
  },
  {
    label: "COMPOSITE_EXP06_B1",
    decisionIds: [
      "PM-EXP-06-B1-101", "PM-EXP-06-B1-102", "PM-EXP-06-B1-103", "PM-EXP-06-B1-104",
      "PM-EXP-06-B1-105", "PM-EXP-06-B1-106", "PM-EXP-06-B1-107", "PM-EXP-06-B1-108",
    ],
    canonical: {
      textRu: "Разобранные источники про выбор игры и места рассматривают это решение как EV-задачу и предупреждают, что поверхностное профилирование или размер стеков сами по себе — недостаточное доказательство.",
      textEn: "PokerCoaching and CardPlayer sources treat game/seat selection as an EV decision and caution that superficial profiling or chip-stack appearance is insufficient evidence.",
    },
    presented: {
      textRu: "EV стола и места зависит от качества и активности соперников и нашей позиции относительно сильных игроков; размер стека и поверхностный типаж сами по себе этого не показывают.",
      textEn: "Game and seat EV depend on opponent quality, activity, and our position relative to strong players; stack size or superficial player types do not establish that EV on their own.",
    },
  },
  {
    label: "COMPOSITE_MW05_B1",
    decisionIds: [
      "PM-MW-05-B1-101", "PM-MW-05-B1-102", "PM-MW-05-B1-103", "PM-MW-05-B1-104",
      "PM-MW-05-B1-105", "PM-MW-05-B1-106", "PM-MW-05-B1-107", "PM-MW-05-B1-108",
    ],
    canonical: {
      textRu: "Разобранные источники по мультивей-игре показывают, что продолжающие диапазоны сильнее, а блефов меньше; каноническая логика ривера по-прежнему требует более слабых целей для вэлью или правдоподобных блефов. Это ограниченное дисциплинирующее правило, а не полное солверное дерево для мультивея.",
      textEn: "Multiway continuing ranges are generally stronger and bluff supply smaller; river value and bluff-catches still require concrete worse calls or credible bluffs.",
    },
    presented: {
      textRu: "В мультивей-банке диапазоны продолжения обычно сильнее, а блефов меньше, поэтому для вэлью нужны реальные более слабые коллы, а для блеф-кетча — правдоподобные блефы.",
      textEn: "Multiway continuing ranges are usually stronger and contain fewer bluffs, so value needs real worse calls and bluff-catches need credible bluffs.",
    },
  },
];

export type PracticalAssessmentExactReasonRepair = {
  canonical: LocalizedReason;
  presented: LocalizedReason;
};

export const practicalAssessmentExactReasonRepairs: Readonly<Record<string, PracticalAssessmentExactReasonRepair>> = {
  "PM-BL-01-001": {
    canonical: {
      textRu: "EP origin range сильнее и повышает domination/overpair density",
      textEn: "The EP origin range is stronger and increases domination/overpair density",
    },
    presented: {
      textRu: "Диапазон открытия из EP обычно сильнее, поэтому слабые пары и топ-пары чаще попадают под доминацию или сталкиваются с оверпарами.",
      textEn: "The EP opening range is usually stronger, so marginal pairs and top pairs face more domination and overpairs.",
    },
  },
  "PM-BL-01-101": {
    canonical: {
      textRu: "Концентрированный диапазон EP сильнее на ветках топ-пары и оверпары",
      textEn: "A concentrated EP range is stronger on top-pair/overpair branches",
    },
    presented: {
      textRu: "Против более плотного диапазона EP пограничная защита хуже реализуется на ветках топ-пары и оверпары.",
      textEn: "A tighter EP range reaches postflop with stronger top-pair and overpair branches, reducing the value of marginal defense.",
    },
  },
  "PM-BL-01-102": {
    canonical: {
      textRu: "Защита BB многофакторна: цена и закрытие торгов против силы исходного диапазона и реализации эквити",
      textEn: "BB defense is multi-factor: price/closing action versus origin strength/realization",
    },
    presented: {
      textRu: "Защиту BB нельзя оценивать только по цене: нужно учитывать силу исходного диапазона, закрываем ли мы торги и насколько хорошо рука реализует эквити.",
      textEn: "BB defense is not just about price; it also depends on origin-range strength, whether the action closes, and equity realization.",
    },
  },
  "PM-BL-01-104": {
    canonical: {
      textRu: "Доминация и будущее давление могут свести номинальную эквити на нет",
      textEn: "Domination and future pressure can erase nominal equity",
    },
    presented: {
      textRu: "Номинальной эквити недостаточно, если наша рука часто доминирована и будет сталкиваться с давлением на следующих улицах.",
      textEn: "Nominal equity is not enough when our hand is often dominated and faces pressure on later streets.",
    },
  },
  "PM-BL-01-105": {
    canonical: {
      textRu: "Логика опирается на реальную силу исходного диапазона, а не только на метку позиции",
      textEn: "Actual origin-range strength matters more than the seat label alone",
    },
    presented: {
      textRu: "Пограничную защиту нужно строить от реальной силы исходного диапазона, а не только от названия позиции соперника.",
      textEn: "Marginal defense should be based on actual origin-range strength, not only the opponent's position label.",
    },
  },
  "PM-BL-01-107": {
    canonical: {
      textRu: "Механизм строится на цене, исходном диапазоне и реализации эквити, а не на фиксированной позиционной команде",
      textEn: "The source mechanism is price + origin range + realization, not a fixed positional command",
    },
    presented: {
      textRu: "Общее правило «тайтово против EP» — лишь отправная точка; решение зависит от цены, силы исходного диапазона и реализации эквити.",
      textEn: "Tight versus EP is only a default; price, origin-range strength, and equity realization still determine the decision.",
    },
  },
  "PM-BL-05-001": {
    canonical: {
      textRu: "Правило по умолчанию зависит от риска сквиза и игроков позади; пассивный BB может изменить EV ветки",
      textEn: "The default depends on squeeze risk and the table behind; a passive BB can change branch EV",
    },
    presented: {
      textRu: "«3-бет или фолд» — полезное базовое правило, но риск сквиза и игроки позади могут сделать колл допустимой веткой.",
      textEn: "3-bet or fold is a useful default, but squeeze risk and the players behind can make calling viable.",
    },
  },
  "PM-BL-05-101": {
    canonical: {
      textRu: "Снижение риска сквиза может вернуть часть коллов, но позиционный минус остаётся",
      textEn: "Lower squeeze risk can restore some flats, while the positional cost remains",
    },
    presented: {
      textRu: "Если риск сквиза снижается, часть коллов снова становится допустимой, хотя позиционный минус SB остаётся.",
      textEn: "When squeeze risk falls, some calls become viable again even though SB still has a positional disadvantage.",
    },
  },
  "PM-BL-05-102": {
    canonical: {
      textRu: "Один из главных штрафов колла — риск сквиза — стал меньше",
      textEn: "One major flatting penalty — squeeze exposure — has fallen",
    },
    presented: {
      textRu: "Когда риск сквиза меньше, один из главных штрафов колла уменьшается, поэтому EV колла может вырасти.",
      textEn: "Lower squeeze risk removes one of the main costs of calling, so call EV can increase.",
    },
  },
  "PM-BL-05-106": {
    canonical: {
      textRu: "Один из главных структурных штрафов — риск сквиза — исчез",
      textEn: "One major structural penalty — squeeze risk — has fallen",
    },
    presented: {
      textRu: "Если позади некому сквизить, колл теряет один из главных структурных штрафов и становится привлекательнее.",
      textEn: "If nobody behind can squeeze, calling loses one of its main structural penalties and becomes more attractive.",
    },
  },
  "PM-BL-05-107": {
    canonical: {
      textRu: "Источник прямо называет \"3-бет или фолд\" полезным правилом по умолчанию, а не буквальным запретом",
      textEn: "3-bet-or-fold is a useful default, not a literal prohibition",
    },
    presented: {
      textRu: "Правило «3-бет или фолд» полезно как базовая стратегия, но оно не запрещает колл во всех составах и ветках.",
      textEn: "3-bet or fold is a useful default, not a literal ban on calling in every lineup and branch.",
    },
  },
  "PM-BL-05-108": {
    canonical: {
      textRu: "Более сильный диапазон открытия обычно снижает фолд-эквити и усиливает ветку после колла",
      textEn: "A stronger origin range usually reduces fold equity and strengthens the called branch",
    },
    presented: {
      textRu: "Более сильный диапазон открытия обычно реже фолдит на 3-бет и продолжает с более сильными руками, поэтому пограничные блефы теряют EV.",
      textEn: "A stronger opening range usually folds less to 3-bets and continues with stronger hands, reducing the EV of marginal bluffs.",
    },
  },
  "PM-PF-08-001": {
    canonical: {
      textRu: "Блефовые 4-беты требуют фолдов; диапазон с перевесом вэлью убирает часть стимулов блефовать",
      textEn: "Bluff 4-bets require folds; an underbluffing/value-heavy branch removes some bluff incentives",
    },
    presented: {
      textRu: "Блефовый 4-бет зарабатывает за счёт фолдов; если соперник продолжает в основном с вэлью, стимул блефовать снижается.",
      textEn: "Bluff 4-bets earn through folds; when the opponent continues value-heavy, the incentive to bluff decreases.",
    },
  },
  "PM-PF-08-101": {
    canonical: {
      textRu: "Руки средней силы нередко сохраняют больше EV через колл, чем через 4-бет с последующим фолдом на пуш",
      textEn: "Medium hands can retain more EV by calling rather than 4-bet/folding to jams",
    },
    presented: {
      textRu: "Средние руки часто сохраняют больше EV через колл, чем через 4-бет с последующим фолдом на пуш.",
      textEn: "Medium-strength hands can keep more EV by calling than by 4-betting and then folding to a jam.",
    },
  },
  "PM-PF-08-102": {
    canonical: {
      textRu: "Более короткое дерево при низком SPR может уменьшить то, насколько игрок в позиции реализует своё преимущество",
      textEn: "A shallower future tree can reduce how much IP compounds its advantage",
    },
    presented: {
      textRu: "Более низкий SPR сокращает постфлоп-дерево и уменьшает пространство, в котором игрок в позиции реализует своё преимущество.",
      textEn: "A lower SPR shortens the postflop tree and reduces how much an in-position player can compound positional advantage.",
    },
  },
  "PM-PF-08-103": {
    canonical: {
      textRu: "Не стоит считать 4-бет вэлью, если против предполагаемого диапазона 5-бета мы не готовы корректно продолжать",
      textEn: "Do not 4-bet for value unless prepared to continue appropriately versus the assumed 5-bet range",
    },
    presented: {
      textRu: "4-бет нельзя автоматически считать вэлью: против предполагаемого диапазона 5-бета мы должны быть готовы корректно продолжать.",
      textEn: "A 4-bet is not automatically for value; Hero must be prepared to continue correctly against the assumed 5-bet range.",
    },
  },
  "PM-PF-08-104": {
    canonical: {
      textRu: "Когда фолдов мало, блефовый 4-бет теряет главный источник EV",
      textEn: "Without fold targets, polar bluffs lose their main EV source",
    },
    presented: {
      textRu: "Если соперник мало фолдит на 4-бет, блефовая часть теряет главный источник EV и должна сокращаться.",
      textEn: "When the opponent folds too little to 4-bets, the bluff region loses its main EV source and should contract.",
    },
  },
  "PM-BL-06-B1-104": {
    canonical: {
      textRu: "Разобранная статья о кэш-игре в блайнд-войне прямо объясняет, что колл необычно привлекателен для SB и что миксы открытия SB против BB сильно зависят от того, как отвечает BB.",
      textEn: "GTO Wizard's reviewed cash article explicitly explains that calling is unusually attractive for SB and that BvB opening mixes are highly sensitive to BB responses.",
    },
    presented: {
      textRu: "Колл с SB может быть прибыльной частью диапазона, но его место в миксе зависит от цены, диапазонов и реакции BB; поэтому правило нужно применять только после проверки этих предпосылок.",
      textEn: "Calling from SB can be a profitable part of the range, but its place in the mix depends on price, ranges, and BB's response; the rule therefore applies only after those assumptions are checked.",
    },
  },
  "PM-BL-06-B1-105": {
    canonical: {
      textRu: "Разобранная статья о кэш-игре в блайнд-войне прямо объясняет, что колл необычно привлекателен для SB и что миксы открытия SB против BB сильно зависят от того, как отвечает BB.",
      textEn: "GTO Wizard's reviewed cash article explicitly explains that calling is unusually attractive for SB and that BvB opening mixes are highly sensitive to BB responses.",
    },
    presented: {
      textRu: "После колла SB остаётся без позиции, поэтому текущая скидка в 0.5bb недостаточна: EV зависит от реализации эквити, ответов BB и силы его продолжающего диапазона.",
      textEn: "After calling, SB remains out of position, so the 0.5bb discount is not enough by itself: EV depends on equity realization, BB's responses, and the strength of BB's continuing range.",
    },
  },
  "PM-BL-06-B1-106": {
    canonical: {
      textRu: "Разобранная статья о кэш-игре в блайнд-войне прямо объясняет, что колл необычно привлекателен для SB и что миксы открытия SB против BB сильно зависят от того, как отвечает BB.",
      textEn: "GTO Wizard's reviewed cash article explicitly explains that calling is unusually attractive for SB and that BvB opening mixes are highly sensitive to BB responses.",
    },
    presented: {
      textRu: "Когда BB начинает активно атаковать лимпы, меняется EV лимпа и последующих продолжений; поэтому прежний микс открытия SB нельзя переносить без пересчёта.",
      textEn: "When BB starts attacking limps aggressively, the EV of limping and its continuation branches changes, so the previous SB opening mix cannot be carried over without recomputation.",
    },
  },
  "PM-BL-06-B1-107": {
    canonical: {
      textRu: "Разобранная статья о кэш-игре в блайнд-войне прямо объясняет, что колл необычно привлекателен для SB и что миксы открытия SB против BB сильно зависят от того, как отвечает BB.",
      textEn: "GTO Wizard's reviewed cash article explicitly explains that calling is unusually attractive for SB and that BvB opening mixes are highly sensitive to BB responses.",
    },
    presented: {
      textRu: "Пограничное действие живёт около нулевого EV: изменение диапазона BB, глубины или его реакции меняет будущую реализацию и может перевести эту ветку из прибыли в убыток.",
      textEn: "A marginal action sits near zero EV: changing BB's range, depth, or response changes future realization and can move that branch from profitable to losing.",
    },
  },
  "PM-BL-06-B1-108": {
    canonical: {
      textRu: "Разобранная статья о кэш-игре в блайнд-войне прямо объясняет, что колл необычно привлекателен для SB и что миксы открытия SB против BB сильно зависят от того, как отвечает BB.",
      textEn: "GTO Wizard's reviewed cash article explicitly explains that calling is unusually attractive for SB and that BvB opening mixes are highly sensitive to BB responses.",
    },
    presented: {
      textRu: "Первое действие SB не сводится к универсальному «рейз или фолд»: колл может иметь EV, а его частота зависит от диапазонов, цены и того, как BB отвечает на лимп.",
      textEn: "SB's first action is not universally raise-or-fold: calling can have EV, and its frequency depends on ranges, price, and how BB responds to limps.",
    },
  },
  "PM-BL-07-B1-104": {
    canonical: {
      textRu: "Разобранная статья про игру BB против SB называет структурными причинами широкой защиты именно цену BB, закрытие торгов и позицию постфлоп.",
      textEn: "Upswing's reviewed BvB caller article identifies the BB's price, closing action and postflop position as the structural reasons this node defends widely.",
    },
    presented: {
      textRu: "Широкая защита BB против SB оправдана сочетанием хорошей цены, закрытия торгов и позиции постфлоп; если эти условия меняются, прежний ориентир нужно пересчитать.",
      textEn: "Wide BB defense versus SB is supported by good price, closing the action, and postflop position; if those conditions change, the prior must be recomputed.",
    },
  },
  "PM-BL-07-B1-105": {
    canonical: {
      textRu: "Разобранная статья про игру BB против SB называет структурными причинами широкой защиты именно цену BB, закрытие торгов и позицию постфлоп.",
      textEn: "Upswing's reviewed BvB caller article identifies the BB's price, closing action and postflop position as the structural reasons this node defends widely.",
    },
    presented: {
      textRu: "Позиция и закрытие торгов помогают BB реализовать эквити, но не отменяют силу диапазона SB и будущие ветки; поэтому пограничный колл оценивается по всему дереву, а не только по цене.",
      textEn: "Position and closing the action help BB realize equity, but they do not erase SB's range strength or future branches; a marginal call therefore depends on the whole tree, not price alone.",
    },
  },
  "PM-BL-07-B1-106": {
    canonical: {
      textRu: "Разобранная статья про игру BB против SB называет структурными причинами широкой защиты именно цену BB, закрытие торгов и позицию постфлоп.",
      textEn: "Upswing's reviewed BvB caller article identifies the BB's price, closing action and postflop position as the structural reasons this node defends widely.",
    },
    presented: {
      textRu: "Более крупный опен SB ухудшает цену колла BB; при тех же позиции и руке это повышает требуемую реализацию эквити и сужает пограничную защиту.",
      textEn: "A larger SB open worsens BB's call price; with position and hand unchanged, the required equity realization rises and marginal defense contracts.",
    },
  },
  "PM-BL-07-B1-107": {
    canonical: {
      textRu: "Разобранная статья про игру BB против SB называет структурными причинами широкой защиты именно цену BB, закрытие торгов и позицию постфлоп.",
      textEn: "Upswing's reviewed BvB caller article identifies the BB's price, closing action and postflop position as the structural reasons this node defends widely.",
    },
    presented: {
      textRu: "Пограничная защита BB чувствительна к цене, силе диапазона SB и условиям реализации; существенное изменение любого из них может сдвинуть действие через ноль EV.",
      textEn: "Marginal BB defense is sensitive to price, SB range strength, and realization conditions; a material change in any of them can move the action through zero EV.",
    },
  },
  "PM-BL-07-B1-108": {
    canonical: {
      textRu: "Разобранная статья про игру BB против SB называет структурными причинами широкой защиты именно цену BB, закрытие торгов и позицию постфлоп.",
      textEn: "Upswing's reviewed BvB caller article identifies the BB's price, closing action and postflop position as the structural reasons this node defends widely.",
    },
    presented: {
      textRu: "Защиту BB против SB нельзя копировать из узлов против BTN или EP: здесь другие исходный диапазон, цена и постфлоп-позиция, поэтому граница продолжения должна строиться заново.",
      textEn: "BB defense versus SB cannot be copied from BTN or EP nodes: the origin range, price, and postflop position differ, so the continuing boundary must be rebuilt.",
    },
  },
  "PM-BL-08-B1-104": {
    canonical: {
      textRu: "Разобранные источники по блайнд-войне описывают ответ BB как сравнение EV рейза и EV чека, а не как правило «лимп SB значит слабость, поэтому рейзить».",
      textEn: "Upswing and GTO Wizard both frame the BB response as a raise-vs-check EV comparison, not 'raise because SB showed weakness'.",
    },
    presented: {
      textRu: "После лимпа SB чек BB уже сохраняет бесплатную реализацию, поэтому рейз нужен только когда его EV выше с учётом диапазона лимпа, фолдов и ответов на рейз.",
      textEn: "After an SB limp, checking already preserves free realization for BB, so raising is justified only when its EV is higher after accounting for the limp range, folds, and responses to the raise.",
    },
  },
  "PM-BL-08-B1-105": {
    canonical: {
      textRu: "Разобранные источники по блайнд-войне описывают ответ BB как сравнение EV рейза и EV чека, а не как правило «лимп SB значит слабость, поэтому рейзить».",
      textEn: "Upswing and GTO Wizard both frame the BB response as a raise-vs-check EV comparison, not 'raise because SB showed weakness'.",
    },
    presented: {
      textRu: "EV рейза BB включает не только текущие фолды: важны реализация после чека, диапазон продолжения SB и будущие ответы, поэтому решение нужно сравнивать с полноценной веткой чека.",
      textEn: "BB's raise EV is not only about immediate folds: realization after checking, SB's continuing range, and future responses matter, so raising must be compared with the full check branch.",
    },
  },
  "PM-BL-08-B1-106": {
    canonical: {
      textRu: "Разобранные источники по блайнд-войне описывают ответ BB как сравнение EV рейза и EV чека, а не как правило «лимп SB значит слабость, поэтому рейзить».",
      textEn: "Upswing and GTO Wizard both frame the BB response as a raise-vs-check EV comparison, not 'raise because SB showed weakness'.",
    },
    presented: {
      textRu: "Если SB начинает часто лимп-коллировать, фолд-эквити рейза BB падает и ветка после колла становится важнее; пограничные рейзы без достаточного вэлью теряют EV.",
      textEn: "If SB starts limp-calling frequently, BB's raise fold equity falls and the called branch matters more; marginal raises without enough value lose EV.",
    },
  },
  "PM-BL-08-B1-107": {
    canonical: {
      textRu: "Разобранные источники по блайнд-войне описывают ответ BB как сравнение EV рейза и EV чека, а не как правило «лимп SB значит слабость, поэтому рейзить».",
      textEn: "Upswing and GTO Wizard both frame the BB response as a raise-vs-check EV comparison, not 'raise because SB showed weakness'.",
    },
    presented: {
      textRu: "Пограничный рейз может сменить знак EV, когда меняются лимп-диапазон, глубина или реакция SB; поэтому его нужно заново сравнивать с бесплатной веткой чека.",
      textEn: "A marginal raise can change EV sign when the limp range, depth, or SB response changes, so it must be compared again with the free check branch.",
    },
  },
  "PM-BL-08-B1-108": {
    canonical: {
      textRu: "Разобранные источники по блайнд-войне описывают ответ BB как сравнение EV рейза и EV чека, а не как правило «лимп SB значит слабость, поэтому рейзить».",
      textEn: "Upswing and GTO Wizard both frame the BB response as a raise-vs-check EV comparison, not 'raise because SB showed weakness'.",
    },
    presented: {
      textRu: "Лимп SB не доказывает слабость: BB может бесплатно чекнуть, а рейз должен выигрывать у чека за счёт реальных фолдов, вэлью или лучшей реализации.",
      textEn: "An SB limp does not prove weakness: BB can check for free, and a raise must beat checking through real folds, value, or better realization.",
    },
  },
  "PM-BL-09-B1-104": {
    canonical: {
      textRu: "Разобранные источники по блайнд-войне прямо показывают, что грамотный лимп-диапазон SB содержит ловушки и сильные руки, и обсуждают ответы SB после изолирующего рейза BB.",
      textEn: "A sound SB limping range contains traps and strong hands, so it needs a response branch after a BB isolation raise.",
    },
    presented: {
      textRu: "Лимп-диапазон SB должен содержать сильные руки и ловушки, поэтому после рейза BB решение строится от реального состава лимпа, цены и диапазона рейза, а не от ярлыка «лимп = слабость».",
      textEn: "An SB limping range should contain strong hands and traps, so versus a BB raise the decision depends on the actual limp composition, price, and raising range rather than the label 'limp equals weak'.",
    },
  },
  "PM-BL-09-B1-105": {
    canonical: {
      textRu: "Разобранные источники по блайнд-войне прямо показывают, что грамотный лимп-диапазон SB содержит ловушки и сильные руки, и обсуждают ответы SB после изолирующего рейза BB.",
      textEn: "A sound SB limping range contains traps and strong hands, so it needs a response branch after a BB isolation raise.",
    },
    presented: {
      textRu: "После рейза BB важны не только уже вложенные фишки: размер рейза, сила его диапазона и постфлоп-реализация определяют, какие руки SB продолжают коллом, 3-бетом или фолдом.",
      textEn: "After BB raises, the chips already invested are not enough: raise size, range strength, and postflop realization determine which SB hands continue by calling, 3-betting, or folding.",
    },
  },
  "PM-BL-09-B1-106": {
    canonical: {
      textRu: "Разобранные источники по блайнд-войне прямо показывают, что грамотный лимп-диапазон SB содержит ловушки и сильные руки, и обсуждают ответы SB после изолирующего рейза BB.",
      textEn: "A sound SB limping range contains traps and strong hands, so it needs a response branch after a BB isolation raise.",
    },
    presented: {
      textRu: "Когда BB рейзит крупнее и с более вэлью-ориентированным диапазоном, цена SB ухудшается и его продолжения чаще доминированы; пограничная часть диапазона должна сузиться.",
      textEn: "When BB raises larger with a more value-heavy range, SB gets a worse price and its continues are more often dominated; the marginal continuing region should contract.",
    },
  },
  "PM-BL-09-B1-107": {
    canonical: {
      textRu: "Разобранные источники по блайнд-войне прямо показывают, что грамотный лимп-диапазон SB содержит ловушки и сильные руки, и обсуждают ответы SB после изолирующего рейза BB.",
      textEn: "A sound SB limping range contains traps and strong hands, so it needs a response branch after a BB isolation raise.",
    },
    presented: {
      textRu: "Пограничное продолжение SB чувствительно к размеру рейза, диапазону BB и глубине; изменение этих условий меняет доминацию и реализацию, поэтому EV ветки нужно пересчитать.",
      textEn: "A marginal SB continue is sensitive to raise size, BB range, and depth; changing those conditions changes domination and realization, so the branch EV must be recomputed.",
    },
  },
  "PM-BL-09-B1-108": {
    canonical: {
      textRu: "Разобранные источники по блайнд-войне прямо показывают, что грамотный лимп-диапазон SB содержит ловушки и сильные руки, и обсуждают ответы SB после изолирующего рейза BB.",
      textEn: "A sound SB limping range contains traps and strong hands, so it needs a response branch after a BB isolation raise.",
    },
    presented: {
      textRu: "Лимп не делает диапазон SB автоматически слабым или капнутым: сильные руки остаются внутри, а ответ на рейз BB должен меняться с его сайзингом и диапазоном.",
      textEn: "Limping does not make SB's range automatically weak or capped: strong hands remain in it, and the response to BB's raise must change with BB's size and range.",
    },
  },
};

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
  "PM-TURN-02-A8-108": { textRu: "Нет автобарреля: рука и тёрн должны поддерживать давление" },
  "PM-TURN-02-FINAL-101": { textRu: "С диапазона, который пережил колл флопа" },
  "PM-TURN-02-FINAL-102": { textRu: "Сузиться: естественных блефов стало меньше" },
  "PM-TURN-02-FINAL-103": { textRu: "Усиливающий тёрн делает рейз правдоподобнее" },
  "PM-TURN-02-FINAL-104": { textRu: "Нет — текущий диапазон и цена важнее прошлых фишек" },
  "PM-TURN-02-ETC-101": { textRu: "Нет — пересобери диапазон, владение, SPR и задачу ставки" },
  "PM-TURN-02-ETC-102": { textRu: "Нет — бланк требует отдельной вэлью- или фолд-эквити цели" },
  "PM-RIV-03-A8-108": { textRu: "Хорошая цена не требует колла без достаточных блефов после линии" },
  "PM-RIV-03-C0-201": { textRu: "Широкий старт даёт больше блефов; линия их фильтрует" },
  "PM-RIV-03-C0-202": { textRu: "Разномастные классы дают больше комбо и могут оставить больше слабых рук к риверу" },
  "PM-RIV-03-C0-203": { textRu: "Цена × дожившие блефы; широкий старт — лишь исходная оценка" },
  "PM-RIV-03-C0-204": { textRu: "Колл хуже без конкретных блефов после линии" },
  "PM-RIV-03-C0-205": { textRu: "Нет — пересчитай от более узкого старта через те же фильтры" },
  "PM-RIV-03-C0-206": { textRu: "Нет — последующая фильтрация может перевесить широкий старт" },
  "PM-RIV-03-C0-207": { textRu: "Широкий старт — лишь исходная оценка; решают линия и полевые данные" },
  "PM-RIV-03-C0-208": { textRu: "Нет — тайтовый старт снижает исходный запас блефов, но не заменяет разбор конкретных блефов после всей линии" },

  "PM-FND-04-B1-101": { textRu: "Проверь, какие ауты чистые против диапазона соперника, а какие остаются грязными." },
  "PM-FND-04-B1-102": { textRu: "Нет. Пересчитай качество аутов и ветку решения." },
  "PM-FND-04-B1-103": { textRu: "Чистые ауты учитывай полностью, а сомнительные и грязные дисконтируй или исключай." },
  "PM-FND-04-B1-104": { textRu: "Проверь ауты, диапазон соперника, цену и контекст." },
  "PM-FND-04-B1-105": { textRu: "Учитывай реализацию эквити, возможные ответы и сильную часть диапазона соперника." },
  "PM-FND-04-B1-106": { textRu: "Пересобери ветку и не переноси старый вывод автоматически." },
  "PM-FND-04-B1-107": { textRu: "Пограничное действие может перестать быть прибыльным, поэтому отдельно пересчитай его EV." },
  "PM-FND-04-B1-108": { textRu: "Не применяй правило универсально; сначала проверь его исходные условия." },

  "PM-W4-DRAW-B1-101": { textRu: "Для этого дро оцени чистые и пересекающиеся ауты, натсовый потенциал и ценность на шоудауне." },
  "PM-W4-DRAW-B1-102": { textRu: "Нет. Пересчитай качество дро и ветку решения." },
  "PM-W4-DRAW-B1-103": { textRu: "Классифицируй дро по его качеству, а не только по ярлыку." },
  "PM-W4-DRAW-B1-104": { textRu: "Проверь качество дро, диапазон соперника, цену и контекст." },
  "PM-W4-DRAW-B1-105": { textRu: "Для этого дро учитывай реализацию эквити, возможные ответы и сильную часть диапазона соперника." },
  "PM-W4-DRAW-B1-106": { textRu: "Пересобери ветку с учётом качества дро и не переноси старый вывод автоматически." },
  "PM-W4-DRAW-B1-107": { textRu: "Пограничное действие с этим дро может перестать быть прибыльным, поэтому отдельно пересчитай его EV." },
  "PM-W4-DRAW-B1-108": { textRu: "Не применяй правило ко всем дро одинаково; проверь чистоту аутов и натсовый потенциал." },

  "PM-DEEP-02-B1-101": { textRu: "Учитывай глубину, позицию, реализацию эквити и обратные имплайд-оддсы; линии с 100bb не переноси автоматически." },
  "PM-DEEP-02-B1-102": { textRu: "Нет. Пересчитай ветку решения для этой глубины." },
  "PM-DEEP-02-B1-103": { textRu: "Пересмотри коллы и 3-беты, осторожнее играй на стек с одной парой и выше цени позицию и натсовый потенциал." },
  "PM-DEEP-02-B1-104": { textRu: "Проверь глубину, позицию, диапазоны, цену и контекст." },
  "PM-DEEP-02-B1-105": { textRu: "Учитывай реализацию эквити, дерево ответов и сильную часть диапазона соперника." },
  "PM-DEEP-02-B1-106": { textRu: "Пересобери ветку под текущую глубину и не переноси вывод со 100bb автоматически." },
  "PM-DEEP-02-B1-107": { textRu: "Пограничное действие может перестать быть прибыльным на этой глубине, поэтому отдельно пересчитай его EV." },
  "PM-DEEP-02-B1-108": { textRu: "Не переноси правило со 100bb на 300bb без проверки его исходных условий." },

  "PM-EXP-06-B1-101": { textRu: "Оцени качество и активность соперников и своё место относительно сильных агрессивных игроков." },
  "PM-EXP-06-B1-102": { textRu: "Нет. Заново оцени EV стола и места." },
  "PM-EXP-06-B1-103": { textRu: "Выбирай более прибыльный стол, держи сильных агрессивных игроков справа и обновляй оценку после наблюдений." },
  "PM-EXP-06-B1-104": { textRu: "Проверь соперников, позицию и фактическую динамику." },

  "PM-MW-05-B1-101": { textRu: "В мультивей-банке повышай пороги для вэлью и блефа: назови более слабые коллы и правдоподобные блефы." },
  "PM-MW-05-B1-102": { textRu: "Нет. Пересчитай диапазоны для мультивей-банка." },
  "PM-MW-05-B1-103": { textRu: "Играй вэлью и блеф избирательнее, чем один на один; цена и блокеры сами по себе не заменяют оценку диапазонов." },
  "PM-MW-05-B1-104": { textRu: "Проверь диапазоны, цену и контекст мультивей-банка." },
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
  const exact = practicalAssessmentExactReasonRepairs[decision.id];
  const repair = group ?? exact;
  if (!repair) return [...options];
  const correct = options.find((option) => option.id === decision.correctReasonId);
  if (!correct || correct.textRu !== repair.canonical.textRu || correct.textEn !== repair.canonical.textEn) return [...options];
  return options.map((option) => option.id === decision.correctReasonId ? { ...option, ...repair.presented } : option);
}
