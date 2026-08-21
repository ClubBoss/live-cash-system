import type { PracticalDecision } from "./types";

const option = (id: string, textRu: string, textEn: string, misconception?: string) => ({ id, textRu, textEn, misconception });

type Row = {
  id: string;
  kind: PracticalDecision["kind"];
  cueRu: string;
  cueEn: string;
  questionRu: string;
  questionEn: string;
  goodRu: string;
  goodEn: string;
  bad1Ru: string;
  bad1En: string;
  bad2Ru: string;
  bad2En: string;
  whyRu: string;
  whyEn: string;
  changedVariables?: string[];
};

function make(row: Row, index: number): PracticalDecision {
  const slot = index % 3;
  const good = option("good", row.goodRu, row.goodEn);
  const bad1 = option("bad1", row.bad1Ru, row.bad1En, "ORIGIN_RANGE_IGNORED");
  const bad2 = option("bad2", row.bad2Ru, row.bad2En, "ORIGIN_PRIOR_OVERGENERALIZED");
  const goodReason = option("goodR", row.whyRu, row.whyEn);
  const badReason1 = option("badR1", "Position label itself proves the river is overbluffed.", "The position label itself proves the river is overbluffed.", "POSITION_AS_PROOF");
  const badReason2 = option("badR2", "Current price replaces street-by-street range filtering.", "Current price replaces street-by-street range filtering.", "FILTERING_IGNORED");
  return {
    id: row.id,
    skillId: "RIV-03",
    kind: row.kind,
    sourceRefs: ["CINJ-E05", "FTGU-E22"],
    assumptions: ["mechanism-level source scope", "population magnitude remains field-gated", "no exact combo frequency claimed"],
    cueRu: row.cueRu,
    cueEn: row.cueEn,
    questionRu: row.questionRu,
    questionEn: row.questionEn,
    actionOptions: slot === 0 ? [good, bad1, bad2] : slot === 1 ? [bad1, good, bad2] : [bad1, bad2, good],
    reasonOptions: slot === 0 ? [badReason1, goodReason, badReason2] : slot === 1 ? [goodReason, badReason1, badReason2] : [badReason1, badReason2, goodReason],
    correctActionId: "good",
    correctReasonId: "goodR",
    explanationRu: row.whyRu,
    explanationEn: row.whyEn,
    changedVariables: row.changedVariables,
    targetSeconds: 25,
  };
}

