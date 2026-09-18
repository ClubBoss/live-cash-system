import type { PracticalDecision, PracticalDecisionOption } from "./types";

type OptionRepair = Pick<PracticalDecisionOption, "textRu" | "textEn"> & { misconception?: string };

type DecisionRepair = {
  questionRu: string;
  questionEn: string;
  actionOptions: Record<string, OptionRepair>;
  reasonOptions?: Record<string, OptionRepair>;
};

const generatedReasonRepairs: Record<string, Pick<PracticalDecisionOption, "textRu" | "textEn">> = {
  HISTORY_IGNORED: {
    textRu: "Если известны текущая цена и класс руки, предыдущую линию можно не учитывать при восстановлении сохранившегося диапазона",
    textEn: "Once current price and hand class are known, prior action can be ignored when reconstructing the surviving range",
  },
  GEOMETRY_IGNORED: {
    textRu: "Если класс руки игрока не изменился, глубина, число игроков и относительная позиция не должны менять выбор ветки",
    textEn: "If Hero's hand class is unchanged, depth, player count, and relative position should not change the branch choice",
  },
  ARCHETYPE_AS_EVIDENCE: {
    textRu: "Если одно наблюдение похоже на тип игрока, этого достаточно, чтобы переносить рид на соседние ветки",
    textEn: "If one observation fits a player type, that is enough to carry the read into nearby branches",
  },
};

function applyGeneratedReasonRepairs(decision: PracticalDecision): PracticalDecision {
  const cluster = decision.id.match(/-(A8|A9|A10)-10[1-8]$/u)?.[1];
  if (!cluster) return decision;
  return {
    ...decision,
    reasonOptions: decision.reasonOptions.map((option) => {
      if (option.id === decision.correctReasonId) return option;
      const next = option.misconception ? generatedReasonRepairs[option.misconception] : undefined;
      return next ? { ...option, ...next } : option;
    }),
  };
}

const exactCorrectReasonRepairs: Readonly<Record<string, Pick<PracticalDecisionOption, "textRu" | "textEn">>> = {
  "PM-B3-TURN02-104": {
    textRu: "Класс руки изменился: рука со средней шоудаун-ценностью реже нуждается в превращении в блеф, поэтому чек чаще сохраняет её EV.",
    textEn: "The hand class changed: a medium-showdown hand has less reason to turn itself into a bluff, so checking preserves its EV more often.",
  },
  "PM-B4-TURN02-101": {
    textRu: "При большом будущем SPR одной текущей фолд-эквити недостаточно: тонкое вэлью и пограничные блефы должны ещё устойчиво реализовываться на ривере, иначе EV барреля падает.",
    textEn: "With a large future SPR, current fold equity is not enough: thin value and marginal bluffs must also realize robustly on the river or the barrel loses EV.",
  },
  "PM-B4-TURN02-102": {
    textRu: "Глубокий остаток стека усиливает будущие решения и риск дорогих ошибок, поэтому баррель сохраняют прежде всего устойчивое вэлью и качественные блефы.",
    textEn: "A deep remaining stack amplifies future decisions and costly mistakes, so robust value and high-quality bluffs are the barrel classes that survive best.",
  },
  "PM-B4-TURN02-103": {
    textRu: "Переход от малого остатка стека к глубокому повышает будущий SPR: разгон банка пограничными классами становится дороже, поэтому их баррель сужается.",
    textEn: "Moving from a shallow remainder to a deep stack raises future SPR: inflating the pot with marginal classes becomes more costly, so their barrel region contracts.",
  },
  "PM-B4-TURN02-104": {
    textRu: "Глубина повышает цену будущих ошибок, но не отменяет прибыльные баррели: устойчивое вэлью и качественные блефы продолжают, а пограничные классы отбираются строже.",
    textEn: "Depth raises the cost of future mistakes but does not erase profitable barrels: robust value and strong bluffs continue while marginal classes are selected more strictly.",
  },
  "PM-B4-RIV03-103": {
    textRu: "При той же цене повторяющийся недоблеф именно в этой ветке уменьшает ожидаемый запас блефов, поэтому пограничный колл теряет EV и порог сдвигается к фолду.",
    textEn: "At the same price, repeated underbluffing in this exact branch lowers expected bluff supply, so a marginal call loses EV and the threshold shifts toward folding.",
  },
  "PM-B4-RIV03-104": {
    textRu: "Рид на недоблеф действует только в подтверждённой ветке: другой сайзинг или линия меняют состав возможных блефов и требуют новой реконструкции.",
    textEn: "An underbluff read applies only to the evidenced branch: a different size or line changes the possible bluff set and requires a fresh reconstruction.",
  },
  "PM-TURN-02-FINAL-101": {
    textRu: "Колл флопа уже отфильтровал префлоп-диапазон; рейзить тёрн могут только руки, которые реально дошли до этого узла.",
    textEn: "The flop call already filtered the preflop range; only hands that actually reached this node can appear in the turn-raising range.",
  },
  "PM-TURN-02-FINAL-102": {
    textRu: "Наблюдения в конкретной ветке уменьшают ожидаемый запас естественных блефов; при той же цене это сужает прибыльный диапазон продолжения.",
    textEn: "Branch-specific evidence lowers the expected natural bluff supply; at the same price, that narrows the profitable continuing range.",
  },
  "PM-TURN-02-FINAL-103": {
    textRu: "Карта, закрывающая дро или возвращающая сильные комбинации коллеру, добавляет реальные сильные руки и естественные блефы в диапазон рейза; бланк этого не делает.",
    textEn: "A turn that completes draws or restores strong caller combinations adds real value hands and natural bluffs to the raising range; a blank does not.",
  },
  "PM-TURN-02-FINAL-104": {
    textRu: "Уже вложенные фишки — невозвратные издержки, а не эквити; продолжение определяется текущим диапазоном соперника и ценой колла сейчас.",
    textEn: "Previously invested chips are sunk cost, not equity; continuing depends on Villain's current range and the call price now.",
  },
  "PM-TURN-02-ETC-101": {
    textRu: "Ремонтная карта лишь запускает пересчёт: если Hero сохраняет достаточно сильный верх диапазона и ставка всё ещё имеет вэлью- или фолд-эквити-задачу, агрессия остаётся прибыльной.",
    textEn: "A range-repairing turn triggers a recomputation rather than an automatic check: if Hero retains enough top-end ownership and the bet still has a value or fold-equity purpose, aggression can remain profitable.",
  },
  "PM-TURN-02-ETC-102": {
    textRu: "Бланк означает лишь отсутствие нового усиления соперника; он не создаёт ни худших коллов для вэлью, ни дополнительных фолдов, поэтому цель второй ставки нужно доказать отдельно.",
    textEn: "A blank only means Villain did not gain new strength; it creates neither worse value calls nor extra folds, so the purpose of a second barrel must be established separately.",
  },
  "PM-RIV-03-C0-201": {
    textRu: "Широкий старт даёт больше потенциального воздуха, но действия по улицам его фильтруют; колл на ривере должен опираться на блефы, которые действительно дожили до этой линии.",
    textEn: "A wide starting range creates more potential air, but street-by-street action filters it; a river call must use bluffs that actually survive the line.",
  },
  "PM-RIV-03-C0-202": {
    textRu: "Разномастные широкие классы содержат больше стартовых комбинаций, поэтому потенциальных блеф-кандидатов может быть больше; это не означает, что весь этот воздух доживает до ривера.",
    textEn: "Wide offsuit classes contain more starting combinations, so they can create more potential bluff candidates; that does not mean all of that air survives to the river.",
  },
  "PM-RIV-03-C0-205": {
    textRu: "Смена широкого BTN-старта на тайтовый ранний диапазон уменьшает исходный запас воздуха; затем его всё равно нужно провести через те же фильтры борда и линии.",
    textEn: "Changing from a wide BTN origin to a tight early-position range reduces the prior air supply; it still must be passed through the same board and line filters.",
  },
  "PM-RIV-03-C0-207": {
    textRu: "Широкий старт — только исходная оценка запаса воздуха: конкретная линия может удалить его, а утверждение о переблефе пула требует отдельных наблюдений.",
    textEn: "A wide origin is only a prior on air supply: the line can remove that air, and a population-overbluff claim requires separate evidence.",
  },
  "PM-RIV-03-C0-208": {
    textRu: "Тайтовый старт может уменьшить исходный запас блефов, но не доказывает их отсутствие: после всей линии всё равно нужно перечислить правдоподобные блефы и сопоставить их с ценой и блокерами.",
    textEn: "A tight origin can reduce prior bluff supply but does not prove there are no bluffs: credible bluffs must still be enumerated after the full line and compared with price and blockers.",
  },
  "PM-EXP-01-A10-101": {
    textRu: "Одно наблюдение создаёт только гипотезу для конкретной ветки; уверенность растёт лишь при повторяющихся согласованных данных, поэтому масштаб эксплойта пока должен оставаться небольшим.",
    textEn: "One observation creates only a branch-scoped hypothesis; confidence rises with repeated consistent evidence, so exploit magnitude should remain small until that evidence appears.",
  },
  "PM-EXP-01-A10-102": {
    textRu: "При малом объёме данных уверенность низкая, поэтому безопаснее держаться базовой стратегии или небольшого условного отклонения до повторного подтверждения в той же ветке.",
    textEn: "Sparse evidence means low confidence, so the baseline or only a small conditional deviation is appropriate until the same branch is confirmed repeatedly.",
  },
  "PM-EXP-01-A10-103": {
    textRu: "Гипотеза должна оставаться привязанной к конкретной ветке; только повторяющиеся согласованные наблюдения повышают уверенность настолько, чтобы увеличивать отклонение от базовой стратегии.",
    textEn: "The hypothesis must stay tied to the exact branch; only repeated consistent observations raise confidence enough to justify a larger deviation from baseline.",
  },
  "PM-EXP-01-A10-104": {
    textRu: "Один яркий шоудаун не повышает уверенность достаточно для крупного или глобального эксплойта, поэтому отклонение нужно оставить небольшим и ограниченным этой веткой.",
    textEn: "One dramatic showdown does not create enough confidence for a large or global exploit, so the deviation should stay small and limited to that branch.",
  },
  "PM-EXP-01-A10-107": {
    textRu: "Другая улица, сайзинг или линия образуют новую ветку: старые наблюдения не дают той же уверенности здесь, поэтому без прямых данных нужно вернуться к базовой стратегии.",
    textEn: "A different street, size, or line is a new branch: the old observations do not provide the same confidence there, so baseline is appropriate until direct evidence exists.",
  },
  "PM-EXP-01-A10-108": {
    textRu: "Ярлык после одной раздачи не создаёт надёжного доказательства для всей игры; без повторяющихся данных в конкретной ветке глобальный эксплойт нужно отклонить и вернуться к базовой стратегии.",
    textEn: "A label from one hand is not reliable evidence across the whole game; without repeated branch-specific observations, reject the global exploit and return to baseline.",
  },
  "PM-B3-EXP01-101": {
    textRu: "Яркое действие — лишь исходная гипотеза: сначала привяжи наблюдение к конкретной ветке и оцени уверенность, а уже затем решай, допустимо ли отклонение от базовой стратегии.",
    textEn: "A vivid action is only an initial hypothesis: tie it to the exact branch and assess confidence before deciding whether any deviation from baseline is justified.",
  },
  "PM-B3-EXP01-102": {
    textRu: "Повторяющиеся согласованные наблюдения в одной ветке повышают уверенность и позволяют постепенно усиливать отклонение; без них одно наблюдение остаётся поводом для небольшой гипотезы, а не крупного эксплойта.",
    textEn: "Repeated consistent observations in the same branch raise confidence and allow a gradual larger deviation; without them, one observation supports only a small hypothesis rather than a large exploit.",
  },
  "PM-B3-EXP01-103": {
    textRu: "Повторное подтверждение в той же ветке повышает уверенность именно там, поэтому отклонение можно увеличить внутри этой ветки, не распространяя рид на другие ситуации.",
    textEn: "Repeated confirmation in the same branch raises confidence there, so the deviation can grow inside that branch without carrying the read into other situations.",
  },
  "PM-B3-EXP01-104": {
    textRu: "Противоречащие наблюдения в той же ветке снижают уверенность в старом риде, поэтому эксплойт нужно ослабить или отменить и двигаться к базовой стратегии, пока новая гипотеза не подтвердится.",
    textEn: "Contradictory observations in the same branch reduce confidence in the old read, so the exploit should shrink or disappear and move toward baseline until a new hypothesis is confirmed.",
  },
};

