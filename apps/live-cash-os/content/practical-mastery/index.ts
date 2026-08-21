import { foundationAnchors } from "./anchors-w1";
import { preflopAndBlindAnchors } from "./anchors-w2-w3";
import { recognitionAndSrpAnchors } from "./anchors-w4-w6";
import { advancedPracticalAnchors } from "./anchors-w7-w13";
import { foundationPreflopBlindDecisions } from "./decisions-w1-w3";
import { postflopAndLiveDecisions } from "./decisions-w4-w13";
import { integratedMasteryDecisions } from "./decisions-w14";
import { sourceSupportedGapFillDecisions } from "./decisions-gap-fill";
import { foundationExpansionDecisions } from "./decisions-foundation-expansion";
import { preflopCoreExpansionDecisions } from "./decisions-preflop-core-expansion";
import { preflopAdvancedExpansionDecisions } from "./decisions-preflop-advanced-expansion";
import { preflopLiveExpansionDecisions } from "./decisions-preflop-live-expansion";
import { blindDefenceExpansionDecisions } from "./decisions-blind-defence-expansion";
import { recognitionExpansionDecisions } from "./decisions-recognition-expansion";
import { srpA6ExpansionDecisions } from "./decisions-srp-a6-expansion";
import { threeBetFourBetA7ExpansionDecisions } from "./decisions-3bp-4bp-a7-expansion";
import { practicalSkillFamilies } from "./registry";

export * from "./types";
export * from "./source-authority";
export * from "./learning-route";
export * from "./mental-model";
export * from "./memory-practice";
export * from "./preflop-a3-memory";
export * from "./blind-a4-memory";
export * from "./recognition-a5-memory";
export * from "./srp-a6-memory";
export { practicalSkillFamilies } from "./registry";

export const practicalAnchors = [
  ...foundationAnchors,
  ...preflopAndBlindAnchors,
  ...recognitionAndSrpAnchors,
  ...advancedPracticalAnchors,
];

export const practicalDecisions = [
  ...foundationPreflopBlindDecisions,
  ...postflopAndLiveDecisions,
  ...sourceSupportedGapFillDecisions,
  ...foundationExpansionDecisions,
  ...preflopCoreExpansionDecisions,
  ...preflopAdvancedExpansionDecisions,
  ...preflopLiveExpansionDecisions,
  ...blindDefenceExpansionDecisions,
  ...recognitionExpansionDecisions,
  ...srpA6ExpansionDecisions,
  ...threeBetFourBetA7ExpansionDecisions,
  ...integratedMasteryDecisions,
];

export const practicalAnchorById = new Map(practicalAnchors.map((anchor) => [anchor.id, anchor]));
export const practicalDecisionById = new Map(practicalDecisions.map((decision) => [decision.id, decision]));
export const practicalSkillById = new Map(practicalSkillFamilies.map((skill) => [skill.id, skill]));
