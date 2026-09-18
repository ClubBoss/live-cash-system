import type { PracticalDecision } from "./types";

const o=(id:string,textRu:string,textEn:string,misconception?:string)=>({id,textRu,textEn,misconception});
const RECOGNITION_SECOND_ACTION_IDS = new Set([
  "PM-W4-BOARD-01-101", "PM-W4-BOARD-01-102", "PM-W4-BOARD-01-103", "PM-W4-BOARD-01-104",
  "PM-W4-RUNOUT-01-101", "PM-W4-RUNOUT-01-102", "PM-W4-RUNOUT-01-103", "PM-W4-RUNOUT-01-104", "PM-W4-RUNOUT-01-105",
  "PM-W4-REL-01-101", "PM-W4-REL-01-102", "PM-W4-REL-01-103", "PM-W4-REL-01-104", "PM-W4-REL-01-105",
]);

const RECOGNITION_SECOND_REASON_IDS = new Set([
  "PM-W4-RUNOUT-01-101", "PM-W4-RUNOUT-01-102", "PM-W4-RUNOUT-01-103",
  "PM-W4-RUNOUT-01-104", "PM-W4-RUNOUT-01-105", "PM-W4-RUNOUT-01-106",
]);

type W4Distractors = {
  actionBRu: string;
  actionBEn: string;
  actionCRu: string;
  actionCEn: string;
  reason2Ru: string;
  reason2En: string;
  reason3Ru: string;
  reason3En: string;
};

function w4Distractors(skillId: string, badRu: string, badEn: string): W4Distractors {
  if (skillId === "W4-BOARD-01") {
    return {
      actionBRu: badRu,
      actionBEn: badEn,
      actionCRu: "Сохранить прежний план только по визуальному классу доски, не пересчитывая пришедшие диапазоны",
      actionCEn: "Keep the previous plan from the board's visual class alone without recomputing the arriving ranges",
      reason2Ru: "Визуальный класс доски сам по себе определяет стратегию независимо от того, какие диапазоны дошли до флопа",
      reason2En: "The board's visual class alone determines strategy regardless of which ranges reached the flop",
      reason3Ru: "Префлоп-инициатива важнее фактического покрытия доски диапазонами",
      reason3En: "Preflop initiative matters more than the ranges' actual board coverage",
    };
  }
  if (skillId === "W4-RUNOUT-01") {
    return {
      actionBRu: badRu,
      actionBEn: badEn,
      actionCRu: "Считать новую карту косметической и не пересчитывать диапазоны после предыдущей линии",
      actionCEn: "Treat the new card as cosmetic and skip recomputing the ranges after the prior line",
      reason2Ru: "Название ран-аута само определяет продолжение без проверки диапазонов, сохранившихся после линии",
      reason2En: "The runout label alone determines the continuation without checking the ranges that survived the line",
      reason3Ru: "Предыдущий агрессор сохраняет преимущество на любой следующей карте независимо от нового распределения сильных рук",
      reason3En: "The prior aggressor keeps the advantage on every next card regardless of the new strong-hand distribution",
    };
  }
  if (skillId === "W4-HAND-01") {
    return {
      actionBRu: badRu,
      actionBEn: badEn,
      actionCRu: "Оценивать решение только по абсолютной категории руки, не проверяя диапазон продолжения соперника",
      actionCEn: "Base the decision only on the hand's absolute category without checking Villain's continuing range",
      reason2Ru: "Абсолютной категории руки достаточно; диапазон продолжения соперника не меняет её стратегическую функцию",
      reason2En: "The absolute hand category is sufficient; Villain's continuing range does not change its strategic function",
      reason3Ru: "Если рука часто впереди, она автоматически подходит для вэлью-агрессии",
      reason3En: "If the hand is often ahead, it automatically qualifies for value aggression",
    };
  }
  return {
    actionBRu: badRu,
    actionBEn: badEn,
    actionCRu: "Считать стратегическую роль руки фиксированной и не пересчитывать её при изменении доски или диапазонов",
    actionCEn: "Treat the hand's strategic role as fixed and do not recompute it when the board or ranges change",
    reason2Ru: "Роль руки определяется только её абсолютной силой и не зависит от взаимодействия диапазонов",
    reason2En: "The hand's role is determined only by absolute strength and does not depend on range interaction",
    reason3Ru: "Инициатива сама определяет действие, даже если доска или диапазон продолжения меняют функцию руки",
    reason3En: "Initiative alone determines the action even when the board or continuing range changes the hand's function",
  };
}