function applyExactCorrectReasonRepair(decision: PracticalDecision): PracticalDecision {
  const repair = exactCorrectReasonRepairs[decision.id];
  if (!repair) return decision;
  return {
    ...decision,
    reasonOptions: decision.reasonOptions.map((option) =>
      option.id === decision.correctReasonId ? { ...option, ...repair } : option
    ),
  };
}


type ExactSemanticRepair = {
  cueRu: string;
  cueEn: string;
  actionRu: string;
  actionEn: string;
  reasonRu: string;
  reasonEn: string;
};

type A9SpecificityProfile = {
  prefix: string;
  row102: ExactSemanticRepair;
  row104: ExactSemanticRepair;
  row105: ExactSemanticRepair;
  row107: ExactSemanticRepair;
};

const a9SpecificityProfiles: readonly A9SpecificityProfile[] = [
  {
    prefix: "PM-MW-01-A9",
    row102: {
      cueRu: "Те же карты и беттор, но теперь после Hero остаётся ещё один активный игрок, который может коллировать или рейзить.",
      cueEn: "Same cards and bettor, but one additional active player now remains behind Hero and can call or raise.",
      actionRu: "Да — пересчитать ветку с учётом игрока позади и незакрытых торгов",
      actionEn: "Yes — recompute the branch with the player behind and the action still open",
      reasonRu: "Дополнительный диапазон позади может войти в банк или повысить ставку, поэтому пограничные коллы и рейзы хуже реализуют эквити и меняют EV.",
      reasonEn: "The extra range behind can enter or raise, so marginal calls and raises realize worse and their branch EV changes.",
    },
    row104: {
      cueRu: "Hero хочет сделать пограничный колл так, будто после него уже никто не действует, хотя за спиной остаётся активный игрок.",
      cueEn: "Hero wants to make a marginal call as if the action were closed even though an active player remains behind.",
      actionRu: "Сначала учесть диапазон позади, риск сквиза и ветку оверколла",
      actionEn: "First account for the range behind, squeeze risk, and the overcall branch",
      reasonRu: "Пограничный колл в зажатой позиции должен пережить не только текущую ставку, но и возможное действие игрока позади; игнорирование этой ветки завышает EV колла.",
      reasonEn: "A marginal sandwiched call must survive both the current bet and possible action behind; ignoring that branch overstates call EV.",
    },
    row105: {
      cueRu: "Игроки и позиции те же, но ставка перед Hero увеличивается с малого размера до крупного.",
      cueEn: "Players and positions are unchanged, but the bet facing Hero increases from small to large.",
      actionRu: "Ужесточить пограничные продолжения: цена хуже, а действие позади по-прежнему открыто",
      actionEn: "Tighten marginal continues: the price is worse and action behind is still open",
      reasonRu: "Больший размер ухудшает текущую цену, а игрок позади сохраняет риск дополнительного давления; вместе это снижает EV тонких коллов и рейзов.",
      reasonEn: "The larger size worsens the current price while the player behind still creates extra pressure; together they reduce EV for thin calls and raises.",
    },
    row107: {
      cueRu: "Та же ставка и позиции, но число активных игроков позади Hero увеличивается с одного до двух.",
      cueEn: "Same bet and positions, but the number of active players behind Hero increases from one to two.",
      actionRu: "Сузить пограничные коллы и рейзы и требовать более устойчивые руки",
      actionEn: "Tighten marginal calls and raises and require more robust hands",
      reasonRu: "Каждый дополнительный диапазон позади повышает вероятность оверколла или рейза и ухудшает реализацию, поэтому граница прибыльного продолжения становится строже.",
      reasonEn: "Each additional range behind raises the chance of an overcall or raise and worsens realization, so the profitable continuing threshold becomes tighter.",
    },
  },
  {
    prefix: "PM-MW-02-A9",
    row102: {
      cueRu: "Та же одна пара и доска, но вместо хедз-апа в раздаче остаётся ещё один соперник.",
      cueEn: "Same one-pair hand and board, but one additional opponent remains instead of heads-up play.",
      actionRu: "Да — повысить требования к вэлью и стек-оффу",
      actionEn: "Yes — raise the value and stack-off threshold",
      reasonRu: "Дополнительный продолжающий диапазон повышает вероятность сильного и натсового покрытия, поэтому относительная ценность пограничной одной пары падает.",
      reasonEn: "An additional continuing range raises the chance of strong and nutted coverage, so the relative value of a marginal one-pair hand falls.",
    },
    row104: {
      cueRu: "Hero хочет стек-оффить топ-пару по обычному хедз-ап-порогу, хотя банк стал мультивей.",
      cueEn: "Hero wants to stack off top pair at the usual heads-up threshold even though the pot is now multiway.",
      actionRu: "Пересчитать вэлью-порог против всех продолжающих диапазонов",
      actionEn: "Recompute the value threshold against all continuing ranges",
      reasonRu: "В мультивей-банке несколько диапазонов одновременно могут содержать сильное вэлью, поэтому хедз-ап-порог переоценивает относительную силу одной пары.",
      reasonEn: "In a multiway pot, several ranges can contain strong value at once, so a heads-up threshold overstates one-pair relative strength.",
    },
    row105: {
      cueRu: "Число соперников и доска те же, но размер ставки против Hero увеличивается.",
      cueEn: "The number of opponents and the board are unchanged, but the bet facing Hero becomes larger.",
      actionRu: "Сузить пограничные продолжения и поднять требование к устойчивости руки",
      actionEn: "Tighten marginal continues and demand more hand robustness",
      reasonRu: "Крупная ставка ухудшает цену, а несколько сильных продолжающих диапазонов уже снижают относительную ценность одной пары; вместе это уменьшает EV пограничного продолжения.",
      reasonEn: "A larger bet worsens the price while multiple strong continuing ranges already reduce one-pair relative value; together they lower marginal continue EV.",
    },
    row107: {
      cueRu: "Та же рука и доска, но к двум продолжающим диапазонам добавляется третий соперник.",
      cueEn: "Same hand and board, but a third opponent is added to the two continuing ranges.",
      actionRu: "Ещё сильнее поднять порог для вэлью-агрессии и стек-оффа",
      actionEn: "Raise the threshold for value aggression and stack-offs further",
      reasonRu: "Большее число продолжающих диапазонов увеличивает совокупную плотность сильных рук, поэтому пограничная одна пара теряет относительную ценность.",
      reasonEn: "More continuing ranges increase aggregate strong-hand density, so a marginal one-pair hand loses relative value.",
    },
  },
  {
    prefix: "PM-MW-03-A9",
    row102: {
      cueRu: "Тот же кандидат на блеф, но вместо одного диапазона нужно заставить сфолдить два независимых продолжающих диапазона.",
      cueEn: "Same bluff candidate, but instead of one range Hero now must fold out two independent continuing ranges.",
      actionRu: "Да — сократить пограничные блефы без дополнительного рычага или эквити",
      actionEn: "Yes — reduce marginal bluffs unless extra leverage or equity supports them",
      reasonRu: "Блеф теперь должен преодолеть два диапазона, поэтому совокупная вероятность нужных фолдов ниже и EV пограничного блефа падает.",
      reasonEn: "The bluff must now clear two ranges, so the combined probability of enough folds is lower and marginal bluff EV falls.",
    },
    row104: {
      cueRu: "Hero хочет сохранить хедз-ап-частоту пограничных блефов против двух реальных продолжающих диапазонов.",
      cueEn: "Hero wants to keep a heads-up marginal-bluff frequency against two real continuing ranges.",
      actionRu: "Урезать неподдержанные блефы и оставить кандидатов с эквити, блокерами или сильным рычагом",
      actionEn: "Cut unsupported bluffs and keep candidates with equity, blockers, or strong leverage",
      reasonRu: "Хедз-ап-частота предполагает один fold target; против нескольких диапазонов требуется больше совокупных фолдов, поэтому слабые блефы теряют EV.",
      reasonEn: "A heads-up frequency assumes one fold target; against multiple ranges more combined folds are required, so weak bluffs lose EV.",
    },
    row105: {
      cueRu: "Число диапазонов то же, но Hero увеличивает размер блефа против нескольких соперников.",
      cueEn: "The number of ranges is unchanged, but Hero increases the bluff size against multiple opponents.",
      actionRu: "Требовать больше фолд-эквити или более сильные блокеры перед крупным блефом",
      actionEn: "Require more fold equity or stronger blockers before using the larger bluff",
      reasonRu: "Больший размер рискует большим количеством фишек, а блеф всё ещё должен выбить несколько диапазонов; без роста совокупных фолдов его EV снижается.",
      reasonEn: "The larger size risks more chips while still needing to fold out multiple ranges; without more combined folds, bluff EV falls.",
    },
    row107: {
      cueRu: "Тот же кандидат и размер, но к двум продолжающим диапазонам добавляется ещё один соперник.",
      cueEn: "Same candidate and size, but one more opponent is added to the two continuing ranges.",
      actionRu: "Сузить блефы и оставить только наиболее устойчивые кандидаты",
      actionEn: "Tighten the bluff set and keep only the most robust candidates",
      reasonRu: "Дополнительный диапазон создаёт ещё одну точку сопротивления, поэтому вероятность, что все нужные диапазоны сфолдят, падает.",
      reasonEn: "The additional range creates another point of resistance, so the probability that all required ranges fold decreases.",
    },
  },
  {
    prefix: "PM-MW-04-A9",
    row102: {
      cueRu: "Рука и лимпер те же, но Hero перемещается с BTN на SB и теперь будет играть без позиции после колла.",
      cueEn: "Same hand and limper, but Hero moves from BTN to SB and will now play out of position when called.",
      actionRu: "Да — пересчитать изоляцию с учётом худшей реализации без позиции",
      actionEn: "Yes — recompute the isolation branch with worse out-of-position realization",
      reasonRu: "Потеря позиции ухудшает реализацию эквити в ветке после колла, поэтому пограничная изоляция теряет EV относительно BTN.",
      reasonEn: "Losing position worsens equity realization in the called branch, so a marginal isolation raise loses EV relative to BTN.",
    },
    row104: {
      cueRu: "Hero хочет автоматически изолировать любую играбельную руку только потому, что перед ним лимп.",
      cueEn: "Hero wants to auto-isolate every playable hand merely because there is a limp in front.",
      actionRu: "Сравнить изоляцию, оверлимп и фолд по фолдам, позиции и EV ветки после колла",
      actionEn: "Compare isolation, overlimp, and fold using folds, position, and called-branch EV",
      reasonRu: "Сам факт лимпа не делает рейз прибыльным: изоляция должна выигрывать через вэлью, фолд-эквити или качественную ветку после колла.",
      reasonEn: "The limp itself does not make a raise profitable: isolation must win through value, fold equity, or a strong called branch.",
    },
    row105: {
      cueRu: "Тенденции лимпера те же, но размер изоляционного рейза Hero увеличивается.",
      cueEn: "The limper's tendencies are unchanged, but Hero increases the isolation-raise size.",
      actionRu: "Пересчитать цену инвестиции и EV ветки после колла до выбора крупного изолейта",
      actionEn: "Recompute investment cost and called-branch EV before choosing the larger isolation raise",
      reasonRu: "Больший изолейт вкладывает больше фишек до флопа; если лимпер продолжает часто, дорогая ветка после колла может убрать EV у пограничных рейзов.",
      reasonEn: "A larger isolation raise invests more chips preflop; if the limper continues often, the more expensive called branch can erase EV from marginal raises.",
    },
    row107: {
      cueRu: "Рука и позиция те же, но вместо одного лимпера перед Hero теперь два.",
      cueEn: "Same hand and position, but Hero now faces two limpers instead of one.",
      actionRu: "Сделать изоляцию более избирательной и выше ценить устойчивые вэлью-руки",
      actionEn: "Make isolation more selective and value robust hands more highly",
      reasonRu: "Второй лимпер повышает вероятность колла и мультивей-ветки, поэтому тонкие изолейты хуже реализуются и требуют более сильной руки.",
      reasonEn: "A second limper raises the chance of a call and a multiway branch, so thin isolation raises realize worse and require a stronger hand.",
    },
  },
  {
    prefix: "PM-DEEP-01-A9",
    row102: {
      cueRu: "Та же рука и банк, но эффективный стек увеличивается со 100bb до 200bb.",
      cueEn: "Same hand and pot, but effective stack increases from 100bb to 200bb.",
      actionRu: "Да — пересчитать ветку с большим весом будущего давления и обратных имплайд-оддсов",
      actionEn: "Yes — recompute the branch with more weight on future pressure and reverse implied odds",
      reasonRu: "Больший эффективный стек расширяет дерево будущих ставок, поэтому доминированные руки и руки без натсового потенциала могут проиграть больше на поздних улицах.",
      reasonEn: "A larger effective stack expands the future betting tree, so dominated hands and hands without nut potential can lose more on later streets.",
    },
    row104: {
      cueRu: "Hero хочет стек-оффить одну пару на 200bb по тому же порогу, который использовал при 100bb.",
      cueEn: "Hero wants to stack off one pair at 200bb using the same threshold as at 100bb.",
      actionRu: "Поднять порог стек-оффа и требовать больше устойчивости и натсового потенциала",
      actionEn: "Raise the stack-off threshold and require more robustness and nut potential",
      reasonRu: "На 200bb будущий рычаг и обратные имплайд-оддсы делают ошибки с second-best руками дороже, поэтому 100bb порог нельзя копировать.",
      reasonEn: "At 200bb, future leverage and reverse implied odds make second-best mistakes more expensive, so a 100bb threshold cannot be copied.",
    },
    row105: {
      cueRu: "Глубина остаётся 200bb, но текущая ставка против Hero становится крупнее.",
      cueEn: "Depth remains 200bb, but the current bet facing Hero becomes larger.",
      actionRu: "Ужесточить пограничные продолжения и пересчитать будущий SPR после более крупной инвестиции",
      actionEn: "Tighten marginal continues and recompute future SPR after the larger investment",
      reasonRu: "Больший размер ухудшает текущую цену и одновременно меняет оставшийся SPR; при глубоком стеке это сдвигает EV будущих веток.",
      reasonEn: "The larger size worsens the current price and also changes remaining SPR; at deep stacks that shifts future-branch EV.",
    },
    row107: {
      cueRu: "Глубина и размер те же, но в банк входит ещё один активный соперник.",
      cueEn: "Depth and size are unchanged, but one additional active opponent enters the pot.",
      actionRu: "Требовать более устойчивые и натсовые руки для крупных будущих банков",
      actionEn: "Require more robust and nutted hands for large future pots",
      reasonRu: "Дополнительный диапазон повышает риск столкнуться с сильной частью в глубоком банке, поэтому цена обратных имплайд-оддсов для пограничных рук растёт.",
      reasonEn: "The additional range raises the chance of meeting strong holdings in a deep pot, increasing reverse-implied cost for marginal hands.",
    },
  },
  {
    prefix: "PM-DEEP-03-A9",
    row102: {
      cueRu: "Физические стеки те же, но появляется обязательный страддл, который становится новой рабочей единицей ставки.",
      cueEn: "Physical stacks are unchanged, but a mandatory straddle appears and becomes the new working betting unit.",
      actionRu: "Да — пересчитать эффективную глубину, порядок действий и SPR в новой единице",
      actionEn: "Yes — recompute effective depth, action order, and SPR in the new unit",
      reasonRu: "Страддл меняет знаменатель глубины и порядок действий, поэтому прежнее число bb больше не описывает ту же стратегическую геометрию.",
      reasonEn: "The straddle changes the depth denominator and action order, so the old BB count no longer describes the same strategic geometry.",
    },
    row104: {
      cueRu: "Hero хочет оставить обычные диапазоны без страддла неизменными после появления обязательного страддла.",
      cueEn: "Hero wants to keep the ordinary non-straddled ranges unchanged after a mandatory straddle appears.",
      actionRu: "Сначала пересчитать рабочую глубину и порядок действий, затем применять префлоп-ориентиры",
      actionEn: "First recompute working depth and action order, then apply preflop heuristics",
      reasonRu: "Страддл меняет эффективную глубину в рабочих единицах и очередность, поэтому старое дерево не переносится как готовый чарт.",
      reasonEn: "A straddle changes effective depth in working units and the action order, so the old tree cannot be copied as a ready-made chart.",
    },
    row105: {
      cueRu: "Физические стеки не меняются, но обязательный страддл увеличивается с 5 до 10.",
      cueEn: "Physical stacks are unchanged, but the mandatory straddle increases from 5 to 10.",
      actionRu: "Пересчитать глубину в единицах страддла и новый SPR",
      actionEn: "Recompute depth in straddle units and the new SPR",
      reasonRu: "Удвоение страддла делает те же физические стеки стратегически короче и сильнее сжимает будущие ветки.",
      reasonEn: "Doubling the straddle makes the same physical stacks strategically shorter and compresses future branches further.",
    },
    row107: {
      cueRu: "Страддл и физические стеки те же, но после Hero остаётся ещё один активный игрок.",
      cueEn: "Straddle and physical stacks are unchanged, but one additional active player remains behind Hero.",
      actionRu: "Ужесточить пограничные ветки и учесть новый порядок действий позади",
      actionEn: "Tighten marginal branches and account for the extra action behind",
      reasonRu: "Дополнительный игрок меняет эффективную позицию и риск последующего давления, поэтому даже при той же глубине EV пограничных действий снижается.",
      reasonEn: "The additional player changes effective position and the risk of later pressure, so marginal-action EV falls even at the same depth.",
    },
  },
  {
    prefix: "PM-DEEP-04-A9",
    row102: {
      cueRu: "Та же рука и позиции, но эффективная глубина увеличивается со 100bb до 200bb.",
      cueEn: "Same hand and positions, but effective depth increases from 100bb to 200bb.",
      actionRu: "Да — пересчитать колл, 3-бет и 4-бет с большим весом позиции и натсового потенциала",
      actionEn: "Yes — recompute call, 3-bet, and 4-bet with more weight on position and nut potential",
      reasonRu: "Более глубокий стек увеличивает будущую выплату и цену доминирования, поэтому префлоп-действие на 100bb не сохраняет тот же EV автоматически.",
      reasonEn: "A deeper stack increases future payoff and domination cost, so a 100bb preflop action does not automatically retain the same EV.",
    },
    row104: {
      cueRu: "Hero хочет скопировать действие из чарта на 100bb в существенно более глубокий банк без пересчёта.",
      cueEn: "Hero wants to copy a 100bb chart action into a materially deeper pot without recomputing it.",
      actionRu: "Пересчитать ветку через позицию, имплайд-оддсы и натсовый потенциал",
      actionEn: "Recompute the branch through position, implied odds, and nut potential",
      reasonRu: "Глубина меняет стоимость будущего доминирования и потенциальную выплату, поэтому точное действие из 100bb чарта не является универсальным.",
      reasonEn: "Depth changes future domination cost and potential payoff, so an exact 100bb chart action is not universal.",
    },
    row105: {
      cueRu: "Глубина и позиции те же, но размер 3-бета против Hero увеличивается.",
      cueEn: "Depth and positions are unchanged, but the 3-bet size facing Hero increases.",
      actionRu: "Ужесточить пограничные коллы и пересчитать 4-бет относительно новой цены",
      actionEn: "Tighten marginal calls and recompute 4-bets against the new price",
      reasonRu: "Крупный 3-бет ухудшает текущую цену и снижает postflop SPR; в глубокой игре это меняет реализацию и пороги колла/4-бета.",
      reasonEn: "A larger 3-bet worsens the current price and lowers postflop SPR; in deep play that changes realization and call/4-bet thresholds.",
    },
    row107: {
      cueRu: "Глубина и позиции те же, но после Hero появляется ещё один активный игрок, способный сквизить.",
      cueEn: "Depth and positions are unchanged, but one additional active player who can squeeze remains behind Hero.",
      actionRu: "Сузить пограничные коллы и сильнее ценить устойчивые ветки",
      actionEn: "Tighten marginal calls and favor more robust branches",
      reasonRu: "Риск сквиза ухудшает реализацию пограничного колла, а глубокий стек делает дорогую доминированную ветку ещё более наказуемой.",
      reasonEn: "Squeeze risk worsens realization for a marginal call, and depth makes an expensive dominated branch even more costly.",
    },
  },
];

