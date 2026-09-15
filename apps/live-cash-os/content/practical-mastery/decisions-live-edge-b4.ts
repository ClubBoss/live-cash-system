import type { PracticalDecision } from "./types";

const o=(id:string,textRu:string,textEn:string,misconception?:string)=>({id,textRu,textEn,misconception});
type L={skillId:string;prefix:string;sourceRefs:string[];baseRu:string;baseEn:string;signalRu:string;signalEn:string;whyRu:string;whyEn:string;changeRu:string;changeEn:string;vars:string[]};


const B4_SPECIFICITY: Record<string, { decisionRu: string; decisionEn: string; changedRu: string; changedEn: string; boundaryRu: string; boundaryEn: string }> = {
  "PF-01": {
    decisionRu: "С sticky callers позади и 250bb не открывай 100bb fringe автоматически; сужай руки с плохой глубокой реализацией",
    decisionEn: "With sticky callers behind at 250bb, do not auto-open the 100bb fringe; tighten hands with poor deep realization",
    changedRu: "Пограничные открытия с плохой реализацией теряют EV; сильные и устойчивые positional opens сохраняются лучше",
    changedEn: "Poor-realization fringe opens lose EV; stronger, robust positional opens survive better",
    boundaryRu: "Не превращай deep/sticky table в правило 'всегда tight': корректируй только fringe, который реально теряет EV",
    boundaryEn: "Do not turn a deep/sticky table into 'always tight'; adjust only the fringe whose EV actually deteriorates",
  },
  "PF-02": {
    decisionRu: "Когда folds мало и pot всё равно multiway, чаще оставляй implied-odds руки в дешёвой ветке; iso требует frequent strength или реальной fold equity",
    decisionEn: "When folds are scarce and the pot stays multiway, keep implied-odds hands in the cheap branch more often; isolating needs frequent strength or real fold equity",
    changedRu: "Три sticky limpers плюс агрессор позади уменьшают marginal iso; overlimp/fold получают больше веса у слабой frequent strength",
    changedEn: "Three sticky limpers plus an aggressive player behind reduce marginal isolations; overlimp/fold gain weight with weak frequent strength",
    boundaryRu: "Не overlimp автоматически: сильные руки и реальные folds всё ещё поддерживают iso",
    boundaryEn: "Do not overlimp automatically; strong hands and real fold equity can still support an isolation raise",
  },
  "PF-04": {
    decisionRu: "Против 5bb open резко сузь пограничные BB-call; posted blind не компенсирует ухудшившуюся цену",
    decisionEn: "Versus a 5bb open, tighten marginal BB calls sharply; the posted blind does not compensate for the worse price",
    changedRu: "Переход 2.5bb → 5bb убирает слабейшую suited/connected периферию BB первой",
    changedEn: "Moving 2.5bb → 5bb removes the weakest suited/connected BB fringe first",
    boundaryRu: "Не fold весь BB из-за крупного сайзинга: сильные и хорошо реализующиеся руки продолжают по branch EV",
    boundaryEn: "Do not fold the whole BB range because size is large; strong and well-realizing hands still continue by branch EV",
  },
  "PF-06": {
    decisionRu: "Deep OOP и caller-heavy opener требуют более robust/value-dense 3-бета; пограничные 100bb bluffs с плохой реализацией сокращаются",
    decisionEn: "Deep OOP against a caller-heavy opener calls for a more robust/value-dense 3-bet; marginal 100bb bluffs with poor realization contract",
    changedRu: "При 300bb OOP убирай 3-беты, EV которых зависел от короткого 100bb called branch; robust value/nut-potential hands сохраняются лучше",
    changedEn: "At 300bb OOP, remove 3-bets whose EV relied on a short 100bb called branch; robust value/nut-potential hands survive better",
    boundaryRu: "Не делай deep = value-only: поляризация всё ещё возможна, когда bluff region получает folds и приемлемый called branch",
    boundaryEn: "Do not make deep = value-only; polarization can still exist when the bluff region earns folds and retains an acceptable called branch",
  },
  "PF-07": {
    decisionRu: "Против oversized 3-бета в глубине сузь marginal calls и оценивай fold/call/4-bet по цене, позиции и deep called branch",
    decisionEn: "Facing an oversized 3-bet deep, tighten marginal calls and allocate fold/call/4-bet by price, position, and the deep called branch",
    changedRu: "Oversized 3-бет при 250bb повышает требования к call: слабейшие пограничные continues уходят первыми",
    changedEn: "An oversized 3-bet at 250bb raises the bar for calling; the weakest marginal continues disappear first",
    boundaryRu: "Не превращай большой сайзинг в auto-fold: premium/robust continues и opponent construction всё ещё имеют значение",
    boundaryEn: "Do not turn a large size into an auto-fold; premium/robust continues and opponent construction still matter",
  },
  "BL-03": {
    decisionRu: "Широкий BTN origin не спасает слабейший BB fringe против 4bb, высокого рейка и плохой реализации — сужай marginal calls",
    decisionEn: "A wide BTN origin does not rescue the weakest BB fringe versus 4bb, high rake, and poor realization—tighten marginal calls",
    changedRu: "По сравнению с small/low-rake node слабейшие suited/connected BB-call исчезают; сильные continues сохраняются",
    changedEn: "Relative to the small/low-rake node, the weakest suited/connected BB calls disappear while stronger continues remain",
    boundaryRu: "Не копируй EP-tight range против BTN: origin width всё ещё оставляет BB шире, чем против сильных ранних диапазонов",
    boundaryEn: "Do not copy an EP-tight range versus BTN; origin width still leaves BB wider than versus strong early ranges",
  },
  "OOP-02": {
    decisionRu: "При 200bb OOP продолжай более устойчивой частью диапазона; слабые dominated continues, живущие только за счёт текущей цены, сокращаются",
    decisionEn: "At 200bb OOP, continue with a more robust region; weak dominated continues that live only on the current price contract",
    changedRu: "Переход 100bb → 200bb делает marginal dominated calls хуже из-за будущего leverage и reverse-implied exposure",
    changedEn: "Moving 100bb → 200bb makes marginal dominated calls worse because future leverage and reverse-implied exposure increase",
    boundaryRu: "Не fold все medium hands из-за глубины: robust draws/pairs и хорошие future routes всё ещё могут продолжать",
    boundaryEn: "Do not fold every medium hand because stacks are deep; robust draws/pairs and good future routes can still continue",
  },
  "3BP-05": {
    decisionRu: "При более высоком SPR реже полагайся на automatic commitment; сохраняй больше future branches и отбирай крупное давление строже",
    decisionEn: "At higher SPR, rely less on automatic commitment; preserve more future branches and select large pressure more strictly",
    changedRu: "Переход 100bb → 200bb повышает SPR: marginal one-street pressure/commitment сокращается, future-play branches растут",
    changedEn: "Moving 100bb → 200bb raises SPR; marginal one-street pressure/commitment contracts while future-play branches expand",
    boundaryRu: "Не делай high SPR = passive: strong range/board advantages всё ещё поддерживают агрессию, но не по low-SPR autopilot",
    boundaryEn: "Do not make high SPR = passive; strong range/board advantages still support aggression, just not via low-SPR autopilot",
  },
  "TURN-02": {
    decisionRu: "С deep future stack отбирай thin value и marginal bluffs строже; баррель должен выдерживать river leverage, а не только текущую fold equity",
    decisionEn: "With deep future stacks, select thin value and marginal bluffs more strictly; a barrel must withstand river leverage, not merely current fold equity",
    changedRu: "Глубокий river SPR уменьшает привлекательность тонкого pot inflation: robust value/bluffs сохраняются лучше marginal classes",
    changedEn: "A deep river SPR reduces the appeal of thin pot inflation; robust value/bluffs survive better than marginal classes",
    boundaryRu: "Не превращай deep turn в auto-check: подходящие value и high-quality bluffs всё ещё баррелят",
    boundaryEn: "Do not turn a deep turn into an auto-check; suitable value and high-quality bluffs still barrel",
  },
  "RIV-01": {
    decisionRu: "Выбирай размер, который реально получает call от худших рук; если крупный sizing выбивает этот слой, переходи к меньшему sizing или check",
    decisionEn: "Choose the size that actually gets called by worse hands; if the large size folds out that layer, move smaller or check",
    changedRu: "Когда large size выбивает худшие calls, value investment снижается: меньший sizing или check становятся лучше прежнего large bet",
    changedEn: "When the large size folds out worse calls, value investment falls: a smaller size or check becomes better than the former large bet",
    boundaryRu: "Не делай 'station = bet big': крупный bet допустим только если конкретные худшие руки действительно продолжают на него",
    boundaryEn: "Do not use 'station = bet big'; a large bet is justified only when specific worse hands actually continue versus it",
  },
  "RIV-03": {
    decisionRu: "При повторяющемся underbluff в этой exact branch сузь marginal bluff-catch; цена остаётся проверкой, но не создаёт отсутствующие bluffs",
    decisionEn: "With repeated underbluff evidence in this exact branch, tighten marginal bluff-catches; price remains a check but does not create missing bluffs",
    changedRu: "Переход unknown → repeated same-branch underbluff делает marginal call хуже и сдвигает threshold к fold",
    changedEn: "Moving unknown → repeated same-branch underbluff makes a marginal call worse and shifts the threshold toward folding",
    boundaryRu: "Не глобализируй underbluff read: другой sizing/line требует новой bluff-supply и evidence проверки",
    boundaryEn: "Do not globalize the underbluff read; another size/line requires a fresh bluff-supply and evidence check",
  },
};

