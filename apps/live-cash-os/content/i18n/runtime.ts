import { modules as sourceModules } from "../modules";
import type { Drill, Flashcard, ModuleContent } from "../types";
import type { ModuleId } from "../../lib/model";
import ruMemoryJson from "./ru.json";
import enMemoryJson from "./en.json";
import type { Locale } from "./ui";

export type TranslationStatus = "REVIEWED" | "DRAFT";
export type TranslationEntry = { source: string; text: string; status: TranslationStatus };
export type TranslationMemory = Record<string, TranslationEntry>;

const memories: Record<Locale, TranslationMemory> = {
  ru: ruMemoryJson as TranslationMemory,
  en: enMemoryJson as TranslationMemory,
};

function translated(locale: Locale, key: string, source: string): string {
  const entry = memories[locale][key];
  if (!entry || entry.source !== source || !entry.text.trim()) return source;
  return entry.text;
}

function localizeDrill(locale: Locale, drill: Drill): Drill {
  const root = `drill.${drill.id}`;
  return {
    ...drill,
    assumptions: drill.assumptions.map((value, index) => translated(locale, `${root}.assumptions.${index}`, value)),
    cue: translated(locale, `${root}.cue`, drill.cue),
    question: translated(locale, `${root}.question`, drill.question),
    actionOptions: drill.actionOptions.map((item) => ({ ...item, text: translated(locale, `${root}.option.${item.id}`, item.text) })),
    reasonOptions: drill.reasonOptions.map((item) => ({ ...item, text: translated(locale, `${root}.option.${item.id}`, item.text) })),
    explanation: translated(locale, `${root}.explanation`, drill.explanation),
  };
}

function localizeCard(locale: Locale, card: Flashcard): Flashcard {
  return {
    ...card,
    front: translated(locale, `card.${card.id}.front`, card.front),
    back: translated(locale, `card.${card.id}.back`, card.back),
  };
}

function localizeModule(locale: Locale, module: ModuleContent): ModuleContent {
  const root = `module.${module.id}`;
  const lab = module.lab.type === "spr"
    ? {
        ...module.lab,
        title: translated(locale, `${root}.lab.title`, module.lab.title),
        description: translated(locale, `${root}.lab.description`, module.lab.description),
      }
    : {
        ...module.lab,
        title: translated(locale, `${root}.lab.title`, module.lab.title),
        description: translated(locale, `${root}.lab.description`, module.lab.description),
        leftTitle: translated(locale, `${root}.lab.leftTitle`, module.lab.leftTitle),
        leftText: translated(locale, `${root}.lab.leftText`, module.lab.leftText),
        rightTitle: translated(locale, `${root}.lab.rightTitle`, module.lab.rightTitle),
        rightText: translated(locale, `${root}.lab.rightText`, module.lab.rightText),
      };
  return {
    ...module,
    title: translated(locale, `${root}.title`, module.title),
    shortTitle: translated(locale, `${root}.shortTitle`, module.shortTitle),
    description: translated(locale, `${root}.description`, module.description),
    scope: translated(locale, `${root}.scope`, module.scope),
    plainGoal: translated(locale, `${root}.plainGoal`, module.plainGoal),
    tableCue: translated(locale, `${root}.tableCue`, module.tableCue),
    technicalTerm: translated(locale, `${root}.technicalTerm`, module.technicalTerm),
    theory: module.theory.map((value, index) => translated(locale, `${root}.theory.${index}`, value)),
    heuristics: module.heuristics.map((value, index) => translated(locale, `${root}.heuristics.${index}`, value)),
    decisionTree: module.decisionTree.map((value, index) => translated(locale, `${root}.decisionTree.${index}`, value)),
    workedExample: {
      situation: translated(locale, `${root}.worked.situation`, module.workedExample.situation),
      steps: module.workedExample.steps.map((value, index) => translated(locale, `${root}.worked.steps.${index}`, value)),
      answer: translated(locale, `${root}.worked.answer`, module.workedExample.answer),
    },
    counterexample: translated(locale, `${root}.counterexample`, module.counterexample),
    lab,
    explainBackPrompt: translated(locale, `${root}.explainBackPrompt`, module.explainBackPrompt),
    tableCard: module.tableCard.map((value, index) => translated(locale, `${root}.tableCard.${index}`, value)),
    glossary: module.glossary.map((item, index) => ({
      term: translated(locale, `${root}.glossary.${index}.term`, item.term),
      meaning: translated(locale, `${root}.glossary.${index}.meaning`, item.meaning),
    })),
    drills: module.drills.map((drill) => localizeDrill(locale, drill)),
    flashcards: module.flashcards.map((card) => localizeCard(locale, card)),
  };
}

export type LocalizedContent = {
  modules: ModuleContent[];
  moduleById: Record<ModuleId, ModuleContent>;
  allDrills: Drill[];
  drillById: Record<string, Drill>;
  allCards: Flashcard[];
};

const cache = new Map<Locale, LocalizedContent>();

export function getLocalizedContent(locale: Locale): LocalizedContent {
  const cached = cache.get(locale);
  if (cached) return cached;
  const modules = sourceModules.map((module) => localizeModule(locale, module));
  const allDrills = modules.flatMap((module) => module.drills);
  const allCards = modules.flatMap((module) => module.flashcards);
  const value: LocalizedContent = {
    modules,
    moduleById: Object.fromEntries(modules.map((module) => [module.id, module])) as Record<ModuleId, ModuleContent>,
    allDrills,
    drillById: Object.fromEntries(allDrills.map((drill) => [drill.id, drill])) as Record<string, Drill>,
    allCards,
  };
  cache.set(locale, value);
  return value;
}

export function getTranslationMemory(locale: Locale): TranslationMemory { return memories[locale]; }