const a10SpecificityRepairs: Readonly<Record<string, ExactSemanticRepair>> = {
  "PM-EXP-01-A10-105": {
    cueRu: "Повторные наблюдения в той же линии, сайзинге и улице снова подтверждают исходный рид.",
    cueEn: "Repeated observations in the same line, size, and street confirm the original read again.",
    actionRu: "Усилить отклонение в том же направлении, но только внутри подтверждённой ветки",
    actionEn: "Strengthen the deviation in the same direction, but only inside the evidenced branch",
    reasonRu: "Согласованные повторные данные повышают уверенность именно в этой ветке, поэтому размер эксплойта можно увеличить без расширения его области.",
    reasonEn: "Consistent repeated evidence raises confidence in this exact branch, so the exploit can be scaled up without broadening its scope.",
  },
  "PM-EXP-01-A10-106": {
    cueRu: "Новые наблюдения в той же ветке систематически противоречат исходному риду.",
    cueEn: "New observations in the same branch consistently contradict the original read.",
    actionRu: "Ослабить или развернуть эксплойт в соответствии с новым направлением данных",
    actionEn: "Reduce or reverse the exploit according to the new direction of the evidence",
    reasonRu: "Противоречащие наблюдения снижают уверенность в старом риде и меняют оценку этой ветки, поэтому прежнее отклонение нужно уменьшить или развернуть.",
    reasonEn: "Contradictory observations reduce confidence in the old read and change the branch estimate, so the prior deviation must be reduced or reversed.",
  },
  "PM-EXP-02-A10-105": {
    cueRu: "В той же ветке и при том же сайзинге соперник повторно показывает слишком широкие слабые коллы.",
    cueEn: "In the same branch and at the same size, Villain repeatedly shows overly wide weak calls.",
    actionRu: "Тоньше вэлью-бетить в этой ветке, сохраняя сайзинг, на котором слабые коллы подтверждены",
    actionEn: "Value-bet thinner in this branch while keeping the size where weak calls are evidenced",
    reasonRu: "Повторные слабые коллы повышают уверенность, что диапазон продолжения действительно слишком широк именно здесь, поэтому порог тонкого вэлью можно снизить.",
    reasonEn: "Repeated weak calls raise confidence that the continuing range is genuinely too wide here, so the thin-value threshold can move lower.",
  },
  "PM-EXP-02-A10-106": {
    cueRu: "Тот же игрок регулярно фолдит против крупного сайзинга, но продолжает слишком широко против малого.",
    cueEn: "The same player regularly folds to the large size but still continues too wide against the small size.",
    actionRu: "Сохранять тонкое вэлью в малом размере и не переносить его автоматически на крупный",
    actionEn: "Keep thin value at the small size and do not automatically transfer it to the large size",
    reasonRu: "Реакция стала зависеть от сайзинга: слабые коллы сохраняются против малого размера и исчезают против крупного, поэтому вэлью-эксплойт должен стать сайзинг-зависимым.",
    reasonEn: "The response is now size-dependent: weak calls remain versus the small size and disappear versus the large one, so the value exploit must become size-specific.",
  },
  "PM-EXP-03-A10-105": {
    cueRu: "В той же ветке повторные наблюдения подтверждают устойчивый перефолд против выбранного давления.",
    cueEn: "Repeated observations in the same branch confirm persistent overfolding against the chosen pressure.",
    actionRu: "Увеличить частоту блефов именно в подтверждённо перефолженной ветке",
    actionEn: "Increase bluffing specifically in the evidenced overfolding branch",
    reasonRu: "Повторный перефолд повышает уверенность в лишних фолдах именно здесь, поэтому дополнительный блеф получает больше EV в этой ветке.",
    reasonEn: "Repeated overfolding raises confidence in excess folds here, so additional bluffing gains EV in this branch.",
  },
  "PM-EXP-03-A10-106": {
    cueRu: "Раньше эта ветка перефолдила, но новые согласованные данные показывают, что соперник адаптировался и теперь коллирует шире.",
    cueEn: "This branch used to overfold, but new consistent evidence shows Villain adapted and now calls wider.",
    actionRu: "Сократить дополнительный блеф и двигаться обратно к базовой частоте",
    actionEn: "Reduce the extra bluffs and move back toward the baseline frequency",
    reasonRu: "Более широкий новый диапазон колла уменьшает лишние фолды, на которых держался старый эксплойт, поэтому его блефовая прибавка теряет EV.",
    reasonEn: "The new wider calling range removes the excess folds that supported the old exploit, so the extra bluffing loses EV.",
  },
  "PM-EXP-04-A10-105": {
    cueRu: "В той же риверной ветке несколько повторных вскрытий подтверждают избыток естественных блефов.",
    cueEn: "In the same river branch, repeated revealed hands confirm an excess of natural bluffs.",
    actionRu: "Расширить диапазон блеф-кетч коллов именно в этой подтверждённой ветке",
    actionEn: "Widen bluff-catch calls specifically in this evidenced branch",
    reasonRu: "Повторный избыток блефов повышает ожидаемую долю блефов при той же цене, поэтому часть пограничных фолдов становится прибыльными коллами.",
    reasonEn: "Repeated excess bluffing raises the expected bluff share at the same price, turning some marginal folds into profitable calls.",
  },
  "PM-EXP-04-A10-106": {
    cueRu: "Тот же игрок и тот же риверный сайзинг, но предыдущая линия теперь удаляет большинство естественных блефов.",
    cueEn: "Same player and river size, but the preceding line now removes most natural bluffs.",
    actionRu: "Коллировать реже и сдвинуть пограничные блеф-кетчеры к фолду",
    actionEn: "Call less often and shift marginal bluff-catchers toward folding",
    reasonRu: "Изменилась линия, а вместе с ней сохранившийся запас блефов: при той же цене меньше правдоподобных блефов снижает EV пограничного колла.",
    reasonEn: "The line changed, and so did surviving bluff supply: at the same price, fewer credible bluffs reduce marginal call EV.",
  },
  "PM-EXP-05-A10-105": {
    cueRu: "В одном и том же узле соперник повторно перефолдивает против малого проб-бета.",
    cueEn: "In the same node, Villain repeatedly overfolds versus a small probe bet.",
    actionRu: "Чаще атаковать именно этот узел малым проб-бетом",
    actionEn: "Attack this exact node more often with the small probe",
    reasonRu: "Повторный перефолд повышает уверенность в конкретной ошибке ответа на малый проб-бет, поэтому дополнительная атака получает EV только в этом узле.",
    reasonEn: "Repeated overfolding raises confidence in the specific response leak versus the small probe, so extra aggression gains EV only in this node.",
  },
  "PM-EXP-05-A10-106": {
    cueRu: "Тот же игрок использует другой сайзинг или другую линию, где повторяющаяся ошибка ещё не наблюдалась.",
    cueEn: "The same player uses a different size or line where the repeated leak has not been observed.",
    actionRu: "Вернуться к базовой стратегии в новой ветке, пока не появятся отдельные подтверждения",
    actionEn: "Return to baseline in the new branch until separate evidence appears",
    reasonRu: "Изменение сайзинга или линии создаёт другой узел дерева; доказательство старой ошибки не подтверждает ту же реакцию здесь, поэтому перенос эксплойта теряет основание.",
    reasonEn: "A different size or line creates a different node; evidence for the old leak does not prove the same response here, so transferring the exploit is unsupported.",
  },
};