function build(v:L):PracticalDecision[]{
 const rows=[
  {kind:"recognition" as const,cueRu:v.baseRu,cueEn:v.baseEn,qRu:"Какой live-context signal нельзя пропустить?",qEn:"Which live-context signal must not be missed?",goodRu:v.signalRu,goodEn:v.signalEn,changed:undefined},
  {kind:"decision" as const,cueRu:v.baseRu,cueEn:v.baseEn,qRu:"Какой подход лучше?",qEn:"Which approach is better?",goodRu:B4_SPECIFICITY[v.skillId].decisionRu,goodEn:B4_SPECIFICITY[v.skillId].decisionEn,changed:undefined},
  {kind:"changed" as const,cueRu:v.changeRu,cueEn:v.changeEn,qRu:"Что должно измениться?",qEn:"What should change?",goodRu:B4_SPECIFICITY[v.skillId].changedRu,goodEn:B4_SPECIFICITY[v.skillId].changedEn,changed:v.vars},
  {kind:"boundary" as const,cueRu:`${v.baseRu} Learner хочет применить один live slogan ко всем столам.`,cueEn:`${v.baseEn} The learner wants to apply one live slogan to every table.`,qRu:"Где boundary?",qEn:"Where is the boundary?",goodRu:B4_SPECIFICITY[v.skillId].boundaryRu,goodEn:B4_SPECIFICITY[v.skillId].boundaryEn,changed:undefined},
 ];
 return rows.map((r,i)=>{const slot=i%3;const good=o("good",r.goodRu,r.goodEn);const b1=o("b1","Обычный 100bb/HU default остаётся верным: карты Hero те же, а live-контекст не меняет EV ветки","The ordinary 100bb/HU default remains correct because Hero's cards are unchanged; changes in depth, sizing, caller stickiness, and players behind affect execution but not the chosen branch","LIVE_CONTEXT_IGNORED");const b2=o("b2","Использовать универсальный лозунг про live-игроков","A broad live-player read outweighs the exact hand geometry, so it transfers to this branch without separate recomputation","LIVE_STEREOTYPE");const gr=o("goodR",v.whyRu,v.whyEn);const br1=o("br1","Live-переменная косметическая и не меняет геометрию или диапазоны","The live variable is cosmetic and does not change geometry or ranges","GEOMETRY_IGNORED");const br2=o("br2","Одно наблюдение описывает весь пул игроков","One observation describes the whole population","EVIDENCE_OVERGENERALIZED");return {id:`${v.prefix}-${101+i}`,skillId:v.skillId,kind:r.kind,sourceRefs:v.sourceRefs,assumptions:["B4 live-context transformation; source-scoped direction; no exact population frequency"],cueRu:r.cueRu,cueEn:r.cueEn,questionRu:r.qRu,questionEn:r.qEn,actionOptions:slot===0?[good,b1,b2]:slot===1?[b1,good,b2]:[b1,b2,good],reasonOptions:slot===0?[br1,gr,br2]:slot===1?[gr,br1,br2]:[br1,br2,gr],correctActionId:"good",correctReasonId:"goodR",targetSeconds:22,explanationRu:v.whyRu,explanationEn:v.whyEn,changedVariables:r.changed} satisfies PracticalDecision;});
}

