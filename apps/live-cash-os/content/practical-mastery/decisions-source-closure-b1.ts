import type { PracticalDecision } from "./types";

const o=(id:string,textRu:string,textEn:string,misconception?:string)=>({id,textRu,textEn,misconception});

type Family={
  skillId:string; prefix:string; sourceRefs:string[];
  nodeRu:string; nodeEn:string;
  signalRu:string; signalEn:string;
  defaultRu:string; defaultEn:string;
  whyRu:string; whyEn:string;
  changeRu:string; changeEn:string;
  boundaryRu:string; boundaryEn:string;
  shortcutRu:string; shortcutEn:string;
};

function family(f:Family):PracticalDecision[]{
  const rows:Array<{kind:PracticalDecision["kind"];cueRu:string;cueEn:string;qRu:string;qEn:string;goodRu:string;goodEn:string;whyRu:string;whyEn:string;changed?:string[]}>= [
    {kind:"recognition",cueRu:f.nodeRu,cueEn:f.nodeEn,qRu:"Какой signal здесь определяет качество решения?",qEn:"Which signal determines the quality of the decision?",goodRu:f.signalRu,goodEn:f.signalEn,whyRu:f.whyRu,whyEn:f.whyEn},
    {kind:"recognition",cueRu:`${f.nodeRu} Один контекстный фактор меняется.`,cueEn:`${f.nodeEn} One context variable changes.`,qRu:"Можно ли сохранить прежний shortcut без проверки?",qEn:"Can the old shortcut be kept without checking?",goodRu:"Нет — пересчитать mechanism/branch",goodEn:"No — recompute the mechanism/branch",whyRu:f.whyRu,whyEn:f.whyEn},
    {kind:"decision",cueRu:f.nodeRu,cueEn:f.nodeEn,qRu:"Какой practical default лучше?",qEn:"Which practical default is better?",goodRu:f.defaultRu,goodEn:f.defaultEn,whyRu:f.whyRu,whyEn:f.whyEn},
    {kind:"decision",cueRu:`${f.nodeRu} Shortcut выглядит удобно, но assumptions не проверены.`,cueEn:`${f.nodeEn} A shortcut looks convenient, but its assumptions are unchecked.`,qRu:"Что делать?",qEn:"What should Hero do?",goodRu:"Использовать source-scoped rule и проверить relevant range/price/context",goodEn:"Use the source-scoped rule and check the relevant range/price/context",whyRu:f.whyRu,whyEn:f.whyEn},
    {kind:"decision",cueRu:`${f.nodeRu} Решение влияет на большой future branch.`,cueEn:`${f.nodeEn} The decision affects a large future branch.`,qRu:"Что нельзя игнорировать?",qEn:"What must not be ignored?",goodRu:"Future realization / response tree / stronger opposing region",goodEn:"Future realization / response tree / stronger opposing region",whyRu:f.whyRu,whyEn:f.whyEn},
    {kind:"changed",cueRu:f.changeRu,cueEn:f.changeEn,qRu:"Как должен измениться вывод?",qEn:"How should the conclusion change?",goodRu:"Пересобрать branch; старый default не переносить автоматически",goodEn:"Rebuild the branch; do not copy the old default automatically",whyRu:f.whyRu,whyEn:f.whyEn,changed:["material_context_variable"]},
    {kind:"changed",cueRu:`${f.nodeRu} Opponent/range/depth evidence становится materially different.`,cueEn:`${f.nodeEn} Opponent/range/depth evidence becomes materially different.`,qRu:"Что происходит с marginal action?",qEn:"What happens to the marginal action?",goodRu:"Он может выйти из active region; пересчитать EV directionally",goodEn:"It can leave the active region; recompute EV directionally",whyRu:f.whyRu,whyEn:f.whyEn,changed:["range_or_depth"]},
    {kind:"boundary",cueRu:f.boundaryRu,cueEn:f.boundaryEn,qRu:"Где boundary правила?",qEn:"Where is the rule's boundary?",goodRu:"Отказаться от universal shortcut и вернуться к source assumptions",goodEn:"Reject the universal shortcut and return to the source assumptions",whyRu:f.whyRu,whyEn:f.whyEn},
  ];
  return rows.map((r,i)=>{
    const slot=i%3;
    const good=o("good",r.goodRu,r.goodEn);
    const bad1=o("bad1",f.shortcutRu,f.shortcutEn,"SOURCE_SHORTCUT");
    const bad2=o("bad2","Игнорировать range/context","Ignore the range/context","CONTEXT_IGNORED");
    const goodR=o("goodR",r.whyRu,r.whyEn);
    const badR1=o("badR1","Exact hand label сам задаёт action","The exact hand label determines the action","LABEL_AS_ACTION");
    const badR2=o("badR2","Одна цифра/схема универсальна","One number/pattern is universal","UNIVERSAL_RULE");
    return {
      id:`${f.prefix}-${101+i}`,skillId:f.skillId,kind:r.kind,sourceRefs:f.sourceRefs,
      assumptions:["reviewed B1 public authority; directional mechanism only unless explicitly stated; no copied exact chart cell"],
      cueRu:r.cueRu,cueEn:r.cueEn,questionRu:r.qRu,questionEn:r.qEn,
      actionOptions:slot===0?[good,bad1,bad2]:slot===1?[bad1,good,bad2]:[bad1,bad2,good],
      reasonOptions:slot===0?[badR1,goodR,badR2]:slot===1?[goodR,badR1,badR2]:[badR1,badR2,goodR],
      correctActionId:"good",correctReasonId:"goodR",targetSeconds:24,
      explanationRu:r.whyRu,explanationEn:r.whyEn,changedVariables:r.changed,
    } satisfies PracticalDecision;
  });
}