const a9SpecificityRepairs: Readonly<Record<string, ExactSemanticRepair>> = Object.fromEntries(
  a9SpecificityProfiles.flatMap((profile) => [
    [`${profile.prefix}-102`, profile.row102],
    [`${profile.prefix}-104`, profile.row104],
    [`${profile.prefix}-105`, profile.row105],
    [`${profile.prefix}-107`, profile.row107],
  ]),
);

const exactSemanticRepairs: Readonly<Record<string, ExactSemanticRepair>> = {
  ...a9SpecificityRepairs,
  ...a10SpecificityRepairs,
};

function applyExactSemanticRepair(decision: PracticalDecision): PracticalDecision {
  const repair = exactSemanticRepairs[decision.id];
  if (!repair) return decision;
  return {
    ...decision,
    cueRu: repair.cueRu,
    cueEn: repair.cueEn,
    actionOptions: decision.actionOptions.map((option) =>
      option.id === decision.correctActionId
        ? { ...option, textRu: repair.actionRu, textEn: repair.actionEn }
        : option
    ),
    reasonOptions: decision.reasonOptions.map((option) =>
      option.id === decision.correctReasonId
        ? { ...option, textRu: repair.reasonRu, textEn: repair.reasonEn }
        : option
    ),
    explanationRu: repair.reasonRu,
    explanationEn: repair.reasonEn,
  };
}

