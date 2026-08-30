import { moduleById } from "../modules";
import type { LocaleCode } from "../../lib/model";

function setDrill(
  moduleId: keyof typeof moduleById,
  drillId: string,
  copy: Partial<{
    assumptions: string[];
    cue: string;
    question: string;
    actions: [string, string, string];
    reasons: [string, string, string];
    explanation: string;
  }>,
) {
  const drill = moduleById[moduleId].drills.find((item) => item.id === drillId);
  if (!drill) throw new Error(`Missing drill ${drillId}`);
  if (copy.assumptions) drill.assumptions = [...copy.assumptions];
  if (copy.cue) drill.cue = copy.cue;
  if (copy.question) drill.question = copy.question;
  if (copy.actions) drill.actionOptions.forEach((option, index) => { option.text = copy.actions![index]; });
  if (copy.reasons) drill.reasonOptions.forEach((option, index) => { option.text = copy.reasons![index]; });
  if (copy.explanation) drill.explanation = copy.explanation;
}

function setCard(moduleId: keyof typeof moduleById, cardId: string, front: string, back: string) {
  const card = moduleById[moduleId].flashcards.find((item) => item.id === cardId);
  if (!card) throw new Error(`Missing card ${cardId}`);
  card.front = front;
  card.back = back;
}

