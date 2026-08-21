import type { PracticalDecision } from "./types";

const option = (id: string, textRu: string, textEn: string, misconception?: string) => ({ id, textRu, textEn, misconception });

export const executableGateRepairDecisions: PracticalDecision[] = [
  {
    id: "PM-BL-05-108",
    skillId: "BL-05",
    kind: "changed",
    sourceRefs: ["FTGU-E06", "FTGU-E15"],
    assumptions: ["same SB marginal 3-bet candidate", "same effective stack", "opener origin changes BTN to EP"],
    cueRu: "Та же пограничная SB hand: opener меняется с широкого BTN range на более концентрированный EP range.",
    cueEn: "Same marginal SB hand: the opener changes from a wide BTN range to a more concentrated EP range.",
    questionRu: "Как должен измениться marginal 3-bet bluff branch?",
    questionEn: "How should the marginal 3-bet bluff branch change?",
    actionOptions: [
      option("a", "Стать более избирательным / чаще уйти из bluff branch", "Become more selective / leave the bluff branch more often"),
      option("b", "Автоматически расшириться", "Automatically widen", "ORIGIN_RANGE_BACKWARDS"),
      option("c", "Не меняться, потому что Hero всё ещё SB", "Stay unchanged because Hero is still in the SB", "SEAT_LABEL_ONLY"),
    ],
    reasonOptions: [
      option("r1", "Более сильный origin range обычно снижает fold equity и усиливает called branch", "A stronger origin range usually reduces fold equity and strengthens the called branch"),
      option("r2", "Ранняя позиция автоматически фолдит чаще", "Early position automatically folds more", "FOLD_EQUITY_BACKWARDS"),
      option("r3", "Called branch не зависит от opener range", "The called branch does not depend on the opener range", "CALLED_BRANCH_IGNORED"),
    ],
    correctActionId: "a",
    correctReasonId: "r1",
    targetSeconds: 22,
    explanationRu: "FTGU-E06/E15 связывают SB aggression с fold equity и качеством ветки после call; смена origin range — независимый causal transfer, а не повтор players-behind cue.",
    explanationEn: "FTGU-E06/E15 tie SB aggression to fold equity and called-branch quality; changing the opener's origin range is an independent causal transfer rather than a repeat of the player-behind cue.",
    changedVariables: ["opener_position", "origin_range_strength", "fold_equity", "called_branch"],
  },
];
