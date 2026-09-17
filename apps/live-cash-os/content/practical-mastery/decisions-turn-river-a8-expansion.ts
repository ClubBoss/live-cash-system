import type { PracticalDecision } from "./types";

const o = (
  id: string,
  textRu: string,
  textEn: string,
  misconception?: string,
) => ({ id, textRu, textEn, misconception });

type F = {
  skillId: string;
  prefix: string;
  sourceRefs: string[];
  nodeRu: string;
  nodeEn: string;
  signalRu: string;
  signalEn: string;
  defaultRu: string;
  defaultEn: string;
  whyRu: string;
  whyEn: string;
  changeRu: string;
  changeEn: string;
  boundaryRu: string;
  boundaryEn: string;
  shortcutRu: string;
  shortcutEn: string;
};

type SpecificityRow = {
  cueRu: string;
  cueEn: string;
  qRu: string;
  qEn: string;
  goodRu: string;
  goodEn: string;
  whyRu: string;
  whyEn: string;
  bad1Ru: string;
  bad1En: string;
  bad2Ru: string;
  bad2En: string;
  changed?: string[];
};
type Specificity = {
  r102: SpecificityRow;
  r105: SpecificityRow;
  r107: SpecificityRow;
};

export const A8_BOUNDARY_DIRECTIONS: Record<
  string,
  { ru: string; en: string }
> = {
  "TURN-01": {
    ru: "Старшая карта сама по себе не даёт автоматический баррель: продолжай давление только если ран-аут меняет сохранившиеся диапазоны и владение сильной частью в пользу агрессора",
    en: "An overcard alone does not create an automatic barrel; keep applying pressure only when the runout shifts surviving ranges and ownership toward the aggressor",
  },
  "TURN-02": {
    ru: "Ставка на флопе не обязывает баррелить: продолжай только с подходящим классом руки, если тёрн усиливает давление против сохранившегося диапазона",
    en: "Betting the flop does not force a barrel; continue only with a suitable hand class when the turn improves leverage against the surviving range",
  },
  "TURN-03": {
    ru: "Проб-бет уместен, только если чек вдогонку действительно оставил диапазон IP ограниченным сверху или слишком широким и тёрн не вернул сильные регионы",
    en: "Probe only when the check-back genuinely left IP capped or overwide and the turn did not restore strong regions",
  },
  "TURN-04": {
    ru: "Улучшения конкретной руки недостаточно: лид нужен только когда тёрн сдвигает владение диапазоном или натсами в пользу сохранившегося диапазона коллера",
    en: "Improving Hero's exact hand is not enough; lead only when the turn shifts range or nut ownership toward the caller's retained range",
  },
  "TURN-05": {
    ru: "Быть впереди недостаточно: ставь только если худшие руки продолжают, защита имеет ценность и есть план против рейза и ривера",
    en: "Being ahead is not enough; bet only when worse hands continue, protection has value, and the raise and river branches are planned",
  },
  "RIV-01": {
    ru: "Того, что рука вероятно лучшая, недостаточно для вэлью-ставки: назови худшие руки, которые коллируют выбранный сайзинг; иначе уменьши размер или чек",
    en: "Being likely best is not enough for a value bet; name worse hands that call the chosen size, otherwise use a smaller size or check",
  },
  "RIV-02": {
    ru: "Промахнувшееся дро не становится блефом автоматически: выбирай руки с низкой шоудаун-ценностью и профилем блокеров и антиблокеров, который повышает EV фолда и сохраняет правдоподобность вэлью",
    en: "A missed draw is not an automatic bluff; choose low-showdown-value hands whose blocker and unblocker profile improves fold EV while preserving credible value",
  },
  "RIV-03": {
    ru: "Хорошая цена сама не заставляет коллировать: колл требует достаточного числа реальных блефов после всей линии и подходящего эффекта блокеров",
    en: "A good price alone does not force a call; calling requires enough credible bluffs after the full line and a favorable removal profile",
  },
  "RIV-04": {
    ru: "Рука средней силы не означает автоматический блок-бет: маленькая ставка нужна только если она лучше чека реализует вэлью и имеет план против рейза",
    en: "A medium-strength hand does not imply an automatic block bet; use the small bet only when it realizes value better than checking and has a plan versus a raise",
  },
  "RIV-05": {
    ru: "Один недоблефленный узел не означает фолд всех блеф-кетчеров: отклоняйся только в подтверждённой ветке и только при повторяющихся наблюдениях",
    en: "One underbluffed node does not mean folding every bluff-catcher; deviate only in the evidenced branch and only with repeated observations",
  },
};