const repairs: Record<string, DecisionRepair> = {
  "PM-BL-03-103": {
    questionRu: "Какой вывод лучше против широкого диапазона небольшого опен-рейза BTN?",
    questionEn: "Which conclusion is better against a wide small BTN open?",
    actionOptions: {
      a: {
        textRu: "Фолдить, потому что рука часто позади диапазона BTN",
        textEn: "Fold because the hand is often behind the BTN range",
        misconception: "SHOWDOWN_EQUITY_OVERFOLD",
      },
      b: {
        textRu: "Колл может быть лучше фолда, даже если рука часто проигрывает",
        textEn: "A call can beat folding even when the hand loses often",
      },
      c: {
        textRu: "Считать, что против BTN нужно защищать любые две карты",
        textEn: "Assume any two cards must defend against BTN",
        misconception: "ANY_TWO",
      },
    },
    reasonOptions: {
      r3: {
        textRu: "Ширина диапазона BTN сама по себе делает любую защиту прибыльной",
        textEn: "The width of the BTN range alone makes every defense profitable",
        misconception: "RANGE_ABSOLUTE",
      },
    },
  },
  "PM-BL-04-104": {
    questionRu: "Что обязательно пересчитать при большом сайзинге опен-рейза?",
    questionEn: "What must be recomputed against a large open?",
    actionOptions: {
      a: {
        textRu: "Дополнительную цену колла относительно итогового банка",
        textEn: "The incremental call price relative to the final pot",
      },
      b: {
        textRu: "Считать только уже поставленный блайнд: дополнительный колл цену не меняет",
        textEn: "Count only the posted blind: the extra call does not change the price",
        misconception: "SUNK_BLIND_OVERUSED",
      },
      c: {
        textRu: "Сохранить прежнюю пограничную защиту при той же категории руки",
        textEn: "Keep the same fringe defense when the hand category is unchanged",
        misconception: "SIZE_IGNORED",
      },
    },
  },
  "PM-BL-05-105": {
    questionRu: "Как оценить решение, если и колл, и ветка 3-бета после колла соперника проблемны?",
    questionEn: "How should the decision be evaluated when both the flat and the called 3-bet branch are problematic?",
    actionOptions: {
      a: {
        textRu: "Сравнить EV 3-бета после колла соперника и допустить фолд",
        textEn: "Compare the called-branch EV of the 3-bet and allow folding",
      },
      b: {
        textRu: "Форсировать 3-бет только потому, что колл слабый",
        textEn: "Force a 3-bet only because flatting is weak",
        misconception: "THREE_BET_OR_FOLD_LITERAL",
      },
      c: {
        textRu: "Игнорировать фильтрацию диапазона продолжения",
        textEn: "Ignore filtering of the continuing range",
        misconception: "FILTERING_IGNORED",
      },
    },
    reasonOptions: {
      r1: {
        textRu: "Плохой колл сам по себе не делает доминируемый 3-бет прибыльным",
        textEn: "A bad flat alone does not make a dominated 3-bet profitable",
      },
      r2: {
        textRu: "Агрессия сама по себе создаёт +EV",
        textEn: "Aggression alone creates positive EV",
        misconception: "AGGRESSION_AUTOPILOT",
      },
      r3: {
        textRu: "После 3-бета диапазон продолжения становится слабее по определению",
        textEn: "After a 3-bet the continuing range becomes weaker by definition",
        misconception: "FILTERING_BACKWARDS",
      },
    },
  },
};


