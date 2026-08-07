import type { LocaleCode } from "../../lib/model";
import { moduleById } from "../modules";
import { applyGeometryLocale as applyBaseLocale } from "./geometry-gold";
import { applyGeometryRuGold } from "./geometry-ru-gold";

function applyGeometryEnTerminology() {
  const target = moduleById.geometry;
  target.title = "Effective stack and pot geometry";
  target.plainGoal = "Understand how much money is actually in play against each opponent and how short the future decision tree will become.";
  target.technicalTerm = "Working unit, pairwise effective stack and post-action SPR.";
  target.theory[1] = "A multiway pot has no single effective stack: calculate it separately against each relevant opponent.";
  target.workedExample.answer = "Start with 140 straddle big blinds, then use pairwise effective stack and post-action SPR.";
  const pairwiseDrill = target.drills.find((item) => item.id === "geo-02");
  if (!pairwiseDrill) throw new Error("Missing LCM-01 pairwise effective-stack drill");
  pairwiseDrill.question = "How should effective stack be described?";
}

export function applyGeometryLocale(locale: LocaleCode) {
  applyBaseLocale(locale);
  if (locale === "ru") applyGeometryRuGold();
  else applyGeometryEnTerminology();
}