const families:Family[]=[
  {
    skillId:"FND-04",prefix:"PM-FND-04-B1",sourceRefs:["EXT-PC-OUTS-2026","EXT-PC-OUTS-GUIDE-2023"],
    nodeRu:"Hero считает outs для draw, но часть карт улучшает Hero и одновременно оставляет/делает opponent stronger hand.",nodeEn:"Hero is counting outs for a draw, but some cards improve Hero while still leaving/making the opponent stronger.",
    signalRu:"Out quality: clean vs dirty relative to opponent range",signalEn:"Out quality: clean vs dirty relative to the opponent range",
    defaultRu:"Считать clean outs полностью, questionable/dirty — дисконтировать или исключать",defaultEn:"Count clean outs fully and discount/remove questionable or dirty outs",
    whyRu:"Reviewed PokerCoaching outs material defines dirty outs as apparent improvements that do not reliably produce the best hand and warns that counting them fully inflates equity.",whyEn:"Reviewed PokerCoaching outs material defines dirty outs as apparent improvements that do not reliably make the best hand and warns that counting them fully inflates equity.",
    changeRu:"Same draw; opponent range shifts from one-pair-heavy to sets/two-pair/nut-draw-heavy.",changeEn:"Same draw; the opponent range shifts from one-pair-heavy to sets/two-pair/nut-draw-heavy.",
    boundaryRu:"Learner counts every card that improves the hand as a full out.",boundaryEn:"The learner counts every card that improves the hand as a full out.",shortcutRu:"Improves Hero = clean out",shortcutEn:"Improves Hero = clean out",
  },
  {
    skillId:"BL-06",prefix:"PM-BL-06-B1",sourceRefs:["EXT-GTOW-SB-SRP-2024"],
    nodeRu:"Action folds to SB at 100bb cash; SB is guaranteed OOP if BB continues and already has 0.5bb invested.",nodeEn:"Action folds to the SB in a 100bb cash game; SB is guaranteed OOP if BB continues and already has 0.5bb invested.",
    signalRu:"Raise EV must beat a profitable limp branch; BvB mixes are opponent-sensitive",signalEn:"Raise EV must beat a profitable limp branch; BvB mixes are opponent-sensitive",
    defaultRu:"Не использовать forced raise-or-fold; строить limp/raise structure и менять fringe против BB tendencies",defaultEn:"Do not force raise-or-fold; use a limp/raise structure and adjust the fringe to BB tendencies",
    whyRu:"GTO Wizard's reviewed cash article explicitly explains that calling is unusually attractive for SB and that BvB opening mixes are highly sensitive to BB responses.",whyEn:"GTO Wizard's reviewed cash article explicitly explains that calling is unusually attractive for SB and that BvB opening mixes are highly sensitive to BB responses.",
    changeRu:"Same SB hand class; BB changes from passive/check-heavy to aggressively attacking limps.",changeEn:"Same SB hand class; BB changes from passive/check-heavy to aggressively attacking limps.",
    boundaryRu:"Learner memorizes SB as always raise-or-fold when folded to.",boundaryEn:"The learner memorizes SB as always raise-or-fold when folded to.",shortcutRu:"SB first-in = raise or fold only",shortcutEn:"SB first-in = raise or fold only",
  },
  {
    skillId:"BL-07",prefix:"PM-BL-07-B1",sourceRefs:["EXT-UP-BVB-CALLER-2019","EXT-GTOW-SB-SRP-2024"],
    nodeRu:"BB faces an SB open in a heads-up blind battle and will have position postflop.",nodeEn:"BB faces an SB open in a heads-up blind battle and will have position postflop.",
    signalRu:"Good price + closing action + postflop position support wide defence",signalEn:"Good price + closing action + postflop position support wide defence",
    defaultRu:"Defend materially wider than versus earlier-position opens; split call/3-bet by hand properties and sizing",defaultEn:"Defend materially wider than versus earlier-position opens; split call/3-bet by hand properties and sizing",
    whyRu:"Upswing's reviewed BvB caller article identifies the BB's price, closing action and postflop position as the structural reasons this node defends widely.",whyEn:"Upswing's reviewed BvB caller article identifies the BB's price, closing action and postflop position as the structural reasons this node defends widely.",
    changeRu:"Same BB holding; SB open size becomes materially larger.",changeEn:"Same BB holding; the SB open size becomes materially larger.",
    boundaryRu:"Learner copies BB-vs-BTN or BB-vs-EP defence without accounting for SB origin and Hero's postflop position.",boundaryEn:"The learner copies BB-vs-BTN or BB-vs-EP defence without accounting for SB origin and Hero's postflop position.",shortcutRu:"All BB-vs-open nodes are the same",shortcutEn:"All BB-vs-open nodes are the same",
  },
  {
    skillId:"BL-08",prefix:"PM-BL-08-B1",sourceRefs:["EXT-UP-BVB-LIMP-2019","EXT-GTOW-BVB-LIMP-CALLED-2024"],
    nodeRu:"SB open-limps; BB can check and realise position or raise to generate folds/isolate.",nodeEn:"SB open-limps; BB can check and realize position or raise to generate folds/isolate.",
    signalRu:"Compare raise EV with check EV; hand playability, opponent limp construction and response matter",signalEn:"Compare raise EV with check EV; hand playability, opponent limp construction and response matter",
    defaultRu:"Raise selected hands that gain EV from fold/value leverage; check hands whose raise mostly folds worse and gets action from better",defaultEn:"Raise selected hands that gain EV from fold/value leverage; check hands whose raise mostly folds worse and gets action from better",
    whyRu:"Upswing and GTO Wizard both frame the BB response as a raise-vs-check EV comparison, not 'raise because SB showed weakness'.",whyEn:"Upswing and GTO Wizard both frame the BB response as a raise-vs-check EV comparison, not 'raise because SB showed weakness'.",
    changeRu:"Same BB hand; SB changes from balanced limp construction to a weak player who limp-calls too much.",changeEn:"Same BB hand; SB changes from a balanced limp construction to a weak player who limp-calls too much.",
    boundaryRu:"Learner raises every playable hand over an SB limp.",boundaryEn:"The learner raises every playable hand over an SB limp.",shortcutRu:"SB limp = weakness = raise",shortcutEn:"SB limp = weakness = raise",
  },
  {
    skillId:"BL-09",prefix:"PM-BL-09-B1",sourceRefs:["EXT-UP-BVB-LIMP-2019","EXT-GTOW-BVB-LIMP-CALLED-2024"],
    nodeRu:"SB limped, BB raised, and SB now must continue/fold/3-bet against the isolation raise.",nodeEn:"SB limped, BB raised, and SB now must continue/fold/3-bet against the isolation raise.",
    signalRu:"Limp range must contain enough strong continues; response depends on BB raise construction and sizing",signalEn:"The limp range must contain enough strong continues; response depends on BB raise construction and sizing",
    defaultRu:"Continue robust hands and preserve some strong limp branches; do not treat the original limp as a capped fold-heavy range",defaultEn:"Continue robust hands and preserve some strong limp branches; do not treat the original limp as a capped fold-heavy range",
    whyRu:"Reviewed BvB sources explicitly show that sound SB limping contains traps/strong hands and discuss SB responses after the BB isolation raise.",whyEn:"Reviewed BvB sources explicitly show that sound SB limping contains traps/strong hands and discuss SB responses after the BB isolation raise.",
    changeRu:"Same SB holding; BB raises larger and with a more value-heavy construction.",changeEn:"Same SB holding; BB raises larger and with a more value-heavy construction.",
    boundaryRu:"Learner assumes 'limp then face raise' means the SB range is weak and should continue identically versus every size.",boundaryEn:"The learner assumes 'limp then face raise' means the SB range is weak and should continue identically versus every size.",shortcutRu:"Limped = capped and weak",shortcutEn:"Limped = capped and weak",
  },
  {
    skillId:"W4-DRAW-01",prefix:"PM-W4-DRAW-B1",sourceRefs:["FTGU-E09","EXT-PC-OUTS-GUIDE-2023"],
    nodeRu:"Hero has a draw or pair+draw; raw out count alone does not show nut potential, overlap or domination.",nodeEn:"Hero has a draw or pair+draw; raw out count alone does not show nut potential, overlap or domination.",
    signalRu:"Draw quality = clean outs + nut potential + overlap/double-counting + showdown value",signalEn:"Draw quality = clean outs + nut potential + overlap/double-counting + showdown value",
    defaultRu:"Классифицировать draw по качеству и traits, а не только по названию 'flush draw/gutshot'",defaultEn:"Classify the draw by quality and traits, not only by the label 'flush draw/gutshot'",
    whyRu:"Reviewed outs guidance covers dirty outs and combo-draw overlap; FTGU-E09 supplies the decision link between draw robustness, fold equity and raising urgency.",whyEn:"Reviewed outs guidance covers dirty outs and combo-draw overlap; FTGU-E09 supplies the decision link between draw robustness, fold equity and raising urgency.",
    changeRu:"Same nominal draw; one version makes the nuts and unblocks folds, the other is dominated/non-nut and shares dirty outs.",changeEn:"Same nominal draw; one version makes the nuts and unblocks folds, the other is dominated/non-nut and shares dirty outs.",
    boundaryRu:"Learner treats two hands with the same number of nominal outs as strategically identical.",boundaryEn:"The learner treats two hands with the same number of nominal outs as strategically identical.",shortcutRu:"Same out count = same draw quality",shortcutEn:"Same out count = same draw quality",
  },
  {
    skillId:"DEEP-02",prefix:"PM-DEEP-02-B1",sourceRefs:["EXT-GTOW-DEEP-300-2025","EXT-GTOW-DEEP-SOLUTIONS-300","EXT-UP-SET-MINING-300-2025"],
    nodeRu:"300bb cash: physical depth materially increases future leverage and positional/reverse-implied-odds costs.",nodeEn:"300bb cash: physical depth materially increases future leverage and positional/reverse-implied-odds costs.",
    signalRu:"Deep position + future realization + implied/reverse implied odds; 100bb preflop actions are not automatic",signalEn:"Deep position + future realization + implied/reverse implied odds; 100bb preflop actions are not automatic",
    defaultRu:"Reweight preflop calls/3-bets and one-pair commitment directionally; value position and nutted potential more",defaultEn:"Reweight preflop calls/3-bets and one-pair commitment directionally; value position and nutted potential more",
    whyRu:"Reviewed GTO Wizard material explicitly compares 300bb cash responses and shows OOP blinds 3-betting less as depth magnifies realization problems; Upswing's 300bb set-mining comparison highlights both implied upside and larger reverse-implied loss exposure.",whyEn:"Reviewed GTO Wizard material explicitly compares 300bb cash responses and shows OOP blinds 3-betting less as depth magnifies realization problems; Upswing's 300bb set-mining comparison highlights both implied upside and larger reverse-implied loss exposure.",
    changeRu:"Same positions/hand family: 100bb becomes 300bb while rake and sizing assumptions stay comparable.",changeEn:"Same positions/hand family: 100bb becomes 300bb while rake and sizing assumptions stay comparable.",
    boundaryRu:"Learner copies a 100bb stack-off or preflop branch unchanged at 300bb because the hand name is the same.",boundaryEn:"The learner copies a 100bb stack-off or preflop branch unchanged at 300bb because the hand name is the same.",shortcutRu:"100bb action = 300bb action",shortcutEn:"100bb action = 300bb action",
  },
  {
    skillId:"MW-05",prefix:"PM-MW-05-B1",sourceRefs:["SLC-MULTIWAY","EXT-PS-MULTIWAY-2026","EXT-PS-RIVER-2025"],
    nodeRu:"River остаётся multiway или до river дошли ranges, сильно отфильтрованные несколькими участниками.",nodeEn:"The river remains multiway or the river ranges were strongly filtered by multiple participants.",
    signalRu:"More surviving ranges → stronger value/bluff thresholds; name worse calls and credible bluffs explicitly",signalEn:"More surviving ranges → stronger value/bluff thresholds; name worse calls and credible bluffs explicitly",
    defaultRu:"Value/bluff more selectively than HU; do not call/bluff from price or blocker alone without multiway range supply",defaultEn:"Value/bluff more selectively than heads-up; do not call/bluff from price or blocker alone without multiway range supply",
    whyRu:"Reviewed multiway sources show stronger continuing ranges and reduced bluffing; canonical river logic still requires worse value targets or credible bluff supply. This is a bounded discipline rule, not a full multiway solver tree.",whyEn:"Reviewed multiway sources show stronger continuing ranges and reduced bluffing; canonical river logic still requires worse value targets or credible bluff supply. This is a bounded discipline rule, not a full multiway solver tree.",
    changeRu:"Same river hand/board: heads-up survivor becomes a genuine three-way river with another strong range still active.",changeEn:"Same river hand/board: a heads-up survivor becomes a genuine three-way river with another strong range still active.",
    boundaryRu:"Learner imports heads-up thin-value/bluff-catch thresholds unchanged into a multiway river.",boundaryEn:"The learner imports heads-up thin-value/bluff-catch thresholds unchanged into a multiway river.",shortcutRu:"HU river thresholds transfer unchanged",shortcutEn:"Heads-up river thresholds transfer unchanged",
  },
  {
    skillId:"EXP-06",prefix:"PM-EXP-06-B1",sourceRefs:["EXT-PC-GAMESEL-2025","EXT-CP-SEATSEL-2014"],
    nodeRu:"Перед/во время live cash session Hero может выбрать стол или место, влияющие на achievable hourly EV.",nodeEn:"Before/during a live cash session, Hero can choose a table or seat that changes achievable hourly EV.",
    signalRu:"Opponent quality/action + position relative to strong/aggressive players + sustainability of the game",signalEn:"Opponent quality/action + position relative to strong/aggressive players + sustainability of the game",
    defaultRu:"Выбирать более прибыльную игру и избегать сильных/aggressive игроков слева; переоценивать после наблюдений",defaultEn:"Choose the more profitable game and avoid strong/aggressive players on the left; re-evaluate after observation",
    whyRu:"PokerCoaching and CardPlayer sources treat game/seat selection as an EV decision and caution that superficial profiling or chip-stack appearance is insufficient evidence.",whyEn:"PokerCoaching and CardPlayer sources treat game/seat selection as an EV decision and caution that superficial profiling or chip-stack appearance is insufficient evidence.",
    changeRu:"Same stakes: table composition changes from several weak/passive players to mostly competent aggressive players.",changeEn:"Same stakes: table composition changes from several weak/passive players to mostly competent aggressive players.",
    boundaryRu:"Learner chooses a table only because stacks are large or a stereotype suggests weakness.",boundaryEn:"The learner chooses a table only because stacks are large or a stereotype suggests weakness.",shortcutRu:"Big stacks / stereotype = best game",shortcutEn:"Big stacks / stereotype = best game",
  },
];

export const sourceClosureB1Decisions:PracticalDecision[]=families.flatMap(family);
