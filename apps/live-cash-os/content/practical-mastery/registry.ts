import type { PracticalSkillFamily } from "./types";
import { practicalObjectiveEnById } from "./objectives-en";

const f = (
  id: string,
  wave: PracticalSkillFamily["wave"],
  titleRu: string,
  titleEn: string,
  objectiveRu: string,
  legacyModuleIds: PracticalSkillFamily["legacyModuleIds"],
  prerequisiteSkillIds: string[],
  sourceRefs: string[],
  livePriority: PracticalSkillFamily["livePriority"],
  targetEvidenceStage: PracticalSkillFamily["targetEvidenceStage"] = "DELAYED_RETRIEVAL",
  competencyGate = false,
): PracticalSkillFamily => {
  const objectiveEn = practicalObjectiveEnById[id as keyof typeof practicalObjectiveEnById];
  if (!objectiveEn) throw new Error(`Missing objectiveEn for Practical skill ${id}`);
  return { id, wave, titleRu, titleEn, objectiveRu, objectiveEn, legacyModuleIds, prerequisiteSkillIds, sourceRefs, targetEvidenceStage, competencyGate, livePriority };
};

export const practicalSkillFamilies: PracticalSkillFamily[] = [
  // W1 — foundation
  f("FND-01", "W1_FOUNDATION", "Цена колла: pot odds и требуемая equity", "Pot odds and required equity", "Связывать цену колла с требуемой equity.", ["geometry"], [], ["FTGU-E01"], "P0", "CHANGED_NODE_TRANSFER", true),
  f("FND-02", "W1_FOUNDATION", "Номинальная и реализуемая equity", "Raw vs realised equity", "Отличать номинальную equity от той части, которую удастся реализовать.", ["blinds"], ["FND-01"], ["FTGU-E01", "FTGU-E05", "LCM-03"], "P0", "CHANGED_NODE_TRANSFER", true),
  f("FND-03", "W1_FOUNDATION", "Implied odds и обратные implied odds", "Implied / reverse implied odds", "Распознавать будущую ценность руки и риск доминации.", ["preflop", "blinds"], ["FND-01"], ["FTGU-E04", "FTGU-E05"], "P1", "CHANGED_NODE_TRANSFER", true),
  f("FND-04", "W1_FOUNDATION", "Чистые и грязные ауты", "Clean and dirty outs", "Не считать каждое улучшение автоматически чистым аутом.", ["filtering"], ["FND-01"], ["FTGU-E01"], "P1", "CHANGED_NODE_TRANSFER", true),
  f("FND-05", "W1_FOUNDATION", "Подсчёт комбо и блокеры", "Combo counting and removal", "Считать комбо и учитывать блокеры в практической линии.", ["ancestry", "river"], [], ["FTGU-E11", "FTGU-E13"], "P0", "CHANGED_NODE_TRANSFER", true),
  f("FND-06", "W1_FOUNDATION", "Эффективный стек и SPR", "Effective stack and SPR", "Быстро определять эффективный стек и SPR после крупного действия.", ["geometry"], [], ["LCM-01"], "P0", "DELAYED_RETRIEVAL", true),
  f("FND-07", "W1_FOUNDATION", "Порог безубыточности", "Break-even intuition", "Связывать риск и выигрыш с порогом прибыльности без ложной точности.", ["shape", "river"], ["FND-01"], ["FTGU-E01", "FTGU-E12"], "P1", "CHANGED_NODE_TRANSFER", true),

  // W2 — preflop
  f("PF-01", "W2_PREFLOP", "RFI по позиции", "RFI by position", "Принимать open/fold решения с учётом позиции и контекста.", ["preflop"], ["FND-06"], ["FTGU-E02"], "P0"),
  f("PF-02", "W2_PREFLOP", "Limp / overlimp / isolation", "Limp, overlimp and isolation", "Выбирать iso/overlimp/fold в live limp-heavy ветках.", ["preflop", "multiway"], ["PF-01"], ["FTGU-E03"], "P0"),
  f("PF-03", "W2_PREFLOP", "Calling IP", "Calling in position", "Оценивать flat через domination, implied odds и squeeze exposure.", ["preflop"], ["FND-03"], ["FTGU-E04"], "P0"),
  f("PF-04", "W2_PREFLOP", "Calling from BB", "Calling from the big blind", "Использовать price, closing action и realisation вместо шаблонного fold/call.", ["preflop", "blinds"], ["FND-01", "FND-02"], ["FTGU-E05"], "P0"),
  f("PF-05", "W2_PREFLOP", "SB против opens", "Small blind versus opens", "Учитывать плохую реализацию и игрока в BB позади.", ["preflop", "blinds"], ["FND-02"], ["FTGU-E06"], "P0"),
  f("PF-06", "W2_PREFLOP", "3-bet construction", "3-bet construction", "Выбирать linear/polar/merged shape по fold equity и call branch.", ["preflop"], ["PF-01"], ["FTGU-E15", "FTGU-E16", "LCM-02"], "P0"),
  f("PF-07", "W2_PREFLOP", "Facing 3-bets", "Facing 3-bets", "Разделять fold/call/4-bet branches по позиции, sizing и hand family.", ["preflop", "aggression"], ["PF-03", "PF-06"], ["FTGU-E17"], "P0"),
  f("PF-08", "W2_PREFLOP", "4-bet fundamentals", "4-bet fundamentals", "Понимать value/bluff/blocker и stack consequences без копирования charts.", ["preflop", "aggression"], ["PF-07", "FND-05"], ["FTGU-E18", "CP-G3-L10"], "P1"),
  f("PF-09", "W2_PREFLOP", "Squeezing", "Squeezing", "Оценивать dead money, fold targets, position и call branch.", ["preflop", "aggression"], ["PF-06"], ["LCM-02", "SLC-PREFLOP-SQUEEZING"], "P0"),
  f("PF-10", "W2_PREFLOP", "Live / depth / rake adjustments", "Live, depth and rake adjustments", "Менять preflop branch при больших opens, глубине, rake и слабом caller pool.", ["geometry", "preflop"], ["PF-01", "FND-06"], ["FTGU-E02", "FTGU-E05", "SLC-PREFLOP-ADJUSTMENTS"], "P0"),

  // W3 — blinds
  f("BL-01", "W3_BLINDS", "BB vs EP/HJ", "BB versus EP/HJ", "Защищать BB против более сильных origin ranges.", ["blinds"], ["PF-04"], ["FTGU-E05", "LCM-03"], "P1"),
  f("BL-02", "W3_BLINDS", "BB vs CO", "BB versus CO", "Распознавать более широкий late-position branch.", ["blinds"], ["PF-04"], ["FTGU-E05", "LCM-03"], "P0"),
  f("BL-03", "W3_BLINDS", "BB vs BTN", "BB versus BTN", "Исполнять high-frequency blind-defence family против BTN.", ["blinds"], ["PF-04"], ["FTGU-E05", "SLC-BB-VS-BTN"], "P0"),
  f("BL-04", "W3_BLINDS", "BB vs open size", "BB versus open size", "Менять defence при изменении цены и не переносить одну частоту между сайзингами.", ["blinds"], ["BL-01", "BL-02", "BL-03"], ["FTGU-E05"], "P0"),
  f("BL-05", "W3_BLINDS", "SB vs opens", "SB versus opens", "Учитывать плохую позицию и BB behind.", ["blinds"], ["PF-05"], ["FTGU-E06"], "P0"),
  f("BL-06", "W3_BLINDS", "SB first-in", "SB first-in", "Распознавать raise/limp/fold structure там, где source support допускает branch.", ["blinds"], ["PF-01"], ["SLC-BB-VS-SB"], "P0"),
  f("BL-07", "W3_BLINDS", "BB vs SB raise", "BB versus SB raise", "Играть wide-range blind-vs-blind defence.", ["blinds"], ["BL-06"], ["SLC-BB-VS-SB"], "P0"),
  f("BL-08", "W3_BLINDS", "BB vs SB limp", "BB versus SB limp", "Различать check/raise branches против SB limp.", ["blinds"], ["BL-06"], ["SLC-BB-VS-SB"], "P0"),
  f("BL-09", "W3_BLINDS", "SB response after BB aggression", "SB response after BB aggression", "Продолжать BvB tree после raise/3-bet вместо изучения только first action.", ["blinds", "aggression"], ["BL-07", "BL-08"], ["SLC-BB-VS-SB"], "P1"),
  f("BL-10", "W3_BLINDS", "BvB SRP postflop", "Blind-vs-blind SRP postflop", "Играть postflop при очень широких исходных ranges.", ["blinds", "filtering"], ["BL-07", "W4-BOARD-01"], ["SLC-BB-VS-SB", "LCM-03"], "P0"),
  f("BL-11", "W3_BLINDS", "BvB 3-bet pots", "Blind-vs-blind 3-bet pots", "Переносить blind-range width в 3-bet-pot postflop.", ["blinds", "aggression"], ["BL-09"], ["SLC-3BET-POTS"], "P1"),
  f("BL-12", "W3_BLINDS", "Blind depth/rake variants", "Blind depth and rake variants", "Менять defence/3-bet incentives при depth/rake changes.", ["geometry", "blinds"], ["BL-04", "FND-06"], ["FTGU-E05", "FTGU-E06"], "P0"),

  // W4 — recognition
  f("W4-BOARD-01", "W4_RECOGNITION", "Flop board classes", "Flop board classes", "Быстро классифицировать основные flop textures.", ["filtering"], [], ["SLC-SRP-BOARD-CLASSES", "FTGU-E07"], "P0"),
  f("W4-RUNOUT-01", "W4_RECOGNITION", "Turn/river runout classes", "Turn and river runout classes", "Распознавать blank, scare, draw-completing и range-shifting cards.", ["filtering", "ancestry"], ["W4-BOARD-01"], ["FTGU-E20", "FTGU-E21"], "P0"),
  f("W4-HAND-01", "W4_RECOGNITION", "Made-hand families", "Made-hand families", "Переходить от exact combo к relative hand family.", ["filtering"], [], ["LCM-02", "FINAL_LEARNING_INTEGRITY"], "P0"),
  f("W4-DRAW-01", "W4_RECOGNITION", "Draw families", "Draw families", "Различать nut/weak/combo/pair+draw и domination risk.", ["filtering"], ["FND-04"], ["FTGU-E01", "FTGU-E09"], "P1"),
  f("W4-REL-01", "W4_RECOGNITION", "Relative strength and vulnerability", "Relative strength and vulnerability", "Оценивать руку относительно range/board, а не по абсолютному названию комбинации.", ["filtering", "shape"], ["W4-HAND-01", "W4-BOARD-01"], ["FTGU-E07", "FTGU-E08"], "P0"),

  // W5 — SRP OOP
  f("OOP-01", "W5_SRP_OOP", "OOP range checking", "OOP range checking", "Понимать когда range-check simplification защищает OOP tree.", ["filtering", "shape"], ["W4-BOARD-01"], ["FTGU-E27"], "P0"),
  f("OOP-02", "W5_SRP_OOP", "Check-call / check-fold", "Check-call and check-fold", "Разделять continue/fold classes по size, board и realisation.", ["filtering"], ["OOP-01", "W4-HAND-01"], ["FTGU-E08", "CP-G3-L05"], "P0"),
  f("OOP-03", "W5_SRP_OOP", "Check-raise", "Check-raise", "Строить value/bluff raise candidates по urgency и range shape.", ["aggression"], ["OOP-02"], ["FTGU-E09", "FTGU-E10", "SLC-CHECK-RAISE"], "P0"),
  f("OOP-04", "W5_SRP_OOP", "Defend vs small c-bet", "Defend versus small c-bet", "Не overfoldить автоматически к маленькому sizing.", ["filtering"], ["OOP-02"], ["FTGU-E08", "SLC-HARD-CONTINUES"], "P0"),
  f("OOP-05", "W5_SRP_OOP", "Defend vs large c-bet", "Defend versus large c-bet", "Сужать continues и повышать требования к realisation против large sizing.", ["filtering"], ["OOP-02"], ["FTGU-E07", "FTGU-E09"], "P0"),
  f("OOP-06", "W5_SRP_OOP", "Turn leads", "Turn leads", "Распознавать source-supported lead opportunities after flop call.", ["ancestry"], ["OOP-02", "W4-RUNOUT-01"], ["SLC-TURN-LEADS"], "P1"),
  f("OOP-07", "W5_SRP_OOP", "River block / bluff catch", "River block and bluff catch", "Выбирать block/check-call/check-fold через range ancestry и price.", ["river"], ["OOP-02", "FND-01"], ["FTGU-E22", "CINJ-E08"], "P1"),

  // W6 — SRP IP
  f("IP-01", "W6_SRP_IP", "Range vs selective c-bet", "Range versus selective c-bet", "Выбирать simplified range-bet или selective strategy по board/range interaction.", ["shape"], ["W4-BOARD-01"], ["FTGU-E07"], "P0"),
  f("IP-02", "W6_SRP_IP", "Check-back / delayed c-bet", "Check-back and delayed c-bet", "Сохранять protected check-back и использовать delayed aggression.", ["shape", "ancestry"], ["IP-01"], ["FTGU-E19", "CP-G3-L08"], "P0"),
  f("IP-03", "W6_SRP_IP", "Turn barreling", "Turn barreling", "Выбирать turn barrels по card class и range shift.", ["ancestry"], ["IP-01", "W4-RUNOUT-01"], ["FTGU-E21", "SLC-TURN-BARREL"], "P0"),
  f("IP-04", "W6_SRP_IP", "Capped-range attacks", "Attacking capped ranges", "Усиливать pressure только когда action history реально caps range.", ["ancestry"], ["IP-02"], ["FTGU-E26", "SLC-CAPPED-RANGES"], "P0"),
  f("IP-05", "W6_SRP_IP", "Overbet branches", "Overbet branches", "Использовать overbet logic только при source-supported nut/range asymmetry.", ["shape"], ["IP-04"], ["SLC-FLOP-OVERBET", "CP-G3-L06"], "P1"),
  f("IP-06", "W6_SRP_IP", "Thin value IP", "Thin value in position", "Извлекать value из худших calls без превращения marginal showdown в auto-bet.", ["shape", "river"], ["W4-REL-01"], ["CP-G3-L02", "FTGU-E22"], "P0"),

  // W7 — 3bet
  f("3BP-01", "W7_3BET", "3BP aggressor IP", "3-bet-pot aggressor IP", "Играть 3BP как IP aggressor по board/sizing branches.", ["aggression", "ancestry"], ["PF-06", "W4-BOARD-01"], ["FTGU-E28", "FTGU-E29", "SLC-3BET-IP"], "P0"),
  f("3BP-02", "W7_3BET", "3BP aggressor OOP", "3-bet-pot aggressor OOP", "Не переносить IP c-bet plan на OOP tree.", ["aggression", "shape"], ["PF-06", "OOP-01"], ["SLC-EXPLOITING-OOP-CBETS"], "P0"),
  f("3BP-03", "W7_3BET", "3BP caller IP", "3-bet-pot caller IP", "Исполнять continue/attack branches caller IP.", ["filtering", "ancestry"], ["PF-07"], ["SLC-3BET-POTS", "CINJ-E09"], "P1"),
  f("3BP-04", "W7_3BET", "3BP caller OOP", "3-bet-pot caller OOP", "Защищать OOP caller range без overfold/overraise simplification.", ["filtering", "aggression"], ["PF-07", "OOP-02"], ["CP-G3-L09"], "P0"),
  f("3BP-05", "W7_3BET", "3BP board/sizing matrix", "3-bet-pot board and sizing matrix", "Переносить четыре role trees между high, paired и low-connected boards.", ["filtering", "shape"], ["3BP-01", "3BP-02", "3BP-03", "3BP-04"], ["FTGU-E28", "FTGU-E29", "SLC-LOW-EQUITY-BOARDS"], "P0"),

  // W8 — 4bet
  f("4BP-01", "W8_4BET_LOW_SPR", "4-bet-pot compression", "4-bet-pot compression", "Понимать низкий SPR и ограниченное postflop tree.", ["geometry", "aggression"], ["PF-08", "FND-06"], ["CP-G3-L10"], "P1"),
  f("4BP-02", "W8_4BET_LOW_SPR", "4BP hand families", "4-bet-pot hand families", "Играть AK/QQ/JJ/blocker families без one-size-fits-all stack-off rule.", ["aggression"], ["4BP-01", "W4-HAND-01"], ["CP-G3-L10"], "P1"),
  f("4BP-03", "W8_4BET_LOW_SPR", "Protected low-SPR checks", "Protected low-SPR checks", "Сохранять checking range даже в compressed pots, где source это поддерживает.", ["shape"], ["4BP-01"], ["CP-G3-L10"], "P1"),
  f("4BP-04", "W8_4BET_LOW_SPR", "Jam exposure", "Jam exposure", "Перед bet/raise учитывать reopen/jam exposure и investment ceiling.", ["aggression"], ["4BP-01"], ["CP-G3-L04", "CP-G3-L10"], "P1"),

  // W9 — turn
  f("TURN-01", "W9_TURN", "Turn card classification", "Turn card classification", "Определять blank/scare/completing/paired/range-shifting turn.", ["filtering"], ["W4-RUNOUT-01"], ["FTGU-E21"], "P0"),
  f("TURN-02", "W9_TURN", "Turn barrel selection", "Turn barrel selection", "Продолжать aggression только у подходящих value/bluff classes.", ["ancestry"], ["TURN-01", "IP-03"], ["FTGU-E21", "SLC-TURN-BARREL", "CP-G3-L07"], "P0"),
  f("TURN-03", "W9_TURN", "Turn probes", "Turn probes", "Атаковать checked-back ranges там, где они реально capped/overwide.", ["ancestry", "evidence"], ["TURN-01"], ["FTGU-E20", "CINJ-E06"], "P0"),
  f("TURN-04", "W9_TURN", "Turn leads", "Turn leads", "Использовать lead after flop-call only on source-supported runouts.", ["ancestry"], ["OOP-06", "TURN-01"], ["SLC-TURN-LEADS"], "P1"),
  f("TURN-05", "W9_TURN", "Turn pot control / thin value", "Turn pot control and thin value", "Различать second/third street value и showdown preservation.", ["shape"], ["TURN-01", "W4-REL-01"], ["CP-G3-L02", "FTGU-E21"], "P0"),

  // W10 — river
  f("RIV-01", "W10_RIVER", "River value targets", "River value targets", "Назвать хуже руки, которые реально платят выбранный sizing.", ["river"], ["W4-HAND-01"], ["LCM-09", "CP-G3-L02"], "P0"),
  f("RIV-02", "W10_RIVER", "River bluff selection", "River bluff selection", "Выбирать bluffs по showdown value, blockers/unblockers и ancestry.", ["river", "ancestry"], ["FND-05"], ["FTGU-E23", "CP-G3-L03"], "P0"),
  f("RIV-03", "W10_RIVER", "River bluff catching", "River bluff catching", "Связывать price с credible bluff supply и removal.", ["river"], ["FND-01", "FND-05"], ["FTGU-E22", "CINJ-E02", "CINJ-E04"], "P0"),
  f("RIV-04", "W10_RIVER", "Block bets / probes", "Block bets and probes", "Распознавать small river lines и их exploit consequences.", ["river", "evidence"], ["RIV-01", "RIV-03"], ["CINJ-E08"], "P1"),
  f("RIV-05", "W10_RIVER", "Underbluff / overbluff exploits", "Underbluff and overbluff exploits", "Fold/call deviations only after branch-specific evidence.", ["river", "evidence"], ["RIV-03"], ["FTGU-E24", "FTGU-E25", "CINJ-E10"], "P0"),

  // W11 — multiway/limp
  f("MW-01", "W11_MULTIWAY_LIMP", "Relative position multiway", "Relative position multiway", "Отслеживать who acts behind and closing action in multiway trees.", ["multiway"], ["PF-02"], ["LCM-08", "SLC-MULTIWAY"], "P0"),
  f("MW-02", "W11_MULTIWAY_LIMP", "Multiway value thresholds", "Multiway value thresholds", "Повышать требования к value и nut potential при нескольких ranges.", ["multiway"], ["MW-01", "W4-REL-01"], ["SLC-MULTIWAY"], "P0"),
  f("MW-03", "W11_MULTIWAY_LIMP", "Multiway bluff discipline", "Multiway bluff discipline", "Не переносить HU bluff frequencies в multiway.", ["multiway"], ["MW-01"], ["SLC-MULTIWAY"], "P0"),
  f("MW-04", "W11_MULTIWAY_LIMP", "Isolation and overlimp", "Isolation and overlimp", "Выбирать iso/overlimp/fold против live limpers.", ["preflop", "multiway"], ["PF-02"], ["FTGU-E03"], "P0"),
  f("MW-05", "W11_MULTIWAY_LIMP", "Multiway river", "Multiway river", "Сужать bluff/value assumptions на river with multiple ranges.", ["multiway", "river"], ["MW-02", "RIV-01"], ["SLC-MULTIWAY"], "P1"),

  // W12 — deep/straddle
  f("DEEP-01", "W12_DEEP_STRADDLE", "150–200bb planning", "150–200bb planning", "Менять nut potential, leverage и stack-off thresholds по depth.", ["geometry"], ["FND-06"], ["LCM-01", "SLC-DEEP-SRP-OOP"], "P0"),
  f("DEEP-02", "W12_DEEP_STRADDLE", "300bb+ selected nodes", "Selected 300bb+ nodes", "Избегать one-pair overcommitment и ценить nut potential в very deep branches.", ["geometry"], ["DEEP-01"], ["SLC-DEEP-SRP-OOP"], "P1"),
  f("DEEP-03", "W12_DEEP_STRADDLE", "Straddle geometry", "Straddle geometry", "Пересчитывать forced unit, effective position и SPR under straddle.", ["geometry"], ["FND-06"], ["LCM-01"], "P0"),
  f("DEEP-04", "W12_DEEP_STRADDLE", "Deep preflop consequences", "Deep preflop consequences", "Менять calls/3bets/4bets при росте implied and reverse implied odds.", ["geometry", "preflop"], ["DEEP-01", "PF-10"], ["FTGU-E04", "SLC-PREFLOP-ADJUSTMENTS"], "P0"),

  // W13 — exploit
  f("EXP-01", "W13_EXPLOIT_LIVE", "Evidence-qualified player profile", "Evidence-qualified player profile", "Отделять наблюдение от устойчивого read и branch-specific evidence.", ["evidence"], [], ["LCM-10"], "P0"),
  f("EXP-02", "W13_EXPLOIT_LIVE", "Exploit value", "Exploit value", "Расширять value against overcall/sticky tendencies with evidence.", ["evidence", "shape"], ["EXP-01"], ["FTGU-E25", "CINJ-E08"], "P0"),
  f("EXP-03", "W13_EXPLOIT_LIVE", "Exploit bluffing", "Exploit bluffing", "Увеличивать/снижать bluffing against overfold/underfold evidence.", ["evidence", "river"], ["EXP-01"], ["CINJ-E01", "CINJ-E03", "FTGU-E24"], "P0"),
  f("EXP-04", "W13_EXPLOIT_LIVE", "Exploit bluff catching", "Exploit bluff catching", "Менять call-down threshold против over/underbluff evidence.", ["evidence", "river"], ["EXP-01", "RIV-03"], ["FTGU-E24", "FTGU-E25", "CINJ-E02"], "P0"),
  f("EXP-05", "W13_EXPLOIT_LIVE", "Sizing / line exploits", "Sizing and line exploits", "Реагировать на repeatable sizing/line tendencies without universalizing them.", ["evidence", "shape"], ["EXP-01"], ["CINJ-E06", "CINJ-E08", "CINJ-E09"], "P1"),
  f("EXP-06", "W13_EXPLOIT_LIVE", "Table / seat / game selection", "Table, seat and game selection", "Максимизировать hourly EV через качественный стол/seat, не смешивая это с hand EV.", ["evidence"], ["EXP-01"], ["LIVE_CASH_SYSTEM_OBJECTIVE"], "P1", "CONCEPT_TAUGHT"),

  // W14 — integrated
  f("INT-01", "W14_INTEGRATED", "Topic-hidden mixed decisions", "Topic-hidden mixed decisions", "Выбирать правильный механизм без подсказки темы.", ["transfer"], ["PF-01", "BL-03", "OOP-02", "IP-01", "3BP-01", "RIV-03", "MW-01"], ["LCM-11"], "P0", "REAL_HAND_TRANSFER"),
  f("INT-02", "W14_INTEGRATED", "Changed-node transfer", "Changed-node transfer", "Менять решение при изменении одной material variable и объяснять причинный сдвиг.", ["transfer"], ["INT-01"], ["LCM-11", "FINAL_LEARNING_INTEGRITY"], "P0", "REAL_HAND_TRANSFER"),
  f("INT-03", "W14_INTEGRATED", "Mistake-family repair", "Mistake-family repair", "Маршрутизировать ошибку к skill family, а не только к exact drill.", ["transfer"], ["INT-01"], ["LCM-11"], "P0", "REAL_HAND_TRANSFER"),
  f("INT-04", "W14_INTEGRATED", "Delayed mixed retrieval", "Delayed mixed retrieval", "Проверять retained skill на topic-hidden non-identical items.", ["transfer"], ["INT-01"], ["LCM-11"], "P0", "REAL_HAND_TRANSFER"),
  f("INT-05", "W14_INTEGRATED", "Real-hand routing", "Real-hand routing", "Связывать реальную ошибку с конкретной skill family и назначать targeted repair.", ["transfer", "evidence"], ["INT-03"], ["LCM-11"], "P0", "REAL_HAND_TRANSFER"),
];

export const practicalSkillFamilyById = new Map(practicalSkillFamilies.map((skill) => [skill.id, skill]));