const A8_EVIDENCE_SPECIFICITY: Record<string, Specificity> = {
  "TURN-01": {
    r102: {
      cueRu:
        "После той же линии флопа вместо бланка выходит карта, закрывающая дро и добавляющая сильные комбинации коллеру.",
      cueEn:
        "After the same flop line, a blank is replaced by a draw-completing card that adds strong combinations to the caller.",
      qRu: "Что нужно переклассифицировать на тёрне?",
      qEn: "What must be reclassified on the turn?",
      goodRu: "Сохранившиеся диапазоны и владение натсами после новой карты",
      goodEn: "The surviving ranges and nut ownership after the new card",
      whyRu:
        "Класс ран-аута определяется тем, какие сильные регионы реально появились после предыдущей линии.",
      whyEn:
        "Runout class depends on which strong regions actually appear after the prior line.",
      bad1Ru: "Только ранг новой карты относительно борда",
      bad1En: "Only the new card's rank relative to the board",
      bad2Ru: "Ничего: классификация флопа уже фиксирует тёрн",
      bad2En: "Nothing: the flop classification already fixes the turn",
    },
    r105: {
      cueRu:
        "Та же линия флопа, но тёрн меняется с бланка на карту, которая закрывает основной дро коллера.",
      cueEn:
        "Same flop line, but the turn changes from a blank to a card that completes the caller's main draw.",
      qRu: "Какой пересчёт определяет новый класс карты?",
      qEn: "Which recomputation determines the new card class?",
      goodRu: "Какие вэлью/nut регионы теперь выживают у обеих сторон",
      goodEn: "Which value and nut regions now survive for each side",
      whyRu:
        "TURN-01 проверяет range shift и cap/nut ownership, а не цену ставки или визуальную страшность карты.",
      whyEn:
        "TURN-01 tests range shift and cap/nut ownership, not bet price or how scary the card looks.",
      bad1Ru: "Насколько карта выглядит страшной для одной пары",
      bad1En: "How scary the card looks for one pair",
      bad2Ru: "Только размер банка перед тёрном",
      bad2En: "Only the pot size before the turn",
    },
    r107: {
      cueRu:
        "После flop bet-call тёрн закрывает дро, которое заметно чаще сохранялось у коллера, чем у агрессора.",
      cueEn:
        "After a flop bet-call, the turn completes a draw retained materially more often by the caller than the aggressor.",
      qRu: "Что меняется в классификации ран-аута?",
      qEn: "What changes in the runout classification?",
      goodRu:
        "Карта сдвигает nut ownership к коллеру и уже не является нейтральным бланком",
      goodEn:
        "The card shifts nut ownership toward the caller and is no longer a neutral blank",
      whyRu:
        "Изменившееся владение сильной частью диапазона — сама переменная TURN-01.",
      whyEn:
        "Changed ownership of the strong range is the variable TURN-01 is testing.",
      bad1Ru: "Она остаётся бланком, потому что preflop aggressor не изменился",
      bad1En: "It remains a blank because the preflop aggressor did not change",
      bad2Ru: "Она автоматически выгодна агрессору как любая динамичная карта",
      bad2En:
        "It automatically favors the aggressor because every dynamic card does",
      changed: ["runout_class", "nut_ownership"],
    },
  },
  "TURN-02": {
    r102: {
      cueRu:
        "Hero c-bet flop. На тёрне его bluff candidate сохраняет equity, но карта усиливает значимую часть continue range соперника.",
      cueEn:
        "Hero c-bet the flop. On the turn, the bluff candidate keeps equity, but the card strengthens a meaningful part of Villain's continuing range.",
      qRu: "Что определяет, остаётся ли рука баррелем?",
      qEn: "What determines whether the hand remains a barrel?",
      goodRu:
        "Hand class вместе с новым leverage против сохранившегося continue range",
      goodEn:
        "Hand class together with the new leverage against the surviving continue range",
      whyRu:
        "Баррель выбирается через candidate × runout × continues, а не через факт ставки на флопе.",
      whyEn:
        "A barrel is selected through candidate × runout × continues, not from the fact that Hero bet the flop.",
      bad1Ru: "Сам факт сохранённого equity",
      bad1En: "The fact that the hand retained equity",
      bad2Ru: "Инициатива после c-bet сама сохраняет баррель",
      bad2En: "Initiative after the c-bet preserves the barrel by itself",
    },
    r105: {
      cueRu:
        "Hero выбирает turn barrel; сайзинг меняется с малого на крупный, а hand class остаётся той же.",
      cueEn:
        "Hero is choosing a turn barrel; sizing changes from small to large while the hand class stays the same.",
      qRu: "Что нужно проверить заново перед крупным баррелем?",
      qEn: "What must be checked again before the larger barrel?",
      goodRu:
        "Какие худшие value hands и bluff candidates выдерживают новый continue threshold",
      goodEn:
        "Which worse value hands and bluff candidates survive the new continuing threshold",
      whyRu:
        "Новый размер меняет диапазон продолжения и поэтому состав value/bluff barrel candidates.",
      whyEn:
        "The new size changes the continuing range and therefore the composition of value and bluff barrel candidates.",
      bad1Ru: "Только pot odds Hero на случай рейза",
      bad1En: "Only Hero's pot odds if raised",
      bad2Ru: "Ничего: одна и та же рука class обязана ставить тем же темпом",
      bad2En:
        "Nothing: the same hand class must keep betting at the same frequency",
    },
    r107: {
      cueRu:
        "После flop c-bet-call тёрн усиливает continue range соперника и уменьшает fold equity bluff candidates Hero.",
      cueEn:
        "After a flop c-bet-call, the turn strengthens Villain's continuing range and reduces Hero's bluff candidates' fold equity.",
      qRu: "Какая часть barrel диапазон должна сократиться первой?",
      qEn: "Which part of the barrel range should contract first?",
      goodRu: "Маргинальные блефы без достаточного equity или блокер leverage",
      goodEn: "Marginal bluffs without enough equity or blocker leverage",
      whyRu:
        "TURN-02 требует выбирать конкретные hand classes; усиление continues не одинаково влияет на value и слабые bluffs.",
      whyEn:
        "TURN-02 selects specific hand classes; stronger continues do not affect value and weak bluffs equally.",
      bad1Ru: "Сильное вэлью, потому что соперник чаще продолжит",
      bad1En: "Strong value, because Villain will continue more often",
      bad2Ru: "Все баррели одинаково, сохраняя прежний состав",
      bad2En: "All barrels equally, preserving the previous composition",
      changed: ["continue_range", "bluff_candidate_quality"],
    },
  },
  "TURN-03": {
    r102: {
      cueRu:
        "IP чекнул флоп вдогонку. В другой линии он ставил бы большую часть сильных top-pair+ рук, но часть traps всё ещё возможна.",
      cueEn:
        "IP checked back the flop. In the betting branch most strong top-pair-plus hands would bet, though some traps can remain.",
      qRu: "Какой факт нужен до решения о проб-бет?",
      qEn: "Which fact is needed before deciding whether to probe?",
      goodRu:
        "Насколько check-back реально убрал strong region и оставил диапазон capped/overwide",
      goodEn:
        "How much the check-back actually removed the strong region and left the range capped or overwide",
      whyRu:
        "Probe появляется из состава checked-back range; missed c-bet сам по себе не доказывает cap.",
      whyEn:
        "A probe comes from the checked-back range composition; a missed c-bet alone does not prove a cap.",
      bad1Ru: "Только то, что IP отказался от ставки один раз",
      bad1En: "Only that IP declined to bet once",
      bad2Ru: "Размер банка независимо от того, что IP чекнул",
      bad2En: "The pot size regardless of what IP checked back",
    },
    r105: {
      cueRu:
        "После check-back флопа Hero рассматривает probe. Сайзинг probe меняется с малого на крупный.",
      cueEn:
        "After a flop check-back, Hero considers a probe. The probe size changes from small to large.",
      qRu: "Что нужно пересчитать для крупного проб-бет?",
      qEn: "What must be recomputed for the larger probe?",
      goodRu:
        "Какая часть capped/overwide range продолжит и какие probe bluffs сохраняют leverage",
      goodEn:
        "Which part of the capped or overwide range continues and which probe bluffs retain leverage",
      whyRu:
        "Размер probe меняет target continuing region; наличие cap не делает любой размер одинаково хорошим.",
      whyEn:
        "Probe size changes the target continuing region; a cap does not make every size equally good.",
      bad1Ru: "Только частоту предыдущего c-bet IP",
      bad1En: "Only IP's prior c-bet frequency",
      bad2Ru: "Ничего: если диапазон капнутый, любой проб-бет сайзинг эквивалентен",
      bad2En: "Nothing: if the range is capped, every probe size is equivalent",
    },
    r107: {
      cueRu:
        "IP чекнул флоп вдогонку, но тёрн возвращает ему несколько естественных сильных two-pair/straight regions.",
      cueEn:
        "IP checked back the flop, but the turn restores several natural strong two-pair or straight regions to IP.",
      qRu: "Что происходит с проб-бет opportunity?",
      qEn: "What happens to the probe opportunity?",
      goodRu: "Она сужается, потому что прежний cap частично снят новой картой",
      goodEn:
        "It narrows because the new card partially removes the previous cap",
      whyRu:
        "TURN-03 зависит от того, остался ли checked-back range capped после конкретного тёрна.",
      whyEn:
        "TURN-03 depends on whether the checked-back range remains capped after the specific turn.",
      bad1Ru: "Она расширяется: missed c-bet всегда разрешает больше проб-бет",
      bad1En: "It widens: a missed c-bet always licenses more probing",
      bad2Ru: "Она не меняется, потому что check-back уже зафиксировал диапазон",
      bad2En:
        "It does not change because the check-back already fixed the range",
      changed: ["checked_back_cap", "restored_strong_regions"],
    },
  },
  "TURN-04": {
    r102: {
      cueRu:
        "Hero коллировал ставку флопа OOP. Тёрн закрывает комбинации, которые естественно чаще сохранялись у flop caller.",
      cueEn:
        "Hero called the flop bet OOP. The turn completes combinations naturally retained more often by the flop caller.",
      qRu: "Что нужно установить до добавления turn лид?",
      qEn: "What must be established before adding a turn lead?",
      goodRu:
        "Сдвинулось ли range/nut ownership к retained range коллера достаточно для lead branch",
      goodEn:
        "Whether range or nut ownership shifted enough toward the caller's retained range to support a lead branch",
      whyRu:
        "Lead after flop call возникает из ownership shift на конкретных ран-аутах, а не из улучшения одной руки.",
      whyEn:
        "A lead after a flop call comes from an ownership shift on specific runouts, not from one hand improving.",
      bad1Ru: "Только улучшилась ли конкретная рука Hero",
      bad1En: "Only whether Hero's exact hand improved",
      bad2Ru: "Кто был preflop aggressor, без учёта flop call диапазон",
      bad2En: "Who was the preflop aggressor, ignoring the flop calling range",
    },
    r105: {
      cueRu:
        "На source-supported lead turn Hero выбирает между малым и крупным lead size.",
      cueEn:
        "On a source-supported lead turn, Hero chooses between a small and a large lead size.",
      qRu: "Что должно определять размер лид?",
      qEn: "What should determine the lead size?",
      goodRu:
        "Какие value/bluff regions caller now owns и против какой continue range строится lead",
      goodEn:
        "Which value and bluff regions the caller now owns and which continuing range the lead targets",
      whyRu:
        "Сайзинг lead должен следовать новой range interaction, а не существовать отдельно от причины самого lead.",
      whyEn:
        "Lead sizing should follow the new range interaction rather than being detached from the reason for leading.",
      bad1Ru: "Только сила конкретная рука Hero",
      bad1En: "Only the strength of Hero's exact hand",
      bad2Ru: "Любой размер одинаков, раз turn разрешил лид",
      bad2En: "Any size is equivalent once the turn permits a lead",
    },
    r107: {
      cueRu:
        "После flop call OOP тёрн вместо нейтральной карты сильно усиливает retained nut region коллера.",
      cueEn:
        "After an OOP flop call, the turn changes from neutral to one that strongly improves the caller's retained nut region.",
      qRu: "Как меняется лид branch?",
      qEn: "How does the lead branch change?",
      goodRu:
        "Lead становится более обоснованным именно у рук, поддержанных новым ownership shift",
      goodEn:
        "Leading becomes more justified specifically for hands supported by the new ownership shift",
      whyRu:
        "TURN-04 проверяет появление lead из caller-retained ownership, а не generic tightening против сильного range.",
      whyEn:
        "TURN-04 tests a lead emerging from caller-retained ownership, not generic tightening against a stronger range.",
      bad1Ru: "лид исчезает автоматически, потому что диапазоны стали сильнее",
      bad1En: "Leading disappears automatically because ranges became stronger",
      bad2Ru: "Все руки Hero начинают лидить, потому что turn хорош для caller",
      bad2En:
        "Every Hero hand starts leading because the turn favors the caller",
      changed: ["caller_retained_ownership", "lead_branch"],
    },
  },
  "TURN-05": {
    r102: {
      cueRu:
        "У Hero средняя showdown hand на тёрне; после предыдущей линии у соперника остаются и худшие calls, и raise region.",
      cueEn:
        "Hero has a medium-strength showdown hand on the turn; after the prior line Villain retains both worse calls and a raising region.",
      qRu: "Что нужно назвать до thin-вэлью bet?",
      qEn: "What must be named before a thin-value bet?",
      goodRu: "Худшие продолжения, protection gain и план против рейз/river",
      goodEn:
        "Worse continues, protection gain, and the plan versus a raise and the river",
      whyRu:
        "TURN-05 отделяет value/protection от сохранения showdown через реальные будущие ветки.",
      whyEn:
        "TURN-05 separates value and protection from showdown preservation through the actual future branches.",
      bad1Ru: "Только вероятность, что Hero сейчас впереди",
      bad1En: "Only the probability that Hero is ahead now",
      bad2Ru: "Только желание не дать бесплатную river card",
      bad2En: "Only the desire to deny a free river card",
    },
    r105: {
      cueRu:
        "Та же medium-strength hand: thin-value sizing увеличивается, а worse calling region сужается.",
      cueEn:
        "Same medium-strength hand: the thin-value size increases and the worse-calling region narrows.",
      qRu: "Что нужно пересчитать?",
      qEn: "What must be recomputed?",
      goodRu:
        "Осталось ли достаточно worse calls/protection EV, чтобы ставка была лучше showdown preservation",
      goodEn:
        "Whether enough worse calls and protection EV remain for betting to beat showdown preservation",
      whyRu:
        "Больший размер может выбить именно худшие руки, от которых thin value получает ценность.",
      whyEn:
        "A larger size can fold out the very worse hands that make thin value profitable.",
      bad1Ru: "Только абсолютную силу Hero рука",
      bad1En: "Only Hero's absolute hand strength",
      bad2Ru: "Ничего: если рука впереди, размер не влияет на вэлью",
      bad2En: "Nothing: if the hand is ahead, size does not affect value",
    },
    r107: {
      cueRu:
        "Та же hand на тёрне, но после линии соперника худшие calls почти исчезают, а raise region сохраняется.",
      cueEn:
        "Same turn hand, but after Villain's line most worse calls disappear while the raising region remains.",
      qRu: "Как меняется thin-вэлью branch?",
      qEn: "How does the thin-value branch change?",
      goodRu:
        "Чек/showdown preservation получает больше веса, потому что value targets исчезли",
      goodEn:
        "Checking and showdown preservation gain weight because the value targets disappeared",
      whyRu:
        "TURN-05 меняется через worse continues и future branches, не через generic 'stronger range'.",
      whyEn:
        "TURN-05 changes through worse continues and future branches, not a generic 'stronger range' rule.",
      bad1Ru: "Ставка становится лучше, потому что соперник выглядит сильнее",
      bad1En: "Betting becomes better because Villain looks stronger",
      bad2Ru: "Решение не меняется, пока конкретная рука Hero та же",
      bad2En:
        "The decision does not change while Hero's exact hand is unchanged",
      changed: ["worse_calling_targets", "showdown_preservation"],
    },
  },
  "RIV-01": {
    r102: {
      cueRu:
        "На ривере Hero считает себя часто впереди; у соперника после линии остаются несколько one-pair bluff-catchers и сильный value region.",
      cueEn:
        "On the river Hero expects to be ahead often; after the line Villain retains several one-pair bluff-catchers and a strong value region.",
      qRu: "Что нужно назвать до вэлью bet?",
      qEn: "What must be named before value betting?",
      goodRu: "Конкретные худшие руки, которые коллируют выбранный размер",
      goodEn: "Concrete worse hands that call the chosen size",
      whyRu:
        "RIV-01 определяет value через worse calling targets, а не через частоту победы при чеке.",
      whyEn:
        "RIV-01 defines value through worse calling targets, not through how often Hero wins after checking.",
      bad1Ru: "Только руки лучше Hero, которые могут рейзить",
      bad1En: "Only hands better than Hero that can raise",
      bad2Ru: "Только вероятность, что Hero лучшая рука",
      bad2En: "Only the probability that Hero has the best hand",
    },
    r105: {
      cueRu:
        "River value size увеличивается с малого до крупного; hand и board не меняются.",
      cueEn:
        "The river value size increases from small to large; the hand and board do not change.",
      qRu: "Что нужно пересчитать первым?",
      qEn: "What must be recomputed first?",
      goodRu: "Какие конкретные worse hands всё ещё коллируют новый размер",
      goodEn: "Which concrete worse hands still call the new size",
      whyRu:
        "Размер value bet меняет calling target; один и тот же top pair не имеет одинакового value против всех sizes.",
      whyEn:
        "Value-bet size changes the calling target; the same top pair does not have identical value at every size.",
      bad1Ru: "Только pot сайзинг после ставки",
      bad1En: "Only the pot size after betting",
      bad2Ru: "Ничего: если рука достаточно сильна для вэлью, размер не важен",
      bad2En:
        "Nothing: if the hand is strong enough for value, size does not matter",
    },
    r107: {
      cueRu:
        "Та же river hand и board, но соперник теперь продолжает крупный сайз почти только с руками лучше Hero.",
      cueEn:
        "Same river hand and board, but Villain now continues versus the large size almost only with hands better than Hero.",
      qRu: "Что происходит с крупным thin-вэлью bet?",
      qEn: "What happens to the large thin-value bet?",
      goodRu:
        "Он теряет value target; нужен меньший размер с worse calls или check",
      goodEn:
        "It loses its value target; use a smaller size that gets worse calls or check",
      whyRu:
        "RIV-01 меняется, когда исчезают конкретные worse calls для выбранного размера.",
      whyEn:
        "RIV-01 changes when the concrete worse calls for the chosen size disappear.",
      bad1Ru: "Он становится лучше, потому что сильный диапазон платит чаще",
      bad1En: "It becomes better because a stronger range pays more often",
      bad2Ru: "Он не меняется, пока Hero часто впереди",
      bad2En: "It does not change while Hero is often ahead",
      changed: ["worse_calling_targets", "river_sizing"],
    },
  },
  "RIV-02": {
    r102: {
      cueRu:
        "Hero дошёл до ривера с двумя промахнувшимися draws: один combo блокирует bluff-catchers, другой блокирует missed draws соперника.",
      cueEn:
        "Hero reaches the river with two missed draws: one combo blocks bluff-catchers, while the other blocks Villain's missed draws.",
      qRu: "Какую переменную сравнить при выборе блефы candidate?",
      qEn: "Which variable should be compared when choosing the bluff candidate?",
      goodRu:
        "Showdown value и blocker/unblocker effect относительно folds и credible value",
      goodEn:
        "Showdown value and blocker/unblocker effects relative to folds and credible value",
      whyRu:
        "RIV-02 выбирает блеф по card-removal и ancestry, а не по ярлыку missed draw.",
      whyEn:
        "RIV-02 selects bluffs by card removal and ancestry, not by the label 'missed draw'.",
      bad1Ru: "Какое draw было визуально сильнее на флопе",
      bad1En: "Which draw looked stronger on the flop",
      bad2Ru: "Любой missed draw одинаково подходит для блефа",
      bad2En: "Every missed draw is equally suitable for bluffing",
    },
    r105: {
      cueRu:
        "Hero рассматривает крупный river bluff вместо малого; value region этой линии остаётся тем же.",
      cueEn:
        "Hero considers a large river bluff instead of a small one; the line's value region stays the same.",
      qRu: "Что нужно пересчитать у блефы candidates?",
      qEn: "What must be recomputed for the bluff candidates?",
      goodRu:
        "Какие hands новый size пытается выбить и какие blockers/unblockers помогают против этого calling range",
      goodEn:
        "Which hands the new size tries to fold out and which blockers or unblockers help against that calling range",
      whyRu:
        "Сайзинг меняет fold target, поэтому качество blocker profile оценивается относительно нового target range.",
      whyEn:
        "Sizing changes the fold target, so blocker quality must be evaluated against the new target range.",
      bad1Ru: "Только сколько Hero уже вложил в банк",
      bad1En: "Only how much Hero has already invested",
      bad2Ru:
        "Ничего: missed draw остаётся тем же bluff candidate при любом size",
      bad2En:
        "Nothing: a missed draw remains the same bluff candidate at every size",
    },
    r107: {
      cueRu:
        "Из двух missed-draw combos один теперь блокирует значимую часть рук, которые должны фолдить, а второй их разблокирует.",
      cueEn:
        "Of two missed-draw combos, one now blocks a meaningful part of the hands that should fold while the other unblocks them.",
      qRu: "Как меняется приоритет блефы candidate?",
      qEn: "How does bluff-candidate priority change?",
      goodRu:
        "Предпочтение смещается к combo, который разблокирует folds и сохраняет credible value ancestry",
      goodEn:
        "Preference shifts toward the combo that unblocks folds while preserving credible value ancestry",
      whyRu: "RIV-02 меняется через removal profile конкретного комбинация.",
      whyEn: "RIV-02 changes through the specific combo's removal profile.",
      bad1Ru: "Предпочтение смещается к комбинация, который сильнее блокирует фолды",
      bad1En: "Preference shifts toward the combo that blocks more folds",
      bad2Ru: "Оба комбинация остаются равными, потому что оба missed draws",
      bad2En: "Both combos remain equal because both are missed draws",
      changed: ["blocker_unblocker_profile", "bluff_candidate"],
    },
  },
  "RIV-03": {
    r102: {
      cueRu:
        "Hero facing river bet с bluff-catcher. Цена выглядит привлекательной, но предыдущая линия могла удалить часть natural bluffs.",
      cueEn:
        "Hero faces a river bet with a bluff-catcher. The price looks attractive, but the prior line may have removed some natural bluffs.",
      qRu: "Что нужно восстановить до call?",
      qEn: "What must be reconstructed before calling?",
      goodRu:
        "Credible bluff supply после всей линии и removal Hero относительно нужной цены",
      goodEn:
        "Credible bluff supply after the full line and Hero's removal relative to the required price",
      whyRu:
        "RIV-03 связывает pot odds с реальными bluff combos; цена сама блефы не создаёт.",
      whyEn:
        "RIV-03 connects pot odds to real bluff combinations; price does not create bluffs.",
      bad1Ru: "Только pot odds из текущего bet сайзинг",
      bad1En: "Only the pot odds from the current bet size",
      bad2Ru: "Только абсолютную силу блефы-catcher",
      bad2En: "Only the absolute strength of the bluff-catcher",
    },
    r105: {
      cueRu:
        "Та же river line и bluff supply, но ставка соперника увеличивается с половины банка до pot-size.",
      cueEn:
        "Same river line and bluff supply, but Villain's bet increases from half pot to pot size.",
      qRu: "Что нужно пересчитать для блефы-catch?",
      qEn: "What must be recomputed for the bluff-catch?",
      goodRu:
        "Required bluff frequency для новой цены и достаточно ли credible bluffs её покрывают",
      goodEn:
        "The required bluff frequency for the new price and whether enough credible bluffs remain to meet it",
      whyRu:
        "Изменение цены меняет threshold call, но ответ всё равно зависит от surviving bluff supply.",
      whyEn:
        "Changing the price changes the call threshold, but the answer still depends on surviving bluff supply.",
      bad1Ru: "Только размер проигрыша при неверном call",
      bad1En: "Only the amount lost when the call is wrong",
      bad2Ru: "Ничего: одна и та же рука должна всегда call или всегда fold",
      bad2En: "Nothing: the same hand must always call or always fold",
    },
    r107: {
      cueRu:
        "Цена river call та же, но turn action удаляет большинство естественных missed-draw bluffs из линии соперника.",
      cueEn:
        "The river call price is unchanged, but the turn action removes most natural missed-draw bluffs from Villain's line.",
      qRu: "Как меняется блефы-catch порог?",
      qEn: "How does the bluff-catch decision change?",
      goodRu:
        "Call становится хуже, потому что credible bluff supply падает при той же цене",
      goodEn:
        "Calling becomes worse because credible bluff supply falls at the same price",
      whyRu:
        "RIV-03 меняется через bluff supply и ancestry при фиксированной цене.",
      whyEn:
        "RIV-03 changes through bluff supply and ancestry while price stays fixed.",
      bad1Ru: "Call становится лучше, потому что линия выглядит сильнее",
      bad1En: "Calling becomes better because the line looks stronger",
      bad2Ru: "Call не меняется, потому что pot odds те же",
      bad2En: "Calling does not change because the pot odds are the same",
      changed: ["credible_bluff_supply", "line_ancestry"],
    },
  },
  "RIV-04": {
    r102: {
      cueRu:
        "Hero рассматривает маленький river block bet с medium-strength hand вместо check.",
      cueEn:
        "Hero considers a small river block bet with a medium-strength hand instead of checking.",
      qRu: "Что нужно определить до block bet?",
      qEn: "What must be determined before block betting?",
      goodRu:
        "Какие worse hands платят по заданной цене и какой план Hero против raise",
      goodEn:
        "Which worse hands pay the set price and Hero's plan versus a raise",
      whyRu:
        "RIV-04 использует small bet как price-setting value tool с заранее понятной raise response.",
      whyEn:
        "RIV-04 uses the small bet as a price-setting value tool with a defined response to a raise.",
      bad1Ru: "Только желание дешево дойти до шоудаун",
      bad1En: "Only the desire to reach showdown cheaply",
      bad2Ru: "Только то, что рука недостаточно сильна для крупной ставки",
      bad2En: "Only that the hand is not strong enough for a large bet",
    },
    r105: {
      cueRu:
        "Размер river block bet увеличивается, и соперник получает менее выгодную цену на call, но его raise range не исчезает.",
      cueEn:
        "The river block-bet size increases, giving Villain a worse calling price while the raising range remains.",
      qRu: "Что нужно пересчитать?",
      qEn: "What must be recomputed?",
      goodRu:
        "Worse calling targets при новой цене и EV плана bet/fold или bet/call против raise",
      goodEn:
        "Worse calling targets at the new price and the EV of the bet-fold or bet-call plan versus a raise",
      whyRu:
        "RIV-04 оценивает одновременно price-setting value и последствия raise response.",
      whyEn:
        "RIV-04 evaluates both price-setting value and the consequences of the raise response.",
      bad1Ru: "Только насколько дешевле ставка полного pot",
      bad1En: "Only how much cheaper the bet is than pot size",
      bad2Ru: "Ничего: любой small сайзинг выполняет одну и ту же функцию",
      bad2En: "Nothing: every small size serves the same function",
    },
    r107: {
      cueRu:
        "Соперник начинает заметно чаще рейзить маленькие river bets, сохраняя те же calling tendencies.",
      cueEn:
        "Villain starts raising small river bets materially more often while keeping the same calling tendencies.",
      qRu: "Что меняется в block-bet plan?",
      qEn: "What changes in the block-bet plan?",
      goodRu:
        "Нужно заново оценить bet/fold или bet/call response; часть marginal blocks может перейти в check",
      goodEn:
        "Re-evaluate the bet-fold or bet-call response; some marginal blocks may move to checking",
      whyRu:
        "RIV-04 меняется через raise response на price-setting line, а не через generic stronger range.",
      whyEn:
        "RIV-04 changes through the raise response to the price-setting line, not through a generic stronger range.",
      bad1Ru: "Все block bets автоматически становятся крупнее",
      bad1En: "All block bets automatically become larger",
      bad2Ru: "Ничего не меняется, потому что calling диапазон тот же",
      bad2En: "Nothing changes because the calling range is the same",
      changed: ["raise_response", "block_bet_plan"],
    },
  },
  "RIV-05": {
    r102: {
      cueRu:
        "Hero видел один underbluffed river node, но в соседних ветках выборки почти нет.",
      cueEn:
        "Hero observed one underbluffed river node, but has almost no sample in neighboring branches.",
      qRu: "Какой данные можно переносить в эксплойт?",
      qEn: "Which evidence can be carried into an exploit?",
      goodRu:
        "Только evidence из сопоставимой ветки с достаточной повторяемостью; соседние nodes остаются baseline",
      goodEn:
        "Only evidence from a comparable branch with enough repetition; neighboring nodes stay at baseline",
      whyRu:
        "RIV-05 требует branch-specific evidence и не превращает локальное наблюдение в global player label.",
      whyEn:
        "RIV-05 requires branch-specific evidence and does not turn a local observation into a global player label.",
      bad1Ru: "Любой river шоудаун этого игрока подтверждает общий underbluff",
      bad1En:
        "Any river showdown from this player confirms global underbluffing",
      bad2Ru: "Одного яркого примера достаточно для всех river ветки",
      bad2En: "One vivid example is enough for every river branch",
    },
    r105: {
      cueRu:
        "В том же river node bet size меняется, а подтверждённая выборка относится только к прежнему размеру.",
      cueEn:
        "In the same river node the bet size changes, while the confirmed sample applies only to the previous size.",
      qRu: "Как использовать старый эксплойт read?",
      qEn: "How should the old exploit read be used?",
      goodRu:
        "Не переносить его автоматически: новый sizing — другая ветка, пока evidence не подтверждено",
      goodEn:
        "Do not transfer it automatically: the new sizing is a different branch until evidence supports it",
      whyRu:
        "Для RIV-05 sizing является частью branch identity; exploit не должен расширяться за пределы наблюдений.",
      whyEn:
        "For RIV-05 sizing is part of branch identity; the exploit should not expand beyond the observed evidence.",
      bad1Ru: "Перенести полностью, потому что соперник тот же",
      bad1En: "Transfer it fully because the opponent is the same",
      bad2Ru: "Усилить эксплойт, потому что новый bet сайзинг крупнее",
      bad2En: "Strengthen the exploit because the new bet size is larger",
    },
    r107: {
      cueRu:
        "В конкретной river branch вместо одного anecdote накопилось несколько повторяющихся underbluff observations; соседние branches не изучены.",
      cueEn:
        "In one specific river branch, one anecdote becomes several repeated underbluff observations; neighboring branches remain unobserved.",
      qRu: "Как меняется эксплойт?",
      qEn: "How does the exploit change?",
      goodRu:
        "Fold deviation можно усилить только в подтверждённой branch, сохранив baseline в остальных",
      goodEn:
        "The folding deviation can strengthen only in the evidenced branch while other branches stay at baseline",
      whyRu: "RIV-05 меняется через strength и scope branch-specific данные.",
      whyEn:
        "RIV-05 changes through the strength and scope of branch-specific evidence.",
      bad1Ru: "Теперь нужно фолдить больше во всех river узлы этого игрока",
      bad1En: "Now fold more in every river node against this player",
      bad2Ru:
        "Ничего не меняется: population baseline всегда важнее repeated evidence",
      bad2En:
        "Nothing changes: the population baseline always overrides repeated evidence",
      changed: ["branch_evidence_strength", "exploit_scope"],
    },
  },
};

