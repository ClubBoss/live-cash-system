import type { PracticalDecision } from "./types";

// Final high-EV content delta: bounded extension of existing skill families
// (no new skills). Four topic areas:
//   - PM-FND-06-FINAL-1xx  geometric SPR two-street sizing execution
//   - PM-OOP-03-FINAL-1xx  facing a flop raise (re-filter after Hero's bet)
//   - PM-TURN-02-FINAL-1xx facing a turn raise (ancestry + evidence, sunk cost)
//   - PM-W4-BOARD-01-FINAL-1xx / PM-3BP-05-FINAL-1xx  monotone board transfer
// RU/EN authored inline; no separate publication-projection layer is needed
// for brand-new decisions (only existing raw records use that mechanism).

const o = (id: string, textRu: string, textEn: string, misconception?: string) => ({ id, textRu, textEn, misconception });

export const finalContentDeltaDecisions: PracticalDecision[] = [
  // ---------------------------------------------------------------------
  // GEOMETRY — FND-06 — geometric SPR two-street sizing execution
  // ---------------------------------------------------------------------
  {
    id: "PM-FND-06-FINAL-101", skillId: "FND-06", kind: "recognition", sourceRefs: ["FTGU-E01", "LCM-01"],
    assumptions: ["single-raised pot", "две улицы остаются после текущего действия", "тот же hand и board для сравнения"],
    cueRu: "Тот же hand и тот же board, только SPR другой, чем в прошлой раздаче.",
    cueEn: "Same hand and same board, only SPR differs from the previous hand.",
    questionRu: "Что должно поменяться вместе с SPR?",
    questionEn: "What should change together with SPR?",
    actionOptions: [
      o("a", "Семейство geometric sizes на оставшихся улицах", "The family of geometric sizes on the remaining streets"),
      o("b", "Ничего — sizing зависит только от board texture", "Nothing — sizing depends only on board texture", "SPR_IGNORED"),
      o("c", "Ничего — sizing зависит только от абсолютной силы руки", "Nothing — sizing depends only on absolute hand strength", "SIZE_DOGMA"),
    ],
    reasonOptions: [
      o("r1", "Remaining stack относительно pot задаёт объём ставок, нужный, чтобы естественно дойти до stacks на оставшихся улицах", "Remaining stack relative to pot sets the bet sizes needed to naturally reach the stacks on the remaining streets"),
      o("r2", "Sizing — просто визуальная привычка под board texture", "Sizing is simply a visual habit tied to board texture", "GEOMETRY_IGNORED"),
      o("r3", "Sizing определяется исключительно абсолютной силой руки", "Sizing is determined solely by absolute hand strength", "SIZE_DOGMA"),
    ],
    correctActionId: "a", correctReasonId: "r1", targetSeconds: 20,
    explanationRu: "LCM-01 связывает SPR с geometric size family на будущих улицах: тот же board с другим SPR требует другого объёма ставок для одного и того же plan довести деньги в stacks.",
    explanationEn: "LCM-01 links SPR with the geometric size family on future streets: the same board with a different SPR requires a different bet size for the same plan of getting the money into the stacks.",
  },
  {
    id: "PM-FND-06-FINAL-102", skillId: "FND-06", kind: "decision", sourceRefs: ["FTGU-E01", "LCM-01"],
    assumptions: ["SPR≈2 в момент действия", "Hero планирует stack-off plan на двух оставшихся улицах", "никакой точной solver-частоты"],
    cueRu: "SPR≈2, и Hero хочет распределить весь remaining stack примерно поровну между этой улицей и следующей.",
    cueEn: "SPR≈2, and Hero wants to spread the whole remaining stack roughly evenly between this street and the next one.",
    questionRu: "Какой класс sizing естественно доводит Hero до stacks на двух улицах?",
    questionEn: "Which sizing class naturally gets Hero to the stacks over two streets?",
    actionOptions: [
      o("a", "Класс b60/b60 — примерно 60% pot на каждой из двух улиц", "The b60/b60 class — roughly 60% pot on each of the two streets"),
      o("b", "Класс pot/pot — 100% pot на каждой улице", "The pot/pot class — 100% pot on each street", "SIZE_MEMORIZED"),
      o("c", "Минимальные блокирующие ставки — около 20–25% pot", "Minimal blocking bets — roughly 20–25% pot", "DEPTH_IGNORED"),
    ],
    reasonOptions: [
      o("r1", "При SPR≈2 доля pot, нужная на каждой из двух улиц, — около 60%, чтобы суммарный объём двух ставок примерно закрыл remaining stack", "At SPR≈2 the pot fraction needed on each of the two streets is roughly 60%, so the combined size of the two bets roughly closes the remaining stack"),
      o("r2", "Класс pot/pot универсален для любого SPR", "The pot/pot class is universal for any SPR", "SIZE_DOGMA"),
      o("r3", "Маленький sizing всегда безопаснее вне зависимости от SPR", "A small sizing is always safer regardless of SPR", "DEPTH_IGNORED"),
    ],
    correctActionId: "a", correctReasonId: "r1", targetSeconds: 25,
    explanationRu: "FTGU-E01/LCM-01 geometry: примерно b60/b60 соответствует SPR≈2, тогда как pot/pot соответствует куда большему SPR≈4. Это execution anchor, не обязательный sizing.",
    explanationEn: "FTGU-E01/LCM-01 geometry: roughly b60/b60 corresponds to SPR≈2, while pot/pot corresponds to a much larger SPR≈4. This is an execution anchor, not a mandatory sizing.",
  },
  {
    id: "PM-FND-06-FINAL-103", skillId: "FND-06", kind: "decision", sourceRefs: ["FTGU-E01", "LCM-01"],
    assumptions: ["SPR≈4 в момент действия", "Hero планирует stack-off plan на двух оставшихся улицах", "никакой точной solver-частоты"],
    cueRu: "SPR≈4, тот же план — довести деньги в stacks за две оставшиеся улицы.",
    cueEn: "SPR≈4, the same plan — get the money into the stacks over the two remaining streets.",
    questionRu: "Какой класс sizing здесь ближе к нужной geometry?",
    questionEn: "Which sizing class is closer to the required geometry here?",
    actionOptions: [
      o("a", "Класс pot/pot — примерно 100% pot на каждой улице", "The pot/pot class — roughly 100% pot on each street"),
      o("b", "Класс b60/b60, как при SPR≈2", "The b60/b60 class, as at SPR≈2", "SIZE_MEMORIZED"),
      o("c", "Полный олл-ин уже на этой улице", "A full all-in already on this street", "DEPTH_MISREAD"),
    ],
    reasonOptions: [
      o("r1", "При SPR≈4 нужная доля pot на каждой из двух улиц — около 100%; b60/b60 подходит только для куда меньшего SPR", "At SPR≈4 the required pot fraction on each of the two streets is roughly 100%; b60/b60 fits a much smaller SPR"),
      o("r2", "Один и тот же класс sizing подходит любому SPR", "One and the same sizing class fits any SPR", "SIZE_DOGMA"),
      o("r3", "SPR≈4 — это уже олл-ин глубина сама по себе", "SPR≈4 is already all-in depth by itself", "DEPTH_MISREAD"),
    ],
    correctActionId: "a", correctReasonId: "r1", targetSeconds: 25,
    explanationRu: "FTGU-E01/LCM-01 geometry: примерно pot/pot соответствует SPR≈4. Больший SPR требует большую долю pot на каждой улице, чтобы естественно дойти до stacks за два действия.",
    explanationEn: "FTGU-E01/LCM-01 geometry: roughly pot/pot corresponds to SPR≈4. A larger SPR requires a larger pot fraction on each street to naturally reach the stacks in two actions.",
  },
  {
    id: "PM-FND-06-FINAL-104", skillId: "FND-06", kind: "changed", sourceRefs: ["FTGU-E01", "LCM-01"],
    assumptions: ["тот же pot в двух сравнениях", "remaining stack удваивается", "двухуличный stack-off plan"],
    cueRu: "Тот же pot; remaining stack удваивается от одного сравнения к другому.",
    cueEn: "Same pot; the remaining stack doubles from one comparison to the other.",
    questionRu: "Куда двигается доля pot, нужная на каждой из двух улиц?",
    questionEn: "Which way does the required pot fraction on each of the two streets move?",
    actionOptions: [
      o("a", "Вверх — нужна большая доля pot на каждой улице", "Up — a larger pot fraction is needed on each street"),
      o("b", "Вниз — меньший remaining stack требует меньшего sizing", "Down — a smaller remaining stack requires smaller sizing", "SPR_BACKWARDS"),
      o("c", "Не меняется — pot тот же, значит sizing тот же", "It stays the same — the pot is unchanged, so sizing is unchanged", "POT_IGNORED"),
    ],
    reasonOptions: [
      o("r1", "Больший remaining stack при том же pot повышает SPR, а более высокий SPR требует большую двухуличную долю pot", "A larger remaining stack at the same pot raises SPR, and a higher SPR requires a larger two-street pot fraction"),
      o("r2", "SPR зависит только от pot, а не от stack", "SPR depends only on the pot, not on the stack", "SPR_BACKWARDS"),
      o("r3", "Sizing связан только с board texture", "Sizing is tied only to board texture", "POT_IGNORED"),
    ],
    correctActionId: "a", correctReasonId: "r1", targetSeconds: 22,
    explanationRu: "Это базовая geometry: удвоение remaining stack при том же pot удваивает SPR, а execution anchors показывают, что x растёт вместе с SPR (например, с ≈0.62 до ≈1.00).",
    explanationEn: "This is basic geometry: doubling the remaining stack at the same pot doubles SPR, and the execution anchors show that x rises together with SPR (for example, from ≈0.62 to ≈1.00).",
    changedVariables: ["effective_stack", "spr"],
  },
  {
    id: "PM-FND-06-FINAL-105", skillId: "FND-06", kind: "boundary", sourceRefs: ["FTGU-E01", "LCM-01"],
    assumptions: ["SPR≈3 в момент действия", "у Hero нет nut advantage и нет worse continuing hands, готовых платить"],
    cueRu: "SPR≈3 отлично подходит под geometric two-street plan, но у Hero нет nut advantage, и нет worse hands, готовых платить выбранный sizing.",
    cueEn: "SPR≈3 fits a geometric two-street plan nicely, but Hero has no nut advantage and no worse hands that would pay the chosen sizing.",
    questionRu: "Значит ли подходящий SPR, что здесь нужно ставить?",
    questionEn: "Does a suitable SPR mean Hero should bet here?",
    actionOptions: [
      o("a", "Нет — geometry задаёт размер IF есть strategic reason ставить, а не сам reason", "No — the geometry sets the size IF there is a strategic reason to bet, not the reason itself"),
      o("b", "Да — подходящий SPR сам по себе достаточная причина ставить", "Yes — a suitable SPR is itself sufficient reason to bet", "GEOMETRY_AS_REASON"),
      o("c", "Да — раз sizing естественно доводит до stacks, стек-офф всегда оправдан", "Yes — since the sizing naturally reaches the stacks, stacking off is always justified", "STACKOFF_AUTOPILOT"),
    ],
    reasonOptions: [
      o("r1", "Range/nut ownership и hand role решают, нужно ли вообще ставить; geometry только описывает, каким должен быть sizing после этого решения", "Range/nut ownership and hand role decide whether to bet at all; geometry only describes what the sizing should be after that decision"),
      o("r2", "Любой подходящий SPR создаёт причину для агрессии", "Any suitable SPR creates a reason for aggression", "GEOMETRY_AS_REASON"),
      o("r3", "Sizing family сам создаёт fold equity против любого range", "The sizing family itself creates fold equity against any range", "STACKOFF_AUTOPILOT"),
    ],
    correctActionId: "a", correctReasonId: "r1", targetSeconds: 28,
    explanationRu: "Boundary: overbet/geometric sizing — это distribution stack по улицам, а не сама по себе fancy aggression. Без nut advantage или value target подходящая geometry не создаёт reason для ставки.",
    explanationEn: "Boundary: overbet/geometric sizing is a way of distributing the stack across streets, not fancy aggression by itself. Without a nut advantage or a value target, a suitable geometry does not create a reason to bet.",
  },
  {
    id: "PM-FND-06-FINAL-106", skillId: "FND-06", kind: "changed", sourceRefs: ["FTGU-E01", "LCM-01"],
    assumptions: ["200bb стартовый depth", "preflop и flop action уже сжали remaining stack", "к терну current SPR≈2"],
    cueRu: "Раздача началась на 200bb, но preflop и flop action уже сжали remaining stack; к терну current SPR≈2.",
    cueEn: "The hand started at 200bb, but preflop and flop action already compressed the remaining stack; by the turn, current SPR≈2.",
    questionRu: "Какой SPR должен определять двухуличный sizing plan на терне?",
    questionEn: "Which SPR should determine the two-street sizing plan on the turn?",
    actionOptions: [
      o("a", "Current SPR≈2 в этот момент", "Current SPR≈2 at this point"),
      o("b", "Headline 200bb стартовый depth", "The headline 200bb starting depth", "NOMINAL_STACK_ONLY"),
      o("c", "Среднее между стартовым depth и current SPR", "An average between the starting depth and current SPR", "DEPTH_MISREAD"),
    ],
    reasonOptions: [
      o("r1", "Geometry строится на remaining stack и pot прямо сейчас, а не на том, сколько было в начале раздачи", "Geometry is built on the remaining stack and pot right now, not on how much was there at the start of the hand"),
      o("r2", "200bb стартовый depth гарантирует много будущих улиц вне зависимости от action", "A 200bb starting depth guarantees many future streets regardless of the action", "NOMINAL_STACK_ONLY"),
      o("r3", "Sizing plan должен усреднять весь путь раздачи", "The sizing plan should average the whole path of the hand", "DEPTH_MISREAD"),
    ],
    correctActionId: "a", correctReasonId: "r1", targetSeconds: 26,
    explanationRu: "LCM-01: nominal 200bb — не рабочая geometry. Preflop/flop action уже сжал remaining stack до SPR≈2, и именно current SPR (execution anchor ≈0.62, класс b60/b60) должен вести двухуличный plan на терне.",
    explanationEn: "LCM-01: a nominal 200bb is not the working geometry. Preflop/flop action already compressed the remaining stack to SPR≈2, and it is the current SPR (execution anchor ≈0.62, the b60/b60 class) that should drive the two-street plan on the turn.",
    changedVariables: ["effective_stack", "spr"],
  },

  // ---------------------------------------------------------------------
  // FACING FLOP RAISE — OOP-03 — re-filter after Hero's own flop bet is raised
  // ---------------------------------------------------------------------
  {
    id: "PM-OOP-03-FINAL-101", skillId: "OOP-03", kind: "boundary", sourceRefs: ["FTGU-E09", "FTGU-E10"],
    assumptions: ["Hero c-bet flop и получил raise", "learner слышит один universal slogan про flop raises"],
    cueRu: "Hero c-bet flop и получил raise. Learner хочет применить один universal slogan: любой flop raise — это всегда сильно.",
    cueEn: "Hero c-bet the flop and got raised. The learner wants to apply one universal slogan: any flop raise is always strong.",
    questionRu: "Это верный подход?",
    questionEn: "Is that approach correct?",
    actionOptions: [
      o("a", "Нет — состав raising range зависит от размера c-bet и board", "No — the raising range's composition depends on the c-bet size and the board"),
      o("b", "Да — raise почти никогда не бывает bluff-heavy", "Yes — a raise is almost never bluff-heavy", "RAISE_ALWAYS_STRONG"),
      o("c", "Да — маленький c-bet всегда получает более сильный raising range, чем крупный", "Yes — a small c-bet always draws a stronger raising range than a large one", "SIZE_RESPONSE_BACKWARDS"),
    ],
    reasonOptions: [
      o("r1", "Raise против tiny/частого c-bet может приходить из более широкого региона, чем raise против крупного/selective c-bet, а board решает, насколько board-owner может блефовать", "A raise against a tiny/frequent c-bet can come from a wider region than a raise against a large/selective c-bet, and the board decides how much the board-owner can bluff"),
      o("r2", "Raising range всегда одна и та же вне зависимости от sizing", "The raising range is always the same regardless of sizing", "SIZE_RESPONSE_BACKWARDS"),
      o("r3", "Только absolute hand strength Hero решает branch", "Only Hero's absolute hand strength decides the branch", "ABSOLUTE_HAND_ONLY"),
    ],
    correctActionId: "a", correctReasonId: "r1", targetSeconds: 28,
    explanationRu: "FTGU-E09/E10: raising range строится по urgency и board ownership, а не по одному universal ярлыку 'raise = сила'. Условная структура заменяет лозунг.",
    explanationEn: "FTGU-E09/E10: the raising range is built from urgency and board ownership, not one universal 'raise equals strength' label. Conditional structure replaces the slogan.",
  },
  {
    id: "PM-OOP-03-FINAL-102", skillId: "OOP-03", kind: "changed", sourceRefs: ["FTGU-E09", "FTGU-E10"],
    assumptions: ["тот же hand/board/opponent в двух сравнениях", "Hero c-bet flop и получает raise"],
    cueRu: "Тот же hand, board и opponent; меняется только размер c-bet Hero — с малого до крупного, и оба раза Hero получает raise.",
    cueEn: "Same hand, board and opponent; only Hero's c-bet size changes — from small to large — and both times Hero gets raised.",
    questionRu: "Что должно измениться в оценке raising range после этой смены?",
    questionEn: "What should change in the assessment of the raising range after this switch?",
    actionOptions: [
      o("a", "Состав raising range — против малого c-bet он обычно шире и мягче, против крупного — более узкий и сильный", "The raising range's composition — against a small c-bet it is usually wider and softer, against a large one it is narrower and stronger"),
      o("b", "Ничего — raise есть raise вне зависимости от предыдущего sizing", "Nothing — a raise is a raise regardless of the previous sizing", "SIZE_IGNORED"),
      o("c", "Только pot odds на call, urgency raising range не меняется", "Only the pot odds for calling; the raising range's urgency does not change", "SIZE_IGNORED"),
    ],
    reasonOptions: [
      o("r1", "Размер c-bet — часть branch: он меняет и то, кто продолжает как raiser, и насколько эта range полярна", "The c-bet size is part of the branch: it changes both who continues as the raiser and how polar that range is"),
      o("r2", "Opponent raising range фиксирован заранее и не зависит от Hero sizing", "The opponent's raising range is fixed in advance and independent of Hero's sizing", "SIZE_IGNORED"),
      o("r3", "Только absolute hand Hero имеет значение после raise", "Only Hero's absolute hand matters after a raise", "ABSOLUTE_HAND_ONLY"),
    ],
    correctActionId: "a", correctReasonId: "r1", targetSeconds: 26,
    explanationRu: "FTGU-E09/E10: c-bet size — часть node identity. Raise против high-frequency малого c-bet и raise против selective крупного c-bet приходят из разных regions, даже с тем же hand/board/opponent.",
    explanationEn: "FTGU-E09/E10: the c-bet size is part of the node identity. A raise against a high-frequency small c-bet and a raise against a selective large c-bet come from different regions, even with the same hand/board/opponent.",
    changedVariables: ["bet_size", "raising_range_shape"],
  },
  {
    id: "PM-OOP-03-FINAL-103", skillId: "OOP-03", kind: "changed", sourceRefs: ["FTGU-E09", "FTGU-E10"],
    assumptions: ["тот же hand, sizing и opponent в двух сравнениях", "Hero c-bet и получает raise на разных board"],
    cueRu: "Тот же hand, тот же sizing, тот же opponent; board меняется с dry high-card на low connected, и оба раза Hero получает raise.",
    cueEn: "Same hand, same sizing, same opponent; the board changes from dry high-card to low connected, and both times Hero gets raised.",
    questionRu: "Как board ownership влияет на то, насколько сильной может быть эта raising range?",
    questionEn: "How does board ownership affect how legitimately strong this raising range can be?",
    actionOptions: [
      o("a", "Low connected board поддерживает больше действительно сильных raises, чем dry high board, где регион, благоприятный для коллера, меньше", "A low connected board supports more genuinely strong raises than a dry high board, where the caller-friendly region is smaller"),
      o("b", "Board texture не влияет на raising range — влияет только сам факт raise", "Board texture does not affect the raising range — only the fact of the raise matters", "BOARD_IGNORED"),
      o("c", "Dry high board всегда даёт более сильный raising range, чем low connected", "A dry high board always gives a stronger raising range than a low connected one", "BOARD_LABEL_SHORTCUT"),
    ],
    reasonOptions: [
      o("r1", "Board ownership определяет, у кого реально есть strong made hands и combo draws для полярного/merged raise; caller-friendly board расширяет этот регион", "Board ownership determines who genuinely has strong made hands and combo draws for a polar/merged raise; a caller-friendly board widens that region"),
      o("r2", "Board — просто визуальный ярлык без влияния на range", "The board is just a visual label without influence on the range", "BOARD_IGNORED"),
      o("r3", "Высокие карты всегда создают больше strong hands, чем низкие", "High cards always create more strong hands than low cards", "BOARD_LABEL_SHORTCUT"),
    ],
    correctActionId: "a", correctReasonId: "r1", targetSeconds: 28,
    explanationRu: "FTGU-E09/E10: board ownership — часть raise construction. Low/connected boards чаще caller-friendly и поддерживают больше действительно сильных raises, чем dry high boards.",
    explanationEn: "FTGU-E09/E10: board ownership is part of raise construction. Low/connected boards are more often caller-friendly and support more legitimately strong raises than dry high boards.",
    changedVariables: ["board_class", "raiser_range_ownership"],
  },
  {
    id: "PM-OOP-03-FINAL-104", skillId: "OOP-03", kind: "changed", sourceRefs: ["FTGU-E09", "FTGU-E10", "SLC-CHECK-RAISE"],
    assumptions: ["тот же hand/board/sizing в двух сравнениях", "меняется только собранный профиль opponent"],
    cueRu: "Тот же hand, board и sizing. В одном случае opponent — unknown/aggressive; в другом — тот же branch, но собранный профиль показывает passive underbluffer с малым количеством bluff raises.",
    cueEn: "Same hand, board and sizing. In one case the opponent is unknown/aggressive; in the other, the same branch, but the collected profile shows a passive underbluffer with few bluff raises.",
    questionRu: "Как должен сдвинуться continuing region Hero против passive underbluffer?",
    questionEn: "How should Hero's continuing region shift against a passive underbluffer?",
    actionOptions: [
      o("a", "Заметно уже — bluff-catchers и marginal continues теряют ценность против range с малым числом bluffs", "Materially tighter — bluff-catchers and marginal continues lose value against a range with few bluffs"),
      o("b", "Не меняется — один и тот же branch должен разыгрываться одинаково", "It does not change — the same branch should be played identically", "PROFILE_IGNORED"),
      o("c", "Шире — против passive opponent всегда стоит continue больше рук", "Wider — against a passive opponent it always pays to continue more hands", "PASSIVE_ALWAYS_WEAKER"),
    ],
    reasonOptions: [
      o("r1", "Continuing region строится против actual bluff supply; собранный branch-specific профиль passive underbluffer снижает число реальных bluffs и делает marginal continues менее прибыльными", "The continuing region is built against the actual bluff supply; a collected branch-specific passive-underbluffer profile lowers the real bluff count and makes marginal continues less profitable"),
      o("r2", "Один наблюдённый case уже доказывает permanent player label", "One observed case already proves a permanent player label", "EVIDENCE_OVERGENERALIZED"),
      o("r3", "Profile opponent не связан с bluff supply в этом branch", "The opponent's profile is unrelated to the bluff supply in this branch", "PROFILE_IGNORED"),
    ],
    correctActionId: "a", correctReasonId: "r1", targetSeconds: 28,
    explanationRu: "Branch-specific наблюдения материально сдвигают continuing threshold: passive underbluffer оставляет меньше real bluffs в raising range, и marginal bluff-catchers становится менее выгодно коллировать.",
    explanationEn: "Branch-specific observations materially shift the continuing threshold: a passive underbluffer leaves fewer real bluffs in the raising range, and marginal bluff-catchers become less profitable calls.",
    changedVariables: ["opponent_profile", "bluff_supply"],
  },

  // ---------------------------------------------------------------------
  // FACING TURN RAISE — TURN-02 — ancestry + evidence, sunk cost is not equity
  // ---------------------------------------------------------------------
  {
    id: "PM-TURN-02-FINAL-101", skillId: "TURN-02", kind: "recognition", sourceRefs: ["FTGU-E21", "SLC-TURN-BARREL"],
    assumptions: ["Hero c-bet flop, получил call, поставил turn bet и получил raise", "источник — surviving flop-call range, не preflop range"],
    cueRu: "Hero c-bet flop, получил call, поставил turn bet и получил raise.",
    cueEn: "Hero c-bet the flop, got called, bet the turn and got raised.",
    questionRu: "С какого range нужно начинать разбор raising range на терне?",
    questionEn: "Which range should the turn raising-range analysis start from?",
    actionOptions: [
      o("a", "С range, который реально пережил flop call, а не с исходного preflop range", "The range that actually survived the flop call, not the original preflop range"),
      o("b", "С исходного preflop opening range целиком", "The original preflop opening range as a whole", "ANCESTRY_IGNORED"),
      o("c", "С absolute hand Hero без учёта opponent range вообще", "Hero's absolute hand without considering the opponent's range at all", "RANGE_HISTORY_IGNORED"),
    ],
    reasonOptions: [
      o("r1", "Flop call уже отфильтровал preflop range; только пережившие этот call hands могут дальше raise turn bet", "The flop call already filtered the preflop range; only the hands that survived that call can go on to raise the turn bet"),
      o("r2", "Preflop identity сама решает turn action", "Preflop identity by itself decides the turn action", "ANCESTRY_IGNORED"),
      o("r3", "История улиц не влияет на текущий node", "Street history does not affect the current node", "RANGE_HISTORY_IGNORED"),
    ],
    correctActionId: "a", correctReasonId: "r1", targetSeconds: 25,
    explanationRu: "FTGU-E21: later-street classes контекстны. Raising range на терне строится из hands, реально переживших flop call, а не из исходного preflop range.",
    explanationEn: "FTGU-E21: later-street classes are contextual. The turn raising range is built from hands that actually survived the flop call, not from the original preflop range.",
  },
  {
    id: "PM-TURN-02-FINAL-102", skillId: "TURN-02", kind: "changed", sourceRefs: ["FTGU-E21", "SLC-TURN-BARREL"],
    assumptions: ["тот же hand и sizing в двух сравнениях", "меняется только собранный профиль opponent"],
    cueRu: "Тот же hand и sizing на терне. В одном случае opponent — доказанный aggressive raiser с историей turn raises; в другом — тот же branch, но собранный профиль показывает passive underbluffer.",
    cueEn: "Same hand and sizing on the turn. In one case the opponent is a proven aggressive raiser with a history of turn raises; in the other, the same branch, but the collected profile shows a passive underbluffer.",
    questionRu: "Как должен сдвинуться Hero response против passive underbluffer?",
    questionEn: "How should Hero's response shift against the passive underbluffer?",
    actionOptions: [
      o("a", "Заметно уже — меньше bluff-catchers продолжают против range с малым числом natural bluffs", "Materially tighter — fewer bluff-catchers continue against a range with few natural bluffs"),
      o("b", "Одинаково в обоих случаях — sizing и hand те же", "The same in both cases — the sizing and hand are unchanged", "PROFILE_IGNORED"),
      o("c", "Шире — против passive opponent Hero всегда должен continue больше", "Wider — against a passive opponent Hero should always continue more", "PASSIVE_ALWAYS_WEAKER"),
    ],
    reasonOptions: [
      o("r1", "Branch-specific профиль напрямую меняет natural bluff supply в raising range; меньше bluffs — тем уже continuing region при той же цене", "A branch-specific profile directly changes the natural bluff supply in the raising range; fewer bluffs mean a tighter continuing region at the same price"),
      o("r2", "Player profile — отдельный фактор, не связанный с composition raising range", "Player profile is a separate factor unrelated to the raising range's composition", "PROFILE_IGNORED"),
      o("r3", "Passive style гарантирует меньше value в raising range", "A passive style guarantees less value in the raising range", "PASSIVE_ALWAYS_WEAKER"),
    ],
    correctActionId: "a", correctReasonId: "r1", targetSeconds: 28,
    explanationRu: "Тот же sizing и hand, но противоположный branch-specific профиль оппонента материально меняет natural bluff supply, а значит и требуемый continuing threshold.",
    explanationEn: "The same sizing and hand, but an opposite branch-specific opponent profile materially changes the natural bluff supply, and therefore the required continuing threshold.",
    changedVariables: ["opponent_profile", "bluff_supply"],
  },
  {
    id: "PM-TURN-02-FINAL-103", skillId: "TURN-02", kind: "changed", sourceRefs: ["FTGU-E21", "SLC-TURN-BARREL"],
    assumptions: ["тот же flop call range в двух сравнениях", "меняется только turn card"],
    cueRu: "Тот же flop call; на терне приходит либо brick card, либо card, которая materially чинит caller range (completing draw / uncapping strong region).",
    cueEn: "Same flop call; the turn brings either a brick card or a card that materially repairs the caller's range (completing a draw / uncapping a strong region).",
    questionRu: "Как turn card влияет на то, насколько 'страшным' может быть raise?",
    questionEn: "How does the turn card affect how threatening a raise can be?",
    actionOptions: [
      o("a", "Repair card делает raising range заметно сильнее и полярнее, чем brick", "A repair card makes the raising range materially stronger and more polar than a brick"),
      o("b", "Turn card не влияет — raise есть raise", "The turn card does not matter — a raise is a raise", "RUNOUT_IGNORED"),
      o("c", "Brick card всегда опаснее, потому что его 'не ждали'", "A brick card is always more dangerous because it was 'not expected'", "SURPRISE_EQUALS_STRENGTH"),
    ],
    reasonOptions: [
      o("r1", "Карта, которая закрывает draw или снимает cap с caller range, добавляет реальные strong hands и natural bluffs в raising range; brick этого не делает", "A card that completes a draw or uncaps the caller's region adds genuine strong hands and natural bluffs to the raising range; a brick does not"),
      o("r2", "Turn card влияет только на pot size, не на range composition", "The turn card affects only the pot size, not the range composition", "RUNOUT_IGNORED"),
      o("r3", "Неожиданная карта сама по себе создаёт strength", "An unexpected card creates strength by itself", "SURPRISE_EQUALS_STRENGTH"),
    ],
    correctActionId: "a", correctReasonId: "r1", targetSeconds: 27,
    explanationRu: "FTGU-E21: runout class меняет surviving range. Repair-турн уносит caller-range в сторону nutted/strong region; brick-турн этого не делает — raise против brick заслуживает больше подозрения.",
    explanationEn: "FTGU-E21: the runout class changes the surviving range. A repair turn shifts the caller's range toward a nutted/strong region; a brick turn does not — a raise against a brick deserves more suspicion.",
    changedVariables: ["turn_card", "caller_range_repair"],
  },
  {
    id: "PM-TURN-02-FINAL-104", skillId: "TURN-02", kind: "boundary", sourceRefs: ["FTGU-E21", "SLC-TURN-BARREL"],
    assumptions: ["Hero уже вложил крупный call на flop и bet на turn", "текущий SPR делает продолжение против raise дорогим"],
    cueRu: "Hero уже вложил крупный call на flop и bet на терне; теперь raise на терне делает продолжение особенно дорогим при текущем SPR.",
    cueEn: "Hero already committed a large call on the flop and a bet on the turn; now the turn raise makes continuing especially expensive at the current SPR.",
    questionRu: "Оправдывают ли уже вложенные фишки более широкий continuing range здесь?",
    questionEn: "Do the chips Hero already committed justify a wider continuing range here?",
    actionOptions: [
      o("a", "Нет — решение зависит от текущей range и price, а не от того, сколько уже вложено", "No — the decision depends on the current range and price, not on how much is already committed"),
      o("b", "Да — крупный prior investment обязывает продолжать", "Yes — a large prior investment obligates Hero to continue", "SUNK_COST_AS_EQUITY"),
      o("c", "Да — иначе прошлые ставки 'пропадают зря'", "Yes — otherwise the earlier bets are 'wasted'", "SUNK_COST_AS_EQUITY"),
    ],
    reasonOptions: [
      o("r1", "Уже вложенные фишки — sunk cost; они не equity, и решение продолжать зависит только от текущей surviving range соперника и цены call прямо сейчас", "Chips already committed are a sunk cost; they are not equity, and the decision to continue depends only on the opponent's current surviving range and the price of the call right now"),
      o("r2", "Больше вложенных фишек означает больше equity в текущей раздаче", "More committed chips mean more equity in the current hand", "SUNK_COST_AS_EQUITY"),
      o("r3", "Investment ceiling автоматически превращает fold в ошибку", "The investment ceiling automatically turns a fold into a mistake", "SUNK_COST_AS_EQUITY"),
    ],
    correctActionId: "a", correctReasonId: "r1", targetSeconds: 30,
    explanationRu: "Boundary: sunk cost не equity. Prior investment не входит в текущий расчёт цены/range; иначе identical spot неверно разыгрывается по-разному только из-за истории раздачи.",
    explanationEn: "Boundary: sunk cost is not equity. Prior investment does not enter the current price/range calculation; otherwise an identical spot would be incorrectly played differently purely because of the hand's history.",
  },

  // ---------------------------------------------------------------------
  // MONOTONE BOARD TRANSFER — W4-BOARD-01 (+ one 3BP-05 changed-node)
  // ---------------------------------------------------------------------
  {
    id: "PM-W4-BOARD-01-FINAL-101", skillId: "W4-BOARD-01", kind: "recognition", sourceRefs: ["FTGU-E07", "SLC-SRP-BOARD-CLASSES"],
    assumptions: ["board меняется с rainbow high на monotone high при тех же preflop roles"],
    cueRu: "Тот же preflop role на обеих раздачах; board меняется с K83 rainbow на K♠8♠3♠ monotone.",
    cueEn: "Same preflop role in both hands; the board changes from K83 rainbow to K♠8♠3♠ monotone.",
    questionRu: "Что первым делом должен пересчитать Hero на monotone board?",
    questionEn: "What should Hero first recompute on a monotone board?",
    actionOptions: [
      o("a", "Распределение flush/nut potential и то, кто держит one-card-suit holdings", "The flush/nut potential distribution and who holds one-card-suit holdings"),
      o("b", "Ничего — board class один и тот же 'high card', suits не важны", "Nothing — the board class is still the same 'high card', suits do not matter", "SUIT_IGNORED"),
      o("c", "Только absolute hand rank Hero, без учёта suits вообще", "Only Hero's absolute hand rank, without considering suits at all", "SUIT_IGNORED"),
    ],
    reasonOptions: [
      o("r1", "Monotone board материально меняет nut distribution: flush и near-flush combos становятся частью nut region, а marginal made hands становятся менее comfortable для крупного pot", "A monotone board materially changes the nut distribution: flush and near-flush combos become part of the nut region, and marginal made hands become less comfortable building a large pot"),
      o("r2", "Один suit на board не меняет combinatorics ranges", "One suit on the board does not change range combinatorics", "SUIT_IGNORED"),
      o("r3", "High card texture сама по себе решает range advantage вне зависимости от suits", "High-card texture by itself decides range advantage regardless of suits", "BOARD_LABEL_SHORTCUT"),
    ],
    correctActionId: "a", correctReasonId: "r1", targetSeconds: 25,
    explanationRu: "SLC-SRP-BOARD-CLASSES: monotone — отдельный board class. Nut distribution сдвигается к flush combos, и marginal value чаще предпочитает меньший pot, чем на rainbow того же high-card label.",
    explanationEn: "FTGU-E07/SLC-SRP-BOARD-CLASSES: monotone is a distinct board class. The nut distribution shifts toward flush combos, and marginal value more often prefers a smaller pot than on a rainbow board with the same high-card label.",
    changedVariables: ["board_class", "nut_distribution"],
  },
  {
    id: "PM-W4-BOARD-01-FINAL-102", skillId: "W4-BOARD-01", kind: "boundary", sourceRefs: ["FTGU-E07", "SLC-SRP-BOARD-CLASSES"],
    assumptions: ["learner слышит 'monotone' и применяет один universal ярлык ко всем nodes"],
    cueRu: "Learner слышит слово 'monotone' и решает: на любом monotone board правильный default — всегда check.",
    cueEn: "The learner hears the word 'monotone' and decides: on any monotone board the correct default is always to check.",
    questionRu: "Это верная эвристика?",
    questionEn: "Is that a correct heuristic?",
    actionOptions: [
      o("a", "Нет — checking incentive обычно растёт, но small-bet линии и action по-прежнему зависят от того, какие диапазоны реально дошли до этой улицы, и от role", "No — the checking incentive usually rises, but small-bet lines and action still depend on which ranges genuinely reached this street and on role"),
      o("b", "Да — monotone board полностью исключает betting", "Yes — a monotone board completely rules out betting", "LABEL_AS_LAW"),
      o("c", "Да — единственная 'безопасная' линия здесь — check-fold", "Yes — the only 'safe' line here is check-fold", "LABEL_AS_LAW"),
    ],
    reasonOptions: [
      o("r1", "Monotone поднимает checking incentive во многих nodes, но role, preflop-range advantage и то, кто реально владеет flush region, по-прежнему определяют, где small-bet или value line сохраняют смысл", "Monotone raises the checking incentive in many nodes, but role, preflop range advantage and who genuinely owns the flush region still determine where a small-bet or value line still makes sense"),
      o("r2", "Одно слово 'monotone' полностью определяет всю strategy", "The single word 'monotone' fully determines the whole strategy", "LABEL_AS_LAW"),
      o("r3", "Suit texture отменяет необходимость range analysis", "Suit texture eliminates the need for range analysis", "LABEL_AS_STRATEGY"),
    ],
    correctActionId: "a", correctReasonId: "r1", targetSeconds: 28,
    explanationRu: "Boundary: 'monotone = всегда check' — неверно. Класс board меняет distribution и incentives, но не заменяет разбор того, какие диапазоны реально дошли до этой улицы, и role в конкретном node.",
    explanationEn: "Boundary: 'monotone equals always check' is wrong. The board class changes the distribution and incentives, but it does not replace analyzing the actual arriving ranges and role at the specific node.",
  },
  {
    id: "PM-3BP-05-FINAL-101", skillId: "3BP-05", kind: "changed", sourceRefs: ["FTGU-E28", "FTGU-E29"],
    assumptions: ["тот же 3BP role и preflop history в двух сравнениях", "board меняется с rainbow high на monotone high"],
    cueRu: "Тот же 3-bet-pot role и та же preflop history; board меняется с rainbow high на monotone high.",
    cueEn: "Same 3-bet-pot role and the same preflop history; the board changes from rainbow high to monotone high.",
    questionRu: "Как меняется license на широкий small-bet range при этом переходе?",
    questionEn: "How does the license for a wide small-bet range change with this shift?",
    actionOptions: [
      o("a", "Сужается — nut region смещается к flush combos, и часть prior small-bet candidates теряет comfortable protection", "It narrows — the nut region shifts toward flush combos, and part of the prior small-bet candidates lose comfortable protection"),
      o("b", "Не меняется — 3BP role уже зафиксировал strategy заранее", "It does not change — the 3BP role already fixed the strategy in advance", "BOARD_IGNORED"),
      o("c", "Расширяется — monotone board всегда даёт большему числу hands nut status", "It widens — a monotone board always gives more hands nut status", "BOARD_LABEL_SHORTCUT"),
    ],
    reasonOptions: [
      o("r1", "3BP role задаёт preflop identity, но nut ownership и small-bet license по-прежнему пересчитываются под board class; monotone сдвигает часть nut region к flush combos", "The 3BP role sets preflop identity, but nut ownership and the small-bet license are still recomputed for the board class; monotone shifts part of the nut region to flush combos"),
      o("r2", "Board никогда не меняет 3-bet-pot role trees", "The board never changes 3-bet-pot role trees", "BOARD_IGNORED"),
      o("r3", "Suit texture автоматически расширяет nut region для агрессора", "Suit texture automatically widens the nut region for the aggressor", "BOARD_LABEL_SHORTCUT"),
    ],
    correctActionId: "a", correctReasonId: "r1", targetSeconds: 28,
    explanationRu: "3BP-05 переносит role trees между board classes; monotone — один из них. Nut ownership и license на small-bet сдвигаются вместе с board, даже когда role и preflop history не меняются.",
    explanationEn: "3BP-05 transfers role trees between board classes; monotone is one of them. Nut ownership and the small-bet license shift together with the board, even when the role and preflop history are unchanged.",
    changedVariables: ["board_class", "nut_distribution"],
  },
];