type ExactRuCleanupRepair = {
  cueRu?: string;
  questionRu?: string;
  explanationRu?: string;
  actionOptions?: Readonly<Record<string, string>>;
  reasonOptions?: Readonly<Record<string, string>>;
};

const exactRuCleanupRepairs: Readonly<Record<string, ExactRuCleanupRepair>> = {
  "PM-MW-02-001": {
    cueRu: "Рука с одной парой сталкивается с сильной последовательностью действий в мультивей-банке.",
    questionRu: "Как меняется её относительная ценность без дополнительного эквити?",
    explanationRu: "Сильные мультивей-линии резко повышают требования к продолжению с одной парой и к наличию дополнительных путей улучшения.",
  },
  "PM-W4-HAND-001": {
    cueRu: "Hero имеет готовую руку и думает о вэлью-рейзе.",
    questionRu: "Какую классификацию нужно сделать кроме названия руки?",
    explanationRu: "Вэлью-рейз нужно оценивать против диапазона продолжения соперника, поэтому важна относительная, а не только абсолютная сила руки.",
    actionOptions: {
      a: "Относительная сила против диапазона продолжения",
      b: "Только абсолютная сила руки",
      c: "Только кикер",
    },
    reasonOptions: {
      r1: "Порог вэлью определяется руками, которые продолжают против выбранного действия",
      r2: "Топ-пара всегда обязана рейзить на вэлью",
      r3: "Диапазон продолжения соперника не влияет",
    },
  },
  "PM-IP-03-001": {
    cueRu: "Та же линия на флопе, но тёрн теперь меняет натсовую структуру диапазонов.",
    questionRu: "Можно ли сохранить план барреля с бланкового тёрна?",
    explanationRu: "После колла на флопе тёрн нужно пересчитать заново: карта может вернуть коллеру сильные комбинации и изменить пороги вэлью и блефа.",
    actionOptions: {
      a: "Нет — пересчитать диапазоны и действовать более избирательно",
      b: "Да — инициатива на флопе фиксирует план",
      c: "Да — тёрн никогда не меняет ограничение диапазона сверху",
    },
    reasonOptions: {
      r2: "Частота барреля определяется только флопом",
    },
  },
  "PM-W4-BOARD-01-106": {
    cueRu: "Те же диапазоны; доска меняется с сухой высокой на связанную, выравнивающую.",
    questionRu: "Как должна измениться структура ставок?",
    actionOptions: {
      a: "От широких малых ставок к более избирательной стратегии",
      b: "К ещё менее избирательной стратегии",
    },
  },
  "PM-W4-RUNOUT-01-107": {
    questionRu: "Как меняется агрессия проб-бета?",
    actionOptions: {
      a: "Более избирательно, с меньшим числом автоматических проб-бетов",
      b: "Больше автоматических проб-бетов",
    },
  },
  "PM-W4-REL-01-103": {
    questionRu: "Как меняется срочность действия?",
  },
  "PM-W4-REL-01-104": {
    questionRu: "Что чаще происходит в избирательной структуре?",
  },
  "PM-W4-REL-01-106": {
    questionRu: "Как меняется срочность действия?",
    actionOptions: {
      a: "Растёт",
      b: "Снижается",
    },
  },
  "PM-OOP-02-001": {
    cueRu: "Узел ответа без позиции, где рейз мало добавляет к EV.",
    questionRu: "Что означает упрощение со стратегией преимущественного колла?",
    explanationRu: "Стратегия преимущественного колла всё равно содержит фолды, а сильные коллы защищают пассивную ветку.",
    actionOptions: {
      b: "Коллировать любую руку, раз рейзы убраны",
      c: "Сильные руки всё равно обязательно рейзить, даже если остальной диапазон играет преимущественно через колл",
    },
  },
  "PM-IP-02-001": {
    cueRu: "Сильная рука в позиции, но немедленный рейз не нужен для защиты.",
    questionRu: "Почему ветка чека или колла может быть лучше?",
    explanationRu: "Сильные чеки и коллы защищают пассивную ветку и позволяют агрессивному сопернику продолжать блефовать, когда срочность невысока.",
    actionOptions: {
      b: "Сильные руки обязаны разыгрываться быстро",
      c: "Чек означает слабость",
    },
    reasonOptions: {
      r2: "Чек уничтожает шоудаун-вэлью",
    },
  },
  "PM-EXP-04-001": {
    explanationRu: "Более широкие блеф-кетч коллы оправданы только в подтверждённо переблефованной ветке с достаточным запасом естественных блефов; блокеры и предыдущая линия всё ещё важны.",
    actionOptions: {
      c: "Коллировать любым блеф-кетчером",
    },
    reasonOptions: {
      r3: "При эксплойте блокеры перестают иметь значение",
    },
  },
  "PM-PF-09-001": {
    explanationRu: "Качество сквиза определяется мёртвыми деньгами, фолд-эквити, выбором диапазона и тем, что происходит после колла, а не одним блокером.",
    actionOptions: {
      a: "Как рука играет после колла соперника + цели для фолда + позиция",
    },
    reasonOptions: {
      r1: "Мёртвые деньги полезны только если EV всей ветки остаётся положительным после коллов и 4-бетов",
    },
  },
  "PM-BL-02-001": {
    explanationRu: "Нужно учитывать исходный диапазон открытия, а не применять одну и ту же защиту BB против всех позиций.",
    actionOptions: {
      a: "Копировать защиту против BTN без поправки на позицию открытия",
      b: "Учитывать более сильный исходный диапазон CO",
      c: "Учитывать цену и реализацию эквити",
    },
    reasonOptions: {
      r1: "Сила исходного диапазона меняет риск доминации и требования к реализации эквити",
      r2: "Все открытия с поздних позиций одинаковы",
      r3: "Защита BB определяется только размером открытия",
    },
  },
  "PM-OOP-07-001": {
    cueRu: "Пограничная рука с шоудаун-вэлью на ривере без позиции.",
    questionRu: "Что должно разделять ветки чек-колла, чек-фолда и блок-бета?",
    explanationRu: "Риверное решение требует анализа диапазона, блокеров и функции ставки, а не автоматического ярлыка «блок-бет» или «чек-колл».",
    actionOptions: {
      a: "Цена + запас вэлью и блефов + блокеры + реакция на маленькую ставку",
      b: "Только ярлык абсолютной силы руки",
      c: "Всегда ставить блок-бет с пограничной рукой",
    },
  },
  "PM-W4-BOARD-01-104": {
    questionRu: "Сохраняется ли преимущество диапазона на доске автоматически?",
  },
  "PM-W4-BOARD-01-107": {
    questionRu: "Что происходит с преимуществом диапазона?",
    actionOptions: {
      a: "Может сместиться обратно к агрессору",
    },
  },
  "PM-W4-REL-01-101": {
    questionRu: "Почему ярлыка абсолютной силы недостаточно?",
  },
  "PM-TURN-04-S2-101": {
    cueRu: "Hero коллирует флоп без позиции на связанной доске. Тёрн закрывает несколько естественных продолжений коллера и заметно усиливает его сохранившуюся сильную часть диапазона.",
    explanationRu: "Лид на тёрне — условная ветка: сначала нужен реальный сдвиг преимущества диапазона и покрытия сильных комбинаций, а не просто улучшение руки Hero.",
    actionOptions: {
      a: "Сдвиг преимущества диапазона, который может создать ветку лида",
    },
    reasonOptions: {
      r1: "Лид создаётся конкретным сдвигом диапазонов, а не фактом улучшения одной руки",
      r2: "Любой тёрн, закрывающий дро, автоматически принадлежит игроку без позиции",
      r3: "Колл на флопе запрещает лид на следующей улице",
    },
  },
  "PM-TURN-05-S2-101": {
    explanationRu: "При более плотном сохранившемся диапазоне часть тонких ставок исчезает: нужно назвать худшие руки, которые коллируют, и учесть последствия рейза и ривера.",
    actionOptions: {
      b: "Худшие руки, которые коллируют, и будущие ветки",
    },
    reasonOptions: {
      r1: "Тонкое вэлью определяется диапазоном колла и будущими ветками, а не только текущей шоудаун-силой",
      r2: "Если рука чаще впереди, ставка обязательна",
      r3: "Более сильный сохранившийся диапазон автоматически делает тонкое вэлью шире",
    },
  },
  "PM-MW-05-S2-101": {
    explanationRu: "Мультивей-фильтрация в среднем усиливает сохранившиеся диапазоны и сокращает естественный запас блефов; хедз-ап-пороги нельзя переносить механически.",
    actionOptions: {
      a: "Более сильные диапазоны и меньше естественных блефов",
    },
    reasonOptions: {
      r1: "На мультивей-ривере нужно конкретнее назвать худшие коллы и правдоподобные блефы вместо копирования хедз-ап-порога",
      r2: "Дополнительный игрок всегда создаёт больше блефов",
      r3: "На ривере число диапазонов уже не важно",
    },
  },
  "PM-MW-03-S2-101": {
    cueRu: "Hero рассматривает блеф в банке на троих. Один соперник выглядит ограниченным сверху, но второй сохранил сильный диапазон продолжения.",
    explanationRu: "В мультивей-банке недостаточно увидеть один ограниченный диапазон: блеф должен пройти через все активные диапазоны.",
    actionOptions: {
      b: "Все цели для фолда и совокупный диапазон продолжения",
    },
    reasonOptions: {
      r1: "Мультивей-блеф требует фолдов от нескольких диапазонов и сталкивается с более сильной совокупной областью продолжения",
      r2: "Если один диапазон ограничен сверху, остальные можно игнорировать",
      r3: "Банк становится больше, поэтому блеф автоматически лучше",
    },
  },
  "PM-DEEP-02-S2-101": {
    cueRu: "То же семейство рук играется на 300bb вместо 100bb. Hero без позиции, и после префлоп-решения остаётся большой будущий стек.",
    explanationRu: "На 300bb позиция и обратные имплайд-оддсы становятся важнее; префлоп-ветку со 100bb нельзя переносить автоматически.",
    actionOptions: {
      a: "Позиция и обратные имплайд-оддсы",
    },
    reasonOptions: {
      r1: "Глубина увеличивает будущий рычаг ставок: ошибки с второй по силе рукой и без позиции становятся дороже, а натсовый потенциал и имплайд-оддсы — ценнее",
      r3: "Глубокий стек всегда означает больше агрессии без позиции",
    },
  },
  "PM-W4-BOARD-01-FINAL-102": {
    cueRu: "Возникает упрощённое правило: на любой монотонной доске правильная базовая линия — всегда чек.",
  },
  "PM-BL-06-ETC-103": {
    explanationRu: "Граница правила: chop завершает раздачу по предварительной договорённости до того, как был реально сыгран хотя бы один стратегический узел; блайнды возвращаются, а флоп не раздаётся. В отличие от разыгранного банка, такой chop не содержит решения под реальным давлением и не может подтверждать или опровергать стиль игрока.",
    actionOptions: {
      b: "Нет — chop заканчивает раздачу по предварительной договорённости до того, как был реально сыгран хотя бы один стратегический узел",
    },
  },
  "PM-BL-01-001": {
    reasonOptions: {
      r2: "Выгодная цена в BB полностью отменяет значение силы диапазона открытия",
    },
  },
  "PM-W4-RUNOUT-01-102": {
    actionOptions: {
      b: "Автоматически считать карту бланком",
    },
  },
  "PM-W4-REL-01-105": {
    actionOptions: {
      b: "Автоматически рейзить",
    },
  },
  "PM-RIV-04-S2-101": {
    reasonOptions: {
      r3: "Размер ставки на ривере не меняет диапазон продолжения",
    },
  },
  "PM-MW-04-S2-101": {
    actionOptions: {
      c: "Количество лимперов не влияет на ветку после колла",
    },
  },
};