function legacySpecificityRows(f: F): SpecificityRow[] {
  return [
    {cueRu:`${f.nodeRu} Один upstream action меняет сохранившийся диапазон.`,cueEn:`${f.nodeEn} One upstream action changes the сохранившийся диапазон.`,qRu:"Можно ли сохранить прежний метка без пересчёта?",qEn:"Can the old метка be kept without recomputing?",goodRu:"Нет — ancestry меняет смысл узлы",goodEn:"No — ancestry changes the узлы's смысл",whyRu:"Later-улица classes are contextual: prior actions determine which strong/блефы области still exist.",whyEn:"Later-улица classes are contextual: prior actions determine which strong/блефы области still exist.",bad1Ru:"Да — улица метка достаточно",bad1En:"Yes — the улица метка is sufficient",bad2Ru:"Да — инициатива всё определяет",bad2En:"Yes — инициатива determines everything"},
    {cueRu:`${f.nodeRu} Current цена/сайзинг materially changes.`,cueEn:`${f.nodeEn} The current цена/сайзинг changes materially.`,qRu:"Что пересчитать?",qEn:"What should be recomputed?",goodRu:"порог + continuing диапазон + будущий/terminal EV",goodEn:"порог + continuing диапазон + будущий/terminal EV",whyRu:"сайзинг is part of the branch and changes both цена and диапазон selection.",whyEn:"сайзинг is part of the branch and changes both цена and диапазон selection.",bad1Ru:"Ничего — рука та же",bad1En:"Nothing — the рука is unchanged",bad2Ru:"Только pot сайзинг display",bad2En:"Only the pot-сайзинг display"},
    {cueRu:`${f.nodeRu} соперник диапазон/action history становится заметно сильнее или более защищённой.`,cueEn:`${f.nodeEn} The соперник диапазон/action history becomes materially stronger or better protected.`,qRu:"Что происходит с aggressive/marginal branch?",qEn:"What happens to the aggressive/marginal branch?",goodRu:"Становится более избирательной",goodEn:"It becomes more избирательной",whyRu:"Stronger сохранившийся диапазоны reduce the EV of thin вэлью, weak блефы and marginal блефы-catches.",whyEn:"Stronger сохранившийся диапазоны reduce the EV of thin вэлью, weak блефы and marginal блефы-catches.",bad1Ru:"Становится шире автоматически",bad1En:"It automatically becomes wider",bad2Ru:"Не меняется",bad2En:"It does not change",changed:["opponent_range_strength"]},
  ];
}