function applyEnglishFinalLanguage() {
  const preflop = moduleById.preflop;
  preflop.description = "Understand the price and your real options before reaching for a memorised range.";
  preflop.theory[3] = "As stacks deepen, position, suited playability and strong calling ranges usually gain value. Shorter stacks shift more weight toward direct linear 3-betting and earlier stack commitment, but the exact boundary depends on the spot.";
  preflop.tableCard = ["Positions and price", "Starting ranges", "Players behind", "Call quality", "What is the 3-bet doing?"];

  const shape = moduleById.shape;
  Object.assign(shape, {
    title: "How bet size changes your response",
    shortTitle: "Read the range behind the size",
    description: "The same bet size can mean very different things when Villain bets almost everything or only a strong, selective range.",
    plainGoal: "Know when a small wide bet allows wider calls or selected thin raises, and when a large selective bet demands a tighter response.",
    tableCue: "What bets this size? → price → worse hands that continue → equity you can deny → call or raise.",
    technicalTerm: "Wide small betting, polar large betting and strong hands that stay in the calling range.",
    theory: [
      "Start with the value hands and how much they want to put in. Then choose bluffs that make sense with that size.",
      "A bet used rarely does not automatically need to be large. Frequency and size answer different questions.",
      "Against a small bet made with almost the whole range, Villain still has many medium and weak hands. That can support wider calls and some thinner raises.",
      "A strong, stable hand does not have to raise just because it ranks highly. Keeping some strong hands in calls prevents the calling range from becoming too weak.",
    ],
    heuristics: [
      "Ask which value hands want to use this size.",
      "Before a thin raise, name the worse hands that continue or the real equity you make fold.",
      "Do not assume a rare bet is automatically polar.",
    ],
    decisionTree: [
      "Decide whether the bet comes from a wide range or a more selective polar range.",
      "Account for the price and which hands continue against your response.",
      "Separate made hands that are stable from those that are vulnerable to future cards.",
      "Before raising, name the value you gain or the meaningful equity you deny.",
      "Make sure some strong hands still remain in your calls.",
    ],
  });
  setDrill("shape", "sha-03", {
    explanation: "Calling can deliberately keep strong hands in the calling range while leaving Villain room to continue bluffing later.",
  });

  const aggression = moduleById.aggression;
  Object.assign(aggression, {
    description: "How wide the preflop 3-bet range is changes how much postflop pressure that range can support.",
    plainGoal: "Recognise when the 3-bettor can keep betting frequently and when the weaker parts of the range need to check more.",
    tableCue: "3-bet range → board → frequency and size → what changed after the call.",
    theory: [
      "A preflop adjustment carries into postflop. If a player 3-bets much wider than normal, more weak hands reach the flop, so some of that extra width should show up as more checks.",
      "If the wider 3-bettor still bets the flop as often as a stronger normal range, the betting range contains more weak hands. The defender can continue wider.",
      "A normal strong 3-bet range often keeps a clear advantage on dry high-card or paired boards, so a frequent small c-bet can make sense. Coordinated middle-card boards usually require more checking and a more selective betting range.",
      "After a frequent flop bet gets called, the defender has already folded the weakest hands. Rebuild both ranges before deciding whether to barrel the turn.",
      "Before a large OOP raise or shove, identify enough strong value first. At low SPR, a jamming range is built around strong value, the best bluffs, and a few hybrid hands; equity denial alone does not turn the middle of the range into a good shove.",
    ],
    heuristics: [
      "Start with the actual preflop 3-bet range: normal, too tight or too wide.",
      "Ask whether the board still favours the 3-bettor's strongest hands.",
      "After a call, rebuild both ranges before choosing the next bet.",
    ],
    decisionTree: [
      "How wide or tight was the preflop 3-bet range?",
      "Which strong and weak hands actually reached the flop?",
      "Does the board keep the 3-bettor's advantage or give the caller more strong hands?",
      "Do the bet frequency and size fit the range that is actually betting?",
      "After a call, rebuild both ranges. Before a large OOP raise, separately identify strong value and realistic bluffs.",
    ],
    workedExample: {
      situation: "BB 3-bets BTN clearly wider than normal, then uses a small c-bet on a dry flop with almost the whole range.",
      steps: [
        "The wider preflop range brings more weak hands to the flop.",
        "Those extra weak hands should create more checks than a normal stronger range would use.",
        "If BB still c-bets almost everything, BTN can defend wider and then watch whether Villain keeps over-bluffing or gives up later.",
      ],
      answer: "Do not defend as if the range were still a normal strong 3-bet range. First ask whether the wider 3-bettor actually checks more of the extra weak hands.",
    },
    lab: {
      type: "compare" as const,
      title: "Normal versus over-wide 3-bet",
      description: "Compare the same small c-bet after two different preflop 3-bet ranges.",
      leftTitle: "Normal 3-bet range",
      leftText: "More premiums and fewer weak hands: frequent small betting can make sense on the right dry board.",
      rightTitle: "Over-wide 3-bet range",
      rightText: "More weak hands reach the flop. If Villain does not check them more often, the c-bet range becomes easier to defend against.",
    },
    glossary: [
      { term: "Postflop adjustment", meaning: "Changing check and bet frequencies because the preflop 3-bet range is wider or tighter than normal." },
      { term: "Selective bet", meaning: "Betting only a chosen part of the range rather than betting almost every hand." },
      { term: "Strong value", meaning: "Hands strong enough to support a large aggressive action and get called by worse often enough." },
    ],
  });
  setDrill("aggression", "agg-01", {
    cue: "Villain added many weak hands preflop but still c-bets almost everything on the flop.",
    actions: ["Defend wider than against the normal stronger 3-bet range", "Defend tighter because any 3-bettor is strong", "Ignore preflop width and look only at bet size"],
  });
  setDrill("aggression", "agg-04", {
    cue: "The flop was bet very frequently, but the caller's weakest hands have already folded.",
    question: "Can the same very high betting frequency be copied automatically to the turn?",
    actions: ["No; rebuild both ranges and choose turn bets more selectively", "Yes; a very frequent flop c-bet means a very frequent turn bet", "Yes; a call always means weakness"],
    explanation: "The flop call changes the ranges that reach the turn. A frequent first bet is not an automatic licence for a second barrel.",
  });
  setDrill("aggression", "agg-05", {
    question: "What matters most before building a large OOP raise or shove?",
    explanation: "Start with enough strong value. Equity denial can improve a good raise candidate, but it does not by itself justify shoving a medium-strength hand.",
  });
  setCard("aggression", "agg-card-value", "First question after Villain 3-bets too wide?", "Did Villain start checking more of the extra weak hands postflop?");
  setCard("aggression", "agg-card-scary", "What changes after a frequent flop c-bet gets called?", "The caller has already folded the weakest hands, so rebuild the turn ranges instead of copying the flop plan.");

  const ancestry = moduleById.ancestry;
  Object.assign(ancestry, {
    title: "Trace the range through the hand",
    shortTitle: "Hands cannot appear from nowhere",
    description: "The preflop range and every earlier action limit which value hands and bluffs can still be present now.",
    plainGoal: "Stop counting folds or bluffs that were barely present preflop or could not realistically survive the earlier action.",
    tableCue: "Starting range → earlier actions → value left → natural bluffs left → blocker or read.",
    technicalTerm: "Where the range started, which hands survived the line, and what Hero actually blocks.",
    theory: [
      "Preflop composition still matters postflop. If a 3-bet range contains very few natural suited bluffs, later streets also start with fewer natural bluff candidates.",
      "A wider starting range brings more weak hands to the flop. Those extra hands usually need to show up as more checks or different betting frequencies later.",
      "A blocker can improve or worsen an action only among hands that can realistically be present. It cannot create folds or bluffs that the line never contained.",
      "Keep reads tied to the exact action. One opponent can c-bet too wide and fold too much to a raise while still continuing very strongly after re-raising.",
    ],
    heuristics: [
      "Trace the hands through the line before using a blocker.",
      "Apply a read only to the action where you actually observed it.",
      "If you cannot name better hands that fold, a blocker alone does not create a bluff.",
    ],
    decisionTree: [
      "Start with the realistic preflop range.",
      "Remove hands that would usually have chosen a different earlier action.",
      "Separate the strong value that survived from the natural weak hands that survived.",
      "Account for the board and sizing choices that narrow those groups further.",
      "Only then use blockers and opponent reads.",
    ],
    workedExample: {
      situation: "Early position opens and a very tight SB 3-bets with almost no bluffs. Hero considers a suited-ace 4-bet bluff.",
      steps: [
        "SB's starting 3-bet range is already concentrated around strong hands.",
        "Very few better hands both exist and fold often enough to the 4-bet.",
        "The ace blocker reduces some combinations but does not create enough folds on its own.",
      ],
      answer: "Without realistic better hands that fold, the familiar blocker bluff loses its reason.",
    },
    counterexample: "Against a wide BB 3-bet with proven folds to 4-bets, a similar suited ace can become a bluff candidate again because the opponent's starting range and response are different.",
    lab: {
      type: "compare" as const,
      title: "Same blocker, different starting range",
      description: "Compare a blocker against a wide 3-bet range that can fold and against a tight value-heavy 3-bet range.",
      leftTitle: "Wide 3-bet range",
      leftText: "Natural bluffs and real better hands that can fold are present.",
      rightTitle: "Tight 3-bet range",
      rightText: "Most hands are strong enough to continue; the blocker changes combinations but creates few folds.",
    },
    explainBackPrompt: "Explain why the same blocker can be useful against a wide 3-bet range and almost useless against a tight value-heavy one.",
    tableCard: ["Starting range", "Earlier actions", "Value left", "Natural bluffs left", "Blocker / read"],
    glossary: [
      { term: "Starting range", meaning: "The realistic hands an opponent can have before the later actions narrow them." },
      { term: "Natural bluffs", meaning: "Weak hands that can realistically survive the earlier action and choose aggression now." },
    ],
  });
  setDrill("ancestry", "anc-01", {
    cue: "A wide 3-bet range contains hands that can genuinely fold to the next raise.",
    question: "What must be true before using the suited ace as a 4-bet bluff?",
    actions: ["Enough strong value plus real better hands that can fold", "Only that Hero blocks an ace", "Only that Hero's hand is suited"],
    reasons: ["The blocker helps only when the raise can actually make enough better hands fold", "Any ace blocker makes a 4-bet profitable", "A suited hand should never call"],
    explanation: "The bluff works because this opponent can arrive with weaker 3-bets and fold enough of them—not because the combo name is magic.",
  });
  setDrill("ancestry", "anc-02", {
    cue: "Now the opponent's 3-bet range is almost entirely strong hands.",
    question: "Why does the same blocker bluff lose value?",
    actions: ["Almost no better hands actually fold", "Hero's low side card is too weak", "The pot feels too large"],
    reasons: ["Blocking a few combinations does not create fold equity when almost the whole range continues", "A weak hand can never bluff", "Large pots always require value"],
    explanation: "The opponent started with a much stronger range, so the blocker no longer has enough real fold targets.",
  });
  setDrill("ancestry", "anc-03", {
    cue: "Hero is deep, in position and has a hand that can profitably call the 3-bet.",
    question: "What should be checked before turning that hand into a 4-bet bluff?",
    actions: ["Whether 4-betting destroys a more valuable call", "Every suited connector should 4-bet", "Calling a 3-bet is impossible"],
    reasons: ["Position and depth can make calling valuable while weak blockers add little against premium continues", "Initiative always matters more than realisation", "All speculative hands lose after calling 3-bets"],
    explanation: "Compare the 4-bet with the real value of calling instead of adding aggression automatically.",
  });
  setDrill("ancestry", "anc-04", {
    cue: "The same player behaves differently after betting and after re-raising.",
    question: "How should the read be stored?",
    actions: ["Keep the bet/fold read separate from the bet/re-raise read", "Use one global 'weak player' label", "Discard the first read because the re-raise is strong"],
    reasons: ["A weak folding tendency and a strong re-raising range can exist at the same time", "Player type determines every action the same way", "One strong action disproves every other observation"],
    explanation: "Attach the read to the exact action where it was observed instead of turning it into a global label.",
  });
  setDrill("ancestry", "anc-05", {
    cue: "An attractive blocker faces a very strong line that has already removed most weak hands.",
    question: "What must be counted before the blocker?",
    actions: ["Realistic value and natural bluffs that survived the whole line", "Only that Hero blocks the nut flush", "Bet size by itself"],
    reasons: ["A blocker cannot bring back weak hands that never entered the line or folded earlier", "A nut blocker is automatically the best bluff-catcher", "A huge bet can never be a bluff"],
    explanation: "If you cannot justify enough natural bluffs, an honest fold or 'not enough information' can be better than forcing a blocker call.",
  });
  setCard("ancestry", "anc-card-before", "What comes before blocker analysis?", "The starting range and the hands that realistically survived every earlier action.");
  setCard("ancestry", "anc-card-target", "When is a blocker bluff especially weak?", "When almost no better hands in the opponent's actual range will fold.");
  setCard("ancestry", "anc-card-model", "How should an opponent read be stored?", "By the exact position, action, size and follow-up where it was observed.");

  const river = moduleById.river;
  river.shortTitle = "Count the bluffs first";
  river.description = "River decisions start by tracing the line and counting realistic value and bluffs, not by admiring one blocker.";
  river.tableCue = "Starting range → earlier action → value → bluffs → size → blocker → read.";

  const evidence = moduleById.evidence;
  evidence.description = "A useful read is tied to a specific action, carries honest confidence, and can be weakened by new observations.";
  evidence.tableCue = "What happened → where → how often → what changes → what would weaken the read.";

  moduleById.transfer.title = "From understanding to real-table use";
}

export function applyWave4RFinalLanguage(locale: LocaleCode) {
  if (locale === "en") applyEnglishFinalLanguage();
}
