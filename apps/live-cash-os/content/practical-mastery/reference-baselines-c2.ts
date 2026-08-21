export type ReferenceBaselineStatus = "SOURCE_SUPPORTED_SHAPE" | "EXACT_VISUAL_AUTHORITY_PENDING";

export type PracticalReferenceBaseline = {
  id: string;
  titleRu: string;
  titleEn: string;
  triggerRu: string;
  triggerEn: string;
  baselineRu: string;
  baselineEn: string;
  deltaRu: string;
  deltaEn: string;
  boundaryRu: string;
  boundaryEn: string;
  sourceRefs: string[];
  status: ReferenceBaselineStatus;
};

export const practicalReferenceBaselines: PracticalReferenceBaseline[] = [
  {
    id: "REF-PF-BASELINE-SHAPE",
    titleRu: "Чарт — исходный ориентир, а не закон",
    titleEn: "Chart = baseline shape, not a law",
    triggerRu: "Нужно принять решение префлоп, но реальный стол отличается от условий чарта.",
    triggerEn: "A preflop decision is needed but the exact live configuration differs from the reference setup.",
    baselineRu: "Сначала возьми подтверждённую исходную форму диапазона: позицию, глубину, анте, рейк, страддл и предыдущее действие.",
    baselineEn: "Start from the source-backed equilibrium shape: position, depth, ante/rake/straddle and prior action define the starting structure.",
    deltaRu: "Пограничные руки сдвигай осознанно по реальному сайзингу, игрокам позади и тенденциям соперников.",
    deltaEn: "Move the fringe deliberately for actual sizing, players behind and opponent tendencies.",
    boundaryRu: "Не переносить точные смешанные частоты и границы рук, пока соответствующий чарт не проверен отдельно.",
    boundaryEn: "Do not import an exact mixed frequency or hand boundary without visual claim review.",
    sourceRefs: ["SLC-M01-L01"],
    status: "SOURCE_SUPPORTED_SHAPE",
  },
  {
    id: "REF-PF-RAKE",
    titleRu: "Рейк убирает часть пограничных продолжений",
    titleEn: "Rake compresses marginal participation",
    triggerRu: "Сравниваются одинаковые споты с рейком и без рейка.",
    triggerEn: "Rake and no-rake reference families are being compared.",
    baselineRu: "Рейк повышает стоимость входа в банк, поэтому пограничные open, call и defend становятся менее привлекательными.",
    baselineEn: "Rake adds a cost to entering the pot; marginal opens/flats/defends become less attractive.",
    deltaRu: "При реально высоком рейке исходный диапазон должен быть уже; чарт без рейка нельзя считать универсальным ориентиром для live cash.",
    deltaEn: "In genuinely high rake, the baseline should be tighter; a no-rake chart cannot silently become a universal live default.",
    boundaryRu: "Какие именно комбинации убрать и с какой частотой — вопрос конкретного проверенного чарта.",
    boundaryEn: "Exact combo removals and frequencies remain visual-dependent.",
    sourceRefs: ["SLC-M01-L01", "SLC-PREFLOP-CHART-INDEX"],
    status: "EXACT_VISUAL_AUTHORITY_PENDING",
  },
  {
    id: "REF-PF-ANTE",
    titleRu: "Dead money расширяет часть диапазонов",
    titleEn: "Dead money changes participation width",
    triggerRu: "Один и тот же позиционный спот сравнивается с анте и без анте.",
    triggerEn: "The same positional structure is compared ante versus no-ante.",
    baselineRu: "Без анте в банке меньше dead money, поэтому часть пограничных входов становится менее привлекательной.",
    baselineEn: "No-ante offers less dead money and generally leads to a tighter/more aggressive participation structure.",
    deltaRu: "Анте улучшает цену и может расширять open, call и защиту блайндов; меняется и защита лимпов BvB.",
    deltaEn: "An ante improves the price and can widen opens/flats/blind participation; BvB limp protection also changes.",
    boundaryRu: "Не переносить точные турнирные частоты в cash, если условия не совпадают.",
    boundaryEn: "Do not copy exact tournament/ante frequencies into cash without matching assumptions.",
    sourceRefs: ["SLC-M01-L01"],
    status: "SOURCE_SUPPORTED_SHAPE",
  },
  {
    id: "REF-PF-DEPTH",
    titleRu: "Глубина меняет сайзинги и готовность играть на стек",
    titleEn: "Depth changes sizing and stack-off geometry",
    triggerRu: "Эффективный стек меняется со 100bb до 200bb или 400bb.",
    triggerEn: "Effective stack changes from 100bb to 200bb/400bb.",
    baselineRu: "Глубже обычно нужны более крупные 3-bet и squeeze, а с пограничными руками нужно осторожнее разгонять банк до игры на стек.",
    baselineEn: "Deeper structures use larger 3-bet/squeeze sizes and require more caution with marginal stack-offs.",
    deltaRu: "Suited-руки и возможность хорошо реализовать equity на следующих улицах становятся важнее; правила для коротких стеков нельзя переносить механически.",
    deltaEn: "Suited playability and future-street realization matter more; shallow heuristics cannot be transferred mechanically.",
    boundaryRu: "Сайзинги из примеров курса — ориентиры для конкретных условий, а не универсальные live-правила.",
    boundaryEn: "Legend sizes are source examples, not universal live prescriptions.",
    sourceRefs: ["SLC-M01-L01", "SLC-PREFLOP-CHART-INDEX"],
    status: "EXACT_VISUAL_AUTHORITY_PENDING",
  },
  {
    id: "REF-PF-STRADDLE",
    titleRu: "Страддл меняет рабочую глубину",
    titleEn: "A straddle resets the working depth unit",
    triggerRu: "Появляется обязательный страддл при том же стеке в деньгах.",
    triggerEn: "A mandatory straddle appears with the same dollar stack.",
    baselineRu: "Стек 200 обычных bb может стать примерно 100 страддл-bb; вместе с этим меняются порядок действий и префлоп-ветки.",
    baselineEn: "A nominal 200bb stack can become roughly 100 straddles deep; action order and preflop branches change with the unit.",
    deltaRu: "Используй ориентиры именно для страддл-игры, а не обычный BB-чарт с переименованным блайндом.",
    deltaEn: "Use the straddle-specific reference family rather than an ordinary-BB chart with a renamed blind.",
    boundaryRu: "Точные диапазоны и сайзинги зависят от конкретной структуры страддла.",
    boundaryEn: "Exact ranges/sizes depend on the specific straddle configuration.",
    sourceRefs: ["SLC-M01-L01", "SLC-PREFLOP-CHART-INDEX"],
    status: "EXACT_VISUAL_AUTHORITY_PENDING",
  },
  {
    id: "REF-PF-PLAYERS-BEHIND",
    titleRu: "Игроки позади влияют на ценность open и call",
    titleEn: "Players behind are part of flat/open EV",
    triggerRu: "Hero рассматривает пограничный open или cold-call, а позади остаются игроки, способные часто squeeze.",
    triggerEn: "Hero considers a fringe open/cold call with squeeze-capable players still behind.",
    baselineRu: "Исходный диапазон open/call предполагает определённое давление позади; риск squeeze ухудшает реализацию equity у пограничных рук.",
    baselineEn: "The reference flat/open shape assumes a level of pressure behind; squeeze exposure reduces realization for marginal hands.",
    deltaRu: "Если реальные игроки squeeze слишком редко, часть call и пограничных open можно расширить; если давление выше — сузить.",
    deltaEn: "If actual players squeeze too little, some flats/fringe opens can widen; if pressure is higher, they can contract.",
    boundaryRu: "Слабый стол сам по себе не означает, что можно безгранично расширять диапазон.",
    boundaryEn: "A soft table alone does not license arbitrary widening.",
    sourceRefs: ["SLC-M01-L01"],
    status: "SOURCE_SUPPORTED_SHAPE",
  },
  {
    id: "REF-PF-REACH",
    titleRu: "Позднюю частоту нельзя читать без предыдущих веток",
    titleEn: "Read late-node frequency through reach",
    triggerRu: "Рука выглядит частым блефом внутри редкой ветки 4-bet или 5-bet.",
    triggerEn: "A hand appears to be a frequent bluff/action inside a 4-bet/5-bet node.",
    baselineRu: "Сначала спроси, как часто эта рука вообще доходит до рассматриваемой ветки через предыдущие смешанные действия.",
    baselineEn: "First ask how often the hand actually reached the node through the previous mixed action.",
    deltaRu: "Высокая условная частота в редкой ветке может означать очень мало комбинаций в общей стратегии.",
    deltaEn: "A high conditional frequency at low reach can represent very few total combinations.",
    boundaryRu: "Нельзя читать цвет одной поздней ячейки как безусловную префлоп-частоту руки.",
    boundaryEn: "Do not read a late-node cell color as an unconditional preflop frequency.",
    sourceRefs: ["SLC-M01-L01"],
    status: "SOURCE_SUPPORTED_SHAPE",
  },
  {
    id: "REF-PF-SQUEEZE-PACK",
    titleRu: "Squeeze после call — отдельный тип спота",
    titleEn: "The squeeze pack is its own family, not a HU shortcut",
    triggerRu: "Open и один или несколько call создают решение squeeze или ответ на squeeze.",
    triggerEn: "An open plus caller(s) creates a squeeze/facing-squeeze decision.",
    baselineRu: "В исходных чартах отдельно разобраны ответ на squeeze и squeeze против двух callers с разной глубиной, анте, рейком и позициями.",
    baselineEn: "The chart inventory separates facing-squeeze and squeeze-vs-two-callers by depth, ante, rake/no-rake, actor and prior positions.",
    deltaRu: "Не своди ветку с несколькими callers к обычному heads-up споту против одного open.",
    deltaEn: "Do not collapse multi-caller branches into an ordinary heads-up versus-open chart.",
    boundaryRu: "980 проиндексированных сценариев — это каталог для поиска нужного чарта, а не 980 вещей для запоминания. Точные изображения стратегии ещё требуют выборочной проверки.",
    boundaryEn: "The 980 indexed scenarios are a routing inventory, not 980 memorization requirements; strategy images still require targeted visual extraction.",
    sourceRefs: ["SLC-PREFLOP-CHART-INDEX", "SLC-M01-L01"],
    status: "EXACT_VISUAL_AUTHORITY_PENDING",
  },
];

export const referenceBaselineCounts = {
  total: practicalReferenceBaselines.length,
  sourceSupportedShape: practicalReferenceBaselines.filter((item) => item.status === "SOURCE_SUPPORTED_SHAPE").length,
  exactVisualPending: practicalReferenceBaselines.filter((item) => item.status === "EXACT_VISUAL_AUTHORITY_PENDING").length,
};
