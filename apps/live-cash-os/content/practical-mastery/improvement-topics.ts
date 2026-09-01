import type { PracticalWaveId } from "./types";

export type PracticalImprovementTopic = {
  key:
    | "foundations"
    | "preflop"
    | "blinds"
    | "board_hand_recognition"
    | "single_raised_pots"
    | "reraised_pots"
    | "turn_river"
    | "multiway_limp"
    | "deep_straddle"
    | "live_exploits";
  waves: readonly PracticalWaveId[];
  titleRu: string;
  titleEn: string;
};

export type PracticalImprovementTopicKey = PracticalImprovementTopic["key"];

export const practicalImprovementTopics: readonly PracticalImprovementTopic[] = [
  { key: "foundations", waves: ["W1_FOUNDATION"], titleRu: "База решений", titleEn: "Decision foundations" },
  { key: "preflop", waves: ["W2_PREFLOP"], titleRu: "Префлоп", titleEn: "Preflop" },
  { key: "blinds", waves: ["W3_BLINDS"], titleRu: "Блайнды", titleEn: "Blinds" },
  { key: "board_hand_recognition", waves: ["W4_RECOGNITION"], titleRu: "Распознавание досок и рук", titleEn: "Board and hand recognition" },
  { key: "single_raised_pots", waves: ["W5_SRP_OOP", "W6_SRP_IP"], titleRu: "Обычные банки после флопа", titleEn: "Single-raised pots" },
  { key: "reraised_pots", waves: ["W7_3BET", "W8_4BET_LOW_SPR"], titleRu: "3-бет и 4-бет банки", titleEn: "3-bet and 4-bet pots" },
  { key: "turn_river", waves: ["W9_TURN", "W10_RIVER"], titleRu: "Тёрн и ривер", titleEn: "Turn and river" },
  { key: "multiway_limp", waves: ["W11_MULTIWAY_LIMP"], titleRu: "Мультивей и лимпы", titleEn: "Multiway and limped pots" },
  { key: "deep_straddle", waves: ["W12_DEEP_STRADDLE"], titleRu: "Глубокие стеки и страддлы", titleEn: "Deep stacks and straddles" },
  { key: "live_exploits", waves: ["W13_EXPLOIT_LIVE"], titleRu: "Эксплойт и live-наблюдения", titleEn: "Exploit and live reads" },
] as const;

export const practicalImprovementTopicByKey = new Map<PracticalImprovementTopicKey, PracticalImprovementTopic>(
  practicalImprovementTopics.map((topic) => [topic.key, topic]),
);

export function isPracticalImprovementTopicKey(value: string): value is PracticalImprovementTopicKey {
  return practicalImprovementTopicByKey.has(value as PracticalImprovementTopicKey);
}
