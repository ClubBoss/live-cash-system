import { moduleById } from "../modules";
import type { Drill, ModuleContent } from "../types";
import type { LocaleCode } from "../../lib/model";

const RU_GEOMETRY = structuredClone(moduleById.geometry);
const EN_GEOMETRY = structuredClone(RU_GEOMETRY);

Object.assign(EN_GEOMETRY, {
  title: "Effective depth and pot geometry",
  shortTitle: "Depth and SPR",
  description: "Define the real scale of the decision before choosing a line.",
  scope: "A directional live-cash framework; no exact ranges or frequencies are required here.",
  plainGoal: "Understand how much money is actually in play against each opponent and how short the future decision tree will become.",
  tableCue: "Working unit → effective stack → pot after the action.",
  technicalTerm: "Working denominator, pairwise effective stack and post-action SPR.",
  theory: [
    "Starting depth in big blinds is useful, but it does not always describe the current problem. A mandatory straddle changes the working preflop unit.",
    "A multiway pot has no single effective depth: calculate it separately against each relevant stack.",
    "After a large call or raise, the ratio of the remaining stack to the new pot — post-action SPR — becomes more important.",
  ],
  heuristics: [
    "Which forced bet sets the current price?",
    "Which stack is Hero actually playing against?",
    "How much will remain, and how large will the pot be after the action?",
  ],
  decisionTree: [
    "Is there a mandatory straddle or another forced bet? Choose the working unit.",
    "Identify the relevant opponents and the effective stack against each one.",
    "Project the pot and remaining stack after the next action.",
    "Calculate future SPR before choosing the line.",
  ],
  workedExample: {
    situation: "$2/$5/$10 with a mandatory straddle. Hero and Villain each have $1,400.",
    steps: [
      "The working unit is $10, so the first depth description is 140 straddle big blinds.",
      "That is also 280 ordinary big blinds, but the larger number should not drive the decision first.",
      "After a specific raise or call, recalculate the pot and the stack behind.",
    ],
    answer: "Start with 140 straddle big blinds, then use pairwise effective depth and post-action SPR.",
  },
  counterexample: "A 400bb starting stack can become a short postflop decision after a huge preflop pot. A 100bb stack can still leave several meaningful decisions in a small single-raised pot.",
  explainBackPrompt: "Explain in your own words why ordinary big blinds, effective stack and SPR answer different questions.",
  tableCard: [
    "Current working unit",
    "Effective stack against each opponent",
    "Pot and stack after the action",
    "Future SPR",
  ],
});

if (EN_GEOMETRY.lab.type === "spr") {
  EN_GEOMETRY.lab.title = "SPR after calling";
  EN_GEOMETRY.lab.description = "Enter the pot before the bet, the stack behind and the bet size. The lab will calculate SPR after the call.";
}

Object.assign(EN_GEOMETRY.glossary[0], {
  term: "Effective stack",
  meaning: "The smaller of Hero's stack and the specific opponent's stack.",
});
Object.assign(EN_GEOMETRY.glossary[1], {
  term: "SPR",
  meaning: "The ratio of the remaining stack to the pot.",
});
Object.assign(EN_GEOMETRY.glossary[2], {
  term: "Working unit",
  meaning: "The forced bet that sets the current price of the preflop decision tree.",
});

type DrillCopy = {
  assumptions: string[];
  cue: string;
  question: string;
  actions: [string, string, string];
  reasons: [string, string, string];
  explanation: string;
};

function setDrillCopy(id: string, copy: DrillCopy) {
  const drill = EN_GEOMETRY.drills.find((item) => item.id === id);
  if (!drill) throw new Error(`Missing LCM-01 drill: ${id}`);
  drill.assumptions = copy.assumptions;
  drill.cue = copy.cue;
  drill.question = copy.question;
  drill.actionOptions.forEach((option, index) => { option.text = copy.actions[index]; });
  drill.reasonOptions.forEach((option, index) => { option.text = copy.reasons[index]; });
  drill.explanation = copy.explanation;
}

setDrillCopy("geo-01", {
  assumptions: ["mandatory $10 straddle", "one relevant opponent with the same stack"],
  cue: "$2/$5/$10 with a mandatory straddle. Both stacks are $1,400.",
  question: "Which unit should describe the depth first?",
  actions: [
    "140 straddle big blinds; also note 280 ordinary BB",
    "280 ordinary BB as the only useful depth",
    "Depth is irrelevant because the stacks are equal",
  ],
  reasons: [
    "$10 sets the current price of the preflop decision tree",
    "The larger BB number is always more accurate",
    "The straddle affects only the size of the first raise",
  ],
  explanation: "The forced bet changes the working unit. Ordinary big blinds remain useful as a secondary description, not as the only depth measure.",
});

setDrillCopy("geo-02", {
  assumptions: ["$1/$3", "Hero 900, Villain A 270, Villain B 1,200"],
  cue: "Hero has $900, Villain A has $270, and Villain B has $1,200.",
  question: "How should effective depth be described?",
  actions: ["$270 against A and $900 against B", "One shared depth of $270 for the whole pot", "An average depth of $790"],
  reasons: [
    "Effective stack is calculated separately for each relevant pair of players",
    "The shortest stack always defines the entire multiway pot",
    "The average stack describes risk more accurately",
  ],
  explanation: "Different confrontations have different amounts available, so one shared number is not enough.",
});