const variants:L[]=[
 {skillId:"PF-01",prefix:"PM-B4-PF01",sourceRefs:["FTGU-E02","SLC-PREFLOP-ADJUSTMENTS","EXT-GTOW-DEEP-300-2025"],baseRu:"Live RFI spot: stacks 250bb+, players behind sticky, opening environment отличается от default chart assumptions.",baseEn:"Live RFI spot: stacks are 250bb+, players behind are sticky, and the environment differs from default chart assumptions.",signalRu:"Depth + players behind + realization/rake around the opening fringe",signalEn:"Depth + players behind + realization/rake around the opening fringe",whyRu:"Opening charts are defaults; deeper future trees and sticky players behind alter fringe EV and positional costs.",whyEn:"Opening charts are defaults; deeper future trees and sticky players behind alter fringe EV and positional costs.",changeRu:"Same hand/position: 100bb quiet table → 250bb sticky callers behind.",changeEn:"Same hand/position: 100bb quiet table → 250bb with sticky callers behind.",vars:["effective_depth","players_behind","realisation"]},
 {skillId:"PF-02",prefix:"PM-B4-PF02",sourceRefs:["FTGU-E03"],baseRu:"Two live limpers, Hero chooses iso/overlimp/fold while players behind remain active.",baseEn:"Two live limpers, Hero chooses isolate/overlimp/fold while players behind remain active.",signalRu:"Frequent strength + fold equity + position + number/stickiness of callers + players behind",signalEn:"Frequent strength + fold equity + position + number/stickiness of callers + players behind",whyRu:"Limp decisions must compare fold, called, and multiway branches rather than defaulting to automatic isolation.",whyEn:"Limp decisions must compare fold, called, and multiway branches rather than defaulting to automatic isolation.",changeRu:"Same hand/seat: one fold-prone limper → three sticky limpers plus aggressive player behind.",changeEn:"Same hand/seat: one fold-prone limper → three sticky limpers plus an aggressive player behind.",vars:["limper_count","caller_stickiness","players_behind"]},
 {skillId:"PF-04",prefix:"PM-B4-PF04",sourceRefs:["FTGU-E05","SLC-PREFLOP-ADJUSTMENTS"],baseRu:"BB faces a 5bb live open instead of a small online-style open.",baseEn:"BB faces a 5bb live open instead of a small online-style open.",signalRu:"Much worse price + often more selected origin range + realization cost",signalEn:"Much worse price + often more selected origin range + realization cost",whyRu:"Large live sizing removes marginal BB calls quickly; posted blind is not a reason to defend a fixed range.",whyEn:"Large live sizing removes marginal BB calls quickly; the posted blind is not a reason to defend a fixed range.",changeRu:"Same opener/hand: 2.5bb → 5bb live open.",changeEn:"Same opener/hand: 2.5bb → 5bb live open.",vars:["open_size","price"]},
 {skillId:"PF-06",prefix:"PM-B4-PF06",sourceRefs:["FTGU-E15","FTGU-E16","EXT-GTOW-DEEP-300-2025"],baseRu:"Deep live 3-bet decision: 250–300bb and caller-heavy opener change the called branch.",baseEn:"Deep live 3-bet decision: 250–300bb and a caller-heavy opener change the called branch.",signalRu:"Fold equity + deep called-branch realization + position",signalEn:"Fold equity + deep called-branch realization + position",whyRu:"At depth, OOP realization and reverse-implied exposure grow; 3-bet shape cannot be copied mechanically from 100bb.",whyEn:"At depth, OOP realization and reverse-implied exposure grow; 3-bet shape cannot be copied mechanically from 100bb.",changeRu:"Same hand/opener: 100bb → 300bb, Hero remains OOP.",changeEn:"Same hand/opener: 100bb → 300bb, Hero remains OOP.",vars:["effective_depth","position","called_branch"]},
 {skillId:"PF-07",prefix:"PM-B4-PF07",sourceRefs:["FTGU-E17","SLC-PREFLOP-ADJUSTMENTS"],baseRu:"Live 3-bet is unusually large and stacks are deep; Hero cannot defend by a remembered percentage.",baseEn:"The live 3-bet is unusually large and stacks are deep; Hero cannot defend by a remembered percentage.",signalRu:"3-bet size × depth × position × opponent construction",signalEn:"3-bet size × depth × position × opponent construction",whyRu:"Facing 3-bets is a branch-EV problem; large live sizes and deep future trees jointly move call/4-bet/fold thresholds.",whyEn:"Facing 3-bets is a branch-EV problem; large live sizes and deep future trees jointly move call/4-bet/fold thresholds.",changeRu:"Same hand/positions: standard 3-bet → oversized live 3-bet at 250bb.",changeEn:"Same hand/positions: standard 3-bet → oversized live 3-bet at 250bb.",vars:["threebet_size","effective_depth"]},
 {skillId:"BL-03",prefix:"PM-B4-BL03",sourceRefs:["FTGU-E05","SLC-BB-VS-BTN"],baseRu:"BB vs BTN in a raked live game with 4bb open and poor postflop realization.",baseEn:"BB versus BTN in a raked live game with a 4bb open and poor postflop realization.",signalRu:"Wide origin still matters, but large price/rake/realization can erase fringe calls",signalEn:"Wide origin still matters, but large price/rake/realization can erase fringe calls",whyRu:"BTN width is not a license to defend the same fringe across large sizes and poor-realization environments.",whyEn:"BTN width is not a license to defend the same fringe across large sizes and poor-realization environments.",changeRu:"Same hand/origin: small low-rake node → 4bb high-rake/poor-realization node.",changeEn:"Same hand/origin: small low-rake node → 4bb high-rake/poor-realization node.",vars:["open_size","rake","realisation"]},
 {skillId:"OOP-02",prefix:"PM-B4-OOP02",sourceRefs:["FTGU-E08","SLC-DEEP-SRP-OOP"],baseRu:"OOP SRP at 200bb: medium hand faces pressure with substantial future stack behind.",baseEn:"OOP SRP at 200bb: a medium hand faces pressure with substantial future stack behind.",signalRu:"Current price + hand robustness + deep future leverage/reverse implied odds",signalEn:"Current price + hand robustness + deep future leverage/reverse implied odds",whyRu:"Deep OOP realization makes weak dominated continues more expensive over later streets even at a seemingly attractive flop price.",whyEn:"Deep OOP realization makes weak dominated continues more expensive over later streets even at a seemingly attractive flop price.",changeRu:"Same flop/hand/size: 100bb → 200bb effective OOP.",changeEn:"Same flop/hand/size: 100bb → 200bb effective OOP.",vars:["effective_depth","future_leverage"]},
 {skillId:"3BP-05",prefix:"PM-B4-3BP05",sourceRefs:["SLC-3BET-POTS","EXT-GTOW-3BP-OOP-2023"],baseRu:"Deep 3BP: role/board remain familiar but SPR and future leverage are larger than standard 100bb.",baseEn:"Deep 3BP: role/board remain familiar but SPR and future leverage are larger than standard 100bb.",signalRu:"Role × board × sizing now also interacts with materially higher SPR",signalEn:"Role × board × sizing now also interacts with materially higher SPR",whyRu:"Deep 3BP solutions retain more future branches; low-SPR shortcuts and automatic commitment become less transferable.",whyEn:"Deep 3BP solutions retain more future branches; low-SPR shortcuts and automatic commitment become less transferable.",changeRu:"Same roles/board: 100bb 3BP → 200bb 3BP with higher flop SPR.",changeEn:"Same roles/board: 100bb 3BP → 200bb 3BP with higher flop SPR.",vars:["effective_depth","spr"]},
 {skillId:"TURN-02",prefix:"PM-B4-TURN02",sourceRefs:["FTGU-E21","SLC-TURN-BARREL"],baseRu:"Turn barrel in a deep live pot where opponent can continue and pressure rivers with substantial stacks behind.",baseEn:"Turn barrel in a deep live pot where the opponent can continue and pressure rivers with substantial stacks behind.",signalRu:"Runout/hand leverage + future river SPR, not just current fold equity",signalEn:"Runout/hand leverage + future river SPR, not just current fold equity",whyRu:"Deep future leverage changes which thin value/bluff classes want to inflate the pot and how robustly they realize on rivers.",whyEn:"Deep future leverage changes which thin value/bluff classes want to inflate the pot and how robustly they realize on rivers.",changeRu:"Same turn/hand: shallow remaining stack → deep remaining stack.",changeEn:"Same turn/hand: shallow remaining stack → deep remaining stack.",vars:["future_spr","effective_depth"]},
 {skillId:"RIV-01",prefix:"PM-B4-RIV01",sourceRefs:["LCM-09","CP-G3-L02","EXT-PS-RIVER-2025"],baseRu:"Live river value decision against a player with observed wide small-size calls but tight large-size calls.",baseEn:"Live river value decision against a player observed calling small sizes wide but large sizes tightly.",signalRu:"Worse calling region is size-specific and evidence-qualified",signalEn:"The worse calling region is size-specific and evidence-qualified",whyRu:"Value sizing must target actual worse continues; a generic 'station' label cannot justify every size.",whyEn:"Value sizing must target actual worse continues; a generic 'station' label cannot justify every size.",changeRu:"Same hand/player: small size with wide worse calls → large size where those hands fold.",changeEn:"Same hand/player: small size with wide worse calls → large size where those hands fold.",vars:["river_size","evidence_branch"]},
 {skillId:"RIV-03",prefix:"PM-B4-RIV03",sourceRefs:["FTGU-E22","CINJ-E02","CINJ-E04"],baseRu:"Live bluff-catch against a large river line with an observed underbluff tendency in this exact branch.",baseEn:"Live bluff-catch against a large river line with an observed underbluff tendency in this exact branch.",signalRu:"Price × natural bluff supply × branch-specific evidence",signalEn:"Price × natural bluff supply × branch-specific evidence",whyRu:"Population/player evidence can move the call threshold only inside the observed branch and never replaces bluff-supply reconstruction.",whyEn:"Population/player evidence can move the call threshold only inside the observed branch and never replaces bluff-supply reconstruction.",changeRu:"Same price/hand: evidence changes from unknown → repeated same-branch underbluff.",changeEn:"Same price/hand: evidence changes from unknown → repeated same-branch underbluff.",vars:["evidence_confidence","bluff_supply"]},
];

export const liveEdgeB4Decisions:PracticalDecision[]=variants.flatMap(build);