function applyExactRuCleanupRepair(decision: PracticalDecision): PracticalDecision {
  const repair = exactRuCleanupRepairs[decision.id];
  if (!repair) return decision;
  return {
    ...decision,
    cueRu: repair.cueRu ?? decision.cueRu,
    questionRu: repair.questionRu ?? decision.questionRu,
    explanationRu: repair.explanationRu ?? decision.explanationRu,
    actionOptions: decision.actionOptions.map((option) => ({
      ...option,
      textRu: repair.actionOptions?.[option.id] ?? option.textRu,
    })),
    reasonOptions: decision.reasonOptions.map((option) => ({
      ...option,
      textRu: repair.reasonOptions?.[option.id] ?? option.textRu,
    })),
  };
}

const internalSourceIdPattern = /\b(?:FTGU|SLC|LCM|CINJ|CP)-[A-Z0-9-]+(?:\/E\d+)*\b/gu;

function naturalizeSourceReferences(text: string, locale: "ru" | "en"): string {
  if (!internalSourceIdPattern.test(text)) return text;
  internalSourceIdPattern.lastIndex = 0;
  let next = text.replace(internalSourceIdPattern, locale === "ru" ? "материал" : "source material");
  internalSourceIdPattern.lastIndex = 0;
  if (locale === "ru") {
    next = next
      .replace(/материал\s*(?:и|\/)\s*материал/giu, "материалы")
      .replace(/материалы\s*(?:и|\/)\s*материал/giu, "материалы")
      .replace(/Геометрия\s+материал(?:а|ов|ы)?\s*:/giu, "Геометрия:")
      .replace(/^материал\b/u, "Материал")
      .replace(/^материалы\b/u, "Материалы")
      .replace(/^Материал\s+связывают\b/u, "Материал связывает")
      .replace(/^Материал\s+требуют\b/u, "Материал требует");
  } else {
    next = next
      .replace(/source material\s*(?:and|\/)\s*source material/giu, "source materials")
      .replace(/source materials\s*(?:and|\/)\s*source material/giu, "source materials")
      .replace(/^source material\b/u, "Source material")
      .replace(/^source materials\b/u, "Source materials");
  }
  return next.replace(/\s{2,}/gu, " ").replace(/\s+([,.:;])/gu, "$1").trim();
}