function family(f: F): PracticalDecision[] {
  const rows: Array<{
    kind: PracticalDecision["kind"];
    cueRu: string;
    cueEn: string;
    qRu: string;
    qEn: string;
    goodRu: string;
    goodEn: string;
    whyRu: string;
    whyEn: string;
    bad1Ru: string;
    bad1En: string;
    bad2Ru: string;
    bad2En: string;
    changed?: string[];
  }> = [
    {
      kind: "recognition",
      cueRu: f.nodeRu,
      cueEn: f.nodeEn,
      qRu: "Какой signal нужно назвать до action?",
      qEn: "Which signal should be named before choosing an action?",
      goodRu: f.signalRu,
      goodEn: f.signalEn,
      whyRu: f.whyRu,
      whyEn: f.whyEn,
      bad1Ru: f.shortcutRu,
      bad1En: f.shortcutEn,
      bad2Ru: "Только absolute рука rank",
      bad2En: "Only absolute hand rank",
    },
    { kind: "recognition", ...A8_EVIDENCE_SPECIFICITY[f.skillId].r102 },
    {
      kind: "decision",
      cueRu: f.nodeRu,
      cueEn: f.nodeEn,
      qRu: "Какой practical default лучше?",
      qEn: "Which practical default is better?",
      goodRu: f.defaultRu,
      goodEn: f.defaultEn,
      whyRu: f.whyRu,
      whyEn: f.whyEn,
      bad1Ru: f.shortcutRu,
      bad1En: f.shortcutEn,
      bad2Ru: "Выбирать action по размеру pot без диапазоны",
      bad2En: "Choose the action from pot size without ranges",
    },
    {
      kind: "decision",
      cueRu: `${f.nodeRu} У Hero есть один очевидный slogan, но branch composition не проверена.`,
      cueEn: `${f.nodeEn} Hero has an obvious slogan, but the branch composition has not been checked.`,
      qRu: "Что делать?",
      qEn: "What should Hero do?",
      goodRu: "Сначала проверить сохранившийся вэлью/блефы/продолжения области",
      goodEn: "First inspect surviving value/bluff/continue regions",
      whyRu:
        "Ancestry is the causal bridge from the previous street to the current action.",
      whyEn:
        "Ancestry is the causal bridge from the previous street to the current action.",
      bad1Ru: f.shortcutRu,
      bad1En: f.shortcutEn,
      bad2Ru: "Игнорировать previous улица",
      bad2En: "Ignore the previous street",
    },
    { kind: "decision", ...A8_EVIDENCE_SPECIFICITY[f.skillId].r105 },
    {
      kind: "changed",
      cueRu: f.changeRu,
      cueEn: f.changeEn,
      qRu: "Как должен измениться вывод?",
      qEn: "How should the conclusion change?",
      goodRu: "Пересобрать branch, а не переносить старый action",
      goodEn: "Rebuild the branch rather than copying the old action",
      whyRu:
        "The changed variable alters range ownership, price, bluff supply or value targets.",
      whyEn:
        "The changed variable alters range ownership, price, bluff supply or value targets.",
      bad1Ru: "Action не меняется",
      bad1En: "The action does not change",
      bad2Ru: f.shortcutRu,
      bad2En: f.shortcutEn,
      changed: ["material_node_variable"],
    },
    { kind: "changed", ...A8_EVIDENCE_SPECIFICITY[f.skillId].r107 },
    {
      kind: "boundary",
      cueRu: f.boundaryRu,
      cueEn: f.boundaryEn,
      qRu: "Где boundary?",
      qEn: "Where is the boundary?",
      goodRu: A8_BOUNDARY_DIRECTIONS[f.skillId].ru,
      goodEn: A8_BOUNDARY_DIRECTIONS[f.skillId].en,
      whyRu: f.whyRu,
      whyEn: f.whyEn,
      bad1Ru: f.shortcutRu,
      bad1En: f.shortcutEn,
      bad2Ru: "Invent конкретная frequency",
      bad2En: "Invent an exact frequency",
    },
  ];
  const build = (r: SpecificityRow & { kind: PracticalDecision["kind"] }, id: string, learnerEligibility?: "INTERNAL_ONLY"): PracticalDecision => {
    const slot = Number(id.slice(-1)) % 3;
    const specificitySlot = /-(202|205)$/.test(id);
    const good = o("good", specificitySlot ? `${r.goodRu} в этой ветке` : r.goodRu, specificitySlot ? `${r.goodEn} in this branch` : r.goodEn);
    const b1 = o("b1", `${r.bad1Ru}. Этого достаточно для выбора действия в этой ветке`, `${r.bad1En}. That alone determines the action in this branch`, "LATER_STREET_SHORTCUT");
    const b2 = o("b2", r.bad2Ru, r.bad2En, "ANCESTRY_IGNORED");
    const gr = o("goodR", r.whyRu, r.whyEn);
    const br1 = o("br1", "Название улицы или узла само по себе объясняет действие; сохранившиеся области вэлью и блефов не меняют вывод", "The street/node label alone explains the action; surviving value/bluff regions do not change the conclusion", "LABEL_AS_ACTION");
    const br2 = o("br2", "Предыдущая линия не меняет текущий диапазон", "The previous line does not change the current range", "HISTORY_IGNORED");
    const actionOptions = slot === 1 ? [good,b1,b2] : slot === 2 ? [b1,good,b2] : [b1,b2,good];
    const reasonOptions = slot === 1 ? [br1,gr,br2] : slot === 2 ? [gr,br1,br2] : [br1,br2,gr];
    return {id,skillId:f.skillId,...(learnerEligibility?{learnerEligibility}:{}),kind:r.kind,sourceRefs:f.sourceRefs,assumptions:["source-scoped later-улица mechanism; no unreviewed конкретная frequency"],cueRu:r.cueRu,cueEn:r.cueEn,questionRu:r.qRu,questionEn:r.qEn,actionOptions,reasonOptions,correctActionId:"good",correctReasonId:"goodR",targetSeconds:27,explanationRu:r.whyRu,explanationEn:r.whyEn,changedVariables:r.changed};
  };
  const revisedIds = [101,202,103,104,205,106,207,108];
  const current = rows.map((r,i)=>build(r,`${f.prefix}-${revisedIds[i]}`));
  const legacyRows = legacySpecificityRows(f);
  const legacy = [102,105,107].map((suffix,i)=>build({...legacyRows[i],kind:suffix===107?"changed":suffix===102?"recognition":"decision"},`${f.prefix}-${suffix}`,"INTERNAL_ONLY"));
  return [...current,...legacy];
}

