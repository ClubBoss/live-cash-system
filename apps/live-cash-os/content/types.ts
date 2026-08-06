import type { ModuleId, TransferProbe } from "../lib/model";

export type Option = {
  id: string;
  text: string;
  misconceptionId?: string;
};

export type Drill = {
  id: string;
  moduleId: ModuleId;
  nodeKey: string;
  variantGroup: string;
  kind: "core" | "changed" | "boundary" | "mixed";
  targetSeconds: number;
  assumptions: string[];
  cue: string;
  question: string;
  actionOptions: Option[];
  reasonOptions: Option[];
  correctActionId: string;
  correctReasonId: string;
  explanation: string;
  transferProbe: TransferProbe | null;
};

export type Flashcard = {
  id: string;
  moduleId: ModuleId;
  kind: "heuristic" | "boundary" | "procedure";
  front: string;
  back: string;
};

export type WorkedExample = {
  situation: string;
  steps: string[];
  answer: string;
};

export type Lab =
  | {
      type: "spr";
      title: string;
      description: string;
      initialPot: number;
      stack: number;
      bet: number;
    }
  | {
      type: "compare";
      title: string;
      description: string;
      leftTitle: string;
      leftText: string;
      rightTitle: string;
      rightText: string;
    };

export type ModuleContent = {
  id: ModuleId;
  lcm: string;
  title: string;
  shortTitle: string;
  description: string;
  prerequisites: ModuleId[];
  admission: "ADMITTED";
  scope: string;
  plainGoal: string;
  tableCue: string;
  technicalTerm: string;
  theory: string[];
  heuristics: string[];
  decisionTree: string[];
  workedExample: WorkedExample;
  counterexample: string;
  lab: Lab;
  explainBackPrompt: string;
  tableCard: string[];
  glossary: Array<{ term: string; meaning: string }>;
  drills: Drill[];
  flashcards: Flashcard[];
};