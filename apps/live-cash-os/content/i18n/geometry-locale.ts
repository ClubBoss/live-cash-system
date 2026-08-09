import type { LocaleCode } from "../../lib/model";
import { moduleById } from "../modules";
import { applyGeometryLocale as applyBaseLocale } from "./geometry-gold";
import { applyGeometryRuGold } from "./geometry-ru-gold";

function applyGeometryRuRealUseCopy() {
  const target = moduleById.geometry;
  target.plainGoal = "Сначала определи, против какого стека ты реально играешь. Затем оцени, каким станет банк и насколько коротким будет дальнейший розыгрыш после следующего действия.";
  target.scope = "Само по себе это правило не говорит, какие руки нужно открывать, коллировать или 3-бетить. Оно помогает оценить масштаб решения; конкретная линия всё ещё зависит от позиций, сайзингов и условий игры.";
  target.decisionTree.splice(0, target.decisionTree.length,
    "Определи обязательную ставку или страддл, который задаёт рабочую единицу.",
    "Определи эффективный стек отдельно против каждого важного соперника.",
    "Представь новый размер банка и остаток стека после следующего действия.",
    "Оцени будущий SPR.",
    "Только после этого выбирай линию.",
  );
  target.workedExample.steps[1] = "Это также 280 обычных больших блайндов. Сохрани эту цифру как дополнительное описание, но сначала ориентируйся на 140 страддлов.";
}

function applyGeometryEnRealUseCopy() {
  const target = moduleById.geometry;
  target.title = "Effective stack and pot geometry";
  target.plainGoal = "First identify the stack you are actually playing against. Then project the pot and how compressed the remaining decisions become after the next action.";
  target.scope = "This framework does not tell you which hands to open, call or 3-bet by itself. It sets the scale of the decision; the actual line still depends on positions, sizings and game conditions.";
  target.technicalTerm = "Working unit, pairwise effective stack and post-action SPR.";
  target.theory[1] = "A multiway pot has no single effective stack: calculate it separately against each relevant opponent.";
  target.decisionTree.splice(0, target.decisionTree.length,
    "Identify the forced bet or straddle that sets the working unit.",
    "Calculate the effective stack separately against each relevant opponent.",
    "Project the new pot and the stack behind after the next action.",
    "Estimate the future SPR.",
    "Only then choose the line.",
  );
  target.workedExample.steps[1] = "That is also 280 ordinary big blinds. Keep that as a secondary description, but use 140 straddle big blinds first for the current preflop scale.";
  target.workedExample.answer = "Start with 140 straddle big blinds, then use pairwise effective stack and post-action SPR.";
  const pairwiseDrill = target.drills.find((item) => item.id === "geo-02");
  if (!pairwiseDrill) throw new Error("Missing LCM-01 pairwise effective-stack drill");
  pairwiseDrill.question = "How should effective stack be described?";
}

export function applyGeometryLocale(locale: LocaleCode) {
  applyBaseLocale(locale);
  if (locale === "ru") {
    applyGeometryRuGold();
    applyGeometryRuRealUseCopy();
  } else {
    applyGeometryEnRealUseCopy();
  }
}
