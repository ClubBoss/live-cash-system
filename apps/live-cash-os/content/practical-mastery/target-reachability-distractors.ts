// Reviewed, scenario-specific wrong options for the target-reachability closure pilot.
// Each tuple: learner-facing Russian, learner-facing English, diagnostic misconception.
// The canonical correct actions/reasons and source evidence remain in decisions-target-reachability-closure.ts.
export type TrcWrongOption = readonly [ru: string, en: string, misconception: string];
export type TrcWrongSet = { readonly c: TrcWrongOption; readonly r2: TrcWrongOption; readonly r3: TrcWrongOption };

export const trcScenarioDistractors: Record<string, TrcWrongSet> = {
  "PM-FND-05-TRC-101": {
    c: ["Исключить только карты Hero, сохранив комбинации с картами флопа", "Remove only Hero's cards while keeping combinations that contain flop cards", "BOARD_REMOVAL_OMITTED"],
    r2: ["Карты флопа меняют вероятность будущих аутов, но не число возможных двухкарточных рук в диапазоне.", "Flop cards affect future outs, but do not reduce the number of possible two-card hands in the range.", "FLOP_CARD_REMOVAL_IGNORED"],
    r3: ["Удаление карт достаточно учесть при оценке эквити: для подсчёта комбинаций сохраняется полный префлоп-диапазон.", "Card removal belongs only in the equity calculation; the full preflop range is retained when counting combinations.", "COUNT_VS_EQUITY_CONFUSION"],
  },
  "PM-FND-05-TRC-102": {
    c: ["Сравнить долю сильных рук только среди рук, дошедших до шоудауна", "Compare the strong-hand share only among hands that reached showdown", "DENOMINATOR_SUBSTITUTION"],
    r2: ["Если сильных комбинаций поровну, вероятность встретить сильную руку одинакова, даже когда один диапазон намного уже.", "An equal number of strong combos means equal likelihood of a strong hand, even when one range is much narrower.", "ABSOLUTE_COUNT_AS_FREQUENCY"],
    r3: ["Слабые комбинации не влияют на вес сильной части диапазона, поэтому их можно исключить из знаменателя заранее.", "Weak combinations do not affect the weight of the strong region, so they can be excluded from the denominator at the outset.", "WEAK_RANGE_DENOMINATOR_IGNORED"],
  },
  "PM-FND-05-TRC-103": {
    c: ["Взять процент потенциальных блефов из исходного префлоп-диапазона", "Use the potential bluff percentage from the original preflop range", "STARTING_RANGE_SUBSTITUTION"],
    r2: ["Если соотношение вэлью и блефов было сбалансировано на предыдущей улице, оно сохраняется после следующей карты.", "If the value-to-bluff ratio was balanced on the previous street, it remains balanced after the next card.", "STREET_FILTER_IGNORED"],
    r3: ["Блокеры убирают вэлью и блефы в одинаковой пропорции, поэтому достаточно сравнить названия классов рук.", "Blockers remove value and bluffs in the same proportion, so comparing hand-class labels is sufficient.", "NONUNIFORM_BLOCKING_IGNORED"],
  },
  "PM-FND-05-TRC-104": {
    c: ["Сравнить общее число блокируемых рук, не разделяя диапазоны фолда и продолжения", "Count all blocked hands without separating the fold and continue ranges", "BLOCKED_TOTAL_VS_TARGET"],
    r2: ["Для блеф-кетча блокер нужно оценивать против того же диапазона, который коллировал бы наш блеф.", "For a bluff-catch, the blocker must be judged against the same range that would call Hero's bluff.", "BLUFF_VS_CATCH_TARGET_SWAP"],
    r3: ["Для блеф-кетча выгодно блокировать руки, которые сфолдили бы на наш блеф, поскольку они не могут нас обыграть.", "For a bluff-catch, blocking hands that would fold to our bluff is favorable because they cannot beat us.", "FOLD_RANGE_AS_CATCH_TARGET"],
  },
  "PM-FND-05-TRC-105": {
    c: ["Обновить только число дро, оставив прежний подсчёт вэлью-комбинаций", "Update only draw counts while leaving the previous value-combo count intact", "VALUE_REMOVAL_OMITTED"],
    r2: ["Новая карта меняет силу прежних вэлью-рук, но не то, какие из их комбинаций физически возможны.", "The new card changes the strength of previous value hands but not which of their combinations remain physically possible.", "NEW_BLOCKER_OMITTED"],
    r3: ["Если карты Hero не изменились, число вэлью-комбинаций оппонента остаётся прежним несмотря на новую карту борда.", "If Hero's cards have not changed, Villain's value-combo count stays unchanged despite the new board card.", "HERO_ONLY_CARD_REMOVAL"],
  },
  "PM-FND-05-TRC-106": {
    c: ["Сохранить старую оценку блокера и изменить только размер будущего вэлью-бета", "Keep the earlier blocker evaluation and change only the value-bet size", "ACTION_TARGET_NOT_REASSESSED"],
    r2: ["Если блокер полезен против диапазона ставки оппонента, он сохраняет ту же ценность и при собственном вэлью-бете.", "If a blocker helps against Villain's betting range, it retains the same value when Hero makes a value bet.", "BETTING_RANGE_AS_VALUE_TARGET"],
    r3: ["При переходе от блеф-кетча к вэлью-бету целевой диапазон не меняется: это по-прежнему все руки, с которыми оппонент ставил бы сам.", "Switching from bluff-catching to value betting leaves the target range unchanged: it is still every hand Villain would bet.", "CALL_RANGE_VS_BET_RANGE"],
  },

  "PM-FND-07-TRC-101": {
    c: ["Считать порог 25%, добавив наш будущий колл в банк ещё один раз", "Set a 25% threshold by counting our future call in the pot a second time", "POT_PRICE_DOUBLE_COUNT"],
    r2: ["Риск 1 составляет половину возможного выигрыша 2, поэтому требуемая эквити равна 50%.", "The risk of 1 is half the potential win of 2, so the required equity is 50%.", "RISK_TO_WIN_DENOMINATOR"],
    r3: ["После колла банк уже включает нашу единицу дважды, поэтому для безубыточности достаточно 25% выигрышей.", "After the call the pot includes our one unit twice, so a 25% win rate is enough to break even.", "CALL_DOUBLE_COUNT"],
  },
  "PM-FND-07-TRC-102": {
    c: ["Считать только ауты до ривера, не моделируя размеры будущих ставок", "Count outs through the river without modeling future bet sizes", "REALIZATION_COST_IGNORED"],
    r2: ["Текущая эквити уже учитывает стоимость реализации всех будущих улиц, поэтому будущие ставки не добавляют отдельного риска.", "Current equity already incorporates the cost of realizing it on later streets, so future bets add no separate risk.", "EQUITY_AS_REALIZED_EV"],
    r3: ["Большой стек увеличивает только потенциальный будущий выигрыш; дополнительные ставки и риск проиграть крупный банк можно не включать.", "A deep stack increases only potential future winnings; later investment and the risk of losing a larger pot can be left out.", "REVERSE_IMPLIED_ODDS_IGNORED"],
  },
  "PM-FND-07-TRC-103": {
    c: ["Считать колл примерно нулевым по EV: запас эквити сверх 33% слишком мал, чтобы учитывать его", "Treat the call as roughly zero EV because the equity margin above 33% is too small to count", "POSITIVE_MARGIN_DISMISSED"],
    r2: ["Если олл-ин чаще проигрывается, чем выигрывается, положительный EV невозможен даже при выгодной цене банка.", "If an all-in loses more often than it wins, positive EV is impossible even at favorable pot odds.", "FREQUENCY_VS_PAYOFF_CONFUSION"],
    r3: ["Дополнительные пять процентных пунктов эквити сверх порога меняют только дисперсию, но не ожидаемую прибыль.", "The five percentage points of equity above the threshold change only variance, not expected profit.", "EQUITY_MARGIN_AS_VARIANCE"],
  },
  "PM-FND-07-TRC-104": {
    c: ["Взять долю блефов из исходного диапазона оппонента вместо расчёта текущей цены колла", "Use the bluff proportion of Villain's starting range instead of calculating the current call price", "STARTING_RANGE_AS_CALL_THRESHOLD"],
    r2: ["Порог колла задаёт размер банка до ставки оппонента; сама ставка ривера влияет на риск, но не на требуемую эквити.", "The call threshold comes from the pot before Villain bets; the river bet changes the risk but not required equity.", "RIVER_BET_OMITTED"],
    r3: ["На ривере можно компенсировать невыгодный колл будущим добором, поэтому текущая цена банка не задаёт порог.", "On the river an unfavorable call can be offset by later value extraction, so current pot odds do not set the threshold.", "NONEXISTENT_FUTURE_PAYOFF"],
  },
  "PM-FND-07-TRC-105": {
    c: ["Ориентироваться на число оставшихся аутов, не оценивая будущие выплаты и риски", "Use the remaining out count without estimating future payouts and risks", "OUTS_AS_FULL_BRANCH_EV"],
    r2: ["Потенциальный выигрыш на следующих улицах можно сразу прибавить к текущему банку как гарантированную выплату.", "Potential winnings on later streets can be added to the current pot as if those payments were guaranteed.", "IMPLIED_ODDS_GUARANTEED"],
    r3: ["Для оценки потенциального дополнительного выигрыша достаточно глубины стека: готовность оппонента оплатить сильную руку не меняет расчёт.", "Stack depth alone determines implied odds; whether Villain will actually pay off a strong hand does not affect the calculation.", "OPPONENT_PAYOFF_IGNORED"],
  },
  "PM-FND-07-TRC-106": {
    c: ["Сохранить расчёт будущих выплат, хотя после олл-ина новых ставок больше нет", "Keep the implied-odds estimate for later streets even though the all-in ends future betting", "NONEXISTENT_FUTURE_ODDS"],
    r2: ["Поскольку карты и текущая цена не изменились, прежний прогноз будущих оплат остаётся частью EV даже после олл-ина.", "Because the cards and current price are unchanged, projected future payoffs remain part of EV even after the all-in.", "OLD_FUTURE_TREE_CARRIED_OVER"],
    r3: ["Олл-ин меняет лишь размер обязательного платежа, но не устраняет необходимость учитывать будущие решения.", "An all-in changes only the committed payment, not the need to include future decisions in the calculation.", "TERMINAL_TREE_MISCLASSIFIED"],
  },
  "PM-FND-07-TRC-107": {
    c: ["Поднять требуемую эквити пропорционально размеру стека, не разбирая будущие ветки ставок", "Raise the equity threshold proportionally to stack depth without analyzing later betting branches", "STACK_DEPTH_AS_FIXED_THRESHOLD"],
    r2: ["Равные текущие шансы банка дают одинаковый итоговый EV при любом эффективном стеке.", "Equal immediate pot odds produce the same total EV at any effective stack depth.", "IMMEDIATE_PRICE_AS_FULL_EV"],
    r3: ["Дополнительный стек нужно учитывать только как потенциальный будущий выигрыш, не включая риск встречного крупного вэлью-бета.", "The extra stack should count only as potential winnings, without accounting for the risk of facing a large value bet.", "DEEP_REVERSE_IMPLIED_ODDS_IGNORED"],
  },

  "PM-BL-10-TRC-101": {
    c: ["Использовать общий перевес PFR над блайндами, считая SB и BB одним диапазоном защиты", "Use the PFR's general advantage over the blinds, treating SB and BB as one defending range", "BLINDS_RANGE_COLLAPSE"],
    r2: ["Одинаковая доска означает одинаковую структуру диапазонов колла SB и BB; сначала достаточно выбрать размер c-bet.", "The same flop gives SB and BB the same calling-range shape, so choosing a c-bet size is the first necessary step.", "SOURCE_RANGE_AS_IDENTICAL"],
    r3: ["Разница между SB и BB влияет на цену префлоп-колла, но не на долю сильных рук с королём или валетом в диапазоне, дошедшем до флопа.", "The SB-versus-BB distinction changes preflop call price but not the share of strong Kx/Jx in the range that reaches the flop.", "ARRIVING_RANGE_POSITION_IGNORED"],
  },
  "PM-BL-10-TRC-102": {
    c: ["Ставить крупно почти всем диапазоном, поскольку спаренная доска гарантирует фолды BB", "Use a large bet with nearly the whole range because a paired board guarantees BB folds", "FREQUENCY_AS_SIZE_AND_FOLD_EQUITY"],
    r2: ["На K-K-J широкий диапазон BB сильнее HJ, потому что BB защищает больше слабых рук с королём.", "On K-K-J the wide BB range is stronger than HJ because BB defends more weak Kx combinations.", "WEAK_KX_AS_RANGE_ADVANTAGE"],
    r3: ["Широкая защита BB почти не содержит рук с валетом и средних пар, поэтому большая ставка PFR получает автоматические фолды.", "BB's wide defense contains almost no Jx or middle pairs, so a large PFR bet generates automatic folds.", "WIDE_BB_CONTINUES_IGNORED"],
  },
  "PM-BL-10-TRC-103": {
    c: ["Сохранить BB-частоту c-bet и изменить только размер ставки против SB", "Keep the BB c-bet frequency and change only the bet size against SB", "SIZE_SUBSTITUTED_FOR_FREQUENCY"],
    r2: ["Перевес HJ по сильным бродвеям делает повышение частоты c-bet одинаково выгодным против SB и BB.", "HJ's strong broadway advantage makes a high c-bet frequency equally attractive versus SB and BB.", "PFR_ADVANTAGE_OVERGENERALIZED"],
    r3: ["Два короля на борде одинаково сокращают число рук с королём у SB и BB, поэтому разницей их исходных диапазонов можно пренебречь.", "Two kings on the board reduce SB and BB Kx combinations equally, so their different starting ranges can be ignored.", "BLOCKER_AS_RANGE_EQUALIZER"],
  },
  "PM-BL-10-TRC-104": {
    c: ["Ориентироваться только на натсовую часть PFR, не учитывая продолжения SB", "Look only at the PFR's nutted holdings without accounting for SB's continuing range", "PFR_NUTS_ONLY"],
    r2: ["Если у агрессора остаётся перевес по сильным комбинациям, изменение исходного диапазона коллера не меняет частоту c-bet.", "If the aggressor still holds a strong-combo advantage, changes to the caller's starting range do not affect c-bet frequency.", "ADVANTAGE_AS_FIXED_FREQUENCY"],
    r3: ["Одинаковый K-K-J удаляет у SB и BB одинаковую долю сильных продолжений независимо от того, с чем они коллировали префлоп.", "The same K-K-J board removes the same share of strong continues from SB and BB regardless of what they called preflop.", "BOARD_AS_RANGE_FILTER_EQUALIZER"],
  },
  "PM-BL-10-TRC-105": {
    c: ["Заменить SB-диапазон средним диапазоном BB без проверки того, какие классы рук оппонент расширил", "Replace SB's range with an average BB range without checking which hand classes this opponent added", "BB_RANGE_PROXY_OVERREACH"],
    r2: ["Повторяющиеся слишком широкие коллы не меняют предположение о диапазоне SB без подтверждения каждой руки на шоудауне.", "Repeated overly wide calls cannot change the SB range estimate until each holding has been verified at showdown.", "SHOWDOWN_CERTAINTY_REQUIRED"],
    r3: ["Если SB входит шире нормы, нужно автоматически перенести все частоты c-bet против BB, не проверяя состав его дополнительных рук.", "If SB enters wider than baseline, all BB c-bet frequencies should transfer automatically without checking the added hand classes.", "WIDE_SB_AS_BB_CLONE"],
  },
  "PM-W4-HAND-01-TRC-109": {
    c: ["Сравнить класс руки с верхом своего диапазона, не оценивая руки, которые коллируют рейз", "Compare the hand class with the top of Hero's own range without evaluating hands that call the raise", "OWN_RANGE_AS_VALUE_TARGET"],
    r2: ["Рука, сильная против полного диапазона оппонента, сохраняет ту же ценность, когда слабые руки фолдят на рейз.", "A hand strong against Villain's full range remains equally valuable when weaker hands fold to the raise.", "FULL_RANGE_AS_CONTINUE_RANGE"],
    r3: ["Фолды слабых рук сами по себе делают рейз вэлью-рейзом, даже когда продолжают преимущественно руки сильнее.", "Folds from weak hands make a raise a value raise by themselves, even when the continuing range is mostly stronger.", "FOLD_EQUITY_AS_VALUE_RAISE"],
  },
};
