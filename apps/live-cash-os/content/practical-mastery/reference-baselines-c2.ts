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
    titleRu: "Chart = baseline shape, не закон",
    titleEn: "Chart = baseline shape, not a law",
    triggerRu: "Нужно принять preflop решение, а exact live configuration отличается от reference setup.",
    triggerEn: "A preflop decision is needed but the exact live configuration differs from the reference setup.",
    baselineRu: "Начни со source-backed equilibrium shape: position, depth, ante/rake/straddle и prior action задают исходную структуру.",
    baselineEn: "Start from the source-backed equilibrium shape: position, depth, ante/rake/straddle and prior action define the starting structure.",
    deltaRu: "Сдвигай fringe осознанно по actual size, players behind и opponent tendencies.",
    deltaEn: "Move the fringe deliberately for actual sizing, players behind and opponent tendencies.",
    boundaryRu: "Не переносить exact mixed frequency или hand boundary без visual claim review.",
    boundaryEn: "Do not import an exact mixed frequency or hand boundary without visual claim review.",
    sourceRefs: ["SLC-M01-L01"],
    status: "SOURCE_SUPPORTED_SHAPE",
  },
  {
    id: "REF-PF-RAKE",
    titleRu: "Rake сжимает marginal participation",
    titleEn: "Rake compresses marginal participation",
    triggerRu: "Сравниваются rake и no-rake reference families.",
    triggerEn: "Rake and no-rake reference families are being compared.",
    baselineRu: "Rake добавляет cost входа в pot; marginal opens/flats/defends становятся менее привлекательными.",
    baselineEn: "Rake adds a cost to entering the pot; marginal opens/flats/defends become less attractive.",
    deltaRu: "В реально высоком rake baseline должен быть tighter; no-rake chart нельзя молча считать универсальным live default.",
    deltaEn: "In genuinely high rake, the baseline should be tighter; a no-rake chart cannot silently become a universal live default.",
    boundaryRu: "Exact combo removals и frequencies остаются visual-dependent.",
    boundaryEn: "Exact combo removals and frequencies remain visual-dependent.",
    sourceRefs: ["SLC-M01-L01", "SLC-PREFLOP-CHART-INDEX"],
    status: "EXACT_VISUAL_AUTHORITY_PENDING",
  },
  {
    id: "REF-PF-ANTE",
    titleRu: "Dead money меняет ширину участия",
    titleEn: "Dead money changes participation width",
    triggerRu: "Одинаковая позиционная структура сравнивается ante ↔ no-ante.",
    triggerEn: "The same positional structure is compared ante versus no-ante.",
    baselineRu: "No-ante даёт меньше dead money и обычно ведёт к более tight/aggressive participation structure.",
    baselineEn: "No-ante offers less dead money and generally leads to a tighter/more aggressive participation structure.",
    deltaRu: "Ante улучшает price и может расширять opens/flats/blind participation; BvB limp protection также меняется.",
    deltaEn: "An ante improves the price and can widen opens/flats/blind participation; BvB limp protection also changes.",
    boundaryRu: "Не копировать exact tournament/ante frequencies в cash без совпадения assumptions.",
    boundaryEn: "Do not copy exact tournament/ante frequencies into cash without matching assumptions.",
    sourceRefs: ["SLC-M01-L01"],
    status: "SOURCE_SUPPORTED_SHAPE",
  },
  {
    id: "REF-PF-DEPTH",
    titleRu: "Depth меняет sizing и stack-off geometry",
    titleEn: "Depth changes sizing and stack-off geometry",
    triggerRu: "Эффективный stack меняется 100bb → 200bb/400bb.",
    triggerEn: "Effective stack changes from 100bb to 200bb/400bb.",
    baselineRu: "Deeper structures используют более крупные 3-bet/squeeze sizes и требуют большей осторожности с marginal stack-offs.",
    baselineEn: "Deeper structures use larger 3-bet/squeeze sizes and require more caution with marginal stack-offs.",
    deltaRu: "Suited playability и future-street realization получают больше значения; shallow heuristics нельзя переносить механически.",
    deltaEn: "Suited playability and future-street realization matter more; shallow heuristics cannot be transferred mechanically.",
    boundaryRu: "Legend sizes — source examples, не универсальные live prescriptions.",
    boundaryEn: "Legend sizes are source examples, not universal live prescriptions.",
    sourceRefs: ["SLC-M01-L01", "SLC-PREFLOP-CHART-INDEX"],
    status: "EXACT_VISUAL_AUTHORITY_PENDING",
  },
  {
    id: "REF-PF-STRADDLE",
    titleRu: "Straddle сбрасывает рабочую единицу глубины",
    titleEn: "A straddle resets the working depth unit",
    triggerRu: "Появляется mandatory straddle при том же dollar stack.",
    triggerEn: "A mandatory straddle appears with the same dollar stack.",
    baselineRu: "Nominally 200bb stack может стать примерно 100 straddles deep; action order и preflop branches меняются вместе с единицей.",
    baselineEn: "A nominal 200bb stack can become roughly 100 straddles deep; action order and preflop branches change with the unit.",
    deltaRu: "Выбирай straddle-specific reference family, а не обычный BB chart с переименованным blind.",
    deltaEn: "Use the straddle-specific reference family rather than an ordinary-BB chart with a renamed blind.",
    boundaryRu: "Exact ranges/sizes зависят от конкретной straddle configuration.",
    boundaryEn: "Exact ranges/sizes depend on the specific straddle configuration.",
    sourceRefs: ["SLC-M01-L01", "SLC-PREFLOP-CHART-INDEX"],
    status: "EXACT_VISUAL_AUTHORITY_PENDING",
  },
  {
    id: "REF-PF-PLAYERS-BEHIND",
    titleRu: "Players behind входят в EV flat/open",
    titleEn: "Players behind are part of flat/open EV",
    triggerRu: "Hero рассматривает fringe open/cold-call, а позади остаются squeeze-capable players.",
    triggerEn: "Hero considers a fringe open/cold call with squeeze-capable players still behind.",
    baselineRu: "Reference flat/open shape предполагает определённое давление позади; squeeze exposure уменьшает realisation marginal hands.",
    baselineEn: "The reference flat/open shape assumes a level of pressure behind; squeeze exposure reduces realization for marginal hands.",
    deltaRu: "Если реальные игроки squeeze слишком мало, некоторые flats/fringe opens могут расширяться; если давление выше — сжиматься.",
    deltaEn: "If actual players squeeze too little, some flats/fringe opens can widen; if pressure is higher, they can contract.",
    boundaryRu: "Soft table сама по себе не лицензирует arbitrary widening.",
    boundaryEn: "A soft table alone does not license arbitrary widening.",
    sourceRefs: ["SLC-M01-L01"],
    status: "SOURCE_SUPPORTED_SHAPE",
  },
  {
    id: "REF-PF-REACH",
    titleRu: "Late-node frequency нужно читать через reach",
    titleEn: "Read late-node frequency through reach",
    triggerRu: "Hand выглядит частым bluff/action внутри 4-bet/5-bet node.",
    triggerEn: "A hand appears to be a frequent bluff/action inside a 4-bet/5-bet node.",
    baselineRu: "Сначала спроси, как часто hand вообще достигла этого node через предыдущую mixed action.",
    baselineEn: "First ask how often the hand actually reached the node through the previous mixed action.",
    deltaRu: "High conditional frequency при low reach может означать очень мало total combinations.",
    deltaEn: "A high conditional frequency at low reach can represent very few total combinations.",
    boundaryRu: "Нельзя читать цвет late-node cell как unconditional preflop frequency.",
    boundaryEn: "Do not read a late-node cell color as an unconditional preflop frequency.",
    sourceRefs: ["SLC-M01-L01"],
    status: "SOURCE_SUPPORTED_SHAPE",
  },
  {
    id: "REF-PF-SQUEEZE-PACK",
    titleRu: "Squeeze pack — отдельная family, не HU shortcut",
    titleEn: "The squeeze pack is its own family, not a HU shortcut",
    triggerRu: "Open + caller(s) создают squeeze/facing-squeeze decision.",
    triggerEn: "An open plus caller(s) creates a squeeze/facing-squeeze decision.",
    baselineRu: "Chart inventory разделяет facing squeeze и squeeze vs two callers по depth, ante, rake/no-rake, actor и prior positions.",
    baselineEn: "The chart inventory separates facing-squeeze and squeeze-vs-two-callers by depth, ante, rake/no-rake, actor and prior positions.",
    deltaRu: "Не сворачивать multi-caller branches в обычный heads-up versus-open chart.",
    deltaEn: "Do not collapse multi-caller branches into an ordinary heads-up versus-open chart.",
    boundaryRu: "980 indexed scenarios — routing inventory, не 980 memorization requirements; strategy images ещё требуют targeted visual extraction.",
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