const families: F[] = [
  {
    skillId: "TURN-01",
    prefix: "PM-TURN-01-A8",
    sourceRefs: ["FTGU-E21"],
    nodeRu:
      "Turn после flop action: нужно отличить blank от карты, которая меняет cap/nut ownership.",
    nodeEn:
      "Turn after flop action: distinguish a blank from a card that changes cap/nut ownership.",
    signalRu: "Runout class × surviving ranges",
    signalEn: "Runout class × surviving ranges",
    defaultRu:
      "Классифицировать карту через range shift, а не scary/not-scary label",
    defaultEn:
      "Classify the card through the range shift, not a scary/not-scary label",
    whyRu:
      "FTGU-E21 требует сначала понять, сохранился ли cap после конкретного flop branch.",
    whyEn:
      "Whether the cap survived the specific flop branch must be checked before classifying the turn.",
    changeRu:
      "Тот же flop branch: turn меняется blank → draw-completing/range-uncapping.",
    changeEn:
      "Same flop branch: turn changes blank → draw-completing/range-uncapping.",
    boundaryRu: "Learner считает любую overcard scare card automatic barrel.",
    boundaryEn:
      "The learner treats every overcard scare card as an automatic barrel.",
    shortcutRu: "Scare card = bet",
    shortcutEn: "Scare card = bet",
  },
  {
    skillId: "TURN-02",
    prefix: "PM-TURN-02-A8",
    sourceRefs: ["FTGU-E21", "SLC-TURN-BARREL", "CP-G3-L07"],
    nodeRu: "Hero c-bet flop и выбирает turn barrel.",
    nodeEn: "Hero c-bet the flop and is choosing a turn barrel.",
    signalRu: "Value/bluff candidate × runout × surviving continue range",
    signalEn: "Value/bluff candidate × runout × surviving continue range",
    defaultRu:
      "Баррелить selected value/bluffs, если card/range shift поддерживает pressure",
    defaultEn:
      "Barrel selected value/bluffs when the card/range shift supports pressure",
    whyRu:
      "Turn aggression требует подходящей hand class и изменившейся range interaction, не просто momentum.",
    whyEn:
      "Turn aggression requires a suitable hand class and changed range interaction, not just momentum.",
    changeRu:
      "Same hand/line; turn from blank favourable to caller → card that improves aggressor leverage.",
    changeEn:
      "Same hand/line; turn changes from a blank favorable to the caller → a card that improves aggressor leverage.",
    boundaryRu: "Learner triple-barrels because 'started betting'.",
    boundaryEn: "The learner keeps barreling because 'we started betting'.",
    shortcutRu: "Bet flop = bet turn",
    shortcutEn: "Bet flop = bet turn",
  },
  {
    skillId: "TURN-03",
    prefix: "PM-TURN-03-A8",
    sourceRefs: ["FTGU-E20", "CINJ-E06"],
    nodeRu: "Flop checked back; OOP рассматривает turn probe.",
    nodeEn: "Flop checked back; OOP considers a turn probe.",
    signalRu:
      "Какие strong hands check-back удалил и вернула ли turn card strength",
    signalEn:
      "Which strong hands the check-back removed and whether the turn restored strength",
    defaultRu: "Probe more when checked-back range genuinely capped/overwide",
    defaultEn:
      "Probe more when the checked-back range is genuinely capped/overwide",
    whyRu:
      "FTGU-E20 запрещает mechanical probe: exact checked range и turn card определяют leverage.",
    whyEn:
      "A probe is conditional on the exact checked-back range and on whether the turn restores strength.",
    changeRu: "Same check-back; turn now restores nutted/strong region to IP.",
    changeEn:
      "Same check-back; the turn now restores a nutted/strong region to IP.",
    boundaryRu: "Learner probes every missed c-bet turn.",
    boundaryEn: "The learner probes every turn after a missed c-bet.",
    shortcutRu: "Missed c-bet = probe",
    shortcutEn: "Missed c-bet = probe",
  },
  {
    skillId: "TURN-04",
    prefix: "PM-TURN-04-A8",
    sourceRefs: ["SLC-TURN-LEADS"],
    nodeRu: "Hero called flop OOP and considers leading turn.",
    nodeEn: "Hero called flop OOP and considers leading the turn.",
    signalRu:
      "Turn changes nut/coverage ownership enough to justify a lead branch",
    signalEn:
      "The turn changes nut/coverage ownership enough to justify a leading branch",
    defaultRu: "Lead only on source-supported range-shifting runouts",
    defaultEn: "Lead only on source-supported range-shifting runouts",
    whyRu:
      "Turn lead is a conditional branch created by specific runouts, not a generic donk strategy.",
    whyEn:
      "A turn lead is a conditional branch created by specific runouts, not a generic donk strategy.",
    changeRu:
      "Same flop call; turn moves neutral → card that strongly favours caller's retained region.",
    changeEn:
      "Same flop call; turn moves neutral → a card that strongly favors the caller's retained region.",
    boundaryRu: "Learner leads any card that improved Hero's exact hand.",
    boundaryEn: "The learner leads any card that improved Hero's exact hand.",
    shortcutRu: "Hero improved = lead",
    shortcutEn: "Hero improved = lead",
  },
  {
    skillId: "TURN-05",
    prefix: "PM-TURN-05-A8",
    sourceRefs: ["CP-G3-L02", "FTGU-E21"],
    nodeRu:
      "Turn medium-strength showdown hand: bet thin/value/protection или check-back/pot-control.",
    nodeEn:
      "Turn medium-strength showdown hand: thin/value/protection bet or check-back/pot-control.",
    signalRu: "Worse continues + vulnerability + future river plan",
    signalEn: "Worse continues + vulnerability + future river plan",
    defaultRu:
      "Bet only if worse continues/value-protection justify it; otherwise preserve showdown",
    defaultEn:
      "Bet only if worse continues/value-protection justify it; otherwise preserve showdown",
    whyRu:
      "Thin betting must name a worse continuing region and account for what raising/river branches do.",
    whyEn:
      "Thin betting must name a worse continuing region and account for raising/river branches.",
    changeRu: "Same hand; opponent continue range becomes tighter/stronger.",
    changeEn:
      "Same hand; the opponent continuing range becomes tighter/stronger.",
    boundaryRu: "Learner bets because hand is probably ahead.",
    boundaryEn: "The learner bets because the hand is probably ahead.",
    shortcutRu: "Likely ahead = value bet",
    shortcutEn: "Likely ahead = value bet",
  },
  {
    skillId: "RIV-01",
    prefix: "PM-RIV-01-A8",
    sourceRefs: ["LCM-09", "CP-G3-L02"],
    nodeRu: "River value decision with no future street.",
    nodeEn: "River value decision with no future street.",
    signalRu: "Конкретные worse hands that call × chosen sizing",
    signalEn: "Concrete worse hands that call × chosen sizing",
    defaultRu: "Value bet only when plausible worse calls exist for this size",
    defaultEn: "Value bet only when plausible worse calls exist for this size",
    whyRu:
      "River value is defined against the calling range, not by whether Hero is often best at showdown.",
    whyEn:
      "River value is defined against the calling range, not by whether Hero is often best at showdown.",
    changeRu:
      "Same hand/board; villain calling range becomes materially tighter.",
    changeEn:
      "Same hand/board; villain calling range becomes materially tighter.",
    boundaryRu: "Learner bets every likely-best river hand.",
    boundaryEn: "The learner bets every river hand that is likely best.",
    shortcutRu: "Best often = value bet",
    shortcutEn: "Often best = value bet",
  },
  {
    skillId: "RIV-02",
    prefix: "PM-RIV-02-A8",
    sourceRefs: ["FTGU-E23", "CP-G3-L03"],
    nodeRu: "River bluff selection after a completed line.",
    nodeEn: "River bluff selection after a completed line.",
    signalRu:
      "Low showdown value + blockers/unblockers + credible value ancestry",
    signalEn:
      "Low showdown value + blockers/unblockers + credible value ancestry",
    defaultRu:
      "Choose bluffs that improve fold EV without blocking folds or destroying value credibility",
    defaultEn:
      "Choose bluffs that improve fold EV without blocking folds or destroying value credibility",
    whyRu:
      "River bluffs should have low showdown value and useful card-removal effects relative to the line's value region.",
    whyEn:
      "River bluffs should have low showdown value and useful card-removal effects relative to the line's value region.",
    changeRu:
      "Same missed draw family; one combo blocks folds while another unblocks them.",
    changeEn:
      "Same missed-draw family; one combo blocks folds while another unblocks them.",
    boundaryRu: "Learner bluffs every missed draw.",
    boundaryEn: "The learner bluffs every missed draw.",
    shortcutRu: "Missed draw = bluff",
    shortcutEn: "Missed draw = bluff",
  },
  {
    skillId: "RIV-03",
    prefix: "PM-RIV-03-A8",
    sourceRefs: ["FTGU-E22", "CINJ-E02", "CINJ-E04"],
    nodeRu: "River bluff-catch: Hero beats bluffs but loses to value.",
    nodeEn: "River bluff-catch: Hero beats bluffs but loses to value.",
    signalRu: "Price × credible bluff supply × removal × line ancestry",
    signalEn: "Price × credible bluff supply × removal × line ancestry",
    defaultRu: "Call only when enough plausible bluffs survive for the price",
    defaultEn: "Call only when enough plausible bluffs survive for the price",
    whyRu:
      "Pot odds matter only together with the opponent's actual bluff candidates and blocker effects.",
    whyEn:
      "Pot odds matter only together with the opponent's actual bluff candidates and blocker effects.",
    changeRu:
      "Same price/hand; previous line removes most natural missed bluffs.",
    changeEn:
      "Same price/hand; the previous line removes most natural missed bluffs.",
    boundaryRu: "Learner says pot odds alone force the call.",
    boundaryEn: "The learner says pot odds alone force the call.",
    shortcutRu: "Good price = call",
    shortcutEn: "Good price = call",
  },
  {
    skillId: "RIV-04",
    prefix: "PM-RIV-04-A8",
    sourceRefs: ["CINJ-E08"],
    nodeRu: "Small river block/probe line.",
    nodeEn: "Small river block/probe line.",
    signalRu:
      "Price-setting purpose + opponent response + hand's showdown/value class",
    signalEn:
      "Price-setting purpose + opponent response + the hand's showdown/value class",
    defaultRu:
      "Use small river line only when it improves value/realisation versus checking and has a plan vs raise",
    defaultEn:
      "Use a small river line only when it improves value/realization versus checking and has a plan versus a raise",
    whyRu:
      "CINJ-E08 treats small river bets as a specific range/price tool, not a universal cheap showdown button.",
    whyEn:
      "A small river bet is a specific range-and-price tool, not a universal cheap-showdown button.",
    changeRu:
      "Same hand; opponent starts raising small river bets much more aggressively.",
    changeEn:
      "Same hand; the opponent starts raising small river bets much more aggressively.",
    boundaryRu: "Learner block-bets every medium-strength river hand.",
    boundaryEn: "The learner block-bets every medium-strength river hand.",
    shortcutRu: "Medium hand = block bet",
    shortcutEn: "Medium hand = block bet",
  },
  {
    skillId: "RIV-05",
    prefix: "PM-RIV-05-A8",
    sourceRefs: ["FTGU-E24", "FTGU-E25", "CINJ-E10"],
    nodeRu:
      "River population exploit candidate: underbluff/overbluff evidence in one branch.",
    nodeEn:
      "River population exploit candidate: underbluff/overbluff evidence in one branch.",
    signalRu:
      "Branch-specific evidence strength + sample/observation confidence",
    signalEn:
      "Branch-specific evidence strength + sample/observation confidence",
    defaultRu:
      "Deviate only in the evidenced branch; otherwise retain baseline",
    defaultEn:
      "Deviate only in the evidenced branch; otherwise retain baseline",
    whyRu:
      "Exploitative folds/calls require actual branch evidence and must not become global player labels.",
    whyEn:
      "Exploitative folds/calls require actual branch evidence and must not become global player labels.",
    changeRu:
      "Same river spot; evidence changes from one anecdote → repeated branch-specific observation.",
    changeEn:
      "Same river spot; evidence changes from one anecdote → repeated branch-specific observation.",
    boundaryRu:
      "Learner generalises one underbluffed node to every river line.",
    boundaryEn:
      "The learner generalizes one underbluffed node to every river line.",
    shortcutRu: "Pool underbluffs = fold all bluff-catchers",
    shortcutEn: "Pool underbluffs = fold all bluff-catchers",
  },
];

const allTurnRiverA8ExpansionDecisions: PracticalDecision[] = families.flatMap(family);
export const turnRiverA8ExpansionDecisions: PracticalDecision[] = allTurnRiverA8ExpansionDecisions.filter((decision) => decision.learnerEligibility !== "INTERNAL_ONLY");
export const turnRiverA8LegacySpecificityDecisions: PracticalDecision[] = allTurnRiverA8ExpansionDecisions.filter((decision) => decision.learnerEligibility === "INTERNAL_ONLY");

export const laterStreetLegacySkillBridges = {
  "OOP-06": ["TURN-04"],
  "OOP-07": ["RIV-03", "RIV-04"],
  "IP-03": ["TURN-02"],
  "IP-04": ["TURN-03"],
  "IP-05": ["TURN-02", "RIV-01", "RIV-02"],
  "IP-06": ["TURN-05", "RIV-01"],
} as const;