const q=(id:string,skillId:string,kind:PracticalDecision["kind"],sourceRefs:string[],cueRu:string,cueEn:string,questionRu:string,questionEn:string,goodRu:string,goodEn:string,badRu:string,badEn:string,whyRu:string,whyEnOrChanged?:string|string[],changedVariablesArg?:string[],learnerEligibility:PracticalDecision["learnerEligibility"]="ORDINARY"):PracticalDecision=>{
  const whyEn=typeof whyEnOrChanged==="string"?whyEnOrChanged:whyRu;
  const changedVariables=Array.isArray(whyEnOrChanged)?whyEnOrChanged:changedVariablesArg;
  const distractors=w4Distractors(skillId,badRu,badEn);
  const good=o("a",goodRu,goodEn);
  const b=o("b",distractors.actionBRu,distractors.actionBEn,"CLASSIFICATION_SHORTCUT");
  const c=o("c",distractors.actionCRu,distractors.actionCEn,"CONTEXT_IGNORED");
  const r1=o("r1",whyRu,whyEn);
  const r2=o("r2",distractors.reason2Ru,distractors.reason2En,"LABEL_AS_STRATEGY");
  const r3=o("r3",distractors.reason3Ru,distractors.reason3En,"INITIATIVE_ONLY");
  return {
    id,skillId,learnerEligibility,kind,sourceRefs,
    assumptions:["mechanism-level classification; no exact solver frequency claimed"],
    cueRu,cueEn,questionRu,questionEn,
    actionOptions:RECOGNITION_SECOND_ACTION_IDS.has(id)?[b,good,c]:[good,b,c],
    reasonOptions:RECOGNITION_SECOND_REASON_IDS.has(id)?[r2,r1,r3]:[r1,r2,r3],
    correctActionId:"a",correctReasonId:"r1",targetSeconds:22,
    explanationRu:whyRu,explanationEn:whyEn,changedVariables,
  };
};