setDrillCopy("geo-03", {
  assumptions: ["pot 42", "stack 158", "bet 14", "heads-up call"],
  cue: "The pot is 42. The stack is 158. Villain bets 14 and Hero is considering a call.",
  question: "What should be calculated before planning later streets?",
  actions: ["SPR after calling: (158−14)/(42+28) ≈ 2.06", "Only the pot odds of the current call", "The starting depth before the flop"],
  reasons: [
    "The new pot and remaining stack determine the length of the future decision tree",
    "Calling automatically removes all difficult turns",
    "SPR measures only current equity",
  ],
  explanation: "Pot odds price the current call. Future SPR describes the structure of the decisions that follow.",
});

setDrillCopy("geo-04", {
  assumptions: ["100bb starting depth", "small single-raised pot"],
  cue: "The hand started 100bb deep, but the preflop pot stayed small.",
  question: "Can the postflop spot automatically be called shallow?",
  actions: [
    "No; first assess the pot, stack behind and future SPR",
    "Yes; 100bb always creates a short decision tree",
    "Yes, whenever Hero is out of position",
  ],
  reasons: [
    "Starting depth does not define post-action geometry without the pot size",
    "Position completely replaces the need to use SPR",
    "100bb is a universal constant for every pot",
  ],
  explanation: "The same starting depth creates very different decision trees after different preflop action.",
});

setDrillCopy("geo-05", {
  assumptions: ["400bb starting depth", "very large preflop pot"],
  cue: "The hand started 400bb deep, but the preflop pot is already huge.",
  question: "Which conclusion is safer?",
  actions: [
    "A deep starting stack can become a low-SPR postflop spot",
    "400bb always requires a long four-street strategy",
    "The pot size can be ignored until the turn",
  ],
  reasons: [
    "The future decision tree depends on the remaining stack relative to the pot already built",
    "Depth is determined only by the absolute stack size",
    "A larger pot automatically creates more room to manoeuvre",
  ],
  explanation: "A deep starting stack does not guarantee deep postflop geometry.",
});

const cardCopy: Record<string, [string, string]> = {
  "geo-card-unit": ["What is the first check when a live straddle is mandatory?", "Which forced bet sets the current working unit?"],
  "geo-card-pair": ["How should effective stack be calculated multiway?", "Separately against each relevant opponent."],
  "geo-card-spr": ["Why can starting big blinds be misleading?", "After the action, the remaining stack relative to the new pot determines the length of the decision tree."],
};
for (const card of EN_GEOMETRY.flashcards) {
  const copy = cardCopy[card.id];
  if (copy) [card.front, card.back] = copy;
}

function replaceStrings(target: string[], source: string[]) {
  target.splice(0, target.length, ...source);
}

function applyDrill(target: Drill, source: Drill) {
  target.cue = source.cue;
  target.question = source.question;
  target.explanation = source.explanation;
  replaceStrings(target.assumptions, source.assumptions);
  for (const option of target.actionOptions) {
    const translated = source.actionOptions.find((item) => item.id === option.id);
    if (translated) option.text = translated.text;
  }
  for (const option of target.reasonOptions) {
    const translated = source.reasonOptions.find((item) => item.id === option.id);
    if (translated) option.text = translated.text;
  }
}

function applyGeometryCopy(source: ModuleContent) {
  const target = moduleById.geometry;
  Object.assign(target, {
    title: source.title,
    shortTitle: source.shortTitle,
    description: source.description,
    scope: source.scope,
    plainGoal: source.plainGoal,
    tableCue: source.tableCue,
    technicalTerm: source.technicalTerm,
    counterexample: source.counterexample,
    explainBackPrompt: source.explainBackPrompt,
  });
  replaceStrings(target.theory, source.theory);
  replaceStrings(target.heuristics, source.heuristics);
  replaceStrings(target.decisionTree, source.decisionTree);
  replaceStrings(target.workedExample.steps, source.workedExample.steps);
  target.workedExample.situation = source.workedExample.situation;
  target.workedExample.answer = source.workedExample.answer;
  target.lab.title = source.lab.title;
  target.lab.description = source.lab.description;
  replaceStrings(target.tableCard, source.tableCard);
  target.glossary.forEach((item, index) => Object.assign(item, source.glossary[index]));
  target.drills.forEach((drill) => {
    const translated = source.drills.find((item) => item.id === drill.id);
    if (translated) applyDrill(drill, translated);
  });
  target.flashcards.forEach((card) => {
    const translated = source.flashcards.find((item) => item.id === card.id);
    if (translated) Object.assign(card, { front: translated.front, back: translated.back });
  });
}

export function applyGeometryLocale(locale: LocaleCode) {
  applyGeometryCopy(locale === "en" ? EN_GEOMETRY : RU_GEOMETRY);
}