function cleanLearnerExplanationSourceIds(decision: PracticalDecision): PracticalDecision {
  return {
    ...decision,
    cueRu: naturalizeSourceReferences(decision.cueRu, "ru"),
    cueEn: naturalizeSourceReferences(decision.cueEn, "en"),
    questionRu: naturalizeSourceReferences(decision.questionRu, "ru"),
    questionEn: naturalizeSourceReferences(decision.questionEn, "en"),
    explanationRu: naturalizeSourceReferences(decision.explanationRu, "ru"),
    explanationEn: naturalizeSourceReferences(decision.explanationEn, "en"),
    actionOptions: decision.actionOptions.map((option) => ({
      ...option,
      textRu: naturalizeSourceReferences(option.textRu, "ru"),
      textEn: naturalizeSourceReferences(option.textEn, "en"),
    })),
    reasonOptions: decision.reasonOptions.map((option) => ({
      ...option,
      textRu: naturalizeSourceReferences(option.textRu, "ru"),
      textEn: naturalizeSourceReferences(option.textEn, "en"),
    })),
  };
}

function applyOptions(options: PracticalDecisionOption[], repair?: Record<string, OptionRepair>) {
  if (!repair) return options;
  return options.map((option) => {
    const next = repair[option.id];
    return next ? { ...option, ...next } : option;
  });
}

export function applyPracticalAssessmentIntegrityRepair(decision: PracticalDecision): PracticalDecision {
  const generated = applyGeneratedReasonRepairs(decision);
  const exactReason = applyExactCorrectReasonRepair(generated);
  const exact = applyExactSemanticRepair(exactReason);
  const repair = repairs[exact.id];
  const repaired = repair
    ? {
        ...exact,
        questionRu: repair.questionRu,
        questionEn: repair.questionEn,
        actionOptions: applyOptions(exact.actionOptions, repair.actionOptions),
        reasonOptions: applyOptions(exact.reasonOptions, repair.reasonOptions),
      }
    : exact;
  const cleanedRu = applyExactRuCleanupRepair(repaired);
  return cleanLearnerExplanationSourceIds(cleanedRu);
}