const rows: Row[] = [
  {
    id: "PM-RIV-03-C0-201",
    kind: "recognition",
    cueRu: "River bluff-catch. Line началась из очень широкого late-position origin range и до river сохранила много weak offsuit material.",
    cueEn: "River bluff-catch. The line began from a very wide late-position origin range and retained substantial weak offsuit material to the river.",
    questionRu: "Какой prior нужно добавить до оценки blockers?",
    questionEn: "Which prior should be added before evaluating blockers?",
    goodRu: "Origin-range width increases the possible bluff supply, then the line must filter it",
    goodEn: "Origin-range width increases the possible bluff supply, then the line must filter it",
    bad1Ru: "Ignore preflop origin; only the river card matters",
    bad1En: "Ignore the preflop origin; only the river card matters",
    bad2Ru: "Wide origin automatically proves an overbluff",
    bad2En: "A wide origin automatically proves an overbluff",
    whyRu: "CINJ-E05 treats origin width as the starting denominator for later air mass, but explicitly requires board and action filtering before a call decision.",
    whyEn: "CINJ-E05 treats origin width as the starting denominator for later air mass, but explicitly requires board and action filtering before a call decision.",
  },
  {
    id: "PM-RIV-03-C0-202",
    kind: "recognition",
    cueRu: "Сравниваются два origin ranges: один содержит много offsuit broadway/weak offsuit combos, другой — tight early-position core.",
    cueEn: "Two origin ranges are compared: one contains many offsuit broadway/weak offsuit combos, the other is a tight early-position core.",
    questionRu: "Почему первый может производить больше bluff candidates later?",
    questionEn: "Why can the first produce more later bluff candidates?",
    goodRu: "Offsuit classes carry much more combination mass and can leave more weak survivors",
    goodEn: "Offsuit classes carry much more combination mass and can leave more weak survivors",
    bad1Ru: "Late position is inherently more aggressive on every street",
    bad1En: "Late position is inherently more aggressive on every street",
    bad2Ru: "Every offsuit combo necessarily reaches river",
    bad2En: "Every offsuit combo necessarily reaches the river",
    whyRu: "The source mechanism is combination supply at origin, not a personality/position stereotype and not a claim that all origin air survives.",
    whyEn: "The source mechanism is combination supply at origin, not a personality/position stereotype and not a claim that all origin air survives.",
  },
  {
    id: "PM-RIV-03-C0-203",
    kind: "decision",
    cueRu: "Hero faces a river bet with a bluff-catcher. Price is plausible; Villain began BTN-wide and the line still contains several natural missed regions.",
    cueEn: "Hero faces a river bet with a bluff-catcher. The price is plausible; Villain began BTN-wide and the line still contains several natural missed regions.",
    questionRu: "Как строить решение?",
    questionEn: "How should the decision be built?",
    goodRu: "Use price × surviving bluff supply, with the wide origin as a prior rather than proof",
    goodEn: "Use price × surviving bluff supply, with the wide origin as a prior rather than proof",
    bad1Ru: "Call because BTN started wide",
    bad1En: "Call because BTN started wide",
    bad2Ru: "Ignore origin and use pot odds alone",
    bad2En: "Ignore origin and use pot odds alone",
    whyRu: "CINJ-E05 extends FTGU-E22: the price sets the threshold, while origin width and subsequent filtering determine whether enough plausible bluffs can exist.",
    whyEn: "CINJ-E05 extends FTGU-E22: the price sets the threshold, while origin width and subsequent filtering determine whether enough plausible bluffs can exist.",
  },
  {
    id: "PM-RIV-03-C0-204",
    kind: "decision",
    cueRu: "River bluff-catch starts from a tight EP origin and the line has already filtered out most weak holdings.",
    cueEn: "A river bluff-catch starts from a tight EP origin and the line has already filtered out most weak holdings.",
    questionRu: "Что происходит с marginal bluff-catch?",
    questionEn: "What happens to a marginal bluff-catch?",
    goodRu: "It becomes less attractive unless concrete bluff candidates remain",
    goodEn: "It becomes less attractive unless concrete bluff candidates remain",
    bad1Ru: "Call because the hand still beats bluffs in theory",
    bad1En: "Call because the hand still beats bluffs in theory",
    bad2Ru: "Fold every bluff-catcher from an EP-origin line",
    bad2En: "Fold every bluff-catcher from an EP-origin line",
    whyRu: "Tight origin plus heavy filtering can reduce natural bluff supply, but source integrity still requires naming the actual surviving candidates rather than applying a universal fold rule.",
    whyEn: "Tight origin plus heavy filtering can reduce natural bluff supply, but source integrity still requires naming the actual surviving candidates rather than applying a universal fold rule.",
  },
  {
    id: "PM-RIV-03-C0-205",
    kind: "changed",
    cueRu: "Same river hand, board, price and final size. Only preflop origin changes: BTN-wide → tight EP.",
    cueEn: "Same river hand, board, price and final size. Only the preflop origin changes: BTN-wide → tight EP.",
    questionRu: "Можно ли оставить прежнюю bluff-density estimate?",
    questionEn: "Can the previous bluff-density estimate be kept?",
    goodRu: "No — recompute from the narrower starting combination supply and the same later filters",
    goodEn: "No — recompute from the narrower starting combination supply and the same later filters",
    bad1Ru: "Yes — river price is unchanged",
    bad1En: "Yes — the river price is unchanged",
    bad2Ru: "No — but EP automatically means zero bluffs",
    bad2En: "No — but EP automatically means zero bluffs",
    whyRu: "This is the core one-variable transfer from CINJ-E05: origin range is a causal prior for later bluff supply, not a binary position label.",
    whyEn: "This is the core one-variable transfer from CINJ-E05: origin range is a causal prior for later bluff supply, not a binary position label.",
    changedVariables: ["preflop_origin_width"],
  },
  {
    id: "PM-RIV-03-C0-206",
    kind: "changed",
    cueRu: "Same wide BTN origin, but turn and river sizing become strongly filtering and remove most natural air before the final bet.",
    cueEn: "Same wide BTN origin, but turn and river sizing become strongly filtering and remove most natural air before the final bet.",
    questionRu: "Должен ли wide-origin prior доминировать решение?",
    questionEn: "Should the wide-origin prior dominate the decision?",
    goodRu: "No — later filtering can override the starting prior",
    goodEn: "No — later filtering can override the starting prior",
    bad1Ru: "Yes — wide origin permanently means high bluff density",
    bad1En: "Yes — a wide origin permanently means high bluff density",
    bad2Ru: "No — origin width never matters",
    bad2En: "No — origin width never matters",
    whyRu: "CINJ-E05 explicitly frames origin width as a prior. Board texture and street-by-street range filtering can narrow or reverse its practical effect.",
    whyEn: "CINJ-E05 explicitly frames origin width as a prior. Board texture and street-by-street range filtering can narrow or reverse its practical effect.",
    changedVariables: ["later_street_filtering"],
  },
  {
    id: "PM-RIV-03-C0-207",
    kind: "boundary",
    cueRu: "Learner says: «BTN opens wide, therefore this river node is overbluffed and I should call all bluff-catchers».",
    cueEn: "The learner says: 'BTN opens wide, therefore this river node is overbluffed and I should call all bluff-catchers.'",
    questionRu: "Где ошибка?",
    questionEn: "Where is the error?",
    goodRu: "Wide origin is only a prior; actual line filtering and field evidence still govern the river branch",
    goodEn: "A wide origin is only a prior; actual line filtering and field evidence still govern the river branch",
    bad1Ru: "There is no error; position proves the population leak",
    bad1En: "There is no error; position proves the population leak",
    bad2Ru: "The only error is not using an exact solver call frequency",
    bad2En: "The only error is not using an exact solver call frequency",
    whyRu: "The accepted source mechanism is combinatorial origin width. The claimed population magnitude remains field-gated and cannot become a universal live theorem.",
    whyEn: "The accepted source mechanism is combinatorial origin width. The claimed population magnitude remains field-gated and cannot become a universal live theorem.",
  },
  {
    id: "PM-RIV-03-C0-208",
    kind: "boundary",
    cueRu: "Learner sees a tight origin and wants to auto-fold every river bluff-catcher without enumerating any plausible bluffs.",
    cueEn: "The learner sees a tight origin and wants to auto-fold every river bluff-catcher without enumerating any plausible bluffs.",
    questionRu: "Это допустимая compression?",
    questionEn: "Is that an acceptable compression?",
    goodRu: "No — tight origin lowers the prior bluff supply but does not replace line-specific bluff enumeration",
    goodEn: "No — a tight origin lowers the prior bluff supply but does not replace line-specific bluff enumeration",
    bad1Ru: "Yes — tight origin means no bluffs",
    bad1En: "Yes — a tight origin means no bluffs",
    bad2Ru: "Yes — blockers become irrelevant",
    bad2En: "Yes — blockers become irrelevant",
    whyRu: "CINJ-E05 preserves street filtering and FTGU-E22 preserves price/removal analysis; the useful rule is directional, not absolute.",
    whyEn: "CINJ-E05 preserves street filtering and FTGU-E22 preserves price/removal analysis; the useful rule is directional, not absolute.",
  },
];

export const sourceUtilizationC0Decisions: PracticalDecision[] = rows.map(make);