export const recognitionExpansionDecisions:PracticalDecision[]=[
// W4-BOARD-01 — board classes through range interaction, FTGU E07 + Smash board reports.
q("PM-W4-BOARD-01-101","W4-BOARD-01","recognition",["FTGU-E07"],"BTN vs BB, high dry flop that preserves raiser's high-card/overpair density.","BTN vs BB, high dry flop that preserves the raiser's high-card/overpair density.","Что распознать первым?","What should be recognized first?","Сильное сохранение range advantage","Strong preservation of range advantage","'Высокий flop = всегда bet'","'High flop = always bet'","Board strategy starts with how the flop interacts with both preflop ranges, not with a texture nickname."),
q("PM-W4-BOARD-01-102","W4-BOARD-01","recognition",["FTGU-E07"],"Low connected flop where BB retains many two-pair/straight candidates.","Low connected flop where BB retains many two-pair/straight candidates.","Какой structural class ближе?","Which structural class is closer?","Equalising / defender-friendly relative to dry high boards","Equalizing / defender-friendly relative to dry high boards","Automatic PFR range-bet board","Automatic PFR range-bet board","When the board connects with the discounted BB range and neutralizes overpair advantage, betting should become more selective."),
q("PM-W4-BOARD-01-103","W4-BOARD-01","decision",["FTGU-E07","SLC-SRP-BOARD-CLASSES"],"Two flops are both 'low', but one is disconnected and one highly connected.","Two flops are both 'low', but one is disconnected and one highly connected.","Можно ли дать им одну strategy только по rank height?","Can they share one strategy based only on rank height?","Нет — connectivity and range fit matter","No — connectivity and range fit matter","Да — low is one class","Yes — low is one class","Board labels that ignore actual range interaction are insufficient for choosing a strategy."),
q("PM-W4-BOARD-01-104","W4-BOARD-01","decision",["FTGU-E07"],"Same flop texture, but preflop ranges change from BTN-vs-BB to tighter HJ-vs-BTN.","Same flop texture, but preflop ranges change from BTN-vs-BB to tighter HJ-vs-BTN.","Сохраняется ли board ownership автоматически?","Does board ownership remain automatic?","Нет — пересчитать через arriving ranges","No — recalculate through arriving ranges","Да — board texture owns itself","Yes — board texture owns itself","A board has no strategy identity independent of the ranges that arrive there."),
q("PM-W4-BOARD-01-105","W4-BOARD-01","decision",["FTGU-E07"],"PFR retains concentrated advantage and many medium/weak hands can share one branch.","PFR retains concentrated advantage and many medium/weak hands can share one branch.","Какой strategy family становится plausible?","Which strategy family becomes plausible?","Small high-frequency/unselective betting","Small high-frequency/unselective betting","Large polar betting with every hand","Large polar betting with every hand","Concentrated range advantage plus broad participation supports a small sizing."),
q("PM-W4-BOARD-01-106","W4-BOARD-01","changed",["FTGU-E07"],"Same ranges; board changes from dry high to connected equaliser.","Same ranges; board changes from dry high to a connected equalizer.","Как должен двигаться betting structure?","How should betting structure move?","От broad/small к более selective","From broad/small toward more selective","К ещё более unselective","Toward even more unselective","When the defender gains two-pair/straight density, the raiser selects more strongly.",["board_class","range_advantage"]),
q("PM-W4-BOARD-01-107","W4-BOARD-01","changed",["FTGU-E07"],"Same board, defender preflop range loses the combos that connect most strongly.","Same board, the defender's preflop range loses the combos that connect most strongly.","Что происходит с ownership?","What happens to ownership?","Может сместиться обратно к aggressor","It can shift back toward the aggressor","Board label cannot change ownership","The board label cannot change ownership","Ownership follows surviving combinations, not visual texture alone.",["preflop_range_shape"]),
q("PM-W4-BOARD-01-108","W4-BOARD-01","boundary",["FTGU-E07"],"A low connected board appears 'BB-friendly', but BB's actual preflop branch lacks many relevant combos.","A low connected board looks 'BB-friendly', but the BB's actual preflop branch lacks many relevant combos.","Достаточно ли visual label?","Is the visual label sufficient?","Нет","No","Да","Yes","A low connected board is not automatically good for BB; actual arriving ranges still determine ownership."),

// W4-RUNOUT-01 — turn/runout classes through ancestry, E20/E21.
q("PM-W4-RUNOUT-01-101","W4-RUNOUT-01","recognition",["FTGU-E21"],"Flop caller raised many strongest hands; turn is a true blank.","The flop caller raised many strongest hands; the turn is a true blank.","Какой range-state чаще сохраняется?","Which range state is more likely to persist?","Caller remains relatively capped","The caller remains relatively capped","Caller automatically becomes uncapped","The caller automatically becomes uncapped","A blank preserves a cap only when strong hands plausibly left the calling branch earlier."),
q("PM-W4-RUNOUT-01-102","W4-RUNOUT-01","recognition",["FTGU-E21"],"Turn completes a relevant straight/flush or creates new two-pair/top-pair regions.","The turn completes a relevant straight/flush or creates new two-pair/top-pair regions.","Какой class?","Which class?","Game-changing / range-uncapping candidate","Game-changing / range-uncapping candidate","Automatic blank","Automatic blank","A capped flop branch can become uncapped on game-changing cards."),
q("PM-W4-RUNOUT-01-103","W4-RUNOUT-01","decision",["FTGU-E20"],"IP checked back flop, removing many nutted flop hands; turn is neutral.","IP checked back flop, removing many nutted flop hands; turn is neutral.","Что проверить до probe?","What should be checked before probing?","Какие strong hands flop check removed","Which strong hands the flop check removed","Только то, что c-bet был пропущен","Only that the c-bet was missed","Probe opportunity comes from the exact check-back composition, not from a mechanical missed-c-bet rule."),
q("PM-W4-RUNOUT-01-104","W4-RUNOUT-01","decision",["FTGU-E20"],"Flop check-back looked capped, but turn strongly improves the check-back range.","The flop check-back looked capped, but the turn strongly improves the check-back range.","Нужно ли mechanical overbet probe?","Should Hero mechanically overbet probe?","Нет — cap must be reassessed","No — the cap must be reassessed","Да — missed c-bet always means overbet","Yes — a missed c-bet always means overbet","The turn card can strengthen and uncap the checked-back range."),
q("PM-W4-RUNOUT-01-105","W4-RUNOUT-01","decision",["FTGU-E21"],"Caller is capped on a blank turn.","The caller is capped on a blank turn.","Какая sizing architecture может появиться?","Which sizing architecture can appear?","Polar overbet plus modest thin/protection branch","Polar overbet plus a modest thin/protection branch","Only one tiny size with entire range","Only one tiny size with the entire range","Against a capped branch, the strongest value and high-quality bluffs separate from thinner value and protection."),
q("PM-W4-RUNOUT-01-106","W4-RUNOUT-01","changed",["FTGU-E21"],"Same flop action; turn changes from blank to game-changing.","Same flop action; turn changes from blank to game-changing.","Что происходит с assumed cap?","What happens to the assumed cap?","Может исчезнуть","It can disappear","Всегда сохраняется","It always persists","Action ancestry and the new card jointly determine whether the branch remains capped.",["turn_class"]),
q("PM-W4-RUNOUT-01-107","W4-RUNOUT-01","changed",["FTGU-E20"],"Same check-back branch; turn now recreates strong hands for IP.","Same check-back branch; the turn now recreates strong hands for IP.","Как меняется probe aggression?","How does probe aggression change?","Более selective / less automatic","More selective / less automatic","More automatic","More automatic","The checked-back range must be re-evaluated before assuming it is still capped.",["turn_card","range_cap"]),
q("PM-W4-RUNOUT-01-108","W4-RUNOUT-01","boundary",["FTGU-E21"],"Flop caller used a call-only strategy and kept strong hands in calls.","The flop caller used a call-only strategy and kept strong hands in calls.","Можно ли объявить caller capped на blank turn?","Can the caller be declared capped on a blank turn?","Нет, не автоматически","No — the situation label alone is not enough to justify the conclusion","Да, callers are always capped","Yes, callers are always capped","Whether the flop node had a raising range determines whether the calling branch can be treated as capped."),

// W4-HAND-01 — exact combo -> family/traits; internal integrity authority + admitted LCMs.
q("PM-W4-HAND-01-101","W4-HAND-01","recognition",["FINAL_LEARNING_INTEGRITY","LCM-02"],"Exact combo makes top pair with strong kicker on a static board.","An exact combo makes top pair with a strong kicker on a static board.","Что игрок должен назвать кроме карт?","What should the player name beyond the cards?","Семейство руки и важные для решения свойства","Hand family + relevant traits","Только точное комбо","Only the exact combo","Перед решением назови семейство руки и свойства, которые влияют на решение: уязвимость, редро, блокеры, силу против диапазона соперника, — а не только две карты.","Before deciding, name the hand's family and the traits that drive the decision — vulnerability, redraws, blockers, strength versus the opponent's range — not just the two cards."),
q("PM-W4-HAND-01-102","W4-HAND-01","recognition",["FINAL_LEARNING_INTEGRITY"],"Exact combo has pair + strong draw.","An exact combo has a pair plus a strong draw.","Почему одного «пара» недостаточно?","Why is 'one pair' insufficient?","Эквити дро и устойчивость на будущих улицах меняют роль руки","Draw equity and future robustness change the family traits","Ярлык готовой руки полностью определяет EV","The made-hand label fully determines EV","Пара с сильным дро играется совсем иначе, чем та же пара без дро: эквити дро и то, как рука держится на следующих улицах, меняют её ценность, поэтому ярлыка «пара» недостаточно.","A pair with a strong draw plays very differently from the same pair without one: the draw's equity and how the hand holds up on later streets change its value, so the label 'one pair' is not enough."),
q("PM-W4-HAND-01-103","W4-HAND-01","decision",["FINAL_LEARNING_INTEGRITY","LCM-02"],"Two exact combos differ in suits but share the same relative family and relevant blockers do not change.","Two exact combos differ in suits but share the same relative family and relevant blockers do not change.","Что проверять?","What should be checked?","Переносится ли решение на уровне семейства","Whether the mechanism transfers at family level","Запомнить только первое комбо","Memorize the first combo only","Проверь, работает ли то же рассуждение после смены конкретных карт: если два комбо в одном семействе и важные блокеры не меняются, решение переносится; если свойство отличается — пересчитай.","Check whether the same reasoning still applies once the exact cards change: if two combos share the family and the relevant blockers, the decision carries over; if a trait differs, re-evaluate."),
q("PM-W4-HAND-01-104","W4-HAND-01","decision",["FINAL_LEARNING_INTEGRITY"],"Same named pair, but one version has redraws/blockers and the other does not.","Same named pair, but one version has redraws/blockers and the other does not.","Одинакова ли практическая роль руки?","Is the practical identity identical?","Нет — свойства разделяют семейство","No — traits split the family","Да — та же пара означает то же решение","Yes — the same pair means the same decision","Распознавание семейства руки должно сохранять важные для решения свойства: уязвимость, редро и блокеры.","Hand-family recognition must keep decision-relevant vulnerability, redraw and blocker traits."),
q("PM-W4-HAND-01-105","W4-HAND-01","decision",["LCM-02","FINAL_LEARNING_INTEGRITY"],"A concrete combo is shown after a preflop line.","A concrete combo is shown after a preflop line.","Какой переход нужен до действия?","Which bridge is needed before action?","Комбо → семейство и свойства → контекст → решение","Combo → family/traits → context → decision","Комбо → заученный ответ","Combo → memorized answer","Иди от конкретного комбо к его семейству и свойствам, затем учти доску и соперника, и только потом выбирай действие — не переходи от карт сразу к заученному ответу.","Go from the concrete combo to its family and traits, then apply the board and opponent context, and only then choose an action — do not jump from the cards straight to a memorized answer."),
q("PM-W4-HAND-01-106","W4-HAND-01","changed",["FINAL_LEARNING_INTEGRITY"],"Exact rank pattern stays similar, but board changes vulnerability/redraws.","The exact rank pattern stays similar, but the board changes vulnerability/redraws.","Что обновить?","What should be updated?","Family traits, not just name","Family traits, not just the name","Nothing","Nothing","A family is useful only if its contextual traits are recomputed when the board changes.",["board","vulnerability"]),
q("PM-W4-HAND-01-107","W4-HAND-01","changed",["FINAL_LEARNING_INTEGRITY"],"Same family, opponent range becomes much stronger.","Same family, opponent range becomes much stronger.","Что меняется?","What changes?","Relative strength/decision even if hand name stays","Relative strength/decision even if hand name stays","Nothing because family label fixed","Nothing because the family label is fixed","Family recognition is an intermediate representation, not the final action.",["opponent_range"]),
// Internal transfer-validation fixture: preserved for closure evidence, never ordinary learner practice.
q("PM-W4-HAND-01-108","W4-HAND-01","boundary",["FINAL_LEARNING_INTEGRITY"],"A learner gets the exact first combo correct but fails a non-identical combo from the same family.","A learner gets the exact first combo correct but fails a non-identical combo from the same family.","Что доказано?","What has been proven?","Recognition of one stimulus, not transfer","Recognition of one stimulus, not transfer","Full mastery","Full mastery","The integrity closure requires non-identical stimuli before claiming transfer.",undefined,undefined,"INTERNAL_ONLY"),

// W4-REL-01 — relative strength, E07/E08.
q("PM-W4-REL-01-101","W4-REL-01","recognition",["FTGU-E07"],"Same top pair appears in a range-advantage board and an equalising board.","The same top pair appears on a range-advantage board and an equalizing board.","Почему absolute label недостаточен?","Why is the absolute label insufficient?","Одна и та же топ-пара меняет стратегическую роль вместе с распределением силы и натсов в пришедших диапазонах","The same top pair changes strategic role with the strength and nut distribution of the arriving ranges","Top pair has one fixed value","Top pair has one fixed value","Strategy starts from ranges and board interaction, not from absolute made-hand labels."),
q("PM-W4-REL-01-102","W4-REL-01","recognition",["FTGU-E08"],"Strong made hand sits in a low-urgency, low-SPR call-only candidate node.","A strong made hand sits in a low-urgency, low-SPR call-only candidate node.","Does strength force an immediate raise?","Does strength force an immediate raise?","Нет","No","Да, strong always raises","Yes, strong always raises","Strong hands can remain in passive branches when raising adds little EV and later pressure is reliable."),
q("PM-W4-REL-01-103","W4-REL-01","decision",["FTGU-E08"],"Board is wet and strong value is vulnerable.","The board is wet and strong value is vulnerable.","Как меняется urgency?","How does urgency change?","На мокрой доске уязвимое сильное вэлью чаще требует немедленной агрессии, потому что промедление отдаёт эквити и защиту","On a wet board, vulnerable strong value more often needs immediate aggression because delay gives up equity and protection","Always slow-play","Always slow-play","Wetness and vulnerability are exceptions to call-only or passive simplifications."),
q("PM-W4-REL-01-104","W4-REL-01","decision",["FTGU-E07"],"Medium showdown hand on an equalising board.","A medium showdown hand on an equalizing board.","Что чаще происходит в selective structure?","What more often happens in a selective structure?","Средняя шоудаун-рука на уравнивающей доске чаще уходит в чек, пока верх диапазона и блефы используют ставки избирательно","A medium showdown hand on an equalizing board checks more often while top-range value and bluffs use betting selectively","Always large bet","Always large bet","Medium-strength showdown hands shift toward checking when the board neutralizes the raiser's advantage."),
q("PM-W4-REL-01-105","W4-REL-01","decision",["FTGU-E08"],"Aggressive opponent will keep bluffing later; strong hand is not vulnerable.","An aggressive opponent will keep bluffing later; the strong hand is not vulnerable.","Какой branch может gain EV?","Which branch can gain EV?","Call and preserve bluffs","Call and preserve bluffs","Raise automatically","Raise automatically","When urgency is low, calling can preserve an aggressive opponent's future bluffs."),
q("PM-W4-REL-01-106","W4-REL-01","changed",["FTGU-E08"],"Same hand, board changes dry -> wet/vulnerable.","Same hand, board changes from dry to wet/vulnerable.","Как меняется urgency?","How does urgency change?","Higher","Higher","Lower","Lower","Wetness and vulnerability can restore the need for a raising range.",["board_wetness","vulnerability"]),
q("PM-W4-REL-01-107","W4-REL-01","changed",["FTGU-E08"],"Same hand/board, opponent changes aggressive future bluffer -> passive.","Same hand/board, opponent changes from an aggressive future bluffer to passive.","Как меняется привлекательность слоуплея?","How does slow-play appeal change?","Падает","Falls","Растёт","Rises","Логика слоуплея частично держится на том, что будущая агрессия действительно последует.","Slow-play logic partly relies on future aggression actually arriving.",["opponent_future_aggression"]),
q("PM-W4-REL-01-108","W4-REL-01","boundary",["FTGU-E08"],"Strong hand in a call-only framework, but later action is unlikely and value is vulnerable.","A strong hand is in a call-only framework, but later action is unlikely and value is vulnerable.","Is call-only still mandatory?","Is call-only still mandatory?","Нет","No","Да","Yes","Passive lines are conditional; vulnerability and limited future action can restore immediate raising."),
];
